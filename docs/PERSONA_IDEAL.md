# Dokumentasi Metodologi: Persona Ideal Perilaku Amplifikasi Terkoordinasi

Dokumen ini menjelaskan konsep **Persona Ideal** yang digunakan sebagai dasar penilaian (skor acuan 100/100) pada sistem deteksi indikator risiko Lacak Buzzer. Konsep ini digunakan untuk memetakan deviasi perilaku suatu akun X/Twitter dari perilaku organik normal manusia.

> [!IMPORTANT]
> **Pernyataan Keamanan Produk (Verbatim):**
> Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.

---

## 1. Konsep Dasar Persona Ideal

Dalam analisis perilaku intelijen media sosial, **Persona Ideal** adalah model profil teoretis yang menunjukkan aktivitas amplifikasi tidak organik pada tingkat maksimal. Model ini dibangun berdasarkan akumulasi pola perilaku ekstrem dari berbagai studi kasus akun amplifikasi terkoordinasi (bot/buzzer/campaigner).

Sistem Lacak Buzzer tidak menilai isi konten secara subjektif, melainkan membandingkan statistik perilaku akun target terhadap Persona Ideal ini melalui **7 Metrik Perilaku Utama**.

---

## 2. 7 Metrik Pembentuk Persona Ideal

Persona Ideal yang menghasilkan skor risiko **100/100 (Ekstrem)** dirumuskan dengan kriteria batas metrik sebagai berikut:

### 1. Kemiripan Semantik (*Semantic Similarity*)
*   **Kriteria Persona:** Memposting teks/narasi yang hampir identik secara berulang-ulang untuk menaikkan topik tertentu secara masif.
*   **Batas Acuan:** Nilai rata-rata *Cosine Similarity* menggunakan model `all-MiniLM-L6-v2` bernilai **1.0 (100%)**.
*   **Bobot:** **30%** (Metrik paling dominan karena menunjukkan repetisi narasi terkoordinasi).

### 2. Kepadatan Tagar (*Hashtag Density*)
*   **Kriteria Persona:** Memasang banyak tagar populer di setiap postingan untuk mendompleng *trending topics* (hijacking hashtags).
*   **Batas Acuan:** Rata-rata menggunakan **4 tagar atau lebih** di setiap postingan.
*   **Bobot:** **20%**.
*   **Rumus:** $\text{Skor} = \min\left(\frac{\text{Rata-rata tagar}}{4} \times 100, 100\right)$

### 3. Intensitas Aktivitas (*Activity Intensity*)
*   **Kriteria Persona:** Memposting dengan frekuensi sangat tinggi yang tidak wajar untuk ukuran manusia normal (biasanya dijalankan oleh sistem bot atau multi-operator).
*   **Batas Acuan:** Memposting **80 kali atau lebih dalam sehari**.
*   **Bobot:** **15%**.
*   **Rumus:** $\text{Skor} = \min\left(\frac{\text{Postingan per hari}}{80} \times 100, 100\right)$

### 4. Rasio Tautan & Media (*Media & URL Ratio*)
*   **Kriteria Persona:** Selalu menyertakan gambar pendukung dan link rujukan untuk mengarahkan opini publik ke situs eksternal tertentu.
*   **Batas Acuan:** Seluruh postingan (100%) memiliki tautan dan gambar.
*   **Bobot:** **10%** (Proporsi: 60% Rasio URL, 40% Rasio Media).

### 5. Pola Interaksi (*Interaction Behavior*)
*   **Kriteria Persona:** Digunakan khusus untuk menyerang opini orang lain atau memperbanyak percakapan buatan di kolom komentar target.
*   **Batas Acuan:** Seluruh postingan (100%) berupa mention ke akun lain dan membalas (*reply*) postingan orang lain.
*   **Bobot:** **10%** (Proporsi: 50% Rasio Mention, 50% Rasio Reply).

### 6. Risiko Profil & Keaslian (*Profile Risk*)
*   **Kriteria Persona:** Akun dibuat secara mendadak/instan untuk kampanye tertentu dan tidak dilengkapi dengan bio profil yang memadai.
*   **Batas Acuan:** Usia akun kurang dari **90 hari** (bobot 70%) dan deskripsi **bio kosong** (bobot 30%).
*   **Bobot:** **10%**.

### 7. Keteraturan Waktu Posting (*Posting Interval Regularity*)
*   **Kriteria Persona:** Menggunakan sistem penjadwalan otomatis (monoton) dengan pola jeda waktu antar-postingan yang presisi tanpa variasi acak manusia.
*   **Batas Acuan:** Nilai entropi waktu postingan mendekati **0** (menandakan keteraturan interval postingan bernilai 100%).
*   **Bobot:** **5%**.
*   **Rumus:** $\text{Skor} = (1 - \text{posting entropy}) \times 100$

---

## 3. Logika Formula Scoring Kontrak MVP v1

Perhitungan skor akhir mengikuti penggabungan linier berbobot (*weighted sum*) dari komponen terstandarisasi di atas:

$$\text{Final Score} = \min\left(\sum (\text{Skor Metrik} \times \text{Bobot}), 100\right)$$

### Aturan Reduksi Anti-False-Positive
Untuk menghindari akun manusia aktif (seperti jurnalis, selebritas, atau akun publik organik) dikategorikan secara keliru sebagai risiko tinggi, sistem menerapkan peredam nilai (*reducers*):

1.  **Reduksi Keragaman Pesan:** 
    Jika teks postingan bervariasi secara acak (nilai keragaman teks/diversity > 0.6), skor akhir **dikali 0.7**.
2.  **Reduksi Aktivitas Rendah:** 
    Jika intensitas postingan kurang dari 5 per hari, skor akhir **dikali 0.8**.
3.  **Reduksi Interaksi Rendah:** 
    Jika akun jarang melakukan mention (< 30%) dan jarang membalas twit (< 30%), skor akhir **dikali 0.85**.

---

## 4. Klasifikasi Kategori Risiko

Berdasarkan perbandingan dengan Persona Ideal ini, tingkat kedekatan perilaku akun dikategorikan menjadi 4 tingkatan (Risk Bands):

*   **0–35 (Rendah):** Perilaku akun sangat jauh dari pola amplifikasi terkoordinasi (organik).
*   **36–65 (Sedang):** Menunjukkan beberapa pola keteraturan postingan atau penggunaan tagar yang moderat.
*   **66–85 (Tinggi):** Pola perilaku memiliki kemiripan yang signifikan dengan karakteristik amplifikasi terkoordinasi.
*   **86–100 (Ekstrem):** Perilaku akun sangat identik dengan seluruh indikator ekstrem pada Persona Ideal.
