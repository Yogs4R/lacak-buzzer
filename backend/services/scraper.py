"""
Service untuk mengambil data profil dan tweet menggunakan twscrape.
Dilengkapi dengan fast-fail timeout dan fallback scraping tweets.
"""

import os
import asyncio
from twscrape import API, gather

async def _fetch_tweets_with_fallback(api: API, user_id: int, limit: int):
    """
    Mencoba mengambil tweets dan replies akun.
    Jika endpoint user_tweets_and_replies mengalami kendala API X,
    otomatis fallback ke user_tweets standar.
    """
    try:
        raw_tweets = await gather(api.user_tweets_and_replies(user_id, limit=limit))
        if raw_tweets:
            return raw_tweets
    except Exception as e:
        print(f"Peringatan: Gagal mengambil user_tweets_and_replies ({e}), mencoba fallback ke user_tweets biasa...")

    # Fallback ke user_tweets standar
    return await gather(api.user_tweets(user_id, limit=limit))

async def scrape_tweets(username: str, limit: int = 100, timeout: int = 40):
    tws_data_dir = os.getenv("TWS_DATA_DIR", "")
    db_path = os.path.join(tws_data_dir, "accounts.db") if tws_data_dir else "accounts.db"
    api = API(db_path)
    
    async def _do_scrape():
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
        
        # Ambil data tweet dengan mekanisme fallback
        raw_tweets = await _fetch_tweets_with_fallback(api, user_info.id, limit=limit)
        raw_tweets = raw_tweets[:limit]
        
        if len(raw_tweets) < 10:
            raise ValueError("insufficient_data", len(raw_tweets))
            
        tweets_data = []
        for t in raw_tweets:
            tweets_data.append({
                "id": getattr(t, 'id', None) or getattr(t, 'id_str', None),
                "url": getattr(t, 'url', f"https://x.com/{user_info.username}/status/{getattr(t, 'id', '')}"),
                "text": t.rawContent,
                "created_at": str(t.date),
                "hashtags": [h for h in getattr(t, 'hashtags', [])] if hasattr(t, 'hashtags') else [],
                "urls": [u.url for u in getattr(t, 'links', [])] if hasattr(t, 'links') else [],
                "media": ["present"] if hasattr(t, 'media') and t.media and (getattr(t.media, 'photos', []) or getattr(t.media, 'videos', []) or getattr(t.media, 'animated', [])) else [],
                "mentions": [m.username for m in getattr(t, 'mentionedUsers', [])] if hasattr(t, 'mentionedUsers') else [],
                "reply_flag": getattr(t, 'inReplyToTweetId', None) is not None
            })
            
        return {"profile": profile_data, "tweets": tweets_data}

    # Fast-fail timeout: mencegah sistem stuck/sleep 15 menit jika akun twscrape kehabisan kuota antrean
    return await asyncio.wait_for(_do_scrape(), timeout=timeout)
