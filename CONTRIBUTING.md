# Panduan Kontribusi (Contributing Guide)

Terima kasih atas minat Anda untuk berkontribusi pada **Lacak Buzzer**! 🎉  
Proyek ini bersifat *open-source* dan didedikasikan untuk menyediakan analisis indikator risiko amplifikasi terkoordinasi pada akun X/Twitter secara transparan, objektif, dan bertanggung jawab.

Dokumen ini berisi panduan dan standar untuk mempermudah proses kontribusi Anda.

---

## Daftar Isi
- [Prinsip Etika & Kebijakan Produk](#prinsip-etika--kebijakan-produk)
- [Cara Memulai](#cara-memulai)
- [Alur Kerja Git (Git Workflow)](#alur-kerja-git-git-workflow)
- [Pengembangan Lokal (Local Development)](#pengembangan-lokal-local-development)
  - [Persiapan Backend (FastAPI)](#persiapan-backend-fastapi)
  - [Persiapan Frontend (React + Vite)](#persiapan-frontend-react--vite)
- [Menjalankan Pengujian (Testing)](#menjalankan-pengujian-testing)
- [Standar Keamanan & Sensitive File Guard](#standar-keamanan--sensitive-file-guard)
- [Konvensi Pesan Commit](#konvensi-pesan-commit)
- [Mengajukan Pull Request (PR)](#mengajukan-pull-request-pr)

---

## Prinsip Etika & Kebijakan Produk

Lacak Buzzer dirancang sebagai sistem pendeteksi pola perilaku (*behavioral pattern analysis*), **bukan alat tuduhan personal**. Setiap kontributor wajib mematuhi pedoman copywriting dan logika berikut:

1. **Hindari Bahasa Menuduh:** Jangan pernah menggunakan terminologi seperti *"akun palsu terbukti"*, *"buzzer bayaran"*, *"akun jahat"*, atau *"pasti bot"* pada keluaran antarmuka (UI), deskripsi API, maupun balasan Bot.
2. **Pertahankan Sifat Indikator:** Semua skor adalah *Indikator Risiko Amplifikasi Terkoordinasi* berbasis probabilitas dan statistik.
3. **Sertakan Disclaimer:** Setiap fitur baru yang menampilkan skor atau kesimpulan analisis wajib menyertakan catatan penjelas bahwa hasil analisis adalah estimasi algoritma.

---

## Cara Memulai

1. Periksa daftar [Issues](https://github.com/Yogs4R/lacak-buzzer/issues) yang sedang terbuka untuk melihat bug atau fitur yang membutuhkan bantuan.
2. Jika Anda ingin menambahkan fitur baru atau mengajukan perubahan besar, silakan buka *Issue* terlebih dahulu untuk mendiskusikan pendekatan yang akan diambil.
3. *Fork* repositori ini ke akun GitHub Anda, lalu *clone* ke mesin lokal:
   ```bash
   git clone https://github.com/<username-anda>/lacak-buzzer.git
   cd lacak-buzzer
   ```

---

## Alur Kerja Git (Git Workflow)

Kami menggunakan pola percabangan berbasis fitur (*feature branch workflow*):

1. Pastikan branch `main` Anda selalu sinkron dengan repositori utama (*upstream*):
   ```bash
   git remote add upstream https://github.com/Yogs4R/lacak-buzzer.git
   git checkout main
   git pull upstream main
   ```
2. Buat branch baru dengan nama yang deskriptif:
   ```bash
   # Format: feat/nama-fitur atau fix/nama-perbaikan
   git checkout -b feat/tambah-indikator-retweet
   ```
3. Lakukan commit perubahan secara berkala dengan pesan yang jelas.

---

## Pengembangan Lokal (Local Development)

### Persiapan Backend (FastAPI)

Kebutuhan sistem: **Python 3.10+** (disarankan Python 3.12).

1. Masuk ke direktori `backend/`:
   ```bash
   cd backend
   ```
2. Buat dan aktifkan *virtual environment*:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Pasang dependensi:
   ```bash
   pip install -r requirements.txt
   ```
4. Salin template variabel lingkungan:
   ```bash
   cp ../.env.example .env
   ```
   *(Konfigurasi kredensial uji coba lokal Anda di file `.env` ini).*
5. Jalankan server backend:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   API dokumentasi Swagger akan tersedia di `http://localhost:8000/docs`.

### Persiapan Frontend (React + Vite)

Kebutuhan sistem: **Node.js 20+** dan **npm**.

1. Buka terminal baru dan masuk ke direktori `frontend/`:
   ```bash
   cd frontend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembang:
   ```bash
   npm run dev
   ```
   Aplikasi web akan berjalan secara lokal di `http://localhost:5173`.

> [!NOTE]
> Proyek ini menggunakan **Tailwind CSS v3** (`^3.4.17`) untuk menjaga stabilitas tata letak antarmuka. Jangan meng-upgrade Tailwind ke v4 tanpa persetujuan tim desain dan pengujian menyeluruh pada seluruh komponen UI.

---

## Menjalankan Pengujian (Testing)

Sebelum membuat Pull Request, pastikan seluruh tes dan build berjalan sukses tanpa kesalahan:

### 1. Backend Tests
Jalankan test suite menggunakan `pytest`:
```bash
cd backend
python -m pytest
```
Semua unit test scoring, scraper, rate limit, dan API wajib berstatus lulus (`passed`).

### 2. Frontend Build
Verifikasi bahwa proses kompilasi aset frontend berjalan tanpa galat:
```bash
cd frontend
npm run build
```
Pastikan folder `dist/` berhasil dibuat tanpa warning atau error kompilasi.

---

## Standar Keamanan & Sensitive File Guard

Pipeline CI kami memiliki sistem **Sensitive File Guard** otomatis yang akan membatalkan build jika mendeteksi file berbahaya atau data rahasia. **Dilarang keras melakukan commit pada file/direktori berikut:**

* File lingkungan rahasia: `.env` (gunakan `.env.example` sebagai gantinya).
* Kunci kredensial lokal: `accounts.db`, `accounts.txt`, `twitter_accounts.json`.
* File runtime lokal: `backend/data/*.json` (misalnya data rate-limiting lokal).
* Direktori autentikasi atau sesi: `auth_info/`, `baileys_auth/`, `.session/`, `sessions/`.
* Direktori `secrets/` atau kunci privat Firebase Service Account.

Pastikan juga kode Anda tidak memasukkan *hardcoded API keys* atau *access tokens*.

---

## Konvensi Pesan Commit

Kami menerapkan konvensi [Conventional Commits](https://www.conventionalcommits.org/):

* `feat:` Fitur baru untuk pengguna (contoh: `feat(api): tambah filter skor minimum`)
* `fix:` Perbaikan bug atau celah keamanan (contoh: `fix(security): bump urllib3 to 2.8.0`)
* `docs:` Perubahan atau penambahan dokumentasi (contoh: `docs: perbarui panduan instalasi`)
* `refactor:` Restrukturisasi kode tanpa mengubah fungsionalitas eksternal
* `perf:` Perubahan kode yang meningkatkan performa sistem
* `test:` Menambahkan atau memperbaiki unit tests
* `chore:` Tugas pemeliharaan rutin, dependensi, atau konfigurasi build

---

## Mengajukan Pull Request (PR)

1. *Push* branch fitur Anda ke repositori *fork*:
   ```bash
   git push origin feat/tambah-indikator-retweet
   ```
2. Buka halaman utama repositori [Yogs4R/lacak-buzzer](https://github.com/Yogs4R/lacak-buzzer) di GitHub, lalu klik tombol **Compare & pull request**.
3. Isi deskripsi PR sesuai dengan template yang tersedia:
   * Jelaskan masalah yang diselesaikan dan solusi yang diimplementasikan.
   * Sertakan perintah tes yang dijalankan.
   * Cantumkan tangkapan layar (*screenshot*) jika terdapat perubahan antarmuka pengguna (UI).
   * Centang seluruh daftar periksa keamanan (*Safety Checklist*).
4. Pastikan semua status CI/CD (GitHub Actions) berstatus **hijau / passing**.
5. Tim pengelola akan meninjau (*review*) PR Anda dan memberikan umpan balik sesegera mungkin.

Terima kasih atas kontribusi Anda dalam menjaga ruang digital yang lebih sehat dan transparan! 🚀
