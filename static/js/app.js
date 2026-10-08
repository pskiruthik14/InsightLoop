/**
 * MSME Sentiment Intelligence Platform - Main Client Application Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    businessName: "Artisan Bakery & Cafe",
    digest: null,
    items: [],
    logs: [],
    currentFilter: "all",
    theme: "dark"
  };

  // DOM Elements
  const tabItems = document.querySelectorAll(".nav-item");
  const tabViews = document.querySelectorAll(".tab-view");
  const businessTitle = document.getElementById("current-business-title");
  const quickSelect = document.getElementById("dataset-quick-select");
  const themeToggle = document.getElementById("btn-toggle-theme");
  const exportBtn = document.getElementById("btn-export-report");
  const settingsModal = document.getElementById("settings-modal");
  const openSettingsBtn = document.getElementById("btn-open-settings");
  const closeSettingsBtn = document.getElementById("btn-close-modal");
  const cancelSettingsBtn = document.getElementById("btn-cancel-settings");
  const configForm = document.getElementById("llm-config-form");

  // Tabs Navigation
  tabItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetTab = item.getAttribute("data-tab");
      tabItems.forEach(i => i.classList.remove("active"));
      tabViews.forEach(v => v.classList.remove("active"));

      item.classList.add("active");
      const targetView = document.getElementById(`tab-${targetTab}`);
      if (targetView) targetView.classList.add("active");
    });
  });

  // Theme Toggle
  themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
  });

  // Export Report
  exportBtn.addEventListener("click", () => {
    window.print();
  });

  // Settings Modal Controls
  openSettingsBtn.addEventListener("click", () => settingsModal.classList.add("open"));
  closeSettingsBtn.addEventListener("click", () => settingsModal.classList.remove("open"));
  cancelSettingsBtn.addEventListener("click", () => settingsModal.classList.remove("open"));
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove("open");
  });

  configForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const provider = document.getElementById("config-provider-select").value;
    const apiKey = document.getElementById("config-api-key").value;

    try {
      const res = await fetch("/api/configure-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, api_key: apiKey })
      });
      const data = await res.json();
      if (data.status === "success") {
        alert(`LLM settings saved! Active Provider: ${provider}`);
        settingsModal.classList.remove("open");
        fetchDigest();
      }
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    }
  });

  // Fetch Latest Data
  async function fetchDigest() {
    try {
      const res = await fetch("/api/digest");
      const data = await res.json();
      state.businessName = data.business_name;
      state.digest = data.digest;
      state.items = data.analyzed_items || [];
      state.logs = data.agent_logs || [];

      businessTitle.textContent = state.businessName;
      renderDashboard();
      renderReviews();
      renderActions();
      renderAgentLogs();
    } catch (err) {
      console.error("Error fetching digest:", err);
    }
  }

  // Render Dashboard Elements
  function renderDashboard() {
    const d = state.digest;
    if (!d) return;

    // Executive Summary
    document.getElementById("digest-executive-summary").textContent = d.executive_summary;

    // KPIs
    document.getElementById("kpi-total-reviews").textContent = d.total_reviews;
    
    // NSS
    const nssElem = document.getElementById("kpi-nss-score");
    const nssBadge = document.getElementById("kpi-nss-badge");
    nssElem.textContent = (d.net_sentiment_score > 0 ? "+" : "") + d.net_sentiment_score;
    if (d.net_sentiment_score >= 20) {
      nssElem.style.color = "var(--color-pos)";
      nssBadge.className = "kpi-badge positive";
      nssBadge.textContent = "High Customer Advocacy";
    } else if (d.net_sentiment_score >= 0) {
      nssElem.style.color = "var(--color-neu)";
      nssBadge.className = "kpi-badge";
      nssBadge.textContent = "Moderate Satisfaction";
    } else {
      nssElem.style.color = "var(--color-neg)";
      nssBadge.className = "kpi-badge negative";
      nssBadge.textContent = "Churn Risk Alert";
    }

    // Rating
    document.getElementById("kpi-avg-rating").textContent = `${d.average_rating} / 5.0`;
    const starsCount = Math.round(d.average_rating);
    document.getElementById("kpi-rating-stars").textContent = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);

    // Critical Alerts
    document.getElementById("kpi-critical-alerts").textContent = d.critical_alerts_count;

    // Sentiment Breakdown Bar
    const total = d.total_reviews || 1;
    const posPct = Math.round((d.positive_count / total) * 100);
    const neuPct = Math.round((d.neutral_count / total) * 100);
    const negPct = 100 - posPct - neuPct;

    document.getElementById("bar-pos").style.width = `${posPct}%`;
    document.getElementById("bar-neu").style.width = `${neuPct}%`;
    document.getElementById("bar-neg").style.width = `${negPct}%`;

    document.getElementById("legend-pos-count").textContent = d.positive_count;
    document.getElementById("legend-neu-count").textContent = d.neutral_count;
    document.getElementById("legend-neg-count").textContent = d.negative_count;
    document.getElementById("pos-percentage-badge").textContent = `${posPct}% Favorable`;

    // Customer quotes snippets
    const quotesContainer = document.getElementById("top-customer-quotes");
    quotesContainer.innerHTML = "";
    const snippets = (d.top_positive_themes.slice(0, 2).concat(d.top_negative_complaints.slice(0, 2)));
    snippets.forEach(text => {
      const q = document.createElement("div");
      q.style.padding = "6px 10px";
      q.style.background = "rgba(255,255,255,0.03)";
      q.style.borderRadius = "6px";
      q.style.color = "var(--text-muted)";
      q.innerHTML = `<em>"${escapeHtml(text.slice(0, 95))}..."</em>`;
      quotesContainer.appendChild(q);
    });

    // Aspect-Based Sentiment List
    const aspectContainer = document.getElementById("aspect-progress-list");
    aspectContainer.innerHTML = "";
    for (const [aspect, score] of Object.entries(d.aspect_scores || {})) {
      const item = document.createElement("div");
      item.className = "aspect-item";

      let barColor = "var(--color-pos)";
      if (score < 50) barColor = "var(--color-neg)";
      else if (score < 75) barColor = "var(--color-neu)";

      item.innerHTML = `
        <div class="aspect-meta">
          <span>${aspect}</span>
          <span style="color: ${barColor}">${score}% Favorable</span>
        </div>
        <div class="aspect-bar-track">
          <div class="aspect-bar-fill" style="width: ${score}%; background: ${barColor};"></div>
        </div>
      `;
      aspectContainer.appendChild(item);
    }
  }

  // Render Reviews Feed
  function renderReviews() {
    const container = document.getElementById("feedback-feed-container");
    container.innerHTML = "";

    const filtered = state.items.filter(item => {
      if (state.currentFilter === "all") return true;
      if (state.currentFilter === "Critical") return item.urgency_level === "Critical";
      return item.overall_sentiment === state.currentFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 30px;">No feedback items match the selected filter.</div>`;
      return;
    }

    filtered.forEach(fb => {
      const card = document.createElement("div");
      card.className = `feedback-card ${fb.urgency_level === "Critical" ? "critical-alert" : ""}`;

      const stars = fb.rating ? "★".repeat(Math.round(fb.rating)) + "☆".repeat(5 - Math.round(fb.rating)) : "";
      
      const aspectTagsHtml = (fb.aspects || []).map(a => 
        `<span class="aspect-tag">${a.aspect}: <strong style="color: ${a.sentiment === 'Positive' ? 'var(--color-pos)' : (a.sentiment === 'Negative' ? 'var(--color-neg)' : 'var(--color-neu)')}">${a.sentiment}</strong></span>`
      ).join(" ");

      card.innerHTML = `
        <div class="feedback-top">
          <div class="author-info">
            <div class="author-avatar">${fb.customer_name.charAt(0)}</div>
            <div>
              <div class="author-name">${escapeHtml(fb.customer_name)}</div>
              <span class="source-tag">${escapeHtml(fb.source)} • ${fb.timestamp}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="rating-stars">${stars}</div>
            <span class="urgency-badge urgency-${fb.urgency_level}">${fb.urgency_level} Urgency</span>
          </div>
        </div>

        <div class="feedback-body">
          "${escapeHtml(fb.text)}"
        </div>

        <div class="feedback-tags">
          ${aspectTagsHtml}
          <span style="font-size: 0.72rem; color: var(--text-dim); margin-left: auto;">Emotion: <strong>${fb.emotion}</strong></span>
        </div>

        <div style="margin-top: 14px; display: flex; gap: 8px; align-items: center;">
          <select class="form-control tone-selector" style="width: auto; padding: 4px 8px; font-size: 0.75rem;" data-id="${fb.id}">
            <option value="empathetic">Empathetic Tone</option>
            <option value="professional">Professional Tone</option>
            <option value="enthusiastic">Enthusiastic Tone</option>
            <option value="promotional">Promotional (Offer Code)</option>
          </select>
          <button class="btn btn-secondary btn-reply-trigger" style="font-size: 0.75rem; padding: 5px 12px;" data-id="${fb.id}">
            ✨ Draft AI Reply
          </button>
        </div>

        <div class="response-box-preview" id="reply-box-${fb.id}" style="${fb.draft_response ? '' : 'display: none;'}">
          <div class="response-header-sm">
            <span>AI Suggested Response</span>
            <button class="btn-copy-reply" data-id="${fb.id}" style="background:none; border:none; color:var(--brand-violet); cursor:pointer; font-weight:700;">📋 Copy</button>
          </div>
          <p id="reply-text-${fb.id}" style="color: var(--text-main);">${escapeHtml(fb.draft_response || '')}</p>
        </div>
      `;

      container.appendChild(card);
    });

    // Wire Reply Buttons
    document.querySelectorAll(".btn-reply-trigger").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const fb = state.items.find(i => i.id === id);
        if (!fb) return;

        const tone = document.querySelector(`.tone-selector[data-id="${id}"]`).value;
        btn.textContent = "⏳ Generating...";
        btn.disabled = true;

        try {
          const res = await fetch("/api/generate-response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              review_id: fb.id,
              review_text: fb.text,
              customer_name: fb.customer_name,
              sentiment: fb.overall_sentiment,
              rating: fb.rating,
              aspects: (fb.aspects || []).map(a => a.aspect),
              tone: tone,
              business_name: state.businessName
            })
          });
          const data = await res.json();
          if (data.status === "success") {
            fb.draft_response = data.response;
            const replyBox = document.getElementById(`reply-box-${id}`);
            const replyText = document.getElementById(`reply-text-${id}`);
            replyText.textContent = data.response;
            replyBox.style.display = "block";
          }
        } catch (err) {
          alert("Error generating response: " + err.message);
        } finally {
          btn.textContent = "✨ Draft AI Reply";
          btn.disabled = false;
        }
      });
    });

    // Wire Copy Buttons
    document.querySelectorAll(".btn-copy-reply").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const text = document.getElementById(`reply-text-${id}`).textContent;
        navigator.clipboard.writeText(text);
        btn.textContent = "✅ Copied!";
        setTimeout(() => btn.textContent = "📋 Copy", 2000);
      });
    });
  }

  // Filter Buttons
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentFilter = btn.getAttribute("data-filter");
      renderReviews();
    });
  });

  // Render RCA & Action Plan
  function renderActions() {
    const d = state.digest;
    if (!d) return;

    // RCA Container
    const rcaContainer = document.getElementById("rca-cards-container");
    rcaContainer.innerHTML = "";

    if (!d.root_causes || d.root_causes.length === 0) {
      rcaContainer.innerHTML = `<div style="color: var(--color-pos); padding: 16px; background: var(--color-pos-bg); border-radius: var(--radius-md);">
        ✅ No critical operational failures detected. Customer sentiment is healthy!
      </div>`;
    } else {
      d.root_causes.forEach(rca => {
        const item = document.createElement("div");
        item.className = "feedback-card";
        item.style.borderLeft = "4px solid var(--color-neg)";

        const quotesHtml = (rca.evidence_quotes || []).map(q => `<li style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 4px;"><em>${escapeHtml(q)}</em></li>`).join("");
        const factorsHtml = (rca.contributing_factors || []).map(f => `<span class="meta-chip chip-impact" style="margin-right: 6px;">${escapeHtml(f)}</span>`).join("");

        item.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="color: #fff; font-size: 0.95rem;">Aspect: <span style="color: var(--brand-violet);">${rca.affected_aspect}</span> (${rca.frequency_count} incidents)</h4>
            <span class="urgency-badge urgency-${rca.severity}">${rca.severity} Severity</span>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 10px;"><strong>Diagnosed Issue:</strong> ${escapeHtml(rca.issue)}</p>
          <div style="margin-bottom: 8px;"><strong>Contributing Systemic Factors:</strong></div>
          <div style="margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 6px;">${factorsHtml}</div>
          <div><strong>Customer Evidence:</strong><ul style="padding-left: 18px; margin-top: 4px;">${quotesHtml}</ul></div>
        `;
        rcaContainer.appendChild(item);
      });
    }

    // Action Plan Grid
    const planGrid = document.getElementById("action-plan-grid");
    planGrid.innerHTML = "";

    (d.action_plan || []).forEach(plan => {
      const card = document.createElement("div");
      card.className = "plan-card";

      const stepsHtml = (plan.implementation_steps || []).map(s => `
        <li><span class="step-bullet">✓</span> <span>${escapeHtml(s)}</span></li>
      `).join("");

      card.innerHTML = `
        <div>
          <div class="plan-meta">
            <span class="meta-chip chip-cost">💰 ${plan.estimated_cost}</span>
            <span class="meta-chip chip-priority">⏱️ ${plan.priority}</span>
            <span class="meta-chip chip-impact">⚡ ${plan.expected_impact} Impact</span>
          </div>
          <h4>${escapeHtml(plan.title)}</h4>
          <p>${escapeHtml(plan.description)}</p>
          <ul class="plan-steps">${stepsHtml}</ul>
        </div>
        <button class="btn btn-secondary" style="width: 100%; font-size: 0.8rem;" onclick="alert('Action marked as Assigned to Store Manager SOP Checklist!')">
          Mark as In-Progress
        </button>
      `;
      planGrid.appendChild(card);
    });
  }

  // Render Real-Time Logs
  function renderAgentLogs() {
    const consoleStream = document.getElementById("agent-console-stream");
    consoleStream.innerHTML = "";
    state.logs.forEach(log => {
      const entry = document.createElement("div");
      entry.className = "log-entry";
      entry.innerHTML = `
        <span class="log-time">[${log.timestamp}]</span>
        <span class="log-agent">&lt;${log.agent}&gt;</span>
        <span class="log-msg">${escapeHtml(log.message)}</span>
      `;
      consoleStream.appendChild(entry);
    });
    consoleStream.scrollTop = consoleStream.scrollHeight;
  }

  document.getElementById("btn-refresh-logs").addEventListener("click", fetchDigest);

  // Live Sandbox Submission
  const sandboxForm = document.getElementById("sandbox-form");
  sandboxForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = document.getElementById("sandbox-text").value.trim();
    const source = document.getElementById("sandbox-source").value;
    const customer = document.getElementById("sandbox-customer").value.trim();
    const rating = parseFloat(document.getElementById("sandbox-rating").value);
    const runBtn = document.getElementById("btn-run-sandbox");

    runBtn.textContent = "⏳ Analyzing Multi-Agent Signals...";
    runBtn.disabled = true;

    try {
      const res = await fetch("/api/analyze-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text, source, customer_name: customer, rating, business_name: state.businessName
        })
      });
      const data = await res.json();

      // Show result
      const resCard = document.getElementById("sandbox-results-card");
      const badge = document.getElementById("sandbox-sentiment-badge");
      const content = document.getElementById("sandbox-output-content");

      badge.textContent = `${data.overall_sentiment} (Score: ${data.sentiment_score})`;
      badge.className = `kpi-badge ${data.overall_sentiment === 'Positive' ? 'positive' : (data.overall_sentiment === 'Negative' ? 'negative' : '')}`;

      const aspectsHtml = (data.aspects || []).map(a => 
        `<span class="aspect-tag">${a.aspect} (${a.sentiment}, ${Math.round(a.confidence*100)}% conf)</span>`
      ).join(" ");

      content.innerHTML = `
        <div style="margin-bottom: 12px;"><strong>Extracted Aspects:</strong> ${aspectsHtml}</div>
        <div style="margin-bottom: 12px;"><strong>Urgency Classification:</strong> <span class="urgency-badge urgency-${data.urgency_level}">${data.urgency_level}</span> | <strong>Emotion:</strong> ${data.emotion}</div>
        <div class="response-box-preview" style="display:block;">
          <div class="response-header-sm">Auto-Generated Contextual Response</div>
          <p>${escapeHtml(data.draft_response || "")}</p>
        </div>
      `;
      resCard.style.display = "block";
      resCard.scrollIntoView({ behavior: "smooth" });

      fetchDigest(); // Refresh KPIs
    } catch (err) {
      alert("Analysis error: " + err.message);
    } finally {
      runBtn.textContent = "⚡ Execute Multi-Agent Analysis";
      runBtn.disabled = false;
    }
  });

  // Preloaded Dataset Switcher
  quickSelect.addEventListener("change", (e) => {
    loadDataset(e.target.value);
  });

  document.querySelectorAll(".btn-load-preloaded").forEach(btn => {
    btn.addEventListener("click", () => {
      const ds = btn.getAttribute("data-dataset");
      quickSelect.value = ds;
      loadDataset(ds);
    });
  });

  async function loadDataset(datasetId) {
    try {
      const res = await fetch(`/api/load-dataset/${datasetId}`, { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        fetchDigest();
        // Switch to dashboard tab
        document.querySelector('[data-tab="dashboard"]').click();
      }
    } catch (err) {
      alert("Failed to load dataset: " + err.message);
    }
  }

  // Upload Custom CSV
  const uploadForm = document.getElementById("upload-csv-form");
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("upload-business-name").value;
    const fileInput = document.getElementById("upload-file-input");
    if (!fileInput.files.length) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("business_name", name);

    const submitBtn = document.getElementById("btn-submit-upload");
    submitBtn.textContent = "⏳ Parsing & Ingesting Dataset...";
    submitBtn.disabled = true;

    try {
      const res = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.status === "success") {
        alert(`Successfully ingested ${data.items_count} reviews for '${data.business_name}'!`);
        fetchDigest();
        document.querySelector('[data-tab="dashboard"]').click();
      } else {
        alert("Upload error: " + (data.detail || "Unknown error"));
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      submitBtn.textContent = "🚀 Ingest & Run Full Agent Analysis";
      submitBtn.disabled = false;
    }
  });

  // Helper escape
  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
  }

  // Initial Load
  fetchDigest();
});
