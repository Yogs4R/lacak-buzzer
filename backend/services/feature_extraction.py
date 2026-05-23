"""
Logika ekstraksi fitur (kepadatan hashtag, kemiripan semantik, intensitas aktivitas).
"""

from sentence_transformers import SentenceTransformer
import numpy as np
from datetime import datetime, timezone
import math

# Load model globally at module level as requested (only once)
# Using cpu to keep memory low on 2GB VM
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cpu')

def extract_features(profile_data, tweets):
    """Mengekstraksi fitur dari data raw ke bentuk metrics."""
    if not tweets:
        return {}

    total_posts = len(tweets)
    
    # Parse dates
    tweet_dates = []
    for t in tweets:
        try:
            if isinstance(t['created_at'], str):
                dt = datetime.fromisoformat(t['created_at'].replace('Z', '+00:00'))
            else:
                dt = t['created_at']
            
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            tweet_dates.append(dt)
        except Exception:
            pass
            
    # Semantic Similarity
    texts = [t["text"] for t in tweets if t.get("text", "").strip()]
    avg_similarity = 0.0
    if len(texts) > 1:
        # Batching embeddings
        embeddings = model.encode(texts, batch_size=32, convert_to_tensor=False)
        
        if len(texts) <= 150:
            norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
            norms[norms == 0] = 1
            embeddings_norm = embeddings / norms
            
            sim_matrix = np.dot(embeddings_norm, embeddings_norm.T)
            
            idx = np.triu_indices(len(texts), k=1)
            similarities = sim_matrix[idx]
            if len(similarities) > 0:
                avg_similarity = float(np.mean(similarities))
                avg_similarity = max(0.0, min(1.0, avg_similarity)) # clamp
                
    # Hashtag Density
    total_hashtags = sum(len(t.get("hashtags", [])) for t in tweets)
    avg_hashtags_per_post = total_hashtags / total_posts
    
    # Activity Intensity
    if len(tweet_dates) > 1:
        max_date = max(tweet_dates)
        min_date = min(tweet_dates)
        active_days = (max_date - min_date).total_seconds() / 86400
    else:
        active_days = 0
    active_days = max(1.0, active_days) # prevent div by zero
    posts_per_day = total_posts / active_days
    
    # Media And URL Ratio
    posts_with_url = sum(1 for t in tweets if len(t.get("urls", [])) > 0)
    posts_with_media = sum(1 for t in tweets if len(t.get("media", [])) > 0)
    url_ratio = posts_with_url / total_posts
    photo_ratio = posts_with_media / total_posts
    
    # Interaction Behavior
    posts_with_mentions = sum(1 for t in tweets if len(t.get("mentions", [])) > 0)
    replies = sum(1 for t in tweets if t.get("reply_flag", False))
    mention_ratio = posts_with_mentions / total_posts
    reply_ratio = replies / total_posts
    
    # Account Authenticity
    now = datetime.now(timezone.utc)
    try:
        if isinstance(profile_data['created_at'], str):
            created_at = datetime.fromisoformat(profile_data['created_at'].replace('Z', '+00:00'))
        else:
            created_at = profile_data['created_at']
            
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
            
        account_age_days = (now - created_at).total_seconds() / 86400
    except Exception:
        account_age_days = 365.0 # fallback
        
    bio_is_empty = len(profile_data.get("bio", "").strip()) == 0
    
    # Posting Entropy
    posting_entropy = 0.0
    if len(tweet_dates) > 1:
        sorted_dates = sorted(tweet_dates)
        gaps = [(sorted_dates[i] - sorted_dates[i-1]).total_seconds() for i in range(1, len(sorted_dates))]
        if sum(gaps) > 0:
            bins = [0, 3600, 7200, 10800, 14400, 18000, 21600, 43200, 86400, float('inf')]
            hist, _ = np.histogram(gaps, bins=bins)
            probs = hist / len(gaps)
            probs = probs[probs > 0]
            entropy = -np.sum(probs * np.log2(probs))
            max_entropy = np.log2(len(bins) - 1)
            if max_entropy > 0:
                posting_entropy = entropy / max_entropy
            posting_entropy = max(0.0, min(1.0, float(posting_entropy)))

    return {
        "semantic_similarity": avg_similarity,
        "avg_hashtags_per_post": float(avg_hashtags_per_post),
        "posts_per_day": float(posts_per_day),
        "url_ratio": float(url_ratio),
        "photo_ratio": float(photo_ratio),
        "mention_ratio": float(mention_ratio),
        "reply_ratio": float(reply_ratio),
        "account_age_days": float(account_age_days),
        "bio_is_empty": bool(bio_is_empty),
        "posting_entropy": float(posting_entropy)
    }
