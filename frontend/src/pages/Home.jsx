import { useState, useRef, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';

const mockAnalysisResponse = (target) => ({
  target,
  score: 74,
  risk_band: 'Tinggi',
  confidence: 'normal',
  tweet_count: 100,
  metrics: {
    semantic_similarity: 82,
    hashtag_density: 70,
    activity_intensity: 65,
    media_url_ratio: 45,
    interaction_behavior: 80,
    profile_risk: 70,
    posting_interval_regularity: 50,
  },
  signals: [
    'Kemiripan pesan cukup tinggi',
    'Pola penggunaan tagar terlihat padat',
    'Aktivitas dan interaksi terlihat intens',
  ],
  explanation:
    'Analisis pola perilaku menunjukkan adanya indikasi intensitas aktivitas yang terkoordinasi dalam kurun waktu tertentu, ditandai dengan kesamaan semantik narasi yang cukup tinggi serta pola interaksi yang padat.',
  caveat:
    'Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.',
});

const mockAnalyzeApi = async (target) => {
  await new Promise((resolve) => window.setTimeout(resolve, 2500));
  return mockAnalysisResponse(target);
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [activeTab, setActiveTab] = useState('Username');
  const [scannedCount, setScannedCount] = useState(0);

  const resultsRef = useRef(null);

  const handleAnalyze = async (target) => {
    setIsLoading(true);
    setResultData(null);
    setStatusText(`Menganalisis pola perilaku ${target}...`);
    
    // Increment the scanned account counter by 1
    setScannedCount((prev) => prev + 1);

    // Scroll to resultsRef where loading spinner is displayed
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const data = await mockAnalyzeApi(target);
      setResultData(data);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <p className="stat-number">2.1s</p>
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
