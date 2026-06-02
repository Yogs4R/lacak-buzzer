# Lacak Buzzer — Design Research

## Method: ATM (Amati, Tiru, Modifikasi)

This document records the visual research process used to produce DESIGN.md.
It covers reference sites observed, patterns adopted, patterns modified, and
decisions rejected. It also defines all page states and establishes the
copywriting rules that govern user-facing text.

---

## 1. Reference Sites Observed

### 1A. VirusTotal (virustotal.com)
**Category:** Security intelligence tool — scans files and URLs for threats.

**Observed:**
- Dark background with high-contrast result panels
- Risk score displayed prominently as a large number
- Breakdown of individual detection engines in a grid
- Neutral, clinical language — never says "this file is malware," says "X/72 engines flagged"
- Always shows a caveat that results are indicative, not definitive

**Adopted:**
- Neutral framing of scores ("indikator," not "terbukti")
- Prominent score display with breakdown below
- Clinical, non-accusatory copy tone

**Modified:**
- VirusTotal uses green/red binary coloring — we use a 4-band gradient (Rendah/Sedang/Tinggi/Ekstrem) to avoid implying binary guilt
- VirusTotal targets technical users — we target journalists and researchers, so copy must be simpler

---

### 1B. Maltego (maltego.com)
**Category:** Open-source intelligence (OSINT) visualization platform.

**Observed:**
- Dark canvas as default — positions the product as a serious intelligence tool
- Eyebrow labels above section headlines (e.g., "TRANSFORM HUB")
- Stat rows with large numbers to build credibility
- No bright primary colors — uses orange/amber as the only accent

**Adopted:**
- Dark canvas `#0a0a0a` as the base
- Eyebrow label pattern above all headlines
- Orange as the single accent color (matches Lacak Buzzer brand)
- Stat rows for social proof on the landing page

**Modified:**
- Maltego is dense and complex — we simplify to a single input card on the home page
- Maltego has no caveat system — we add a mandatory caveat block per AGENTS.md requirements

---

### 1C. NewsGuard (newsguardtech.com)
**Category:** Media credibility rating tool.

**Observed:**
- Uses a scoring system (0–100) for news sources
- Always frames scores as indicators, not verdicts
- Includes detailed methodology page explaining how scores are calculated
- Caveat text appears near every score

**Adopted:**
- 0–100 scoring range
- Caveat text near every result
- Methodology transparency (reflected in About page "Metodologi Terbuka" pillar)

**Modified:**
- NewsGuard uses a red/green binary badge — we use 4 risk bands with neutral Indonesian labels
- NewsGuard scores publications — we score behavioral patterns of individual accounts

---

### 1D. Linear (linear.app) — UI pattern reference only
**Category:** Project management SaaS — not a competitor, referenced for UI quality.

**Observed:**
- Dark surface cards with subtle `1px` borders
- Monospace font for technical/data inputs
- Tight letter-spacing on eyebrow labels
- Minimal use of color — gradient reserved for primary CTA only

**Adopted:**
- Card style: `background: #141414`, `border: 1px solid #2a2a2a`
- Monospace font (`JetBrains Mono`) for the analysis input field
- Gradient limited to: CTA button, active tab indicator
- Eyebrow style: 13px/600, `#8a8a8a`, letter-spacing 2px, uppercase

**Modified:**
- Linear uses purple as accent — we use orange/red gradient per brand identity
- Linear has no safety/caveat requirements — we add mandatory safety blocks

---

## 2. Patterns Rejected

| Pattern | Source | Reason Rejected |
|---------|---------|-----------------|
| Red/green binary risk color | VirusTotal, NewsGuard | Implies binary guilt/innocence — not appropriate for a behavioral indicator |
| "Detected as" language | VirusTotal | Too accusatory — violates AGENTS.md safety rules |
| Score badge only (no caveat) | Most analytics tools | AGENTS.md requires caveat on every result view |
| Emoji in UI copy | Common in Indonesian SaaS | Undermines credibility for a serious intelligence tool |
| Pill-shaped buttons | Many SaaS products | Off-brand — 6px radius kept for technical/data product feel |
| Light/white background option | General web convention | Dark canvas is mandatory per design identity |

