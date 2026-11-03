
import pytest
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

TEST_KEY = "local-test-key-not-for-production"


@pytest.fixture(autouse=True)
def configure_test_key(monkeypatch):
    monkeypatch.setenv("INTERNAL_API_KEY", TEST_KEY)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_missing_api_key():
    response = client.post(
        "/internal/analyze",
        json={"rows": [{"employee_id": "EMP001"}]},
    )

    assert response.status_code == 401


def test_invalid_api_key():
    response = client.post(
        "/internal/analyze",
        headers={"X-Internal-Api-Key": "wrong-key"},
        json={"rows": [{"employee_id": "EMP001"}]},
    )

    assert response.status_code == 401


def test_authorized_analysis():
    response = client.post(
        "/internal/analyze",
        headers={"X-Internal-Api-Key": TEST_KEY},
        json={
            "rows": [
                {
                    "record_type": "attendance",
                    "employee_id": "EMP001",
                    "check_in": "09:00",
                    "check_out": "",
                }
            ]
        },
    )

    assert response.status_code == 200

    result = response.json()

    assert result["rowsAnalyzed"] == 1
    assert result["totalFindings"] >= 1

    assert any(
        finding["type"] == "Missing checkout"
        for finding in result["findings"]
    )


def test_empty_upload():
    response = client.post(
        "/internal/analyze",
        headers={"X-Internal-Api-Key": TEST_KEY},
        json={"rows": []},
    )

    assert response.status_code == 422


def test_oversized_upload():
    rows = [
        {"record_type": "attendance", "employee_id": "EMP001"}
        for _ in range(2501)
    ]

    response = client.post(
        "/internal/analyze",
        headers={"X-Internal-Api-Key": TEST_KEY},
        json={"rows": rows},
    )

    assert response.status_code == 422


def test_missing_server_key(monkeypatch):
    monkeypatch.delenv("INTERNAL_API_KEY", raising=False)

    response = client.post(
        "/internal/analyze",
        headers={"X-Internal-Api-Key": TEST_KEY},
        json={"rows": [{"employee_id": "EMP001"}]},
    )

    assert response.status_code == 503
