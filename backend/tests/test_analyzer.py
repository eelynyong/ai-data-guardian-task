
from app.analyzer import analyze_rows


def make_row(**changes):
    row = {
        "employee_id": "EMP001",
        "department": "Finance",
        "email": "ali@example.com",
        "claim_id": "CLM001",
        "claim_amount": "100",
        "claim_description": "Taxi",
    }

    row.update(changes)
    return row


def test_clean_data():
    result = analyze_rows([make_row()])

    assert result.rowsAnalyzed == 1
    assert result.totalFindings == 0
    assert result.qualityScore == 100


def test_missing_email():
    result = analyze_rows([
        make_row(email="")
    ])

    assert any(
        finding.type == "Missing required data"
        for finding in result.findings
    )


def test_duplicate_claims():
    result = analyze_rows([
        make_row(),
        make_row(
            employee_id="EMP002",
            claim_id="CLM001"
        )
    ])

    duplicates = [
        finding
        for finding in result.findings
        if finding.type == "Duplicate claim ID"
    ]

    assert len(duplicates) == 2


def test_invalid_email():
    result = analyze_rows([
        make_row(email="invalid-email")
    ])

    assert any(
        finding.type == "Invalid email format"
        for finding in result.findings
    )


def test_unusual_claim():
    result = analyze_rows([
        make_row(claim_amount="25000")
    ])

    assert any(
        finding.type == "Unusual claim amount"
        for finding in result.findings
    )


def test_sensitive_information():
    result = analyze_rows([
        make_row(
            claim_description="Bank account 123456789012"
        )
    ])

    assert any(
        finding.type == "Potential sensitive information"
        for finding in result.findings
    )

    assert all(
        "123456789012" not in finding.maskedValue
        for finding in result.findings
    )
