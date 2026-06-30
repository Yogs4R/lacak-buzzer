import { useState } from 'react';
import { useSEO } from '../hooks/useSEO';

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-borderCustom py-6 transition-colors duration-200">
      {/* Question Row */}
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center bg-transparent border-none p-0 cursor-pointer text-left outline-none"
      >
        <span
          className={`text-[16px] font-semibold transition-colors duration-200 ${
            isOpen ? 'text-ink' : 'text-bodyText hover:text-ink'
          }`}
        >
          {item.q}
        </span>
        <span
          className={`text-mutedText text-[12px] transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▼
        </span>
      </button>

      {/* Answer block */}
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isOpen ? '200px' : '0',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="text-[15px] text-mutedText pt-4 leading-relaxed m-0">
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
      q: 'Bagaimana cara kerja deteksi buzzer?',
      a: 'Sistem kami menganalisis pola posting, interaksi, dan metadata akun menggunakan model machine learning Sentence Transformers MiniLM untuk menghasilkan indikator tingkat risiko berbasis pola perilaku.',
    },
    {
      q: 'Apakah data pengguna aman?',
      a: 'Kami hanya menganalisis data publik yang tersedia di platform X. Tidak ada data pribadi yang disimpan di server kami.',
    },
    {
      q: 'Bagaimana keandalan indikator risiko ini?',
      a: 'Indikator ini dihitung secara deterministik menggunakan rumus bobot tetap yang melacak metrik perilaku akun (seperti kemiripan semantik pesan, kepadatan tagar, intensitas postingan, dan pola interval waktu). Hasilnya berupa indikator tingkat risiko perilaku, bukan vonis mutlak.',
    },
    {
      q: 'Apakah ada batas penggunaan?',
      a: 'Untuk versi MVP ini, setiap alamat IP dibatasi maksimal 5 kali analisis sukses per menit demi menjaga stabilitas server. Semua layanan ini gratis tanpa memerlukan registrasi.',
    },
    {
      q: 'Apa itu Indikator Risiko Amplifikasi Terkoordinasi?',
      a: 'Ini adalah skor 0–100 yang menunjukkan potensi risiko berdasarkan pola perilaku akun, bukan bukti bahwa akun tersebut melakukan koordinasi. Skor tinggi berarti pola perilakunya mirip dengan akun yang terkoordinasi, bukan berarti terbukti bersalah.',
    },
  ];

  useSEO({
    title: 'Lacak Buzzer | FAQ',
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
    <div className="animate-fade-in-up py-24 px-4 max-w-[800px] mx-auto w-full font-main">
      <div className="text-center mb-12">
        <p className="eyebrow">FAQ</p>
        <h1 className="text-[40px] font-bold text-ink mt-4 leading-tight">
          Pertanyaan yang Sering Diajukan
        </h1>
      </div>

      <div className="flex flex-col">
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
