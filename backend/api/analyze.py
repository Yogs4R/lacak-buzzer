"""
Endpoint API FastAPI untuk melayani permintaan analisis dari website dan bot X.
"""
from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from urllib.parse import urlparse
from schemas.analysis import AnalysisRequest, AnalysisResponse, AnalysisMetrics
from services.scraper import scrape_tweets
from services.feature_extraction import extract_features
from services.scoring import (
    calculate_score,
    get_risk_band,
    get_confidence,
    normalize_metrics,
    generate_signals,
)
from services.explanation import generate_explanation
from services.rate_limits import check_rate_limit, increment_rate_limit

router = APIRouter()


def normalize_username(target: str) -> str:
    """Membersihkan dan menormalisasi URL/username target menjadi format username standar."""
    target = target.strip()

    # Parse URL secara aman (hindari substring check pada domain).
    parsed = urlparse(target)
    if not parsed.hostname and "://" not in target:
        # Input bisa berupa "x.com/user" tanpa skema.
        parsed = urlparse(f"https://{target}")

    allowed_hosts = {"twitter.com", "www.twitter.com", "x.com", "www.x.com"}
    if parsed.hostname and parsed.hostname.lower() in allowed_hosts:
        path_parts = [p for p in parsed.path.split("/") if p]
        if path_parts:
            return path_parts[0].lstrip("@").strip()

    return target.lstrip("@").strip()



@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_account(req: AnalysisRequest, request: Request):
    """Endpoint utama untuk memproses analisis profil secara lengkap."""
    # 1. Normalisasi target username
    target = normalize_username(req.target)
    if not target:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "missing_target_username",
                "message": "Username target harus diisi."
            }
        )

    # 2. Tentukan identifier untuk rate limiting
    identifier = ""
    if req.source == "website":
        identifier = request.client.host if request.client else "127.0.0.1"
    elif req.source == "x_bot":
        if not req.requester:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "missing_requester",
                    "message": "Identitas requester harus diisi untuk bot."
                }
            )
        identifier = req.requester

    # 3. Pengecekan rate limit sebelum memproses (fail early) - Dinonaktifkan sementara untuk MVP
    limit_message = None
    # limit_message = check_rate_limit(
    #     source=req.source,
    #     identifier=identifier,
    #     target=target,
    #     mention_id=req.mention_id
    # )
    if limit_message:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "rate_limit_exceeded",
                "message": limit_message
            }
        )

    # 4. Melakukan scraping dengan twscrape
    try:
        scraped_data = await scrape_tweets(target, limit=req.tweet_limit)
    except ValueError as e:
        import traceback
        print(f"ValueError during scrape_tweets: {e}")
        traceback.print_exc()
        err_type = e.args[0] if e.args else ""
        if err_type == "account_not_found":
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={
                    "error": "account_not_found",
                    "message": "Akun tidak ditemukan."
                }
            )
        elif err_type == "protected_account":
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "protected_account",
                    "message": "Akun diproteksi/privat."
                }
            )
        elif err_type == "insufficient_data":
            tweet_count = e.args[1] if len(e.args) > 1 else 0
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "insufficient_data",
                    "message": "Data tweet tidak cukup untuk menghasilkan skor yang bertanggung jawab.",
                    "tweet_count": tweet_count
                }
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "scraper_login_problem",
                    "message": "Masalah koneksi ke Twitter. Coba beberapa saat lagi."
                }
            )
    except Exception as e:
        import traceback
        print(f"Exception during scrape_tweets: {e}")
        traceback.print_exc()
        err_msg = str(e).lower()
        if "rate limit" in err_msg or "too many requests" in err_msg:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "scraper_rate_limit",
                    "message": "Batas akses Twitter terlampaui. Coba beberapa saat lagi."
                }
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "scraper_login_problem",
                    "message": "Masalah koneksi ke Twitter. Coba beberapa saat lagi."
                }
            )

    # 5. Ekstraksi fitur
    profile_data = scraped_data["profile"]
    tweets = scraped_data["tweets"]
    tweet_count = len(tweets)

    features = extract_features(profile_data, tweets)

    # 6. Perhitungan skor dan metrik
    score = calculate_score(features)
    risk_band = get_risk_band(score)
    confidence = get_confidence(tweet_count)
    normalized_metrics = normalize_metrics(features)

    # 7. Pembuatan sinyal perilaku
    signals = generate_signals(normalized_metrics)

    # 8. Pembuatan penjelasan via OpenRouter atau fallback
    explanation = await generate_explanation(
        score=score,
        risk_band=risk_band,
        confidence=confidence,
        tweet_count=tweet_count,
        metrics=normalized_metrics,
        signals=signals,
    )

    # Simpan riwayat pemindaian ke Firebase Firestore
    try:
        from services.firebase_service import save_scan_history
        full_report = {
            "target": target,
            "score": score,
            "risk_band": risk_band,
            "confidence": confidence,
            "tweet_count": tweet_count,
            "metrics": normalized_metrics,
            "signals": signals,
            "explanation": explanation,
            "caveat": "Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu."
        }
        save_scan_history(
            username=target,
            score=score,
            risk_label=risk_band,
            full_report=full_report
        )
    except Exception as e:
        print(f"⚠️ Gagal menyimpan riwayat pemindaian ke Firestore: {e}")

    # 9. Peningkatan counter rate limit jika sukses
    increment_rate_limit(
        source=req.source,
        identifier=identifier,
        target=target,
        mention_id=req.mention_id
    )

    # 10. Pengembalian respons analisis
    return AnalysisResponse(
        target=target,
        score=score,
        risk_band=risk_band,
        confidence=confidence,
        tweet_count=tweet_count,
        metrics=AnalysisMetrics(**normalized_metrics),
        signals=signals,
        explanation=explanation,
        caveat="Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu."
    )
