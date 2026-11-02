
# AI Data Guardian
### AI-Powered HR Data Quality Management Platform

**Project:** AI Data Integration  
**Team Members:** Eelyn & Nabila  
**Repository:** ai-data-guardian-task

## Project Overview

AI Data Guardian is a full-stack web application designed to help Human Resources (HR) teams monitor, analyze, and improve the quality of employee-related data.

The application will identify missing information, duplicate records, invalid data, potentially sensitive information (PII), and unusual patterns in HR datasets.

It will also provide AI-assisted recommendations to help HR teams understand and resolve data quality issues.

## Project Objectives

- Monitor HR data quality across departments.
- Detect missing, duplicate, invalid, and inconsistent data.
- Detect sensitive information in claims and other HR records.
- Identify unusual patterns in claims, leave, and attendance.
- Display department and employee record-quality scores.
- Highlight problematic CSV rows and columns.
- Provide policy-grounded AI recommendations.
- Allow HR staff to review and manage data correction requests.
- Notify employees when corrections are required.
- Maintain records of data quality findings and resolutions.

## Technology Stack

| Layer | Technology | Owner |
|---|---|---|
| Frontend | React.js + TypeScript | Eelyn |
| Middleware | Node.js + Express.js | Eelyn |
| Backend | Python + FastAPI | Nabila |
| AI Integration | Gemini Enterprise | Planned |
| Storage | Google Cloud Storage | Planned |
| Database | Supabase or Firestore | To be finalized |
| Version Control | Git + GitHub | Both |
| Development Environment | Visual Studio Code | Both |

## Project Structure

```text
ai-data-guardian-task/
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── demoData.ts
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.ts
│
├── middleware/
│   └── README.md
│
├── backend/
│   └── README.md
│
├── datasets/
│   ├── hr_train.csv
│   ├── hr_test.csv
│   └── evaluation_answer_key.json
│
├── policies/
├── docs/
├── scripts/
├── .gitignore
└── README.md
```

## Team Responsibilities

### Eelyn — Frontend & Middleware

Frontend responsibilities:

- Design the HR dashboard and user interface.
- Implement overview, employee, and department pages.
- Develop CSV upload and document-review interfaces.
- Display issue detection results.
- Build AI recommendation screens.
- Develop HR and employee notification interfaces.
- Integrate frontend components with API endpoints.

Middleware responsibilities:

- Develop Express API routes.
- Connect React frontend to FastAPI backend.
- Handle requests and responses.
- Integrate authentication and role authorization.
- Coordinate CSV processing workflows.
- Connect middleware to database and storage services.
- Handle errors and API validation.

### Nabila — Backend

Backend responsibilities:

- Develop Python FastAPI services.
- Build HR data quality validation logic.
- Detect missing and duplicate records.
- Detect invalid information and sensitive data.
- Analyze unusual data patterns.
- Generate data quality results.
- Integrate backend AI services as agreed.
- Test backend functionality using synthetic datasets.

## Planned Application Features

### 1. Authentication
- HR login and logout.
- Multiple HR user accounts.
- Role-based access.
- Employee self-service access.

### 2. HR Dashboard
- Overall data quality score.
- Claims, leave, and attendance overview.
- Department-level quality percentages.
- Employee-level record-quality details.
- Trend and issue summary charts.

### 3. CSV Data Upload
- Upload HR datasets in CSV format.
- Analyze uploaded records.
- Display detected data quality issues.
- Highlight affected rows and columns.

### 4. Data Quality Detection
- Missing information.
- Duplicate records.
- Invalid values.
- Sensitive information in claims.
- Unusual claims and attendance patterns.
- Inconsistent leave and attendance records.

### 5. AI Recommendations
- Explain detected data quality issues.
- Suggest corrective actions.
- Reference relevant HR policies.
- Support HR review before action.

### 6. Correction Workflow
- HR reviews detected issues.
- HR requests corrections from employees.
- Employees submit corrected information.
- HR reviews and approves corrections.
- Findings are revalidated and tracked.

### 7. Reports
- Data quality summaries.
- Department comparisons.
- Issue status reports.
- Exportable results.

## Current Development Status

The project is currently a proof of concept (POC).

**Available in the React frontend demo:**

- HR dashboard UI.
- Department and employee pages.
- Synthetic CSV upload and browser-based rule checks.
- Highlighted data quality findings.
- Issue review interface.
- Simulated employee correction workflow.
- Policy library interface.
- Preset AI recommendation demonstrations.

**Not yet implemented:**

- Real user authentication.
- Express middleware API.
- FastAPI quality engine.
- Persistent database.
- Cloud Storage integration.
- Live Gemini Enterprise integration.
- Real employee notifications.

The frontend currently uses synthetic sample data and demo functionality.

## Running the Frontend

### Requirements

- Node.js
- npm
- Visual Studio Code

### Windows PowerShell

Open a terminal in the project root:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the URL displayed in the terminal, usually:

http://127.0.0.1:5173

### Test the Frontend Build

While inside the `frontend` folder:

```powershell
npm.cmd run build
```

### Verify Synthetic Datasets

```powershell
npm.cmd run test:data
```

## Dataset Information

The `datasets/` folder contains synthetic HR data for development and testing.

- `hr_train.csv` — 1,500 synthetic records.
- `hr_test.csv` — 400 synthetic records.
- `evaluation_answer_key.json` — documented seeded test issues.

These files contain fictional information created for testing.

**Do not upload real employee or sensitive HR data to the current prototype.**

## HR Policy Documents

The `policies/` folder contains fictional policy examples covering:

1. Claims and reimbursement.
2. Personal data protection.
3. Attendance management.
4. Leave management.
5. Employee data standards.
6. Data correction procedures.

These documents will support validation rules and future policy-grounded AI recommendations.

## Development Workflow

The `main` branch contains the integrated project.

Development should take place on feature branches.

Suggested branches:

- `feature/frontend`
- `feature/middleware`
- `feature/backend`
- `feature/ai-integration`

After implementation and testing, changes can be merged into `main` through Pull Requests.

## Documentation

Additional documentation is available in `docs/`, including:

- Full application specification.
- Frontend UI/UX design.
- Beginner setup guide.
- Data dictionary.
- Backend integration roadmap.
- Gemini policy setup guidance.
- Testing checklist.
- Final demo script.

Some original setup documents may refer to the starter's previous folder structure. Use the commands in this README for the current layout.

## Project Workflow

1. Upload CSV data.
2. Validate and analyze records.
3. Detect data quality issues.
4. Review highlighted findings.
5. Generate recommendations.
6. Request employee corrections.
7. Review corrected information.
8. Update quality results and reports.

## Security Note

This project is currently intended for development using synthetic data.

Before handling real HR information, the application will require authentication, authorization, secure storage, access controls, audit logging, and appropriate privacy and security reviews.

---

**AI Data Guardian — AI Data Integration Project**

Developed by Eelyn & Nabila.
