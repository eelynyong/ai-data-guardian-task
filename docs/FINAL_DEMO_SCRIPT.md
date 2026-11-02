# Final demo script — 8 to 12 minutes

## Preparation (before presentation)

1. Start the frontend (`npm run dev`).
2. Have `datasets/hr_test.csv` ready to select.
3. Keep `evaluation_answer_key.json` open if you want to explain how accuracy is evaluated.
4. Use the fictional sample policies; explicitly call the frontend AI response a **demo placeholder** unless Gemini has been integrated by then.

## Storyboard

| Time | Speaker action | What the audience sees |
|---|---|---|
| 0:00–1:00 | Introduce AI Data Guardian and the four HR data types | Overview dashboard and illustrative KPI cards |
| 1:00–2:00 | Filter Finance department | Department quality percentage and employee list |
| 2:00–3:30 | Select Data imports, upload `hr_test.csv` | CSV preview with highlighted issue cells |
| 3:30–5:00 | Open prohibited account detail, duplicate claim, invalid amount | Exact row/column, masked evidence and policy-backed guidance |
| 5:00–6:00 | Show Issue center and create correction request for sample employee Nur Iman | Status changes to awaiting employee |
| 6:00–7:00 | Switch role to Employee, submit a demonstration correction | Employee self-service interface |
| 7:00–8:00 | Switch back to HR Manager and mark issue resolved | Status, history demonstration |
| 8:00–9:00 | Ask a question in AI assistant | Preset response; explain Gemini will replace mock adapter |
| 9:00–10:00 | Open Policy library and Reports; export summary | Policy examples and CSV report |
| 10:00–12:00 | Explain architecture, train/test evaluation, limitations and next milestones | GitHub repository, diagrams, acceptance tests |

## What to say honestly

- "Today we are showing a functioning React frontend prototype with local rule checks and synthetic data."
- "The final architecture will use Express, FastAPI, Gemini Enterprise, Cloud Storage and Supabase. Those integrations are not present in this frontend starter yet."
- "Sensitive account-like values are masked in issue displays. Real data requires a full security review."
- "The synthetic answer key lets us evaluate the detection rules without exposing employee information."

## Questions to prepare for

- **What makes this AI?** Gemini will be used for context-aware policy-grounded explanations and recommendations; deterministic checks remain responsible for objective detections and scores.
- **What if AI is wrong?** HR reviews suggestions; no autonomous changes or misconduct judgments.
- **How do you protect data?** Role-based access, private storage, masking, redaction, audit logs, approved enterprise model access.
- **Why two datasets?** Train/calibration and independent holdout test to measure precision/recall.
