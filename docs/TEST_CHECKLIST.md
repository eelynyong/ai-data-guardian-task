# Frontend and dataset test checklist

## Local frontend

- [ ] `npm install` completes.
- [ ] `npm run build` succeeds without TypeScript errors.
- [ ] `npm run dev` displays a URL that opens the dashboard.
- [ ] Overview renders metrics and quality bars.
- [ ] Department filter changes visible department and employee/issue lists.
- [ ] Employee detail drawer opens and closes.
- [ ] **Load example** analyzes 7 rows and highlights issues.
- [ ] Upload `hr_test.csv` and see rule findings.
- [ ] Click red spreadsheet cell and see correct row/field with masked value.
- [ ] Issue filter by severity and keyword works.
- [ ] Request correction on Nur Iman's issue, switch to Employee and submit demonstration response.
- [ ] Switch to HR and mark that issue resolved.
- [ ] AI assistant labels its response a preset demonstration.
- [ ] Reports export contains issue IDs and status, but no raw sensitive values.
- [ ] Mobile/narrow layout exposes navigation drawer and horizontally scrollable tables.

## Dataset checks

- [ ] `hr_train.csv` has 1,500 data rows.
- [ ] `hr_test.csv` has 400 data rows.
- [ ] CSV headers match `DATA_DICTIONARY.md`.
- [ ] Record types include employee, claim, leave and attendance.
- [ ] Seeded test issues appear in `evaluation_answer_key.json`.
- [ ] No real employee IDs, personal emails or bank account numbers are used.
- [ ] Re-running generator produces identical files for the same script version.

## Full production integration (future)

- [ ] Unauthorized department/employee API requests are denied.
- [ ] Exact CSV provenance persists after import.
- [ ] PII is masked before Gemini requests and notifications.
- [ ] Rule outcomes and quality scores are deterministic and versioned.
- [ ] HR approval is required before canonical record changes.
- [ ] Audit log captures all mutations, including false-positive dismissal.
- [ ] AI API outage does not block deterministic validation.
