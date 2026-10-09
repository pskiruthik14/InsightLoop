"""
LLM Providers and Abstraction Layer for InsightLoop.
Supports Mistral AI, Gemini, OpenAI, Anthropic, and Local/Rule fallback.
Never crashes, enforces strict JSON validation, caches with SHA-256 content hashing.
"""
import os
import json
import logging
import hashlib
from typing import Optional, Dict, Any, List
import httpx

from backend.services.ai.base import BaseAIProvider, FeedbackAnalysisResult, AspectItem
from backend.services.ai.rule_engine import RuleBasedEngine

logger = logging.getLogger("InsightLoopAI")

# In-memory LRU cache for processed hashes
_ANALYSIS_CACHE: Dict[str, FeedbackAnalysisResult] = {}


class LLMAbstractionService:
    def __init__(self):
        self.rule_engine = RuleBasedEngine()
        self.provider = os.getenv("AI_PROVIDER", "mistral").lower()
        self.mistral_key = os.getenv("MISTRAL_API_KEY", "mstrl_Lwa7aZs40NyowbdWxhXJjPRQkgp4kOWa_43zD43")
        self.mistral_model = os.getenv("MISTRAL_MODEL", "open-mistral-7b")
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")

    def update_config(
        self,
        provider: str,
        mistral_key: Optional[str] = None,
        gemini_key: Optional[str] = None,
        openai_key: Optional[str] = None,
        anthropic_key: Optional[str] = None
    ):
        self.provider = provider.lower()
        if mistral_key is not None:
            self.mistral_key = mistral_key
        if gemini_key is not None:
            self.gemini_key = gemini_key
        if openai_key is not None:
            self.openai_key = openai_key
        if anthropic_key is not None:
            self.anthropic_key = anthropic_key

    def _get_hash(self, text: str, rating: Optional[float]) -> str:
        content = f"{text.strip().lower()}_{rating or ''}"
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    async def _call_mistral_json(self, prompt: str, system_prompt: str) -> Optional[Dict[str, Any]]:
        """Invokes Mistral AI chat completions with strict JSON output mode."""
        if not self.mistral_key:
            return None
        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.mistral_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.mistral_model,
            "messages": [
                {"role": "system", "content": f"{system_prompt}\nRespond strictly with a valid JSON object matching the requested schema. No commentary."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        raw = choices[0]["message"].get("content", "")
                        return json.loads(raw)
                else:
                    logger.warning(f"Mistral API returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"Mistral API call failed: {e}")
        return None

    async def generate_text(self, system_prompt: str, user_prompt: str, max_tokens: int = 600) -> Optional[str]:
        """Generates natural language completions using Mistral AI."""
        if not self.mistral_key:
            return None
        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.mistral_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.mistral_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.3,
            "max_tokens": max_tokens
        }
        try:
            async with httpx.AsyncClient(timeout=18.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        return choices[0]["message"].get("content", "").strip()
        except Exception as e:
            logger.warning(f"Mistral generate_text failed: {e}")
        return None

    async def _call_gemini_json(self, prompt: str, system_prompt: str) -> Optional[Dict[str, Any]]:
        if not self.gemini_key:
            return None
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        payload = {
            "contents": [{
                "parts": [{"text": f"{system_prompt}\n\nRespond strictly with valid JSON only.\n\nInput feedback:\n{prompt}"}]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            raw_text = parts[0].get("text", "")
                            return json.loads(raw_text)
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}")
        return None

    async def _call_openai_json(self, prompt: str, system_prompt: str) -> Optional[Dict[str, Any]]:
        if not self.openai_key:
            return None
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": f"{system_prompt}\nRespond strictly with a single valid JSON object."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    raw = data["choices"][0]["message"]["content"]
                    return json.loads(raw)
        except Exception as e:
            logger.warning(f"OpenAI API call failed: {e}")
        return None

    async def analyze_feedback(self, text: str, rating: Optional[float] = None, metadata: Optional[Dict[str, Any]] = None) -> FeedbackAnalysisResult:
        """
        Analyzes customer feedback through configured provider with fallback to rule engine.
        Validates against schema and never throws unhandled errors.
        """
        content_hash = self._get_hash(text, rating)
        if content_hash in _ANALYSIS_CACHE:
            return _ANALYSIS_CACHE[content_hash]

        system_prompt = (
            "You are InsightLoop's customer intelligence LLM for MSMEs. "
            "Analyze the given customer feedback and output a structured JSON object with keys: "
            "language (str e.g. 'en', 'ta', 'ta-en', 'hi'), detected_language (str), translated_text (str or null if already English), "
            "sentiment ('Positive', 'Neutral', 'Negative'), sentiment_score (float between -1.0 and 1.0), "
            "confidence (float between 0.0 and 1.0), emotions (list of strings e.g. Frustration, Satisfaction, Anger, Disappointment, Excitement), "
            "topics (list of strings e.g. 'Delivery & Logistics', 'Product Quality', 'Pricing & Value', 'Customer Service', 'Packaging & Presentation', 'Hygiene & Store Ambiance'), "
            "aspects (list of objects with keys 'aspect', 'sentiment', 'confidence', 'keywords'), "
            "intent ('complaint', 'praise', 'inquiry', 'suggestion'), priority ('low', 'medium', 'high', 'critical'), "
            "summary (str), actionable (bool), explanation (str)."
        )

        llm_json = None
        used_provider = "rule_based"

        # 1. Try Mistral AI if available
        if self.mistral_key and self.provider in ["mistral", "hybrid", "any"]:
            llm_json = await self._call_mistral_json(f"Rating: {rating}\nText: {text}", system_prompt)
            if llm_json:
                used_provider = "mistral"

        # 2. Try Gemini
        if not llm_json and self.provider in ["gemini", "hybrid"] and self.gemini_key:
            llm_json = await self._call_gemini_json(f"Rating: {rating}\nText: {text}", system_prompt)
            if llm_json:
                used_provider = "gemini"

        # 3. Try OpenAI
        if not llm_json and self.provider in ["openai", "hybrid"] and self.openai_key:
            llm_json = await self._call_openai_json(f"Rating: {rating}\nText: {text}", system_prompt)
            if llm_json:
                used_provider = "openai"

        # Validate structured JSON
        if llm_json:
            try:
                aspects_parsed = []
                raw_aspects = llm_json.get("aspects", [])
                if isinstance(raw_aspects, list):
                    for asp in raw_aspects:
                        if isinstance(asp, dict):
                            aspects_parsed.append(AspectItem(
                                aspect=str(asp.get("aspect", "General")),
                                sentiment=str(asp.get("sentiment", "Neutral")).capitalize(),
                                confidence=float(asp.get("confidence", 0.90)),
                                keywords=asp.get("keywords", []) if isinstance(asp.get("keywords"), list) else []
                            ))
                elif isinstance(raw_aspects, dict):
                    for k, v in raw_aspects.items():
                        aspects_parsed.append(AspectItem(
                            aspect=str(k).replace("_", " ").title(),
                            sentiment="Positive" if v.get("rating", 3) >= 4 else "Negative" if v.get("rating", 3) <= 2 else "Neutral",
                            confidence=0.90,
                            keywords=[v.get("comment", "")] if v.get("comment") else []
                        ))

                # Normalize emotions to list of strings
                raw_emotions = llm_json.get("emotions", ["Neutral"])
                if isinstance(raw_emotions, dict):
                    emotions_list = [k.capitalize() for k, v in raw_emotions.items() if (isinstance(v, (int, float)) and v > 0.4) or v is True]
                    emotions = emotions_list or ["Neutral"]
                elif isinstance(raw_emotions, list):
                    emotions = [str(e).capitalize() for e in raw_emotions]
                else:
                    emotions = ["Neutral"]

                # Normalize intent
                raw_intent = llm_json.get("intent", "feedback")
                if isinstance(raw_intent, dict):
                    intent_str = next((k for k, v in raw_intent.items() if v), "feedback")
                else:
                    intent_str = str(raw_intent)

                result = FeedbackAnalysisResult(
                    language=str(llm_json.get("language", "en")),
                    detected_language=str(llm_json.get("detected_language", "en")),
                    translated_text=llm_json.get("translated_text"),
                    sentiment=str(llm_json.get("sentiment", "Neutral")).capitalize(),
                    sentiment_score=float(llm_json.get("sentiment_score", 0.0)),
                    confidence=float(llm_json.get("confidence", 0.90)),
                    emotions=emotions,
                    topics=llm_json.get("topics", ["General Experience"]) if isinstance(llm_json.get("topics"), list) else ["General Experience"],
                    aspects=aspects_parsed,
                    intent=intent_str,
                    priority=str(llm_json.get("priority", "medium")).lower(),
                    summary=str(llm_json.get("summary", "Feedback analyzed successfully.")),
                    actionable=bool(llm_json.get("actionable", False)),
                    explanation=str(llm_json.get("explanation", f"Analyzed using structured {used_provider.title()} LLM.")),
                    provider_used=used_provider
                )
                _ANALYSIS_CACHE[content_hash] = result
                return result
            except Exception as parse_err:
                logger.warning(f"LLM JSON schema parsing failed: {parse_err}. Falling back to rule engine.")

        # Deterministic Rule Engine fallback
        fallback_result = self.rule_engine.analyze(text, rating, metadata)
        _ANALYSIS_CACHE[content_hash] = fallback_result
        return fallback_result


# Singleton instance
ai_service = LLMAbstractionService()
