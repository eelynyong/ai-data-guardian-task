# Data dictionary and validation rules

The POC includes `hr_train.csv` and `hr_test.csv`. Both use a common **mixed event format** with `record_type`. The full app will eventually accept separate normalized employee, claim, leave and attendance imports.

## Column definitions

| Column | Type / example | Applies to | Requirement |
|---|---|---|---|
| `record_type` | Text: `employee`, `claim`, `leave`, `attendance` | All | Required |
| `record_id` | Text: `TST-REC-00001` | All | Required and unique per import |
| `employee_id` | Text: `EMP-0101` | All | Required; keep leading zeros |
| `employee_name` | Text: `Aina Rahman` | All | Required for test display |
| `department` | Approved department name | All | Required; validate against taxonomy |
| `work_email` | `aina.rahman@example.test` | Employee/all example events | Applicable to employee master; other rows may duplicate snapshot context |
| `employment_status` | `Active`, `Inactive` | Employee/all example events | Optional for event rows |
| `event_date` | `YYYY-MM-DD` | All | Required; event date |
| `claim_id` | Text: `TST-CLM-00002` | Claim | Required and unique |
| `claim_category` | Transport, Parking, Meal, Travel, Training, Office supplies | Claim | Required |
| `claim_amount` | Decimal MYR: `125.00` | Claim | Non-negative ordinary claim amount |
| `claim_description` | Text: `Taxi reimbursement` | Claim | Required; inspect for prohibited sensitive text |
| `leave_id` | Text: `TST-LEV-00003` | Leave | Required |
| `leave_type` | Annual, Medical, Emergency, Compassionate | Leave | Required |
| `leave_start` | `YYYY-MM-DD` | Leave | Required |
| `leave_end` | `YYYY-MM-DD` | Leave | Required; not before start |
| `leave_days` | Integer like `2` | Leave | Required; consistent with dates and calendar policy |
| `check_in` | ISO timestamp with offset | Attendance | Required |
| `check_out` | ISO timestamp with offset | Attendance | Required after completed shift, with exceptions |
| `approval_status` | Approved, Pending, Submitted | All | Required in this demo |
| `source_updated_at` | `YYYY-MM-DD` | All | Timeliness reference |

## Rules and test examples

| Rule | Trigger | Severity proposal | Policy |
|---|---|---|---|
| `EMP_REQUIRED_ID` | Blank `employee_id` | High | `EMP-001` |
| `EMP_EMAIL_FORMAT` | Invalid employee email pattern | Low | `EMP-002` |
| `EMP_INVALID_DEPT` | Department not recognized | Medium | `EMP-003` |
| `CLM_DUPLICATE_ID` | Repeated `claim_id` | High | `CLAIM-DUP-002` |
| `CLM_PII_BANK` | Bank-like text in `claim_description` | Critical | `CLAIM-PII-001` |
| `CLM_NEGATIVE_AMOUNT` | Negative ordinary claim | High | `CLAIM-VAL-003` |
| `CLM_AMOUNT_ANOMALY` | Over RM 2,000 illustrative threshold | Medium review flag | `CLAIM-ANOM-004` |
| `LEV_DATE_ORDER` | `leave_end` before `leave_start` | High | `LEV-002` |
| `ATT_MISSING_CHECKOUT` | Checkout missing after grace period | Medium | `ATT-003` |

### Important caveats

- Empty claim fields in an attendance row are **not errors**; they are not applicable.
- PII is not automatically forbidden everywhere; claim free-text is a prohibited location.
- A large claim may be genuine. The threshold is for teaching and review, not a fraud accusation.
- The browser starter runs only a subset of checks; the full Python engine will add cross-record validation, accuracy/consistency calculations and more robust PII detection.
- Scores in the UI are illustrative until linked to actual applicable-check calculations.

## Intended production relational tables

`organizations`, `departments`, `user_profiles`, `user_department_access`, `employees`, `claims`, `leave_records`, `attendance_records`, `import_batches`, `import_row_lineage`, `validation_rules`, `validation_results`, `findings`, `ai_recommendations`, `cases`, `correction_submissions`, `record_revisions`, `policy_documents`, `policy_versions`, `quality_snapshots`, `notifications`, `audit_events`, `report_jobs`.

See the separate full application specification for field-level database design and REST API contracts.
