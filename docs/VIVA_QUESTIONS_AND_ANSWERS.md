# SentientMSME: S5 Mini Project Viva Voce Preparation Guide

**Domain:** Generative AI & AI Agents  
**Project:** LLM-Based Customer Feedback Aggregation and Sentiment Intelligence for MSME  

---

### Q1: What is the core problem your project addresses?
**Answer:** MSMEs (Micro, Small, and Medium Enterprises) receive customer feedback scattered across various platforms (Google Reviews, Amazon, WhatsApp, Swiggy, In-Store). Unlike large enterprises, MSMEs lack the financial budget for expensive tools like Qualtrics or Sprinklr and cannot hire data analysts. Our system provides automated multi-source aggregation, Aspect-Based Sentiment Analysis (ABSA), Root Cause Analysis (RCA), low-budget action planning, and automated review reply drafting in a single unified platform.

---

### Q2: What is Aspect-Based Sentiment Analysis (ABSA), and how is it different from traditional sentiment analysis?
**Answer:** Traditional sentiment analysis classifies an entire review into a single polarity: Positive, Negative, or Neutral. However, real customer feedback is multi-faceted. For example:
> *"The sourdough bread was delicious, but delivery was 45 minutes late and the box was crushed."*

A traditional classifier would likely label this as Neutral or Negative. **ABSA decomposes the sentence into distinct operational aspects**:
- **Product Quality**: *Positive* (delicious sourdough)
- **Delivery & Logistics**: *Negative* (45 mins late)
- **Packaging**: *Negative* (crushed box)

This gives business owners precise, actionable insight into exactly which department needs improvement.

---

### Q3: What are the 6 core operational aspects monitored by SentientMSME?
**Answer:**
1. **Product Quality** (taste, freshness, durability, craftsmanship)
2. **Pricing & Value** (affordability, value for money, cost transparency)
3. **Customer Service** (staff politeness, responsiveness, attitude)
4. **Delivery & Logistics** (delivery speed, transit time, tracking)
5. **Packaging & Presentation** (spillage, box condition, aesthetics, tamper protection)
6. **Hygiene & Store Ambiance** (cleanliness, music, noise, seating, restrooms)

---

### Q4: Explain the Multi-Agent Architecture of your project.
**Answer:** The system is organized into 5 cooperating autonomous agents:
1. **Aggregator Agent**: Cleanses, standardizes, deduplicates, and filters spam/noise across heterogeneous channels.
2. **Sentiment & ABSA Agent**: Decomposes text into aspects, detects emotion, and calculates Net Sentiment Score (NSS).
3. **Root Cause Analysis (RCA) Agent**: Clusters negative signals by operational facet to diagnose systemic failure modes.
4. **MSME Action Planner Agent**: Formulates low-budget/zero-cost prioritized tactical intervention roadmaps.
5. **Empathetic Response Agent**: Drafts tone-adaptive customer replies (Empathetic, Professional, Enthusiastic, Promotional).

---

### Q5: How is the Net Sentiment Score (NSS) calculated?
**Answer:** Net Sentiment Score (NSS) measures customer advocacy similar to Net Promoter Score (NPS):
$$\text{NSS} = \left(\frac{\text{Total Positive Reviews} - \text{Total Negative Reviews}}{\text{Total Ingested Reviews}}\right) \times 100$$
- Ranges from **-100%** (100% negative reviews) to **+100%** (100% positive reviews).
- An NSS above +20 indicates healthy customer advocacy, while negative NSS indicates churn risk.

---

### Q6: How does the system handle linguistic negation (e.g., "not good", "never fresh")?
**Answer:** Our sentiment agent incorporates a negation detection window. When a negation word (*not, never, didn't, wasn't, barely, without*) appears preceding a positive word (e.g., *"not fresh"*), the polarity is inverted to Negative rather than counted as positive.

---

