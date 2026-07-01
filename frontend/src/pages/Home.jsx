import { useState, useRef, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';
import { useSEO } from '../hooks/useSEO';

const getApiUrl = (path) => {
  // Jika sedang didevelop secara lokal, gunakan path relatif agar proxy Vite bekerja.
  // Jika di production, gunakan VITE_API_URL dari Cloudflare, atau fallback ke URL Space Hugging Face.
  const base = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL || "https://lacakbuzzer-lacak-buzzer-backend.hf.space");
  return `${base}${path}`;
};

const analyzeApi = async (target) => {
  const response = await fetch(getApiUrl('/api/analyze'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target,
      source: 'website',
      tweet_limit: 100,
    }),
  });

  if (!response.ok) {
    let errData;
    try {
      errData = await response.json();
    } catch (e) {
      throw new Error('Terjadi kesalahan koneksi ke server.');
    }
    throw new Error(errData.message || 'Terjadi kesalahan sistem.');
  }

  return await response.json();
};

// Sub-komponen reusable untuk merender kolom leaderboard
// Dibuat terpisah untuk menghindari duplikasi kode dan menekan cognitive complexity (Fallow warning).
function LeaderboardBox({ title, items, onFetchHistory, getBadgeStyle }) {
  return (
    <div className="card border border-borderCustom p-5 flex flex-col min-h-[260px]">
      <h3 className="text-[12px] font-bold text-ink uppercase tracking-wider mb-4">{title}</h3>
      {items ? (
        <div className="flex flex-col gap-2.5 text-[13px] flex-1">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-borderCustom/30 pb-1.5 last:border-0 last:pb-0">
                <button
                  onClick={() => onFetchHistory(item.username)}
                  className="bg-transparent border-none text-left font-mono font-semibold text-[#f97316] hover:text-[#e03a1e] cursor-pointer p-0 truncate max-w-[125px]"
                  title={`Lihat detail @${item.username}`}
                >
                  @{item.username}
                </button>
                <span className={`font-semibold font-mono text-[11px] px-1.5 py-0.5 rounded ${getBadgeStyle(item.risk_label)}`}>
                  {item.score}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-mutedText">Belum ada data.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center border-b border-borderCustom/30 pb-2 last:border-0 last:pb-0 animate-pulse">
              <div className="h-3 bg-[#2a2a2a] rounded w-24"></div>
              <div className="h-4 bg-[#2a2a2a] rounded w-8"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SAFE_FALLBACK_CONTRIBUTORS = [
  { login: 'Yogs4R', html_url: 'https://github.com/Yogs4R', avatar_url: 'https://github.com/Yogs4R.png' },
  { login: 'luckywtrike-rgb', html_url: 'https://github.com/luckywtrike-rgb', avatar_url: 'https://github.com/luckywtrike-rgb.png' },
  { login: 'dandy63609', html_url: 'https://github.com/dandy63609', avatar_url: 'https://github.com/dandy63609.png' },
  { login: 'naufalid755', html_url: 'https://github.com/naufalid755', avatar_url: 'https://github.com/naufalid755.png' }
];

const sanitizeContributors = (data) => {
  if (!Array.isArray(data)) return SAFE_FALLBACK_CONTRIBUTORS;
  
  const githubUserRegex = /^[a-zA-Z0-9-]+$/;
  
  const sanitized = data
    .filter(item => {
      if (!item || typeof item !== 'object') return false;
      const login = item.login;
      if (!login || typeof login !== 'string') return false;
      
      // Exclude bots
      if (login.toLowerCase().includes('[bot]') || item.type === 'Bot') return false;
      
      // Validate characters of username (Anti-XSS)
      if (!githubUserRegex.test(login)) return false;
      
      // Validate Profile URL (Anti-Link Injection)
      const htmlUrl = item.html_url;
      if (!htmlUrl || typeof htmlUrl !== 'string' || !htmlUrl.startsWith('https://github.com/')) return false;
      
      // Validate Avatar URL
      const avatarUrl = item.avatar_url;
      if (!avatarUrl || typeof avatarUrl !== 'string') return false;
      const isSecureAvatar = avatarUrl.startsWith('https://avatars.githubusercontent.com/') || avatarUrl.startsWith('https://github.com/');
      if (!isSecureAvatar) return false;
      
      return true;
    })
    .map(item => ({
      login: item.login,
      html_url: item.html_url,
      avatar_url: item.avatar_url
    }));

  return sanitized.length > 0 ? sanitized : SAFE_FALLBACK_CONTRIBUTORS;
};

function ContributorsSection({ contributors }) {
  if (!contributors || contributors.length === 0) return null;
  
  return (
    <section className="animate-fade-in-up delay-200 w-full max-w-[900px] mx-auto mt-16 mb-8 text-center border-t border-borderCustom/30 pt-12">
      <p className="eyebrow mb-3">KONTRIBUTOR</p>
      <h2 className="text-[24px] font-bold text-ink mb-3">
        Terima Kasih kepada Kontributor Hebat Kami
      </h2>
      <p className="text-[14px] text-mutedText max-w-[550px] mx-auto mb-8 leading-relaxed">
        Proyek open-source ini dapat terus berjalan berkat dedikasi dan kontribusi nyata dari rekan-rekan pengembang berikut.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        {contributors.map((c) => (
          <a
            key={c.login}
            href={c.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex flex-col items-center justify-center gap-3 hover:border-[#f97316] hover:scale-105 transition-all duration-300 w-28 h-28 cursor-pointer group"
          >
            <img
              src={c.avatar_url}
              alt={c.login}
              className="w-12 h-12 rounded-full border border-borderCustom group-hover:border-[#f97316] transition-colors object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://github.com/${c.login}.png`;
              }}
            />
            <span className="font-mono text-[12px] text-mutedText group-hover:text-ink transition-colors truncate w-full px-1">
              @{c.login}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function HeroSection({ scannedCount }) {
  return (
    <section className="hero-centered animate-fade-in-up">
      <p className="eyebrow">
        ANALISIS INTELIJEN SOSIAL
      </p>
      <h1 className="hero-headline text-center mt-4 max-w-[800px]">
        Indikator Risiko Amplifikasi Terkoordinasi
      </h1>
      <p className="mt-5 max-w-[600px] text-[18px] text-bodyText leading-relaxed text-center">
        Analisis pola perilaku akun X/Twitter secara singkat dan ramah, dengan fokus pada indikator risiko berbasis perilaku.
      </p>

      {/* Centered Stats Row */}
      <div className="stat-row mt-8 justify-center">
        <div className="stat-item px-6">
          <p className="stat-number">0 - 100</p>
          <p className="stat-label">Skala Indikator</p>
        </div>
        <div className="stat-item px-6 border-l border-r border-borderCustom">
          <p className="stat-number">15.0s</p>
          <p className="stat-label">Waktu Analisis</p>
        </div>
        <div className="stat-item px-6">
          <p className="stat-number">{scannedCount.toLocaleString('id-ID')}</p>
          <p className="stat-label">Akun Dipindai</p>
        </div>
      </div>
    </section>
  );
}

function AnalysisSection({ isLoading, handleAnalyze }) {
  const [activeTab, setActiveTab] = useState('Username');

  return (
    <section className="animate-fade-in-up delay-100 max-w-[650px] w-full mx-auto mb-12">
      <div className="card shadow-[0_20px_50px_rgba(0,0,0,0.45)] p-8">
        <p className="eyebrow mb-4">
          ANALISIS TARGET
        </p>

        {/* Tab Bar */}
        <div className="bg-canvas rounded-lg p-1 flex gap-1 mb-5">
          {['Username', 'URL Tweet', 'Bulk'].map((tab) => {
            const isUsername = tab === 'Username';
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                disabled={!isUsername}
                onClick={() => isUsername && setActiveTab(tab)}
                className={`flex-1 border-none rounded-btn py-2 px-4 font-semibold text-[13px] transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-gradient text-ink'
                    : isUsername
                    ? 'bg-transparent text-mutedText hover:text-ink cursor-pointer'
                    : 'bg-transparent text-placeholderText cursor-not-allowed'
                }`}
              >
                {tab}
                {!isUsername && (
                  <span className="text-[9px] bg-borderCustom px-1.5 py-0.5 rounded text-mutedText font-normal ml-1">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Input Row and Search */}
        <div className="bg-canvas rounded-lg border border-borderCustom p-4">
          <SearchBar loading={isLoading} onSubmit={handleAnalyze} />
        </div>

        {/* Info Message */}
        <div className="mt-4 bg-canvas rounded-lg border border-borderCustom p-4">
          <p className="text-sm leading-relaxed text-bodyText">
            {activeTab === 'Username' &&
              'Masukkan username target tanpa simbol @ untuk menganalisis risiko perilaku profil.'}
            {activeTab === 'URL Tweet' &&
              'Masukkan URL tweet lengkap untuk menganalisis interaksi dan penyebaran semantik tweet tersebut.'}
            {activeTab === 'Bulk' &&
              'Masukkan beberapa username yang dipisahkan oleh tanda koma untuk menganalisis secara massal.'}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [scannedCount, setScannedCount] = useState(0);

  const [globalStats, setGlobalStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [contributors, setContributors] = useState(SAFE_FALLBACK_CONTRIBUTORS);

  const resultsRef = useRef(null);

  useSEO({
    canonical: 'https://lacakbuzzer.web.id/',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Lacak Buzzer',
      url: 'https://lacakbuzzer.web.id',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      inLanguage: 'id',
      description:
        'Analisis pola perilaku akun X/Twitter dan hasilkan Indikator Risiko Amplifikasi Terkoordinasi (skor 0\u2013100). Gratis, tanpa registrasi.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR',
      },
    },
  });

  const fetchStatsAndLeaderboard = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedStats = sessionStorage.getItem('globalStats');
      const cachedLeaderboard = sessionStorage.getItem('leaderboard');
      if (cachedStats && cachedLeaderboard) {
        try {
          const stats = JSON.parse(cachedStats);
          const lb = JSON.parse(cachedLeaderboard);
          setGlobalStats(stats);
          setScannedCount(stats.total_scans);
          setLeaderboard(lb);
          return;
        } catch (e) {
          sessionStorage.removeItem('globalStats');
          sessionStorage.removeItem('leaderboard');
        }
      }
    }

    try {
      const statsRes = await fetch(getApiUrl('/api/stats'));
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setGlobalStats(statsData);
        setScannedCount(statsData.total_scans);
        sessionStorage.setItem('globalStats', JSON.stringify(statsData));
      }
      
      const lbRes = await fetch(getApiUrl('/api/leaderboard'));
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        setLeaderboard(lbData);
        sessionStorage.setItem('leaderboard', JSON.stringify(lbData));
      }
    } catch (e) {
      console.error('Gagal mengambil data statistik/leaderboard', e);
    }
  };

  // Fetch global stats, leaderboard, and contributors on mount
  useEffect(() => {
    fetchStatsAndLeaderboard(false);

    // Load last analysis result from sessionStorage
    const cachedResult = sessionStorage.getItem('lastAnalysisResult');
    if (cachedResult) {
      try {
        setResultData(JSON.parse(cachedResult));
      } catch (e) {
        sessionStorage.removeItem('lastAnalysisResult');
      }
    }

    const fetchContributors = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/Yogs4R/lacak-buzzer/contributors');
        if (res.ok) {
          const data = await res.json();
          const cleanData = sanitizeContributors(data);
          setContributors(cleanData);
        } else {
          setContributors(SAFE_FALLBACK_CONTRIBUTORS);
        }
      } catch (err) {
        console.error('Gagal mengambil kontributor dari GitHub', err);
        setContributors(SAFE_FALLBACK_CONTRIBUTORS);
      }
    };

    fetchContributors();
  }, []);

  const handleAnalyze = async (target) => {
    setIsLoading(true);
    setResultData(null);
    setErrorText('');
    setStatusText(`Menganalisis pola perilaku ${target}...`);

    // Scroll to resultsRef where loading spinner is displayed
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const data = await analyzeApi(target);
      setResultData(data);
      sessionStorage.setItem('lastAnalysisResult', JSON.stringify(data));
      // Refresh stats & leaderboard to reflect the new scan (force refresh)
      fetchStatsAndLeaderboard(true);
    } catch (err) {
      setErrorText(err.message || 'Terjadi kesalahan saat menganalisis.');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  const handleFetchHistory = async (username) => {
    setIsLoading(true);
    setResultData(null);
    setErrorText('');
    setStatusText(`Memuat riwayat pemindaian @${username}...`);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const response = await fetch(getApiUrl(`/api/history/${username}`));
      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch (e) {
          throw new Error('Terjadi kesalahan koneksi ke server.');
        }
        throw new Error(errData.detail || 'Riwayat tidak ditemukan.');
      }
      const data = await response.json();
      setResultData(data);
      sessionStorage.setItem('lastAnalysisResult', JSON.stringify(data));
    } catch (err) {
      setErrorText(err.message || 'Gagal memuat riwayat.');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  useEffect(() => {
    if (resultData) {
      // Scroll to results when data loaded
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [resultData]);

  const handleReset = () => {
    setResultData(null);
    sessionStorage.removeItem('lastAnalysisResult');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBadgeStyle = (riskLabel) => {
    if (riskLabel === 'Rendah') {
      return 'bg-green-500/10 text-green-400 border border-green-500/20';
    }
    if (riskLabel === 'Sedang') {
      return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    }
    if (riskLabel === 'Tinggi') {
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    }
    return 'bg-red-500/10 text-red-400 border border-red-500/20'; // Ekstrem
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <main className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        
        {/* Centered Hero Section */}
        <HeroSection scannedCount={scannedCount} />

        {/* Centered Analysis Card */}
        <AnalysisSection isLoading={isLoading} handleAnalyze={handleAnalyze} />

        {/* Results / Loader section */}
        <div ref={resultsRef} className="w-full max-w-[900px] mx-auto">
          {isLoading && (
            <div className="card animate-fade-in p-8 flex flex-col items-center justify-center gap-5 text-center">
              <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#f97316] border-t-transparent" />
              <div>
                <h3 className="text-[18px] font-semibold text-ink">
                  Mengambil data publik akun...
                </h3>
                <p className="text-[14px] text-mutedText mt-1">
                  {statusText || 'Menganalisis pola perilaku akun...'}
                </p>
              </div>
            </div>
          )}

          {errorText && !isLoading && (
            <div className="card animate-fade-in p-8 flex flex-col items-center justify-center gap-3 text-center border border-red-500/20 bg-red-950/10">
              <span className="text-red-500 text-[32px]">⚠️</span>
              <div>
                <h3 className="text-[18px] font-semibold text-red-500">
                  Analisis Gagal
                </h3>
                <p className="text-[14px] text-mutedText mt-1">
                  {errorText}
                </p>
              </div>
            </div>
          )}

          {resultData && !isLoading && (
            <div className="animate-fade-in-up animate-fade-in">
              <ResultCard data={resultData} onReset={handleReset} />
            </div>
          )}
        </div>

        {/* 4 Boxes Section (Stats & Leaderboard) */}
        {!isLoading && (
          <section className="animate-fade-in-up delay-150 w-full max-w-[900px] mx-auto mt-12 mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              
              {/* Box 1: Total Pemindaian */}
              <div className="card border border-borderCustom p-5 flex flex-col min-h-[260px]">
                <h3 className="text-[12px] font-bold text-ink uppercase tracking-wider mb-4">Total Pemindaian</h3>
                {globalStats ? (
                  <div className="flex flex-col gap-3 font-mono text-[13px] flex-1">
                    <div className="flex justify-between border-b border-borderCustom/50 pb-1.5">
                      <span className="text-mutedText">Ekstrem:</span>
                      <span className="text-[#ef4444] font-semibold">{(globalStats.breakdown?.Ekstrem || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-b border-borderCustom/50 pb-1.5">
                      <span className="text-mutedText">Tinggi:</span>
                      <span className="text-[#f97316] font-semibold">{(globalStats.breakdown?.Tinggi || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-b border-borderCustom/50 pb-1.5">
                      <span className="text-mutedText">Sedang:</span>
                      <span className="text-[#eab308] font-semibold">{(globalStats.breakdown?.Sedang || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between pb-1.5">
                      <span className="text-mutedText">Rendah:</span>
                      <span className="text-[#22c55e] font-semibold">{(globalStats.breakdown?.Rendah || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-sans text-[13px] font-bold mt-auto border-t border-borderCustom">
                      <span>Total:</span>
                      <span className="gradient-text">{globalStats.total_scans?.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 mt-2 animate-pulse flex-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-borderCustom/50 pb-2">
                        <div className="h-3 bg-[#2a2a2a] rounded w-16"></div>
                        <div className="h-3 bg-[#2a2a2a] rounded w-12"></div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 mt-auto border-t border-borderCustom">
                      <div className="h-4 bg-[#2a2a2a] rounded w-12"></div>
                      <div className="h-4 bg-[#2a2a2a] rounded w-16"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Box 2: Radar Terkini */}
              <LeaderboardBox
                title="Radar Terkini"
                items={leaderboard?.recent_scans}
                onFetchHistory={handleFetchHistory}
                getBadgeStyle={getBadgeStyle}
              />

              {/* Box 3: Akun Teraman */}
              <LeaderboardBox
                title="Akun Teraman"
                items={leaderboard?.safest_accounts}
                onFetchHistory={handleFetchHistory}
                getBadgeStyle={getBadgeStyle}
              />

              {/* Box 4: Risiko Tertinggi */}
              <LeaderboardBox
                title="Risiko Tertinggi"
                items={leaderboard?.riskiest_accounts}
                onFetchHistory={handleFetchHistory}
                getBadgeStyle={getBadgeStyle}
              />

            </div>
          </section>
        )}

        {!isLoading && (
          <ContributorsSection contributors={contributors} />
        )}

      </main>
    </div>
  );
}
