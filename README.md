# Lacak Buzzer

![License](https://img.shields.io/github/license/Yogs4R/lacak-buzzer)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)

## Deskripsi Proyek
**Lacak Buzzer** adalah sistem *Minimum Viable Product* (MVP) ringan yang menganalisis profil dan aktivitas akun X/Twitter untuk memberikan **Indikator Risiko Amplifikasi Terkoordinasi**. Sistem ini memperkirakan pola perilaku seperti repetisi, intensitas aktivitas, dan interaksi tanpa mengklaim akun tersebut palsu, berbayar, atau berafiliasi secara definitif.

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Python, FastAPI
- **Scraping**: `twscrape`
- **Machine Learning**: `sentence-transformers/all-MiniLM-L6-v2` (untuk ekstraksi kemiripan semantik)
- **LLM**: OpenRouter (untuk *natural language explanation*)

## Struktur Proyek
Sistem ini menggunakan satu repositori (monorepo) dengan dua batasan *runtime* utama:
1. **FastAPI Process** - API Backend dan *Feature Extraction* (melayani web dan bot).
2. **X Bot Process** - Memantau *mentions* dan memanggil API FastAPI untuk membalas di X.

```text
lacak-buzzer/
├── .github/
│   ├── changelog-config.json         # Konfigurasi kategori changelog otomatis
│   └── workflows/
│       └── auto-release.yml          # Workflow Github Action untuk rilis versi
├── frontend/                         # Website SPA (React + Vite)
│   ├── public/
│   │   ├── metadata.json             # Meta data aplikasi
│   │   ├── robots.txt                # Aturan indexing mesin pencari
│   │   ├── sitemap.xml               # Peta situs pencarian
│   │   └── _headers                  # Aturan CSP dan header keamanan (Cloudflare)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx            # Komponen catatan/disclaimer footer
│   │   │   ├── Header.jsx            # Komponen navigasi atas
│   │   │   ├── ResultCard.jsx        # Komponen penampil hasil skor risiko
│   │   │   └── SearchBar.jsx         # Komponen pencarian username
│   │   ├── pages/
│   │   │   └── Home.jsx              # Halaman utama Lacak Buzzer
│   │   ├── App.jsx                   # Root komponen UI
│   │   ├── index.css                 # Global CSS (Tailwind directives)
│   │   └── main.jsx                  # Entry point aplikasi React
│   ├── index.html                    # Kerangka HTML utama
│   ├── package.json                  # Dependensi library NPM Node.js
│   ├── postcss.config.js             # Konfigurasi postcss (Tailwind)
│   ├── tailwind.config.js            # Konfigurasi Tailwind CSS
│   ├── vite.config.js                # Konfigurasi Vite bundler
│   └── wrangler.toml                 # Konfigurasi Cloudflare Pages
├── backend/                          # Backend API & Bot (FastAPI)
│   ├── api/
│   │   └── analyze.py                # Endpoint `/analyze` FastAPI
│   ├── bot/
│   │   ├── mention_parser.py         # Ekstraktor username dari teks tweet bot
│   │   └── x_bot.py                  # Proses monitoring dan membalas tweet (Bot X)
│   ├── data/                         # Folder internal data (e.g. rate limit JSON)
│   ├── schemas/
│   │   └── analysis.py               # Schema validasi pydantic (Model Data)
│   ├── services/
│   │   ├── explanation.py            # Generator penjelasan via OpenRouter LLM
│   │   ├── feature_extraction.py     # Logika metrik hashtag, dll (NLP/Math)
│   │   ├── rate_limits.py            # Pengecekan limit akses harian
│   │   ├── scoring.py                # Implementasi formula penilaian baku
│   │   └── scraper.py                # Wrapper twscrape untuk mengambil tweets
│   ├── tests/
│   │   ├── test_bot_mentions.py      # Unit test parser mention bot
│   │   ├── test_confidence.py        # Unit test kalkulasi kepercayaan
│   │   ├── test_rate_limits.py       # Unit test rate limiter
│   │   └── test_scoring.py           # Unit test algoritma scoring & reducers
│   ├── main.py                       # Entry point ASGI FastAPI (Uvicorn)
│   └── requirements.txt              # Daftar pustaka Python backend
├── AGENTS.md                         # Dokumen PRD / Panduan agen AI proyek
├── README.md                         # Dokumentasi pusat repositori (berkas ini)
├── .env.example                      # Template variabel environment rahasia
├── .gitignore                        # Daftar file yang diabaikan Git
├── Procfile                          # Konfigurasi perintah runner production
└── railway.json                      # Konfigurasi Railway build & deploy
```

## Instalasi & Cara Menjalankan

### Panduan Kolaborasi
Bagi anggota kelompok yang baru bergabung, ikuti langkah-langkah berikut:

1. **Clone Repositori**
   ```bash
   git clone https://github.com/Yogs4R/lacak-buzzer.git
   cd lacak-buzzer
   ```

2. **Inisialisasi BMAD**
   ```bash
   npx bmad-method init
   ```

3. **Alur Kerja Git (2 Opsi)**

   **Opsi A: Simple Workflow (Pemula)**
   Gunakan alur ini jika tidak ingin pusing dengan *branching*.
   - Siapkan perubahan: `git add .`
   - Simpan perubahan: `git commit -m "pesan singkat tentang fitur/perbaikan"`
   - Ambil *update* teman: `git pull origin main`
   - Unggah pekerjaan: `git push origin main`

   **Opsi B: Advanced Workflow (Standar Industri)**
   Gunakan alur ini jika sudah terbiasa dengan Git.
   - Ambil *update* terbaru: `git pull origin main`
   - Buat *branch* fitur: `git checkout -b nama-tugas`
   - Simpan perubahan: `git add .` lalu `git commit -m "feat: nama tugas"`
   - Unggah & gabungkan: `git push origin nama-tugas` lalu buat *Pull Request* di GitHub.

### Backend (API)

**Langkah 1: Setup Awal (Cukup dilakukan sekali)**
Buka PowerShell, lalu jalankan perintah berikut untuk membuat *virtual environment* menggunakan Python 3.12 (Jangan lupa download python versi 3.12 di [python.org](https://www.python.org/downloads/)):
```powershell
cd backend
py -3.12 -m venv venv
```
*(Jika perintah `py` tidak dikenali, Anda bisa menggunakan `python -m venv venv` asalkan versi Python Anda adalah 3.12).*

**Langkah 2: Menjalankan Backend (Dilakukan setiap kali ingin menjalankan API)**
Buka PowerShell, lalu jalankan perintah berikut secara berurutan:
```powershell
cd backend
# Aktifkan virtual environment
.\venv\Scripts\Activate.ps1

# Install atau perbarui dependensi
pip install -r requirements.txt

# Jalankan server API
uvicorn main:app --reload
```

**Keluar dari Virtual Environment**
Jika sudah selesai dan ingin menonaktifkan *virtual environment*, ketik perintah berikut di terminal:
```powershell
deactivate
```

### Frontend (Website)
```bash
cd frontend
npm install
npm run dev
```

## Catatan Keamanan
*Skor yang dihasilkan adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.*
