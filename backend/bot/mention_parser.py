"""
Parser untuk mengekstrak target username dari teks mention bot.
"""

import re


USERNAME_PATTERN = re.compile(r"@([A-Za-z0-9_]+)")


def _clean_username(username: str | None) -> str | None:
    if username is None:
        return None
    username = username.strip().lstrip("@").lower()
    return username or None


def parse_mention(
    text: str,
    bot_username: str,
    requester_username: str | None = None,
) -> str | None:
    """Return first valid target mention, without API calls or side effects."""
    bot = _clean_username(bot_username)
    requester = _clean_username(requester_username)
    mentions = [match.group(1).lower() for match in USERNAME_PATTERN.finditer(text)]

    if not bot or bot not in mentions:
        return None

    for username in mentions:
        if username == bot:
            continue
        if requester and username == requester:
            continue
        return username

    return None
