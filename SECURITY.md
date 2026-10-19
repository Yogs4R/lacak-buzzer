# Kebijakan Keamanan (Security Policy)

Kami di proyek **Lacak Buzzer** memperlakukan keamanan aplikasi, data pengguna, dan integritas sistem dengan sangat serius. Dokumen ini menjelaskan kebijakan keamanan kami, versi yang didukung, serta tata cara pelaporan kerentanan secara bertanggung jawab (*responsible disclosure*).

---

## Versi yang Didukung (Supported Versions)

Perbaikan keamanan hanya akan dirilis untuk cabang utama (*main*) dan deployment aktif saat ini.

| Versi / Lingkungan | Didukung? | Keterangan |
| :--- | :---: | :--- |
| `main` (Production) | :white_check_mark: | Kode aktif pada [lacakbuzzer.web.id](https://lacakbuzzer.web.id) |
| Cabang Fitur / PR | :x: | Belum stabil, perbaikan digabungkan melalui `main` |

---

## Melaporkan Kerentanan (Reporting a Vulnerability)

> [!IMPORTANT]
> **JANGAN PERNAH** melaporkan kerentanan keamanan melalui *Public GitHub Issues*, *Pull Requests*, atau forum publik lainnya sebelum masalah tersebut diperbaiki.

Jika Anda menemukan atau mencurigai adanya celah keamanan pada Lacak Buzzer, silakan laporkan melalui salah satu saluran privat berikut:

1. **GitHub Security Advisory (Direkomendasikan):**  
   Buka menu [Security Advisories](https://github.com/Yogs4R/lacak-buzzer/security/advisories/new) di repositori GitHub kami dan klik **"Report a vulnerability"**.
2. **Email Maintainer:**  
   Kirimkan laporan Anda langsung ke email:  
   📧 **`ridwansuryantara@gmail.com`** dengan subjek: `[SECURITY] Lacak Buzzer - <Ringkasan Celah>`

### Informasi yang Perlu Disertakan

Agar kami dapat memverifikasi dan menangani laporan dengan cepat, sertakan:
- **Deskripsi Kerentanan:** Penjelasan teknis mengenai celah keamanan dan potensi risikonya.
- **Langkah Reproduksi (PoC):** Instruksi langkah demi langkah, skrip bukti konsep (*Proof of Concept*), payload, atau screenshot pendukung.
- **Komponen Terdampak:** Endpoint API, dependensi frontend/backend, konfigurasi Docker, atau mekanisme autentikasi/rate-limiting yang terlibat.
- **Usulan Perbaikan (Opsional):** Jika Anda memiliki rekomendasi patch atau mitigasi.

### Komitmen Waktu & Penanganan (SLA)

- **Konfirmasi Awal:** Kami akan mengonfirmasi penerimaan laporan Anda dalam kurun waktu maksimal **48 jam**.
- **Analisis & Triage:** Kami akan menilai tingkat keparahan (*CVSS / Severity*) dan mereproduksi masalah dalam 3–5 hari kerja.
- **Pemberitahuan Progres:** Maintainer akan memberikan pembaruan status berkala kepada pelapor hingga perbaikan selesai.
- **Publikasi & Kredit:** Setelah patch dirilis ke production, kami akan merilis *Security Advisory* resmi dan mencantumkan nama pelapor di [CONTRIBUTORS.md](CONTRIBUTORS.md) sebagai bentuk apresiasi (kecuali jika pelapor meminta anonim).

---

## Arsitektur Pertahanan Berlapis (Defense-in-Depth)

Lacak Buzzer menerapkan sejumlah kontrol keamanan aktif dalam alur CI/CD dan runtime:

1. **Penyaringan Berkas Sensitif (*Sensitive File Guard*):**  
   Alur CI GitHub Actions secara ketat memeriksa dan menolak commit yang memuat berkas konfigurasi lokal atau kredensial:
   - File `.env` dan kredensial API.
   - Basis data lokal scraper: `accounts.db`, `twitter_accounts.json`, dan direktori session twscrape.
   - Berkas runtime lokal: `backend/data/*.json`.

2. **Deteksi Rahasia Otomatis (*Secret Scanning*):**  
   Setiap commit dan Pull Request dipindai menggunakan **Gitleaks** untuk mencegah kebocoran private key, token Firebase, atau API key OpenRouter ke riwayat git.

3. **Pemindaian Kontainer & Dependensi (*Container Image & Dependency Scan*):**  
   - Pemeriksaan vulnerability kontainer Docker backend menggunakan **Trivy** (*Severity HIGH & CRITICAL*).
   - Audit dependensi otomatis melalui Dependabot dan pemeriksaan integritas npm lockfile / Python pinned requirements.

4. **Pemrosesan Tweet Nir-Penyimpanan (*Stateless Raw Tweet Processing*):**  
   - Konten teks mentah tweet yang ditarik dari X/Twitter diproses secara efemeral (*in-memory*) hanya untuk penghitungan metrik dan vektor embedding semantik.
   - Teks mentah tweet **tidak disimpan** ke Firebase Firestore dan **tidak dikirim secara utuh** ke LLM publik, guna menjaga privasi pengguna target.

5. **Validasi Input Ketat & Sanitasi:**  
   - Validasi parameter username menggunakan regex ketat `^[A-Za-z0-9_]{1,50}$` untuk mencegah *header injection*, *command injection*, atau *path traversal*.
   - Pembatasan panjang payload pada semua endpoint API FastAPI.

6. **Pembatasan Laju Permintaan (*Rate Limiting*):**  
   - Pembatasan berbasis alamat IP klien (maksimal 5 permintaan per menit per IP) untuk mencegah *scraping abuse*, pemborosan kuota AI, atau serangan *resource exhaustion*.

---

## Batasan Cakupan (*Out of Scope*)

Hal-hal berikut berada di luar cakupan program pelaporan keamanan ini:
- Serangan Denial of Service (DoS/DDoS) volumetrik yang membanjiri jaringan tanpa melibatkan kelemahan algoritma logika sistem.
- Serangan *Social Engineering* atau *Phishing* yang menargetkan pengembang/maintainer.
- Perubahan sepihak atau pembatasan dari API internal Twitter/X yang mengakibatkan gangguan scraping (silakan laporkan hal ini sebagai bug fungsional biasa di Issues).