### Q7: How does your system detect "Critical Urgency" or high churn risk?
**Answer:** The system runs a real-time risk filter against critical alert keywords associated with severe brand damage or liability:
- *Hygiene violations*: hair, insect, cockroach, food poisoning, sick, ill.
- *Legal/financial threats*: fraud, scam, cheat, double charged, refund refused, police, sue.
- *Severe ratings*: 1-star reviews with intense emotional expressions.
When detected, the review is badged as **Critical Urgency** with an immediate apology action trigger.

---

### Q8: What LLM models and APIs does the system support?
**Answer:**
- **Google Gemini API** (`gemini-1.5-flash` / `gemini-2.5-flash` via REST endpoint).
- **OpenAI API** (`gpt-4o-mini`).
- **Autonomous Hybrid Fallback Engine**: If no API key is provided or when running offline without internet, the system utilizes high-fidelity heuristic semantic reasoning templates so that demonstrations never fail.

---

### Q9: Why did you choose FastAPI over Flask or Django for the backend?
**Answer:**
1. **Asynchronous Performance**: Built on ASGI (Starlette) and Uvicorn, enabling fast concurrent handling of LLM requests.
2. **Native Pydantic Validation**: Automatic schema validation, serialization, and typing.
3. **Auto-Generated Swagger Docs**: Interactive API documentation available out-of-the-box at `/docs`.
4. **Lightweight & Modular**: High performance without the heavy database overhead of Django.

---

### Q10: How does the Root Cause Analysis (RCA) Agent work?
**Answer:**
1. Filters all reviews where sentiment is Negative or urgency is High/Critical.
2. Clusters complaints into affected operational aspects.
3. Applies heuristic cause-and-effect mappings (e.g., late deliveries during weekend peaks $\rightarrow$ dispatch buffer bottleneck).
4. Extracts direct verbatim customer quotes as evidence for management review.

---

### Q11: What are the low-cost action plans generated for MSMEs?
**Answer:** MSMEs cannot afford $50,000 ERP overhauls. Our Action Planner generates interventions tailored to small budgets:
- *Zero-Cost Actions*: Shift handover checklist, frontline apology SOP empowering staff to offer a free brownie or 20% discount on spot.
- *Low-Cost Actions (< ₹2,500 / $30)*: Tamper-evident stickers, double-groove snap containers to prevent liquid spillage, table QR stands for Google Reviews.

---

### Q12: How does the Review Response Generator personalize replies?
**Answer:** It uses the customer's name, star rating, detected aspects, and chosen tone:
- **Empathetic**: Validates frustration, offers an apology, and provides store manager escalation.
- **Professional**: Courteous, states that an internal review has started.
- **Enthusiastic**: Celebrates positive feedback warmly with community appreciation.
- **Promotional**: Expresses gratitude and offers a discount promo code (`VIPFRIEND10`) to drive repeat visits.

---

### Q13: How can a user import their own data into the application?
**Answer:**
1. Via the **Upload & Datasets** tab by uploading any CSV or Excel file containing columns for review text, rating, and platform.
2. Via the **Live Analysis Sandbox** by typing or pasting any single review text to watch the multi-agent pipeline execute live.

---

### Q14: What design principles were used for the web frontend?
**Answer:**
- Built using **pure Vanilla CSS and JavaScript** for maximum control and zero bloat.
- **Modern Glassmorphism UI** with dark mode obsidian background (`#0A0E17`), subtle translucent borders, and neon violet/cyan gradients.
- Typography with Google Fonts (`Plus Jakarta Sans` and `JetBrains Mono`).
- Print-friendly CSS styles enabling one-click **Executive PDF / Audit Report export**.

---

### Q15: What are the future enhancements planned for this project?
**Answer:**
1. Support for Indic regional languages (Tamil, Hindi, Telugu, Kannada) using IndicBERT.
2. Direct integration with WhatsApp Cloud API to automatically message customers who had a bad experience with apology vouchers.
3. Voice-to-text feedback kiosks for in-store tablet counters.
