"""
Pydantic schemas untuk validasi request dan response analisis.
"""
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import Optional

class AnalysisRequest(BaseModel):
    target: str
    source: str
    tweet_limit: int = 100
