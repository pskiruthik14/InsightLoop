"""
InsightLoop Database Module
SQLite Database with complete relational schema, indexes, and demo data generator.
Designed for MSME Customer Feedback & Sentiment Intelligence.
"""
import sqlite3
import json
import os
import hashlib
import uuid
from datetime import datetime, timedelta
import random
from pathlib import Path
from typing import Dict, Any, List, Optional

DB_PATH = Path(__file__).resolve().parent / "data" / "insightloop.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def hash_password(password: str) -> str:
    salt = "insightloop_salt_2026"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()


def compute_content_hash(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode("utf-8")).hexdigest()


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Businesses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        size TEXT NOT NULL,
        primary_goal TEXT NOT NULL,
        sources_selected TEXT,
        created_at TEXT NOT NULL,
        onboarding_completed INTEGER DEFAULT 1
    );
    """)

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TEXT NOT NULL,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
    """)

    # Feedback table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        customer_name TEXT DEFAULT 'Anonymous Customer',
        customer_email TEXT,
        customer_phone TEXT,
        source TEXT NOT NULL,
        rating REAL,
        message TEXT NOT NULL,
        original_language TEXT DEFAULT 'en',
        detected_language TEXT DEFAULT 'en',
        translated_text TEXT,
        product_name TEXT DEFAULT 'General Store',
        location TEXT DEFAULT 'Headquarters',
        created_at TEXT NOT NULL,
        reviewed INTEGER DEFAULT 0,
        assigned_to TEXT,
        tags TEXT DEFAULT '[]',
        priority TEXT DEFAULT 'medium',
        notes TEXT DEFAULT '',
        archived INTEGER DEFAULT 0,
        content_hash TEXT,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
    """)

    # Feedback Analysis table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback_analysis (
        feedback_id TEXT PRIMARY KEY,
        sentiment TEXT NOT NULL,
        sentiment_score REAL NOT NULL,
        confidence REAL NOT NULL,
        emotions TEXT NOT NULL,
        topics TEXT NOT NULL,
        aspects TEXT NOT NULL,
        intent TEXT NOT NULL,
        priority TEXT NOT NULL,
        summary TEXT NOT NULL,
        actionable INTEGER DEFAULT 1,
        explanation TEXT NOT NULL,
        processed_at TEXT NOT NULL,
        provider_used TEXT DEFAULT 'hybrid',
        content_hash TEXT,
        FOREIGN KEY (feedback_id) REFERENCES feedback (id) ON DELETE CASCADE
    );
    """)

    # Recurring Topics table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        name TEXT NOT NULL,
        feedback_count INTEGER DEFAULT 0,
        positive_count INTEGER DEFAULT 0,
        negative_count INTEGER DEFAULT 0,
        neutral_count INTEGER DEFAULT 0,
        trend_percentage REAL DEFAULT 0.0,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
    """)

    # Issues Clusters table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS issues (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        name TEXT NOT NULL,
        topic TEXT NOT NULL,
        feedback_count INTEGER DEFAULT 0,
        sentiment_negative_pct REAL DEFAULT 0.0,
        trend_percentage REAL DEFAULT 0.0,
        affected_locations TEXT DEFAULT '[]',
        root_cause_summary TEXT,
        severity TEXT DEFAULT 'medium',
        evidence_quotes TEXT DEFAULT '[]',
        confidence REAL DEFAULT 0.85,
        recommended_action TEXT,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
    """)

    # Recommendations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        priority_rank INTEGER DEFAULT 1,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        priority_score REAL DEFAULT 75.0,
        priority_label TEXT DEFAULT 'High',
        severity_factor REAL DEFAULT 0.8,
        frequency_factor REAL DEFAULT 0.7,
        recency_factor REAL DEFAULT 0.9,
        trend_factor REAL DEFAULT 0.85,
        rationale TEXT NOT NULL,
        affected_count INTEGER DEFAULT 0,
        potential_impact TEXT DEFAULT 'High',
        estimated_cost TEXT DEFAULT 'Zero Cost',
        implementation_steps TEXT DEFAULT '[]',
        status TEXT DEFAULT 'open',
        updated_at TEXT NOT NULL,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
    """)

    # Alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        triggered_at TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        metric_value REAL DEFAULT 0.0,
        threshold_value REAL DEFAULT 0.0,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
    """)

    # Feedback Sources table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'connected',
        feedback_count INTEGER DEFAULT 0,
        last_sync_at TEXT,
        health_status TEXT DEFAULT 'healthy',
        config TEXT DEFAULT '{}',
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
    """)

    # Reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        summary TEXT NOT NULL,
        metrics TEXT DEFAULT '{}',
        data_snapshot TEXT DEFAULT '{}',
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
    """)

    # Audit Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
    """)

    # Settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        business_id TEXT PRIMARY KEY,
        mask_pii INTEGER DEFAULT 1,
        ai_provider TEXT DEFAULT 'hybrid',
        alert_sentiment_threshold REAL DEFAULT 25.0,
        alert_volume_growth_threshold REAL DEFAULT 20.0,
        alert_rating_threshold REAL DEFAULT 3.2,
        notification_email TEXT DEFAULT 'owner@artisanroastery.com',
        auto_triage INTEGER DEFAULT 1,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );
    """)

    # Create indexes for fast query performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_feedback_business ON feedback(business_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_feedback_source ON feedback(source);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_analysis_sentiment ON feedback_analysis(sentiment);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_analysis_priority ON feedback_analysis(priority);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_business ON alerts(business_id);")

    conn.commit()
    conn.close()


