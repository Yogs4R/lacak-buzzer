"""
Unit test untuk parsing mention bot dan normalisasi target.
"""
import pytest

from bot.mention_parser import parse_mention


def test_username_normalization():
    pytest.importorskip("fastapi")
    from api.analyze import normalize_username

    test_cases = {
        "detikcom": "detikcom",
        "  detikcom  ": "detikcom",
        "@detikcom": "detikcom",
        " @detikcom ": "detikcom",
        "https://x.com/detikcom": "detikcom",
        "http://twitter.com/detikcom": "detikcom",
        "https://twitter.com/detikcom?s=20&t=abc": "detikcom",
        "x.com/detikcom": "detikcom",
        "twitter.com/detikcom": "detikcom",
        "https://x.com/@detikcom": "detikcom",
    }

    for input_target, expected_username in test_cases.items():
        assert normalize_username(input_target) == expected_username


def test_parse_mention_returns_basic_target():
    assert parse_mention("@LacakBuzzer cek @detikcom", "LacakBuzzer") == "detikcom"


def test_parse_mention_allows_target_before_bot_mention():
    assert parse_mention("cek @detikcom @LacakBuzzer", "LacakBuzzer") == "detikcom"


def test_parse_mention_ignores_bot_username():
    assert parse_mention("@LacakBuzzer hello", "LacakBuzzer") is None


def test_parse_mention_ignores_bot_username_case_insensitively():
    assert parse_mention("@lacakbuzzer cek @DetikCom", "LacakBuzzer") == "detikcom"


def test_parse_mention_does_not_analyze_requester_without_target_mention():
    assert parse_mention(
        "@LacakBuzzer cek saya",
        "LacakBuzzer",
        requester_username="dandy63609",
    ) is None


def test_parse_mention_ignores_requester_username():
    assert parse_mention(
        "@LacakBuzzer cek @dandy63609",
        "LacakBuzzer",
        requester_username="dandy63609",
    ) is None


def test_parse_mention_chooses_target_after_requester():
    assert parse_mention(
        "@LacakBuzzer cek @dandy63609 @kompascom",
        "LacakBuzzer",
        requester_username="dandy63609",
    ) == "kompascom"


def test_parse_mention_returns_first_valid_target():
    assert parse_mention(
        "@LacakBuzzer bandingkan @detikcom @kompascom",
        "LacakBuzzer",
    ) == "detikcom"


def test_parse_mention_returns_none_without_mentions():
    assert parse_mention("tolong cek akun ini", "LacakBuzzer") is None


def test_parse_mention_requires_bot_mention():
    assert parse_mention("tolong cek @detikcom", "LacakBuzzer") is None


def test_parse_mention_supports_username_chars_and_rejects_trailing_punctuation():
    assert parse_mention("@LacakBuzzer cek @akun_123.", "LacakBuzzer") == "akun_123"
