import { useState } from 'react'
import SearchBar from '../components/SearchBar'

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
})

const mockAnalyzeApi = async (target) => {
  await new Promise((resolve) => window.setTimeout(resolve, 2500))

  return mockAnalysisResponse(target)
}

const metricLabels = {
  semantic_similarity: 'Kemiripan Semantik',
  hashtag_density: 'Kepadatan Hashtag',
  activity_intensity: 'Intensitas Aktivitas',
  media_url_ratio: 'Rasio Media & URL',
  interaction_behavior: 'Perilaku Interaksi',
  profile_risk: 'Risiko Profil',
  posting_interval_regularity: 'Regulasi Interval Posting',
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [resultData, setResultData] = useState(null)

  const handleAnalyze = async (target) => {
    setIsLoading(true)
    setResultData(null)
    setStatusText(`Menganalisis pola perilaku ${target}...`)

    try {
      const data = await mockAnalyzeApi(target)
      setResultData(data)
    } finally {
      setIsLoading(false)
      setStatusText('')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <main className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a8a8a]">
              ANALISIS INTELIJEN SOSIAL
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Indikator Risiko Amplifikasi Terkoordinasi
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#c8c8c8] sm:text-lg">
              Analisis pola perilaku akun X/Twitter secara singkat dan ramah, dengan fokus pada indikator risiko berbasis perilaku.
            </p>

            <div className="mt-8 border-t border-[#2a2a2a] pt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="bg-gradient-to-r from-[#e03a1e] to-[#f97316] bg-clip-text text-2xl font-bold text-transparent">
                    98.4%
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8a8a]">
                    Akurasi Deteksi
                  </p>
                </div>
                <div>
                  <p className="bg-gradient-to-r from-[#e03a1e] to-[#f97316] bg-clip-text text-2xl font-bold text-transparent">
                    2.1s
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8a8a]">
                    Waktu Analisis
                  </p>
                </div>
                <div>
                  <p className="bg-gradient-to-r from-[#e03a1e] to-[#f97316] bg-clip-text text-2xl font-bold text-transparent">
                    12M+
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8a8a]">
                    Akun Dipindai
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-[#2a2a2a] bg-[#141414] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a8a8a]">
                ANALISIS TARGET
              </p>

              <div className="mt-4 rounded-2xl bg-[#0a0a0a] p-1">
                <div className="flex flex-wrap gap-2 text-sm font-semibold">
                  <span className="rounded-xl bg-gradient-to-r from-[#e03a1e] to-[#f97316] px-4 py-2 text-white">
                    Username
                  </span>
                  <span className="rounded-xl px-4 py-2 text-[#8a8a8a]">URL Tweet</span>
                  <span className="rounded-xl px-4 py-2 text-[#8a8a8a]">Bulk</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] p-4">
                <SearchBar loading={isLoading} onSubmit={handleAnalyze} />
              </div>

              <div className="mt-4 rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] p-4">
                {isLoading ? (
                  <div className="flex items-center gap-3" role="status" aria-live="polite">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                    <div>
                      <p className="text-sm font-semibold text-white">Mengambil data publik akun...</p>
                      <p className="text-sm text-[#8a8a8a]">{statusText || 'Menganalisis pola perilaku akun...'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-[#c8c8c8]">
                    Siap untuk analisis. Masukkan URL profil X/Twitter atau username pada kolom di atas untuk melanjutkan.
                  </p>
                )}
              </div>
            </div>

            {resultData ? (
              <section className="rounded-[24px] border border-[#2a2a2a] bg-[#141414] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:p-6">
                <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a8a8a]">
                      HASIL ANALISIS
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      @{resultData.target}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-[#f97316]/40 bg-[#1a0f0b] px-4 py-2 text-sm font-semibold text-[#ffd1b5]">
                      {resultData.risk_band}
                    </span>
                    <span className="rounded-full border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2 text-sm font-semibold text-white">
                      {resultData.score}/100
                    </span>
                    <span className="rounded-full border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2 text-sm font-semibold text-[#c8c8c8]">
                      Confidence: {resultData.confidence === 'normal' ? 'Normal' : 'Rendah'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a8a8a]">
                      Sinyal Utama
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {resultData.signals.map((signal) => (
                        <li key={signal} className="flex items-start gap-3 text-sm leading-6 text-[#e8e8e8]">
                          <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 rounded-2xl border border-[#2a2a2a] bg-[#111111] p-4">
                      <p className="text-sm font-semibold text-white">Penjelasan</p>
                      <p className="mt-2 text-sm leading-7 text-[#d8d8d8]">
                        {resultData.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a8a8a]">
                      Breakdown Metrik
                    </h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {Object.entries(resultData.metrics).map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-2xl border border-[#2a2a2a] bg-[#111111] px-4 py-3"
                        >
                          <p className="text-xs uppercase tracking-[0.15em] text-[#8a8a8a]">
                            {metricLabels[key]}
                          </p>
                          <p className="mt-2 text-lg font-bold text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#2a2a2a] bg-[#111111] p-4">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-[#c8c8c8]">
                        <span>Tweet terkumpul: {resultData.tweet_count}</span>
                        <span>•</span>
                        <span>Confidence: {resultData.confidence === 'normal' ? 'Normal' : 'Rendah'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#f97316]/30 bg-[#1a1109] p-4">
                  <p className="text-sm leading-7 text-[#ffd8bf]">{resultData.caveat}</p>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}
