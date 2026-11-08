"""
Proses utama bot X yang memantau mention dan membalas analisis.
"""

import argparse
import asyncio
import json
import os
import re
import sys
import time
from collections import Counter

from bot.mention_parser import parse_mention


SAFE_FALLBACK_MESSAGE = "Maaf, analisis belum bisa diproses. Coba beberapa saat lagi."
UNSAFE_ERROR_TERMS = (
    "traceback",
    "token",
    "secret",
    ".env",
    "auth",
    "session",
    "c:\\",
    "/home/",
)

TWEET_MAX_CHARS = 280
SHORT_CAVEAT = "\u26a0\ufe0f Indikator pola perilaku, bukan bukti koordinasi."
PROMO_LINK = "\U0001f50d Cek analisis lengkap di sini:\nhttps://lacakbuzzer.web.id atau mentions @lacakbuzzer"

# Analisis backend = scraping (fast-fail 40 dtk) + embedding + OpenRouter.
# Timeout lama (30 dtk) membuat bot memposting pesan gagal padahal backend
# sebenarnya masih memproses dan berhasil.
ANALYZE_TIMEOUT_SECONDS = 120
# Batas waktu satu kali pencarian twscrape agar polling tidak membeku.
SEARCH_TIMEOUT_SECONDS = 45
# Mention yang lebih tua dari ini tidak dibalas (mencegah balasan ganda
# untuk mention lama setiap kali Space/container di-restart).
DEFAULT_MAX_MENTION_AGE_SECONDS = 30 * 60
# Jumlah maksimum ID mention yang diingat di file state.
MAX_HANDLED_IDS = 1000

# Error backend yang TIDAK boleh diposting sebagai balasan publik.
SILENT_ERROR_MESSAGES = (
    "Duplicate mention",
    "Format mention ID tidak valid.",
)

STATE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "x_bot_state.json",
)

# Epoch Twitter snowflake (ms) untuk membaca waktu pembuatan dari ID tweet.
_TWITTER_EPOCH_MS = 1288834974657


def truncate_tweet(text: str, max_chars: int = TWEET_MAX_CHARS) -> str:
    """Potong teks agar sesuai batas 280 karakter X/Twitter."""
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 3].rstrip() + "..."


def build_analysis_payload(
    target,
    requester_username,
    mention_id,
    tweet_limit=100,
) -> dict:
    """Build payload for backend analyze endpoint without side effects."""
    return {
        "target": target,
        "source": "x_bot",
        "tweet_limit": tweet_limit,
        "requester": requester_username,
        "mention_id": mention_id,
    }


def format_success_reply(result: dict) -> str:
    """Format safe public bot reply dalam batas 280 karakter X/Twitter."""
    risk_band = result.get("risk_band", "Tidak tersedia")
    score = result.get("score", 0)
    # Batasi 2 sinyal agar cukup ruang untuk caveat dalam 280 karakter
    signals = result.get("signals", [])[:2]

    lines = [
        f"Risiko: {risk_band} | Skor: {score}/100",
    ]

    if signals:
        lines.append("")
        for signal in signals:
            lines.append(f"- {signal}")

    lines.extend(["", SHORT_CAVEAT, "", PROMO_LINK])

    return truncate_tweet("\n".join(lines))


def is_silent_error(error: dict) -> bool:
    """True untuk error internal yang tidak pantas diposting ke publik."""
    message = str(error.get("message") or "").strip()
    return message in SILENT_ERROR_MESSAGES


def format_error_reply(error: dict) -> str:
    """Return safe Indonesian error text for public bot replies."""
    message = str(error.get("message") or "").strip()
    lowered = message.lower()

    if not message:
        return SAFE_FALLBACK_MESSAGE

    if any(term in lowered for term in UNSAFE_ERROR_TERMS):
        return SAFE_FALLBACK_MESSAGE

    return message


