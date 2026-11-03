
import os
import secrets

from fastapi import FastAPI, Header, HTTPException

from app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    AnalyzeWithAIResponse,
)
from app.analyzer import analyze_rows
from app.ai_recommendations import generate_recommendations


app = FastAPI(
    title="AI Data Guardian",
    description="HR Data Quality and AI Recommendations Backend",
    version="1.1.0",
)


@app.get("/")
def home():
    return {
        "message": "AI Data Guardian Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "FastAPI Backend",
    }


def verify_internal_key(
    x_internal_api_key: str | None,
) -> None:
    expected_key = os.getenv("INTERNAL_API_KEY")

    if not expected_key:
        raise HTTPException(
            status_code=503,
            detail="Backend authentication not configured",
        )

    if (
        not x_internal_api_key
        or not secrets.compare_digest(
            x_internal_api_key,
            expected_key,
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized",
        )


@app.post(
    "/internal/analyze",
    response_model=AnalyzeResponse,
)
def analyze(
    request: AnalyzeRequest,
    x_internal_api_key: str | None = Header(default=None),
):
    verify_internal_key(x_internal_api_key)

    return analyze_rows(request.rows)


@app.post(
    "/internal/analyze-with-ai",
    response_model=AnalyzeWithAIResponse,
)
def analyze_with_ai(
    request: AnalyzeRequest,
    x_internal_api_key: str | None = Header(default=None),
):
    verify_internal_key(x_internal_api_key)

    # First: deterministic Python quality checks
    analysis = analyze_rows(request.rows)

    # Second: Gemini or fallback recommendations
    recommendations = generate_recommendations(
        findings=analysis.findings,
        rows_analyzed=analysis.rowsAnalyzed,
    )

    return AnalyzeWithAIResponse(
        **analysis.model_dump(),
        **recommendations,
    )
