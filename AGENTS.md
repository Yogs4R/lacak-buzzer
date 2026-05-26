# Project: Lacak Buzzer

## Purpose

Build a lightweight MVP that analyzes an X/Twitter account and returns an Indonesian-language behavioral risk signal:

**Indikator Risiko Amplifikasi Terkoordinasi (0-100)**

This system estimates behavioral patterns related to repetition, activity, interaction, and amplification. It must not claim that an account is fake, paid, malicious, politically motivated, or definitively coordinated.

## Non-Negotiable Product Safety Rules

- Do not say an account **is a buzzer**.
- Do not say an account **is fake**, **paid**, **malicious**, or **proven coordinated**.
- Do not infer ideology, political stance, intent, truthfulness, identity, or real-world affiliation.
- Always frame the result as a behavioral risk indicator.
- Always include this caveat in user-facing output:

```text
Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.
```

Preferred Indonesian label:

```text
Indikator Risiko Amplifikasi Terkoordinasi
```

## MVP Surfaces

The MVP has three parts:

1. Website
2. X bot
3. Backend

The website and X bot must use the same backend, same scoring formula, same local embedding model, and same OpenRouter explanation flow.

Do not implement separate scoring logic for the website and bot.

## Runtime Shape

Use one repository with two runtime processes:

1. FastAPI process
   - Serves backend API.
   - Serves the simple website.
   - Runs scraping, feature extraction, scoring, and explanation generation.

2. X bot process
   - Watches for valid mentions.
   - Calls the FastAPI backend.
   - Posts Indonesian replies to X.

Keep the architecture lightweight enough for a 2GB RAM VM.

## Tech Stack

- Python
- FastAPI
- Simple server-rendered or static frontend served by FastAPI
- `twscrape` for X/Twitter scraping
- `sentence-transformers/all-MiniLM-L6-v2` for local semantic similarity
- OpenRouter-hosted LLM for Indonesian explanation
- Local JSON files only for rate-limit metadata

Do not add a database for MVP.

## Project Structure

```text
lacak-buzzer/
├── .github/
│   ├── changelog-config.json
│   └── workflows/
│       └── auto-release.yml
├── frontend/
│   ├── public/
│   │   └── _headers
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── wrangler.toml
├── backend/
│   ├── api/
│   │   └── analyze.py
│   ├── services/
│   │   ├── scraper.py
│   │   ├── feature_extraction.py
│   │   ├── scoring.py
│   │   ├── explanation.py
│   │   └── rate_limits.py
│   ├── bot/
│   │   ├── x_bot.py
│   │   └── mention_parser.py
│   ├── schemas/
│   │   └── analysis.py
│   ├── tests/
│   │   ├── test_scoring.py
│   │   ├── test_confidence.py
│   │   ├── test_rate_limits.py
│   │   └── test_bot_mentions.py
│   ├── data/
│   │   └── .gitkeep
│   ├── main.py
│   └── requirements.txt
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
├── Procfile
└── railway.json
```

## Data Collection

Collect only what is needed for the analysis request.

Profile fields:

- username
- bio
- created_at

Tweet fields:

- text
- created_at
- hashtags
- urls
- media
- mentions
- reply flag

Tweet limits:

- Default: 100 latest tweets
- Allowed range: 50-150 tweets
- Optimize for 100 tweets on the 2GB VM

Low-data behavior:

- Fewer than 10 collected tweets: return insufficient data, no normal score.
- 10-49 collected tweets: return a score with low confidence.
- 50 or more collected tweets: return normal confidence.

## Storage Rules

The system is stateless for analysis data.

Do not store:

- raw tweets
- profile data
- usernames from analysis history
- scores
- explanations
- embeddings
- analysis results
- request history

Allowed exception:

- Local JSON files may store only minimal rate-limit metadata.

Allowed rate-limit metadata:

- current date
- total bot replies today
- requester usage counts
- target usage counts
- processed mention IDs
- website IP usage counters

Do not store tweets, scores, explanations, or profile content in rate-limit files.

Rate-limit JSON files must be ignored by Git.

## Approval Rules For Sensitive Files And Actions

Never touch these without explicit human approval:

- `.env`
- auth files
- session folders
- `auth_info`
- `baileys_auth`
- X/Twitter credentials
- X/Twitter session files
- Supabase production data
- payment status
- WhatsApp broadcast actions

Agents may help set up X login/session files only after explicit human approval.

When asking for approval, use this exact format:

```text
1. What I want to do:
   Explain the action in simple beginner-friendly language.

2. Why I need to do it:
   Explain the reason and what problem it solves.

3. Exact command or action:
   Show the command/file operation/API action.

4. What it can affect:
   Mention files, folders, database, network, secrets, Git, or deployment if relevant.

5. Risk level:
   Use one of: Low / Medium / High.

6. My recommendation:
   Say whether the user should approve it, reject it, or approve only once.

Then ask:
"Do you approve me to do this one time?"
```

Never ask for approval with only raw terminal syntax.

## Website Requirements

The website must:

