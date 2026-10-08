"""
Recommendations Engine Routes
Provides prioritized, low-budget and high-impact business action items.
Uses an explainable priority scoring formula: Severity × Frequency × Recency × Trend.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json
import uuid

from backend.database import get_db_connection
from backend.routes.auth import get_current_user_context

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


class UpdateRecommendationStatusRequest(BaseModel):
    status: str  # open, in_progress, resolved


@router.get("")
def get_recommendations(ctx: dict = Depends(get_current_user_context)):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            id, priority_rank, title, description, category,
            priority_score, priority_label, severity_factor, frequency_factor,
            recency_factor, trend_factor, rationale, affected_count,
            potential_impact, estimated_cost, implementation_steps, status, updated_at
        FROM recommendations
        WHERE business_id = ?
        ORDER BY priority_score DESC
    """, (biz_id,))
    rows = cursor.fetchall()
    conn.close()

    items = []
    for r in rows:
        items.append({
            "id": r["id"],
            "priority_rank": r["priority_rank"],
            "title": r["title"],
            "description": r["description"],
            "category": r["category"],
            "priority_score": r["priority_score"],
            "priority_label": r["priority_label"],
            "formula_breakdown": {
                "formula": "Priority Score = (Severity × 0.35 + Frequency × 0.25 + Recency × 0.20 + Trend × 0.20) × 100",
                "severity_factor": r["severity_factor"],
                "frequency_factor": r["frequency_factor"],
                "recency_factor": r["recency_factor"],
                "trend_factor": r["trend_factor"],
                "computed_score": r["priority_score"]
            },
            "rationale": r["rationale"],
            "affected_count": r["affected_count"],
            "potential_impact": r["potential_impact"],
            "estimated_cost": r["estimated_cost"],
            "implementation_steps": json.loads(r["implementation_steps"]) if r["implementation_steps"] else [],
            "status": r["status"],
            "updated_at": r["updated_at"]
        })

    return {"recommendations": items}


@router.patch("/{rec_id}/status")
def update_recommendation_status(
    rec_id: str,
    req: UpdateRecommendationStatusRequest,
    ctx: dict = Depends(get_current_user_context)
):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    now_str = datetime.now().isoformat()
    cursor.execute("""
        UPDATE recommendations
        SET status = ?, updated_at = ?
        WHERE id = ? AND business_id = ?
    """, (req.status, now_str, rec_id, biz_id))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    # Audit log
    cursor.execute("""
        INSERT INTO audit_logs (id, business_id, user_email, action, details, timestamp)
        VALUES (?, ?, ?, 'Updated Recommendation Status', ?, ?)
    """, (
        f"aud-{uuid.uuid4().hex[:6]}", biz_id, ctx["email"],
        f"Changed status of action item {rec_id} to '{req.status}'", now_str
    ))

    conn.commit()
    conn.close()

    return {"status": "success", "message": f"Recommendation updated to {req.status}."}
