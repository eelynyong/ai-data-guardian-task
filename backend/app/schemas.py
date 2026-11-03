from typing import Any, Literal

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    rows: list[dict[str, Any]] = Field(
        min_length=1,
        max_length=1000
    )


class Finding(BaseModel):
    id: str
    employeeId: str
    department: str
    row: int
    field: str
    type: str
    severity: Literal["High", "Medium", "Low"]
    policy: str
    recommendation: str
    maskedValue: str
    status: str = "Open"


class AnalyzeResponse(BaseModel):
    rowsAnalyzed: int
    totalFindings: int
    qualityScore: float
    findings: list[Finding]