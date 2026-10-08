"""
Action Planner Agent: Formulates low-budget, high-ROI tactical solutions for MSME owners.
"""
from typing import List
from backend.models import RootCauseItem, ActionRecommendation, SentimentDigest

class MSMEActionPlannerAgent:
    def __init__(self):
        # Catalog of pragmatic, resource-conscious interventions for small businesses
        self.action_catalogs = {
            "Delivery & Logistics": {
                "title": "Dispatch Buffer & Peak-Hour Delivery Partner SOP",
                "desc": "Establish a 15-minute preparation buffer during 12-2 PM & 7-9 PM peak windows, and introduce instant WhatsApp automated tracking notifications.",
                "cost": "Zero Cost",
                "impact": "High",
                "priority": "Immediate (24-48h)",
                "steps": [
                    "Audit current order-to-dispatch transit times across delivery slots",
                    "Configure delivery aggregator radius down to 4km during peak rainfall/rush hours",
                    "Train kitchen/dispatch staff on prep-time status updates before handing to riders"
                ]
            },
            "Packaging & Presentation": {
                "title": "Leak-Proof Container Upgrade & Branded Tamper Seals",
                "desc": "Switch liquid and hot items to food-grade snap-lock polypropylene containers sealed with low-cost paper tamper stickers.",
                "cost": "Low (< ₹2,500 / $30)",
                "impact": "High",
                "priority": "Immediate (24-48h)",
                "steps": [
                    "Procure 500 units of double-groove spill-resistant containers",
                    "Design custom adhesive sticker thanking customer and stating 'Packed with Care'",
                    "Perform inverted leak test on warm soup/curry/dressings before customer dispatch"
                ]
            },
            "Customer Service": {
                "title": "Frontline Service Protocol & Instant Apology Voucher SOP",
                "desc": "Empower front-of-house staff to offer an immediate 20% apology token or complimentary dessert/item without manager approval whenever an issue arises.",
                "cost": "Zero Cost",
                "impact": "Transformational",
                "priority": "Immediate (24-48h)",
                "steps": [
                    "Conduct a 30-minute team alignment on the 'Listen, Empathize, Resolve' rule",
                    "Print standard apology voucher cards for staff to hand out immediately",
                    "Designate a dedicated WhatsApp helpline number prominently on invoices"
                ]
            },
            "Pricing & Value": {
                "title": "Value Combo Bundles & Transparent Quality Storytelling",
                "desc": "Introduce curated value-bundle offerings and display table cards/social posts explaining premium artisan ingredient sourcing.",
                "cost": "Zero Cost",
                "impact": "Medium",
                "priority": "Medium-Term (1-2w)",
                "steps": [
                    "Package high-margin side items with core bestsellers as 'Value Meal Combos'",
                    "Add transparent origin tags (e.g. '100% Organic Butter / Pure Linen')",
                    "Launch weekday lunch/off-peak loyalty card (Buy 5 Get 6th Free)"
                ]
            },
            "Product Quality": {
                "title": "Batch Quality Checkpoints & Ingredient Supplier Verification",
                "desc": "Institute a two-point morning kitchen/workshop checklist to inspect ingredient freshness, consistency, and standard weights before production.",
                "cost": "Zero Cost",
                "impact": "Transformational",
                "priority": "Immediate (24-48h)",
                "steps": [
                    "Create a 1-page laminated morning prep quality checklist",
                    "Designate Head Chef / Senior Artisan as mandatory sign-off authority",
                    "Review raw material freshness with primary local suppliers"
                ]
            },
            "Hygiene & Store Ambiance": {
                "title": "Hourly Restroom & Dining Sanitation Visual Log",
                "desc": "Implement an hourly cleaning rotation log visible to customers and curate an acoustic playlist suited to the store's vibe.",
                "cost": "Zero Cost",
                "impact": "High",
                "priority": "Immediate (24-48h)",
                "steps": [
                    "Affix hourly check sheet behind restroom doors and counter area",
                    "Set ambient background playlist at balanced 55-60 dB volume",
                    "Ensure tables are cleared and wiped with food-grade sanitizing spray within 90 seconds"
                ]
            }
        }

    def generate_recommendations(self, rca_items: List[RootCauseItem]) -> List[ActionRecommendation]:
        """Translates root causes into prioritized, actionable interventions."""
        actions: List[ActionRecommendation] = []
        action_id_counter = 1

        for rca in rca_items:
            category = rca.affected_aspect
            catalog = self.action_catalogs.get(category)
            if catalog:
                actions.append(ActionRecommendation(
                    id=f"ACT-00{action_id_counter}",
                    title=catalog["title"],
                    description=catalog["desc"],
                    category=category,
                    priority=catalog["priority"],
                    estimated_cost=catalog["cost"],
                    expected_impact=catalog["impact"],
                    implementation_steps=catalog["steps"]
                ))
                action_id_counter += 1

        # Fallback if no negative root causes found (Proactive Growth Actions)
        if not actions:
            actions.append(ActionRecommendation(
                id="ACT-GROWTH-01",
                title="Google My Business & Local SEO Review Acceleration Campaign",
                description="Your customer sentiment is outstanding! Leverage this momentum with QR-code table flyers inviting satisfied customers to leave a 5-star Google review.",
                category="Brand Growth & Marketing",
                priority="Medium-Term (1-2w)",
                estimated_cost="Low (< ₹1,000 / $12)",
                expected_impact="High",
                implementation_steps=[
                    "Generate a direct Google Review shortened QR code link",
                    "Print acrylic counter stands with 'Loved your experience? Tell the neighborhood!'",
                    "Reward staff member who receives the most positive customer mentions monthly"
                ]
            ))
            actions.append(ActionRecommendation(
                id="ACT-GROWTH-02",
                title="VIP Customer Loyalty & Word-of-Mouth Referral Program",
                description="Turn delighted patrons into brand ambassadors with an exclusive preview club for new menu/product launches.",
                category="Customer Retention",
                priority="Strategic (1m+)",
                estimated_cost="Zero Cost",
                expected_impact="Transformational",
                implementation_steps=[
                    "Collect WhatsApp opt-ins for exclusive seasonal tasting sessions",
                    "Offer 15% birthday/anniversary personalized celebratory discounts"
                ]
            ))

        return actions