async def call_analyze_api(base_url: str, payload: dict, client=None) -> dict:
    """Call backend analyze endpoint or return safe error on failure."""
    url = f"{base_url.rstrip('/')}/api/analyze"

    try:
        if client is not None:
            response = await client.post(url, json=payload)
        else:
            import httpx

            async with httpx.AsyncClient(timeout=ANALYZE_TIMEOUT_SECONDS) as http_client:
                response = await http_client.post(url, json=payload)

        return response.json()
    except Exception:
        return {
            "error": "backend_unavailable",
            "message": SAFE_FALLBACK_MESSAGE,
        }


async def process_mention_text(
    text,
    bot_username,
    requester_username,
    mention_id,
    base_url,
    client=None,
) -> str | None:
    """Parse mention, call backend, and return safe reply text."""
    target = parse_mention(
        text,
        bot_username,
        requester_username=requester_username,
    )
    if target is None:
        return None

    payload = build_analysis_payload(target, requester_username, mention_id)
    result = await call_analyze_api(base_url, payload, client=client)

    if "error" in result:
        if is_silent_error(result):
            return None
        return format_error_reply(result)

    return format_success_reply(result)


async def dry_run_mention(
    text,
    bot_username,
    requester_username,
    mention_id,
    base_url,
    client=None,
) -> str:
    """Simulate bot flow locally without reading sessions or posting to X."""
    target = parse_mention(
        text,
        bot_username,
        requester_username=requester_username,
    )
    if target is None:
        return "No valid target mention found. No reply would be sent."

    payload = build_analysis_payload(target, requester_username, mention_id)
    result = await call_analyze_api(base_url, payload, client=client)
    if "error" in result and is_silent_error(result):
        reply = "(tidak ada balasan: mention ini sudah pernah diproses)"
    elif "error" in result:
        reply = format_error_reply(result)
    else:
        reply = format_success_reply(result)

    payload_preview = json.dumps(payload, ensure_ascii=False, indent=2)
    return "\n".join(
        [
            "Dry run only. No X reply was posted.",
            f"Target: {target}",
            f"POST {base_url.rstrip('/')}/api/analyze",
            "Payload:",
            payload_preview,
            "",
            "Reply preview:",
            reply,
        ]
    )


# ---------------------------------------------------------------------------
# Helper polling mention (tanpa akses jaringan sendiri, mudah dites)
# ---------------------------------------------------------------------------


def snowflake_to_unix(tweet_id) -> float | None:
    """Waktu pembuatan tweet (detik Unix) yang dibaca dari ID snowflake."""
    try:
        return ((int(tweet_id) >> 22) + _TWITTER_EPOCH_MS) / 1000
    except (TypeError, ValueError):
        return None


class HandledMentions:
    """
    Daftar ID mention yang sudah diputuskan (dibalas, diabaikan, atau gagal).

    Disimpan ke JSON lokal agar restart tidak membuat bot membalas ulang
    mention lama. Hanya berisi ID tweet (metadata rate-limit yang diizinkan).
    """

    def __init__(self, path: str | None = STATE_FILE, limit: int = MAX_HANDLED_IDS):
        self.path = path
        self.limit = limit
        self._ids: list[str] = self._load()
        self._set = set(self._ids)

    def _load(self) -> list[str]:
        if not self.path:
            return []
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                data = json.load(f)
            ids = [str(i) for i in data.get("handled_ids", []) if str(i).isdigit()]
            return ids[-self.limit:]
        except Exception:
            return []

    def _save(self) -> None:
        if not self.path:
            return
        try:
            os.makedirs(os.path.dirname(self.path), exist_ok=True)
            tmp_path = self.path + ".tmp"
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump({"handled_ids": self._ids}, f)
            os.replace(tmp_path, self.path)
        except Exception as e:
            print(f"   [State] Gagal menyimpan state bot: {type(e).__name__}")

    def __contains__(self, mention_id) -> bool:
        return str(mention_id) in self._set

    def add(self, mention_id) -> None:
        mention_id = str(mention_id)
        if mention_id in self._set:
            return
        self._ids.append(mention_id)
        self._set.add(mention_id)
        if len(self._ids) > self.limit:
            dropped = self._ids[: len(self._ids) - self.limit]
            self._ids = self._ids[-self.limit:]
            self._set.difference_update(dropped)
        self._save()


