import { useState, useEffect } from 'react';
import { CaveatBlock } from '../components/Footer';
import { useSEO } from '../hooks/useSEO';

const getApiUrl = (path) => {
  if (import.meta.env.VITE_API_URL !== undefined) {
    return `${import.meta.env.VITE_API_URL}${path}`;
  }
  const base = import.meta.env.DEV
    ? ''
    : 'https://lacakbuzzer-lacak-buzzer-backend.hf.space';
  return `${base}${path}`;
};

export default function About() {
  const [scannedCount, setScannedCount] = useState(0);

  useSEO({
    title: 'Lacak Buzzer | About',
    description:
      'Platform Indikator Risiko Amplifikasi Terkoordinasi — alat bantu berbasis AI untuk jurnalis, peneliti, dan publik yang ingin memahami pola amplifikasi di platform X.',
    canonical: 'https://lacakbuzzer.web.id/about',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Tentang Lacak Buzzer',
      url: 'https://lacakbuzzer.web.id/about',
      description:
        'Platform Indikator Risiko Amplifikasi Terkoordinasi — alat bantu berbasis AI untuk jurnalis, peneliti, dan publik yang ingin memahami pola amplifikasi di platform X.',
      mainEntity: {
        '@type': 'Organization',
        name: 'Lacak Buzzer',
        url: 'https://lacakbuzzer.web.id',
        description:
          'Lacak Buzzer menganalisis pola perilaku akun di X secara objektif tanpa tuduhan politik atau vonis status personal.',
      },
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(getApiUrl('/api/stats'));
        if (response.ok) {
          const data = await response.json();
          setScannedCount(data.total_scans || 0);
        }
      } catch (e) {
        console.error('Gagal mengambil statistik global', e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-24 sm:pt-32 pb-16 font-main animate-fade-in-up">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold tracking-widest text-[#f97316] uppercase mb-4">
          <span>TENTANG KAMI</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Transparansi Pola Perilaku di Platform Sosial
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed max-w-2xl mx-auto">
          Lacak Buzzer adalah instrumen riset independen untuk mengukur indikator risiko amplifikasi terkoordinasi pada akun X/Twitter secara transparan, deterministik, dan bertanggung jawab.
        </p>
      </section>

      {/* Bento Grid: Mission & Key Facts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-16">
        {/* Card 1: Core Mission (Spans 2 cols on md+) */}
        <div className="md:col-span-2 card p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#121215]/60 hover:border-white/10 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#f97316]" />
              <p className="text-xs font-semibold text-[#f97316] uppercase tracking-wider">
                Misi Kami
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Mendeteksi Anomali Repetisi Tanpa Menghakimi
            </h2>
            <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed mb-4">
              Di era informasi cepat, percakapan publik sering kali dipengaruhi oleh kampanye pesan terorganisir. Lacak Buzzer hadir sebagai alat bantu bagi jurnalis, akademisi, dan publik untuk melihat indikator pola perilaku secara objektif.
            </p>
            <p className="text-sm sm:text-[15px] text-zinc-400 leading-relaxed">
              Kami tidak pernah menuduh atau memvonis siapa pemilik akun, apa niatnya, atau apakah akun tersebut dibayar. Fokus kami murni pada jejak perilaku matematis di lini masa.
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span>✓ 100% Open Source</span>
            <span className="text-zinc-600">•</span>
            <span>✓ Berbasis NLP Lokal</span>
            <span className="text-zinc-600">•</span>
            <span>✓ Bebas Registrasi</span>
          </div>
        </div>

        {/* Card 2: Quick Platform Stats */}
        <div className="card p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#121215]/60 hover:border-white/10 transition-colors flex flex-col justify-around gap-4">
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-[#f97316] font-mono block">
              {scannedCount ? scannedCount.toLocaleString('id-ID') : '0'}
            </span>
            <p className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-1">
              Akun Telah Dipindai
            </p>
          </div>

          <div className="border-t border-white/5 pt-4">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono block">
              0 — 100
            </span>
            <p className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-1">
              Skala Indikator Risiko
            </p>
          </div>

          <div className="border-t border-white/5 pt-4">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono block">
              ~15.0s
            </span>
            <p className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-1">
              Rata-rata Waktu Analisis
            </p>
          </div>
        </div>
      </section>

      {/* Visual Pipeline Cara Kerja */}
      <section className="mb-16">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs font-semibold text-[#f97316] uppercase tracking-widest mb-2">
            ALUR KERJA
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Bagaimana Skor Dihitung?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto">
            Empat tahapan terstruktur yang dijalankan sistem secara instan saat permintaan analisis diterima.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Pengumpulan Data Publik',
              desc: 'Sistem mengambil hingga 100 tweet publik terbaru akun target tanpa memerlukan akses kredensial pribadi.',
            },
            {
              step: '02',
              title: 'Ekstraksi 7 Parameter',
              desc: 'Menganalisis kemiripan semantik teks, frekuensi tagar, proporsi media/link, pola reply/mention, dan ritme waktu posting.',
            },
            {
              step: '03',
              title: 'Penilaian Deterministik',
              desc: 'Menggabungkan skor menggunakan formula bobot matematis tetap, dilengkapi logika peredam untuk mencegah false-positive.',
            },
            {
              step: '04',
              title: 'Sintesis Penjelasan AI',
              desc: 'Menghasilkan ringkasan narasi sinyal perilaku dalam Bahasa Indonesia yang transparan dan mudah dipahami.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="card p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#121215]/50 hover:border-white/10 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#f97316] block mb-3">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-[#f97316] uppercase tracking-widest mb-2">
            KOMITMEN KAMI
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Pilar Integritas & Etika
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="card p-6 rounded-2xl border border-white/5 bg-[#121215]/60 hover:border-white/10 transition-colors">
            <span className="text-[11px] font-semibold text-[#f97316] tracking-widest uppercase block mb-2">
              PRIVASI STATELESS
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              Zero Raw Tweet Storage
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Kami tidak menyimpan tweet mentah, biodata lengkap, atau konten pribadi akun target. Seluruh kalkulasi teks diproses langsung di memori lalu dibersihkan.
            </p>
          </div>

          <div className="card p-6 rounded-2xl border border-white/5 bg-[#121215]/60 hover:border-white/10 transition-colors">
            <span className="text-[11px] font-semibold text-[#f97316] tracking-widest uppercase block mb-2">
              FORMULA TERBUKA
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              Tanpa Kotak Hitam (No Blackbox)
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Formula pembobotan skor dan ambang batas metrik didokumentasikan secara terbuka. Kode sumber tersedia untuk diaudit dan dipelajari secara transparan.
            </p>
          </div>

          <div className="card p-6 rounded-2xl border border-white/5 bg-[#121215]/60 hover:border-white/10 transition-colors">
            <span className="text-[11px] font-semibold text-[#f97316] tracking-widest uppercase block mb-2">
              ANTI-VONIS
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              Indikator, Bukan Bukti Hukum
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Hasil analisis adalah indikator statistik pola repetisi. Skor tinggi tidak membuktikan akun bersalah, berbayar, atau digerakkan oleh pihak tertentu.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Caveat Footer */}
      <section className="w-full">
        <CaveatBlock text="Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu." />
      </section>
    </div>
  );
}
