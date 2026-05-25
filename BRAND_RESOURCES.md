# Lacak Buzzer — Brand Resources

This document serves as the single source of truth for the product identity, tone of voice, visual design tokens, and critical safety rules for **Lacak Buzzer**. It is designed to ensure alignment across engineering, design, and product teams.

## 1. Product Identity

**Product Focus:**
Lacak Buzzer is a social intelligence analysis tool. It uses artificial intelligence to analyze account behavior patterns on X/Twitter.

**Target Audience:**
Journalists, researchers, and organizations needing to understand coordinated amplification risks with high accuracy.

**Core Philosophy:**
- **Objective:** We analyze behavioral patterns, not intent.
- **Non-accusatory:** We provide risk indicators, not verdicts or definitive proof.
- **Transparent:** Our methodology is open, and we do not use "black box" accusations.

## 2. Tone and Voice

Our communication must always remain:
- **Clinical and Neutral:** Like a serious research tool or intelligence platform, not a media outlet or an activist group.
- **Professional:** Use formal Indonesian in all user-facing copy.
- **Restrained:** No emojis in the UI. No exclamation marks in result views.

## 3. Product Naming and Terminology

**Official Product Label:**
`Indikator Risiko Amplifikasi Terkoordinasi`

### Allowed vs. Forbidden Phrasing

| Concept | Approved Phrasing | Forbidden Phrasing |
| --- | --- | --- |
| What the score is | indikator risiko berbasis pola perilaku | bukti / vonis / terbukti |
| What the product detects | pola amplifikasi terkoordinasi | buzzer / akun palsu / akun berbayar |
| High score meaning | pola perilakunya mirip dengan akun terkoordinasi | terbukti terkoordinasi / adalah buzzer / jaring buzzer |
| Product name | Indikator Risiko Amplifikasi Terkoordinasi | Buzzer Detector / Fake Account Scanner |

## 4. Mandatory Safety Caveat

This caveat **must** appear verbatim on every result view (both website and X bot replies). It must never be hidden or collapsible:

> **Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.**

## 5. Visual Identity & Design Tokens

### Colors
Our color palette reflects a serious intelligence tool. The dark canvas positions the product professionally, while the single gradient provides focused attention.

- **Canvas (Background):** `#0a0a0a` (Near-black)
- **Surface (Cards):** `#141414` (Subtle lift from canvas)
- **Border:** `#2a2a2a` (Structure without weight)
- **Ink (Primary Text):** `#ffffff` (Full contrast)
- **Body Text:** `#c8c8c8` (Slightly softer for hierarchy)
- **Muted (Labels/Eyebrows):** `#8a8a8a`
- **Gradient Start (Brand Red-Orange):** `#e03a1e`
- **Gradient End (Brand Orange):** `#f97316`

*Note: Gradients are reserved strictly for CTA buttons, active tab indicators, stat numbers, and tag labels. Never use them as background fills for content areas.*

### Typography
- **Primary Font:** `Barlow`, sans-serif (Geometric, conveys authority and legibility). Maximum weight used is `700`.
- **Monospace Font:** `JetBrains Mono`, monospace (Used for technical/data inputs like usernames and URLs to reinforce data processing).

### Risk Band Colors
Risk bands only change text color, without background color changes to avoid implying a binary "guilt/innocence":
- **Rendah (0–35):** `#22c55e` (Green)
- **Sedang (36–65):** `#eab308` (Yellow)
- **Tinggi (66–85):** `#f97316` (Orange)
- **Ekstrem (86–100):** `#ef4444` (Red)

## 6. Confidence Labels
- **Normal:** 50 or more tweets (No additional note needed).
- **Rendah (Low):** 20–49 tweets. Must show the note: `Kepercayaan hasil rendah karena jumlah tweet yang tersedia terbatas.`
- **Insufficient Data:** Fewer than 20 tweets. Do not show a score. Show only: `Data tweet tidak cukup untuk menghasilkan indikator yang bertanggung jawab.`

## 7. Logo Guidelines
The logo should always be rendered via CSS and never fixed via HTML attributes to maintain its 36px/48px aspect logic.
- Target size: 48px maximum height.
- Path: `src/assets/lacak-buzzer-logo.webp`.

---
*Created based on AGENTS.md, DESIGN.md, and DESIGN_RESEARCH.md.*