def mention_from_twscrape(tweet) -> dict:
    """Ubah Tweet twscrape menjadi dict mention standar."""
    user = getattr(tweet, "user", None)
    # Tweet yang sekadar DIAWALI @username juga punya inReplyToUser; hanya
    # anggap balasan bila benar-benar membalas sebuah tweet.
    reply_user = getattr(tweet, "inReplyToUser", None) if getattr(tweet, "inReplyToTweetId", None) else None
    return {
        "id": str(getattr(tweet, "id", "") or ""),
        "text": getattr(tweet, "rawContent", "") or getattr(tweet, "text", "") or "",
        "requester": (getattr(user, "username", "") if user else "") or "",
        "in_reply_to": (getattr(reply_user, "username", "") if reply_user else "") or "",
        "source": "twscrape_search",
    }


def _tweet_mentions_bot(tweet_data: dict, bot: str) -> bool:
    for m in (tweet_data.get("entities") or {}).get("user_mentions") or []:
        if str(m.get("screen_name") or "").lower() == bot:
            return True
    text = tweet_data.get("full_text") or tweet_data.get("text") or ""
    return re.search(rf"@{re.escape(bot)}(?![A-Za-z0-9_])", text, re.IGNORECASE) is not None


def parse_legacy_notifications(response, bot_username: str, source: str) -> list[dict]:
    """
    Ambil mention dari respons mentah endpoint notifikasi lama
    (/i/api/2/notifications/{mentions,all}.json).

    Tidak bergantung pada susunan `entries`/`notifications` (yang berubah-ubah
    dan membuat parser twifork bisa mengembalikan 0): cukup ambil semua tweet
    di `globalObjects.tweets` yang menyebut akun bot.
    """
    bot = bot_username.strip().lstrip("@").lower()
    global_objects = (response or {}).get("globalObjects") or {}
    tweets = global_objects.get("tweets") or {}
    users = global_objects.get("users") or {}

    mentions = []
    for tweet_id, data in tweets.items():
        if not isinstance(data, dict) or not _tweet_mentions_bot(data, bot):
            continue
        user = users.get(str(data.get("user_id_str") or "")) or {}
        mentions.append({
            "id": str(data.get("id_str") or tweet_id),
            "text": data.get("full_text") or data.get("text") or "",
            "requester": user.get("screen_name") or "",
            # X mengisi in_reply_to_screen_name juga untuk tweet biasa yang
            # diawali "@akun". Balasan sungguhan selalu punya in_reply_to_status_id_str.
            "in_reply_to": (
                data.get("in_reply_to_screen_name") or ""
                if data.get("in_reply_to_status_id_str")
                else ""
            ),
            "source": source,
        })
    return mentions


def _iter_entries(node):
    if isinstance(node, dict):
        entries = node.get("entries")
        if isinstance(entries, list):
            for entry in entries:
                if isinstance(entry, dict):
                    yield entry
        for value in node.values():
            if isinstance(value, (dict, list)):
                yield from _iter_entries(value)
    elif isinstance(node, list):
        for item in node:
            yield from _iter_entries(item)


def describe_notifications_response(response) -> str:
    """Ringkasan bentuk respons mentah untuk log diagnostik (tanpa isi tweet)."""
    if not isinstance(response, dict):
        return f"respons bukan JSON object ({type(response).__name__})"
    go = response.get("globalObjects") or {}
    prefixes = Counter(
        str(e.get("entryId", "")).rsplit("-", 1)[0] for e in _iter_entries(response)
    )
    return (
        f"keys={sorted(response)} tweets={len(go.get('tweets') or {})} "
        f"users={len(go.get('users') or {})} notifications={len(go.get('notifications') or {})} "
        f"entries={dict(prefixes) or '{}'}"
    )


