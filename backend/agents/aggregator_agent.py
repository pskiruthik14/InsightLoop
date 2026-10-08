"""
Aggregator Agent: Multi-channel customer feedback ingestion, normalization, and noise reduction.
"""
import uuid
import re
from datetime import datetime
from typing import List, Dict, Any, Union
import pandas as pd
from backend.models import FeedbackItem

class FeedbackAggregatorAgent:
    def __init__(self):
        self.supported_sources = [
            "Google Reviews",
            "Amazon",
            "WhatsApp",
            "In-Store Feedback",
            "Swiggy / Zomato",
            "Social Media (X / IG)",
            "Manual Entry"
        ]

    def clean_text(self, text: str) -> str:
        """Removes excessive whitespace, emojis/control chars if corrupted, and standardizes text."""
        if not text or not isinstance(text, str):
            return ""
        # Remove multiple newlines and spaces
        cleaned = re.sub(r'\s+', ' ', text).strip()
        return cleaned

    def is_spam_or_gibberish(self, text: str) -> bool:
        """Filters out non-substantive text (e.g. '...', 'asdf', single character)."""
        if len(text) < 3:
            return True
        if re.match(r'^[.!?, ]+$', text):
            return True
        return False

    def ingest_single(self, raw_item: Dict[str, Any]) -> FeedbackItem:
        """Normalizes a single feedback object into standard FeedbackItem."""
        feedback_id = raw_item.get("id") or f"FB-{uuid.uuid4().hex[:8].upper()}"
        source = raw_item.get("source") or "Google Reviews"
        name = raw_item.get("customer_name") or "Anonymous Customer"
        rating = raw_item.get("rating")
        if rating is not None:
            try:
                rating = float(rating)
            except (ValueError, TypeError):
                rating = None

        text = self.clean_text(raw_item.get("text", ""))
        timestamp = raw_item.get("timestamp") or datetime.now().strftime("%Y-%m-%d %H:%M")

        return FeedbackItem(
            id=feedback_id,
            source=source,
            customer_name=name,
            rating=rating,
            text=text,
            timestamp=timestamp,
            metadata=raw_item.get("metadata", {})
        )

    def ingest_dataframe(self, df: pd.DataFrame) -> List[FeedbackItem]:
        """Ingests and standardizes a Pandas DataFrame loaded from CSV or Excel."""
        items: List[FeedbackItem] = []
        # Flexible column resolution
        col_map = {}
        for col in df.columns:
            low = col.lower().strip()
            if "review" in low or "text" in low or "feedback" in low or "comment" in low:
                col_map["text"] = col
            elif "rating" in low or "star" in low or "score" in low:
                col_map["rating"] = col
            elif "source" in low or "platform" in low or "channel" in low:
                col_map["source"] = col
            elif "name" in low or "author" in low or "user" in low:
                col_map["customer_name"] = col
            elif "date" in low or "time" in low:
                col_map["timestamp"] = col

        for idx, row in df.iterrows():
            text_val = str(row[col_map["text"]]) if "text" in col_map and pd.notna(row[col_map["text"]]) else ""
            cleaned = self.clean_text(text_val)
            if self.is_spam_or_gibberish(cleaned):
                continue

            rating_val = None
            if "rating" in col_map and pd.notna(row[col_map["rating"]]):
                try:
                    rating_val = float(row[col_map["rating"]])
                except Exception:
                    pass

            source_val = str(row[col_map["source"]]) if "source" in col_map and pd.notna(row[col_map["source"]]) else "CSV Upload"
            name_val = str(row[col_map["customer_name"]]) if "customer_name" in col_map and pd.notna(row[col_map["customer_name"]]) else f"Customer #{idx+1}"
            date_val = str(row[col_map["timestamp"]]) if "timestamp" in col_map and pd.notna(row[col_map["timestamp"]]) else datetime.now().strftime("%Y-%m-%d")

            items.append(FeedbackItem(
                id=f"FB-{uuid.uuid4().hex[:6].upper()}",
                source=source_val,
                customer_name=name_val,
                rating=rating_val,
                text=cleaned,
                timestamp=date_val,
                metadata={"row_index": idx}
            ))

        return items
