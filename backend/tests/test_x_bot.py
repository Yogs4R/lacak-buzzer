"""
Unit test untuk bridge mention bot ke backend analyze.
"""

import asyncio

from bot.x_bot import (
    build_analysis_payload,
    call_analyze_api,
    format_error_reply,
    format_success_reply,
    process_mention_text,
)


class FakeResponse:
    def __init__(self, data, status_code=200):
        self._data = data
        self.status_code = status_code

    def json(self):
        return self._data


class FakeClient:
    def __init__(self, response=None, error=None):
        self.response = response or FakeResponse({})
        self.error = error
        self.calls = []

    async def post(self, url, json):
        self.calls.append({"url": url, "json": json})
        if self.error:
            raise self.error
        return self.response


def run_async(coro):
    return asyncio.run(coro)


def test_build_analysis_payload_for_x_bot():
    assert build_analysis_payload("detikcom", "dandy63609", "123") == {
        "target": "detikcom",
        "source": "x_bot",
        "tweet_limit": 100,
        "requester": "dandy63609",
        "mention_id": "123",
    }


def test_valid_mention_calls_backend_payload():
    client = FakeClient(
        FakeResponse(
            {
                "score": 74,
                "risk_band": "Tinggi",
                "signals": ["Kemiripan pesan cukup tinggi"],
                "caveat": "Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.",
            }
        )
    )

    reply = run_async(
        process_mention_text(
            "@LacakBuzzer cek @detikcom",
            "LacakBuzzer",
            "dandy63609",
            "mention-1",
            "https://api.example.test",
            client=client,
        )
    )

    assert client.calls == [
        {
            "url": "https://api.example.test/api/analyze",
            "json": {
                "target": "detikcom",
                "source": "x_bot",
                "tweet_limit": 100,
                "requester": "dandy63609",
                "mention_id": "mention-1",
            },
        }
    ]
    assert "Indikator Risiko Amplifikasi Terkoordinasi: Tinggi" in reply


def test_invalid_mention_returns_none_without_backend_call():
    client = FakeClient()

    reply = run_async(
        process_mention_text(
            "@LacakBuzzer hello",
            "LacakBuzzer",
            "dandy63609",
            "mention-1",
            "https://api.example.test",
            client=client,
        )
    )

    assert reply is None
    assert client.calls == []


def test_requester_only_mention_returns_none_without_backend_call():
    client = FakeClient()

    reply = run_async(
        process_mention_text(
            "@LacakBuzzer cek @dandy63609",
            "LacakBuzzer",
            "dandy63609",
            "mention-1",
            "https://api.example.test",
            client=client,
        )
    )

    assert reply is None
    assert client.calls == []


def test_format_success_reply_is_short_safe_and_hides_metrics():
    reply = format_success_reply(
        {
            "score": 74,
            "risk_band": "Tinggi",
            "metrics": {"semantic_similarity": 82},
            "signals": [
                "Kemiripan pesan cukup tinggi",
                "Pola penggunaan tagar terlihat padat",
                "Aktivitas dan interaksi terlihat intens",
                "Sinyal ekstra tidak ditampilkan",
            ],
            "caveat": "Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.",
        }
    )

    assert "Indikator Risiko Amplifikasi Terkoordinasi: Tinggi" in reply
    assert "Skor: 74/100" in reply
    assert "Kemiripan pesan cukup tinggi" in reply
    assert "Pola penggunaan tagar terlihat padat" in reply
    assert "Aktivitas dan interaksi terlihat intens" in reply
    assert "Sinyal ekstra tidak ditampilkan" not in reply
    assert "semantic_similarity" not in reply
    assert "bukti bahwa akun tersebut terkoordinasi" in reply


def test_format_error_reply_uses_safe_backend_message():
    reply = format_error_reply(
        {
            "error": "insufficient_data",
            "message": "Data tweet tidak cukup untuk menghasilkan skor yang bertanggung jawab.",
        }
    )

    assert reply == "Data tweet tidak cukup untuk menghasilkan skor yang bertanggung jawab."


def test_format_error_reply_hides_unsafe_details():
    reply = format_error_reply(
        {
            "error": "scraper_login_problem",
            "message": "Traceback C:\\Users\\PC\\.env auth token leaked",
        }
    )

    assert reply == "Maaf, analisis belum bisa diproses. Coba beberapa saat lagi."


def test_call_analyze_api_returns_safe_error_on_network_failure():
    result = run_async(
        call_analyze_api(
            "https://api.example.test",
            build_analysis_payload("detikcom", "dandy63609", "mention-1"),
            client=FakeClient(error=RuntimeError("network traceback token")),
        )
    )

    assert result == {
        "error": "backend_unavailable",
        "message": "Maaf, analisis belum bisa diproses. Coba beberapa saat lagi.",
    }
