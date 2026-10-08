"""
InsightLoop AI Base Types and Interface
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from abc import ABC, abstractmethod


class AspectItem(BaseModel):
    aspect: str
    sentiment: str  # positive, neutral, negative
    confidence: float = 0.90
    keywords: List[str] = Field(default_factory=list)


class FeedbackAnalysisResult(BaseModel):
    language: str = "en"
    detected_language: str = "en"
    translated_text: Optional[str] = None
    sentiment: str = "neutral"  # positive, neutral, negative
    sentiment_score: float = 0.0  # -1.0 to 1.0
    confidence: float = 0.85
    emotions: List[str] = Field(default_factory=list)  # frustration, satisfaction, anger, etc.
    topics: List[str] = Field(default_factory=list)
    aspects: List[AspectItem] = Field(default_factory=list)
    intent: str = "feedback"  # complaint, praise, inquiry, suggestion, churn_risk
    priority: str = "medium"  # low, medium, high, critical
    summary: str
    actionable: bool = False
    explanation: str
    provider_used: str = "hybrid"


class BaseAIProvider(ABC):
    @abstractmethod
    async def analyze(self, text: str, rating: Optional[float] = None, metadata: Optional[Dict[str, Any]] = None) -> FeedbackAnalysisResult:
        pass
