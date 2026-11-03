import { useEffect, useRef } from 'react';
import changelogData from '../data/changelog.json';

export default function ChangelogDropdown({ isOpen, onClose, buttonRef }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      // Abaikan jika klik terjadi di tombol trigger changelog itu sendiri
      if (buttonRef?.current && buttonRef.current.contains(event.target)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed top-[62px] left-4 right-4 max-w-[320px] mx-auto sm:absolute sm:top-full sm:mt-2 sm:left-auto sm:right-0 sm:translate-x-0 sm:w-[340px] sm:max-w-[340px] rounded-2xl border border-white/10 bg-[#0e0e12]/95 backdrop-blur-xl p-3.5 sm:p-5 shadow-[0_16px_48px_rgba(0,0,0,0.8)] z-50 animate-fade-in text-left font-main"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
        <span className="text-[12px] font-bold text-white uppercase tracking-wider">
          Riwayat Pembaruan
        </span>
        <span className="text-[11px] font-mono text-zinc-400">
          {changelogData[0]?.version}
        </span>
      </div>

      {/* Changelog Items List */}
      <div className="flex flex-col gap-3.5 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1">
        {changelogData.map((item, idx) => (
          <div
            key={item.version}
            className={`flex flex-col gap-1 ${
              idx !== changelogData.length - 1 ? 'border-b border-white/5 pb-3' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-[13px] font-bold text-white">
                  {item.version}
                </span>
                {item.isLatest && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30">
                    Terbaru
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 font-mono">
                {item.date}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] font-semibold text-zinc-200 mt-0.5">
              {item.title}
            </p>

            <ul className="list-none p-0 m-0 mt-1 flex flex-col gap-1.5">
              {item.highlights.map((highlight, hIdx) => (
                <li
                  key={hIdx}
                  className="flex items-start gap-2 text-[11px] sm:text-xs text-zinc-400 leading-relaxed"
                >
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[#f97316] shrink-0 inline-block" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer link to GitHub releases */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-between items-center text-[10px] sm:text-[11px]">
        <span className="text-zinc-400">Rilis Open-Source</span>
        <a
          href="https://github.com/Yogs4R/lacak-buzzer/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#f97316] hover:underline font-medium flex items-center gap-1"
        >
          <span>GitHub Releases</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
}
