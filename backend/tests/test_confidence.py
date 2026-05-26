"""
Unit test untuk label kepercayaan berdasarkan jumlah tweet.
"""

from services.scoring import get_confidence


def test_confidence_boundaries():
    expected = {
        0: "insufficient_data",
        9: "insufficient_data",
        10: "rendah",
        49: "rendah",
        50: "normal",
    }

    for tweet_count, label in expected.items():
        assert get_confidence(tweet_count) == label