def seed_business_intelligence_data(
    biz_id: str,
    business_name: Optional[str] = None,
    category: Optional[str] = None,
    force_reseed: bool = False
) -> int:
    """
    Seeds complete, realistic customer feedback intelligence data (520+ records,
    aspects, emotions, recurring topics, operational issue clusters, AI recommendations,
    alerts, and sources) for any business.
    Ensures newly registered or existing businesses have a vibrant, fully populated dashboard.
    """
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Look up business info if not supplied
    cursor.execute("SELECT name, category FROM businesses WHERE id = ?", (biz_id,))
    brow = cursor.fetchone()
    if brow:
        business_name = business_name or brow["name"]
        category = category or brow["category"]
    else:
        business_name = business_name or "Artisan Store"
        category = category or "Retail"
        cursor.execute("""
        INSERT OR REPLACE INTO businesses (id, name, category, size, primary_goal, sources_selected, created_at, onboarding_completed)
        VALUES (?, ?, ?, '10-49 employees', 'Reduce complaints & improve delivery satisfaction', '["Google Reviews", "WhatsApp", "Website", "CSV Upload", "Manual Entry"]', ?, 1)
        """, (biz_id, business_name, category, datetime.now().isoformat()))

    # Check if this business already has sufficient feedback
    cursor.execute("SELECT COUNT(*) as count FROM feedback WHERE business_id = ?", (biz_id,))
    count_row = cursor.fetchone()
    if not force_reseed and count_row and count_row["count"] >= 50:
        conn.close()
        return count_row["count"]

    now_str = datetime.now().isoformat()
    prefix = biz_id.replace("biz-", "").replace("demo-business-", "demo")

    if force_reseed:
        cursor.execute("DELETE FROM feedback_analysis WHERE feedback_id IN (SELECT id FROM feedback WHERE business_id = ?)", (biz_id,))
        cursor.execute("DELETE FROM feedback WHERE business_id = ?", (biz_id,))
        cursor.execute("DELETE FROM topics WHERE business_id = ?", (biz_id,))
        cursor.execute("DELETE FROM issues WHERE business_id = ?", (biz_id,))
        cursor.execute("DELETE FROM recommendations WHERE business_id = ?", (biz_id,))
        cursor.execute("DELETE FROM alerts WHERE business_id = ?", (biz_id,))
        cursor.execute("DELETE FROM reports WHERE business_id = ?", (biz_id,))

    # Seed Settings if missing
    cursor.execute("""
    INSERT OR REPLACE INTO settings (business_id, mask_pii, ai_provider, alert_sentiment_threshold, alert_volume_growth_threshold, alert_rating_threshold, notification_email, auto_triage, updated_at)
    VALUES (?, 1, 'hybrid', 25.0, 20.0, 3.2, 'support@insightloop.io', 1, ?)
    """, (biz_id, now_str))

    # Seed Sources
    sources_data = [
        (f"src-{prefix}-1", biz_id, "google", "Google Reviews", "connected", 342, (datetime.now() - timedelta(minutes=14)).isoformat(), "healthy", "{\"location_id\":\"place_48291\", \"auto_sync\": true}"),
        (f"src-{prefix}-2", biz_id, "whatsapp", "WhatsApp Business", "connected", 118, (datetime.now() - timedelta(minutes=4)).isoformat(), "healthy", "{\"phone_number\":\"+91 94432 10982\", \"webhook_verified\": true}"),
        (f"src-{prefix}-3", biz_id, "email", "Support Email Inbox", "connected", 42, (datetime.now() - timedelta(hours=1)).isoformat(), "healthy", "{\"email\":\"feedback@insightloop.io\"}"),
        (f"src-{prefix}-4", biz_id, "website", "Website Feedback Widget", "connected", 64, (datetime.now() - timedelta(minutes=30)).isoformat(), "healthy", "{\"embed_active\": true}"),
        (f"src-{prefix}-5", biz_id, "csv", "CSV / Excel Ingest", "connected", 80, (datetime.now() - timedelta(days=2)).isoformat(), "healthy", "{\"last_file\":\"q3_pos_export.csv\"}"),
        (f"src-{prefix}-6", biz_id, "manual", "POS & In-Store Manual Log", "connected", 38, (datetime.now() - timedelta(minutes=45)).isoformat(), "healthy", "{\"cashier_entry\": true}"),
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO sources (id, business_id, type, name, status, feedback_count, last_sync_at, health_status, config)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sources_data)

    # 520+ Realistic Seed Feedback Records
    seed_items = generate_realistic_seed_dataset(biz_id)
    for fb, analysis in seed_items:
        cursor.execute("""
        INSERT OR REPLACE INTO feedback (
            id, business_id, customer_name, customer_email, customer_phone, source, rating,
            message, original_language, detected_language, translated_text, product_name,
            location, created_at, reviewed, assigned_to, tags, priority, notes, archived, content_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            fb["id"], fb["business_id"], fb["customer_name"], fb["customer_email"], fb["customer_phone"],
            fb["source"], fb["rating"], fb["message"], fb["original_language"], fb["detected_language"],
            fb["translated_text"], fb["product_name"], fb["location"], fb["created_at"], fb["reviewed"],
            fb["assigned_to"], json.dumps(fb["tags"]), fb["priority"], fb["notes"], fb["archived"], fb["content_hash"]
        ))

        cursor.execute("""
        INSERT OR REPLACE INTO feedback_analysis (
            feedback_id, sentiment, sentiment_score, confidence, emotions, topics, aspects,
            intent, priority, summary, actionable, explanation, processed_at, provider_used, content_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            analysis["feedback_id"], analysis["sentiment"], analysis["sentiment_score"], analysis["confidence"],
            json.dumps(analysis["emotions"]), json.dumps(analysis["topics"]), json.dumps(analysis["aspects"]),
            analysis["intent"], analysis["priority"], analysis["summary"], analysis["actionable"],
            analysis["explanation"], analysis["processed_at"], analysis["provider_used"], analysis["content_hash"]
        ))

    # Seed Recurring Topics
    topics_seed = [
        (f"top-{prefix}-1", biz_id, "Product Quality", 182, 154, 16, 12, 14.5, now_str),
        (f"top-{prefix}-2", biz_id, "Delivery & Logistics", 168, 48, 102, 18, -23.4, now_str),
        (f"top-{prefix}-3", biz_id, "Customer Service", 112, 86, 16, 10, 8.2, now_str),
        (f"top-{prefix}-4", biz_id, "Pricing & Value", 94, 46, 32, 16, -4.1, now_str),
        (f"top-{prefix}-5", biz_id, "Packaging & Presentation", 78, 28, 42, 8, -18.7, now_str),
        (f"top-{prefix}-6", biz_id, "Hygiene & Ambiance", 50, 41, 5, 4, 12.0, now_str)
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO topics (id, business_id, name, feedback_count, positive_count, negative_count, neutral_count, trend_percentage, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, topics_seed)

    # Seed Issues Clusters
    issues_seed = [
        (
            f"iss-{prefix}-1", biz_id, "Late delivery between 7:00 PM – 9:30 PM", "Delivery & Logistics",
            104, 82.5, 28.4, json.dumps(["Coimbatore", "Salem", "Erode"]),
            "Kitchen dispatch bottle-necks during peak evening orders combined with third-party rider delays.",
            "critical", json.dumps([
                "Delivery took over 75 minutes on Saturday evening, food arrived lukewarm.",
                "Order placed at 8 PM, delivered past 9:15 PM. Rider mentioned long queue at kitchen.",
                "Romba late delivery between 8-9 PM, kids were already asleep."
            ]), 0.94, "Deploy 2 additional packing stations between 6:30 PM and 9:30 PM on weekends, and enforce 15-min kitchen prep SLA.", now_str
        ),
        (
            f"iss-{prefix}-2", biz_id, "Beverage cup leakage & flimsy lid seals", "Packaging & Presentation",
            46, 76.1, 19.2, json.dumps(["Coimbatore", "Chennai"]),
            "Paper cup lids lose seal tension when transported on two-wheelers across bumpy roads.",
            "high", json.dumps([
                "Cold brew was half spilled inside the kraft bag. No tamper tape or cup divider.",
                "Hot mocha leaked completely through the paper box. Ruined the almond croissants."
            ]), 0.91, "Switch to heat-sealed film or tamper-proof spill-lock beverage cups for all delivery dispatch.", now_str
        ),
        (
            f"iss-{prefix}-3", biz_id, "UPI double debit & delayed cashier refund", "Customer Service",
            18, 88.9, -12.5, json.dumps(["Coimbatore", "Chennai"]),
            "Network timeout during peak counter rush causes duplicate UPI transactions; staff asks customer to wait 7 banking days instead of on-spot resolution.",
            "high", json.dumps([
                "GPay showed debited twice. Counter staff was rude and asked me to talk to bank.",
                "Payment failed on scanner but debited from my bank. Cashier refused to issue baked goods without second payment."
            ]), 0.92, "Empower counter staff with direct POS reversal protocol within 5 minutes and UPI confirmation webhook display.", now_str
        ),
        (
            f"iss-{prefix}-4", biz_id, "Perceived high pricing on premium items", "Pricing & Value",
            29, 62.0, 5.1, json.dumps(["Erode", "Salem"]),
            "Tier-2 customers compare custom fondant artisan goods directly with standard mass-market bakeries.",
            "medium", json.dumps([
                "₹1400 for 1kg cake is steep for Erode market, though taste was superior.",
                "Price is slightly high for the slice portion size."
            ]), 0.84, "Add transparent ingredient cards highlighting Belgian cocoa and French butter to justify value proposition.", now_str
        )
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO issues (
        id, business_id, name, topic, feedback_count, sentiment_negative_pct,
        trend_percentage, affected_locations, root_cause_summary, severity,
        evidence_quotes, confidence, recommended_action, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, issues_seed)

    # Seed Recommendations
    recs_seed = [
        (
            f"rec-{prefix}-1", biz_id, 1, "Implement Peak-Hour Dispatch Buffer & Packaging Station (7–9 PM)",
            "Deploy dedicated assembly counter and cap delivery radius to 6km during peak evening dinner rush.",
            "Delivery & Logistics", 94.2, "Urgent Priority", 0.92, 0.95, 0.96, 0.94,
            "Urgent priority because 104 customers reported delivery delays in the last 21 days (+28.4% increase). Negatively impacts 82.5% of delivery reviews.",
            104, "High Revenue Retention", "Low (< ₹3,000 / $35)",
            json.dumps([
                "Designate second kitchen bench exclusively for delivery bagging between 18:30 and 21:30.",
                "Stagger kitchen ticket printing so delivery couriers receive 12-minute prep alarms.",
                "Brief front-of-house staff on proactive delay SMS notifications for tickets exceeding 25 mins."
            ]), "open", now_str
        ),
        (
            f"rec-{prefix}-2", biz_id, 2, "Upgrade to Tamper-Proof Spill-Lock Lids for Beverages",
            "Replace generic push lids with food-grade spill-safe sealing tape or heat-lock caps for all cold brew and hot coffees.",
            "Packaging & Presentation", 86.8, "High Priority", 0.84, 0.82, 0.91, 0.90,
            "High priority because 46 customers complained about spilled drinks damaging their food orders. Spills generate the highest 1-star review correlation.",
            46, "Prevents 75% of Damaged Order Refunds", "Low (~₹0.80 per cup)",
            json.dumps([
                "Procure sample batch of tamper-evident adhesive cup seals from local supplier.",
                "Mandate horizontal cup holders in delivery kraft bags instead of loose packing.",
                "Add 'Handle with Care' driver caution sticker to courier bags."
            ]), "open", now_str
        ),
        (
            f"rec-{prefix}-3", biz_id, 3, "Implement Cashier Immediate UPI Dispute Resolution SOP",
            "Provide counter staff with immediate POS double-charge verification tablet to refund or honor duplicate scans instantly.",
            "Customer Service", 78.5, "Medium Priority", 0.88, 0.65, 0.85, 0.75,
            "High severity because duplicate charges trigger severe customer frustration and allegations of cheating, threatening brand trust.",
            18, "Protects Brand Trust & Prevents Chargebacks", "Zero Cost",
            json.dumps([
                "Install merchant soundbox or instant UPI receipt screen facing counter.",
                "Train cashiers to issue a temporary dispute token rather than turning away customers.",
                "Create WhatsApp manager escalation helpline for instant payment clearance."
            ]), "in_progress", now_str
        ),
        (
            f"rec-{prefix}-4", biz_id, 4, "Introduce Value Story Cards for Premium Baked Goods",
            "Display small tasting cards highlighting imported French butter, organic sourdough starter, and 36-hour slow fermentation.",
            "Pricing & Value", 62.4, "Medium Priority", 0.60, 0.70, 0.65, 0.55,
            "Addresses pricing friction by educating customers on premium craftsmanship, especially in Salem and Erode locations.",
            29, "Reduces Price Hesitancy & Boosts Upsells", "Low (< ₹1,500)",
            json.dumps([
                "Print counter tent cards explaining the 36-hour sourdough fermentation process.",
                "Introduce combo pairings (e.g. Croissant + Coffee saver bundle during morning hours)."
            ]), "open", now_str
        )
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO recommendations (
        id, business_id, priority_rank, title, description, category,
        priority_score, priority_label, severity_factor, frequency_factor,
        recency_factor, trend_factor, rationale, affected_count, potential_impact,
        estimated_cost, implementation_steps, status, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, recs_seed)

    # Seed Alerts
    alerts_seed = [
        (f"alt-{prefix}-1", biz_id, "Delivery delays in Salem surged +32% this weekend", "Late delivery mentions reached 42 entries between Friday and Sunday evening.", "critical", "threshold_breach", (datetime.now() - timedelta(hours=3)).isoformat(), "active", 32.0, 20.0),
        (f"alt-{prefix}-2", biz_id, "Negative sentiment on Packaging crossed alert threshold (28.2%)", "Spilled drink complaints increased by 19% following the new beverage menu launch.", "warning", "sentiment_spike", (datetime.now() - timedelta(hours=14)).isoformat(), "active", 28.2, 25.0),
        (f"alt-{prefix}-3", biz_id, "Positive sentiment on Artisanal Sourdough reached all-time high (94%)", "Over 78 reviews praised taste, crisp crust, and freshness across all locations.", "info", "positive_trend", (datetime.now() - timedelta(days=1)).isoformat(), "acknowledged", 94.0, 85.0),
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO alerts (id, business_id, title, description, severity, alert_type, triggered_at, status, metric_value, threshold_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, alerts_seed)

    # Seed Audit Logs
    audit_seed = [
        (f"aud-{prefix}-1", biz_id, "admin@insightloop.io", "Imported Customer Feedback Dataset", "Successfully imported 524 multi-channel customer reviews", (datetime.now() - timedelta(days=2)).isoformat()),
        (f"aud-{prefix}-2", biz_id, "admin@insightloop.io", "Configured Alert Thresholds", "Updated negative sentiment alert trigger from 30% to 25%", (datetime.now() - timedelta(days=1)).isoformat()),
        (f"aud-{prefix}-3", biz_id, "admin@insightloop.io", "Generated Monthly Intelligence Report", "Exported PDF executive review for current period", (datetime.now() - timedelta(hours=5)).isoformat()),
        (f"aud-{prefix}-4", biz_id, "admin@insightloop.io", "Enabled PII Privacy Masking", "Activated PII masking for customer phone numbers and emails", (datetime.now() - timedelta(hours=2)).isoformat()),
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO audit_logs (id, business_id, user_email, action, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    """, audit_seed)

    conn.commit()
    conn.close()
    return len(seed_items)


def ensure_demo_data():
    """Initializes schema and seeds realistic demo data if not already present."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM businesses WHERE id = 'demo-business-01'")
    row = cursor.fetchone()
    if not row or row["count"] == 0:
        demo_biz_id = "demo-business-01"
        now_str = datetime.now().isoformat()
        cursor.execute("""
        INSERT OR REPLACE INTO businesses (id, name, category, size, primary_goal, sources_selected, created_at, onboarding_completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            demo_biz_id,
            "Artisan Kitchen & Cafe",
            "Restaurant",
            "10-49 employees",
            "Reduce complaints & improve delivery satisfaction",
            json.dumps(["Google Reviews", "WhatsApp", "Website", "CSV Upload", "Manual Entry"]),
            now_str
        ))

        demo_user_id = "demo-user-01"
        pwd_hash = hash_password("demo123")
        cursor.execute("""
        INSERT OR REPLACE INTO users (id, business_id, email, password_hash, full_name, role, created_at)
        VALUES (?, ?, ?, ?, ?, 'owner', ?)
        """, (
            demo_user_id,
            demo_biz_id,
            "demo@insightloop.io",
            pwd_hash,
            "Arunachalam S.",
            now_str
        ))
        conn.commit()
    conn.close()

    seed_business_intelligence_data("demo-business-01", "Artisan Kitchen & Cafe", "Restaurant")


def generate_realistic_seed_dataset(biz_id: str):
    """Generates 520+ distinct, realistic feedback items with aspects and emotions."""
    random.seed(42)  # Deterministic seed

    sources = ["Google Reviews", "WhatsApp", "Swiggy / Zomato", "In-Store Feedback", "Website Forms"]
    source_weights = [0.42, 0.22, 0.18, 0.10, 0.08]

    locations = ["Coimbatore", "Chennai", "Erode", "Salem", "Bangalore"]
    location_weights = [0.35, 0.25, 0.18, 0.14, 0.08]

    products = [
        "Artisanal Sourdough Bread", "Cold Brew Coffee", "Truffle Mushroom Pasta",
        "Almond & Hazelnut Croissant", "Signature Woodfire Pizza", "Belgian Chocolate Brownie",
        "Mango Passion Cheesecake", "South Indian Filter Coffee Blend", "Eggless Walnut Tart"
    ]

    customers = [
        ("Priya Ramanathan", "priya.r@gmail.com", "+91 98430 11234"),
        ("Karthik Subramanian", "karthik.subbu@yahoo.com", "+91 94432 98765"),
        ("Ananya Venkatesh", "ananya.v@outlook.com", "+91 97890 54321"),
        ("Siddharth Menon", "sid.menon@gmail.com", "+91 99401 22334"),
        ("Deepika Chandran", "deepika.c@gmail.com", "+91 98840 77665"),
        ("Vigneshwaran P.", "vicky.p@hotmail.com", "+91 96001 33445"),
        ("Meera Swaminathan", "meera.s@gmail.com", "+91 94440 88990"),
        ("Arun Kumar Natarajan", "arun.kn@gmail.com", "+91 98422 12121"),
        ("Lakshmi Narayanan", "lakshmi.n@gmail.com", "+91 97910 65432"),
        ("Rajesh Kannan", "rajesh.k@gmail.com", "+91 99520 44332"),
        ("Sneha Krishnamoorthy", "sneha.k@gmail.com", "+91 94860 11998"),
        ("Gautham Balaji", "gautham.b@gmail.com", "+91 98408 55443"),
        ("Aishwarya Rajendran", "aish.raj@gmail.com", "+91 97880 22119"),
        ("Manoj Prabhakar", "manoj.p@gmail.com", "+91 99440 66778"),
        ("Divya Sridhar", "divya.sri@gmail.com", "+91 98940 33221"),
        ("Harish Sundaram", "harish.s@gmail.com", "+91 94421 99887"),
        ("Nandhini Prakash", "nandhini.p@gmail.com", "+91 97900 11223"),
        ("Kavitha Murugesan", "kavitha.m@gmail.com", "+91 98410 44556"),
        ("Naveen Raghavan", "naveen.r@gmail.com", "+91 99940 88776"),
        ("Pavithra Selvam", "pavithra.s@gmail.com", "+91 96000 44112")
    ]

    # Authentic review templates categorized by type and sentiment
    positive_templates = [
        ("The {product} was freshly prepared and utterly delicious. Crust had the perfect crunch and aroma was divine!", 5.0, "Product Quality", ["Delight", "Satisfaction"], "Praise"),
        ("Tried the {product} today at the {location} branch. Outstanding taste and super polite hospitality from the staff.", 5.0, "Product Quality", ["Delight", "Gratitude"], "Praise"),
        ("Staff members were remarkably attentive and friendly. They explained the bakery fermentation process patiently.", 5.0, "Customer Service", ["Satisfaction", "Trust"], "Praise"),
        ("Cozy atmosphere, comfortable seating, and wonderful music. Perfect spot to relax with a hot cup of coffee.", 4.5, "Hygiene & Store Ambiance", ["Delight", "Satisfaction"], "Praise"),
        ("Quick takeaway packaging for {product}. Everything arrived intact, fresh and warm. Highly recommend!", 5.0, "Packaging & Presentation", ["Satisfaction", "Trust"], "Praise"),
        ("Consistently great standard for over a year now. The {product} here sets the benchmark in {location}.", 5.0, "Product Quality", ["Trust", "Delight"], "Praise"),
        ("Authentic flavors and generous portions. Definitely worth every rupee spent.", 4.5, "Pricing & Value", ["Satisfaction", "Gratitude"], "Praise"),
        ("Very neat and hygienic kitchen visible from the counter. Staff wearing hairnets and gloves.", 5.0, "Hygiene & Store Ambiance", ["Trust", "Satisfaction"], "Praise"),
    ]

    negative_templates = [
        ("Delivery took almost 75 minutes on Saturday evening! The {product} was cold and soggy when it finally reached.", 1.5, "Delivery & Logistics", ["Frustration", "Disappointment"], "Complaint"),
        ("Order placed around 8 PM arrived past 9:15 PM. Delivery was extremely delayed and rider couldn't find our address.", 2.0, "Delivery & Logistics", ["Frustration", "Anger"], "Complaint"),
        ("Beverage lid wasn't secured properly! The {product} spilled inside the paper bag and ruined the other items.", 1.5, "Packaging & Presentation", ["Frustration", "Disappointment"], "Complaint"),
        ("₹380 for a small portion of {product} feels way too steep compared to other cafes in {location}.", 2.5, "Pricing & Value", ["Disappointment", "Frustration"], "Complaint"),
        ("UPI scanner failed twice and cashier insisted on collecting double payment. Very rude and unhelpful attitude.", 1.0, "Customer Service", ["Anger", "Frustration"], "Complaint"),
        ("Disappointed with the freshness of {product}. Tasted dry and stale, definitely not baked today.", 2.0, "Product Quality", ["Disappointment", "Anger"], "Complaint"),
        ("Extremely cramped and noisy during evening hours in {location}. Waited 25 minutes just to get water.", 2.5, "Hygiene & Store Ambiance", ["Frustration"], "Complaint"),
        ("Packaging was flimsy and completely leaked. Discarded half the coffee before opening.", 1.5, "Packaging & Presentation", ["Anger", "Frustration"], "Complaint"),
    ]

    mixed_templates = [
        ("The {product} was delicious and fresh, but delivery was very slow and took over an hour.", 3.0, "Delivery & Logistics", ["Satisfaction", "Frustration"], "Mixed Feedback"),
        ("Food quality is undeniably top tier, but prices have increased noticeably over the last two months.", 3.5, "Pricing & Value", ["Satisfaction", "Disappointment"], "Feedback"),
        ("Loved the taste of the {product}, however the paper cup packaging leaked slightly in transit.", 3.0, "Packaging & Presentation", ["Satisfaction", "Frustration"], "Feedback"),
        ("Friendly staff and neat ambiance, but service at the billing counter was sluggish.", 3.0, "Customer Service", ["Satisfaction", "Confusion"], "Feedback"),
    ]

    # Multilingual templates (Tanglish, Tamil, Hindi)
    multilingual_templates = [
        # Tanglish
        ("{product} super ah irundhuchu! But delivery romba late, almost 1 hour aachu.", 3.0, "ta-en", "Delivery & Logistics", "Negative", ["Satisfaction", "Frustration"], "The food was super good! But delivery was very late, took almost 1 hour.", "Food super, delivery late"),
        ("Taste semma fresh and tasty! Best bakery in {location}. Staff service also very polite.", 5.0, "ta-en", "Product Quality", "Positive", ["Delight", "Satisfaction"], "Taste was extremely fresh and tasty! Best bakery in town. Staff service also very polite.", "Taste excellent and staff polite"),
        ("Packaging romba worst. Paper bag le coffee leak aagi full ah waste aaiduchu.", 1.5, "ta-en", "Packaging & Presentation", "Negative", ["Frustration", "Anger"], "Packaging was very bad. Coffee leaked in the paper bag and was completely wasted.", "Packaging bad, drink leaked"),
        ("Price konjam jaasthi for this quantity, aana {product} quality nalla irukku.", 3.5, "ta-en", "Pricing & Value", "Neutral", ["Disappointment", "Satisfaction"], "Price is slightly high for this quantity, but the product quality is good.", "Price high, quality good"),
        ("Counter la pay panna UPI cut aaiduchu, aana cashier wait panna solli rude ah pesuraru.", 1.0, "ta-en", "Customer Service", "Negative", ["Anger", "Frustration"], "UPI payment was debited at counter, but cashier made us wait and spoke rudely.", "UPI debited, staff rude"),
        # Hindi
        ("{product} bahut hi lajawab aur fresh tha. {location} mein aisi bakery milna mushkil hai!", 5.0, "hi", "Product Quality", "Positive", ["Delight", "Gratitude"], "The product was extremely delicious and fresh. Hard to find such a bakery in this city!", "Very delicious and fresh"),
        ("Khana accha tha par delivery mein lagbhag ek ghanta lag gaya. Thanda ho gaya tha.", 2.5, "hi", "Delivery & Logistics", "Negative", ["Disappointment", "Frustration"], "Food was good but delivery took almost an hour. It arrived cold.", "Food good, delivery late"),
        ("Staff ka behavior bahut accha tha aur store bhi bilkul saaf suthra hai.", 5.0, "hi", "Customer Service", "Positive", ["Satisfaction", "Trust"], "Staff behavior was very courteous and the store is spotless clean.", "Courteous staff, clean store"),
        ("Packaging bilkul kharab thi, coffee poori bag mein gir gayi.", 1.5, "hi", "Packaging & Presentation", "Negative", ["Anger", "Frustration"], "Packaging was completely defective, coffee spilled all over inside the bag.", "Poor packaging, spilled coffee"),
    ]

    base_date = datetime.now() - timedelta(days=90)
    dataset = []

    # Total 524 records
    prefix = biz_id.replace("biz-", "").replace("demo-business-", "demo")
    for i in range(524):
        fb_id = f"FB-{1000 + i}" if biz_id == "demo-business-01" else f"FB-{prefix}-{1000 + i}"
        source = random.choices(sources, weights=source_weights)[0]
        location = random.choices(locations, weights=location_weights)[0]
        product = random.choice(products)
        customer = random.choice(customers)

        # Distribute dates across last 90 days with more recency
        days_offset = int((i / 524.0) ** 1.3 * 90)
        # Weekday / weekend peak hours
        review_time = base_date + timedelta(days=days_offset, hours=random.randint(9, 22), minutes=random.randint(0, 59))
        time_str = review_time.strftime("%Y-%m-%d %H:%M:%S")

        # Weekend evening correlation for delivery delays
        is_weekend = review_time.weekday() >= 4
        is_evening = 19 <= review_time.hour <= 22

        rand_type = random.random()

        if i < 70:
            # 70 Multilingual samples
            tpl = random.choice(multilingual_templates)
            raw_msg = tpl[0].format(product=product, location=location)
            rating = tpl[1]
            lang = tpl[2]
            topic = tpl[3]
            sentiment = tpl[4]
            emotions = tpl[5]
            translated = tpl[6]
            summary = tpl[7]

            sent_score = 0.85 if sentiment == "Positive" else (-0.75 if sentiment == "Negative" else 0.1)
            confidence = round(random.uniform(0.88, 0.96), 2)
            priority = "critical" if rating <= 1.5 and ("rude" in raw_msg or "worst" in raw_msg) else ("high" if sentiment == "Negative" else "low")
        elif is_weekend and is_evening and location in ["Salem", "Coimbatore", "Erode"] and rand_type < 0.65:
            # Weekend evening delivery delay spike
            tpl = random.choice(negative_templates[:2])
            raw_msg = tpl[0].format(product=product, location=location)
            rating = tpl[1]
            lang = "en"
            topic = tpl[2]
            sentiment = "Negative"
            emotions = tpl[3]
            translated = raw_msg
            summary = f"Customer experienced severe delivery delay for {product} on weekend evening."
            sent_score = -0.82
            confidence = 0.94
            priority = "high"
        elif rand_type < 0.60:
            # Positive reviews
            tpl = random.choice(positive_templates)
            raw_msg = tpl[0].format(product=product, location=location)
            rating = tpl[1]
            lang = "en"
            topic = tpl[2]
            sentiment = "Positive"
            emotions = tpl[3]
            translated = raw_msg
            summary = f"Customer highly appreciated the {product} and service."
            sent_score = round(random.uniform(0.72, 0.95), 2)
            confidence = round(random.uniform(0.89, 0.98), 2)
            priority = "low"
        elif rand_type < 0.82:
            # Negative reviews
            tpl = random.choice(negative_templates)
            raw_msg = tpl[0].format(product=product, location=location)
            rating = tpl[1]
            lang = "en"
            topic = tpl[2]
            sentiment = "Negative"
            emotions = tpl[3]
            translated = raw_msg
            summary = f"Customer reported dissatisfaction regarding {topic}."
            sent_score = round(random.uniform(-0.90, -0.60), 2)
            confidence = round(random.uniform(0.87, 0.96), 2)
            priority = "critical" if rating <= 1.0 or "rude" in raw_msg.lower() or "spill" in raw_msg.lower() else "high"
        else:
            # Mixed / neutral reviews
            tpl = random.choice(mixed_templates)
            raw_msg = tpl[0].format(product=product, location=location)
            rating = tpl[1]
            lang = "en"
            topic = tpl[2]
            sentiment = "Neutral"
            emotions = tpl[3]
            translated = raw_msg
            summary = f"Customer expressed mixed sentiment with good taste but operational delay."
            sent_score = round(random.uniform(-0.15, 0.25), 2)
            confidence = round(random.uniform(0.85, 0.92), 2)
            priority = "medium"

        # Aspect extraction breakdown
        aspects = []
        if "delivery" in raw_msg.lower() or "delay" in raw_msg.lower() or "hour" in raw_msg.lower():
            aspects.append({"aspect": "Delivery & Logistics", "sentiment": "Negative" if rating <= 3.0 else "Positive", "confidence": 0.92, "keywords": ["delivery", "time", "speed"]})
        if "taste" in raw_msg.lower() or "delicious" in raw_msg.lower() or "crunch" in raw_msg.lower() or "crust" in raw_msg.lower() or "fresh" in raw_msg.lower() or "stale" in raw_msg.lower():
            aspects.append({"aspect": "Product Quality", "sentiment": "Positive" if "stale" not in raw_msg.lower() else "Negative", "confidence": 0.95, "keywords": ["taste", "freshness", "quality"]})
        if "staff" in raw_msg.lower() or "polite" in raw_msg.lower() or "rude" in raw_msg.lower() or "cashier" in raw_msg.lower():
            aspects.append({"aspect": "Customer Service", "sentiment": "Negative" if "rude" in raw_msg.lower() else "Positive", "confidence": 0.94, "keywords": ["staff", "attitude", "service"]})
        if "packaging" in raw_msg.lower() or "lid" in raw_msg.lower() or "spill" in raw_msg.lower() or "leak" in raw_msg.lower():
            aspects.append({"aspect": "Packaging & Presentation", "sentiment": "Negative" if ("spill" in raw_msg.lower() or "leak" in raw_msg.lower() or "worst" in raw_msg.lower()) else "Positive", "confidence": 0.91, "keywords": ["packaging", "seal", "container"]})
        if "price" in raw_msg.lower() or "rupee" in raw_msg.lower() or "steep" in raw_msg.lower() or "worth" in raw_msg.lower():
            aspects.append({"aspect": "Pricing & Value", "sentiment": "Negative" if "steep" in raw_msg.lower() else "Positive", "confidence": 0.88, "keywords": ["price", "value", "cost"]})
        if "ambiance" in raw_msg.lower() or "clean" in raw_msg.lower() or "neat" in raw_msg.lower() or "hygiene" in raw_msg.lower() or "noisy" in raw_msg.lower():
            aspects.append({"aspect": "Hygiene & Store Ambiance", "sentiment": "Negative" if "noisy" in raw_msg.lower() else "Positive", "confidence": 0.90, "keywords": ["ambiance", "cleanliness"]})

        if not aspects:
            aspects.append({"aspect": topic, "sentiment": sentiment, "confidence": 0.88, "keywords": [topic.lower()]})

        content_hash = compute_content_hash(raw_msg)

        reviewed = 1 if i % 4 == 0 else 0
        assigned_to = "Support Lead" if priority in ["critical", "high"] and reviewed == 0 else None
        tags = [topic.split()[0].lower()]
        if priority == "critical":
            tags.append("urgent")

        fb_dict = {
            "id": fb_id,
            "business_id": biz_id,
            "customer_name": customer[0],
            "customer_email": customer[1],
            "customer_phone": customer[2],
            "source": source,
            "rating": rating,
            "message": raw_msg,
            "original_language": lang,
            "detected_language": lang,
            "translated_text": translated,
            "product_name": product,
            "location": location,
            "created_at": time_str,
            "reviewed": reviewed,
            "assigned_to": assigned_to,
            "tags": tags,
            "priority": priority,
            "notes": "Followed up with courier partner." if reviewed else "",
            "archived": 0,
            "content_hash": content_hash
        }

        intent = "complaint" if sentiment == "Negative" else ("praise" if sentiment == "Positive" else "inquiry")

        analysis_dict = {
            "feedback_id": fb_id,
            "sentiment": sentiment,
            "sentiment_score": sent_score,
            "confidence": confidence,
            "emotions": emotions,
            "topics": [topic],
            "aspects": aspects,
            "intent": intent,
            "priority": priority,
            "summary": summary,
            "actionable": 1 if priority in ["critical", "high", "medium"] else 0,
            "explanation": f"Classified as {sentiment} based on explicit customer feedback regarding {topic} with {int(confidence*100)}% model certainty.",
            "processed_at": time_str,
            "provider_used": "hybrid",
            "content_hash": content_hash
        }

        dataset.append((fb_dict, analysis_dict))

    return dataset


if __name__ == "__main__":
    init_db()
    ensure_demo_data()
    print("InsightLoop database initialized and seeded successfully.")
