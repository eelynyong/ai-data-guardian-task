# Next steps: connect the full stack

This is the sequence to follow **after** the React starter is working on both developers' computers.

## Stage A — Secure accounts and database

1. Create an approved Supabase project **for synthetic development data only**. Confirm your organization permits the service before using real HR data.
2. Turn on Auth. Use invitation-only HR accounts and a separate employee role.
3. Create SQL migrations for `departments`, `user_profiles`, `employees`, `claims`, `leave_records`, `attendance_records`, `import_batches`, `findings`, `cases`, `notifications` and `audit_events`. Add the remaining tables iteratively.
4. Add and test Row Level Security. An HR Officer assigned to Finance must not query IT employee records through an API ID guess.
5. Add a login page and persist only safe user/session state in the frontend.

## Stage B — Express middleware

1. Create a separate `apps/api/` Node.js + TypeScript + Express project.
2. Implement a `/health` endpoint first.
3. Verify Supabase access tokens in authenticated middleware.
4. Add role/department authorization middleware, request validation, rate limits, redacted logs and error responses.
5. Implement `GET /api/v1/dashboard/overview`, `/employees`, `/findings`, and `POST /imports/upload-intent` according to the specification.

## Stage C — Python quality engine

1. Create `services/quality-engine/` with a Python virtual environment and FastAPI.
2. Add parser and schema validation for each supported record type.
3. Add unit tests using `datasets/hr_train.csv` and `datasets/hr_test.csv`.
4. Implement checks with exact source-row mapping. Keep a check version, severity, masked preview and policy ID for each finding.
5. Calculate quality scores from applicable checks; do not count non-applicable blank columns as failures.
6. Add additional cross-record checks: employee master references, leave vs attendance and near-duplicate claims.

## Stage D — Cloud Storage uploads

1. Ask your GCP administrator for an approved development project and private bucket.
2. Store source CSV files using short-lived signed upload permissions; prevent public access.
3. Verify file size, hash, MIME/content and permission before scanning.
4. Process uploads asynchronously in a worker. Write status (`queued`, `processing`, `completed`, `failed`) to the database.
5. Keep raw originals immutable and issue/correction revisions separately.

## Stage E — Gemini Enterprise

1. Confirm whether your company/school account permits developer API access, a cloud project, the correct data-store permissions and billing.
2. Use your organization's approved integration option. Do not assume the end-user subscription includes API credentials.
3. Upload **approved** policy documents or create a retrieval store as authorized; track version/effective date.
4. Pass only redacted finding summaries and relevant policy text to Gemini.
5. Require structured JSON responses with recommended action and citations.
6. Let HR review advice before sending correction requests. Keep deterministic template guidance available when Gemini is unavailable.

## Stage F — Employee workflow

1. Add a persistent `cases` table and employee linkage.
2. HR creates case → employee sees request only for own employee ID.
3. Employee submits proposed corrected fields.
4. HR reviews and approves/rejects.
5. On approval, write a canonical record revision and rerun the relevant checks.
6. Update snapshots and audit history; optionally add approved email delivery.

## Stage G — hardening and deployment

1. Add end-to-end tests, least-privilege service accounts, backup and retention rules, accessibility review, load/error testing and monitoring.
2. Use separate dev/staging/production environments.
3. Never commit `.env`, GCP key JSON, API keys or real employee data to GitHub.
4. Publish only after a security/privacy review by relevant owners.

Official reference docs: https://supabase.com/docs/guides/auth, https://cloud.google.com/storage/docs, https://fastapi.tiangolo.com/, https://expressjs.com/, https://docs.cloud.google.com/gemini/enterprise/docs/developer-guide.
