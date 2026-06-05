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
    parser = argparse.ArgumentParser(description="X bot dry-run helper.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--text", required=True)
    parser.add_argument("--bot-username", required=True)
    parser.add_argument("--requester", required=True)
    parser.add_argument("--mention-id", required=True)
    parser.add_argument("--base-url", required=True)
    return parser


async def main(argv=None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    if not args.dry_run:
        parser.error("Only --dry-run is supported. Live X posting is disabled.")

    output = await dry_run_mention(
        text=args.text,
        bot_username=args.bot_username,
        requester_username=args.requester,
        mention_id=args.mention_id,
        base_url=args.base_url,
    )
    print(output)
    return 0


async def start_bot():
    """Placeholder: live X polling/posting requires explicit approval."""
    pass


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
