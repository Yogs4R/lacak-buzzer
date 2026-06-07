import { useState, useRef, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';

const getApiUrl = (path) => {
  // Jika sedang didevelop secara lokal, gunakan path relatif agar proxy Vite bekerja.
  // Jika di production, gunakan VITE_API_URL dari Cloudflare, atau fallback ke URL Space Hugging Face.
  const base = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL || "https://yogs4r-lacak-buzzer-backend.hf.space");
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

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [activeTab, setActiveTab] = useState('Username');
  const [scannedCount, setScannedCount] = useState(0);
  const [recentScans, setRecentScans] = useState([]);

  const resultsRef = useRef(null);

  // Fetch global stats and check cached analysis on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(getApiUrl('/api/stats'));
        if (response.ok) {
          const data = await response.json();
          setScannedCount(data.total_scans);
        }
      } catch (e) {
        console.error('Gagal mengambil statistik global', e);
      }
    };
    fetchStats();

    // Load recent scans from localStorage
    try {
      const saved = localStorage.getItem('recentScans');
      if (saved) {
        setRecentScans(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Gagal memuat riwayat pencarian', e);
    }

    // Load last analysis result from sessionStorage
    const cachedResult = sessionStorage.getItem('lastAnalysisResult');
    if (cachedResult) {
      try {
        setResultData(JSON.parse(cachedResult));
      } catch (e) {
        sessionStorage.removeItem('lastAnalysisResult');
      }
    }
  }, []);

  const addToRecentScans = (username, score, riskBand, fullData) => {
    let list = [];
    try {
      const saved = localStorage.getItem('recentScans');
      list = saved ? JSON.parse(saved) : [];
    } catch (e) {
      list = [];
    }
    list = list.filter((item) => item.username.toLowerCase() !== username.toLowerCase());
    list.unshift({ username, score, risk_band: riskBand, data: fullData });
    list = list.slice(0, 5);
    localStorage.setItem('recentScans', JSON.stringify(list));
    setRecentScans(list);
  };

  const handleSelectRecentScan = (item) => {
    setResultData(item.data);
    sessionStorage.setItem('lastAnalysisResult', JSON.stringify(item.data));
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

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
      addToRecentScans(data.target, data.score, data.risk_band, data);
      // Increment global scanned count locally upon successful analysis
      setScannedCount((prev) => prev + 1);
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

  const handleClearRecentScans = () => {
    localStorage.removeItem('recentScans');
    setRecentScans([]);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <main className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        
        {/* Centered Hero Section */}
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

        {/* Centered Analysis Card */}
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

        {/* Recent Scans Section */}
        {!resultData && !isLoading && recentScans.length > 0 && (
          <section className="animate-fade-in-up delay-150 max-w-[650px] w-full mx-auto mt-6 mb-12">
            <div className="card border border-borderCustom p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="eyebrow m-0">Pencarian Terbaru (Device Ini)</p>
                <button
                  onClick={handleClearRecentScans}
                  className="text-[11px] text-mutedText hover:text-red-400 bg-transparent border-none cursor-pointer font-main font-semibold transition-colors duration-200"
                >
                  Hapus Riwayat
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {recentScans.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectRecentScan(item)}
                    className="flex justify-between items-center bg-canvas hover:bg-surface border border-borderCustom hover:border-gradEnd rounded-btn p-3 text-left transition-colors duration-200 cursor-pointer w-full text-ink"
                  >
                    <span className="font-mono text-ink">@{item.username}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-mutedText">Score: {item.score}</span>
                      <span
                        className="text-[12px] font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            item.risk_band === 'Rendah'
                              ? 'rgba(34, 197, 94, 0.1)'
                              : item.risk_band === 'Sedang'
                              ? 'rgba(234, 179, 8, 0.1)'
                              : item.risk_band === 'Tinggi'
                              ? 'rgba(249, 115, 22, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                          color:
                            item.risk_band === 'Rendah'
                              ? '#22c55e'
                              : item.risk_band === 'Sedang'
                              ? '#eab308'
                              : item.risk_band === 'Tinggi'
                              ? '#f97316'
                              : '#ef4444',
                          border:
                            item.risk_band === 'Rendah'
                              ? '1px solid rgba(34, 197, 94, 0.2)'
                              : item.risk_band === 'Sedang'
                              ? '1px solid rgba(234, 179, 8, 0.2)'
                              : item.risk_band === 'Tinggi'
                              ? '1px solid rgba(249, 115, 22, 0.2)'
                              : '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        {item.risk_band}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

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
            <div className="animate-fade-in-up">
              <ResultCard data={resultData} onReset={handleReset} />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
