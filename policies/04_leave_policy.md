# Sample Leave Management Policy

**Policy ID:** LEAVE-2026  
**Version:** 1.0  
**Owner:** HR Operations  
**Effective:** 2026-01-01  
**Status:** FICTIONAL SAMPLE.

## Required information

Leave events require `employee_id`, `leave_id`, `leave_type`, `leave_start`, `leave_end`, leave duration and approval status.

**LEV-002 — Date order:** `leave_end` must not be earlier than `leave_start`.

**LEV-003 — Duration consistency:** Recorded leave duration should agree with relevant working-day, half-day and public-holiday rules. The demo dataset counts simple calendar days only.

**LEV-004 — Overlapping leave:** Two approved overlapping leave records for the same employee require a review.

**LEV-005 — Leave/attendance mismatch:** An approved full-day leave overlapping a confirmed full-day attendance record is a consistency *flag*; it might reflect an amended leave request or an authorized shift.

## Review

HR checks the roster/approval history, seeks clarification, and creates a versioned correction record. Do not automatically cancel leave or amend attendance from an AI suggestion.
