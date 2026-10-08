# InsightLoop ⚡
### LLM-Powered Customer Feedback Aggregation and Sentiment Intelligence Platform for MSMEs

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg)](https://tailwindcss.com)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()

---

## 🌟 Overview

**InsightLoop** is an LLM-powered customer feedback aggregation and sentiment intelligence platform engineered specifically for Micro, Small, and Medium Enterprises (MSMEs). 

Small businesses typically receive customer feedback across fragmented channels (Google Reviews, WhatsApp, Email, Website forms, Delivery apps, and in-store logs) but lack dedicated customer experience analysts. InsightLoop unifies these fragmented feeds and automates the transformation:

$$\text{Raw Feedback} \longrightarrow \text{Clean Data} \longrightarrow \text{Sentiment} \longrightarrow \text{Topics} \longrightarrow \text{Emotions} \longrightarrow \text{Problems} \longrightarrow \text{Trends} \longrightarrow \text{Business Actions}$$

---

## 🎯 Key Questions Answered in < 30 Seconds

1. **How are customers feeling?** (Transparent 0–100 Sentiment Health Score with explainable formulas)
2. **What is causing dissatisfaction?** (Recurring issue clusters & root cause analysis with verifiable evidence quotes)
3. **What should the business do next?** (Ranked tactical action plan with estimated cost and expected impact)

---

## 🚀 Core Features & Architectural Modules

### 1. Multi-Channel Feedback Aggregator
- Unified ingestion across **Google Reviews**, **WhatsApp Business**, **Email**, **Website Forms**, **CSV/Excel spreadsheets**, and **In-store POS logs**.
- Intelligent CSV column mapping: auto-resolves synonyms (`review_text`, `comment`, `feedback` $\rightarrow$ `message`).
- Deduplication and content hashing to prevent redundant LLM invocations.

### 2. Aspect-Based Sentiment Analysis (ABSA)
- Deconstructs reviews across 6 core MSME operational pillars:
  - 🥖 *Product Quality*
  - 🚚 *Delivery & Logistics*
  - 🤝 *Customer Service*
  - 💰 *Pricing & Value*
  - 📦 *Packaging & Presentation*
  - 🧼 *Hygiene & Store Ambiance*
- Calculates **Net Sentiment Score (NSS)** = $(\% \text{ Positive} - \% \text{ Negative})$.
- Aspect-level polarity decomposition:
  > *"The food was delicious but delivery took almost an hour."*  
  > $\rightarrow$ Food: **Positive** (95% conf) | Delivery: **Negative** (92% conf)

### 3. Multilingual Normalization
- Native support for **English**, **Tamil**, **Hindi**, and **Tanglish** (e.g., *"Food super ah irundhuchu but delivery romba late"*).
- Detects source dialect, preserves unedited customer text, and produces normalized English translations for reporting.

### 4. Root-Cause Intelligence & Issue Clustering
- Automatically clusters recurring customer friction points with affected locations (Coimbatore, Salem, Erode, Chennai).
- **Evidence-Based Standard**: Explicitly delineates **Observed Empirical Evidence** (direct review counts & verbatim quotes) from **LLM Operational Hypotheses**.

### 5. Tactical Recommendations Engine
- Prioritized action matrix formulated via:
  $$\text{Priority Score} = (\text{Severity} \times 0.35 + \text{Frequency} \times 0.25 + \text{Recency} \times 0.20 + \text{Trend} \times 0.20) \times 100$$
- Includes actionable step-by-step SOPs, affected customer counts, estimated implementation costs, and expected ROI.

### 6. "Ask Your Customer Data" Conversational Analytics
- Evidence-based retrieval layer querying actual SQL database records.
- Eliminates AI hallucinations: every statistic is traceable to verified customer counts and verbatim citations.

### 7. Customer Privacy & PII Masking
- Automated detection and masking for customer emails (`a***@gmail.com`) and phone numbers (`+91 98*** 11***`).
- Configurable directly in Workspace Privacy Settings.

### 8. Enterprise Alert Engine
- Real-time threshold monitoring for negative sentiment surges, complaint volume velocity, and rating drops.
- One-click alert acknowledgment and resolution.

---

## 🏗️ System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               Customer Feedback Feeds                  │
                    │  (Google Reviews, WhatsApp, Swiggy/Zomato, CSV, POS)   │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FastAPI Backend Server                                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌────────────────────────────┐  │
│  │   Authentication & RBAC │  │   Database Aggregations │  │   LLM Abstraction Layer    │  │
│  │   JWT / SQLite Database │  │   COUNT, AVG, GROUP BY  │  │   Gemini / OpenAI / Rules  │  │
│  └─────────────────────────┘  └─────────────────────────┘  └────────────────────────────┘  │
└───────────────────────────────────────────────┬────────────────────────────────────────────┘
                                                │
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                               Vite + React + TypeScript UI                                 │
│   Overview • Feedback Inbox • Sentiment ABSA • Topics & Issues • Customer Voice • Alerts   │
│          Recommendations • Ingestion Sources • Analytics • Reports • Settings              │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏃 Getting Started

### Prerequisites
- **Python 3.10+** (tested on Python 3.13)
- **Node.js 18+** (for frontend development/build)

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Build the Frontend (Pre-built in `frontend/dist`)
```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Launch the Application

#### Option A: Windows Launcher (One-Click)
Double-click `run.bat` or run:
```powershell
.\run.ps1
```

#### Option B: Manual Command
```bash
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

Open your browser at:  
👉 **`http://127.0.0.1:8000`**

---

## ⚡ Demo Credentials

Click **"Explore demo"** on the landing page for instant 1-click access to the pre-seeded demo workspace with **520+ realistic customer reviews** across 5 branches:

- **Email:** `demo@insightloop.io`
- **Password:** `demo123`
- **Business:** *Artisan Kitchen & Cafe* (Restaurant MSME)

---

## 🧪 Running the Full Acceptance Test Suite

InsightLoop includes a comprehensive end-to-end test suite verifying all 28 steps from Section 62 of the Product Prompt:

```bash
python test_full_journey.py
```

Expected output:
```
============================================================
ALL 28 FINAL ACCEPTANCE CRITERIA PASSED WITHOUT ERROR!
============================================================
```

---

## 📦 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new business & owner |
| `POST` | `/api/auth/login` | Authenticate with email & password |
| `POST` | `/api/auth/demo-login` | 1-Click access to pre-populated demo workspace |
| `GET` | `/api/analytics/overview` | Executive KPIs, sentiment score, & operational pillars |
| `GET` | `/api/analytics/sentiment-trend` | Time-series sentiment data (7d, 30d, 90d, 6m) |
| `GET` | `/api/feedback` | Paginated feedback inbox with multi-attribute filtering |
| `POST` | `/api/feedback` | Manual review entry with instant live AI analysis |
| `POST` | `/api/feedback/{id}/reply` | Empathetic/Professional review reply generator |
| `GET` | `/api/issues` | Recurring issue clusters with frequency & trend |
| `GET` | `/api/issues/root-causes` | Root causes distinguishing evidence from hypotheses |
| `GET` | `/api/recommendations` | Priority-ranked tactical action plans |
| `POST` | `/api/ask` | Conversational analytics backed by SQL data |
| `POST` | `/api/import/process` | Batch CSV ingestion and column synonym mapping |
| `POST` | `/api/reports/generate` | Generate executive and operational intelligence digests |

---

## 📄 License
Commercial MSME SaaS License — Built for business owners and customer-experience teams.
