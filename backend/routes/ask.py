"""
Ask Your Customer Data Routes
Translates natural language questions into factual database aggregations with traceable evidence quotes.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.routes.auth import get_current_user_context
from backend.services.ai.ask_data import ask_data_service

router = APIRouter(prefix="/api/ask", tags=["Ask Your Data"])


class AskDataRequest(BaseModel):
    query: str


@router.post("")
async def ask_question(req: AskDataRequest, ctx: dict = Depends(get_current_user_context)):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be blank.")

    biz_id = ctx["business_id"]
    result = await ask_data_service.process_query(biz_id, req.query.strip())
    return result
