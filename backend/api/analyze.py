"""
Endpoint API FastAPI untuk melayani permintaan analisis dari website dan bot X.
"""
# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from schemas.analysis import AnalysisRequest, AnalysisResponse, AnalysisMetrics

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_account(request: AnalysisRequest):
    """Endpoint utama untuk memproses analisis profil (Dummy)."""
    return AnalysisResponse(
        target=request.target,
        score=74,
        risk_band="Tinggi",
        confidence="normal",
        tweet_count=100,
        metrics=AnalysisMetrics(
            semantic_similarity=82,
            hashtag_density=70,
            activity_intensity=65,
            media_url_ratio=45,
            interaction_behavior=80,
            profile_risk=70,
            posting_interval_regularity=50
        ),
        signals=[
            "Kemiripan pesan cukup tinggi",
            "Pola penggunaan tagar terlihat padat",
            "Aktivitas dan interaksi terlihat intens"
        ],
        explanation="Penjelasan ringkas dalam Bahasa Indonesia.",
        caveat="Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu."
    )
