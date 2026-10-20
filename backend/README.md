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

## Panduan Berkas Kredensial & Basis Data

Seluruh berkas kredensial sensitif diabaikan oleh Git (`.gitignore`). Bagi pengembang atau yang melakukan fork/clone repositori ini, berikut adalah peta berkas, template example, dan tujuan impornya:

| Berkas Asli (Sensitif/Lokal) | Berkas Contoh (.example) | Lokasi / Tujuan Impor | Fungsi & Keterangan |
|:---|:---|:---|:---|
| `backend/secrets/firebase-key.json` | `backend/secrets/firebase-key.json.example` | Disimpan di `backend/secrets/` ATAU di-paste isinya ke env `FIREBASE_CREDENTIALS` | Kunci Service Account Firebase Firestore untuk menyimpan riwayat scan dan leaderboard. Jika tidak diisi, backend otomatis berjalan dalam mode *offline/no-database*. |
| `backend/twitter_accounts.json` | `backend/twitter_accounts.json.example` | Disalin isinya ke env `TWITTER_ACCOUNTS_JSON` di `.env`, Docker, atau Hugging Face Secrets | JSON array berisi kredensial dan cookie sesi Twitter (`auth_token` & `ct0`). Dibaca otomatis oleh `services/init_db.py` saat server startup. |
| `backend/accounts.txt` | `backend/accounts.txt.example` | Digunakan sebagai input baris CLI `twscrape add_accounts` | Format teks baris alternatif (`user:pass:email:email_pass`) jika ingin mendaftarkan akun scraper Twitter secara manual lewat terminal. |
| `accounts.db` | *(Dihasilkan Otomatis)* | Disimpan di direktori kerja atau folder `TWS_DATA_DIR` | Basis data SQLite lokal twscrape yang menyimpan status sesi akun scraper. Dibuat secara otomatis saat startup jika `TWITTER_ACCOUNTS_JSON` terisi, atau lewat CLI `twscrape login_accounts`. |
| `backend/data/rate_limits.json` | *(Dihasilkan Otomatis)* | Direktori `backend/data/` | Cache penyimpanan rolling window rate limit (IP website & mention bot). Dibuat dan diperbarui secara otomatis saat runtime oleh `services/rate_limits.py` (tidak perlu dibuat manual). |

---

## Setup & Inisialisasi Layanan

### 1. Kredensial Firebase Firestore
Aplikasi menginisialisasi koneksi Firestore secara otomatis saat startup (lifespan hook):
- **Opsi Berkas Lokal:** Salin `backend/secrets/firebase-key.json.example` menjadi `backend/secrets/firebase-key.json` lalu isi dengan kunci asli dari Google Cloud Console.
- **Opsi Cloud / Hugging Face:** Masukkan seluruh isi JSON service account ke variabel environment `FIREBASE_CREDENTIALS`.
- Struktur database Firestore yang dihasilkan secara otomatis:
  - Koleksi `scan_history`: menyimpan riwayat pemindaian.
  - Dokumen `metadata/global_stats`: counter pemindaian dan breakdown kategori risiko secara atomik.

### 2. Setup Scraper Twitter Otomatis (`TWITTER_ACCOUNTS_JSON`)
Metode utama yang digunakan oleh sistem backend:
1. Salin `backend/twitter_accounts.json.example` menjadi `backend/twitter_accounts.json` (atau langsung isi variabel `TWITTER_ACCOUNTS_JSON` di file `.env`):
   ```json
   [
     {
       "username": "akun_twitter",
       "password": "password_twitter",
       "email": "email_twitter@mail.com",
       "email_password": "password_email",
       "auth_token": "cookie_auth_token_dari_browser",
       "ct0": "cookie_ct0_dari_browser"
     }
   ]
   ```
2. Saat startup, backend secara otomatis memanggil `init_twitter_db()` untuk membuat/memperbarui basis data `accounts.db` tanpa perlu menjalankan perintah CLI manual.

### 3. Setup Scraper Twitter Manual via CLI (`accounts.txt`)
Jika Anda lebih memilih mendaftarkan akun scraper secara manual lewat terminal CLI `twscrape`:

1. Buat file `backend/accounts.txt` dari template `backend/accounts.txt.example`:
   ```text
   username_1:password_1:email_1@mail.com:email_password_1
   username_2:password_2:email_2@mail.com:email_password_2
   ```

2. Jalankan perintah `twscrape` di terminal (pastikan virtual environment aktif):
   ```bash
   # Masuk ke direktori backend
   cd backend

   # 1. Tambahkan akun dari berkas accounts.txt ke basis data SQLite
   twscrape add_accounts accounts.txt username:password:email:email_password

   # 2. Login seluruh akun (akan melakukan autentikasi ke Twitter dan menyimpan cookie di accounts.db)
   twscrape login_accounts

   # 3. Periksa status seluruh akun yang terdaftar
   twscrape accounts

   # 4. Jika akun terkena challenge/butuh relogin ulang
   twscrape relogin

   # 5. Jika akun terkunci sementara karena rate limit Twitter
   twscrape reset_locks
   ```

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

