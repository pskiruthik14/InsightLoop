"""
Alerts & Threshold Monitoring Routes
Provides real-time threshold breaches, alert resolution, and configuration for MSME operational safety.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

from backend.database import get_db_connection
from backend.routes.auth import get_current_user_context

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


class UpdateAlertStatusRequest(BaseModel):
    status: str  # acknowledged, resolved, active


class ConfigureThresholdsRequest(BaseModel):
    alert_sentiment_threshold: float
    alert_volume_growth_threshold: float
    alert_rating_threshold: float
    notification_email: Optional[str] = None


@router.get("")
def list_alerts(ctx: dict = Depends(get_current_user_context)):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title, description, severity, alert_type, triggered_at, status, metric_value, threshold_value
        FROM alerts
        WHERE business_id = ?
        ORDER BY triggered_at DESC
    """, (biz_id,))
    rows = cursor.fetchall()

    cursor.execute("""
        SELECT alert_sentiment_threshold, alert_volume_growth_threshold, alert_rating_threshold, notification_email
        FROM settings
        WHERE business_id = ?
    """, (biz_id,))
    settings_row = cursor.fetchone()
    conn.close()

    thresholds = dict(settings_row) if settings_row else {
        "alert_sentiment_threshold": 25.0,
        "alert_volume_growth_threshold": 20.0,
        "alert_rating_threshold": 3.2,
        "notification_email": "owner@artisanroastery.com"
    }

    alerts = [dict(r) for r in rows]
    active_count = sum(1 for a in alerts if a["status"] == "active")

    return {
        "alerts": alerts,
        "active_count": active_count,
        "thresholds": thresholds
    }


@router.patch("/{alert_id}/status")
def update_alert_status(
    alert_id: str,
    req: UpdateAlertStatusRequest,
    ctx: dict = Depends(get_current_user_context)
):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE alerts
        SET status = ?
        WHERE id = ? AND business_id = ?
    """, (req.status, alert_id, biz_id))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Alert not found.")

    conn.commit()
    conn.close()

    return {"status": "success", "message": f"Alert marked as {req.status}."}


@router.post("/configure-thresholds")
def configure_thresholds(
    req: ConfigureThresholdsRequest,
    ctx: dict = Depends(get_current_user_context)
):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    now_str = datetime.now().isoformat()
    cursor.execute("""
        UPDATE settings
        SET alert_sentiment_threshold = ?, alert_volume_growth_threshold = ?,
            alert_rating_threshold = ?, notification_email = COALESCE(?, notification_email),
            updated_at = ?
        WHERE business_id = ?
    """, (
        req.alert_sentiment_threshold, req.alert_volume_growth_threshold,
        req.alert_rating_threshold, req.notification_email, now_str, biz_id
    ))

    cursor.execute("""
        INSERT INTO audit_logs (id, business_id, user_email, action, details, timestamp)
        VALUES (?, ?, ?, 'Updated Alert Thresholds', ?, ?)
    """, (
        f"aud-{uuid.uuid4().hex[:6]}", biz_id, ctx["email"],
        f"Updated sentiment threshold to {req.alert_sentiment_threshold}% and growth threshold to {req.alert_volume_growth_threshold}%",
        now_str
    ))

    conn.commit()
    conn.close()

    return {"status": "success", "message": "Alert thresholds saved successfully."}
