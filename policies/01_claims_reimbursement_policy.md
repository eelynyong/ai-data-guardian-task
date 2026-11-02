# Sample Claims & Reimbursement Policy

**Policy ID:** CLAIMS-2026  
**Version:** 1.2  
**Owner:** HR & Finance  
**Effective:** 2026-01-01  
**Status:** FICTIONAL SAMPLE — review with an authorized HR policy owner before organizational use.

## 1. Purpose
Claims must identify a valid employee, date, amount and category, while protecting confidential information and preventing accidental double payment.

## 2. Required fields

- `employee_id`, `claim_id`, `event_date`, `claim_category`, `claim_amount`, `claim_description`.
- Claim amount is in Malaysian Ringgit (MYR) and must be non-negative unless the transaction is explicitly tagged as a refund/adjustment.
- A claim should have a receipt reference in a real HR system. The sample composite CSV omits attachment references for simplicity.

## 3. Privacy and incorrect fields

**CLAIM-PII-001 — Prohibited account details in free text:** Never write bank account numbers, identity-document numbers, passwords or payment credentials in `claim_description`. A finding triggers a masked, critical review alert. It must not appear unmasked in ordinary notifications or AI prompts.

**CLAIM-VAL-003 — Amount validity:** Negative amounts in ordinary claim submissions require correction or confirmation that the transaction is a refund.

## 4. Duplicates and unusual claims

**CLAIM-DUP-002 — Duplicate identifiers:** Repeated `claim_id` values are invalid when claims are expected to have unique IDs. Similar claims with the same employee/date/amount/category are *possible duplicates*, not automatic evidence of double reimbursement.

**CLAIM-ANOM-004 — Review threshold:** A claim over **RM 2,000** is highlighted in this teaching dataset. This number is an illustrative threshold, not an approved company reimbursement limit.

## 5. Review action

HR checks the exact row and documents the reason. If the claim needs changing, HR sends a redacted correction request to the employee; a designated reviewer approves the corrected submission before the record is considered resolved.
