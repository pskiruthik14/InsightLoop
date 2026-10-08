"""
CSV Ingestion & Smart Column Mapping Engine
Parses arbitrary CSV exports from POS systems, Google reviews, or custom spreadsheets.
Intelligently resolves synonyms, validates records, deduplicates, and runs the AI pipeline.
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import Optional, List, Dict, Any
import csv
import io
import uuid
from datetime import datetime
import json

from backend.database import get_db_connection, compute_content_hash
from backend.routes.auth import get_current_user_context
from backend.services.ai.llm_providers import ai_service

router = APIRouter(prefix="/api/import", tags=["CSV Ingestion"])

COLUMN_SYNONYMS = {
    "message": ["message", "text", "review", "review_text", "comment", "feedback", "body", "content", "comments", "customer_review"],
    "customer_name": ["customer_name", "name", "customer", "reviewer", "author", "user", "client"],
    "rating": ["rating", "stars", "score", "rate", "star_rating"],
    "date": ["date", "timestamp", "time", "created_at", "review_date", "datetime"],
    "source": ["source", "platform", "channel", "origin", "type"],
    "product": ["product", "product_name", "item", "dish", "service", "menu_item"],
    "location": ["location", "branch", "city", "store", "store_location", "outlet"]
}


def map_columns(header_row: List[str]) -> Dict[str, Optional[int]]:
    mapping = {k: None for k in COLUMN_SYNONYMS}
    clean_headers = [h.strip().lower().replace(" ", "_") for h in header_row]

    for target_field, synonyms in COLUMN_SYNONYMS.items():
        for syn in synonyms:
            if syn in clean_headers:
                mapping[target_field] = clean_headers.index(syn)
                break

    return mapping


@router.post("/preview")
async def preview_csv(file: UploadFile = File(...)):
    """Previews an uploaded CSV file, detects columns, and validates initial sample rows."""
    content = await file.read()
    try:
        text_stream = io.StringIO(content.decode("utf-8-sig"))
    except Exception:
        text_stream = io.StringIO(content.decode("latin-1"))

    reader = csv.reader(text_stream)
    header = next(reader, None)
    if not header:
        raise HTTPException(status_code=400, detail="CSV file is empty or missing headers.")

    column_mapping = map_columns(header)
    rows_detected = 0
    valid_rows = 0
    sample_preview = []

    for row in reader:
        if not any(row):
            continue
        rows_detected += 1
        msg_idx = column_mapping.get("message")
        msg_text = row[msg_idx].strip() if msg_idx is not None and msg_idx < len(row) else ""
        if msg_text:
            valid_rows += 1
            if len(sample_preview) < 5:
                sample_preview.append({
                    "raw_row": row,
                    "extracted_message": msg_text[:80] + ("..." if len(msg_text) > 80 else "")
                })

    return {
        "filename": file.filename,
        "headers": header,
        "mapped_columns": column_mapping,
        "rows_detected": rows_detected,
        "valid_rows": valid_rows,
        "invalid_rows": rows_detected - valid_rows,
        "sample_preview": sample_preview
    }


@router.post("/process")
async def process_csv(
    file: UploadFile = File(...),
    ctx: dict = Depends(get_current_user_context)
):
    """Processes, dedupes, and batch analyzes all rows from the uploaded CSV."""
    biz_id = ctx["business_id"]
    content = await file.read()
    try:
        text_stream = io.StringIO(content.decode("utf-8-sig"))
    except Exception:
        text_stream = io.StringIO(content.decode("latin-1"))

    reader = csv.reader(text_stream)
    header = next(reader, None)
    if not header:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    column_mapping = map_columns(header)
    msg_idx = column_mapping.get("message")
    name_idx = column_mapping.get("customer_name")
    rating_idx = column_mapping.get("rating")
    date_idx = column_mapping.get("date")
    source_idx = column_mapping.get("source")
    prod_idx = column_mapping.get("product")
    loc_idx = column_mapping.get("location")

    if msg_idx is None:
        raise HTTPException(status_code=400, detail="Could not detect a customer review or feedback column in CSV.")

    conn = get_db_connection()
    cursor = conn.cursor()

    rows_detected = 0
    imported_count = 0
    duplicate_count = 0
    invalid_count = 0

    now_default = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for row in reader:
        if not any(row):
            continue
        rows_detected += 1
        msg = row[msg_idx].strip() if msg_idx < len(row) else ""
        if not msg:
            invalid_count += 1
            continue

        c_hash = compute_content_hash(msg)

        # Check duplicate
        cursor.execute("SELECT id FROM feedback WHERE business_id = ? AND content_hash = ?", (biz_id, c_hash))
        if cursor.fetchone():
            duplicate_count += 1
            continue

        # Extract fields
        c_name = row[name_idx].strip() if name_idx is not None and name_idx < len(row) and row[name_idx].strip() else "Anonymous Customer"
        rating_val = None
        if rating_idx is not None and rating_idx < len(row):
            try:
                rating_val = float(row[rating_idx].strip())
            except Exception:
                rating_val = None

        date_val = now_default
        if date_idx is not None and date_idx < len(row) and row[date_idx].strip():
            date_val = row[date_idx].strip()

        src_val = "CSV Upload"
        if source_idx is not None and source_idx < len(row) and row[source_idx].strip():
            src_val = row[source_idx].strip()

        prod_val = "General Store"
        if prod_idx is not None and prod_idx < len(row) and row[prod_idx].strip():
            prod_val = row[prod_idx].strip()

        loc_val = "Main Branch"
        if loc_idx is not None and loc_idx < len(row) and row[loc_idx].strip():
            loc_val = row[loc_idx].strip()

        # Run AI analysis
        analysis = await ai_service.analyze_feedback(msg, rating_val, {"source": src_val, "product": prod_val, "location": loc_val})

        fb_id = f"FB-{uuid.uuid4().hex[:6].upper()}"

        cursor.execute("""
            INSERT INTO feedback (
                id, business_id, customer_name, customer_email, customer_phone, source, rating,
                message, original_language, detected_language, translated_text, product_name,
                location, created_at, reviewed, assigned_to, tags, priority, notes, archived, content_hash
            ) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?, '', 0, ?)
        """, (
            fb_id, biz_id, c_name, src_val, rating_val, msg,
            analysis.language, analysis.detected_language, analysis.translated_text,
            prod_val, loc_val, date_val,
            json.dumps([t.split()[0].lower() for t in analysis.topics]),
            analysis.priority, c_hash
        ))

        cursor.execute("""
            INSERT INTO feedback_analysis (
                feedback_id, sentiment, sentiment_score, confidence, emotions, topics, aspects,
                intent, priority, summary, actionable, explanation, processed_at, provider_used, content_hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            fb_id, analysis.sentiment, analysis.sentiment_score, analysis.confidence,
            json.dumps(analysis.emotions), json.dumps(analysis.topics),
            json.dumps([a.model_dump() for a in analysis.aspects]),
            analysis.intent, analysis.priority, analysis.summary,
            1 if analysis.actionable else 0, analysis.explanation,
            date_val, analysis.provider_used, c_hash
        ))

        imported_count += 1

    # Update source counter
    cursor.execute("""
        UPDATE sources
        SET feedback_count = feedback_count + ?, last_sync_at = ?
        WHERE business_id = ? AND type = 'csv'
    """, (imported_count, now_default, biz_id))

    # Log audit
    cursor.execute("""
        INSERT INTO audit_logs (id, business_id, user_email, action, details, timestamp)
        VALUES (?, ?, ?, 'Imported CSV Feedback File', ?, ?)
    """, (
        f"aud-{uuid.uuid4().hex[:6]}", biz_id, ctx["email"],
        f"Uploaded {file.filename}: {imported_count} imported, {duplicate_count} duplicates skipped, {invalid_count} invalid.",
        now_default
    ))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "filename": file.filename,
        "rows_detected": rows_detected,
        "imported": imported_count,
        "duplicates_skipped": duplicate_count,
        "invalid_rows": invalid_count,
        "message": f"Successfully processed {imported_count} customer reviews into InsightLoop."
    }
