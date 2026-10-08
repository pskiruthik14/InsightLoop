"""
Data models and schemas for MSME Sentiment Intelligence System.
"""
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class FeedbackItem(BaseModel):
    id: str = Field(..., description="Unique feedback ID")
    source: str = Field(..., description="Platform: Google Reviews, Amazon, WhatsApp, In-Store, Swiggy, etc.")
    customer_name: Optional[str] = "Anonymous Customer"
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    text: str = Field(..., description="Raw customer feedback text")
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AspectSentiment(BaseModel):
    aspect: str = Field(..., description="e.g., Quality, Pricing, Service, Delivery, Hygiene, Value")
    sentiment: str = Field(..., description="Positive, Neutral, Negative")
    confidence: float = Field(..., ge=0.0, le=1.0)
    keywords: List[str] = Field(default_factory=list)

class AnalyzedFeedback(BaseModel):
    id: str
    source: str
    customer_name: str
    rating: Optional[float]
    text: str
    timestamp: str
    overall_sentiment: str = Field(..., description="Positive, Neutral, Negative")
    sentiment_score: float = Field(..., ge=-1.0, le=1.0, description="-1.0 (most negative) to +1.0 (most positive)")
    urgency_level: str = Field(..., description="Low, Medium, High, Critical")
    emotion: str = Field(..., description="Delight, Gratitude, Neutral, Frustration, Anger, Disappointment")
    aspects: List[AspectSentiment] = Field(default_factory=list)
    key_themes: List[str] = Field(default_factory=list)
    draft_response: Optional[str] = None

class RootCauseItem(BaseModel):
    category: str
    issue: str
    frequency_count: int
    severity: str = Field(..., description="Low, Medium, High, Critical")
    affected_aspect: str
    evidence_quotes: List[str] = Field(default_factory=list)
    contributing_factors: List[str] = Field(default_factory=list)

class ActionRecommendation(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: str = Field(..., description="Immediate (24-48h), Medium-Term (1-2w), Strategic (1m+)")
    estimated_cost: str = Field(..., description="Zero Cost, Low (< $50 / ₹3000), Medium")
    expected_impact: str = Field(..., description="High, Medium, Transformational")
    implementation_steps: List[str] = Field(default_factory=list)

class SentimentDigest(BaseModel):
    total_reviews: int
    positive_count: int
    neutral_count: int
    negative_count: int
    net_sentiment_score: float = Field(..., description="NSS formula: % Positive - % Negative (-100 to +100)")
    average_rating: float
    critical_alerts_count: int
    aspect_scores: Dict[str, float] = Field(default_factory=dict)
    top_positive_themes: List[str] = Field(default_factory=list)
    top_negative_complaints: List[str] = Field(default_factory=list)
    root_causes: List[RootCauseItem] = Field(default_factory=list)
    action_plan: List[ActionRecommendation] = Field(default_factory=list)
    executive_summary: str

class ReviewResponseRequest(BaseModel):
    review_id: str
    review_text: str
    customer_name: Optional[str] = "Valued Customer"
    sentiment: str
    rating: Optional[float] = 3.0
    aspects: List[str] = Field(default_factory=list)
    tone: str = Field("empathetic", description="empathetic, professional, enthusiastic, promotional")
    business_name: Optional[str] = "Our MSME Business"

class SingleAnalysisRequest(BaseModel):
    text: str
    source: Optional[str] = "Manual Entry"
    customer_name: Optional[str] = "Customer"
    rating: Optional[float] = None
    business_name: Optional[str] = "Local Enterprise"

class LLMConfig(BaseModel):
    provider: str = Field("hybrid", description="hybrid, gemini, openai")
    api_key: Optional[str] = None
    model_name: Optional[str] = "gemini-1.5-flash"
