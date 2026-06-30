"""
Service untuk mengambil data profil dan tweet menggunakan twscrape.
"""

import os
from twscrape import API, gather

async def scrape_tweets(username: str, limit: int = 100):
    tws_data_dir = os.getenv("TWS_DATA_DIR", "")
    db_path = os.path.join(tws_data_dir, "accounts.db") if tws_data_dir else "accounts.db"
    api = API(db_path)
    
    # Ambil data profil
    user_info = await api.user_by_login(username)
    if not user_info:
        raise ValueError("account_not_found")
        
    if getattr(user_info, "protected", False):
        raise ValueError("protected_account")
        
    profile_data = {
        "username": user_info.username,
        "bio": user_info.rawDescription,
        "created_at": str(user_info.created)
    }
    
    # Ambil data tweet
    raw_tweets = await gather(api.user_tweets(user_info.id, limit=limit))
    raw_tweets = raw_tweets[:limit]
    
    if len(raw_tweets) < 10:
        raise ValueError("insufficient_data", len(raw_tweets))
        
    tweets_data = []
    for t in raw_tweets:
        tweets_data.append({
            "id": getattr(t, 'id', None) or t.id_str, # twscrape usually has t.id
            "url": t.url if hasattr(t, 'url') else f"https://x.com/{user_info.username}/status/{t.id}",
            "text": t.rawContent,
            "created_at": str(t.date),
            "hashtags": [h for h in getattr(t, 'hashtags', [])] if hasattr(t, 'hashtags') else [],
            "urls": [u.url for u in getattr(t, 'links', [])] if hasattr(t, 'links') else [],
            "media": ["present"] if hasattr(t, 'media') and t.media and (getattr(t.media, 'photos', []) or getattr(t.media, 'videos', []) or getattr(t.media, 'animated', [])) else [],
            "mentions": [m.username for m in getattr(t, 'mentionedUsers', [])] if hasattr(t, 'mentionedUsers') else [],
            "reply_flag": getattr(t, 'inReplyToTweetId', None) is not None
        })
        
    return {"profile": profile_data, "tweets": tweets_data}
