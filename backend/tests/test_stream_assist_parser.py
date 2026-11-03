
import json

import pytest

from app.gemini_enterprise_app import (
    extract_stream_assistant_text,
    parse_recommendation_json,
)


def test_stream_assist_combines_chunks():
    chunks = [
        {
            "answer": {
                "state": "IN_PROGRESS",
                "replies": [
                    {
                        "groundedContent": {
                            "content": {
                                "text": '{"summary":"Missing checkout",'
                            }
                        }
                    }
                ],
            }
        },
        {
            "answer": {
                "state": "IN_PROGRESS",
                "replies": [
                    {
                        "groundedContent": {
                            "content": {
                                "text": '"actions":["Verify attendance."]}'
                            }
                        }
                    }
                ],
            }
        },
        {
            "answer": {
                "state": "SUCCEEDED",
                "replies": [],
            }
        },
    ]

    text = extract_stream_assistant_text(chunks)

    result = parse_recommendation_json(text)

    assert result["summary"] == "Missing checkout"
    assert result["actions"] == ["Verify attendance."]


def test_stream_assist_ignores_thoughts():
    chunks = [
        {
            "answer": {
                "state": "SUCCEEDED",
                "replies": [
                    {
                        "groundedContent": {
                            "content": {
                                "text": "internal reasoning",
                                "thought": True,
                            }
                        }
                    },
                    {
                        "groundedContent": {
                            "content": {
                                "text": json.dumps({
                                    "summary": "Review required.",
                                    "actions": ["Verify record."],
                                }),
                                "thought": False,
                            }
                        }
                    },
                ],
            }
        }
    ]

    text = extract_stream_assistant_text(chunks)

    assert "internal reasoning" not in text
    assert "Review required." in text


def test_stream_assist_failure():
    chunks = [
        {
            "answer": {
                "state": "FAILED",
                "replies": [],
            }
        }
    ]

    with pytest.raises(ValueError):
        extract_stream_assistant_text(chunks)


def test_stream_assist_empty_response():
    with pytest.raises(ValueError):
        extract_stream_assistant_text([])
