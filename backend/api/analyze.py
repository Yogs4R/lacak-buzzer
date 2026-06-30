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
    execution_logs = []
    import datetime
    
    def log_step(msg: str):
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        formatted_msg = f"[{timestamp}] {msg}"
        print(formatted_msg)
        execution_logs.append(formatted_msg)

    # 1. Normalisasi target username
    target = normalize_username(req.target)
    log_step(f"Memulai analisis akun @{target} | Source: {req.source} | Limit target: {req.tweet_limit}")
    
    if not target:
        log_step("Error: Username target kosong.")
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
            log_step("Error: Identitas requester bot kosong.")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "missing_requester",
                    "message": "Identitas requester harus diisi untuk bot."
                }
            )
        identifier = req.requester
    log_step(f"Identifier rate limit: {identifier}")

    # 3. Pengecekan rate limit sebelum memproses (fail early)
    limit_message = check_rate_limit(
        source=req.source,
        identifier=identifier,
        target=target,
        mention_id=req.mention_id
    )
    if limit_message:
        log_step(f"Rate limit terlampaui untuk {req.source} ({identifier}). Pesan: {limit_message}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "rate_limit_exceeded",
                "message": limit_message
            }
        )
    log_step("Pengecekan rate limit lolos.")

    # 4. Melakukan scraping dengan twscrape
    log_step(f"Memulai scraping tweet untuk @{target} dengan twscrape...")
    try:
        scraped_data = await scrape_tweets(target, limit=req.tweet_limit)
    except ValueError as e:
        import traceback
        log_step(f"ValueError saat scraping: {e}")
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
            log_step(f"Data tidak cukup. Hanya ditemukan {tweet_count} tweet.")
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
        log_step(f"Exception saat scraping: {e}")
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
    log_step(f"Scraping selesai. Mengumpulkan {tweet_count} tweet untuk dianalisis.")

    log_step("Mengekstrak fitur perilaku dari tweet...")
    features = extract_features(profile_data, tweets)
    
    log_step("Hasil ekstraksi fitur mentah (raw features):")
    log_step(f"  - semantic_similarity: {features.get('semantic_similarity', 0.0):.4f}")
    log_step(f"  - avg_hashtags_per_post: {features.get('avg_hashtags_per_post', 0.0):.4f}")
    log_step(f"  - posts_per_day: {features.get('posts_per_day', 0.0):.4f}")
    log_step(f"  - url_ratio: {features.get('url_ratio', 0.0):.4f}")
    log_step(f"  - photo_ratio: {features.get('photo_ratio', 0.0):.4f}")
    log_step(f"  - mention_ratio: {features.get('mention_ratio', 0.0):.4f}")
    log_step(f"  - reply_ratio: {features.get('reply_ratio', 0.0):.4f}")
    log_step(f"  - account_age_days: {features.get('account_age_days', 0.0):.1f}")
    log_step(f"  - bio_is_empty: {features.get('bio_is_empty', False)}")
    log_step(f"  - posting_entropy: {features.get('posting_entropy', 0.0):.4f}")

    # 6. Perhitungan skor dan metrik
    log_step("Mulai perhitungan skor risiko...")
    score = calculate_score(features)
    risk_band = get_risk_band(score)
    confidence = get_confidence(tweet_count)
    normalized_metrics = normalize_metrics(features)

    log_step("Hasil standarisasi metrik (skor 0-100):")
    for k, v in normalized_metrics.items():
        log_step(f"  - {k}: {v}/100")

    # Log langkah perhitungan kotor
    weighted_score = (
        normalized_metrics.get('semantic_similarity', 0) * 0.30
        + normalized_metrics.get('hashtag_density', 0) * 0.20
        + normalized_metrics.get('activity_intensity', 0) * 0.15
        + normalized_metrics.get('media_url_ratio', 0) * 0.10
        + normalized_metrics.get('interaction_behavior', 0) * 0.10
        + normalized_metrics.get('profile_risk', 0) * 0.10
        + normalized_metrics.get('posting_interval_regularity', 0) * 0.05
    )
    log_step(f"Skor kotor (sebelum reduksi): {weighted_score:.2f}/100")

    # Log reducers yang diterapkan
    sem_sim = features.get('semantic_similarity', 0.0)
    diversity = 1 - sem_sim
    if diversity > 0.6:
        log_step(f"Reducer keragaman aktif (diversity={diversity:.2f} > 0.6): skor dikalikan 0.7")
    posts_day = features.get('posts_per_day', 0.0)
    if posts_day < 5:
        log_step(f"Reducer aktivitas rendah aktif (posts/day={posts_day:.2f} < 5): skor dikalikan 0.8")
    rep_ratio = features.get('reply_ratio', 0.0)
    ment_ratio = features.get('mention_ratio', 0.0)
    if rep_ratio < 0.3 and ment_ratio < 0.3:
        log_step(f"Reducer pola interaksi rendah aktif (reply_ratio={rep_ratio:.2f}, mention_ratio={ment_ratio:.2f} < 0.3): skor dikalikan 0.85")

    log_step(f"Skor bersih akhir (dibulatkan): {score}/100 | Kategori: {risk_band} | Kepercayaan: {confidence}")

    # 7. Pembuatan sinyal perilaku
    signals = generate_signals(normalized_metrics)
    log_step(f"Sinyal perilaku teridentifikasi: {', '.join(signals)}")

    # 8. Pembuatan penjelasan via OpenRouter atau fallback
    log_step("Membuat penjelasan analisis via OpenRouter...")
    explanation = await generate_explanation(
        score=score,
        risk_band=risk_band,
        confidence=confidence,
        tweet_count=tweet_count,
        metrics=normalized_metrics,
        signals=signals,
    )
    log_step("Penjelasan analisis berhasil dibuat.")

    # Simpan riwayat pemindaian ke Firebase Firestore
    try:
        log_step("Menyimpan riwayat pemindaian dan logs ke Firebase Firestore...")
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
            full_report=full_report,
            logs=execution_logs
        )
        log_step("Penyimpanan Firestore sukses.")
    except Exception as e:
        log_step(f"Gagal menyimpan riwayat ke Firestore: {e}")

    # 9. Peningkatan counter rate limit jika sukses
    increment_rate_limit(
        source=req.source,
        identifier=identifier,
        target=target,
        mention_id=req.mention_id
    )
    log_step("Counter rate limit berhasil ditambahkan.")

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
