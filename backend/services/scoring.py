"""
Implementasi formula penilaian risiko tetap (fixed scoring formula).
"""


INSUFFICIENT_DATA_MESSAGE = (
    "Data tweet tidak cukup untuk menghasilkan skor yang bertanggung jawab."
)


def _clamp(value: float, minimum: float = 0, maximum: float = 100) -> float:
    return max(minimum, min(value, maximum))


def _clamp_ratio(value: float) -> float:
    return _clamp(value, 0.0, 1.0)


def _round_metric(value: float) -> int:
    return int(_clamp(value) + 0.5)


def get_confidence(tweet_count: int) -> str:
    """Menentukan label confidence berdasarkan jumlah tweet terkumpul."""
    if tweet_count < 10:
        return "insufficient_data"
    if tweet_count < 50:
        return "rendah"
    return "normal"


def get_risk_band(score: int) -> str:
    """Menentukan label risk band tanpa bahasa tuduhan."""
    score = _round_metric(score)
    if score <= 35:
        return "Rendah"
    if score <= 65:
        return "Sedang"
    if score <= 85:
        return "Tinggi"
    return "Ekstrem"


def normalize_metrics(metrics: dict) -> dict:
    """Return display metrics from fixed MVP heuristics in AGENTS.md.

    Thresholds are product heuristics for a behavioral risk indicator, not
    scientific proof that an account is coordinated, fake, or malicious.
    """
    components = _normalized_components(metrics)
    return {key: _round_metric(value) for key, value in components.items()}


def _normalized_components(metrics: dict) -> dict:
    semantic_similarity = _clamp_ratio(metrics.get("semantic_similarity", 0))
    avg_hashtags_per_post = metrics.get("avg_hashtags_per_post", 0)
    posts_per_day = metrics.get("posts_per_day", 0)
    url_ratio = _clamp_ratio(metrics.get("url_ratio", 0))
    photo_ratio = _clamp_ratio(metrics.get("photo_ratio", 0))
    mention_ratio = _clamp_ratio(metrics.get("mention_ratio", 0))
    reply_ratio = _clamp_ratio(metrics.get("reply_ratio", 0))
    account_age_days = metrics.get("account_age_days", 0)
    bio_is_empty = metrics.get("bio_is_empty", False)
    posting_entropy = _clamp_ratio(metrics.get("posting_entropy", 0))

    profile = 0
    if account_age_days < 90:
        profile += 70
    if bio_is_empty:
        profile += 30

    return {
        "semantic_similarity": semantic_similarity * 100,
        "hashtag_density": _clamp(avg_hashtags_per_post / 4 * 100),
        "activity_intensity": _clamp(posts_per_day / 80 * 100),
        "media_url_ratio": _clamp((url_ratio * 60) + (photo_ratio * 40)),
        "interaction_behavior": _clamp((mention_ratio * 50) + (reply_ratio * 50)),
        "profile_risk": _clamp(profile),
        "posting_interval_regularity": _clamp((1 - posting_entropy) * 100),
    }


def calculate_score(metrics: dict) -> int:
    """Menghitung skor berdasarkan pembobotan dan reduksi."""
    normalized = _normalized_components(metrics)
    final_score = (
        normalized["semantic_similarity"] * 0.30
        + normalized["hashtag_density"] * 0.20
        + normalized["activity_intensity"] * 0.15
        + normalized["media_url_ratio"] * 0.10
        + normalized["interaction_behavior"] * 0.10
        + normalized["profile_risk"] * 0.10
        + normalized["posting_interval_regularity"] * 0.05
    )
    final_score = _clamp(final_score)

    semantic_similarity = _clamp_ratio(metrics.get("semantic_similarity", 0))
    posts_per_day = metrics.get("posts_per_day", 0)
    reply_ratio = _clamp_ratio(metrics.get("reply_ratio", 0))
    mention_ratio = _clamp_ratio(metrics.get("mention_ratio", 0))

    diversity_score = 1 - semantic_similarity
    if diversity_score > 0.6:
        final_score *= 0.7

    if posts_per_day < 5:
        final_score *= 0.8

    if reply_ratio < 0.3 and mention_ratio < 0.3:
        final_score *= 0.85

    return _round_metric(final_score)


def analyze_scoring(metrics: dict, tweet_count: int) -> dict:
    """Menghasilkan hasil scoring deterministik tanpa side effect."""
    confidence = get_confidence(tweet_count)
    if confidence == "insufficient_data":
        return {
            "error": "insufficient_data",
            "message": INSUFFICIENT_DATA_MESSAGE,
            "tweet_count": tweet_count,
        }

    score = calculate_score(metrics)
    return {
        "score": score,
        "risk_band": get_risk_band(score),
        "confidence": confidence,
        "tweet_count": tweet_count,
        "metrics": normalize_metrics(metrics),
    }
