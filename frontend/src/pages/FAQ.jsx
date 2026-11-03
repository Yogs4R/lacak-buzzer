import { useState } from 'react';
import { useSEO } from '../hooks/useSEO';

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-white/5 py-4 sm:py-5 transition-colors duration-200">
      {/* Question Row */}
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center bg-transparent border-none p-0 cursor-pointer text-left outline-none gap-4 group"
        aria-expanded={isOpen}
      >
        <span
          className={`text-sm sm:text-base font-semibold transition-colors duration-200 ${
            isOpen ? 'text-[#f97316]' : 'text-zinc-200 group-hover:text-white'
          }`}
        >
          {item.q}
        </span>
        <span
          className={`text-zinc-400 text-xs shrink-0 transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180 text-[#f97316]' : 'rotate-0'
          }`}
        >
          ▼
        </span>
      </button>

      {/* Answer block */}
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isOpen ? '300px' : '0',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="text-xs sm:text-sm text-zinc-400 pt-3 leading-relaxed m-0">
          {item.a}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      q: 'Apa itu Indikator Risiko Amplifikasi Terkoordinasi?',
      a: 'Ini adalah skor 0–100 yang mengukur kemiripan pola posting akun dengan karakteristik kampanye amplifikasi terkoordinasi (seperti repetisi pesan tinggi, jadwal seragam, atau penggunaan tagar berlebih). Skor ini adalah indikator berbasis perilaku, bukan vonis bersalah.',
    },
    {
      q: 'Apakah skor tinggi berarti akun tersebut pasti bot atau buzzer bayaran?',
      a: 'Tidak. Skor tinggi hanya mencerminkan anomali repetisi dan intensitas yang tinggi. Akun fanbase komunitas, akun promosi/giveaway, atau bot media berita yang mengunggah tautan secara otomatis juga bisa memperoleh skor tinggi tanpa bermotif manipulatif atau buzzer bayaran.',
    },
    {
      q: 'Apa saja 7 parameter perilaku yang dinilai oleh sistem?',
      a: 'Tujuh parameter tersebut adalah: (1) Kemiripan Semantik pesan, (2) Kepadatan Tagar (#hashtag), (3) Intensitas Aktivitas harian, (4) Rasio Tautan & Media, (5) Perilaku Interaksi (mention/reply), (6) Risiko Profil (usia akun & kelengkapan bio), dan (7) Regulasi Interval Waktu Posting.',
    },
    {
      q: 'Bagaimana cara menggunakan Bot X (@lacakbuzzer) di Twitter?',
      a: 'Cukup mention @lacakbuzzer pada balasan (reply) tweet yang ingin dianalisis, atau mention @lacakbuzzer dengan menyertakan @username target pada tweet baru. Bot kami akan memproses akun target dan membalas secara publik dengan ringkasan sinyal perilaku utama.',
    },
    {
      q: 'Mengapa analisis di website membutuhkan waktu sekitar 15–30 detik?',
      a: 'Karena sistem melakukan pengumpulan data publik terbaru secara real-time, lalu memproses kemiripan semantik menggunakan model machine learning NLP lokal (Sentence Transformers MiniLM), menghitung 7 parameter, serta merangkum sinyal penjelasan tanpa mengandalkan cache usang.',
    },
    {
      q: 'Apakah data pribadi akun yang dianalisis aman?',
      a: 'Sangat aman. Sistem kami hanya membaca postingan publik yang terbuka di platform X. Kami tidak pernah meminta kata sandi pengguna dan tidak menyimpan tweet mentah ke dalam basis data (stateless).',
    },
    {
      q: 'Berapa banyak tweet yang dianalisis untuk setiap akun?',
      a: 'Sistem mengambil hingga 100 tweet publik terbaru. Jika akun memiliki kurang dari 10 tweet, sistem akan menolak analisis (insufficient data) karena sampel data belum mencukupi untuk menghasilkan indikator yang bertanggung jawab.',
    },
    {
      q: 'Apakah ada batasan penggunaan (rate limit)?',
      a: 'Untuk menjaga stabilitas server dan mencegah penyalahgunaan, setiap alamat IP dibatasi maksimal 5 kali analisis per menit di website. Seluruh layanan ini sepenuhnya gratis tanpa perlu login.',
    },
    {
      q: 'Bagaimana keandalan indikator risiko ini?',
      a: 'Sistem menggunakan formula bobot deterministik yang dilengkapi algoritma peredam anti-false-positive (misalnya akun dengan variasi kata luas atau frekuensi rendah otomatis mendapatkan diskon skor). Namun, hasil tetaplah estimasi statistik dan tidak boleh dianggap sebagai kebenaran mutlak.',
    },
  ];

  useSEO({
    title: 'Lacak Buzzer | FAQ',
    description:
      'Pertanyaan yang sering diajukan mengenai cara kerja analisis, metodologi 7 parameter, penggunaan Bot X, privasi data pengguna, dan batasan penggunaan Lacak Buzzer.',
    canonical: 'https://lacakbuzzer.web.id/faq',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqData.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
  });

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-24 sm:pt-32 pb-16 font-main animate-fade-in-up">
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold tracking-widest text-[#f97316] uppercase mb-4">
          <span>FAQ</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Pertanyaan yang Sering Diajukan
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-xl mx-auto">
          Temukan jawaban seputar metodologi, etika penilaian, fitur bot, dan batasan teknis platform Lacak Buzzer.
        </p>
      </div>

      <div className="card p-4 sm:p-8 rounded-2xl border border-white/5 bg-[#121215]/60 flex flex-col">
        {faqData.map((item, i) => (
          <FAQItem
            key={i}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
    </div>
  );
}
