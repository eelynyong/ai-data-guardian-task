# Sample HR Data Quality Correction Procedure

**Policy ID:** CORRECTION-2026  
**Version:** 1.0  
**Owner:** HR Manager  
**Effective:** 2026-01-01  
**Status:** FICTIONAL SAMPLE.

## 1. Triage

1. The system records an issue with source file, row, field, rule, severity and masked evidence.
2. An authorized HR Officer checks whether the issue is genuine or a false positive.
3. Critical privacy cases receive restricted handling; no confidential value should be replicated in notifications or AI prompts.

## 2. Assign and notify

4. HR creates a case, assigns it, chooses a due date and drafts a correction request.
5. HR reviews the message before sending it through an approved channel.
6. The employee sees only their own request and editable allowed fields.

## 3. Correct and approve

7. Employee submits a proposed correction without directly overwriting the original CSV evidence.
8. HR verifies supporting information and approves or rejects with a reason.
9. On approval, the system writes a versioned canonical record and reruns relevant rules.
10. If the issue passes, mark it resolved and update the data-quality snapshot. Otherwise return it for further clarification.

## 4. Audit and exception handling

- Keep actor identity, timestamp, previous and new statuses, review reason, source policy version and record revision.
- False-positive dismissals must include an explanation.
- Suggestions from Gemini remain advisory; HR authorizes permanent data changes.
- Case aging/escalation deadlines are configurable according to approved internal policy.
