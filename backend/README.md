---
title: Lacak Buzzer Backend
emoji: 🕵️
colorFrom: red
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# Lacak Buzzer Backend

FastAPI backend API running inside a Docker container on Hugging Face Spaces.

## Daftar Endpoint API

1. **Analisis Akun**
   - **Endpoint**: `POST /api/analyze`
   - **Deskripsi**: Melakukan scraping, analisis pola perilaku, perhitungan skor risiko, dan penjelasan LLM.
   - **Request Body**:
     ```json
     {
       "target": "username",
       "source": "website",
       "tweet_limit": 100
     }
     ```
   - **Response**: Detail hasil analisis, metrik, sinyal perilaku, penjelasan, dan caveat.

2. **Statistik Global**
   - **Endpoint**: `GET /api/stats`
   - **Deskripsi**: Mengambil data statistik global (total pemindaian dan breakdown kategori risiko) dari Firebase Firestore.

3. **Leaderboard**
   - **Endpoint**: `GET /api/leaderboard`
   - **Deskripsi**: Mengambil data leaderboard global terbagi menjadi 3 kategori:
     - `recent_scans`: 5 akun terakhir yang dianalisis secara global.
     - `safest_accounts`: 5 akun teraman dengan skor terendah.
     - `riskiest_accounts`: 5 akun dengan skor risiko tertinggi.

4. **Detail Riwayat**
   - **Endpoint**: `GET /api/history/{username}`
   - **Deskripsi**: Mengambil data laporan lengkap (`full_report`) milik username terkait dari database secara case-insensitive tanpa memicu scraping ulang (hemat token).

---

## Setup & Inisialisasi Layanan

### 1. Kredensial Firebase Firestore
Aplikasi menginisialisasi koneksi Firestore secara otomatis saat startup (lifespan hook).
- Letakkan berkas kredensial service account di `backend/secrets/firebase-key.json` (diabaikan oleh Git).
- Struktur database Firestore yang dihasilkan secara otomatis:
  - Koleksi `scan_history`: menyimpan riwayat pemindaian.
  - Dokumen `metadata/global_stats`: menyimpan total counter pemindaian dan breakdown kategori secara atomik (`Rendah`, `Sedang`, `Tinggi`, `Ekstrem`).

### 2. Setup Scraper Twitter (`twscrape`)
Scraper membutuhkan basis data lokal `accounts.db` untuk mengelola kredensial dan session Twitter.
- Definisikan kredensial pada variabel environment `TWITTER_ACCOUNTS_JSON` dengan format JSON array:
  ```json
  [
    {
      "username": "akun_twitter",
      "password": "password_twitter",
      "email": "email_twitter@mail.com",
      "email_password": "password_email",
      "auth_token": "token_auth_cookies",
      "ct0": "token_ct0_cookies"
    }
  ]
  ```
- Saat startup, lifespan hook backend akan menginisialisasi basis data `accounts.db` secara otomatis.

---

## Menjalankan Pengujian (Testing)

Untuk memastikan seluruh rute, formula scoring, rate limiting, dan inisialisasi Firebase berjalan dengan benar, jalankan pengujian unit:

```powershell
cd backend
# Aktifkan virtual environment
.\venv\Scripts\Activate.ps1

# Jalankan seluruh test suite
python -m pytest
```

---

## Pemindaian Keamanan & Kontainerisasi

Backend proyek ini telah dilengkapi dengan standar keamanan industri:

| Komponen | Detail |
|:---|:---|
| **Dockerfile** | Image base `python:3.12-slim` untuk mengurangi attack surface. Berjalan sebagai non-root `user` (uid 1000). Direktori `data/` menggunakan izin `chmod 755` (bukan `777`) untuk membatasi akses write hanya pada proses aplikasi. |
| **Trivy Scanner** | Dijalankan otomatis via CI (`advanced-security.yml`) setiap push/PR ke `main`. Mendeteksi CVE `CRITICAL`/`HIGH` pada dependensi OS dan pustaka Python. |
| **Gitleaks** | Memindai seluruh riwayat commit untuk memastikan tidak ada kunci API (Firebase, OpenRouter, Twitter) yang bocor di repositori publik. |
| **Rate Limiting (Thread-safe)** | File JSON rate limit dilindungi `threading.Lock` untuk mencegah race condition pada concurrent requests. Website: maks 5 req/menit/IP. Bot: maks 10 reply global/menit, 5 per requester/menit, 1 per target/menit. |
| **Validasi Input** | Username divalidasi dengan regex `[A-Za-z0-9_]` (maks 50 karakter). `mention_id` bot divalidasi sebagai numerik (maks 25 digit). List mention di-cap 500 entri untuk mencegah pertumbuhan file tak terbatas. |
| **IP & Proxy Hardening** | IP klien dibaca via `X-Forwarded-For` header untuk dukungan reverse proxy (Hugging Face). IP/identifier dihapus dari execution logs sebelum disimpan ke Firestore (privasi). |
| **CORS** | `allow_origins` di-whitelist eksplisit. Method dibatasi `GET`/`POST`, header dibatasi `Content-Type`/`Authorization`. |
| **Bot Exponential Backoff** | Polling loop bot menerapkan backoff berlipat ganda (1× → 2× → 4× → 8×) saat error, reset otomatis setelah berhasil — mencegah ban Twitter akibat polling agresif. |
| **Dependency Pinning** | Semua dependency Python di-pin ke versi spesifik di `requirements.txt`. Dependabot dikonfigurasi untuk PR otomatis setiap Senin. |

