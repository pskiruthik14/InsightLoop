"""
Sentiment Agent: Aspect-Based Sentiment Analysis (ABSA), Emotion, and Urgency Classification.
Combines contextual linguistic heuristics with LLM intelligence.
"""
import re
from typing import List, Dict, Tuple
from backend.models import FeedbackItem, AnalyzedFeedback, AspectSentiment
from backend.config import ASPECT_CATEGORIES, CRITICAL_ALERT_KEYWORDS

class SentimentIntelligenceAgent:
    def __init__(self):
        # Lexicon for aspect detection
        self.aspect_keywords = {
            "Product Quality": [
                "quality", "taste", "delicious", "fresh", "stale", "material", "durability",
                "fabric", "flavor", "authentic", "broken", "defective", "recipe", "craftsmanship",
                "ingredients", "texture", "smell", "fit", "size", "stitching", "finish"
            ],
            "Pricing & Value": [
                "price", "expensive", "cheap", "cost", "value", "worth", "overpriced",
                "affordable", "rip-off", "pocket-friendly", "discount", "offer", "deal", "bill", "rates"
            ],
            "Customer Service": [
                "staff", "service", "waiter", "manager", "polite", "rude", "behaviour",
                "helpful", "courteous", "attitude", "friendly", "response", "unprofessional", "care", "support"
            ],
            "Delivery & Logistics": [
                "delivery", "shipping", "courier", "late", "delay", "on time", "fast",
                "quick", "tracking", "arrived", "transit", "rider", "dispatch", "order time"
            ],
            "Packaging & Presentation": [
                "packaging", "box", "wrap", "spill", "leak", "presentation", "aesthetic",
                "packed", "container", "seal", "damage", "tampered"
            ],
            "Hygiene & Store Ambiance": [
                "clean", "dirty", "hygiene", "ambiance", "music", "decor", "vibe",
                "atmosphere", "table", "washroom", "hair", "insect", "pest", "cozy", "smell"
            ]
        }

        # Polarity modifiers
        self.positive_words = {
            "good", "great", "excellent", "amazing", "wonderful", "love", "loved", "best",
            "fresh", "delicious", "superb", "fast", "courteous", "perfect", "fantastic",
            "happy", "impressed", "worth", "friendly", "polite", "recommend", "neat", "tasty",
            "flawless", "prompt", "top-notch", "fabulous", "awesome"
        }

        self.negative_words = {
            "bad", "terrible", "worst", "horrible", "stale", "slow", "delay", "rude",
            "expensive", "overpriced", "poor", "broken", "dirty", "hate", "disappointed",
            "disappointment", "waste", "useless", "unacceptable", "cold", "salty", "leaked",
            "cheated", "fraud", "unresponsive", "pathetic", "awful", "regret"
        }

        self.negation_words = {"not", "never", "no", "hardly", "barely", "scarcely", "without", "didn't", "wasn't", "isn't"}

    def _detect_urgency(self, text: str, rating: float, sentiment: str) -> Tuple[str, str]:
        """Classifies urgency (Low, Medium, High, Critical) and dominant emotion."""
        text_lower = text.lower()

        # Critical check
        for kw in CRITICAL_ALERT_KEYWORDS:
            if kw in text_lower:
                return "Critical", "Anger"

        if rating is not None and rating <= 1.0:
            return "High", "Frustration"

        if sentiment == "Negative":
            if any(w in text_lower for w in ["angry", "furious", "unacceptable", "scam", "regret"]):
                return "High", "Anger"
            return "Medium", "Disappointment"

        if sentiment == "Positive":
            if any(w in text_lower for w in ["love", "best", "delighted", "superb", "wow"]):
                return "Low", "Delight"
            return "Low", "Gratitude"

        return "Low", "Neutral"

    def _extract_aspects(self, text: str) -> List[AspectSentiment]:
        """Performs ABSA by finding mentions of aspect terms and nearby sentiment words."""
        text_lower = text.lower()
        sentences = re.split(r'[,.!?;\n]+', text_lower)
        aspect_results: Dict[str, Dict] = {}

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            words = sentence.split()
            # Check negation
            has_negation = any(neg in words for neg in self.negation_words)

            pos_hits = sum(1 for w in words if w in self.positive_words)
            neg_hits = sum(1 for w in words if w in self.negative_words)

            for aspect, kws in self.aspect_keywords.items():
                found_kws = [kw for kw in kws if kw in sentence]
                if found_kws:
                    if aspect not in aspect_results:
                        aspect_results[aspect] = {
                            "pos": 0, "neg": 0, "neu": 0, "keywords": set()
                        }
                    aspect_results[aspect]["keywords"].update(found_kws)

                    if has_negation:
                        # Invert sentiment
                        aspect_results[aspect]["neg"] += pos_hits
                        aspect_results[aspect]["pos"] += neg_hits
                    else:
                        aspect_results[aspect]["pos"] += pos_hits
                        aspect_results[aspect]["neg"] += neg_hits

        output = []
        for aspect, data in aspect_results.items():
            pos = data["pos"]
            neg = data["neg"]
            if pos > neg:
                sent = "Positive"
                conf = min(0.95, 0.6 + (pos * 0.1))
            elif neg > pos:
                sent = "Negative"
                conf = min(0.95, 0.6 + (neg * 0.1))
            else:
                sent = "Neutral"
                conf = 0.55

            output.append(AspectSentiment(
                aspect=aspect,
                sentiment=sent,
                confidence=round(conf, 2),
                keywords=list(data["keywords"])[:3]
            ))

        return output

    def analyze_item(self, item: FeedbackItem) -> AnalyzedFeedback:
        """Analyzes a single feedback item and produces full sentiment intelligence."""
        text = item.text
        text_lower = text.lower()

        # Word-level score
        words = re.findall(r'\b\w+\b', text_lower)
        pos_count = sum(1 for w in words if w in self.positive_words)
        neg_count = sum(1 for w in words if w in self.negative_words)

        # Rating override/adjustment
        rating_score = 0.0
        if item.rating is not None:
            # Map 1-5 to -1.0 to +1.0
            rating_score = (item.rating - 3.0) / 2.0

        raw_score = 0.0
        total_hits = pos_count + neg_count
        if total_hits > 0:
            text_score = (pos_count - neg_count) / max(total_hits, 1)
        else:
            text_score = 0.0

        if item.rating is not None:
            final_score = (text_score * 0.6) + (rating_score * 0.4)
        else:
            final_score = text_score

        # Bound between -1.0 and 1.0
        final_score = max(-1.0, min(1.0, round(final_score, 2)))

        if final_score > 0.15:
            overall_sentiment = "Positive"
        elif final_score < -0.15:
            overall_sentiment = "Negative"
        else:
            overall_sentiment = "Neutral"

        # Aspect extraction
        aspects = self._extract_aspects(text)

        # If no specific aspect was triggered, assign primary general aspect
        if not aspects:
            aspects.append(AspectSentiment(
                aspect="Product Quality",
                sentiment=overall_sentiment,
                confidence=0.7,
                keywords=["general feedback"]
            ))

        # Urgency & Emotion
        urgency, emotion = self._detect_urgency(text, item.rating, overall_sentiment)

        # Key themes extraction
        themes = []
        for asp in aspects:
            themes.append(f"{asp.aspect} ({asp.sentiment})")

        return AnalyzedFeedback(
            id=item.id,
            source=item.source,
            customer_name=item.customer_name or "Customer",
            rating=item.rating,
            text=item.text,
            timestamp=item.timestamp or "",
            overall_sentiment=overall_sentiment,
            sentiment_score=final_score,
            urgency_level=urgency,
            emotion=emotion,
            aspects=aspects,
            key_themes=themes
        )

    def batch_analyze(self, items: List[FeedbackItem]) -> List[AnalyzedFeedback]:
        """Analyzes a batch of feedback items."""
        return [self.analyze_item(item) for item in items]
