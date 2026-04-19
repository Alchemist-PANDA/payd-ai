# Category Taxonomy V1.0

This taxonomy is frozen for Phase 4 evaluation. All AI classification and extraction must align with these definitions.

| Category | Definition | Positive Example | Negative Example |
| :--- | :--- | :--- | :--- |
| **explicit_promise** | A firm, dated commitment to pay a specific amount. | "I will pay $500 this Friday." | "I'll try to pay Friday." (weak) |
| **weak_payment_signal** | Intent to pay without a firm date or commitment. Includes process updates. | "Processing now", "Sent to bank", "Will try soon." | "I will pay on 4/25." (explicit) |
| **paid_claim** | Assertion that payment has already been made or initiated. | "Paid this morning", "ACH sent yesterday." | "I will pay tomorrow." (promise) |
| **dispute** | Challenges to amount, service quality, or explicit hardship/refusal. | "Amount is wrong", "Unit was broken", "Can't pay." | "Checking on this." (other) |
| **out_of_office** | Automated or manual OOO replies. | "I am away until Monday." | "Checking when I return." (other) |
| **other** | Neutral replies, forwarding, or uninformative/terse text. | "Noted", "Forwarding to finance", "Okay." | "I'll try to pay." (weak) |

### Boundary Cases
- **Compound (Promise + Dispute):** Always classify as **dispute**.
- **Compound (Promise + Paid):** If "paid" is the primary claim, classify as **paid_claim**.
- **Ambiguous Timing:** "Next week" without a day $\rightarrow$ **weak_payment_signal**.
- **Hostility:** Any hostility regardless of promise $\rightarrow$ **dispute**.
