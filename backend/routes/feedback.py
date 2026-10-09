"""
Feedback Management Routes
Provides feedback inbox search, multi-faceted filtering, detail inspector with aspect-level sentiment,
manual feedback entry with live AI analysis pipeline, status updates, and empathetic response generation.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import json
import uuid
import csv
import io

from backend.database import get_db_connection, compute_content_hash
from backend.routes.auth import get_current_user_context
from backend.services.ai.llm_providers import ai_service
from backend.utils.privacy import mask_email, mask_phone, mask_text_pii

router = APIRouter(prefix="/api/feedback", tags=["Feedback Inbox"])


class CreateFeedbackRequest(BaseModel):
    customer_name: Optional[str] = "Anonymous Customer"
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    source: str = "Manual Entry"
    rating: Optional[float] = 4.0
    message: str
    product_name: Optional[str] = "General Store"
    location: Optional[str] = "Headquarters"


class UpdateFeedbackStatusRequest(BaseModel):
    reviewed: Optional[bool] = None
    assigned_to: Optional[str] = None
    tags: Optional[List[str]] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    archived: Optional[bool] = None


class GenerateReplyRequest(BaseModel):
    tone: str = Field("empathetic", description="empathetic, professional, enthusiastic, promotional")


@router.get("")
def list_feedback(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    source: Optional[str] = None,
    sentiment: Optional[str] = None,
    emotion: Optional[str] = None,
    topic: Optional[str] = None,
    product: Optional[str] = None,
    location: Optional[str] = None,
    priority: Optional[str] = None,
    rating: Optional[float] = None,
    language: Optional[str] = None,
    reviewed: Optional[int] = None,
    archived: int = 0,
    ctx: dict = Depends(get_current_user_context)
):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check PII masking setting
    cursor.execute("SELECT mask_pii FROM settings WHERE business_id = ?", (biz_id,))
    setting_row = cursor.fetchone()
    mask_pii = bool(setting_row["mask_pii"]) if setting_row else True

    where_clauses = ["f.business_id = ?", "f.archived = ?"]
    params: List[Any] = [biz_id, archived]

    if search:
        s = f"%{search.strip()}%"
        where_clauses.append("(f.message LIKE ? OR f.customer_name LIKE ? OR f.product_name LIKE ? OR f.id LIKE ?)")
        params.extend([s, s, s, s])

    if source and source != "all":
        where_clauses.append("f.source = ?")
        params.append(source)

    if sentiment and sentiment != "all":
        where_clauses.append("fa.sentiment = ?")
        params.append(sentiment)

    if emotion and emotion != "all":
        where_clauses.append("fa.emotions LIKE ?")
        params.append(f"%{emotion}%")

    if topic and topic != "all":
        where_clauses.append("fa.topics LIKE ?")
        params.append(f"%{topic}%")

    if product and product != "all":
        where_clauses.append("f.product_name = ?")
        params.append(product)

    if location and location != "all":
        where_clauses.append("f.location = ?")
        params.append(location)

    if priority and priority != "all":
        where_clauses.append("fa.priority = ?")
        params.append(priority)

    if rating is not None:
        where_clauses.append("ROUND(f.rating) = ?")
        params.append(round(rating))

    if language and language != "all":
        where_clauses.append("f.detected_language = ?")
        params.append(language)

    if reviewed is not None:
        where_clauses.append("f.reviewed = ?")
        params.append(reviewed)

    where_sql = " AND ".join(where_clauses)

    # Count total
    cursor.execute(f"""
        SELECT COUNT(*) as total
        FROM feedback f
        JOIN feedback_analysis fa ON f.id = fa.feedback_id
        WHERE {where_sql}
    """, params)
    total_count = cursor.fetchone()["total"]

    # Paginated query
    offset = (page - 1) * limit
    cursor.execute(f"""
        SELECT 
            f.id, f.customer_name, f.customer_email, f.customer_phone, f.source, f.rating,
            f.message, f.original_language, f.detected_language, f.translated_text,
            f.product_name, f.location, f.created_at, f.reviewed, f.assigned_to,
            f.tags, f.priority, f.notes, f.archived,
            fa.sentiment, fa.sentiment_score, fa.confidence, fa.emotions,
            fa.topics, fa.aspects, fa.intent, fa.priority as analysis_priority,
            fa.summary, fa.actionable, fa.explanation
        FROM feedback f
        JOIN feedback_analysis fa ON f.id = fa.feedback_id
        WHERE {where_sql}
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
    """, params + [limit, offset])
    rows = cursor.fetchall()
    conn.close()

    items = []
    for r in rows:
        item = dict(r)
        # Parse JSON fields
        item["tags"] = json.loads(item["tags"]) if item["tags"] else []
        item["emotions"] = json.loads(item["emotions"]) if item["emotions"] else []
        item["topics"] = json.loads(item["topics"]) if item["topics"] else []
        item["aspects"] = json.loads(item["aspects"]) if item["aspects"] else []

        # Apply PII masking if active
        if mask_pii:
            item["customer_email"] = mask_email(item.get("customer_email"))
            item["customer_phone"] = mask_phone(item.get("customer_phone"))
            item["message"] = mask_text_pii(item["message"])
            if item.get("translated_text"):
                item["translated_text"] = mask_text_pii(item["translated_text"])

        items.append(item)

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit if limit else 1
    }


@router.get("/export")
def export_feedback_csv(
    source: Optional[str] = None,
    sentiment: Optional[str] = None,
    topic: Optional[str] = None,
    ctx: dict = Depends(get_current_user_context)
):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    where_clauses = ["f.business_id = ?", "f.archived = 0"]
    params: List[Any] = [biz_id]

    if source and source != "all":
        where_clauses.append("f.source = ?")
        params.append(source)
    if sentiment and sentiment != "all":
        where_clauses.append("fa.sentiment = ?")
        params.append(sentiment)
    if topic and topic != "all":
        where_clauses.append("fa.topics LIKE ?")
        params.append(f"%{topic}%")

    where_sql = " AND ".join(where_clauses)

    cursor.execute(f"""
        SELECT 
            f.id, f.customer_name, f.source, f.rating, f.message, f.product_name,
            f.location, f.created_at, fa.sentiment, fa.sentiment_score, fa.priority,
            fa.summary, f.reviewed
        FROM feedback f
        JOIN feedback_analysis fa ON f.id = fa.feedback_id
        WHERE {where_sql}
        ORDER BY f.created_at DESC
    """, params)
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Feedback ID", "Customer Name", "Source", "Rating", "Message", "Product",
        "Location", "Created At", "Sentiment", "Sentiment Score", "Priority", "Summary", "Reviewed"
    ])
    for r in rows:
        writer.writerow([
            r["id"], r["customer_name"], r["source"], r["rating"], r["message"], r["product_name"],
            r["location"], r["created_at"], r["sentiment"], r["sentiment_score"], r["priority"],
            r["summary"], "Yes" if r["reviewed"] else "No"
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=insightloop_feedback_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/{feedback_id}")
def get_feedback_detail(feedback_id: str, ctx: dict = Depends(get_current_user_context)):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT mask_pii FROM settings WHERE business_id = ?", (biz_id,))
    setting_row = cursor.fetchone()
    mask_pii = bool(setting_row["mask_pii"]) if setting_row else True

    cursor.execute("""
        SELECT 
            f.id, f.customer_name, f.customer_email, f.customer_phone, f.source, f.rating,
            f.message, f.original_language, f.detected_language, f.translated_text,
            f.product_name, f.location, f.created_at, f.reviewed, f.assigned_to,
            f.tags, f.priority, f.notes, f.archived,
            fa.sentiment, fa.sentiment_score, fa.confidence, fa.emotions,
            fa.topics, fa.aspects, fa.intent, fa.priority as analysis_priority,
            fa.summary, fa.actionable, fa.explanation, fa.processed_at, fa.provider_used
        FROM feedback f
        JOIN feedback_analysis fa ON f.id = fa.feedback_id
        WHERE f.id = ? AND f.business_id = ?
    """, (feedback_id, biz_id))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Feedback not found.")

    item = dict(row)
    item["tags"] = json.loads(item["tags"]) if item["tags"] else []
    item["emotions"] = json.loads(item["emotions"]) if item["emotions"] else []
    item["topics"] = json.loads(item["topics"]) if item["topics"] else []
    item["aspects"] = json.loads(item["aspects"]) if item["aspects"] else []

    if mask_pii:
        item["customer_email"] = mask_email(item.get("customer_email"))
        item["customer_phone"] = mask_phone(item.get("customer_phone"))
        item["message"] = mask_text_pii(item["message"])
        if item.get("translated_text"):
            item["translated_text"] = mask_text_pii(item["translated_text"])

    return item


@router.post("")
async def create_and_analyze_feedback(req: CreateFeedbackRequest, ctx: dict = Depends(get_current_user_context)):
    """
    Submits manual feedback, immediately executes AI analysis pipeline, saves to DB,
    and returns both the feedback item and structured analysis.
    """
    biz_id = ctx["business_id"]
    feedback_id = f"FB-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Run AI Analysis Pipeline
    analysis = await ai_service.analyze_feedback(
        text=req.message,
        rating=req.rating,
        metadata={"source": req.source, "product": req.product_name, "location": req.location}
    )

    content_hash = compute_content_hash(req.message)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO feedback (
            id, business_id, customer_name, customer_email, customer_phone, source, rating,
            message, original_language, detected_language, translated_text, product_name,
            location, created_at, reviewed, assigned_to, tags, priority, notes, archived, content_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?, '', 0, ?)
    """, (
        feedback_id, biz_id, req.customer_name or "Anonymous Customer",
        req.customer_email, req.customer_phone, req.source, req.rating,
        req.message, analysis.language, analysis.detected_language,
        analysis.translated_text, req.product_name, req.location, now_str,
        json.dumps([t.split()[0].lower() for t in analysis.topics]),
        analysis.priority, content_hash
    ))

    cursor.execute("""
        INSERT INTO feedback_analysis (
            feedback_id, sentiment, sentiment_score, confidence, emotions, topics, aspects,
            intent, priority, summary, actionable, explanation, processed_at, provider_used, content_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        feedback_id, analysis.sentiment, analysis.sentiment_score, analysis.confidence,
        json.dumps(analysis.emotions), json.dumps(analysis.topics),
        json.dumps([a.model_dump() for a in analysis.aspects]),
        analysis.intent, analysis.priority, analysis.summary,
        1 if analysis.actionable else 0, analysis.explanation,
        now_str, analysis.provider_used, content_hash
    ))

    # Increment source counter
    cursor.execute("""
        UPDATE sources
        SET feedback_count = feedback_count + 1, last_sync_at = ?
        WHERE business_id = ? AND (type = 'manual' OR name LIKE ?)
    """, (now_str, biz_id, f"%{req.source}%"))

    # Log audit
    cursor.execute("""
        INSERT INTO audit_logs (id, business_id, user_email, action, details, timestamp)
        VALUES (?, ?, ?, 'Created Manual Feedback', ?, ?)
    """, (
        f"aud-{uuid.uuid4().hex[:6]}", biz_id, ctx["email"],
        f"Recorded manual review {feedback_id} from {req.customer_name} ({req.source})",
        now_str
    ))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "feedback_id": feedback_id,
        "feedback": {
            "id": feedback_id,
            "customer_name": req.customer_name,
            "source": req.source,
            "rating": req.rating,
            "message": req.message,
            "product_name": req.product_name,
            "location": req.location,
            "created_at": now_str
        },
        "analysis": analysis.model_dump()
    }


@router.patch("/{feedback_id}/status")
def update_feedback_status(
    feedback_id: str,
    req: UpdateFeedbackStatusRequest,
    ctx: dict = Depends(get_current_user_context)
):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    updates = []
    params: List[Any] = []

    if req.reviewed is not None:
        updates.append("reviewed = ?")
        params.append(1 if req.reviewed else 0)
    if req.assigned_to is not None:
        updates.append("assigned_to = ?")
        params.append(req.assigned_to)
    if req.tags is not None:
        updates.append("tags = ?")
        params.append(json.dumps(req.tags))
    if req.priority is not None:
        updates.append("priority = ?")
        params.append(req.priority)
    if req.notes is not None:
        updates.append("notes = ?")
        params.append(req.notes)
    if req.archived is not None:
        updates.append("archived = ?")
        params.append(1 if req.archived else 0)

    if not updates:
        conn.close()
        return {"status": "no_change"}

    params.extend([feedback_id, biz_id])
    cursor.execute(f"UPDATE feedback SET {', '.join(updates)} WHERE id = ? AND business_id = ?", params)
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Feedback updated successfully."}


@router.post("/{feedback_id}/reply")
async def generate_review_reply(
    feedback_id: str,
    req: GenerateReplyRequest,
    ctx: dict = Depends(get_current_user_context)
):
    """Generates empathetic, professional, enthusiastic, or promotional review response using Mistral AI."""
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT f.customer_name, f.message, f.rating, f.product_name, fa.sentiment, fa.emotions
        FROM feedback f
        JOIN feedback_analysis fa ON f.id = fa.feedback_id
        WHERE f.id = ? AND f.business_id = ?
    """, (feedback_id, biz_id))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Feedback not found.")

    cust_name = row["customer_name"] or "Valued Customer"
    product = row["product_name"] or "our offering"
    sentiment = row["sentiment"]
    tone = req.tone.lower()
    customer_msg = row["message"] or ""

    # Attempt AI response generation via Mistral
    system_prompt = (
        f"You are an empathetic customer experience manager for a local business. "
        f"Draft a personalized, respectful, and concise response to the customer in a '{tone}' tone. "
        f"Directly acknowledge the customer's specific comments and maintain accountability and warmth. "
        f"Do not include placeholders like '[Your Name]'. Keep it under 75 words."
    )
    user_prompt = (
        f"Customer: {cust_name}\n"
        f"Product/Service: {product}\n"
        f"Rating: {row['rating']}/5\n"
        f"Sentiment: {sentiment}\n"
        f"Customer Message: \"{customer_msg}\""
    )

    ai_reply = await ai_service.generate_text(system_prompt, user_prompt, max_tokens=200)
    if ai_reply:
        return {
            "feedback_id": feedback_id,
            "tone": tone,
            "draft_response": ai_reply,
            "ai_generated": True
        }

    # Deterministic fallback template
    if sentiment == "Negative":
        if tone == "empathetic":
            reply = (
                f"Dear {cust_name}, we are genuinely sorry to hear about your experience with {product}. "
                f"We take quality and service very seriously, and this does not reflect our usual standard. "
                f"Our store manager would love to make this right personally — please connect with us at feedback@artisancafe.com."
            )
        else:
            reply = (
                f"Dear {cust_name}, thank you for bringing this issue to our attention. "
                f"We have noted your feedback regarding {product} and shared it with our operations lead for immediate correction. "
                f"We appreciate your honest feedback as we work to maintain our operational standards."
            )
    elif sentiment == "Positive":
        if tone == "enthusiastic":
            reply = (
                f"Thank you so much for the glowing review, {cust_name}! 🎉 "
                f"We are thrilled to know you loved our {product}! Our team puts immense love into freshly crafting every order. "
                f"Can't wait to welcome you back again soon!"
            )
        elif tone == "promotional":
            reply = (
                f"Thank you for the wonderful feedback, {cust_name}! As a token of our appreciation, "
                f"use code 'COMMUNITY15' on your next order at the counter. Looking forward to serving you again!"
            )
        else:
            reply = (
                f"Dear {cust_name}, thank you very much for taking the time to share your feedback. "
                f"We are delighted to know that you enjoyed our {product} and service. Have a wonderful day!"
            )
    else:
        reply = (
            f"Dear {cust_name}, thank you for sharing your feedback with us regarding {product}. "
            f"We appreciate your constructive suggestions and will use them to improve our service flow. "
            f"We look forward to serving you again soon."
        )

    return {
        "feedback_id": feedback_id,
        "tone": tone,
        "draft_response": reply,
        "ai_generated": False
    }