---

## 3. Page States

The website has 4 distinct states. Each state has a defined layout and copy.

---

### State 1 — Home (Input)
**Trigger:** User lands on the site or navigates to `/`

**Purpose:** Accept an X profile URL or username for analysis.

**Must show:**
- Navbar with active "Home" link
- Hero section with headline and analysis card
- Input field (Username / URL Tweet / Bulk tabs)
- Submit button
- Stat row (social proof)

**Must NOT show:**
- Any result data
- Score or risk band
- Caveat block (caveat only appears on result and About pages)

**Error inline (before submit):**
- Empty submit: `Masukkan username atau URL terlebih dahulu.`
- Invalid URL format: `Format URL tidak valid. Gunakan: https://x.com/username`

---

### State 2 — Loading
**Trigger:** User submits a valid username/URL, request is in progress.

**Purpose:** Prevent repeated submission, communicate that analysis is running.

**Must show:**
- Navbar
- Loading indicator (spinner or skeleton)
- Progress text in Indonesian, e.g.:
  - `Mengambil data publik akun...`
  - `Menganalisis pola perilaku...`
  - `Menghitung indikator risiko...`
- Submit button in disabled state

**Must NOT show:**
- Partial scores or partial results
- Any accusation language

---

### State 3 — Result
**Trigger:** Backend returns a successful analysis response.

**Purpose:** Display the full behavioral risk indicator with all components.

**Must show (in order):**
1. Target username
2. Score (0–100) — large, gradient color
3. Risk band label — Rendah / Sedang / Tinggi / Ekstrem
4. Confidence label — `normal` or `rendah`
5. If confidence is `rendah`:
   `Kepercayaan hasil rendah karena jumlah tweet yang tersedia terbatas.`
6. Metric breakdown — 7 metrics as labeled progress bars
7. Signal labels — 2–3 neutral behavioral signals
8. Indonesian explanation (from OpenRouter or fallback template)
9. **Caveat block — mandatory, always visible, never collapsible:**
   `Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.`
10. "Analisis Lagi" button to return to Home state

**Risk band colors (text only — no background color change):**
- Rendah (0–35): `#22c55e`
- Sedang (36–65): `#eab308`
- Tinggi (66–85): `#f97316`
- Ekstrem (86–100): `#ef4444`

---

### State 4 — Error
**Trigger:** Backend returns an error response, or request fails.

**Purpose:** Communicate the problem clearly in Indonesian without exposing technical details.

**Error messages by type:**

| Error type | User-facing message |
|-----------|---------------------|
| Invalid URL | `Format URL tidak valid. Gunakan: https://x.com/username` |
| Account private | `Akun ini bersifat privat. Analisis tidak dapat dilakukan.` |
| Account not found | `Akun tidak ditemukan. Periksa kembali username yang dimasukkan.` |
| Insufficient data (<20 tweets) | `Data tweet tidak cukup untuk menghasilkan indikator yang bertanggung jawab.` |
| Rate limit reached (IP) | `Batas analisis harian tercapai. Coba lagi besok.` |
| Scraper problem | `Layanan analisis sementara tidak tersedia. Coba beberapa saat lagi.` |
| OpenRouter failure | *(fallback template used — not shown as error to user)* |

**Must show:**
- Clear error message in Indonesian
- "Coba Lagi" button to return to Home state

**Must NOT show:**
- Stack traces
- Raw exception messages
- Auth paths or credentials
- Accusation language

---

## 4. Copywriting Rules

These rules apply to all user-facing text. Derived from AGENTS.md.

### Tone
- Clinical and neutral — like a research tool, not a media outlet
- Indonesian throughout — no English in user-facing copy (technical labels like "Username", "URL Tweet", "Bulk" are feature names, not narrative copy)
- No emoji in UI
- No exclamation marks in result views

