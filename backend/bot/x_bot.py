"""
Proses utama bot X yang memantau mention dan membalas analisis.
"""

import argparse
import asyncio
import json

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
    """Format safe public bot reply without exposing full metric details."""
    risk_band = result.get("risk_band", "Tidak tersedia")
    score = result.get("score", 0)
    signals = result.get("signals", [])[:3]
    caveat = result.get("caveat", "")

    lines = [
        f"Indikator Risiko Amplifikasi Terkoordinasi: {risk_band}",
        f"Skor: {score}/100",
    ]

    if signals:
        lines.extend(["", "Sinyal utama:"])
        lines.extend(f"- {signal}" for signal in signals)

    if caveat:
        lines.extend(["", f"Catatan: {caveat}"])

    return "\n".join(lines)


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

            async with httpx.AsyncClient(timeout=30) as http_client:
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
    if "error" in result:
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


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="X bot helper.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--text", help="Required for dry-run mode")
    parser.add_argument("--bot-username", required=True)
    parser.add_argument("--requester", help="Required for dry-run mode")
    parser.add_argument("--mention-id", help="Required for dry-run mode")
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--poll-interval", type=int, default=60)
    return parser


async def main(argv=None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

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
    else:
        await start_bot(
            base_url=args.base_url,
            bot_username=args.bot_username,
            poll_interval=args.poll_interval
        )
        return 0


async def start_bot(base_url: str, bot_username: str, poll_interval: int = 60):
    """Memulai loop polling mention Twitter/X dan membalas analisis secara otomatis."""
    import time
    import tweepy
    from twscrape import API, gather
    from services.init_db import init_twitter_db
    import os

    print(f"X Bot aktif! Memantau mention untuk @{bot_username}...")
    print(f"   Backend URL: {base_url}")
    print(f"   Interval polling: {poll_interval} detik")

    # Inisialisasi basis data Twitter scraper di runtime (scraping account)
    init_twitter_db()
    scraper_api = API()

    # Inisialisasi client API v2 Tweepy untuk memposting balasan (Free tier)
    consumer_key = os.getenv("X_CONSUMER_KEY")
    consumer_secret = os.getenv("X_CONSUMER_SECRET")
    access_token = os.getenv("X_ACCESS_TOKEN")
    access_token_secret = os.getenv("X_ACCESS_TOKEN_SECRET")

    tweepy_client = None
    if consumer_key and consumer_secret and access_token and access_token_secret:
        try:
            tweepy_client = tweepy.Client(
                consumer_key=consumer_key,
                consumer_secret=consumer_secret,
                access_token=access_token,
                access_token_secret=access_token_secret
            )
            print("Tweepy Client (X API v2) terinisialisasi untuk memposting balasan.")
        except Exception as e:
            print(f"Gagal menginisialisasi Tweepy Client: {e}")
    else:
        print("Kredensial X API v2 tidak lengkap. Bot berjalan dalam mode baca-saja.")

    # Exponential backoff saat terjadi error berturutan
    MAX_BACKOFF_MULTIPLIER = 8
    backoff_multiplier = 1

    while True:
        try:
            print(f"\n[{time.strftime('%H:%M:%S')}] Memeriksa mention baru...")

            # Cari mention bot di Twitter/X menggunakan twscrape search
            query = f"@{bot_username}"
            raw_tweets = await gather(scraper_api.search(query, limit=20))

            print(f"   Ditemukan {len(raw_tweets)} tweet yang me-mention @{bot_username}.")

            for t in raw_tweets:
                mention_id = str(t.id)
                text = t.rawContent
                requester = t.user.username

                # Proses mention teks untuk melihat apakah ada target analisis valid
                reply_text = await process_mention_text(
                    text=text,
                    bot_username=bot_username,
                    requester_username=requester,
                    mention_id=mention_id,
                    base_url=base_url
                )

                if reply_text:
                    print(f"Memproses mention dari @{requester} (ID: {mention_id})")
                    print(f"   Isi tweet: \"{text}\"")
                    print(f"   Draft Balasan:\n{reply_text}")

                    if tweepy_client:
                        try:
                            # Menggunakan API v2 create_tweet untuk reply
                            tweepy_client.create_tweet(
                                text=reply_text,
                                in_reply_to_tweet_id=int(mention_id)
                            )
                            print(f"   Balasan berhasil terkirim ke X/Twitter untuk ID: {mention_id}")
                        except Exception as e:
                            print(f"   Gagal mengirim balasan ke X/Twitter: {e}")
                    else:
                        print("   Balasan tidak diposting (kredensial API kosong atau salah).")
                else:
                    # Mengabaikan mention yang tidak valid
                    pass

            # Iterasi berhasil - reset backoff ke normal
            backoff_multiplier = 1

        except Exception as e:
            print(f"Error dalam polling loop: {e}")
            # Terapkan exponential backoff untuk mengurangi tekanan ke Twitter saat error
            sleep_duration = poll_interval * backoff_multiplier
            print(f"   Backoff aktif: menunggu {sleep_duration} detik sebelum retry (multiplier: {backoff_multiplier}x)...")
            backoff_multiplier = min(backoff_multiplier * 2, MAX_BACKOFF_MULTIPLIER)
            await asyncio.sleep(sleep_duration)
            continue

        await asyncio.sleep(poll_interval)


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
