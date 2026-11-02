# AI Data Guardian — beginner React frontend starter

This is a **working React + TypeScript frontend prototype** for an HR data-quality tool. It is intended for local learning and a synthetic-data demo. It is **not** yet connected to an authentication server, Gemini Enterprise, Supabase, Google Cloud Storage, Express or FastAPI.

## Start in 3 commands

```bash
npm install
npm run dev
```

Open the local address printed in the terminal (normally `http://127.0.0.1:5173`).

If you have never coded before, start with **[docs/START_HERE_BEGINNER_GUIDE.md](docs/START_HERE_BEGINNER_GUIDE.md)**. The instructions begin with installing Git, creating a GitHub account, installing VS Code and Node.js.

## What works today

- Responsive HR dashboard and department quality drill-down.
- Employee list, mock quality percentages and detail drawer.
- CSV file import preview and basic browser-side validation: required employee ID, duplicate claim ID, possible account number in claim text, negative/high claim amount, invalid leave ordering and missing attendance checkout.
- Clickable highlighted CSV cells and masked evidence.
- HR issue center with severity/status filters, local request/resolution buttons.
- Employee role-switch demonstration for a fictional employee, with in-app correction status.
- Policy cards, preset AI recommendation demonstration, local CSV issue-summary export.
- Two reproducible synthetic CSV datasets plus an answer-key manifest and six sample policy documents.

## What is NOT implemented yet

- Real login, passwords, authorization, persistent database or real employee identification.
- Real Gemini API calls, policy retrieval, PII de-identification service or cloud storage.
- Persistent issue/case history or real employee email notifications.
- Python backend cross-dataset validation and robust quality scoring.

**Never upload actual HR files to this browser-only proof of concept.** The scanner is simplified for learning, not a production security or compliance control.

## Important directories

| Folder | Contents |
|---|---|
| `src/` | React components, data and styles |
| `datasets/` | `hr_train.csv`, `hr_test.csv`, answer key, notes |
| `policies/` | Six fictional HR policy templates |
| `docs/` | Beginner guide, UI/UX design, API roadmap, data dictionary, demo guide |
| `scripts/` | Reproducible synthetic CSV generator and workbook builder |

## Scripts

- `npm run dev` — start development server.
- `npm run build` — type-check and compile the frontend for distribution.
- `npm run preview` — preview the production build locally.
- `node scripts/generate_synthetic_data.mjs` — regenerate deterministic synthetic CSVs.

## Suggested GitHub description

> AI Data Guardian is an HR data-quality management platform prototype that detects missing, duplicate, inconsistent and sensitive information in CSV datasets, visualizes department scores, and supports explainable AI recommendations and employee correction workflows.

See the project requirements/design in `docs/FRONTEND_UI_UX.md` and the future integration sequence in `docs/NEXT_BACKEND_STEPS.md`.

## Project Structure

- frontend/ — React + TypeScript (Eelyn)
- middleware/ — Node.js + Express (Eelyn)
- backend/ — Python + FastAPI (Nabila)
- datasets/ — Synthetic HR training and testing CSVs
- policies/ — HR policy documents
- docs/ — Documentation
- scripts/ — Dataset utilities

## Run Frontend

cd frontend
npm install
npm run dev