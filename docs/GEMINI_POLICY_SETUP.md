# Gemini Enterprise policy knowledge setup

## What this means in simple words

The six `.md` files in `policies/` are **sample rules** that Gemini can consult when recommending an HR data correction. This approach is called **grounding** or **retrieval-augmented generation (RAG)**. It is not the same as training a new Gemini model from scratch.

## Before connecting your school/company account

1. Ask your IT/cloud administrator: "Does our Gemini Enterprise subscription let me call the approved API from a custom FastAPI application? Which GCP project, region, edition, IAM roles, quota and billing configuration should I use?"
2. Ask HR or the policy owner to approve the policy text. The included policies are **fictional** and must not be treated as your company's official rules.
3. Confirm personal-data handling, regional residency and prompt logging requirements.
4. Use synthetic HR rows for all development and demos.

## Policy files to upload (after approval)

| File | Subject | Important rule IDs |
|---|---|---|
| `01_claims_reimbursement_policy.md` | Claims and reimbursements | `CLAIM-PII-001`, `CLAIM-DUP-002`, `CLAIM-VAL-003`, `CLAIM-ANOM-004` |
| `02_personal_data_protection.md` | Privacy and masking | `PRIV-001` through `PRIV-004` |
| `03_attendance_policy.md` | Attendance checks | `ATT-003`, `ATT-004`, `ATT-005` |
| `04_leave_policy.md` | Leave rules | `LEV-002` through `LEV-005` |
| `05_employee_data_standard.md` | Master records | `EMP-001` through `EMP-005` |
| `06_data_correction_sop.md` | Human correction workflow | Triage, assignment, approval, revalidation |

## The safe flow to implement

1. FastAPI runs deterministic checks and creates a finding with safe context, exact row/field and masked value.
2. Retrieve the approved *effective* policy section relevant to its rule ID.
3. Redact unnecessary employee data before building an API request.
4. Ask Gemini to return a strictly structured response: `summary`, `why_flagged`, `recommended_action`, `policy_citations`, `requires_human_review`.
5. Reject/repair output with missing citations, unsupported advice or unsafe confidential content.
6. Save recommendation metadata, provider/model/prompt-template/policy versions and timestamp.
7. Let authorized HR review before notifying an employee or updating a record.

## Example safe AI input (not an API key or a real request)

```json
{
  "rule_code": "CLAIM-PII-001",
  "entity_type": "claim",
  "column": "claim_description",
  "masked_excerpt": "Account ****6789",
  "policy_context": "Section 3: Prohibited account details in free-text claim fields.",
  "question": "Explain the issue and propose one HR-reviewed correction step."
}
```

## What NOT to do

- Do not paste real employee CSVs into personal/free AI chat tools to 'train' a policy bot.
- Do not put API credentials in React `VITE_` variables or commit them to GitHub.
- Do not automatically modify claims or email employees based on an unchecked model answer.
- Do not invent policy citations when the approved source does not contain the claimed rule.

Official docs: https://docs.cloud.google.com/gemini/enterprise/docs/developer-guide and https://docs.cloud.google.com/gemini/enterprise/docs/get-answers-from-streamassist.