async def fetch_notification_mentions(
    twikit_client, bot_username: str, count: int = 20, verbose: bool = False
) -> tuple[list[dict], str]:
    """
    Kanal 1: notifikasi akun bot. Membaca tab Mentions; bila kosong, juga tab All
    (mention juga muncul di sana). Mengembalikan (mentions, info_untuk_log).
    """
    found: list[dict] = []
    info: list[str] = []
    endpoints = (
        ("mentions", twikit_client.v11.notifications_mentions),
        ("all", twikit_client.v11.notifications_all),
    )
    for name, endpoint in endpoints:
        if name == "all" and found:
            break
        response, _ = await endpoint(count, None)
        parsed = parse_legacy_notifications(response, bot_username, f"notif_{name}")
        found.extend(parsed)
        info.append(f"{name}.json={len(parsed)}")
        if verbose:
            info.append(f"[{name}.json mentah: {describe_notifications_response(response)}]")
    return found, " ".join(info)


async def log_cookie_account(twikit_client, bot_username: str) -> None:
    """Cetak akun pemilik cookie, untuk memastikan cookie memang milik akun bot."""
    try:
        response, _ = await twikit_client.v11.settings()
        screen_name = str(response.get("screen_name") or "?")
    except Exception as e:
        print(f"⚠️ Tidak bisa mengecek pemilik cookie bot: {_short_error(e)}")
        return
    if screen_name.lower() == bot_username.strip().lstrip("@").lower():
        print(f"✅ Cookie bot login sebagai @{screen_name}.")
    else:
        print(
            f"❌ Cookie bot ternyata login sebagai @{screen_name}, BUKAN @{bot_username}. "
            "Notifikasi yang dibaca adalah milik akun itu. Perbaiki auth_token/ct0 untuk akun bot."
        )


async def fetch_search_mentions(
    scraper_api,
    bot_username: str,
    limit: int = 20,
    timeout: float = SEARCH_TIMEOUT_SECONDS,
) -> list[dict]:
    """Kanal 2: pencarian publik "@bot" (tab Latest) via twscrape."""

    async def _collect():
        items = []
        async for tweet in scraper_api.search(
            f"@{bot_username}", limit=limit, kv={"product": "Latest"}
        ):
            items.append(tweet)
        return items

    raw_tweets = await asyncio.wait_for(_collect(), timeout=timeout)
    return [mention_from_twscrape(t) for t in raw_tweets]


def select_new_mentions(
    mentions: list[dict],
    bot_username: str,
    handled,
    now: float | None = None,
    max_age_seconds: float = DEFAULT_MAX_MENTION_AGE_SECONDS,
    skipped: Counter | None = None,
) -> list[dict]:
    """
    Saring mention yang perlu diproses, urut dari yang paling lama.
    Bila `skipped` (Counter) diberikan, alasan setiap mention yang diabaikan dihitung di sana.

    Diabaikan: ID ganda, ID yang sudah ditangani, tweet bot sendiri,
    balasan ke tweet bot (agar komentar di thread balasan bot tidak memicu
    analisis baru), dan mention yang lebih tua dari max_age_seconds.
    """
    now = time.time() if now is None else now
    bot = bot_username.strip().lstrip("@").lower()
    seen = set()
    selected = []
    skipped = Counter() if skipped is None else skipped

    for m in mentions:
        m_id = str(m.get("id") or "")
        if not m_id.isdigit() or not m.get("text"):
            skipped["data tidak lengkap"] += 1
            continue
        if m_id in seen:
            continue
        seen.add(m_id)
        if m_id in handled:
            skipped["sudah diproses"] += 1
            continue

        if (m.get("requester") or "").lower() == bot:
            skipped["tweet bot sendiri"] += 1
            continue
        if (m.get("in_reply_to") or "").lower() == bot:
            skipped["balasan di thread bot"] += 1
            continue

        created = snowflake_to_unix(m_id)
        if created is not None and now - created > max_age_seconds:
            skipped[f"lebih tua dari {int(max_age_seconds // 60)} menit"] += 1
            continue

        selected.append(m)

    return sorted(selected, key=lambda m: int(m["id"]))


def _short_error(exc: Exception) -> str:
    text = f"{type(exc).__name__}: {exc}".strip()
    return text[:200]


