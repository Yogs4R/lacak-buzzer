import logo from '../assets/lacak-buzzer-logo.webp';

export default function MaintenanceOverlay() {
  return (
    <div className="fixed inset-0 z-[99999] min-h-[100dvh] w-full bg-[#0a0a0a] flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none overflow-y-auto">
      {/* Background Ambient Glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[radial-gradient(ellipse_70%_50%_at_50%_15%,rgba(249,115,22,0.12),transparent_75%)]"
      />

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center animate-fade-in-up">
        {/* Logo */}
        <div className="mb-6 sm:mb-8">
          <img 
            src={logo} 
            alt="Lacak Buzzer" 
            className="h-9 sm:h-11 w-auto object-contain mx-auto"
          />
        </div>

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 mb-5 sm:mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="tracking-wider uppercase text-[11px] sm:text-xs">
            Pemeliharaan Sistem Sementara
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 sm:mb-5 leading-tight">
          Layanan Sedang Dalam Pemeliharaan
        </h1>

        {/* Description */}
        <p className="text-[14px] sm:text-base text-zinc-400 leading-relaxed max-w-lg mb-8">
          Kami sedang melakukan pembaruan infrastruktur dan sinkronisasi scraper X/Twitter untuk memastikan keandalan serta akurasi sistem analisis. Akses publik ditutup sementara waktu.
        </p>

        {/* Status Info Card */}
        <div className="w-full rounded-2xl border border-white/10 bg-[#121215]/80 backdrop-blur-md p-4 sm:p-5 mb-8 shadow-xl text-left">
          <div className="flex flex-col gap-3 text-xs sm:text-sm font-mono">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-zinc-500">Aktivitas:</span>
              <span className="text-zinc-300 font-semibold">Pembaruan API & Scraper Engine</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-zinc-500">Status Server:</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                Maintenance In Progress
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Estimasi Selesai:</span>
              <span className="text-zinc-300 font-semibold">Segera Kembali Hari Ini</span>
            </div>
          </div>
        </div>

        {/* Action Button: X Profile Link for Updates */}
        <a
          href="https://x.com/lacakbuzzer"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white text-black border border-white hover:bg-black hover:text-white hover:border-zinc-700 active:bg-black active:scale-95 px-6 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ease-in-out shadow-lg shrink-0 whitespace-nowrap cursor-pointer group"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="inline-block transition-transform duration-300 group-hover:scale-110 shrink-0"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Pantau Pembaruan di @lacakbuzzer</span>
        </a>

        {/* Footer Note */}
        <p className="mt-10 text-[11px] text-zinc-600">
          © 2026 Lacak Buzzer · Indikator Risiko Amplifikasi Terkoordinasi
        </p>
      </div>
    </div>
  );
}
