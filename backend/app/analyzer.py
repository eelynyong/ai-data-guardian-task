import re
from collections import Counter
from statistics import median
from typing import Any

from app.schemas import Finding, AnalyzeResponse


REQUIRED_FIELDS = [
    "employee_id",
    "department",
    "email",
    "claim_id",
    "claim_amount",
]

EMAIL_REGEX = re.compile(
    r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
)

BANK_NUMBER_REGEX = re.compile(
    r"\b\d{10,18}\b"
)


def clean(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def analyze_rows(
    rows: list[dict[str, Any]]
) -> AnalyzeResponse:

    findings = []

    claim_counts = Counter(
        clean(row.get("claim_id"))
        for row in rows
        if clean(row.get("claim_id"))
    )

    amounts = []

    for row in rows:
        value = clean(row.get("claim_amount"))

        try:
            amount = float(value)

            if 0 <= amount < float("inf"):
                amounts.append(amount)

        except ValueError:
            pass

    typical_amount = (
        median(amounts)
        if amounts else 0
    )

    def add_finding(
        row_number,
        row,
        field,
        issue_type,
        severity,
        policy,
        recommendation
    ):
        findings.append(
            Finding(
                id=f"FIND-{len(findings)+1:05d}",
                employeeId=clean(
                    row.get("employee_id")
                ),
                department=clean(
                    row.get("department")
                ),
                row=row_number,
                field=field,
                type=issue_type,
                severity=severity,
                policy=policy,
                recommendation=recommendation,
                maskedValue="[REDACTED]",
                status="Open"
            )
        )

    for row_number, row in enumerate(
        rows, start=2
    ):

        # 1. CHECK MISSING DATA

        for field in REQUIRED_FIELDS:

            if not clean(row.get(field)):
                add_finding(
                    row_number,
                    row,
                    field,
                    "Missing required data",
                    "High",
                    "HR-DQ-001",
                    f"Ask HR to complete {field}."
                )

        # 2. CHECK DUPLICATE CLAIMS

        claim_id = clean(row.get("claim_id"))

        if (
            claim_id
            and claim_counts[claim_id] > 1
        ):
            add_finding(
                row_number,
                row,
                "claim_id",
                "Duplicate claim ID",
                "High",
                "HR-CLAIM-002",
                "Review repeated claims and receipts."
            )

        # 3. CHECK EMAIL FORMAT

        email = clean(row.get("email"))

        if email and not EMAIL_REGEX.fullmatch(email):
            add_finding(
                row_number,
                row,
                "email",
                "Invalid email format",
                "Medium",
                "HR-DQ-003",
                "Ask the employee to verify their email."
            )

        # 4. CHECK CLAIM AMOUNT

        amount_text = clean(
            row.get("claim_amount")
        )

        if amount_text:

            try:
                amount = float(amount_text)

                if (
                    amount < 0
                    or amount == float("inf")
                    or amount == float("-inf")
                    or amount != amount
                ):
                    raise ValueError

            except ValueError:

                add_finding(
                    row_number,
                    row,
                    "claim_amount",
                    "Invalid claim amount",
                    "High",
                    "HR-CLAIM-004",
                    "Verify the claim amount."
                )

                amount = None

            # 5. CHECK UNUSUAL AMOUNTS

            if amount is not None:

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
                        "Review against the claim policy."
                    )

        # 6. CHECK POTENTIAL PII

        description = clean(
            row.get("claim_description")
        )

        lower_description = description.lower()

        keywords = [
            "bank account",
            "account number",
            "password",
            "passport number"
        ]

        has_keyword = any(
            word in lower_description
            for word in keywords
        )

        has_bank_number = bool(
            BANK_NUMBER_REGEX.search(description)
        )

        if has_keyword or has_bank_number:

            add_finding(
                row_number,
                row,
                "claim_description",
                "Potential sensitive information",
                "High",
                "HR-PII-006",
                "Review and remove prohibited sensitive data."
            )

    affected_rows = {
        finding.row for finding in findings
    }

    quality_score = round(
        (
            (len(rows) - len(affected_rows))
            / len(rows)
        ) * 100,
        2
    )

    return AnalyzeResponse(
        rowsAnalyzed=len(rows),
        totalFindings=len(findings),
        qualityScore=quality_score,
        findings=findings
    )