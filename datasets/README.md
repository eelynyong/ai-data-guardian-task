# Synthetic HR datasets

All names, employee identifiers, emails, and bank-like patterns are fictional. The domain `example.test` is reserved for examples. Never replace these datasets with real HR records in a public GitHub repository.

## Files

- `hr_train.csv`: 1,500 mixed HR event rows used to calibrate/test rules during development.
- `hr_test.csv`: 400 separate mixed HR event rows with seeded issues; use as a holdout evaluation set.
- `evaluation_answer_key.json`: exact row and rule IDs for **deliberately planted** issues in both files. This is a ground-truth reference, not a complete claim that all other rows are error-free.

Run `node scripts/generate_synthetic_data.mjs` from the project root to regenerate the same datasets.

## Four event types in exactly two CSV files

The `record_type` field is one of `employee`, `claim`, `leave`, or `attendance`. Event-specific fields are intentionally blank for other types; these blanks must not lower completeness. A claim row legitimately has blank attendance times, for example.

The production application should accept separate normalized CSVs for employee master data, claims, leave and attendance. This two-file mixed format satisfies the POC training/test deliverable while keeping the number of CSVs exactly two.

## Usage

1. Open `hr_test.csv` in Excel or VS Code to explore its fields.
2. Launch the React starter with `npm run dev`.
3. Open **Data imports**, choose `hr_test.csv`, then review detected cells.
4. Use `evaluation_answer_key.json` to compare planted issues with detected issues. Some rules, like leave-vs-attendance cross-record consistency, require the future Python backend.
5. Do not use the test answer key for rule tuning; keep it for final evaluation.

The frontend's lightweight browser scan is a teaching demo. It is intentionally narrower than the planned FastAPI rule engine.
