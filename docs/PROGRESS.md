# Lacak Buzzer — Comprehensive Progress Tracker

Dokumen ini melacak seluruh siklus pengembangan proyek **Lacak Buzzer** dari fase spesifikasi awal hingga siap *deploy*, mengacu pada `AGENTS.md`, `DESIGN.md`, `DESIGN_RESEARCH.md`, dan `BRAND_RESOURCES.md`.

## Ringkasan Proyek
- **Tujuan**: Membangun MVP indikator risiko amplifikasi terkoordinasi (tanpa tuduhan/label *buzzer*).
- **Target**: Journalist & Researcher.
- **Batasan**: Fast-API backend, React+Vite web, X Bot, tanpa *database* (stateless, kecuali limit API di JSON lokal).

---

## Fase 1: Perencanaan & Spesifikasi (Selesai ✅)
- [x] **Dokumen PRD & Aturan Utama** (`AGENTS.md`): Mendefinisikan fitur web & bot, batasan skor, *anti-false-positive reducers*, dan aturan keselamatan.
- [x] **Riset Desain** (`DESIGN_RESEARCH.md`): Keputusan menggunakan metode ATM (Amati, Tiru, Modifikasi) dengan tema UI intelijen gelap (*dark canvas*).
- [x] **Desain Sistem Web** (`DESIGN.md`): Spesifikasi 3 halaman (Home, About, FAQ), routing, layout Flex/Grid, *typography*, dan pewarnaan gradient.
- [x] **Brand & Copywriting** (`BRAND_RESOURCES.md`): Standardisasi frasa (misal: "Indikator Risiko Amplifikasi Terkoordinasi"), *caveat* mutlak, serta panduan warna & tipografi.

---

## Fase 2: Pembangunan Frontend Web (Dalam Proses 🚧)
Sesuai instruksi `DESIGN.md`.

- **Konfigurasi Dasar**
  - [x] Vite + React setup.
  - [x] Tailwind CSS + PostCSS configuration.
  - [x] CSS Variables di `index.css` (`--canvas`, `--surface`, `--grad-start`, dll).
- **Komponen Inti (Reusable)**
  - [x] `Navbar` / `Header.jsx` dengan status link aktif/inaktif.
  - [x] `SearchBar.jsx` dengan Font Monospace (`JetBrains Mono`).
  - [x] `ResultCard.jsx` yang mencakup Score Badge, Metric Breakdown, Signal List, Explanation, dan **Caveat Block**.
  - [ ] State Handling untuk *Loading* (Spinner) & *Error* (Pesan Bahasa Indonesia).
- **Halaman (Routing `react-router-dom`)**
  - [x] `Home.jsx` (Hero Section + Analysis Card).
  - [ ] `About.jsx` (Dua Kolom, 3 Stat Cards, 3 Trust Pillars, dan blok *Caveat* permanen).
  - [ ] `FAQ.jsx` (Sistem Accordion 5 pertanyaan dasar).
  - [ ] Integrasi rute di `App.jsx`.

---

## Fase 3: Pembangunan Backend & Logika Skor (Fundamental Selesai, Belum Teruji Penuh 🚧)
Sesuai instruksi `AGENTS.md`.

- **API & Integrasi Dasar**
  - [x] Setup FastAPI + Uvicorn (`main.py`).
  - [x] Endpoint tunggal: `POST /api/analyze`.
  - [ ] Rate Limiting berbasis IP/Bot JSON di `rate_limits.py`.
- **Scraping & Feature Extraction**
  - [x] Wrapper `twscrape` untuk profil dan *tweets* (`scraper.py`).
  - [x] Batas 100 tweet *default* (Penanganan 0-19 tweet *insufficient*, 20-49 *low confidence*).
  - [x] Modul MiniLM (`sentence-transformers/all-MiniLM-L6-v2`) berjalan lokal untuk mendeteksi *Semantic Similarity*.
  - [x] Pengukuran metrik *Hashtag Density*, *Activity Intensity*, dll.
- **Scoring & Explanation**
  - [ ] Formula penilaian yang sudah di-klaim mutlak (*Fixed MVP Formula*) di `scoring.py`.
  - [ ] *Anti-false positive reducers* diimplementasikan.
  - [ ] Penempatan batas risiko 0-100 (Rendah, Sedang, Tinggi, Ekstrem).
  - [ ] `explanation.py` memanggil OpenRouter LLM dengan *fallback template* Bahasa Indonesia.

---

## Fase 4: Proses X Bot (Dalam Proses 🚧)
Sesuai instruksi `AGENTS.md`.

- [ ] Struktur skeleton bot (`bot/x_bot.py`, `bot/mention_parser.py`).
- [ ] Logika mendeteksi *mentions* dan ekstrak target username secara presisi.
- [ ] Memanggil endpoint `/api/analyze`.
- [ ] Membalas publik di X dengan format respons bot (Skor, 2-3 Sinyal, + Caveat Wajib).
- [ ] Rate limits bot: max 10 balasan publik/hari global, 3 permintaan/user, 1 target/hari.

---

## Fase 5: Testing & QA (Belum Dimulai ❌)
Setiap tes unit ini diwajibkan oleh `AGENTS.md`.

- [ ] Formula skor akurat berdasarkan parameter buatan.
- [ ] Reducers bekerja mencegah false-positives.
- [ ] Test status kepercayaan (0-19, 20-49, >50).
- [ ] Test proteksi *rate-limiting* IP dan Bot.
- [ ] Mencegah Bot X merespons akun *requester* sendiri atau loop tak terbatas.
- [ ] Cek keterbacaan peringatan (Caveat) yang tidak boleh disembunyikan.

---

## Fase 6: Deployment (Tahap Awal ✅🚧)
- [x] `requirements.txt` dan *virtual environment* setup.
- [x] `Procfile` & `railway.json` disiapkan untuk Railway (Backend API).
- [x] Konfigurasi frontend untuk *Cloudflare Pages* disiapkan.
- [ ] *Sanity Check* final di *production environment* dengan memori < 2GB.
