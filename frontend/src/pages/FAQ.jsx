import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      q: 'Bagaimana cara kerja deteksi buzzer?',
      a: 'Sistem kami menganalisis pola posting, interaksi, dan metadata akun menggunakan model machine learning untuk menghasilkan indikator risiko berbasis pola perilaku.',
    },
    {
      q: 'Apakah data pengguna aman?',
      a: 'Kami hanya menganalisis data publik yang tersedia di platform X. Tidak ada data pribadi yang disimpan di server kami.',
    },
    {
      q: 'Berapa akurasi sistem deteksi?',
      a: 'Model kami mencapai akurasi 98.4% berdasarkan benchmark internal dengan dataset berlabel manual.',
    },
    {
      q: 'Apakah ada batas penggunaan gratis?',
      a: 'Paket gratis memberikan 5 analisis per IP per hari. Untuk kebutuhan lebih besar, tersedia paket Pro dan Enterprise.',
    },
    {
      q: 'Apa itu Indikator Risiko Amplifikasi Terkoordinasi?',
      a: 'Ini adalah skor 0–100 yang menunjukkan potensi risiko berdasarkan pola perilaku akun, bukan bukti bahwa akun tersebut melakukan koordinasi. Skor tinggi berarti pola perilakunya mirip dengan akun yang terkoordinasi, bukan berarti terbukti bersalah.',
    },
  ];

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
        {faqData.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="border-b border-borderCustom py-6 transition-colors duration-200"
            >
              {/* Question Row */}
              <button
                onClick={() => toggle(i)}
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
        })}
      </div>
    </div>
  );
}
