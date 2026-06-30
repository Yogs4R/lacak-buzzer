"""
Penyimpanan dan pengecekan rate limit metadata menggunakan file JSON lokal berbasis rolling window 1 menit.
"""
import os
import json
import re
import time
import threading
from typing import Optional, List

# Lock global untuk mencegah race condition pada operasi baca-tulis file JSON
_rate_limit_lock = threading.Lock()

LIMITS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "rate_limits.json"
)


def _load_limits() -> dict:
    """Membaca data limit dari file JSON lokal."""
    if not os.path.exists(LIMITS_FILE):
        return {}
    try:
        with open(LIMITS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save_limits(data: dict):
    """Menyimpan data limit ke file JSON lokal."""
    os.makedirs(os.path.dirname(LIMITS_FILE), exist_ok=True)
    try:
        with open(LIMITS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass


def _clean_old_timestamps(timestamps: List[float]) -> List[float]:
    """Menghapus timestamp yang lebih lama dari 60 detik."""
    now = time.time()
    return [t for t in timestamps if now - t < 60]


_MENTION_ID_PATTERN = re.compile(r'^[0-9]{1,25}$')


def _validate_mention_id(mention_id: Optional[str]) -> bool:
    """Memvalidasi bahwa mention_id adalah string numerik Twitter yang valid (maks 25 digit)."""
    if mention_id is None:
        return True
    return bool(_MENTION_ID_PATTERN.match(str(mention_id)))


_MAX_PROCESSED_MENTIONS = 500  # Batas maksimum entri mention yang disimpan


def check_rate_limit(
    source: str,
    identifier: str,
    target: Optional[str] = None,
    mention_id: Optional[str] = None
) -> Optional[str]:
    """
    Memeriksa apakah limit kuota per menit terlampaui.
    Mengembalikan pesan error jika terlampaui, atau None jika masih di bawah limit.
    """
    # Validasi format mention_id sebelum diproses
    if mention_id is not None and not _validate_mention_id(mention_id):
        return "Format mention ID tidak valid."

    with _rate_limit_lock:
        data = _load_limits()

    if source == "website":
        ip = identifier
        ip_limits = data.get("website_ips", {})
        timestamps = ip_limits.get(ip, [])
        cleaned = _clean_old_timestamps(timestamps)
        if len(cleaned) >= 5:
            return "Batas analisis per menit tercapai. Coba lagi beberapa saat lagi."

    elif source == "x_bot":
        # 1. Mencegah memproses ID mention yang sama lebih dari sekali
        if mention_id:
            if mention_id in data.get("bot_processed_mentions", []):
                return "Duplicate mention"

        # 2. Batas maksimum 10 balasan publik bot per menit secara global
        global_replies = data.get("bot_global_replies", [])
        cleaned_global = _clean_old_timestamps(global_replies)
        if len(cleaned_global) >= 10:
            return "Batas per menit bot sudah tercapai. Coba lagi beberapa saat lagi."

        # 3. Batas maksimum 5 permintaan analisis per requester per menit
        requester = identifier
        req_limits = data.get("bot_requesters", {})
        timestamps = req_limits.get(requester, [])
        cleaned_req = _clean_old_timestamps(timestamps)
        if len(cleaned_req) >= 5:
            return "Batas permintaan per menit kamu sudah tercapai. Coba lagi beberapa saat lagi."

        # 4. Batas maksimum 1 analisis per target akun per menit
        if target:
            target_limits = data.get("bot_targets", {})
            timestamps = target_limits.get(target, [])
            cleaned_target = _clean_old_timestamps(timestamps)
            if len(cleaned_target) >= 1:
                return "Akun ini sudah dianalisis baru-baru ini. Coba lagi beberapa saat lagi."

    return None


def increment_rate_limit(
    source: str,
    identifier: str,
    target: Optional[str] = None,
    mention_id: Optional[str] = None
):
    """
    Meningkatkan counter rate limit setelah analisis sukses dengan merekam timestamp saat ini.
    """
    with _rate_limit_lock:
        data = _load_limits()
        now = time.time()

        # Pastikan struktur database JSON siap
        if "website_ips" not in data:
            data["website_ips"] = {}
        if "bot_requesters" not in data:
            data["bot_requesters"] = {}
        if "bot_targets" not in data:
            data["bot_targets"] = {}
        if "bot_global_replies" not in data:
            data["bot_global_replies"] = []
        if "bot_processed_mentions" not in data:
            data["bot_processed_mentions"] = []

        # Increment total scans
        data["total_scans"] = data.get("total_scans", 0) + 1

        if source == "website":
            ip = identifier
            timestamps = data["website_ips"].get(ip, [])
            cleaned = _clean_old_timestamps(timestamps)
            cleaned.append(now)
            data["website_ips"][ip] = cleaned

        elif source == "x_bot":
            # Increment global replies
            global_replies = data["bot_global_replies"]
            cleaned_global = _clean_old_timestamps(global_replies)
            cleaned_global.append(now)
            data["bot_global_replies"] = cleaned_global

            # Increment requester
            requester = identifier
            timestamps = data["bot_requesters"].get(requester, [])
            cleaned_req = _clean_old_timestamps(timestamps)
            cleaned_req.append(now)
            data["bot_requesters"][requester] = cleaned_req

            # Increment target
            if target:
                timestamps = data["bot_targets"].get(target, [])
                cleaned_target = _clean_old_timestamps(timestamps)
                cleaned_target.append(now)
                data["bot_targets"][target] = cleaned_target

            # Track processed mention — batasi ukuran list agar file tidak tumbuh tak terbatas
            if mention_id and mention_id not in data["bot_processed_mentions"]:
                data["bot_processed_mentions"].append(mention_id)
                # Buang entri lama jika melebihi batas maksimum
                if len(data["bot_processed_mentions"]) > _MAX_PROCESSED_MENTIONS:
                    data["bot_processed_mentions"] = data["bot_processed_mentions"][-_MAX_PROCESSED_MENTIONS:]

        _save_limits(data)


def get_global_scan_count() -> int:
    """Mengembalikan jumlah total akun yang dianalisis secara global."""
    data = _load_limits()
    return data.get("total_scans", 0)
