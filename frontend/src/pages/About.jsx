import { useState, useEffect } from 'react';
import { CaveatBlock } from '../components/Footer';
import { useSEO } from '../hooks/useSEO';

const getApiUrl = (path) => {
  const base = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL || "https://lacakbuzzer-lacak-buzzer-backend.hf.space");
  return `${base}${path}`;
};

export default function About() {
  const [scannedCount, setScannedCount] = useState(0);

  useSEO({
    canonical: 'https://lacakbuzzer.web.id/about',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Tentang Lacak Buzzer',
      url: 'https://lacakbuzzer.web.id/about',
      description:
        'Platform Indikator Risiko Amplifikasi Terkoordinasi — alat bantu berbasis AI untuk jurnalis, peneliti, dan organisasi yang ingin memahami pola amplifikasi di platform X.',
      mainEntity: {
        '@type': 'Organization',
        name: 'Lacak Buzzer',
        url: 'https://lacakbuzzer.web.id',
        description:
          'Lacak Buzzer menggunakan kecerdasan buatan untuk menganalisis pola perilaku akun di X. Sistem kami tidak menuduh — hanya menyajikan indikator risiko berbasis pola perilaku.',
      },
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(getApiUrl('/api/stats'));
        if (response.ok) {
          const data = await response.json();
          setScannedCount(data.total_scans);
        }
      } catch (e) {
        console.error('Gagal mengambil statistik global', e);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="page-wrapper animate-fade-in-up">
      {/* Section 1 — Intro */}
      <section className="max-w-[720px] mx-auto text-center mb-16">
        <p className="eyebrow">TENTANG KAMI</p>
        <h1 className="text-[40px] font-bold text-ink mt-4 leading-tight">
          Platform Indikator Risiko Amplifikasi Terkoordinasi
        </h1>
        <p className="text-[18px] text-mutedText mt-4 leading-relaxed">
          Alat bantu berbasis AI untuk jurnalis, peneliti, dan organisasi yang ingin memahami pola amplifikasi di platform X.
        </p>
      </section>

      {/* Section 2 — Two Columns Grid */}
      <section className="about-two-col mb-16">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <p className="text-[18px] text-bodyText leading-relaxed">
            Lacak Buzzer menggunakan kecerdasan buatan untuk menganalisis pola perilaku akun di X. Kami membantu jurnalis, peneliti, dan organisasi memahami risiko amplifikasi terkoordinasi dengan akurasi tinggi.
          </p>
          <p className="text-[18px] text-bodyText leading-relaxed">
            Sistem kami tidak menuduh. Kami hanya menyajikan indikator risiko berbasis pola perilaku — bukan bukti bahwa akun tersebut palsu, dibayar, atau memiliki niat tertentu.
          </p>

          {/* Cara Kerja Flow */}
          <div className="mt-8">
            <p className="eyebrow mb-5">CARA KERJA</p>
            <div className="flex items-center flex-wrap gap-4">
              {/* Step 1 */}
              <div className="flex-1 min-w-[150px]">
                <span className="gradient-text text-[14px] font-semibold">01</span>
                <p className="text-[12px] font-semibold text-mutedText mt-1 uppercase tracking-wide">
                  KUMPULKAN DATA PUBLIK
                </p>
              </div>

              <span className="text-borderCustom text-[20px] font-bold">→</span>

              {/* Step 2 */}
              <div className="flex-1 min-w-[150px]">
                <span className="gradient-text text-[14px] font-semibold">02</span>
                <p className="text-[12px] font-semibold text-mutedText mt-1 uppercase tracking-wide">
                  EKSTRAKSI POLA PERILAKU
                </p>
              </div>

              <span className="text-borderCustom text-[20px] font-bold">→</span>

              {/* Step 3 */}
              <div className="flex-1 min-w-[150px]">
                <span className="gradient-text text-[14px] font-semibold">03</span>
                <p className="text-[12px] font-semibold text-mutedText mt-1 uppercase tracking-wide">
                  HITUNG INDIKATOR RISIKO
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Stat Cards */}
        <div className="flex flex-col gap-4">
          {/* Card 1 */}
          <div className="card p-6">
            <span className="gradient-text text-[28px] font-bold">
              {scannedCount.toLocaleString('id-ID')}
            </span>
            <p className="text-[13px] font-semibold text-mutedText mt-1 uppercase tracking-wider">
              Analisis Selesai
            </p>
          </div>
          {/* Card 2 */}
          <div className="card p-6">
            <span className="gradient-text text-[28px] font-bold">0 - 100</span>
            <p className="text-[13px] font-semibold text-mutedText mt-1 uppercase tracking-wider">
              Skala Indikator
            </p>
          </div>
          {/* Card 3 */}
          <div className="card p-6">
            <span className="gradient-text text-[28px] font-bold">~15s</span>
            <p className="text-[13px] font-semibold text-mutedText mt-1 uppercase tracking-wider">
              Rata-rata Waktu Analisis
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — Trust Pillars */}
      <section className="mb-16">
        <p className="eyebrow mb-6 text-center">PILAR KEPERCAYAAN</p>
        <div className="trust-pillars-grid">
          {/* Pillar 1 */}
          <div className="card p-7">
            <span className="gradient-text text-[11px] font-semibold tracking-widest uppercase block mb-3">
              PRIVASI
            </span>
            <h3 className="text-[16px] font-semibold text-ink">Privasi Terjaga</h3>
            <p className="text-[14px] text-mutedText mt-2 leading-relaxed">
              Kami tidak menyimpan tweet, profil, atau hasil analisis. Setiap permintaan diproses secara stateless.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="card p-7">
            <span className="gradient-text text-[11px] font-semibold tracking-widest uppercase block mb-3">
              METODOLOGI
            </span>
            <h3 className="text-[16px] font-semibold text-ink">Metodologi Terbuka</h3>
            <p className="text-[14px] text-mutedText mt-2 leading-relaxed">
              Formula skor kami bersifat deterministik dan terdokumentasi. Tidak ada kotak hitam — siapa pun dapat memverifikasi logikanya.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="card p-7">
            <span className="gradient-text text-[11px] font-semibold tracking-widest uppercase block mb-3">
              INTEGRITAS
            </span>
            <h3 className="text-[16px] font-semibold text-ink">Tidak Menuduh</h3>
            <p className="text-[14px] text-mutedText mt-2 leading-relaxed">
              Hasil kami adalah indikator risiko, bukan vonis. Kami selalu menyertakan caveat agar interpretasi tetap bertanggung jawab.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 — Safety Note */}
      <section className="w-full">
        <CaveatBlock text="Catatan Penting: Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu." />
      </section>
    </div>
  );
}
