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
