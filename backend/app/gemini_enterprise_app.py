
import json
import os
import re

import google.auth
from google.auth.transport.requests import Request
import requests


# Supported example endpoint locations.
ALLOWED_LOCATIONS = {"global", "us", "eu"}

RESOURCE_ID_PATTERN = re.compile(
    r"^[a-zA-Z0-9][a-zA-Z0-9_-]*$"
)


def extract_assistant_text(response_data: dict) -> str:
    """
    Extract final text from a Gemini Enterprise
    Assistant API response.
    """

    answer = response_data.get("answer", {})

    if not isinstance(answer, dict):
        raise ValueError("Invalid assistant answer")

    if answer.get("state") != "SUCCEEDED":
        raise ValueError(
            "Gemini Enterprise did not complete successfully"
        )

    text_parts = []

    for reply in answer.get("replies", []):
        grounded_content = reply.get(
            "groundedContent", {}
        )

        content = grounded_content.get(
            "content", {}
        )

        # Do not expose internal thought content.
        if content.get("thought") is True:
            continue

        text = content.get("text", "")

        if isinstance(text, str) and text.strip():
            text_parts.append(text.strip())

    if not text_parts:
        raise ValueError(
            "Gemini Enterprise returned no usable text"
        )

    return "\n".join(text_parts)


def parse_recommendation_json(text: str) -> dict:
    """
    Parse structured recommendation JSON
    returned by Gemini Enterprise.
    """

    text = text.strip()

    # Allow JSON enclosed in Markdown code fences.
    if text.startswith("```"):
        lines = text.splitlines()

        if lines and lines[0].startswith("```"):
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        text = "\n".join(lines).strip()

    result = json.loads(text)

    if not isinstance(result, dict):
        raise ValueError(
            "Gemini response must be a JSON object"
        )

    return result


def call_gemini_enterprise_app(prompt: str) -> dict:
    """
    Call an existing Gemini Enterprise app using
    the Discovery Engine assistants.assist API.

    Requires an approved app, ADC, and IAM access.
    """

    project = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    location = os.getenv("GEMINI_APP_LOCATION", "")
    app_id = os.getenv("GEMINI_APP_ID", "")

    if not project:
        raise ValueError(
            "GOOGLE_CLOUD_PROJECT is missing"
        )

    if location not in ALLOWED_LOCATIONS:
        raise ValueError(
            "Unsupported Gemini Enterprise location"
        )

    if not RESOURCE_ID_PATTERN.fullmatch(app_id):
        raise ValueError(
            "Invalid or missing Gemini app ID"
        )

    if not RESOURCE_ID_PATTERN.fullmatch(project):
        raise ValueError(
            "Invalid Google Cloud project ID"
        )

    # Load credentials from Google Cloud ADC.
    # No service account key is hard-coded.
    credentials, _ = google.auth.default(
        scopes=[
            "https://www.googleapis.com/auth/cloud-platform"
        ]
    )

    credentials.refresh(Request())

    resource = (
        f"projects/{project}"
        f"/locations/{location}"
        "/collections/default_collection"
        f"/engines/{app_id}"
        "/assistants/default_assistant"
    )

    # Global service endpoint.
    # Consult Google's endpoint documentation if
    # your approved app requires regional routing.
    if location == "global":
        base_url = (
            "https://discoveryengine.googleapis.com"
        )
    else:
        base_url = (
            f"https://{location}-discoveryengine.googleapis.com"
        )

    url = f"{base_url}/v1/{resource}:assist"

    payload = {
        "query": {
            "text": prompt
        },
        "assistSkippingMode": "REQUEST_ASSIST",
    }

    response = requests.post(
        url,
        headers={
            "Authorization": (
                f"Bearer {credentials.token}"
            ),
            "Content-Type": "application/json",
            "X-Goog-User-Project": project,
        },
        json=payload,
        timeout=45,
    )

    response.raise_for_status()

    response_data = response.json()

    assistant_text = extract_assistant_text(
        response_data
    )

    return parse_recommendation_json(
        assistant_text
    )
