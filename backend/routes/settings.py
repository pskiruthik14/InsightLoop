"""
Settings, Team Collaboration, Audit Logs, and Data Management Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
import json
import uuid

from backend.database import get_db_connection, ensure_demo_data
from backend.routes.auth import get_current_user_context
from backend.services.ai.llm_providers import ai_service

router = APIRouter(prefix="/api/settings", tags=["Settings"])


class UpdateSettingsRequest(BaseModel):
    mask_pii: Optional[bool] = None
    ai_provider: Optional[str] = None
    mistral_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    alert_sentiment_threshold: Optional[float] = None
    alert_volume_growth_threshold: Optional[float] = None
    alert_rating_threshold: Optional[float] = None
    notification_email: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    name: str
    category: str
    size: str
    primary_goal: str


class InviteTeamMemberRequest(BaseModel):
    email: str
    full_name: str
    role: str  # admin, analyst, viewer


@router.get("")
def get_settings(ctx: dict = Depends(get_current_user_context)):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT name, category, size, primary_goal, sources_selected, created_at
        FROM businesses
        WHERE id = ?
    """, (biz_id,))
    biz_row = cursor.fetchone()

    cursor.execute("""
        SELECT mask_pii, ai_provider, alert_sentiment_threshold, alert_volume_growth_threshold,
               alert_rating_threshold, notification_email, auto_triage, updated_at
        FROM settings
        WHERE business_id = ?
    """, (biz_id,))
    settings_row = cursor.fetchone()
    conn.close()

    return {
        "business": dict(biz_row) if biz_row else {},
        "settings": {
            "mask_pii": bool(settings_row["mask_pii"]) if settings_row else True,
            "ai_provider": settings_row["ai_provider"] if settings_row else "hybrid",
            "alert_sentiment_threshold": settings_row["alert_sentiment_threshold"] if settings_row else 25.0,
            "alert_volume_growth_threshold": settings_row["alert_volume_growth_threshold"] if settings_row else 20.0,
            "alert_rating_threshold": settings_row["alert_rating_threshold"] if settings_row else 3.2,
            "notification_email": settings_row["notification_email"] if settings_row else "owner@artisanroastery.com",
            "auto_triage": bool(settings_row["auto_triage"]) if settings_row else True,
            "has_mistral_key": bool(ai_service.mistral_key),
            "has_gemini_key": bool(ai_service.gemini_key),
            "has_openai_key": bool(ai_service.openai_key),
            "has_anthropic_key": bool(ai_service.anthropic_key)
        }
    }


@router.put("")
def update_settings(req: UpdateSettingsRequest, ctx: dict = Depends(get_current_user_context)):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    now_str = datetime.now().isoformat()
    updates = []
    params = []

    if req.mask_pii is not None:
        updates.append("mask_pii = ?")
        params.append(1 if req.mask_pii else 0)
    if req.ai_provider is not None:
        updates.append("ai_provider = ?")
        params.append(req.ai_provider)
        ai_service.update_config(
            provider=req.ai_provider,
            mistral_key=req.mistral_api_key,
            gemini_key=req.gemini_api_key,
            openai_key=req.openai_api_key,
            anthropic_key=req.anthropic_api_key
        )
    if req.alert_sentiment_threshold is not None:
        updates.append("alert_sentiment_threshold = ?")
        params.append(req.alert_sentiment_threshold)
    if req.alert_volume_growth_threshold is not None:
        updates.append("alert_volume_growth_threshold = ?")
        params.append(req.alert_volume_growth_threshold)
    if req.alert_rating_threshold is not None:
        updates.append("alert_rating_threshold = ?")
        params.append(req.alert_rating_threshold)
    if req.notification_email is not None:
        updates.append("notification_email = ?")
        params.append(req.notification_email)

    if updates:
        updates.append("updated_at = ?")
        params.append(now_str)
        params.append(biz_id)
        cursor.execute(f"UPDATE settings SET {', '.join(updates)} WHERE business_id = ?", params)

    cursor.execute("""
        INSERT INTO audit_logs (id, business_id, user_email, action, details, timestamp)
        VALUES (?, ?, ?, 'Updated Configuration Settings', 'Updated platform configuration & privacy settings', ?)
    """, (f"aud-{uuid.uuid4().hex[:6]}", biz_id, ctx["email"], now_str))

    conn.commit()
    conn.close()

    return {"status": "success", "message": "Settings updated successfully."}


@router.put("/profile")
def update_profile(req: UpdateProfileRequest, ctx: dict = Depends(get_current_user_context)):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE businesses
        SET name = ?, category = ?, size = ?, primary_goal = ?
        WHERE id = ?
    """, (req.name, req.category, req.size, req.primary_goal, biz_id))

    cursor.execute("""
        INSERT INTO audit_logs (id, business_id, user_email, action, details, timestamp)
        VALUES (?, ?, ?, 'Updated Business Profile', ?, ?)
    """, (
        f"aud-{uuid.uuid4().hex[:6]}", biz_id, ctx["email"],
        f"Updated business profile for {req.name}", datetime.now().isoformat()
    ))

    conn.commit()
    conn.close()

    return {"status": "success", "message": "Business profile updated successfully."}


@router.get("/team")
def list_team_members(ctx: dict = Depends(get_current_user_context)):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, email, full_name, role, created_at
        FROM users
        WHERE business_id = ?
        ORDER BY created_at ASC
    """, (biz_id,))
    rows = cursor.fetchall()
    conn.close()

    return {"team": [dict(r) for r in rows]}


@router.post("/team/invite")
def invite_team_member(req: InviteTeamMemberRequest, ctx: dict = Depends(get_current_user_context)):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="User already exists with this email.")

    now_str = datetime.now().isoformat()
    user_id = f"usr-{uuid.uuid4().hex[:8]}"

    from backend.database import hash_password
    cursor.execute("""
        INSERT INTO users (id, business_id, email, password_hash, full_name, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, biz_id, req.email, hash_password("invite123"), req.full_name, req.role, now_str))

    cursor.execute("""
        INSERT INTO audit_logs (id, business_id, user_email, action, details, timestamp)
        VALUES (?, ?, ?, 'Invited Team Member', ?, ?)
    """, (
        f"aud-{uuid.uuid4().hex[:6]}", biz_id, ctx["email"],
        f"Invited {req.full_name} ({req.email}) as {req.role}", now_str
    ))

    conn.commit()
    conn.close()

    return {"status": "success", "message": f"Invitation created for {req.email}."}


@router.get("/audit-logs")
def get_audit_logs(ctx: dict = Depends(get_current_user_context)):
    biz_id = ctx["business_id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, user_email, action, details, timestamp
        FROM audit_logs
        WHERE business_id = ?
        ORDER BY timestamp DESC
        LIMIT 50
    """, (biz_id,))
    rows = cursor.fetchall()
    conn.close()

    return {"logs": [dict(r) for r in rows]}


@router.post("/reset-demo-data")
def reset_demo_data(ctx: dict = Depends(get_current_user_context)):
    """Resets the workspace back to the full 520+ rich demo dataset."""
    ensure_demo_data()
    return {"status": "success", "message": "Demo dataset restored successfully."}