### Approved framing
| Concept | Approved | Forbidden |
|---------|----------|-----------|
| What the score is | indikator risiko berbasis pola perilaku | bukti / vonis / terbukti |
| What the product detects | pola amplifikasi terkoordinasi | buzzer / akun palsu / akun berbayar |
| High score meaning | pola perilakunya mirip dengan akun terkoordinasi | terbukti terkoordinasi / adalah buzzer |
| Product name | Indikator Risiko Amplifikasi Terkoordinasi | Buzzer Detector / Fake Account Scanner |

### Caveat — required verbatim on every result view
```
Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.
```

### Confidence label copy
- `normal` confidence: no additional note needed
- `rendah` confidence: append below the score —
  `Kepercayaan hasil rendah karena jumlah tweet yang tersedia terbatas.`
- Insufficient data: do not show a score — show only:
  `Data tweet tidak cukup untuk menghasilkan indikator yang bertanggung jawab.`

---

## 5. Component Inventory

Components required across all pages and states.

| Component | Used on | Notes |
|-----------|---------|-------|
| `Navbar` | All pages | Sticky, blur backdrop, 3 nav links + CTA |
| `AnalysisCard` | Home | Tab bar + input + submit button |
| `StatRow` | Home | 3 stats with gradient numbers |
| `ScoreDisplay` | Result | Large score number + risk band badge |
| `RiskBandBadge` | Result | Color-coded label (text color only) |
| `ConfidenceLabel` | Result | Shows `normal` or `rendah` + note if rendah |
| `MetricBreakdown` | Result | 7 labeled progress bars |
| `SignalList` | Result | 2–3 neutral behavioral signal strings |
| `ExplanationBlock` | Result | Indonesian explanation paragraph |
| `CaveatBlock` | Result, About | Mandatory orange-left-border box — never collapsible |
| `ErrorState` | Error | Message + Coba Lagi button |
| `LoadingState` | Loading | Spinner + rotating progress text |
| `StatCard` | About | Single stat with gradient number |
| `TrustPillar` | About | Tag + title + body copy |
| `FAQAccordion` | FAQ | Click-to-expand question/answer |

---

## 6. Typography Decisions

| Use case | Font | Size | Weight | Color |
|----------|------|------|--------|-------|
| Hero headline | Barlow | 80px (48px mobile) | 700 | `#ffffff` |
| Section headline | Barlow | 40px | 700 | `#ffffff` |
| Eyebrow label | Barlow | 13px | 600 | `#8a8a8a` |
| Body copy | Barlow | 18px | 400 | `#c8c8c8` |
| Small body | Barlow | 14–16px | 400 | `#8a8a8a` |
| Input field | JetBrains Mono | 14px | 400 | `#ffffff` |
| Stat number | Barlow | 28px | 700 | gradient |
| Tag label | Barlow | 11px | 600 | gradient |

**Rationale:**
- Barlow: wide, geometric sans-serif — conveys authority and legibility at large sizes
- JetBrains Mono: signals technical/data input — reinforces that the tool is processing data, not just text
- No font weight above 700 — avoids visual noise on dark backgrounds

---

## 7. Color Decisions

| Token | Value | Rationale |
|-------|-------|-----------|
| `--canvas` | `#0a0a0a` | Near-black — positions product as serious intelligence tool |
| `--surface` | `#141414` | Card backgrounds — subtle lift from canvas without harshness |
| `--border` | `#2a2a2a` | Thin borders — structure without visual weight |
| `--ink` | `#ffffff` | Primary text — full contrast on dark canvas |
| `--body` | `#c8c8c8` | Body copy — slightly softer than ink to create hierarchy |
| `--muted` | `#8a8a8a` | Labels, eyebrows — tertiary hierarchy |
| `--grad-start` | `#e03a1e` | Gradient start — brand red-orange |
| `--grad-end` | `#f97316` | Gradient end — brand orange |

**Gradient usage rule:** Reserved for CTA buttons, active tab indicators, stat numbers, and tag labels only. Never used as a background fill for content areas.
