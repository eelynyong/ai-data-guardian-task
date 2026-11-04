
from app.analyzer import analyze_rows


def test_valid_attendance():
    rows = [{
        "record_type": "attendance",
        "employee_id": "EMP001",
        "check_in": "09:00",
        "check_out": "17:00",
    }]

    result = analyze_rows(rows)

    assert result.totalFindings == 0
    assert result.qualityScore == 100


def test_missing_checkout():
    rows = [{
        "record_type": "attendance",
        "employee_id": "EMP002",
        "check_in": "09:00",
        "check_out": "",
    }]

    result = analyze_rows(rows)

    assert any(
        finding.type == "Missing checkout"
        for finding in result.findings
    )


def test_invalid_attendance_time():
    rows = [{
        "record_type": "attendance",
        "employee_id": "EMP003",
        "check_in": "17:00",
        "check_out": "09:00",
    }]

    result = analyze_rows(rows)

    assert any(
        finding.type == "Invalid attendance time range"
        for finding in result.findings
    )


def test_valid_leave():
    rows = [{
        "record_type": "leave",
        "employee_id": "EMP004",
        "leave_start": "2026-11-10",
        "leave_end": "2026-11-12",
    }]

    result = analyze_rows(rows)

    assert result.totalFindings == 0
    assert result.qualityScore == 100


def test_invalid_leave_dates():
    rows = [{
        "record_type": "leave",
        "employee_id": "EMP005",
        "leave_start": "2026-11-20",
        "leave_end": "2026-11-10",
    }]

    result = analyze_rows(rows)

    assert any(
        finding.type == "Invalid leave dates"
        for finding in result.findings
    )


def test_claim_fields_not_required_for_attendance():
    rows = [{
        "record_type": "attendance",
        "employee_id": "EMP006",
        "check_in": "09:00",
        "check_out": "17:00",
    }]

    result = analyze_rows(rows)

    assert not any(
        finding.field in ("claim_id", "claim_amount")
        for finding in result.findings
    )


def test_mask_sensitive_information():
    rows = [{
        "record_type": "claim",
        "employee_id": "EMP007",
        "department": "Finance",
        "email": "test@example.com",
        "claim_id": "CLM007",
        "claim_amount": "100",
        "claim_description": "Bank account 123456789012",
    }]

    result = analyze_rows(rows)

    pii_findings = [
        finding for finding in result.findings
        if finding.type == "Potential sensitive information"
    ]

    assert len(pii_findings) == 1
    assert pii_findings[0].maskedValue == "[REDACTED]"
    assert "123456789012" not in pii_findings[0].detail
