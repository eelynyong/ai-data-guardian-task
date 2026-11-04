
import json

from app import ai_recommendations as ai
from app import gemini_enterprise_app as ge
from app.analyzer import analyze_rows


def sample_findings():
    rows = [
        {
            "record_type": "attendance",
            "employee_id": "EMP001",
            "check_in": "09:00",
            "check_out": "",
        }
    ]

    return analyze_rows(rows).findings


def test_extract_gemini_app_reply():
    fake_response = {
        "answer": {
            "state": "SUCCEEDED",
            "replies": [
                {
                    "groundedContent": {
                        "content": {
                            "text": json.dumps(
                                {
                                    "summary": "Attendance issue.",
                                    "actions": [
                                        "Verify checkout."
                                    ],
                                }
                            )
                        }
                    }
                }
            ],
        }
    }

    text = ge.extract_assistant_text(fake_response)

    result = json.loads(text)

    assert result["summary"] == "Attendance issue."


def test_parse_gemini_json():
    text = '''```json
{
  "summary": "Review missing checkout.",
  "actions": [
    "Verify attendance logs."
  ]
}
```'''

    result = ge.parse_recommendation_json(text)

    assert result["summary"] == "Review missing checkout."
    assert len(result["actions"]) == 1


def test_successful_enterprise_app(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "enterprise_app")
    monkeypatch.setenv(
        "GOOGLE_CLOUD_PROJECT",
        "agentspace-demo-468911",
    )
    monkeypatch.setenv("GEMINI_APP_LOCATION", "global")
    monkeypatch.setenv("GEMINI_APP_ID", "fake-test-app")

    def fake_gemini(prompt):
        assert "EMP001" not in prompt

        return {
            "summary": "One attendance record needs review.",
            "actions": [
                "Confirm checkout with HR."
            ],
        }

    monkeypatch.setattr(
        ai,
        "call_gemini_enterprise_app",
        fake_gemini,
    )

    result = ai.generate_recommendations(
        sample_findings(),
        1,
    )

    assert (
        result["recommendationSource"]
        == "gemini_enterprise_app"
    )
    assert len(result["recommendedActions"]) == 1


def test_enterprise_app_failure_fallback(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "enterprise_app")
    monkeypatch.setenv(
        "GOOGLE_CLOUD_PROJECT",
        "agentspace-demo-468911",
    )
    monkeypatch.setenv("GEMINI_APP_LOCATION", "global")
    monkeypatch.setenv("GEMINI_APP_ID", "fake-test-app")

    def simulated_failure(prompt):
        raise RuntimeError("Simulated Gemini outage")

    monkeypatch.setattr(
        ai,
        "call_gemini_enterprise_app",
        simulated_failure,
    )

    result = ai.generate_recommendations(
        sample_findings(),
        1,
    )

    assert result["recommendationSource"] == "rules"