- accept an X profile URL
- validate and normalize the URL into a target username
- call the shared backend analysis flow
- show loading state
- show clear Indonesian error states
- show the final score
- show risk band
- show confidence level
- show metric breakdown
- show Indonesian explanation
- show the required caveat

Website user-facing text must be Indonesian.

Website rate limit:

- Use basic IP-based rate limiting.
- Store only minimal daily counters in local JSON.
- Do not require login for MVP.
- Do not add a database.

Recommended website limit for MVP:

- 5 successful analyses per IP per day

If the limit is reached, show:

```text
Batas analisis harian tercapai. Coba lagi besok.
```

## X Bot Requirements

The X bot must:

- monitor mentions of the bot account
- publicly reply when the mention includes another username
- analyze the mentioned/tagged target username
- ignore mentions that do not include a target username
- avoid analyzing the requester by accident
- call the same backend used by the website
- post the reply in Indonesian

The bot is allowed to actually post replies to X in MVP.

The bot must not:

- post unsolicited analysis
- broadcast findings proactively
- mass mention users
- reply to a mention more than once
- expose full metric details in public replies
- use accusation language

Public bot reply format:

- risk band
- score or score range
- 2-3 neutral behavioral signals
- required caveat

Example tone:

```text
Indikator Risiko Amplifikasi Terkoordinasi: Tinggi
Skor: 74/100

Sinyal utama:
- Kemiripan pesan cukup tinggi
- Pola penggunaan tagar terlihat padat
- Aktivitas dan interaksi terlihat intens

Catatan: Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.
```

## X Bot Rate Limits

Use local JSON metadata to enforce bot limits.

Limits:

- Maximum 10 public bot replies per day globally.
- Maximum 3 successful analysis requests per requester per day.
- Maximum 1 public analysis per target account per day.
- Do not reply twice to the same mention ID.

If the global limit is reached:

```text
Batas harian bot sudah tercapai. Coba lagi besok.
```

If the requester limit is reached:

```text
Batas permintaan harian kamu sudah tercapai. Coba lagi besok.
```

If the target account was already analyzed today:

```text
Akun ini sudah dianalisis hari ini. Coba lagi besok.
```

## Backend API Requirements

Use FastAPI.

Provide one shared analysis endpoint for website and bot.

Recommended endpoint:

```http
POST /api/analyze
```

Recommended request body:

```json
{
  "target": "username",
  "source": "website",
  "tweet_limit": 100
}
```

`source` values:

- `website`
- `x_bot`

Recommended success response:

```json
{
  "target": "username",
  "score": 74,
  "risk_band": "Tinggi",
  "confidence": "normal",
  "tweet_count": 100,
  "metrics": {
    "semantic_similarity": 82,
    "hashtag_density": 70,
    "activity_intensity": 65,
    "media_url_ratio": 45,
    "interaction_behavior": 80,
    "profile_risk": 70,
    "posting_interval_regularity": 50
  },
  "signals": [
    "Kemiripan pesan cukup tinggi",
    "Pola penggunaan tagar terlihat padat",
    "Aktivitas dan interaksi terlihat intens"
  ],
  "explanation": "Penjelasan ringkas dalam Bahasa Indonesia.",
  "caveat": "Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu."
}
```

Recommended insufficient-data response:

```json
{
  "error": "insufficient_data",
  "message": "Data tweet tidak cukup untuk menghasilkan skor yang bertanggung jawab.",
  "tweet_count": 12
}
```

## Feature Extraction

Implement these features:

### 1. Semantic Similarity

Model:

```text
sentence-transformers/all-MiniLM-L6-v2
```

Output:

```text
semantic_similarity in [0, 1]
```

Process embeddings in batches. Keep memory usage low. Do not store embeddings after scoring.

### 2. Hashtag Density

```python
avg_hashtags_per_post = total_hashtags / total_posts
```

### 3. Activity Intensity

```python
posts_per_day = total_posts / active_days
```

### 4. Media And URL Ratio

```python
url_ratio = posts_with_url / total_posts
photo_ratio = posts_with_media / total_posts
```

### 5. Interaction Behavior

```python
mention_ratio = posts_with_mentions / total_posts
reply_ratio = replies / total_posts
```

### 6. Account Authenticity

```python
account_age_days = now - created_at
bio_is_empty = len(bio.strip()) == 0
```

### 7. Posting Entropy

Measure randomness of time gaps between posts.

Low entropy means more regular/scheduled behavior.

Normalize `posting_entropy` to `[0, 1]` before scoring.

## Fixed Scoring Formula

The scoring formula is fixed for MVP v1.

Agents must implement these weights and reducers exactly.

Agents must not:

- invent a new formula
- tune weights
- change thresholds
- add new scoring categories
- remove anti-false-positive logic

Any scoring change requires explicit human approval.

Normalization:

Raw metrics are scoring input. Normalized metrics are internal/display scoring components.

Normalization thresholds are fixed MVP heuristics from this document. They are not scientific proof that an account is coordinated, fake, paid, malicious, or intentional.

