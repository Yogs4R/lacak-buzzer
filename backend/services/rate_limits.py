"""
Penyimpanan dan pengecekan rate limit metadata menggunakan file JSON lokal.
"""
import os
import json
from datetime import datetime, timezone
from typing import Optional

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


def check_rate_limit(
    source: str,
    identifier: str,
    target: Optional[str] = None,
    mention_id: Optional[str] = None
) -> Optional[str]:
    """
    Memeriksa apakah limit kuota harian terlampaui.
    Mengembalikan pesan error jika terlampaui, atau None jika masih di bawah limit.
    """
    data = _load_limits()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Jika tanggal pada file berbeda dengan hari ini, maka limit harian di-reset
    if data.get("date") != today:
        return None

    if source == "website":
        ip = identifier
        count = data.get("website_ips", {}).get(ip, 0)
        if count >= 5:
            return "Batas analisis harian tercapai. Coba lagi besok."

    elif source == "x_bot":
        # 1. Mencegah memproses ID mention yang sama lebih dari sekali
        if mention_id:
            if mention_id in data.get("bot_processed_mentions", []):
                return "Duplicate mention"

        # 2. Batas maksimum 10 balasan publik bot per hari secara global
        if data.get("bot_global_replies", 0) >= 10:
            return "Batas harian bot sudah tercapai. Coba lagi besok."

        # 3. Batas maksimum 3 permintaan analisis per requester per hari
        requester = identifier
        req_count = data.get("bot_requesters", {}).get(requester, 0)
        if req_count >= 3:
            return "Batas permintaan harian kamu sudah tercapai. Coba lagi besok."

        # 4. Batas maksimum 1 analisis publik per target akun per hari
        if target:
            # target dalam database bot_targets berupa username: tanggal
            target_date = data.get("bot_targets", {}).get(target)
            if target_date == today:
                return "Akun ini sudah dianalisis hari ini. Coba lagi besok."

    return None


def increment_rate_limit(
    source: str,
    identifier: str,
    target: Optional[str] = None,
    mention_id: Optional[str] = None
):
    """
    Meningkatkan counter rate limit setelah analisis sukses.
    """
    data = _load_limits()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Jika ganti hari, inisialisasi ulang
    if data.get("date") != today:
        data = {
            "date": today,
            "website_ips": {},
            "bot_global_replies": 0,
            "bot_requesters": {},
            "bot_targets": {},
            "bot_processed_mentions": data.get("bot_processed_mentions", []),
            "total_scans": data.get("total_scans", 0)
        }

    # Increment global scan count
    data["total_scans"] = data.get("total_scans", 0) + 1

    if source == "website":
        ip = identifier
        if "website_ips" not in data:
            data["website_ips"] = {}
        data["website_ips"][ip] = data["website_ips"].get(ip, 0) + 1

    elif source == "x_bot":
        if "bot_requesters" not in data:
            data["bot_requesters"] = {}
        if "bot_targets" not in data:
            data["bot_targets"] = {}
        if "bot_processed_mentions" not in data:
            data["bot_processed_mentions"] = []

        data["bot_global_replies"] = data.get("bot_global_replies", 0) + 1

        requester = identifier
        data["bot_requesters"][requester] = data["bot_requesters"].get(requester, 0) + 1

        if target:
            data["bot_targets"][target] = today

        if mention_id and mention_id not in data["bot_processed_mentions"]:
            data["bot_processed_mentions"].append(mention_id)

    _save_limits(data)


def get_global_scan_count() -> int:
    """Mengembalikan jumlah total akun yang dianalisis secara global."""
    data = _load_limits()
    return data.get("total_scans", 0)
