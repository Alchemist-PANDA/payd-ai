---
title: BrandSight GEO
emoji: 🌍
colorFrom: blue
colorTo: green
sdk: streamlit
sdk_version: 1.32.0
app_file: geo_upload/dashboard.py
pinned: false
---

# BrandSight GEO — The AI Search Visibility Agent 🌍

**Automating brand discovery and citation lift in Generative Search Engines (ChatGPT, Perplexity, Gemini).**

![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-blue)
![Streamlit](https://img.shields.io/badge/UI-Streamlit-red)
![Python](https://img.shields.io/badge/Language-Python-3776AB)
![Multi-LLM](https://img.shields.io/badge/LLM-OpenAI%20%7C%20Gemini%20%7C%20Groq-orange)

```text
                                [ BrandSight GEO Architecture ]

    ┌────────────┐      ┌─────────────────┐      ┌─────────────────────────┐
    │ Brand Name │ ───> │ LangGraph Agent │ ───> │ Multi-LLM Citation Audit│
    └────────────┘      └────────┬────────┘      └────────────┬────────────┘
                                 │                            │
                    ┌────────────▼───────────┐      ┌─────────▼──────────┐
                    │  Remediation Engine    │ <─── │ Gap Severity Analys │
                    │ (JSON-LD, Whitepapers) │      └────────────────────┘
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼───────────┐
                    │   GEO Lift Measurement │
                    │ (WordPress Deployment) │
                    └────────────────────────┘
```

---

## 📌 What It Does

```
Brand Input  →  Multi-LLM Audit  →  Gap Analysis  →  Auto-Remediation  →  Lift Report
```

Given a brand name like **"Burger Hub"**, the agent:
1. Queries multiple AI search engines (ChatGPT, Gemini, Llama) to check citation presence
2. Identifies gaps (missing structured data, low authority signals)
3. Auto-generates schema.org JSON-LD, technical whitepapers, and review snippets
4. Outputs a deployment package ready for WordPress
5. Measures the "Citation Lift" after deployment

---

## 🔴 The Problem: The "AI Invisibility Crisis"

In the era of AI-first search, your brand is either a citation or it doesn't exist.
- **The Blind Spot**: 90% of brands are absent from ChatGPT, Perplexity, and Gemini recommendations because they lack the "authority signals" LLMs require.
- **SEO Failure**: Traditional SEO (backlinks and keywords) does not influence LLM retrieval-augmented generation (RAG) pipelines.
- **The Stakeholders**: This tool is built for **Brand Managers**, **Founders**, and **Growth Teams** who need to audit and improve their "Generative Engine Visibility."

---

## 🗂️ Project Structure

```
GEO/
├── geo_audit_agent/
│   ├── agent.py              ← LangGraph state machine (6 nodes)
│   ├── geo_remediation_tools.py  ← JSON-LD, whitepaper, review generators
│   └── __init__.py
├── geo_upload/
│   ├── dashboard.py          ← Streamlit UI with auth
│   ├── run_baseline.py       ← Pre-remediation audit
│   ├── deploy_remediation.py ← Deployment package generator
│   ├── measure_lift.py       ← Post-audit lift calculator
│   └── *.json                ← Audit results (pre/post)
└── requirements.txt
```

---

## ⚙️ Setup (Step by Step)

### 1. Clone the repository
```bash
git clone https://github.com/Alchemist-PANDA/GEO
cd GEO
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up environment variables
Create a `.env` file:
```bash
ANTHROPIC_BASE_URL=http://localhost:20128/v1
ANTHROPIC_AUTH_TOKEN=your_api_key_here
```

### 4. Run the dashboard
```bash
streamlit run geo_upload/dashboard.py
```

### 5. Login
- **Username**: `admin`
- **Password**: `geo123`

---

## 🆓 Free LLM Options (No credit card needed!)

| Provider | Free Tier | Get Key |
|----------|-----------|---------|
| Groq | ✅ Fast & free | https://console.groq.com |
| Google Gemini | ✅ Very generous | https://aistudio.google.com/apikey |
| OpenRouter | ✅ Multiple free models | https://openrouter.ai |

---

## 📊 Sample Output: Burger Hub Case Study

### Before Remediation (`pre_remediation_audit.json`)
```json
{
    "brand_name": "Burger Hub",
    "is_cited": true,
    "confidence_score": 0.5,
    "gaps": [
        {"gap_type": "Structured Data", "severity": "high"},
        {"gap_type": "Authority Signals", "severity": "medium"}
    ]
}
```

### After Remediation (`lift_report.json`)
```json
{
    "confidence_score": {
        "before": 0.5,
        "after": 0.85,
        "percentage_lift": "70%"
    },
    "gaps": {
        "before": 2,
        "after": 0,
        "resolved": 2
    }
}
```

---

## 🛠️ Features & Capabilities

| Capability | What It Does | Module |
|:--- |:--- |:--- |
| **Multi-LLM Citation Audit** | Queries multiple AI engines simultaneously to detect brand presence and sentiment. | `run_baseline.py` |
| **Gap Severity Classification** | Categorizes missing citations as Critical, High, Medium, or Low to prioritize work. | `geo_audit_agent/agent.py` |
| **JSON-LD Generation** | Creates valid schema.org markup for LocalBusiness, Product, and Organization nodes. | `deploy_remediation.py` |
| **Technical Whitepapers** | Generates authority-building technical content explaining the brand's proprietary expertise. | `deploy_remediation.py` |
| **Review Snippet Creation** | Produces ready-to-publish customer social proof to reinforce trust signals. | `deploy_remediation.py` |
| **Deployment Package** | Outputs WordPress-ready HTML and Markdown instructions for easy implementation. | `deploy_remediation.py` |
| **Lift Measurement** | Re-audits after deployment and calculates the delta in citation presence scores. | `measure_lift.py` |
| **Interactive Dashboard** | A secure Streamlit UI for monitoring audits and approving AI-generated content. | `dashboard.py` |

---

## 🔧 Customizing the Agent

### Change the brand being audited
Edit `geo_upload/run_baseline.py`:
```python
brand = "Your Brand Name"
category = "your category"
city = "Your City"
```

### Change the LLM model
Edit `geo_audit_agent/agent.py`:
```python
content = call_proxy_llm("gc/gemini-3-flash-preview", messages)
# Or use: "gpt-4o-mini", "llama-3.1-8b-instant"
```

---

## ⚙️ The Engineering Decisions

-   **Why LangGraph?**: It provides a **State Machine** for a deterministic audit → remediate → measure cycle. This ensures the agent doesn't "hallucinate" its way through a campaign; it follows a hardened logic path.
-   **Why Multi-LLM?**: Cross-engine visibility is critical. Relying on a single model introduces bias. We query Gemini, Llama, and GPT to get a consensus "Brand Health" score.
-   **Why JSON-LD?**: This is the "gold standard" for AI visibility. LLMs and Knowledge Graphs ingest structured data more reliably than raw HTML.
-   **Why the Cyclic Pipeline?**: Real GEO is not a one-off. The `baseline -> deploy -> post-audit` loop creates a closed feedback cycle for continuous improvement.

---

## 💎 What Makes This Production-Ready

-   **Modular Execution**: Each stage (`run_baseline`, `deploy`, `measure_lift`) is a standalone script, allowing for integration into existing CI/CD or marketing stacks.
-   **Structured Logging**: Comprehensive logging via `logging.basicConfig` ensures every LLM call and tool execution is auditable.
-   **Human-in-the-Loop**: The dashboard allows experts to **Approve or Reject** AI-generated content before it touches production.
-   **Error Handling**: Built-in `tenacity` retries with exponential backoff for high-latency API calls.

---

## 📖 What You'll Learn From This Codebase

-   ✅ LangGraph state machines for agentic workflows
-   ✅ Multi-LLM prompt engineering for structured citation analysis
-   ✅ schema.org JSON-LD generation for AI visibility
-   ✅ Streamlit for rapid AI product prototyping
-   ✅ Real-world GEO campaign design and lift measurement

---

## 🐛 Common Issues

| Error | Fix |
|-------|-----|
| `AuthenticationError` | Your API key in `.env` is wrong or missing |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| `JSONDecodeError` | LLM returned bad format — check logs and retry |
| `ImportError` | Make sure you run from the project root directory |

---

**[BrandSight GEO]** | Licensed under MIT. | **Read the [ARCHITECTURE.md](./ARCHITECTURE.md)** for a technical deep dive.
