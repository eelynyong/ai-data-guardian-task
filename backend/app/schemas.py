
from typing import Any, Literal

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """
    CSV records submitted by the middleware.
    """

    rows: list[dict[str, Any]] = Field(
        min_length=1,
        max_length=2500,
    )


class Finding(BaseModel):
    """
    One detected HR data-quality issue.
    """

    id: str

    employeeId: str

    employee: str = "Unknown"

    department: str

    row: int

    field: str

    type: str

    severity: Literal[
        "Critical",
        "High",
        "Medium",
        "Low",
    ]

    detail: str = ""

    policy: str

    recommendation: str

    maskedValue: str

    date: str = "Current upload"

    status: str = "Open"


class AnalyzeResponse(BaseModel):
    """
    Results returned by the rule-based analyzer.
    """

    rowsAnalyzed: int

    totalFindings: int

    qualityScore: float

    findings: list[Finding]


class AnalyzeWithAIResponse(AnalyzeResponse):
    """
    Analyzer results with Gemini or fallback
    recommendations.
    """

    aiSummary: str

    recommendedActions: list[str]

    recommendationSource: Literal[
        "rules",
        "gemini_enterprise",
        "gemini_enterprise_app",
    ]
