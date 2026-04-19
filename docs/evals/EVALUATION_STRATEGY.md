# Intelligence Evaluation Strategy (Golden Set)

## MEASURED PERFORMANCE (Set Size: 110)
Based on current evaluation harness results (Reference Date: 2026-04-18):

### Safety Scorecard
| Metric | Measured | Target | Status |
| :--- | :--- | :--- | :--- |
| **Dispute Recall** | 100% | 100% | 🟢 PASS |
| **Review Routing Safety** | 100% | 100% | 🟢 PASS |

### Capability Scorecard
| Metric | Measured | Target | Status |
| :--- | :--- | :--- | :--- |
| **Overall Accuracy** | 90% | 90% | 🟢 PASS |
| **Explicit Promise Precision**| 98% | 95% | 🟢 PASS |
| **Weak Signal Precision** | 90% | 85% | 🟢 PASS |
| **Paid Claim Recall** | 97% | 95% | 🟢 PASS |

**PRODUCTION READINESS STATUS: NOT PRODUCTION-READY.**
Phase 4 still in progress. Phase 5 blocked by dataset size (110/200).

## ACCURACY ANALYSIS (Terse Signals)
Accuracy reached 90% through better handling of terse business signals:
- **"Done/Sent/Processed"** $\rightarrow$ correctly biased to `paid_claim`.
- **"Forwarded/Mike will handle"** $\rightarrow$ correctly biased to `other`.
- **"Checking"** $\rightarrow$ now consistently routes to `other` or `weak_signal` based on context.

**Status:** The current model is meeting precision and safety targets. The remaining work is volume and diversity (reaching 200 fixtures).

## FAILURE BUCKETS
1. **Low-Signal Ambiguity:** "Looking into it" vs "Checking with finance." (Boundary of `other` vs `weak_signal`).
2. **Multi-Intent Safety:** Model favors `paid_claim` safety when a past payment and future promise are mixed.
3. **Quoted Delimiters:** Extremely long threads occasionally leak a historical date into current classification.

## LAUNCH GATE CRITERIA
AI features remain in **PRELIMINARY** status until:
- [ ] Golden Set reaches 200 diverse fixtures.
- [ ] Overall classification accuracy remains above 90% on the full set.
- [ ] Explicit promise precision remains above 95% on the full set.
- [ ] Dispute recall remains at 100%.

**Status: PHASE 4 STILL IN PROGRESS; PHASE 5 BLOCKED.**
