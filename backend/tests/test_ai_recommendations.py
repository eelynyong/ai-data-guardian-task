
from fastapi.testclient import TestClient

from app.main import app
from app.analyzer import analyze_rows
from app import ai_recommendations as ai


client = TestClient(app)
TEST_KEY = "automated-test-key"


def sample_findings():
    rows = [{
        "record_type": "attendance",
        "employee_id": "EMP001",
        "employee_name": "Private Test Name",
        "email": "private@example.com",
        "check_in": "09:00",
        "check_out": "",
    }]

    return analyze_rows(rows).findings


def test_fallback_recommendations():
    result = ai.fallback_recommendations(
        sample_findings()
    )

    assert result["recommendationSource"] == "rules"
    assert len(result["recommendedActions"]) > 0


def test_safe_prompt_does_not_include_employee_data():
    findings = sample_findings()

    prompt = ai.build_safe_prompt(findings, 1)

    assert "Missing checkout" in prompt
    assert "Private Test Name" not in prompt
    assert "private@example.com" not in prompt
    assert "EMP001" not in prompt


def test_rules_mode_works_without_cloud(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "rules")

    result = ai.generate_recommendations(
        sample_findings(), 1
    )

    assert result["recommendationSource"] == "rules"


def test_missing_cloud_configuration_uses_fallback(
    monkeypatch,
):
    monkeypatch.setenv("AI_PROVIDER", "enterprise")
    monkeypatch.delenv("GOOGLE_CLOUD_PROJECT", raising=False)
    monkeypatch.delenv("GOOGLE_CLOUD_LOCATION", raising=False)
    monkeypatch.delenv("GEMINI_MODEL", raising=False)

    result = ai.generate_recommendations(
        sample_findings(), 1
    )

    assert result["recommendationSource"] == "rules"


def test_gemini_error_uses_fallback(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "enterprise")
    monkeypatch.setenv("GOOGLE_CLOUD_PROJECT", "test-project")
    monkeypatch.setenv("GOOGLE_CLOUD_LOCATION", "global")
    monkeypatch.setenv("GEMINI_MODEL", "test-model")

    def broken_gemini(prompt):
        raise RuntimeError("Simulated AI service failure")

    monkeypatch.setattr(
        ai, "call_gemini_enterprise", broken_gemini
    )

    result = ai.generate_recommendations(
        sample_findings(), 1
    )

    assert result["recommendationSource"] == "rules"


def test_successful_gemini_response(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "enterprise")
    monkeypatch.setenv("GOOGLE_CLOUD_PROJECT", "test-project")
    monkeypatch.setenv("GOOGLE_CLOUD_LOCATION", "global")
    monkeypatch.setenv("GEMINI_MODEL", "test-model")

    def fake_gemini(prompt):
        assert "Private Test Name" not in prompt
        assert "private@example.com" not in prompt

        return {
            "summary": "An attendance issue requires review.",
            "actions": [
                "Verify the missing checkout with HR."
            ],
        }

    monkeypatch.setattr(
        ai, "call_gemini_enterprise", fake_gemini
    )

    result = ai.generate_recommendations(
        sample_findings(), 1
    )

    assert result["recommendationSource"] == "gemini_enterprise"
    assert len(result["recommendedActions"]) == 1


def test_new_endpoint_requires_authentication(
    monkeypatch,
):
    monkeypatch.setenv("INTERNAL_API_KEY", TEST_KEY)

    response = client.post(
        "/internal/analyze-with-ai",
        json={"rows": [{"employee_id": "EMP001"}]},
    )

    assert response.status_code == 401


def test_new_endpoint_returns_recommendations(
    monkeypatch,
):
    monkeypatch.setenv("INTERNAL_API_KEY", TEST_KEY)
    monkeypatch.setenv("AI_PROVIDER", "rules")

    response = client.post(
        "/internal/analyze-with-ai",
        headers={"X-Internal-Api-Key": TEST_KEY},
        json={
            "rows": [{
                "record_type": "attendance",
                "employee_id": "EMP001",
                "check_in": "09:00",
                "check_out": "",
            }]
        },
    )

    assert response.status_code == 200

    result = response.json()

    assert result["rowsAnalyzed"] == 1
    assert result["recommendationSource"] == "rules"
    assert len(result["recommendedActions"]) > 0
