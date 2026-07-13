"""
Router API FastAPI untuk statistik global, leaderboard (3 kategori), dan detail riwayat pemindaian.
"""
from fastapi import APIRouter, HTTPException, status
from services.firebase_service import (
    get_global_stats,
    get_recent_scans,
    get_safest_accounts,
    get_riskiest_accounts,
    get_scan_report
)

router = APIRouter()


@router.api_route("/stats", methods=["GET", "HEAD"])
def get_stats():
    """Mengembalikan total global pindaian akun dari Firestore."""
    return get_global_stats()


@router.get("/leaderboard")
def get_leaderboard():
    """Mengembalikan data leaderboard terbagi menjadi 3 kategori: terbaru, teraman, dan paling berisiko."""
    return {
        "recent_scans": get_recent_scans(5),
        "safest_accounts": get_safest_accounts(5),
        "riskiest_accounts": get_riskiest_accounts(5)
    }


@router.get("/history/{username}")
def get_history(username: str):
    """Mengembalikan full_report hasil analisis berdasarkan username target."""
    report = get_scan_report(username)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Riwayat pemindaian untuk @{username} tidak ditemukan."
        )
    return report
