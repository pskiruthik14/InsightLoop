"""
Configuration settings for MSME Sentiment Intelligence System.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
STATIC_DIR = BASE_DIR.parent / "static"

DATA_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Default MSME Aspects monitored
ASPECT_CATEGORIES = [
    "Product Quality",
    "Pricing & Value",
    "Customer Service",
    "Delivery & Logistics",
    "Packaging & Presentation",
    "Hygiene & Store Ambiance"
]

# Sensitive alert keywords (High urgency / risk of churn or reputation damage)
CRITICAL_ALERT_KEYWORDS = [
    "fraud", "scam", "poison", "hair", "insect", "ill", "sick", "police",
    "refund refused", "worst experience", "never coming back", "sue", "cheating",
    "spoiled", "rotten", "broken", "unacceptable", "terrible staff", "rude"
]

# Default API configuration
DEFAULT_LLM_PROVIDER = os.getenv("AI_PROVIDER", os.getenv("LLM_PROVIDER", "mistral"))
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "mstrl_Lwa7aZs40NyowbdWxhXJjPRQkgp4kOWa_43zD43")
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "open-mistral-7b")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")
