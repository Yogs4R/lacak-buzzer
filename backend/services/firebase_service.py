"""
Service untuk interaksi dengan Firebase Firestore (Riwayat Pemindaian, Statistik Global, dan Leaderboard).
"""
import os
import time
from typing import Optional, List
import firebase_admin
from firebase_admin import credentials, firestore

# Path ke service account key JSON file
SECRETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "secrets")
KEY_PATH = os.path.join(SECRETS_DIR, "firebase-key.json")

_db = None
_initialized = False

# Cache in-memory untuk menghemat reads di Firestore
CACHE_TTL = 300  # 5 menit dalam detik
_cache = {
    "global_stats": None,        # { "data": dict, "expires_at": float }
    "recent_scans": {},          # limit -> { "data": list, "expires_at": float }
    "safest_accounts": {},       # limit -> { "data": list, "expires_at": float }
    "riskiest_accounts": {},     # limit -> { "data": list, "expires_at": float }
}


def clear_firebase_cache():
    """Mengosongkan cache in-memory Firebase."""
    global _cache
    _cache["global_stats"] = None
    _cache["recent_scans"] = {}
    _cache["safest_accounts"] = {}
    _cache["riskiest_accounts"] = {}
    print("🧹 In-memory Firebase cache cleared (invalidated).")



def get_db():
    """Mengembalikan client Firestore secara lazy-loaded."""
    global _db, _initialized
    if _initialized:
        return _db

    # Coba inisialisasi menggunakan environment variable (berguna di platform awan seperti Hugging Face Spaces)
    firebase_creds_env = os.environ.get("FIREBASE_CREDENTIALS")
    if firebase_creds_env:
        try:
            import json
            creds_dict = json.loads(firebase_creds_env)
            if not firebase_admin._apps:
                cred = credentials.Certificate(creds_dict)
                firebase_admin.initialize_app(cred)
            _db = firestore.client()
            print("✅ Firebase Admin SDK initialized successfully from environment variable!")
            _initialized = True
            return _db
        except Exception as e:
            print(f"❌ Error initializing Firebase from environment variable: {e}")

    # Jika environment variable tidak ada, gunakan file kredensial lokal
    if not os.path.exists(KEY_PATH):
        print("⚠️ Firebase credentials file not found. Running in offline/no-database mode.")
        _initialized = True
        return None

    try:
        # Inisialisasi Firebase jika belum diinisialisasi
        if not firebase_admin._apps:
            cred = credentials.Certificate(KEY_PATH)
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
        print("✅ Firebase Admin SDK initialized successfully from file!")
    except Exception as e:
        print(f"❌ Error initializing Firebase from file: {e}")
        _db = None

    _initialized = True
    return _db


