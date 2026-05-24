"""
Implementasi formula penilaian risiko tetap (fixed scoring formula).
"""

def get_confidence(tweet_count: int):
    """Menentukan label confidence berdasarkan jumlah tweet terkumpul."""
    if tweet_count < 10:
        return "insufficient_data"
    if tweet_count < 50:
        return "rendah"
    return "normal"


def calculate_score(metrics):
    """Menghitung skor berdasarkan pembobotan dan reduksi."""
    pass
