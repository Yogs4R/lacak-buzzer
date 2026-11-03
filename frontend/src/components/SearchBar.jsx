import { useState } from 'react';

const parseXUrl = (urlStr) => {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();

    if (!['x.com', 'twitter.com'].includes(host)) {
      return {
        valid: false,
        error: 'Format URL X/Twitter tidak valid',
      };
    }

    const segments = url.pathname.split('/').filter(Boolean);
    const username = segments[0];

    if (!username || !/^[A-Za-z0-9_]{1,15}$/.test(username)) {
      return {
        valid: false,
        error: 'Format URL X/Twitter tidak valid',
      };
    }

    return {
      valid: true,
      normalized: username,
    };
  } catch {
    return {
      valid: false,
      error: 'Format URL X/Twitter tidak valid',
    };
  }
};

export default function SearchBar({ onSubmit, loading = false }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const normalizeInput = (raw) => {
    const input = raw.trim();

    if (!input) {
      return {
        valid: false,
        error: 'Masukkan username atau URL terlebih dahulu.',
      };
    }

    let candidate = input.replace(/^@/, '').trim();

    if (!/^https?:\/\//i.test(candidate) && /^(www\.)?(x|twitter)\.com\//i.test(candidate)) {
      candidate = `https://${candidate}`;
    }

    if (/^https?:\/\//i.test(candidate)) {
      return parseXUrl(candidate);
    }

    if (/^[A-Za-z0-9_]{1,15}$/.test(candidate)) {
      return {
        valid: true,
        normalized: candidate,
      };
    }

    return {
      valid: false,
      error: 'Format URL X/Twitter tidak valid',
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = normalizeInput(value);

    if (!result.valid) {
      setError(result.error);
      return;
    }

    setError('');
    setValue(result.normalized);
    onSubmit?.(result.normalized);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full">
        <label htmlFor="x-profile-input" className="sr-only">
          URL profil atau username X/Twitter
        </label>
        
        {/* Sleek Capsule Container (LeakCheck / HaveIBeenPwned Style) */}
        <div className="relative flex items-center w-full rounded-full border border-white/15 bg-[#141418]/90 p-1.5 sm:p-2 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-md focus-within:border-[#f97316] focus-within:ring-2 focus-within:ring-[#f97316]/30 transition-all duration-300">
          {/* Left Search Icon */}
          <div className="pl-3 sm:pl-4 pr-1 text-zinc-400 select-none flex items-center shrink-0">
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>

          {/* Text Input */}
          <input
            id="x-profile-input"
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError('');
            }}
            placeholder="Username atau link profil X..."
            disabled={loading}
            autoComplete="off"
            spellCheck="false"
            className="w-full bg-transparent px-2.5 sm:px-3 py-2 sm:py-3 text-[13px] sm:text-base text-white placeholder:text-zinc-500 focus:outline-none font-sans"
          />

          {/* Integrated Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-gradient-to-r from-[#e03a1e] to-[#f97316] text-white font-semibold px-4 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-sm hover:opacity-95 transition-opacity disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
          >
            {loading ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="hidden sm:inline">Memproses...</span>
              </>
            ) : (
              <span>Analisis</span>
            )}
          </button>
        </div>
      </form>

      {/* Inline Error Badge */}
      {error && (
        <div className="mt-3 text-center">
          <span className="inline-block rounded-full bg-red-950/60 border border-red-500/40 px-4 py-1.5 text-xs text-red-300 font-medium">
            ⚠️ {error}
          </span>
        </div>
      )}
    </div>
  );
}
