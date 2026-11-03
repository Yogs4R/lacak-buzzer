import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/lacak-buzzer-logo.webp';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-3.5 sm:top-5 left-1/2 -translate-x-1/2 w-[92%] sm:w-[94%] max-w-5xl z-50 transition-all duration-300">
      {/* Floating Capsule Bar */}
      <div className="rounded-full border border-white/10 bg-[#0e0e12]/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <NavLink to="/" className="flex items-center focus:outline-none">
            <img src={logo} className="h-6 sm:h-8 w-auto object-contain" alt="Lacak Buzzer" />
          </NavLink>
        </div>

        {/* Middle: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-center gap-1 sm:gap-2">
          {[
            { path: '/', label: 'Home' },
            { path: '/about', label: 'About' },
            { path: '/faq', label: 'FAQ' },
          ].map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `px-4 py-1.5 text-[13px] sm:text-[14px] font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/10 font-semibold shadow-inner'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Try X Bot Button + Mobile Hamburger (LeakCheck style) */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://x.com/lacakbuzzer"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Coba Bot X Lacak Buzzer"
            className="rounded-full bg-white text-black border border-white hover:bg-black hover:text-white hover:border-zinc-700 active:bg-black active:scale-95 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ease-in-out shadow-sm shrink-0 whitespace-nowrap cursor-pointer group"
          >
            {/* X Logo SVG */}
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="inline-block transition-transform duration-300 group-hover:scale-110 shrink-0"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Try X Bot</span>
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Buka menu navigasi"
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Card */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 w-full rounded-2xl border border-white/10 bg-[#0e0e12]/95 backdrop-blur-xl p-3 shadow-2xl flex flex-col gap-1 animate-fade-in">
          {[
            { path: '/', label: 'Home' },
            { path: '/about', label: 'About' },
            { path: '/faq', label: 'FAQ' },
          ].map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'text-white bg-white/10 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
