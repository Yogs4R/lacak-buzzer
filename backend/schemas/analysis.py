"""
Pydantic schemas untuk validasi request dan response analisis.
"""
from pydantic import BaseModel, Field
from typing import Literal, List, Optional

class AnalysisRequest(BaseModel):
    target: str
    source: Literal["website", "x_bot"]
    tweet_limit: int = Field(default=100, ge=50, le=150)

class AnalysisMetrics(BaseModel):
    semantic_similarity: int
    hashtag_density: int
    activity_intensity: int
    media_url_ratio: int
    interaction_behavior: int
    profile_risk: int
    posting_interval_regularity: int

class AnalysisResponse(BaseModel):
    target: str
    score: int
    risk_band: str
    confidence: str
    tweet_count: int
    metrics: AnalysisMetrics
    signals: List[str]
    explanation: str
    caveat: str

class ErrorResponse(BaseModel):
    error: str
    message: str
    tweet_count: Optional[int] = None
