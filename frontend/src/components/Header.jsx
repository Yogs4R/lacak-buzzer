import { NavLink } from 'react-router-dom';
import logo from '../assets/lacak-buzzer-logo.webp';

export default function Header() {
  return (
    <header className="navbar">
      <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <NavLink to="/" className="flex items-center">
          <img src={logo} className="logo-3-1" alt="Lacak Buzzer" />
        </NavLink>

        {/* Middle: Navigation Links */}
        <nav className="flex items-center gap-4 sm:gap-6">
          {['/', '/about', '/faq'].map((path) => {
            const label = path === '/' ? 'Home' : path === '/about' ? 'About' : 'FAQ';
            return (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `text-[14px] font-semibold transition-colors duration-200 ${
                    isActive ? 'text-ink' : 'text-mutedText hover:text-ink'
                  }`
                }
              >
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Try X Bot Button */}
        <a
          href="https://x.com/lacakbuzzer"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-ink text-[#000000] border border-ink hover:bg-[#000000] hover:text-ink hover:border-borderCustom rounded-btn px-3 sm:px-4 py-2 font-main text-[14px] font-semibold flex items-center gap-2 transition-all duration-200 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
        >
          {/* X Logo SVG */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="inline-block"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="hidden sm:inline">Try X Bot</span>
        </a>
      </div>
    </header>
  );
}