def save_scan_history(username: str, score: int, risk_label: str, full_report: dict, logs: Optional[List[str]] = None):
    """Menyimpan riwayat pemindaian ke Firestore dan memperbarui global_stats secara atomik."""
    db = get_db()
    if db is None:
        print("⚠️ Firebase not initialized. Skipping save_scan_history.")
        return

    try:
        # 1. Simpan data ke koleksi scan_history dengan username_lower untuk pencarian case-insensitive
        doc_ref = db.collection("scan_history").document()
        doc_data = {
            "username": username,
            "username_lower": username.lower(),
            "score": score,
            "risk_label": risk_label,
            "full_report": full_report,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        if logs is not None:
            doc_data["logs"] = logs
        doc_ref.set(doc_data)
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
        
        # Bersihkan cache in-memory karena ada data baru ditulis
        clear_firebase_cache()
    except Exception as e:
        print(f"❌ Gagal menyimpan data ke Firestore: {e}")


def get_global_stats() -> dict:
    """Mengambil data statistik global dari Firestore."""
    global _cache
    now = time.time()
    if _cache["global_stats"] is not None:
        cache_entry = _cache["global_stats"]
        if now < cache_entry["expires_at"]:
            print("⚡ Returning cached global stats.")
            return cache_entry["data"]

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
            res = {
                "total_scans": data.get("total_scans", 0),
                "breakdown": data.get("breakdown", default_stats["breakdown"])
            }
            _cache["global_stats"] = {
                "data": res,
                "expires_at": now + CACHE_TTL
            }
            return res
        else:
            return default_stats
    except Exception as e:
        print(f"❌ Gagal mengambil stats dari Firestore: {e}")
        return default_stats


def get_recent_scans(limit: int = 5) -> list:
    """Mengambil riwayat pemindaian akun terbaru."""
    global _cache
    now = time.time()
    if limit in _cache["recent_scans"]:
        cache_entry = _cache["recent_scans"][limit]
        if now < cache_entry["expires_at"]:
            print(f"⚡ Returning cached recent scans (limit={limit}).")
            return cache_entry["data"]

    db = get_db()
    if db is None:
        return []
    try:
        # Ambil lebih banyak dokumen untuk menyaring akun dummy 'target_user'
        docs = db.collection("scan_history")\
            .order_by("created_at", direction=firestore.Query.DESCENDING)\
            .limit(limit * 4)\
            .stream()
        scans = _format_scan_list(docs)
        res = scans[:limit]
        _cache["recent_scans"][limit] = {
            "data": res,
            "expires_at": now + CACHE_TTL
        }
        return res
    except Exception as e:
        print(f"❌ Gagal mengambil scans terbaru dari Firestore: {e}")
        return []


def get_safest_accounts(limit: int = 5) -> list:
    """Mengambil riwayat pemindaian akun dengan skor terendah (teraman)."""
    global _cache
    now = time.time()
    if limit in _cache["safest_accounts"]:
        cache_entry = _cache["safest_accounts"][limit]
        if now < cache_entry["expires_at"]:
            print(f"⚡ Returning cached safest accounts (limit={limit}).")
            return cache_entry["data"]

    db = get_db()
    if db is None:
        return []
    try:
        # Ambil lebih banyak dokumen untuk menyaring akun dummy 'target_user'
        docs = db.collection("scan_history")\
            .order_by("score", direction=firestore.Query.ASCENDING)\
            .limit(limit * 4)\
            .stream()
        scans = _format_scan_list(docs)
        res = scans[:limit]
        _cache["safest_accounts"][limit] = {
            "data": res,
            "expires_at": now + CACHE_TTL
        }
        return res
    except Exception as e:
        print(f"❌ Gagal mengambil akun teraman dari Firestore: {e}")
        return []


def get_riskiest_accounts(limit: int = 5) -> list:
    """Mengambil riwayat pemindaian akun dengan skor tertinggi (paling indikatif)."""
    global _cache
    now = time.time()
    if limit in _cache["riskiest_accounts"]:
        cache_entry = _cache["riskiest_accounts"][limit]
        if now < cache_entry["expires_at"]:
            print(f"⚡ Returning cached riskiest accounts (limit={limit}).")
            return cache_entry["data"]

    db = get_db()
    if db is None:
        return []
    try:
        # Ambil lebih banyak dokumen untuk menyaring akun dummy 'target_user'
        docs = db.collection("scan_history")\
            .order_by("score", direction=firestore.Query.DESCENDING)\
            .limit(limit * 4)\
            .stream()
        scans = _format_scan_list(docs)
        res = scans[:limit]
        _cache["riskiest_accounts"][limit] = {
            "data": res,
            "expires_at": now + CACHE_TTL
        }
        return res
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
            .stream()

        matching_docs = []
        for doc in docs:
            matching_docs.append(doc.to_dict())

        if not matching_docs:
            return None

        # Urutkan secara manual berdasarkan created_at descending di memori Python
        # untuk menghindari keharusan membuat indeks komposit di Firestore.
        def get_time(doc_dict):
            t = doc_dict.get("created_at")
            if t is None:
                return ""
            return str(t)

        matching_docs.sort(key=get_time, reverse=True)
        return matching_docs[0].get("full_report")
    except Exception as e:
        print(f"❌ Gagal mengambil laporan pemindaian untuk @{username}: {e}")
        return None


def _format_scan_list(docs) -> list:
    """Mengubah generator dokumen Firestore menjadi daftar dictionary yang terformat."""
    scans = []
    for doc in docs:
        d = doc.to_dict()
        username = d.get("username")
        # Abaikan data dummy test run
        if not username or username.lower() == "target_user":
            continue
        created_at = d.get("created_at")
        if created_at:
            try:
                created_at = created_at.isoformat()
            except Exception:
                created_at = str(created_at)
        scans.append({
            "username": username,
            "score": d.get("score"),
            "risk_label": d.get("risk_label"),
            "created_at": created_at
        })
    return scans
