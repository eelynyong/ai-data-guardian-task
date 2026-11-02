# AI Data Guardian — frontend UI/UX design

## 1. User experience goal

An HR Officer should be able to upload synthetic data, find an error, understand why it was flagged, ask an employee for a correction and confirm that the issue is closed without becoming lost in the interface.

The React starter is a **clickable local prototype**, not a production HR application. Page figures and employee scores are illustrative until real backend scoring is integrated.

## 2. Visual direction

- **Style:** Calm, professional HR operations console with modern cards, large readable numbers, clean tables and visible source evidence.
- **Sidebar:** Deep navy `#101C33`; active navigation dark blue with mint accent.
- **Main canvas:** Soft gray `#F5F7FB`; cards white `#FFFFFF`.
- **Primary action:** Blue `#286FE6` for upload, review and submit.
- **Positive:** Teal/green for resolved, improving and healthy quality.
- **Attention:** Amber for medium/high issues; red for critical privacy findings.
- **Typography:** Manrope headings + DM Sans body, with system-font fallbacks.
- **Rounding:** 9–13px for controls/cards; generous but compact table spacing.
- **Responsive:** Sidebar collapses to drawer on narrow/mobile screens; tables scroll horizontally instead of truncating data.

## 3. Navigation map

```text
HR Workspace
├── Overview
├── Data imports
│   └── CSV document review
├── Departments
│   └── Employees filtered by department
├── Employees
│   └── Employee detail drawer
├── Issue center
│   └── Finding evidence and action drawer
├── AI assistant (preset demo)
├── Policy library
├── Notifications
└── Reports

Employee Workspace (simulated role switch)
├── My corrections
├── Notifications
└── Policies
```

## 4. Screens and user actions

| Screen | Main UI elements | Action in current starter | Production integration needed |
|---|---|---|---|
| Overview | KPI cards, department bars, trend graph, recent issue list, AI insight preview | Select department, open details, navigate to import or issues | Aggregated quality snapshots and real counts |
| Departments | Five clickable department cards, percentages, employee counts | Click department → employees filtered | Authorized department aggregates |
| Employees | Searchable table, scores, detail drawer | Search, open person, inspect related issue | Supabase row-level access, record-level quality |
| Data imports | File picker, sample loader, preview, red problem cells | Load synthetic CSV, parse, run local rules, open flagged cells | GCS upload, FastAPI checks, job progress and lineage |
| Issue center | Filters, severity/status pills, evidence drawer | Filter, mark resolved/dismissed, create demo correction | Case workflow, audit, approval and actor checks |
| AI assistant | Prompt suggestions and generated demo guidance | Ask for preset guidance based on simple keywords | Approved Gemini Enterprise API + grounded retrieval |
| Policy library | Six policy cards with sample metadata | Read catalog; actual Markdown source in `policies/` | Versioned policy database, document upload/index |
| Notifications | Case status activity | Open linked issue or employee request | User-specific persistent notifications/email |
| Reports | KPI summary, trend, export button | Download simple local findings CSV | PDF generation, filters, authorized signed downloads |
| My corrections | Assigned Nur Iman sample request | Simulate correction submission/status | Real employee Auth, editable field forms, approval |

## 5. Important interaction rules

1. On a CSV preview, visually highlight the **specific cell**. Opening it shows source row, column, masked value, rule, evidence and proposed action.
2. Mark unusual patterns as **review flags**, not fraud or policy breaches without evidence.
3. Never show full bank-account-like values in notification text, chat output or ordinary finding cards.
4. Use severity colors **plus text labels**, so color-blind users can interpret alerts.
5. Department filters must constrain employee lists and issue results together.
6. AI recommendations must be clearly labeled as advisory. The current starter labels them as preset demo output.
7. No real employee should receive a message until an authorized HR user reviews the request.
8. Quality scores describe **record quality**, never employee performance.
9. All controls have a visible action; backend-only functions are labeled as future integrations.

## 6. Suggested production pages beyond this starter

Build the remaining screens after backend authentication and data contracts are ready:

- Login, password recovery, invitation acceptance.
- Dedicated department analytics view and full employee detail record tabs.
- Import mapping wizard and multi-step progress/history.
- Case assignment with due dates, approver, notes and full timeline.
- Policy editor/upload, effective-date approval and section citations.
- User/role management, department grants, audit event viewer and settings.
- Real employee edit form with field-level validation and HR approval.

## 7. Accessibility & UX checklist

- [ ] All important actions work from keyboard.
- [ ] Inputs and icon-only buttons have labels.
- [ ] Empty, loading, success and error states are explained.
- [ ] Color contrast is readable; severity includes text.
- [ ] Tables remain scrollable on smaller screens.
- [ ] Sensitive cells are masked consistently.
- [ ] Confirm destructive/high-risk HR changes before saving.
- [ ] Users can return to filtered list after reviewing a detail.
- [ ] Charts include definitions, time range and relevant denominators.

## 8. Figma (optional, free-tier dependent)

You can recreate this visual system in Figma or Penpot. Make a page called `Design System`, then frames: `Overview`, `CSV Review`, `Issue Center`, `Employee Portal`. Design at desktop width 1440px and mobile width 390px. Use 8px spacing increments, reusable buttons/cards/tables and the colors above. A design file is helpful but not required: the coded React prototype is already the initial UI reference.
