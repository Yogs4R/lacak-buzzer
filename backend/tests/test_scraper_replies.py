"""
Test unit untuk memverifikasi bahwa scraper memanggil api.user_tweets_and_replies,
memiliki fast-fail timeout, dan fallback ke user_tweets standar jika replies endpoint bermasalah.
"""
import asyncio
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from services.scraper import scrape_tweets
from services.scoring import calculate_score, normalize_metrics, get_risk_band


class DummyTweet:
    def __init__(self, tweet_id, text, in_reply_to=None):
        self.id = tweet_id
        self.id_str = str(tweet_id)
        self.rawContent = text
        self.date = "2026-06-01T12:00:00Z"
        self.hashtags = []
        self.links = []
        self.media = None
        self.mentionedUsers = []
        self.inReplyToTweetId = in_reply_to
        self.url = f"https://x.com/buzzer_reply/status/{tweet_id}"


def test_scraper_extracts_replies_and_scores_correctly():
    """Menguji pipeline pengambilan tweet balasan dan perhitungan risikonya."""
    mock_user = MagicMock()
    mock_user.id = 88888
    mock_user.username = "buzzer_reply_user"
    mock_user.rawDescription = "Akun yang hanya aktif membalas"
    mock_user.created = "2024-01-01T00:00:00Z"
    mock_user.protected = False

    # 20 tweet balasan (semua merupakan reply ke tweet lain)
    mock_tweet_list = [
        DummyTweet(2000 + i, f"Komentar balasan {i}", in_reply_to=99999)
        for i in range(20)
    ]

    async def run_async_test():
        with patch("services.scraper.API") as mock_api_class:
            mock_api_instance = MagicMock()
            mock_api_class.return_value = mock_api_instance
            mock_api_instance.user_by_login = AsyncMock(return_value=mock_user)

            async def async_tweet_gen():
                for t in mock_tweet_list:
                    yield t

            mock_api_instance.user_tweets_and_replies = MagicMock(return_value=async_tweet_gen())

            # Eksekusi scraper
            result = await scrape_tweets("buzzer_reply_user", limit=100)

            # 1. Pastikan method yang dipanggil adalah user_tweets_and_replies
            assert mock_api_instance.user_tweets_and_replies.called
            mock_api_instance.user_tweets_and_replies.assert_called_once_with(88888, limit=100)

            # 2. Pastikan tweet balasan berhasil diekstrak dengan reply_flag=True
            assert len(result["tweets"]) == 20
            assert all(t["reply_flag"] is True for t in result["tweets"])

            return result

    result = asyncio.run(run_async_test())

    # 3. Verifikasi perhitungan metrik jika semua tweet adalah balasan
    total_posts = len(result["tweets"])
    replies = sum(1 for t in result["tweets"] if t.get("reply_flag", False))
    reply_ratio = replies / total_posts
    assert reply_ratio == 1.0

    features = {
        "semantic_similarity": 0.80,
        "avg_hashtags_per_post": 0.5,
        "posts_per_day": 10.0,
        "url_ratio": 0.0,
        "photo_ratio": 0.0,
        "mention_ratio": 0.8,
        "reply_ratio": reply_ratio,
        "account_age_days": 60.0,
        "bio_is_empty": False,
        "posting_entropy": 0.4
    }

    score = calculate_score(features)
    norm = normalize_metrics(features)
    risk = get_risk_band(score)

    assert 0 <= score <= 100
    assert norm["interaction_behavior"] > 0
    assert risk in ["Rendah", "Sedang", "Tinggi", "Ekstrem"]


def test_scraper_fast_fail_timeout():
    """Menguji bahwa scraper langsung melempar TimeoutError jika operasi melebihi batas waktu (tidak stuck 15 menit)."""
    async def run_timeout_test():
        with patch("services.scraper.API") as mock_api_class:
            mock_api_instance = MagicMock()
            mock_api_class.return_value = mock_api_instance

            # Simulasikan proses user_by_login yang tertidur lama (seperti twscrape sleep saat antrean habis)
            async def hanging_call(*args, **kwargs):
                await asyncio.sleep(2.0)
                return None

            mock_api_instance.user_by_login = hanging_call

            with pytest.raises(asyncio.TimeoutError):
                await scrape_tweets("test_user", limit=100, timeout=0.1)

    asyncio.run(run_timeout_test())


def test_scraper_fallback_to_user_tweets():
    """Menguji bahwa scraper fallback ke user_tweets biasa jika endpoint user_tweets_and_replies mengalami error."""
    mock_user = MagicMock()
    mock_user.id = 77777
    mock_user.username = "fallback_user"
    mock_user.rawDescription = "Akun fallback test"
    mock_user.created = "2024-01-01T00:00:00Z"
    mock_user.protected = False

    mock_tweets = [DummyTweet(100 + i, f"Tweet regular {i}") for i in range(15)]

    async def run_fallback_test():
        with patch("services.scraper.API") as mock_api_class:
            mock_api_instance = MagicMock()
            mock_api_class.return_value = mock_api_instance
            mock_api_instance.user_by_login = AsyncMock(return_value=mock_user)

            # Simulasikan user_tweets_and_replies melempar error (seperti 404 dari Twitter)
            def broken_replies_gen(*args, **kwargs):
                raise RuntimeError("GraphQL 404 endpoint not found")

            async def regular_tweets_gen():
                for t in mock_tweets:
                    yield t

            mock_api_instance.user_tweets_and_replies = broken_replies_gen
            mock_api_instance.user_tweets = MagicMock(return_value=regular_tweets_gen())

            result = await scrape_tweets("fallback_user", limit=100)

            # Pastikan user_tweets dipanggil sebagai fallback
            assert mock_api_instance.user_tweets.called
            assert len(result["tweets"]) == 15
            assert all(t["reply_flag"] is False for t in result["tweets"])

    asyncio.run(run_fallback_test())
