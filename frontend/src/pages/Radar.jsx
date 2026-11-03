import { useState, useEffect } from 'react';
import { CaveatBlock } from '../components/Footer';
import { useSEO } from '../hooks/useSEO';

const getApiUrl = (path) => {
  if (import.meta.env.VITE_API_URL !== undefined) {
    return `${import.meta.env.VITE_API_URL}${path}`;
  }
  const base = import.meta.env.DEV
    ? ''
    : 'https://lacakbuzzer-lacak-buzzer-backend.hf.space';
  return `${base}${path}`;
};

const RISK_BADGES = {
  Rendah: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-400',
  },
  Sedang: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
    dot: 'bg-amber-400',
  },
  Tinggi: {
    bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    bar: 'bg-orange-500',
    dot: 'bg-orange-400',
  },
  Ekstrem: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    bar: 'bg-rose-500',
    dot: 'bg-rose-400',
  },
};

const METRIC_LABELS = {
  semantic_similarity: 'Kemiripan Semantik',
  hashtag_density: 'Kepadatan Hashtag',
  activity_intensity: 'Intensitas Aktivitas',
  media_url_ratio: 'Rasio Media & URL',
  interaction_behavior: 'Perilaku Interaksi',
  profile_risk: 'Risiko Profil',
  posting_interval_regularity: 'Regulasi Waktu Posting',
};

