"""
Response Generator Agent: Context-aware, tone-adaptive AI reply drafting for MSME owners.
"""
from typing import Optional, List
from backend.models import ReviewResponseRequest
from backend.agents.llm_orchestrator import orchestrator

class ReviewResponseAgent:
    def __init__(self):
        pass

    async def generate_response(self, req: ReviewResponseRequest) -> str:
        """Generates an intelligent, ready-to-post response for Google Reviews, Amazon, or WhatsApp."""
        customer_name = req.customer_name or "Valued Customer"
        business_name = req.business_name or "Our Store"
        sentiment = req.sentiment
        aspects_str = ", ".join(req.aspects) if req.aspects else "your experience"
        
        # Build prompt for LLM
        prompt = (
            f"You are the owner of '{business_name}', a passionate local MSME business.\n"
            f"Customer Review from {customer_name} ({req.rating} stars, Sentiment: {sentiment}):\n"
            f"\"{req.review_text}\"\n"
            f"Aspects involved: {aspects_str}\n"
            f"Selected Tone: {req.tone}.\n"
            f"Draft a warm, authentic, concise response (2-4 sentences). Do NOT sound like an emotionless corporate robot. "
            f"Show genuine care. If negative, apologize sincerely and offer a direct resolution. If positive, express gratitude warmly."
        )

        system_prompt = (
            "You are an empathetic, world-class small business owner and customer relationship expert. "
            "Write authentic, human responses to customer reviews."
        )

        llm_reply = await orchestrator.generate(prompt, system_prompt, context_type="response")
        
        # If LLM returned generic fallback or was empty, use our high-fidelity contextual templates
        if not llm_reply or "Autonomous intelligence output" in llm_reply:
            return self._build_contextual_response(req)

        return llm_reply.strip().strip('"')

    def _build_contextual_response(self, req: ReviewResponseRequest) -> str:
        """High-grade contextual generator for instant offline execution."""
        name = req.customer_name if req.customer_name and req.customer_name != "Anonymous Customer" else "there"
        business = req.business_name or "our team"
        sentiment = req.sentiment.lower()
        tone = req.tone.lower()

        if "neg" in sentiment:
            if tone == "empathetic":
                return (
                    f"Hi {name}, thank you for taking the time to share your honest feedback with us. "
                    f"We are genuinely sorry to hear that your experience fell short of the high standards we strive for every day. "
                    f"Your feedback regarding your order has been immediately shared with our leadership team. "
                    f"We would love the opportunity to make this right—please reach out to us directly at our store manager's desk so we can personally assist you."
                )
            elif tone == "promotional":
                return (
                    f"Hello {name}, we sincerely apologize that we did not meet your expectations on this occasion. "
                    f"We take full accountability and are actively addressing the issues you mentioned. "
                    f"We would love to welcome you back to show you our true standards—please present promo code 'MAKEITRIGHT15' on your next visit for 15% off your entire order."
                )
            else: # professional
                return (
                    f"Dear {name}, thank you for bringing this matter to our attention. "
                    f"At {business}, customer satisfaction and quality are our foremost priorities, and we regret that your experience did not reflect this. "
                    f"We have initiated an internal review of the points you raised and are implementing corrective measures to ensure this is not repeated."
                )
        elif "pos" in sentiment:
            if tone == "enthusiastic":
                return (
                    f"Hi {name}! Wow, your wonderful review just made our entire team's day! 🎉 "
                    f"We take tremendous pride in crafting the best possible experience for our community, and knowing you enjoyed it means the world to us. "
                    f"We can't wait to welcome you back again very soon!"
                )
            elif tone == "promotional":
                return (
                    f"Thank you so much for the glowing review, {name}! We are thrilled that you had such a memorable experience with us. "
                    f"As a small token of our appreciation, please use code 'VIPFRIEND10' for 10% off your next visit. See you soon!"
                )
            else: # professional
                return (
                    f"Dear {name}, thank you for your generous feedback and support for {business}. "
                    f"Our team is dedicated to delivering excellent quality and service, and we truly appreciate your patronage. We look forward to serving you again."
                )
        else: # Neutral
            return (
                f"Hello {name}, thank you for sharing your thoughts with us. "
                f"We appreciate your balanced feedback and are always looking for ways to elevate our quality and service. "
                f"If there's anything specific we can improve for your next visit, please feel free to drop us a note anytime!"
            )
