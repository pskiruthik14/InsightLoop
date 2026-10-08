"""
Root Cause Analysis (RCA) Agent: Diagnoses systemic failure points from negative feedback patterns.
"""
from typing import List, Dict
from collections import defaultdict
from backend.models import AnalyzedFeedback, RootCauseItem

class RootCauseAnalysisAgent:
    def __init__(self):
        pass

    def diagnose_failures(self, feedback_list: List[AnalyzedFeedback]) -> List[RootCauseItem]:
        """Groups negative sentiments by operational aspect and extracts root cause patterns."""
        negative_feedback = [f for f in feedback_list if f.overall_sentiment == "Negative" or f.urgency_level in ["High", "Critical"]]

        if not negative_feedback:
            return []

        # Cluster by aspect
        aspect_clusters = defaultdict(list)
        for fb in negative_feedback:
            for asp in fb.aspects:
                if asp.sentiment == "Negative":
                    aspect_clusters[asp.aspect].append(fb)
            if not any(asp.sentiment == "Negative" for asp in fb.aspects):
                aspect_clusters["General Operations"].append(fb)

        rca_results: List[RootCauseItem] = []

        # Standard MSME operational diagnosis patterns
        rca_heuristics = {
            "Delivery & Logistics": {
                "issue": "Inconsistent delivery timelines during peak hours and weekend demand surges",
                "factors": ["Lack of real-time courier tracking", "Packaging delays during rush hours", "Subcontracted delivery partner bottlenecks"]
            },
            "Packaging & Presentation": {
                "issue": "Inadequate packaging seal causing spillage, thermal loss, or transit damage",
                "factors": ["Use of non-reinforced food containers", "Absence of tamper-evident seal stickers", "Substandard bubble-wrap in transit"]
            },
            "Customer Service": {
                "issue": "Delayed dispute resolution and defensive communication from frontline staff",
                "factors": ["Lack of standardized SOP for customer complaints", "No empowerment of store staff to issue instant replacements", "Shift handover miscommunications"]
            },
            "Pricing & Value": {
                "issue": "Perceived mismatch between portion size/materials and retail pricing",
                "factors": ["Recent price revision without communicating value/ingredient upgrades", "Competitor undercut on basic combos", "Hidden add-on charges or taxes"]
            },
            "Product Quality": {
                "issue": "Batch-to-batch inconsistency in freshness or product durability",
                "factors": ["Variation in raw material sourcing suppliers", "Temperature fluctuation during storage/baking", "Inadequate quality inspection prior to dispatch"]
            },
            "Hygiene & Store Ambiance": {
                "issue": "Hygiene lapses and slow table turnover during peak store hours",
                "factors": ["Staff stretched thin between counter orders and online deliveries", "Irregular sanitation checklist execution", "Acoustic or temperature discomfort"]
            },
            "General Operations": {
                "issue": "Communication breakdown between order acceptance and fulfillment",
                "factors": ["Over-reliance on manual paper logs", "Delayed response to online queries"]
            }
        }

        for aspect, items in aspect_clusters.items():
            count = len(items)
            if count == 0:
                continue

            heuristic = rca_heuristics.get(aspect, rca_heuristics["General Operations"])
            
            # Severity calculation
            critical_hits = sum(1 for it in items if it.urgency_level == "Critical")
            if critical_hits > 0 or count >= 5:
                severity = "Critical"
            elif count >= 3:
                severity = "High"
            else:
                severity = "Medium"

            # Extract top 2-3 genuine quotes as evidence
            quotes = [f'"{it.text[:120]}..."' if len(it.text) > 120 else f'"{it.text}"' for it in items[:3]]

            rca_results.append(RootCauseItem(
                category=aspect,
                issue=heuristic["issue"],
                frequency_count=count,
                severity=severity,
                affected_aspect=aspect,
                evidence_quotes=quotes,
                contributing_factors=heuristic["factors"]
            ))

        # Sort by severity and frequency
        severity_order = {"Critical": 3, "High": 2, "Medium": 1, "Low": 0}
        rca_results.sort(key=lambda x: (severity_order.get(x.severity, 0), x.frequency_count), reverse=True)

        return rca_results
