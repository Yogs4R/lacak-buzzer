import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [consent, setConsent] = useState('pending'); // 'pending', 'accepted', 'rejected', atau 'none' (belum memilih)

  useEffect(() => {
    const stored = localStorage.getItem('cookieConsent');
    if (stored) {
      setConsent(stored);
    } else {
      setConsent('none');
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setConsent('accepted');
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
        'personalization_storage': 'granted'
      });
    }
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setConsent('rejected');
    if (window.gtag) {
      // Menyetel consent ke denied mengaktifkan anonymous mode (cookieless pings) di Google Analytics
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'personalization_storage': 'denied'
      });
    }
  };

  // Jangan tampilkan banner jika persetujuan sudah dipilih atau masih loading state awal
  if (consent === 'pending' || consent === 'accepted' || consent === 'rejected') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] w-full border-t border-borderCustom bg-[#141414]/95 backdrop-blur-md animate-fade-in py-3 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[13px] text-bodyText leading-normal text-center sm:text-left">
          Situs web ini menggunakan cookie untuk memberikan pengalaman terbaik. Untuk informasi lebih lanjut, silakan baca{' '}
          <a href="/privacy" className="text-ink underline hover:text-[#f97316] transition-colors">
            Kebijakan Privasi
          </a>{' '}
          kami.
        </p>
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={handleReject}
            className="border border-borderCustom bg-transparent hover:bg-borderCustom/30 text-mutedText hover:text-ink text-[12px] font-semibold py-2 px-4 rounded-btn cursor-pointer transition-all duration-200"
          >
            Tolak
          </button>
          <button
            onClick={handleAccept}
            className="bg-brand-gradient hover:opacity-90 text-ink text-[12px] font-semibold py-2 px-4 rounded-btn cursor-pointer transition-all duration-200 border-none"
          >
            Setuju
          </button>
        </div>
      </div>
    </div>
  );
}