```python
similarity = semantic_similarity * 100
hashtags = min(avg_hashtags_per_post / 4 * 100, 100)
activity = min(posts_per_day / 80 * 100, 100)

media_url = (url_ratio * 60) + (photo_ratio * 40)
interaction = (mention_ratio * 50) + (reply_ratio * 50)

profile = 0
if account_age_days < 90:
    profile += 70
if bio_is_empty:
    profile += 30

interval = (1 - posting_entropy) * 100
```

Use float normalized components for score calculation. Round only the final score and displayed metric breakdown.

Final score:

```python
final_score = (
    similarity * 0.30 +
    hashtags * 0.20 +
    activity * 0.15 +
    media_url * 0.10 +
    interaction * 0.10 +
    profile * 0.10 +
    interval * 0.05
)
```

Clamp:

```python
final_score = min(final_score, 100)
```

Clamp raw ratio-like values to `[0.0, 1.0]` before scoring:

- `semantic_similarity`
- `url_ratio`
- `photo_ratio`
- `mention_ratio`
- `reply_ratio`
- `posting_entropy`

Clamp normalized display metric values to `[0, 100]`.

For MVP v1, do not raise validation errors for impossible raw metric inputs. Clamp them instead.

Anti-false-positive logic:

```python
diversity_score = 1 - semantic_similarity

if diversity_score > 0.6:
    final_score *= 0.7

if posts_per_day < 5:
    final_score *= 0.8

if reply_ratio < 0.3 and mention_ratio < 0.3:
    final_score *= 0.85
```

After reducers, clamp score to `[0, 100]` and round consistently.

## Risk Bands

Use these labels in Indonesian:

- `0-35`: `Rendah`
- `36-65`: `Sedang`
- `66-85`: `Tinggi`
- `86-100`: `Ekstrem`

Do not use these bands as accusations.

## Confidence Labels

Use these labels:

- fewer than 10 tweets: insufficient data, no normal score
- 10-49 tweets: `rendah`
- 50 or more tweets: `normal`

Low confidence output must clearly state:

```text
Kepercayaan hasil rendah karena jumlah tweet yang tersedia terbatas.
```

## OpenRouter Explanation Rules

Use OpenRouter only for explanation text.

Do not use OpenRouter for scoring.

Never send raw tweets to OpenRouter.

Allowed OpenRouter input:

- score
- risk band
- confidence
- tweet count
- normalized metrics
- 2-3 generated signal labels

Forbidden OpenRouter input:

- raw tweet text
- full profile bio
- username history
- stored analysis history
- private credentials
- auth/session data

If OpenRouter fails, use a deterministic Indonesian template fallback.

Fallback example:

```text
Hasil menunjukkan risiko {risk_band} dengan skor {score}/100. Sinyal utama yang terlihat adalah {signal_1}, {signal_2}, dan {signal_3}. Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.
```

## Error Handling

Use Indonesian user-facing messages.

Handle at least:

- invalid profile URL
- missing target username
- protected/private account
- account not found
- scraper rate limit
- scraper login/session problem
- OpenRouter failure
- insufficient tweets
- website IP limit reached
- bot global limit reached
- bot requester limit reached
- bot target limit reached

Do not expose secrets, stack traces, raw exception objects, or auth paths in user-facing errors.

## Testing Requirements

Agents must add tests for:

- exact scoring formula and weights
- score clamping
- anti-false-positive reducers
- risk band mapping
- confidence labels
- insufficient data below 10 tweets
- low confidence from 10-49 tweets
- website URL parsing
- website IP rate limit
- bot mention parsing
- bot ignores mentions without a target username
- bot does not analyze requester by accident
- bot global 10 replies/day limit
- bot requester 3 analyses/day limit
- bot target 1 analysis/day limit
- duplicate mention prevention
- OpenRouter receives metrics only, not raw tweets
- OpenRouter failure uses template fallback
- Indonesian caveat appears in website and bot output
- public bot replies avoid accusation language

## Performance Rules

- Default to 100 tweets.
- Avoid parallel scraping/embedding in MVP unless proven necessary.
- Batch embeddings.
- Do not keep unnecessary embeddings in memory.
- Do not store analysis results.
- Keep dependencies minimal.
- Keep the system viable on a 2GB RAM VM.

## Future Work Not In MVP

Do not implement these unless explicitly requested:

- database
- analysis history
- user accounts/login
- dashboard analytics
- network/cluster detection
- caching layer
- Qwen/API embeddings
- multi-bot broadcasting
- proactive public posting
- payment system

## Definition Of Done

The MVP is done when:

- website accepts an X profile URL and returns an Indonesian result
- X bot replies publicly in Indonesian when mentioned with another username
- both use the same backend analysis flow
- local MiniLM semantic similarity works
- OpenRouter explanation uses summary metrics only
- deterministic fallback explanation works
- fixed scoring formula is implemented exactly
- no database is required
- no analysis data is stored
- local JSON stores only rate-limit metadata
- all required tests pass
- no user-facing output makes accusations or claims proof
