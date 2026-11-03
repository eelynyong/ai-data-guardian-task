import os
import secrets

from fastapi import FastAPI, Header, HTTPException

from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.analyzer import analyze_rows


app = FastAPI(
    title="AI Data Guardian",
    description="HR Data Quality Backend",
    version="1.0.0"
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
        "service": "FastAPI Backend"
    }


@app.post(
    "/internal/analyze",
    response_model=AnalyzeResponse
)
def analyze(
    request: AnalyzeRequest,
    x_internal_api_key: str | None = Header(default=None)
):
    expected_key = os.getenv("INTERNAL_API_KEY")

    if not expected_key:
        raise HTTPException(
            status_code=503,
            detail="Backend authentication not configured"
        )

    if (
        not x_internal_api_key
        or not secrets.compare_digest(
            x_internal_api_key,
            expected_key
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    return analyze_rows(request.rows)