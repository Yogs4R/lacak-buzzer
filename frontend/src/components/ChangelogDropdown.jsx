import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import changelogData from '../data/changelog.json';

export default function ChangelogDropdown({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    // Kunci scroll pada background body saat modal terbuka
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3.5 sm:p-6 animate-fade-in font-main">
      {/* Fullscreen Blurred Dark Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Solid Centered Modal Card (Non-transparent for maximal contrast & focus) */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="changelog-title"
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#121217] p-5 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.95)] z-10 text-left flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title, Subtitle & Close Button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-[#f97316] shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
              </svg>
            </div>
            <div>
              <h2 id="changelog-title" className="text-sm sm:text-base font-bold text-white tracking-tight">
                Riwayat Pembaruan
              </h2>
              <p className="text-[11px] text-zinc-400">
                Catatan rilis dan pembaruan fitur Lacak Buzzer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Riwayat Pembaruan"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Changelog Items List - Smooth Scrollable */}
        <div className="flex-1 overflow-y-auto pr-1.5 sm:pr-2 flex flex-col gap-4">
          {changelogData.map((item, idx) => (
            <div
              key={item.version}
              className={`flex flex-col gap-1.5 ${
                idx !== changelogData.length - 1 ? 'border-b border-white/5 pb-4' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">
                    {item.version}
                  </span>
                  {item.isLatest && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30">
                      Terbaru
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {item.date}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-zinc-200">
                {item.title}
              </p>

              <ul className="list-none p-0 m-0 mt-1 flex flex-col gap-2">
                {item.highlights.map((highlight, hIdx) => (
                  <li
                    key={hIdx}
                    className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f97316] shrink-0 inline-block" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer link to GitHub releases */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs shrink-0">
          <span className="text-zinc-500">Proyek Open-Source</span>
          <a
            href="https://github.com/Yogs4R/lacak-buzzer/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f97316] hover:text-[#fb923c] font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Semua Rilis di GitHub</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
