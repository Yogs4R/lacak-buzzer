"""
Unit test untuk bridge mention bot ke backend analyze.
"""

import asyncio

from bot.x_bot import (
    build_analysis_payload,
    call_analyze_api,
    dry_run_mention,
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
    assert "Risiko: Tinggi | Skor:" in reply


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

    assert "Risiko: Tinggi | Skor: 74/100" in reply
    assert "Skor: 74/100" in reply
    assert "Kemiripan pesan cukup tinggi" in reply
    assert "Pola penggunaan tagar terlihat padat" in reply
    # Signal ke-3 dan ke-4 tidak ditampilkan karena dibatasi 2 sinyal
    assert "Aktivitas dan interaksi terlihat intens" not in reply
    assert "Sinyal ekstra tidak ditampilkan" not in reply
    assert "semantic_similarity" not in reply
    assert "bukan bukti koordinasi" in reply
    assert "lacakbuzzer.web.id" in reply
    assert len(reply) <= 280


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


def test_dry_run_valid_mention_prints_reply_preview():
    client = FakeClient(
        FakeResponse(
            {
                "score": 74,
                "risk_band": "Tinggi",
                "metrics": {"semantic_similarity": 82},
                "signals": [
                    "Kemiripan pesan cukup tinggi",
                    "Pola penggunaan tagar terlihat padat",
                    "Aktivitas dan interaksi terlihat intens",
                ],
                "caveat": "Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.",
            }
        )
    )

    output = run_async(
        dry_run_mention(
            text="@LacakBuzzer cek @detikcom",
            bot_username="LacakBuzzer",
            requester_username="dandy63609",
            mention_id="dryrun-001",
            base_url="http://127.0.0.1:8000",
            client=client,
        )
    )

    assert "Target: detikcom" in output
    assert '"source": "x_bot"' in output
    assert "POST http://127.0.0.1:8000/api/analyze" in output
    assert "Risiko: Tinggi | Skor:" in output
    assert "bukan bukti koordinasi" in output
    assert "lacakbuzzer.web.id" in output
    assert "semantic_similarity" not in output


def test_dry_run_invalid_mention_does_not_call_backend():
    client = FakeClient()

    output = run_async(
        dry_run_mention(
            text="@LacakBuzzer hello",
            bot_username="LacakBuzzer",
            requester_username="dandy63609",
            mention_id="dryrun-001",
            base_url="http://127.0.0.1:8000",
            client=client,
        )
    )

    assert "No valid target mention found. No reply would be sent." in output
    assert client.calls == []


def test_dry_run_requester_only_mention_does_not_call_backend():
    client = FakeClient()

    output = run_async(
        dry_run_mention(
            text="@LacakBuzzer cek @dandy63609",
            bot_username="LacakBuzzer",
            requester_username="dandy63609",
            mention_id="dryrun-001",
            base_url="http://127.0.0.1:8000",
            client=client,
        )
    )

    assert "No valid target mention found. No reply would be sent." in output
    assert client.calls == []


def test_dry_run_hides_unsafe_backend_error_details():
    client = FakeClient(
        FakeResponse(
            {
                "error": "scraper_login_problem",
                "message": "Traceback C:\\Users\\PC\\.env auth token leaked",
            },
            status_code=400,
        )
    )

    output = run_async(
        dry_run_mention(
            text="@LacakBuzzer cek @detikcom",
            bot_username="LacakBuzzer",
            requester_username="dandy63609",
            mention_id="dryrun-001",
            base_url="http://127.0.0.1:8000",
            client=client,
        )
    )

    assert "Maaf, analisis belum bisa diproses. Coba beberapa saat lagi." in output
    assert "Traceback" not in output
    assert ".env" not in output
    assert "token" not in output


# ---------------------------------------------------------------------------
# Polling mention: dedupe, state persisten, kanal gagal, filter umur
# ---------------------------------------------------------------------------

import time as _time
from types import SimpleNamespace

from bot.x_bot import (
    HandledMentions,
    collect_mentions,
    fetch_notification_mentions,
    fetch_search_mentions,
    log_cookie_account,
    select_new_mentions,
    snowflake_to_unix,
)

_EPOCH_MS = 1288834974657


def make_id(unix_seconds: float, seq: int = 0) -> str:
    return str(((int(unix_seconds * 1000) - _EPOCH_MS) << 22) + seq)


def make_mention(m_id, text="@LacakBuzzer cek @detikcom", requester="dandy63609", in_reply_to=""):
    return {"id": m_id, "text": text, "requester": requester, "in_reply_to": in_reply_to, "source": "test"}


def test_snowflake_roundtrip():
    now = 1_790_000_000.0
    assert abs(snowflake_to_unix(make_id(now)) - now) < 0.01
    assert snowflake_to_unix("bukan-angka") is None


def test_duplicate_mention_error_is_not_posted_publicly():
    client = FakeClient(FakeResponse({"error": "rate_limit_exceeded", "message": "Duplicate mention"}))

    reply = run_async(
        process_mention_text(
            "@LacakBuzzer cek @detikcom",
            "LacakBuzzer",
            "dandy63609",
            "123",
            "https://api.example.test",
            client=client,
        )
    )

    assert reply is None


def test_user_facing_rate_limit_error_is_still_posted():
    message = "Akun ini sudah dianalisis baru-baru ini. Coba lagi beberapa saat lagi."
    client = FakeClient(FakeResponse({"error": "rate_limit_exceeded", "message": message}))

    reply = run_async(
        process_mention_text(
            "@LacakBuzzer cek @detikcom",
            "LacakBuzzer",
            "dandy63609",
            "123",
            "https://api.example.test",
            client=client,
        )
    )

    assert reply == message


def test_select_new_mentions_filters_and_sorts():
    now = 1_790_000_000.0
    newer = make_id(now - 10)
    older = make_id(now - 60)
    stale = make_id(now - 3 * 3600)
    handled_id = make_id(now - 30)

    mentions = [
        make_mention(newer),
        make_mention(newer),  # sama dari kanal lain
        make_mention(older),
        make_mention(stale),  # terlalu lama (mis. setelah restart)
        make_mention(handled_id),
        make_mention(make_id(now - 5, 1), requester="LacakBuzzer"),  # tweet bot sendiri
        make_mention(make_id(now - 5, 2), in_reply_to="lacakbuzzer"),  # balasan di thread bot
        make_mention("abc"),
        make_mention(make_id(now - 5, 3), text=""),
    ]

    selected = select_new_mentions(mentions, "LacakBuzzer", {handled_id}, now=now, max_age_seconds=1800)

    assert [m["id"] for m in selected] == [older, newer]


def test_handled_mentions_persist_across_restart(tmp_path):
    path = str(tmp_path / "x_bot_state.json")
    handled = HandledMentions(path=path, limit=3)
    for m_id in ["1", "2", "3", "4"]:
        handled.add(m_id)

    reloaded = HandledMentions(path=path, limit=3)
    assert "1" not in reloaded
    assert all(m_id in reloaded for m_id in ["2", "3", "4"])


def test_handled_mentions_survive_corrupt_file(tmp_path):
    path = tmp_path / "x_bot_state.json"
    path.write_text("{rusak", encoding="utf-8")

    handled = HandledMentions(path=str(path))
    handled.add("10")

    assert "10" in HandledMentions(path=str(path))


def legacy_response(tweets=(), users=(), notifications=None, top_cursor=None):
    """Bentuk respons /i/api/2/notifications/*.json (adaptive JSON)."""
    go = {
        "tweets": {t["id_str"]: t for t in tweets},
        "users": {u["id_str"]: u for u in users},
    }
    if notifications is not None:
        go["notifications"] = notifications
    entries = [{"entryId": f"tweet-{t['id_str']}"} for t in tweets]
    entries.append({"entryId": "cursor-bottom-0"})
    if top_cursor:
        entries.insert(0, {"entryId": "cursor-top-1", "content": {"operation": {"cursor": {"value": top_cursor, "cursorType": "Top"}}}})
    return {"globalObjects": go, "timeline": {"instructions": [{"addEntries": {"entries": entries}}]}}


def legacy_tweet(t_id, text, user_id, reply_to=None, mentions=(), reply_to_status=None):
    return {
        "id_str": t_id,
        "full_text": text,
        "user_id_str": user_id,
        "in_reply_to_screen_name": reply_to,
        "in_reply_to_status_id_str": reply_to_status,
        "entities": {"user_mentions": [{"screen_name": m} for m in mentions]},
    }


class FakeV11:
    def __init__(self, mentions_response=None, all_response=None, error=None, screen_name="LacakBuzzer", newer_responses=None):
        self.mentions_response = mentions_response or legacy_response()
        self.newer_responses = newer_responses or {}
        self.cursors = []
        self.all_response = all_response or legacy_response()
        self.error = error
        self.screen_name = screen_name
        self.calls = []

    async def notifications_mentions(self, count, cursor):
        self.calls.append("mentions")
        self.cursors.append(cursor)
        if self.error:
            raise self.error
        if cursor is not None:
            return self.newer_responses.get(cursor, legacy_response()), None
        return self.mentions_response, None

    async def notifications_all(self, count, cursor):
        self.calls.append("all")
        if self.error:
            raise self.error
        return self.all_response, None

    async def settings(self):
        return {"screen_name": self.screen_name}, None


class FakeTwikitClient:
    def __init__(self, **kwargs):
        self.v11 = FakeV11(**kwargs)
        self.client_transaction = SimpleNamespace(home_page_response="stale")


USERS = [{"id_str": "9", "screen_name": "dandy63609"}, {"id_str": "1", "screen_name": "LacakBuzzer"}]


class FakeScraperApi:
    def __init__(self, tweets=None, error=None, delay=0):
        self.tweets = tweets or []
        self.error = error
        self.delay = delay
        self.queries = []

    async def search(self, query, limit=20, kv=None):
        self.queries.append((query, kv))
        if self.delay:
            await asyncio.sleep(self.delay)
        if self.error:
            raise self.error
        for t in self.tweets:
            yield t


def twscrape_tweet(m_id, text, username, reply_to=None, reply_to_status=None):
    return SimpleNamespace(
        id=int(m_id),
        rawContent=text,
        user=SimpleNamespace(username=username),
        inReplyToUser=SimpleNamespace(username=reply_to) if reply_to else None,
        inReplyToTweetId=reply_to_status,
    )


def test_fetch_notification_mentions_reads_raw_mentions_response():
    response = legacy_response(
        tweets=[
            legacy_tweet("111", "@LacakBuzzer cek @detikcom", "9", reply_to="LacakBuzzer", mentions=["LacakBuzzer", "detikcom"], reply_to_status="100"),
            legacy_tweet("110", "tweet konteks tanpa mention bot", "9"),
        ],
        users=USERS,
    )
    client = FakeTwikitClient(mentions_response=response)

    mentions, info = run_async(fetch_notification_mentions(client, "LacakBuzzer"))

    assert mentions == [
        {
            "id": "111",
            "text": "@LacakBuzzer cek @detikcom",
            "requester": "dandy63609",
            "in_reply_to": "LacakBuzzer",
            "source": "notif_mentions",
        }
    ]
    assert info.startswith("mentions.json=1, terbaru ")
    assert client.v11.calls == ["mentions"]  # tab All tidak perlu dibaca


def test_fetch_notification_mentions_ignores_empty_notifications_key():
    # twifork mengambil cabang `notifications` bila kunci itu ada (meski kosong)
    # dan melewatkan tweet mention; parser kita tetap membaca tweet-nya.
    response = legacy_response(
        tweets=[legacy_tweet("111", "@lacakbuzzer analisis akun ini @detikcom", "9")],
        users=USERS,
        notifications={},
    )
    mentions, _ = run_async(fetch_notification_mentions(FakeTwikitClient(mentions_response=response), "LacakBuzzer"))

    assert [m["id"] for m in mentions] == ["111"]


def test_fetch_notification_mentions_falls_back_to_all_tab():
    all_response = legacy_response(
        tweets=[legacy_tweet("222", "@LacakBuzzer cek @detikcom", "9")],
        users=USERS,
    )
    client = FakeTwikitClient(all_response=all_response)

    mentions, info = run_async(fetch_notification_mentions(client, "LacakBuzzer", verbose=True))

    assert [m["source"] for m in mentions] == ["notif_all"]
    assert client.v11.calls == ["mentions", "all"]
    assert "mentions.json=0" in info and "all.json=1" in info
    assert "tweets=0" in info and "tweets=1" in info
    assert "'cursor-bottom': 1" in info


def test_bot_mention_detection_does_not_match_longer_usernames():
    response = legacy_response(
        tweets=[legacy_tweet("111", "@LacakBuzzer2 halo", "9")],
        users=USERS,
    )
    mentions, _ = run_async(fetch_notification_mentions(FakeTwikitClient(mentions_response=response), "LacakBuzzer"))

    assert mentions == []


def test_log_cookie_account_warns_on_wrong_account(capsys):
    run_async(log_cookie_account(FakeTwikitClient(screen_name="lacakbuzzer2"), "lacakbuzzer"))
    assert "BUKAN @lacakbuzzer" in capsys.readouterr().out

    run_async(log_cookie_account(FakeTwikitClient(screen_name="LacakBuzzer"), "lacakbuzzer"))
    assert "login sebagai @LacakBuzzer" in capsys.readouterr().out


def test_fetch_search_mentions_uses_latest_tab():
    api = FakeScraperApi([twscrape_tweet("222", "@LacakBuzzer cek @detikcom", "dandy63609")])

    mentions = run_async(fetch_search_mentions(api, "LacakBuzzer"))

    assert api.queries == [("@LacakBuzzer", {"product": "Latest"})]
    assert mentions[0]["id"] == "222"
    assert mentions[0]["requester"] == "dandy63609"
    assert mentions[0]["source"] == "twscrape_search"


def test_fetch_search_mentions_times_out_instead_of_hanging():
    api = FakeScraperApi(delay=5)

    try:
        run_async(fetch_search_mentions(api, "LacakBuzzer", timeout=0.05))
    except asyncio.TimeoutError:
        pass
    else:
        raise AssertionError("expected timeout")


class NoAccountError(Exception):
    """Nama sama dengan twscrape.accounts_pool.NoAccountError."""


def test_collect_mentions_one_failing_channel_does_not_block_other():
    response = legacy_response(tweets=[legacy_tweet("111", "@LacakBuzzer cek @detikcom", "9")], users=USERS)
    twikit_client = FakeTwikitClient(mentions_response=response)
    scraper_api = FakeScraperApi(error=NoAccountError("No account available for queue SearchTimeline"))

    mentions, status, ok_channels = run_async(collect_mentions(twikit_client, scraper_api, "LacakBuzzer"))

    assert [m["id"] for m in mentions] == ["111"]
    assert ok_channels == 1
    assert status["notifikasi"].startswith("1 tweet (mentions.json=1, terbaru ")
    assert "cooldown" in status["search"]


def test_collect_mentions_resets_twikit_transaction_on_error():
    twikit_client = FakeTwikitClient(error=RuntimeError("Couldn't get KEY_BYTE indices"))

    mentions, status, ok_channels = run_async(collect_mentions(twikit_client, None, "LacakBuzzer"))

    assert mentions == []
    assert ok_channels == 0
    assert status["notifikasi"].startswith("gagal (RuntimeError")
    assert twikit_client.client_transaction.home_page_response is None


def test_select_new_mentions_counts_skip_reasons():
    from collections import Counter

    now = 1_790_000_000.0
    handled_id = make_id(now - 30)
    mentions = [
        make_mention(make_id(now - 10)),
        make_mention(make_id(now - 3 * 3600)),
        make_mention(make_id(now - 2 * 3600)),
        make_mention(handled_id),
        make_mention(make_id(now - 5, 1), requester="LacakBuzzer"),
        make_mention(make_id(now - 5, 2), in_reply_to="lacakbuzzer"),
    ]
    skipped = Counter()

    selected = select_new_mentions(mentions, "LacakBuzzer", {handled_id}, now=now, max_age_seconds=1800, skipped=skipped)

    assert len(selected) == 1
    assert skipped == Counter({
        "lebih tua dari 30 menit": 2,
        "sudah diproses": 1,
        "tweet bot sendiri": 1,
        "balasan di thread bot": 1,
    })


def test_tweet_starting_with_bot_mention_is_not_treated_as_thread_reply():
    # Bentuk asli dari X: tweet biasa "@lacakbuzzer cek ..." punya
    # in_reply_to_screen_name = lacakbuzzer tetapi tanpa in_reply_to_status_id_str.
    now = _time.time()
    standalone_id = make_id(now - 60)
    real_reply_id = make_id(now - 30)
    response = legacy_response(
        tweets=[
            legacy_tweet(standalone_id, "@lacakbuzzer analisis akun ini @detikcom", "9", reply_to="lacakbuzzer"),
            legacy_tweet(real_reply_id, "@lacakbuzzer @detikcom mantap", "9", reply_to="lacakbuzzer", reply_to_status="123"),
        ],
        users=USERS,
    )
    mentions, _ = run_async(fetch_notification_mentions(FakeTwikitClient(mentions_response=response), "lacakbuzzer"))

    selected = select_new_mentions(mentions, "lacakbuzzer", set(), now=now)

    assert [m["id"] for m in selected] == [standalone_id]


def test_twscrape_standalone_mention_is_not_treated_as_thread_reply():
    from bot.x_bot import mention_from_twscrape

    standalone = mention_from_twscrape(twscrape_tweet("5", "@lacakbuzzer cek @detikcom", "qterwi", reply_to="lacakbuzzer"))
    real_reply = mention_from_twscrape(twscrape_tweet("6", "@lacakbuzzer ok", "qterwi", reply_to="lacakbuzzer", reply_to_status=4))

    assert standalone["in_reply_to"] == ""
    assert real_reply["in_reply_to"] == "lacakbuzzer"


def test_fetch_notification_mentions_follows_top_cursor_for_newer_items():
    now = _time.time()
    old_id = make_id(now - 3600)
    new_id = make_id(now - 20)
    stale = legacy_response(
        tweets=[legacy_tweet(old_id, "@lacakbuzzer cek @elonmusk", "9")],
        users=USERS,
        top_cursor="TOP-1",
    )
    newer = legacy_response(
        tweets=[legacy_tweet(new_id, "@lacakbuzzer cek @detikcom", "9")],
        users=USERS,
        top_cursor="TOP-2",
    )
    client = FakeTwikitClient(mentions_response=stale, newer_responses={"TOP-1": newer})

    # Polling 1: belum ada cursor, hanya simpan cursor-top.
    first, info1 = run_async(fetch_notification_mentions(client, "lacakbuzzer"))
    assert [m["id"] for m in first] == [old_id]
    assert "terbaru 60 mnt lalu" in info1
    assert client.v11.cursors == [None]

    # Polling 2: minta juga item yang lebih baru dengan cursor-top tadi.
    second, info2 = run_async(fetch_notification_mentions(client, "lacakbuzzer"))
    assert [m["id"] for m in second] == [old_id, new_id]
    assert "lebih_baru=1, terbaru 0 mnt lalu" in info2
    assert client.v11.cursors == [None, None, "TOP-1"]
    assert client._lacak_top_cursor == "TOP-2"

    selected = select_new_mentions(second, "lacakbuzzer", set(), now=now)
    assert [m["id"] for m in selected] == [new_id]


def test_find_top_cursor_missing_returns_none():
    from bot.x_bot import find_top_cursor

    assert find_top_cursor(legacy_response()) is None
    assert find_top_cursor(legacy_response(top_cursor="ABC")) == "ABC"
