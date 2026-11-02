# Sample Employee Master Data Standard

**Policy ID:** EMP-DATA-2026  
**Version:** 1.1  
**Owner:** HR Systems  
**Effective:** 2026-01-01  
**Status:** FICTIONAL SAMPLE.

## Required fields

`employee_id`, `employee_name`, `department`, `employment_status`, and an applicable organizational contact field.

**EMP-001 — Required ID:** An active HR event must be linkable to a known employee ID. Missing IDs are high-severity completeness failures.

**EMP-002 — Work email:** When a company email is required, it must be syntactically valid. A format match does not prove an email address exists or belongs to the person.

**EMP-003 — Department code:** Department must be from the approved organization taxonomy; unknown values should prompt mapping or correction.

**EMP-004 — Timeliness:** Review records whose employee contact details have not been verified within the organization's configured period. No universal period is imposed in this sample.

**EMP-005 — Identity uniqueness:** Employee IDs must be unique within the relevant active employee-master population. Duplicate event rows across months are not necessarily duplicate employees.

## Interpretation of quality scores

A personal data-quality percentage describes relevant HR record checks, *not employee performance*. Do not compare employees with different applicable check counts without showing denominators.
