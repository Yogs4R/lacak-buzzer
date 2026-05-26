"""
Unit test untuk kontrak formula scoring.
"""

from services.scoring import (
    analyze_scoring,
    calculate_score,
    get_risk_band,
    normalize_metrics,
)


def test_risk_band_boundaries():
    expected = {
        0: "Rendah",
        35: "Rendah",
        36: "Sedang",
        65: "Sedang",
        66: "Tinggi",
        85: "Tinggi",
        86: "Ekstrem",
        100: "Ekstrem",
    }

    for score, label in expected.items():
        assert get_risk_band(score) == label


def test_normalize_metrics_uses_fixed_contract():
    metrics = {
        "semantic_similarity": 0.82,
        "avg_hashtags_per_post": 2,
        "posts_per_day": 40,
        "url_ratio": 0.5,
        "photo_ratio": 0.25,
        "mention_ratio": 0.4,
        "reply_ratio": 0.2,
        "account_age_days": 30,
        "bio_is_empty": True,
        "posting_entropy": 0.25,
    }

    assert normalize_metrics(metrics) == {
        "semantic_similarity": 82,
        "hashtag_density": 50,
        "activity_intensity": 50,
        "media_url_ratio": 40,
        "interaction_behavior": 30,
        "profile_risk": 100,
        "posting_interval_regularity": 75,
    }


def test_calculate_score_uses_exact_formula_weights_without_reducers():
    metrics = {
        "semantic_similarity": 0.8,
        "avg_hashtags_per_post": 2,
        "posts_per_day": 40,
        "url_ratio": 0.5,
        "photo_ratio": 0.25,
        "mention_ratio": 0.4,
        "reply_ratio": 0.4,
        "account_age_days": 365,
        "bio_is_empty": False,
        "posting_entropy": 0.25,
    }

    assert calculate_score(metrics) == 53


def test_calculate_score_clamps_to_100():
    metrics = {
        "semantic_similarity": 2,
        "avg_hashtags_per_post": 99,
        "posts_per_day": 999,
        "url_ratio": 2,
        "photo_ratio": 2,
        "mention_ratio": 2,
        "reply_ratio": 2,
        "account_age_days": 1,
        "bio_is_empty": True,
        "posting_entropy": -1,
    }

    assert calculate_score(metrics) == 100


def test_calculate_score_applies_anti_false_positive_reducers():
    metrics = {
        "semantic_similarity": 0.3,
        "avg_hashtags_per_post": 4,
        "posts_per_day": 4,
        "url_ratio": 1,
        "photo_ratio": 1,
        "mention_ratio": 0.2,
        "reply_ratio": 0.2,
        "account_age_days": 1,
        "bio_is_empty": True,
        "posting_entropy": 0,
    }

    assert calculate_score(metrics) == 27


def test_raw_ratio_like_metrics_are_clamped_before_scoring():
    metrics = {
        "semantic_similarity": -0.5,
        "avg_hashtags_per_post": 0,
        "posts_per_day": 10,
        "url_ratio": 2,
        "photo_ratio": -1,
        "mention_ratio": 2,
        "reply_ratio": -1,
        "account_age_days": 365,
        "bio_is_empty": False,
        "posting_entropy": 2,
    }

    assert normalize_metrics(metrics) == {
        "semantic_similarity": 0,
        "hashtag_density": 0,
        "activity_intensity": 13,
        "media_url_ratio": 60,
        "interaction_behavior": 50,
        "profile_risk": 0,
        "posting_interval_regularity": 0,
    }


def test_scoring_accepts_feature_extraction_metric_shape():
    metrics = {
        "semantic_similarity": 0.82,
        "avg_hashtags_per_post": 2.0,
        "posts_per_day": 40.0,
        "url_ratio": 0.5,
        "photo_ratio": 0.25,
        "mention_ratio": 0.4,
        "reply_ratio": 0.4,
        "account_age_days": 365.0,
        "bio_is_empty": False,
        "posting_entropy": 0.25,
    }

    assert calculate_score(metrics) == 54
    assert normalize_metrics(metrics)["semantic_similarity"] == 82


def test_analyze_scoring_returns_insufficient_data_without_score():
    result = analyze_scoring({}, tweet_count=9)

    assert result == {
        "error": "insufficient_data",
        "message": "Data tweet tidak cukup untuk menghasilkan skor yang bertanggung jawab.",
        "tweet_count": 9,
    }


def test_analyze_scoring_output_shape_for_scored_result():
    result = analyze_scoring(
        {
            "semantic_similarity": 0.8,
            "avg_hashtags_per_post": 2,
            "posts_per_day": 40,
            "url_ratio": 0.5,
            "photo_ratio": 0.25,
            "mention_ratio": 0.4,
            "reply_ratio": 0.4,
            "account_age_days": 365,
            "bio_is_empty": False,
            "posting_entropy": 0.25,
        },
        tweet_count=50,
    )

    assert result == {
        "score": 53,
        "risk_band": "Sedang",
        "confidence": "normal",
        "tweet_count": 50,
        "metrics": {
            "semantic_similarity": 80,
            "hashtag_density": 50,
            "activity_intensity": 50,
            "media_url_ratio": 40,
            "interaction_behavior": 40,
            "profile_risk": 0,
            "posting_interval_regularity": 75,
        },
    }
