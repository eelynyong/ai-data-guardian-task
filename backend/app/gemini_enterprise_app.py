
import json
import os
import re

import google.auth
from google.auth.transport.requests import AuthorizedSession


ALLOWED_LOCATIONS = {"global", "us", "eu"}

RESOURCE_ID_PATTERN = re.compile(
    r"^[a-zA-Z0-9][a-zA-Z0-9_-]*$"
)


def extract_assistant_text(response_data: dict) -> str:
    """
    Extract text from a non-streaming assistant response.

    Kept for compatibility with existing tests.
    """
    if not isinstance(response_data, dict):
        raise ValueError("Invalid assistant response")

    answer = response_data.get("answer", {})

    if answer.get("state") != "SUCCEEDED":
        raise ValueError("Assistant did not succeed")

    parts = []

    for reply in answer.get("replies", []):
        content = (
            reply.get("groundedContent", {})
            .get("content", {})
        )

        if content.get("thought") is True:
            continue

        text = content.get("text", "")

        if isinstance(text, str) and text:
            parts.append(text)

    if not parts:
        raise ValueError("Assistant returned no answer text")

    return "".join(parts)


def extract_stream_assistant_text(chunks: list) -> str:
    """
    Extract the generated answer from StreamAssist.

    StreamAssist returns multiple response objects.
    Answer text is accumulated in chunk order.
    Internal thought content is excluded.
    """
    if not isinstance(chunks, list) or not chunks:
        raise ValueError("Empty StreamAssist response")

    text_parts = []
    final_state = None

    for chunk in chunks:
        if not isinstance(chunk, dict):
            continue

        answer = chunk.get("answer", {})

        if not isinstance(answer, dict):
            continue

        state = answer.get("state")

        if state:
            final_state = state

        for reply in answer.get("replies", []):
            if not isinstance(reply, dict):
                continue

            content = (
                reply.get("groundedContent", {})
                .get("content", {})
            )

            if not isinstance(content, dict):
                continue

            # Do not include model reasoning.
            if content.get("thought") is True:
                continue

            text = content.get("text", "")

            if isinstance(text, str) and text:
                text_parts.append(text)

    if final_state != "SUCCEEDED":
        raise ValueError(
            "StreamAssist did not finish successfully"
        )

    combined_text = "".join(text_parts).strip()

    if not combined_text:
        raise ValueError(
            "StreamAssist returned no usable answer"
        )

    return combined_text


def parse_recommendation_json(text: str) -> dict:
    """
    Convert the generated recommendation into JSON.
    """

    text = text.strip()

    # Support JSON wrapped in Markdown code fences.
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
            "Recommendation must be a JSON object"
        )

    return result


def call_gemini_enterprise_app(prompt: str) -> dict:
    """
    Generate recommendations using the Gemini
    Enterprise StreamAssist API.

    Sends only the prompt supplied by the calling
    recommendation service.

    Returns a dictionary with:
      summary
      actions
    """

    project = os.getenv(
        "GOOGLE_CLOUD_PROJECT", ""
    ).strip()

    location = os.getenv(
        "GEMINI_APP_LOCATION", ""
    ).strip()

    app_id = os.getenv(
        "GEMINI_APP_ID", ""
    ).strip()

    if not RESOURCE_ID_PATTERN.fullmatch(project):
        raise ValueError("Invalid Google Cloud project")

    if location not in ALLOWED_LOCATIONS:
        raise ValueError(
            "Unsupported Gemini Enterprise location"
        )

    if not RESOURCE_ID_PATTERN.fullmatch(app_id):
        raise ValueError("Invalid Gemini app ID")

    if not isinstance(prompt, str) or not prompt.strip():
        raise ValueError("Empty Gemini prompt")

    credentials, _ = google.auth.default(
        scopes=[
            "https://www.googleapis.com/auth/cloud-platform"
        ]
    )

    session = AuthorizedSession(credentials)

    resource = (
        f"projects/{project}"
        f"/locations/{location}"
        "/collections/default_collection"
        f"/engines/{app_id}"
        "/assistants/default_assistant"
    )

    if location == "global":
        base_url = (
            "https://discoveryengine.googleapis.com"
        )
    else:
        base_url = (
            f"https://{location}-discoveryengine.googleapis.com"
        )

    url = (
        f"{base_url}/v1/{resource}:streamAssist"
    )

    payload = {
        "query": {
            "text": prompt
        }
    }

    response = session.post(
        url,
        json=payload,
        headers={
            "X-Goog-User-Project": project
        },
        timeout=90,
    )

    response.raise_for_status()

    response_data = response.json()

    # REST StreamAssist generally returns an array
    # of streamed response chunks.
    if isinstance(response_data, dict):
        chunks = [response_data]
    elif isinstance(response_data, list):
        chunks = response_data
    else:
        raise ValueError(
            "Unexpected StreamAssist response format"
        )

    assistant_text = extract_stream_assistant_text(
        chunks
    )

    return parse_recommendation_json(
        assistant_text
    )