async def collect_mentions(twikit_client, scraper_api, bot_username: str, verbose: bool = False):
    """
    Ambil mention dari semua kanal aktif. Error satu kanal tidak
    menghentikan kanal lain. Mengembalikan (mentions, status_per_kanal, jumlah_kanal_ok).
    """
    mentions: list[dict] = []
    status: dict[str, str] = {}
    ok_channels = 0

    if twikit_client is not None:
        try:
            found, info = await fetch_notification_mentions(
                twikit_client, bot_username, verbose=verbose
            )
            mentions.extend(found)
            status["notifikasi"] = f"{len(found)} tweet ({info})"
            ok_channels += 1
        except Exception as e:
            status["notifikasi"] = f"gagal ({_short_error(e)})"
            # Self-healing: reset client_transaction bila state tersangkut
            transaction = getattr(twikit_client, "client_transaction", None)
            if transaction is not None and hasattr(transaction, "home_page_response"):
                transaction.home_page_response = None
    else:
        status["notifikasi"] = "nonaktif (cookie akun bot tidak ada)"

    if scraper_api is not None:
        try:
            found = await fetch_search_mentions(scraper_api, bot_username)
            mentions.extend(found)
            status["search"] = f"{len(found)} tweet"
            ok_channels += 1
        except asyncio.TimeoutError:
            status["search"] = f"timeout setelah {SEARCH_TIMEOUT_SECONDS} detik"
        except Exception as e:
            name = type(e).__name__
            if name == "NoAccountError":
                status["search"] = "semua akun twscrape sedang cooldown/nonaktif, dilewati"
            else:
                status["search"] = f"gagal ({_short_error(e)})"
    else:
        status["search"] = "nonaktif"

    return mentions, status, ok_channels


# ---------------------------------------------------------------------------
# Setup client
# ---------------------------------------------------------------------------


def _load_dotenv_for_cli() -> None:
    """Muat .env di root repo saat x_bot dijalankan langsung (tidak menimpa env yang ada)."""
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    path = os.path.join(root, ".env")
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip().strip("'\""))


def _bot_cookies(bot_username: str) -> tuple[str | None, str | None]:
    """Cari cookie auth_token & ct0 akun bot di TWITTER_ACCOUNTS_JSON, lalu X_AUTH_TOKEN/X_CT0."""
    auth_token = None
    ct0 = None
    accounts_json = os.getenv("TWITTER_ACCOUNTS_JSON")
    if accounts_json:
        try:
            for acc in json.loads(accounts_json):
                if acc.get("username", "").lower() == bot_username.lower():
                    auth_token = acc.get("auth_token")
                    ct0 = acc.get("ct0")
                    break
        except Exception as e:
            print(f"Gagal memparsing TWITTER_ACCOUNTS_JSON: {type(e).__name__}")

    if not auth_token or not ct0:
        auth_token = os.getenv("X_AUTH_TOKEN")
        ct0 = os.getenv("X_CT0")
    return auth_token, ct0


def build_twikit_client(bot_username: str):
    auth_token, ct0 = _bot_cookies(bot_username)
    if not (auth_token and ct0):
        print("⚠️ Cookie akun bot (auth_token & ct0) tidak ditemukan. Kanal notifikasi mati dan bot berjalan baca-saja.")
        return None
    try:
        from twikit import Client

        client = Client("en-US")
        client.set_cookies({"auth_token": auth_token, "ct0": ct0})
        print("Twikit Client terinisialisasi menggunakan cookies akun bot.")
        return client
    except Exception as e:
        print(f"❌ Gagal menginisialisasi Twikit Client: {_short_error(e)}")
        return None


async def build_scraper_api():
    from twscrape import API
    from services.init_db import init_twitter_db

    # Inisialisasi basis data akun twscrape di runtime
    init_twitter_db()

    tws_data_dir = os.getenv("TWS_DATA_DIR", "")
    db_path = os.path.join(tws_data_dir, "accounts.db") if tws_data_dir else "accounts.db"
    # raise_when_no_account=True: bila semua akun sedang cooldown, twscrape langsung
    # melempar NoAccountError. Default-nya menunggu sampai akun terbuka (bisa 15 menit),
    # yang membuat seluruh loop bot (termasuk kanal notifikasi) ikut membeku.
    scraper_api = API(db_path, raise_when_no_account=True)

    try:
        all_accounts = await scraper_api.pool.get_all()
        active_count = sum(1 for a in all_accounts if a.active)
        if active_count == 0:
            print("⚠️ Tidak ada akun twscrape aktif! Kanal search tidak akan menemukan mention.")
            print("   Pastikan TWITTER_ACCOUNTS_JSON berisi credentials yang valid.")
        else:
            print(f"✅ {active_count} akun twscrape aktif untuk kanal search.")
    except Exception as e:
        print(f"⚠️ Tidak bisa memeriksa status akun twscrape: {_short_error(e)}")
    return scraper_api


