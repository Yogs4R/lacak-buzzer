"""
Unit test untuk label kepercayaan berdasarkan jumlah tweet.
"""

from services.scoring import get_confidence


def test_rejects_fewer_than_10_tweets():
    assert get_confidence(9) == "insufficient_data"


def test_low_confidence_starts_at_10_tweets():
    assert get_confidence(10) == "rendah"


def test_normal_confidence_starts_at_50_tweets():
    assert get_confidence(50) == "normal"
