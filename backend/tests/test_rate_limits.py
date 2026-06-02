"""
Unit test untuk sistem rate limit.
"""
import pytest
from unittest.mock import patch
from datetime import datetime, timezone, timedelta
from services import rate_limits


@pytest.fixture(autouse=True)
def setup_test_limits(tmp_path):
    # Set limits file to a temp path for testing
    test_file = tmp_path / "rate_limits_test.json"
    with patch("services.rate_limits.LIMITS_FILE", str(test_file)):
        yield test_file


def test_website_rate_limiting():
    ip = "192.168.1.1"

    # First 5 checks should be fine
    for _ in range(5):
        assert rate_limits.check_rate_limit("website", ip) is None
        rate_limits.increment_rate_limit("website", ip)

    # 6th should exceed limit
    err = rate_limits.check_rate_limit("website", ip)
    assert err == "Batas analisis harian tercapai. Coba lagi besok."


def test_bot_global_rate_limiting():
    # 10 checks globally
    for i in range(10):
        # Using different requesters and targets to not trigger those limits
        requester = f"user_{i}"
        target = f"target_{i}"
        assert rate_limits.check_rate_limit("x_bot", requester, target) is None
        rate_limits.increment_rate_limit("x_bot", requester, target)

    # 11th should fail on global limit
    err = rate_limits.check_rate_limit("x_bot", "another_user", "another_target")
    assert err == "Batas harian bot sudah tercapai. Coba lagi besok."


def test_bot_requester_rate_limiting():
    requester = "active_requester"

    # 3 analyses per requester
    for i in range(3):
        target = f"target_{i}"
        assert rate_limits.check_rate_limit("x_bot", requester, target) is None
        rate_limits.increment_rate_limit("x_bot", requester, target)

    # 4th should fail
    err = rate_limits.check_rate_limit("x_bot", requester, "target_3")
    assert err == "Batas permintaan harian kamu sudah tercapai. Coba lagi besok."


def test_bot_target_rate_limiting():
    target = "popular_target"

    # First analysis is ok
    assert rate_limits.check_rate_limit("x_bot", "requester_1", target) is None
    rate_limits.increment_rate_limit("x_bot", "requester_1", target)

    # Second analysis of same target today fails
    err = rate_limits.check_rate_limit("x_bot", "requester_2", target)
    assert err == "Akun ini sudah dianalisis hari ini. Coba lagi besok."


def test_bot_duplicate_mention_prevention():
    mention_id = "123456789"

    # First mention
    assert rate_limits.check_rate_limit("x_bot", "requester", "target", mention_id) is None
    rate_limits.increment_rate_limit("x_bot", "requester", "target", mention_id)

    # Duplicate mention check fails even if requester is different
    err = rate_limits.check_rate_limit("x_bot", "other_requester", "other_target", mention_id)
    assert err == "Duplicate mention"


def test_rate_limit_reset_on_new_day():
    ip = "192.168.1.1"

    # Exceed limit
    for _ in range(5):
        rate_limits.increment_rate_limit("website", ip)
    assert rate_limits.check_rate_limit("website", ip) is not None

    # Mock date to tomorrow
    tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")

    # Manually modify the file's date to simulate tomorrow
    data = rate_limits._load_limits()
    data["date"] = tomorrow
    rate_limits._save_limits(data)

    # Now checking limit should succeed (resets on date mismatch)
    assert rate_limits.check_rate_limit("website", ip) is None
