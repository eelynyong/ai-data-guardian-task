
import math
import re
from collections import Counter
from datetime import date, datetime, time
from statistics import median
from typing import Any

from app.schemas import AnalyzeResponse, Finding


CLAIM_FIELDS = [
    "employee_id",
    "department",
    "email",
    "claim_id",
    "claim_amount",
]

ATTENDANCE_FIELDS = [
    "employee_id",
    "check_in",
]

LEAVE_FIELDS = [
    "employee_id",
    "leave_start",
    "leave_end",
]

EMAIL_REGEX = re.compile(
    r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
)

BANK_NUMBER_REGEX = re.compile(
    r"\b\d{10,18}\b"
)

PII_KEYWORDS = [
    "bank account",
    "account number",
    "password",
    "passport number",
]


def clean(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def parse_amount(value: str) -> float | None:
    try:
        amount = float(value)
        if math.isfinite(amount) and amount >= 0:
            return amount
    except (ValueError, TypeError, OverflowError):
        pass
    return None


def parse_timestamp(value: str):
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        pass

    try:
        return time.fromisoformat(value)
    except ValueError:
        return None


def has_potential_pii(value: str) -> bool:
    lower_value = value.lower()

    return (
        any(keyword in lower_value for keyword in PII_KEYWORDS)
        or bool(BANK_NUMBER_REGEX.search(value))
    )


def analyze_rows(
    rows: list[dict[str, Any]]
) -> AnalyzeResponse:

    findings: list[Finding] = []

    # Legacy CSV rows without record_type are claims.
    def record_type(row: dict[str, Any]) -> str:
        return clean(row.get("record_type")).lower() or "claim"

    claim_rows = [
        row for row in rows
        if record_type(row) == "claim"
    ]

    claim_counts = Counter(
        clean(row.get("claim_id"))
        for row in claim_rows
        if clean(row.get("claim_id"))
    )

    valid_amounts = []

    for row in claim_rows:
        amount = parse_amount(
            clean(row.get("claim_amount"))
        )
        if amount is not None:
            valid_amounts.append(amount)

    typical_amount = (
        median(valid_amounts) if valid_amounts else 0
    )

    def add_finding(
        row_number: int,
        row: dict[str, Any],
        field: str,
        issue_type: str,
        severity: str,
        policy: str,
        recommendation: str,
        detail: str = "",
    ) -> None:

        findings.append(
            Finding(
                id=f"FIND-{len(findings) + 1:05d}",
                employeeId=clean(row.get("employee_id"))
                or "(missing)",
                employee=clean(row.get("employee_name"))
                or clean(row.get("employee_id"))
                or "Unknown",
                department=clean(row.get("department"))
                or "Unmapped",
                row=row_number,
                field=field,
                type=issue_type,
                severity=severity,
                detail=detail or issue_type,
                policy=policy,
                recommendation=recommendation,
                maskedValue="[REDACTED]",
                date="Current upload",
                status="Open",
            )
        )

    def check_required(
        row_number: int,
        row: dict[str, Any],
        required_fields: list[str],
    ) -> None:

        for field in required_fields:
            if not clean(row.get(field)):
                add_finding(
                    row_number,
                    row,
                    field,
                    "Missing required data",
                    "High",
                    "HR-DQ-001",
                    f"Ask HR to complete {field}.",
                    f"Required field {field} is empty.",
                )

    def check_email(
        row_number: int,
        row: dict[str, Any],
    ) -> None:

        email = clean(row.get("email"))

        if email and not EMAIL_REGEX.fullmatch(email):
            add_finding(
                row_number,
                row,
                "email",
                "Invalid email format",
                "Medium",
                "HR-DQ-003",
                "Ask the employee to verify their email.",
                "The email address has an invalid format.",
            )

    def check_claim(
        row_number: int,
        row: dict[str, Any],
    ) -> None:

        check_required(row_number, row, CLAIM_FIELDS)

        claim_id = clean(row.get("claim_id"))

        if claim_id and claim_counts[claim_id] > 1:
            add_finding(
                row_number,
                row,
                "claim_id",
                "Duplicate claim ID",
                "High",
                "HR-CLAIM-002",
                "Review repeated claims and receipts.",
                "This claim ID appears more than once.",
            )

        amount_text = clean(row.get("claim_amount"))

        if amount_text:
            amount = parse_amount(amount_text)

            if amount is None:
                add_finding(
                    row_number,
                    row,
                    "claim_amount",
                    "Invalid claim amount",
                    "High",
                    "HR-CLAIM-004",
                    "Verify the claim amount.",
                    "Claim amount must be a valid non-negative number.",
                )
            else:
                unusual = (
                    amount > 5000
                    or (
                        typical_amount > 0
                        and amount > typical_amount * 5
                        and amount > 500
                    )
                )

                if unusual:
                    add_finding(
                        row_number,
                        row,
                        "claim_amount",
                        "Unusual claim amount",
                        "Medium",
                        "HR-CLAIM-005",
                        "Review against the claim policy.",
                        "Claim amount is unusually high.",
                    )

    def check_attendance(
        row_number: int,
        row: dict[str, Any],
    ) -> None:

        check_required(
            row_number, row, ATTENDANCE_FIELDS
        )

        check_in = clean(row.get("check_in"))
        check_out = clean(row.get("check_out"))

        if check_in and not check_out:
            add_finding(
                row_number,
                row,
                "check_out",
                "Missing checkout",
                "Medium",
                "HR-ATT-001",
                "Confirm the employee's checkout time.",
                "Check-in exists but checkout is missing.",
            )

        parsed_in = (
            parse_timestamp(check_in) if check_in else None
        )
        parsed_out = (
            parse_timestamp(check_out) if check_out else None
        )

        for field, value, parsed in [
            ("check_in", check_in, parsed_in),
            ("check_out", check_out, parsed_out),
        ]:
            if value and parsed is None:
                add_finding(
                    row_number,
                    row,
                    field,
                    "Invalid attendance timestamp",
                    "High",
                    "HR-ATT-002",
                    f"Verify the {field} value.",
                    "Timestamp format is invalid.",
                )

        if parsed_in is not None and parsed_out is not None:
            try:
                if type(parsed_in) is not type(parsed_out):
                    raise TypeError

                if parsed_out < parsed_in:
                    add_finding(
                        row_number,
                        row,
                        "check_out",
                        "Invalid attendance time range",
                        "High",
                        "HR-ATT-003",
                        "Verify check-in and checkout times.",
                        "Checkout precedes check-in.",
                    )
            except TypeError:
                add_finding(
                    row_number,
                    row,
                    "check_out",
                    "Inconsistent attendance timestamps",
                    "Medium",
                    "HR-ATT-004",
                    "Use consistent date and time formats.",
                    "Attendance timestamps cannot be compared.",
                )

    def check_leave(
        row_number: int,
        row: dict[str, Any],
    ) -> None:

        check_required(row_number, row, LEAVE_FIELDS)

        start_text = clean(row.get("leave_start"))
        end_text = clean(row.get("leave_end"))

        if not (start_text and end_text):
            return

        try:
            start_date = date.fromisoformat(start_text)
            end_date = date.fromisoformat(end_text)
        except ValueError:
            add_finding(
                row_number,
                row,
                "leave_start",
                "Invalid leave date format",
                "High",
                "HR-LEAVE-001",
                "Use valid YYYY-MM-DD leave dates.",
                "One or both leave dates are invalid.",
            )
            return

        if end_date < start_date:
            add_finding(
                row_number,
                row,
                "leave_end",
                "Invalid leave dates",
                "High",
                "HR-LEAVE-002",
                "Verify the requested leave date range.",
                "Leave end date is before start date.",
            )

    for row_number, row in enumerate(rows, start=2):
        kind = record_type(row)

        if kind == "claim":
            check_claim(row_number, row)
        elif kind == "attendance":
            check_attendance(row_number, row)
        elif kind == "leave":
            check_leave(row_number, row)
        else:
            add_finding(
                row_number,
                row,
                "record_type",
                "Unsupported record type",
                "High",
                "HR-DQ-007",
                "Use claim, attendance, or leave.",
                "Record type is not supported.",
            )

        # Validate provided email across record types.
        if kind in ("claim", "attendance", "leave"):
            check_email(row_number, row)

        # Detect possible sensitive data without
        # returning the original value in the finding.
        for field in ("claim_description", "leave_reason"):
            value = clean(row.get(field))

            if value and has_potential_pii(value):
                add_finding(
                    row_number,
                    row,
                    field,
                    "Potential sensitive information",
                    "High",
                    "HR-PII-006",
                    "Review and remove prohibited sensitive data.",
                    "Possible sensitive content detected.",
                )

    affected_rows = {
        finding.row for finding in findings
    }

    quality_score = round(
        (
            (len(rows) - len(affected_rows))
            / len(rows)
        ) * 100,
        2,
    )

    return AnalyzeResponse(
        rowsAnalyzed=len(rows),
        totalFindings=len(findings),
        qualityScore=quality_score,
        findings=findings,
    )
