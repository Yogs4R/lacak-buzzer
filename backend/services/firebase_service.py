"""
Service untuk interaksi dengan Firebase Firestore (Riwayat Pemindaian, Statistik Global, dan Leaderboard).
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Path ke service account key JSON file
SECRETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "secrets")
KEY_PATH = os.path.join(SECRETS_DIR, "firebase-key.json")

_db = None
_initialized = False


def get_db():
    """Mengembalikan client Firestore secara lazy-loaded."""
    global _db, _initialized
    if _initialized:
        return _db

    if not os.path.exists(KEY_PATH):
        print(f"⚠️ Firebase credentials file not found at: {KEY_PATH}. Running in offline/no-database mode.")
        _initialized = True
        return None

    try:
        # Inisialisasi Firebase jika belum diinisialisasi
        if not firebase_admin._apps:
            cred = credentials.Certificate(KEY_PATH)
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
        print("✅ Firebase Admin SDK initialized successfully!")
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        _db = None

    _initialized = True
    return _db


def save_scan_history(username: str, score: int, risk_label: str, full_report: dict):
    """Menyimpan riwayat pemindaian ke Firestore dan memperbarui global_stats secara atomik."""
    db = get_db()
    if db is None:
        print("⚠️ Firebase not initialized. Skipping save_scan_history.")
        return

    try:
        # 1. Simpan data ke koleksi scan_history dengan username_lower untuk pencarian case-insensitive
        doc_ref = db.collection("scan_history").document()
        doc_ref.set({
            "username": username,
            "username_lower": username.lower(),
            "score": score,
            "risk_label": risk_label,
            "full_report": full_report,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        print(f"✅ Riwayat pemindaian untuk @{username} berhasil disimpan ke Firestore.")

        # 2. Perbarui global_stats secara atomik
        stats_ref = db.collection("metadata").document("global_stats")
        stats_doc = stats_ref.get()
        if not stats_doc.exists:
            stats_ref.set({
                "total_scans": 0,
                "breakdown": {
                    "Rendah": 0,
                    "Sedang": 0,
                    "Tinggi": 0,
                    "Ekstrem": 0
                }
            })

        # Update counter total_scans dan breakdown berdasarkan risk_label
        stats_ref.update({
            "total_scans": firestore.Increment(1),
            f"breakdown.{risk_label}": firestore.Increment(1)
        })
        print(f"✅ Statistik global (total_scans dan breakdown.{risk_label}) diperbarui secara atomik.")
    except Exception as e:
        print(f"❌ Gagal menyimpan data ke Firestore: {e}")


def get_global_stats() -> dict:
    """Mengambil data statistik global dari Firestore."""
    default_stats = {
        "total_scans": 0,
        "breakdown": {
            "Rendah": 0,
            "Sedang": 0,
            "Tinggi": 0,
            "Ekstrem": 0
        }
    }

    db = get_db()
    if db is None:
        print("⚠️ Firebase not initialized. Returning default stats.")
        # Fallback ke rate limits local JSON jika tersedia
        try:
            from services.rate_limits import get_global_scan_count
            cnt = get_global_scan_count()
            default_stats["total_scans"] = cnt
            default_stats["breakdown"]["Rendah"] = cnt
        except Exception:
            pass
        return default_stats

    try:
        stats_ref = db.collection("metadata").document("global_stats")
        stats_doc = stats_ref.get()
        if stats_doc.exists:
            data = stats_doc.to_dict()
            return {
                "total_scans": data.get("total_scans", 0),
                "breakdown": data.get("breakdown", default_stats["breakdown"])
            }
        else:
            return default_stats
    except Exception as e:
        print(f"❌ Gagal mengambil stats dari Firestore: {e}")
        return default_stats


def get_recent_scans(limit: int = 5) -> list:
    """Mengambil riwayat pemindaian akun terbaru."""
    db = get_db()
    if db is None:
        return []
    try:
        docs = db.collection("scan_history")\
            .order_by("created_at", direction=firestore.Query.DESCENDING)\
            .limit(limit)\
            .stream()
        return _format_scan_list(docs)
    except Exception as e:
        print(f"❌ Gagal mengambil scans terbaru dari Firestore: {e}")
        return []


def get_safest_accounts(limit: int = 5) -> list:
    """Mengambil riwayat pemindaian akun dengan skor terendah (teraman)."""
    db = get_db()
    if db is None:
        return []
    try:
        docs = db.collection("scan_history")\
            .order_by("score", direction=firestore.Query.ASCENDING)\
            .limit(limit)\
            .stream()
        return _format_scan_list(docs)
    except Exception as e:
        print(f"❌ Gagal mengambil akun teraman dari Firestore: {e}")
        return []


def get_riskiest_accounts(limit: int = 5) -> list:
    """Mengambil riwayat pemindaian akun dengan skor tertinggi (paling indikatif)."""
    db = get_db()
    if db is None:
        return []
    try:
        docs = db.collection("scan_history")\
            .order_by("score", direction=firestore.Query.DESCENDING)\
            .limit(limit)\
            .stream()
        return _format_scan_list(docs)
    except Exception as e:
        print(f"❌ Gagal mengambil akun berisiko dari Firestore: {e}")
        return []


def get_scan_report(username: str) -> dict:
    """Mengambil full_report hasil analisis berdasarkan username target secara case-insensitive."""
    db = get_db()
    if db is None:
        return None
    try:
        docs = db.collection("scan_history")\
            .where("username_lower", "==", username.lower())\
            .order_by("created_at", direction=firestore.Query.DESCENDING)\
            .limit(1)\
            .stream()

        for doc in docs:
            return doc.to_dict().get("full_report")
        return None
    except Exception as e:
        print(f"❌ Gagal mengambil laporan pemindaian untuk @{username}: {e}")
        return None


def _format_scan_list(docs) -> list:
    """Mengubah generator dokumen Firestore menjadi daftar dictionary yang terformat."""
    scans = []
    for doc in docs:
        d = doc.to_dict()
        created_at = d.get("created_at")
        if created_at:
            try:
                created_at = created_at.isoformat()
            except Exception:
                created_at = str(created_at)
        scans.append({
            "username": d.get("username"),
            "score": d.get("score"),
            "risk_label": d.get("risk_label"),
            "created_at": created_at
        })
    return scans
