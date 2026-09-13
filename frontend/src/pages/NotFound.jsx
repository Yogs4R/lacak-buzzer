import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { CaveatBlock } from '../components/Footer';

export default function NotFound() {
  useSEO({
    title: '404: Halaman Tidak Ditemukan | Lacak Buzzer',
    description:
      'Halaman yang Anda tuju tidak ditemukan atau sudah tidak tersedia. Silakan kembali ke beranda Lacak Buzzer.',
    noIndex: true,
  });

  return (
    <div className="page-wrapper animate-fade-in-up flex flex-col items-center justify-center min-h-[65vh] text-center px-4 py-16">
      <div className="max-w-[540px] w-full flex flex-col items-center">
        {/* Big Glitch-style Number */}
        <h1 className="text-[72px] sm:text-[96px] font-extrabold font-mono text-ink tracking-tight leading-none mb-2">
          4<span className="gradient-text">0</span>4
        </h1>

        {/* Subtitle */}
        <h2 className="text-[22px] sm:text-[26px] font-bold text-ink mb-4">
          Halaman Tidak Ditemukan
        </h2>

        {/* Description */}
        <p className="text-[15px] sm:text-[16px] text-mutedText leading-relaxed mb-8">
          URL yang Anda tuju tidak tersedia, telah dipindahkan, atau salah ketik.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full mb-12">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-btn bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold text-sm transition-all duration-200 shadow-[0_4px_14px_rgba(249,115,22,0.35)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.45)] no-underline"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
