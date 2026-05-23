import { useEffect, useRef, useState } from 'react'
import SearchBar from '../components/SearchBar'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleAnalyze = (target) => {
    setIsLoading(true)
    setStatusText(`Menganalisis pola perilaku ${target}...`)

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      setIsLoading(false)
      setStatusText('')
    }, 2000)
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
        </section>
      </main>
    </div>
  )
}