export default function Radar() {
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' | 'highest' | 'lowest'
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [reportsCache, setReportsCache] = useState({});
  const [loadingReport, setLoadingReport] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(25);

  useSEO({
    title: 'Lacak Buzzer | Radar Akun',
    description:
      'Pantauan publik akun X/Twitter yang telah dianalisis. Telusuri riwayat skor indikator risiko amplifikasi terkoordinasi dan rincian parameter perilakunya.',
    canonical: 'https://lacakbuzzer.web.id/radar',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Radar Akun - Lacak Buzzer',
      url: 'https://lacakbuzzer.web.id/radar',
      description:
        'Daftar pantauan riwayat pemindaian akun X/Twitter berdasarkan indikator risiko amplifikasi terkoordinasi.',
    },
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Cek cache session khusus radar (v2: mendukung distinct hingga 200 akun)
      sessionStorage.removeItem('radarLeaderboardData'); // Bersihkan cache v1 lama jika ada
      const cached = sessionStorage.getItem('radarLeaderboardData_v2');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Hanya gunakan cache jika berisi data baru (> 5 akun)
          if (parsed && parsed.recent_scans && parsed.recent_scans.length > 5) {
            setLeaderboardData(parsed);
            setLoading(false);
          } else {
            sessionStorage.removeItem('radarLeaderboardData_v2');
          }
        } catch (e) {
          sessionStorage.removeItem('radarLeaderboardData_v2');
        }
      }

      try {
        const res = await fetch(getApiUrl('/api/leaderboard?limit=200&distinct=true'));
        if (res.ok) {
          const data = await res.json();
          setLeaderboardData(data);
          sessionStorage.setItem('radarLeaderboardData_v2', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Gagal memuat data radar', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Reset pagination & expanded card ketika tab atau search berubah
  useEffect(() => {
    setVisibleCount(25);
    setExpandedUser(null);
  }, [activeTab, searchFilter]);

  const handleToggleRow = async (username) => {
    if (expandedUser === username) {
      setExpandedUser(null);
      return;
    }

    setExpandedUser(username);

    // Ambil full report jika belum ada di cache
    if (!reportsCache[username]) {
      setLoadingReport(true);
      try {
        const res = await fetch(getApiUrl(`/api/history/${username}`));
        if (res.ok) {
          const report = await res.json();
          setReportsCache((prev) => ({ ...prev, [username]: report }));
        }
      } catch (e) {
        console.error(`Gagal memuat rincian laporan untuk @${username}`, e);
      } finally {
        setLoadingReport(false);
      }
    }
  };

  const getActiveList = () => {
    if (!leaderboardData) return [];
    let list = [];
    if (activeTab === 'recent') list = leaderboardData.recent_scans || [];
    else if (activeTab === 'highest') list = leaderboardData.riskiest_accounts || [];
    else if (activeTab === 'lowest') list = leaderboardData.safest_accounts || [];

    if (!searchFilter.trim()) return list;
    return list.filter((item) =>
      item.username.toLowerCase().includes(searchFilter.trim().toLowerCase())
    );
  };

  const activeList = getActiveList();
  const displayedList = activeList.slice(0, visibleCount);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-24 sm:pt-32 pb-16 font-main animate-fade-in-up">
      {/* Page Header */}
      <div className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold tracking-widest text-[#f97316] uppercase mb-4">
          <span>PANTAUAN INTELIJEN SOSIAL</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Radar Akun
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-xl mx-auto leading-relaxed">
          Daftar riwayat akun X/Twitter yang telah dianalisis oleh pengguna. Telusuri tingkat risiko dan buka rincian 7 parameter perilaku secara interaktif.
        </p>
      </div>

      {/* Control Bar: Tabs & Search Filter */}
      <div className="card p-3 sm:p-4 rounded-2xl border border-white/5 bg-[#121215]/60 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 w-full sm:w-auto">
          {[
            { id: 'recent', label: 'Terkini' },
            { id: 'highest', label: 'Risiko Tertinggi' },
            { id: 'lowest', label: 'Risiko Terendah' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setExpandedUser(null);
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Search Filter */}
        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cari username..."
            className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#f97316]/60 transition-colors"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* List Metadata Bar: Unique Account Count Counter */}
      {!loading && activeList.length > 0 && (
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              Menampilkan <strong className="text-white font-mono">{activeList.length}</strong> akun unik
              {searchFilter && ` (hasil filter "${searchFilter}")`}
            </span>
          </span>
          <span className="text-[11px] text-zinc-500 hidden sm:inline font-mono">
            Maks. 200 akun • Terfilter unik
          </span>
        </div>
      )}

      {/* Radar List Container */}
      <div className="card rounded-2xl border border-white/5 bg-[#121215]/60 overflow-hidden shadow-xl mb-12">
        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-400 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
            <span>Memuat data radar pantauan...</span>
          </div>
        ) : activeList.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400">
            {searchFilter ? 'Tidak ada akun yang sesuai dengan pencarian.' : 'Belum ada riwayat akun untuk kategori ini.'}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {displayedList.map((item, idx) => {
              const badge = RISK_BADGES[item.risk_label] || RISK_BADGES.Rendah;
              const isExpanded = expandedUser === item.username;
              const report = reportsCache[item.username];

              return (
                <div key={`${item.username}-${idx}`} className="transition-colors hover:bg-white/[0.02]">
                  {/* Row Header */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Rank & User Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="font-mono text-xs font-bold text-zinc-400 w-6 shrink-0">
                        #{idx + 1}
                      </span>

                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {item.username.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex items-center gap-2">
                        <span className="font-semibold text-white text-sm sm:text-base truncate">
                          @{item.username}
                        </span>
                        {/* External link to Twitter/X */}
                        <a
                          href={`https://x.com/${item.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Buka profil @${item.username} di X`}
                          className="text-zinc-400 hover:text-[#f97316] transition-colors shrink-0 p-1 rounded hover:bg-white/5"
                          title="Buka profil di x.com"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>

                    {/* Right: Score, Risk Badge & Accordion Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      {/* Risk Badge & Score */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{item.risk_label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-base sm:text-lg font-bold text-white">
                            {item.score}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            /100
                          </span>
                        </div>
                      </div>

                      {/* Accordion Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleRow(item.username)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                          isExpanded
                            ? 'bg-[#f97316]/10 border-[#f97316]/40 text-[#f97316]'
                            : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{isExpanded ? 'Tutup' : 'Detail'}</span>
                        <span className={`transition-transform duration-200 text-[10px] ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                          ▼
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Accordion Dropdown Content: 7 Metrics Breakdown */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-5 pt-2 bg-black/30 border-t border-white/5 animate-fade-in">
                      {loadingReport && !report ? (
                        <div className="py-6 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
                          <span>Mengambil rincian metrik akun...</span>
                        </div>
                      ) : report && report.metrics ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                              Rincian 7 Parameter Perilaku
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {report.tweet_count ? `${report.tweet_count} tweet dianalisis` : ''}
                            </span>
                          </div>

                          {/* 7 Metrics Progress Bars Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {Object.entries(METRIC_LABELS).map(([key, label]) => {
                              const val = report.metrics[key] ?? 0;
                              return (
                                <div key={key} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                  <div className="flex justify-between items-center text-xs mb-1.5">
                                    <span className="text-zinc-300 font-medium">{label}</span>
                                    <span className="font-mono font-bold text-white">{val}/100</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#f97316] transition-all duration-500"
                                      style={{ width: `${Math.min(val, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Sinyal Perilaku jika tersedia */}
                          {report.signals && report.signals.length > 0 && (
                            <div className="mt-1 pt-3 border-t border-white/5">
                              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                                Sinyal Utama Terdeteksi
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {report.signals.map((sig, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-zinc-300"
                                  >
                                    • {sig}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-xs text-zinc-400">
                          Rincian metrik pemindaian belum tersedia untuk akun ini.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination / Load More Button */}
            {visibleCount < activeList.length && (
              <div className="p-4 sm:p-5 text-center bg-black/20 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 25, activeList.length))}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#f97316]/50 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Tampilkan Lebih Banyak</span>
                  <span className="font-mono text-[11px] text-zinc-400">
                    ({activeList.length - visibleCount} akun tersisa)
                  </span>
                </button>
              </div>
            )}
            {visibleCount >= activeList.length && activeList.length > 25 && (
              <div className="p-3 text-center text-[11px] text-zinc-500 border-t border-white/5 font-mono">
                Semua {activeList.length} akun unik telah ditampilkan
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety Caveat */}
      <section className="w-full">
        <CaveatBlock text="Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu." />
      </section>
    </div>
  );
}

