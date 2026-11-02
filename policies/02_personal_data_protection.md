# Sample Personal Data Protection Standard

**Policy ID:** PRIVACY-2026  
**Version:** 1.0  
**Owner:** Data Protection Officer  
**Effective:** 2026-01-01  
**Status:** FICTIONAL SAMPLE — not legal advice or a substitute for your organization's privacy policy.

## 1. Sensitive information

Sensitive or restricted identifiers can include bank account numbers, national identity/passport numbers, personal contact details, payroll information, health information and access credentials. The applicable treatment depends on field purpose and authorized role.

## 2. Contextual restrictions

- Bank details may be needed in a separately secured payroll function but must not appear in claim-description free text.
- Employee contact information may be permitted in employee-master records, with access restrictions, but not in public exports.
- Health-related leave reasons must be visible only to specifically authorized personnel.

## 3. Detection and response

**PRIV-001:** Detect bank-account-like strings and other configured sensitive patterns in prohibited fields. Mark as a candidate and confirm context; regex matches can be false positives.

**PRIV-002:** Store only a masked excerpt (such as `****6789`) in findings and notifications. Keep the original source file private with access logs and a defined retention period.

**PRIV-003:** Remove unnecessary sensitive values before any approved Gemini request. Keep prompt/response logs appropriately redacted.

**PRIV-004:** Do not use real employee records in academic demos, public repositories or screenshots.

## 4. Incident response

When a critical exposure is suspected, restrict access to the original data and have authorized HR/security personnel decide whether further incident response is necessary. Do not automatically email the exposed value to the employee or others.