# ---------------------------------------------------------------------------
# CLI & loop utama
# ---------------------------------------------------------------------------


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="X bot helper.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Jalankan satu kali pembacaan kedua kanal mention lalu keluar (tanpa analisis, tanpa posting).",
    )
    parser.add_argument("--text", help="Required for dry-run mode")
    parser.add_argument("--bot-username", required=True)
    parser.add_argument("--requester", help="Required for dry-run mode")
    parser.add_argument("--mention-id", help="Required for dry-run mode")
    parser.add_argument("--base-url", help="Required for dry-run and bot mode")
    parser.add_argument("--poll-interval", type=int, default=60)
    return parser


async def check_channels(bot_username: str) -> int:
    """Diagnostik: tampilkan apa yang dilihat tiap kanal, tanpa memanggil backend atau memposting."""
    twikit_client = build_twikit_client(bot_username)
    if twikit_client is not None:
        await log_cookie_account(twikit_client, bot_username)
    scraper_api = await build_scraper_api()
    mentions, status, _ = await collect_mentions(
        twikit_client, scraper_api, bot_username, verbose=True
    )

    print("\nStatus kanal:")
    for channel, info in status.items():
        print(f"   {channel}: {info}")

    print(f"\nTotal {len(mentions)} tweet ditemukan (sebelum filter):")
    now = time.time()
    for m in sorted(mentions, key=lambda m: int(m["id"]) if m["id"].isdigit() else 0):
        created = snowflake_to_unix(m["id"])
        age = f"{int((now - created) / 60)} mnt lalu" if created else "?"
        target = parse_mention(m["text"], bot_username, requester_username=m["requester"])
        text = " ".join(m["text"].split())[:100]
        print(f"   [{m['source']}] id={m['id']} @{m['requester']} ({age}) target={target or '-'}")
        print(f"      {text}")

    skipped = Counter()
    fresh = select_new_mentions(mentions, bot_username, handled=HandledMentions(), skipped=skipped)
    print(f"\n{len(fresh)} mention akan diproses bila bot berjalan sekarang.")
    for reason, n in sorted(skipped.items()):
        print(f"   diabaikan ({reason}): {n}")
    return 0


async def main(argv=None) -> int:
    # Konsol Windows (cp1252) tidak bisa mencetak emoji di log bot.
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    parser = build_arg_parser()
    args = parser.parse_args(argv)

    if args.check:
        _load_dotenv_for_cli()
        return await check_channels(args.bot_username)

    if not args.base_url:
        parser.error("Argument --base-url is required.")

    if args.dry_run:
        if not (args.text and args.requester and args.mention_id):
            parser.error("Arguments --text, --requester, and --mention-id are required for dry-run.")
        output = await dry_run_mention(
            text=args.text,
            bot_username=args.bot_username,
            requester_username=args.requester,
            mention_id=args.mention_id,
            base_url=args.base_url,
        )
        print(output)
        return 0

    _load_dotenv_for_cli()
    await start_bot(
        base_url=args.base_url,
        bot_username=args.bot_username,
        poll_interval=args.poll_interval,
    )
    return 0


