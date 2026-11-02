# Sample Attendance Recording Policy

**Policy ID:** ATTENDANCE-2026  
**Version:** 1.1  
**Owner:** HR Operations  
**Effective:** 2026-01-01  
**Status:** FICTIONAL SAMPLE.

## Required information

Every attendance event should contain a valid employee ID, attendance date and a check-in record. A check-out may be pending while a shift remains in progress.

**ATT-003 — Missing checkout:** If the configured shift-end grace period has passed and `check_out` is blank, create a medium-severity finding. Do not flag a currently active shift prematurely.

**ATT-004 — Time ordering:** A checkout earlier than check-in may be invalid, but the engine must first account for overnight shifts, daylight saving or timezone conversion.

**ATT-005 — Duplicate punches:** Repeated punches may indicate an import duplicate or a legitimate split shift. Route ambiguous cases to a reviewer.

## Correction process

Ask the employee for their actual times and supervisor confirmation. The corrected canonical attendance record needs HR approval and change history. Record-quality scores must not be treated as employee conduct or performance ratings.
