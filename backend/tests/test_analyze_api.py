"""
Integration tests untuk endpoint /api/analyze FastAPI.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_limits(tmp_path):
    # Temp file untuk rate limits selama testing API
    test_file = tmp_path / "rate_limits_api_test.json"
    with patch("services.rate_limits.LIMITS_FILE", str(test_file)):
        yield test_file


@patch("api.analyze.scrape_tweets", new_callable=AsyncMock)
def test_analyze_endpoint_success(mock_scrape):
    # Mock data scraping sukses dengan 100 tweet
    mock_scrape.return_value = {
        "profile": {
            "username": "target_user",
            "bio": "Ini adalah akun bio yang aman.",
            "created_at": "2020-01-01T00:00:00Z"
        },
        "tweets": [
            {
                "text": "Tweet dummy text number 1",
                "created_at": "2026-06-01T00:00:00Z",
                "hashtags": [],
                "urls": [],
                "media": [],
                "mentions": [],
                "reply_flag": False
            }
        ] * 100
    }

    payload = {
        "target": "target_user",
        "source": "website",
        "tweet_limit": 100
    }

    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target"] == "target_user"
    assert "score" in data
    assert "risk_band" in data
    assert "explanation" in data
    assert "caveat" in data
    assert "metrics" in data


@patch("api.analyze.scrape_tweets", new_callable=AsyncMock)
def test_analyze_endpoint_insufficient_tweets(mock_scrape):
    # Mock scraper menolak karena jumlah tweet di bawah batas minimal
    mock_scrape.side_effect = ValueError("insufficient_data", 5)

    payload = {
        "target": "target_user",
        "source": "website",
        "tweet_limit": 100
    }

    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["error"] == "insufficient_data"
    assert data["tweet_count"] == 5
    assert "tidak cukup" in data["message"]


@patch("api.analyze.scrape_tweets", new_callable=AsyncMock)
def test_analyze_endpoint_account_not_found(mock_scrape):
    mock_scrape.side_effect = ValueError("account_not_found")

    payload = {
        "target": "non_existent",
        "source": "website"
    }

    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "account_not_found"


@patch("api.analyze.scrape_tweets", new_callable=AsyncMock)
def test_analyze_endpoint_protected(mock_scrape):
    mock_scrape.side_effect = ValueError("protected_account")

    payload = {
        "target": "private_user",
        "source": "website"
    }

    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["error"] == "protected_account"


def test_analyze_endpoint_validation_error():
    # Request tidak valid (missing target)
    payload = {
        "source": "website"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 422
