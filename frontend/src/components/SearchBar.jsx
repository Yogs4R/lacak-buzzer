import { useState } from 'react'

export default function SearchBar({ onSubmit, loading = false }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const normalizeInput = (raw) => {
    const input = raw.trim()

    if (!input) {
      return {
        valid: false,
        error: 'Masukkan username atau URL terlebih dahulu.',
      }
    }

    let candidate = input.replace(/^@/, '').trim()

    if (!/^https?:\/\//i.test(candidate)) {
      if (/^(www\.)?(x|twitter)\.com\//i.test(candidate)) {
        candidate = `https://${candidate}`
      }
    }

    if (/^https?:\/\//i.test(candidate)) {
      try {
        const url = new URL(candidate)
        const host = url.hostname.replace(/^www\./i, '').toLowerCase()

        if (!['x.com', 'twitter.com'].includes(host)) {
          return {
            valid: false,
            error: 'Format URL X/Twitter tidak valid',
          }
        }

        const segments = url.pathname.split('/').filter(Boolean)
        const username = segments[0]

        if (!username || !/^[A-Za-z0-9_]{1,15}$/.test(username)) {
          return {
            valid: false,
            error: 'Format URL X/Twitter tidak valid',
          }
        }

        return {
          valid: true,
          normalized: username,
        }
      } catch {
        return {
          valid: false,
          error: 'Format URL X/Twitter tidak valid',
        }
      }
    }

    if (/^[A-Za-z0-9_]{1,15}$/.test(candidate)) {
      return {
        valid: true,
        normalized: candidate,
      }
    }

    return {
      valid: false,
      error: 'Format URL X/Twitter tidak valid',
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = normalizeInput(value)

    if (!result.valid) {
      setError(result.error)
      return
    }

    setError('')
    setValue(result.normalized)
    onSubmit?.(result.normalized)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="x-profile-input" className="sr-only">
          URL profil X/Twitter
        </label>
        <input
          id="x-profile-input"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://x.com/username"
          disabled={loading}
          className="w-full rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 font-mono text-sm text-white placeholder:text-[#555555] focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/40 disabled:cursor-not-allowed disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-[#e03a1e] to-[#f97316] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Memproses...' : 'Submit'}
        </button>
      </div>

      <p className="text-xs leading-5 text-[#555555]">
        Masukkan URL profil X/Twitter atau username untuk memulai analisis.
      </p>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </form>
  )
}
