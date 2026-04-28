# 🌍 GEO Audit Agent: Generative Engine Optimization Intelligence

**Automated end-to-end pipeline for auditing brand visibility in AI search engines and executing agentic remediation.**

![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-blue)
![Streamlit](https://img.shields.io/badge/UI-Streamlit-red)
![Python](https://img.shields.io/badge/Language-Python-3776AB)
![Multi-LLM](https://img.shields.io/badge/LLM-OpenAI%20%7C%20Gemini%20%7C%20Groq-orange)

```text
                                [ GEO Audit Pipeline ]

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
                    │   (Pre/Post Analysis)  │
                    └────────────────────────┘
```

---

## 🔴 The Problem This Solves
As search transitions from links to answers (ChatGPT, Perplexity, Gemini), brands face a new existential threat: **Invisibility.**
- **AI Blind Spots**: LLMs only cite brands they "trust" based on structured data and authority signals.
- **SEO Obsolescence**: Traditional keyword optimization does not influence LLM retrieval-augmented generation (RAG).
- **Audit Bottlenecks**: Manually checking how every major AI model perceives a brand is impossible at scale.

**GEO Audit Agent** automates the entire lifecycle of Generative Engine Optimization (GEO).

## 🚀 What This Actually Does
Imagine you want to audit **"Burger Hub"** in **Islamabad**:
1.  **Multi-LLM Audit**: The agent queries a panel of LLMs (Gemini, Llama 3, GPT) to see if they recommend the brand for its category.
2.  **Gap Analysis**: It identifies why the brand was missed (e.g., "Missing Structured Data," "Low Authority Signals").
3.  **Agentic Remediation**:
    - Generates valid **schema.org JSON-LD** for immediate indexing.
    - Drafts **Technical Whitepapers** to build domain authority.
    - Creates **Review Submission Templates** for social proof.
4.  **Deployment & Lift**: The system outputs WordPress-ready content and measures the "Confidence Lift" between pre-remediation and post-remediation states.

---

## 🛠️ The Tech Stack

| Layer | Technology | Why |
|:--- |:--- |:--- |
| **Agent Orchestration** | LangGraph | State machine architecture for deterministic audit $\to$ remediate $\to$ measure flows. |
| **UI Dashboard** | Streamlit | Provides a secure, real-time dashboard for human-in-the-loop content approval. |
| **LLM Integration** | OpenAI, Groq, Gemini | Ensures cross-model citation checking to avoid single-model bias. |
| **Structured Data** | JSON-LD / schema.org | The universal language LLMs use to parse and "trust" brand facts. |
| **Deployment** | Python / Markdown | Generates portable, publishing-ready assets (WP, Email, PDF). |

---

## ⚡ Quick Demo

1.  **Clone & Setup**:
    ```bash
    git clone https://github.com/Alchemist-PANDA/GEO
    cd GEO
    pip install -r requirements.txt
    ```
2.  **Run Dashboard**:
    ```bash
    streamlit run geo_upload/dashboard.py
    ```
3.  **Login**:
    - **Username**: `admin`
    - **Password**: `geo123` *(Internal demo credentials)*

---

## 📊 Real-World Case Study: Burger Hub
This repository includes actual audit cycles proving the system's efficacy:
-   **Baseline**: `pre_remediation_audit.json` shows a **0.0 confidence score** (Not Cited).
-   **Remediation**: `geo_remediation_burger_hub.json` contains AI-generated JSON-LD and review snippets.
-   **Result**: `lift_report.json` quantifies the improvement and gap resolution after deploying content.

---

## ⚙️ Engineering Decisions Worth Noting

### Why LangGraph over linear scripts?
Financial and geospatial data require multi-step verification. LangGraph allows the agent to maintain state (memory) as it moves from `query_llm` $\to$ `check_citation` $\to$ `gap_analyst`.

### Why the Audit $\to$ Remediate $\to$ Measure loop?
Closed-loop systems are the standard for production AI. By including `measure_lift.py`, the system provides a verifiable ROI (Return on Investment) for every content change.

```python
# [Snippet] LangGraph Node for Remediation Execution
def remediation_handler(state: AgentState) -> AgentState:
    results = []
    for action in state.get("planned_actions", []):
        tool = tool_map[action["tool_required"]]
        result = tool(state["brand_name"], ...)
        results.append({"tool": tool_name, "status": "success"})
    return {"remediation_results": results}
```

---

## 💎 What Makes This Production-Ready
-   **Human-in-the-Loop**: The Streamlit dashboard allows engineers to approve/reject AI-generated remediations before deployment.
-   **Structured Logging**: Every execution cycle is tracked via `logging.basicConfig` for forensic debugging.
-   **Modular Deployment**: The system handles everything from manual `jsonld_deploy_instructions.md` to automated `deploy_remediation.py` logic.
-   **Session Security**: Built-in authentication for the management dashboard.

---

**[GEO Audit Agent]** | Created for High-Performance Brand Intelligence.
