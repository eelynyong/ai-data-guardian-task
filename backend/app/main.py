
import os
import secrets

from fastapi import (
    FastAPI,
    Header,
    HTTPException,
)

from app.analyzer import analyze_rows

from app.ai_recommendations import (
    generate_recommendations,
)

from app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    AnalyzeWithAIResponse,
)


app = FastAPI(
    title="AI Data Guardian",
    description=(
        "HR Data Quality Detection and "
        "Gemini Enterprise Recommendations"
    ),
    version="1.2.0",
)


@app.get("/")
def home():
    return {
        "message":
            "AI Data Guardian Backend is running"
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
    """
    Protect internal API endpoints.

    The Express middleware must provide the
    matching internal API key.
    """

    expected_key = os.getenv("INTERNAL_API_KEY")

    if not expected_key:
        raise HTTPException(
            status_code=503,
            detail=(
                "Backend authentication not configured"
            ),
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
    x_internal_api_key: str | None = Header(
        default=None
    ),
):
    """
    Data-quality analysis without Gemini.

    Maintains compatibility with the original
    Node.js-to-FastAPI connection test.
    """

    verify_internal_key(
        x_internal_api_key
    )

    return analyze_rows(
        request.rows
    )


@app.post(
    "/internal/analyze-with-ai",
    response_model=AnalyzeWithAIResponse,
)
def analyze_with_ai(
    request: AnalyzeRequest,
    x_internal_api_key: str | None = Header(
        default=None
    ),
):
    """
    Analyze HR data and generate recommendations.

    Step 1: Python detects quality issues.
    Step 2: Gemini or rules generates advice.
    Step 3: Return JSON to Express middleware.
    """

    verify_internal_key(
        x_internal_api_key
    )

    analysis = analyze_rows(
        request.rows
    )

    recommendations = generate_recommendations(
        findings=analysis.findings,
        rows_analyzed=analysis.rowsAnalyzed,
    )

    return AnalyzeWithAIResponse(
        **analysis.model_dump(),
        **recommendations,
    )