async def start_bot(base_url: str, bot_username: str, poll_interval: int = 60):
    """Memulai loop polling mention Twitter/X dan membalas analisis secara otomatis."""
    import random

    max_age = int(os.getenv("X_BOT_MAX_MENTION_AGE", str(DEFAULT_MAX_MENTION_AGE_SECONDS)))

    print(f"X Bot aktif! Memantau mention untuk @{bot_username}...")
    print(f"   Backend URL: {base_url}")
    print(f"   Interval polling: {poll_interval} detik")
    print(f"   Mention lebih tua dari {max_age // 60} menit diabaikan")

    try:
        scraper_api = await build_scraper_api()
    except Exception as e:
        print(f"⚠️ Kanal search dimatikan: {_short_error(e)}")
        scraper_api = None
    twikit_client = build_twikit_client(bot_username)
    if twikit_client is not None:
        await log_cookie_account(twikit_client, bot_username)

    handled = HandledMentions()
    poll_count = 0
    last_skip_summary = None
    # Ringkasan respons mentah dicetak di polling pertama lalu tiap 30 polling,
    # agar penyebab "0 tweet" terlihat di log Space.
    VERBOSE_EVERY = 30

    # Exponential backoff bila SEMUA kanal gagal berturut-turut
    MAX_BACKOFF_MULTIPLIER = 8
    backoff_multiplier = 1

    while True:
        try:
            print(f"\n[{time.strftime('%H:%M:%S')}] Memeriksa mention baru...")

            verbose = poll_count % VERBOSE_EVERY == 0
            poll_count += 1
            mentions, status, ok_channels = await collect_mentions(
                twikit_client, scraper_api, bot_username, verbose=verbose
            )
            for channel, info in status.items():
                print(f"   [{channel}] {info}")

            skipped = Counter()
            new_mentions = select_new_mentions(
                mentions, bot_username, handled, max_age_seconds=max_age, skipped=skipped
            )
            print(f"   Ditemukan {len(new_mentions)} mention baru untuk @{bot_username}.")
            # Alasan mention diabaikan, dicetak hanya saat berubah agar log tidak penuh.
            skip_summary = ", ".join(f"{reason}: {n}" for reason, n in sorted(skipped.items()))
            if skip_summary and (verbose or skip_summary != last_skip_summary):
                print(f"   Diabaikan -> {skip_summary}")
            last_skip_summary = skip_summary

            for m in new_mentions:
                mention_id = m["id"]
                text = m["text"]
                requester = m["requester"]

                # Tandai lebih dulu: crash atau gagal posting tidak boleh
                # berujung balasan ganda di siklus berikutnya.
                handled.add(mention_id)

                reply_text = await process_mention_text(
                    text=text,
                    bot_username=bot_username,
                    requester_username=requester,
                    mention_id=mention_id,
                    base_url=base_url,
                )
                if not reply_text:
                    continue

                print(f"Memproses mention dari @{requester} (ID: {mention_id}, kanal: {m['source']})")
                print(f"   Isi tweet: \"{text}\"")
                print(f"   Draft Balasan:\n{reply_text}")

                if twikit_client is None:
                    print("   Balasan tidak diposting (cookie akun bot kosong).")
                    continue

                try:
                    # Anti-ban: delay acak sebelum membalas (meniru perilaku manusia)
                    delay = random.uniform(5.0, 12.0)
                    print(f"   [Anti-Ban] Menunggu {delay:.1f} detik sebelum mengirim balasan...")
                    await asyncio.sleep(delay)

                    await twikit_client.create_tweet(text=reply_text, reply_to=str(mention_id))
                    print(f"   Balasan berhasil terkirim ke X/Twitter untuk ID: {mention_id}")
                except Exception as e:
                    print(f"   Gagal mengirim balasan ke X/Twitter: {_short_error(e)}")

            enabled_channels = (twikit_client is not None) + (scraper_api is not None)
            if enabled_channels and ok_channels == 0:
                raise RuntimeError("semua kanal pembacaan mention gagal")

            backoff_multiplier = 1

        except Exception as e:
            print(f"Error dalam polling loop: {_short_error(e)}")
            sleep_duration = poll_interval * backoff_multiplier
            print(f"   Backoff aktif: menunggu {sleep_duration} detik sebelum retry (multiplier: {backoff_multiplier}x)...")
            backoff_multiplier = min(backoff_multiplier * 2, MAX_BACKOFF_MULTIPLIER)
            await asyncio.sleep(sleep_duration)
            continue

        await asyncio.sleep(poll_interval)


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
