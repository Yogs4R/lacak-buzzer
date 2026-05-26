// Task 32 — frontend/src/components/ResultCard.jsx
// Menampilkan skor, risk band, confidence, metrik, sinyal, penjelasan, dan caveat wajib.

const RISK_BAND_COLOR = {
  Rendah: '#22c55e',
  Sedang: '#eab308',
  Tinggi: '#f97316',
  Ekstrem: '#ef4444',
}

const METRIC_LABELS = {
  semantic_similarity: 'Kemiripan Semantik',
  hashtag_density: 'Kepadatan Hashtag',
  activity_intensity: 'Intensitas Aktivitas',
  media_url_ratio: 'Rasio Media & URL',
  interaction_behavior: 'Perilaku Interaksi',
  profile_risk: 'Risiko Profil',
  posting_interval_regularity: 'Regulasi Interval Posting',
}

function getRiskBandColor(riskBand) {
  return RISK_BAND_COLOR[riskBand] || '#8a8a8a'
}

function ScoreDisplay({ score, riskBand }) {
  const color = getRiskBandColor(riskBand)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <div
        style={{
          fontSize: '64px',
          fontWeight: 700,
          lineHeight: 1,
          color,
          fontFamily: 'var(--font-main)',
        }}
      >
        {score}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#8a8a8a',
          }}
        >
          dari 100
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color,
            letterSpacing: '0.5px',
          }}
        >
          {riskBand}
        </span>
      </div>
    </div>
  )
}

function MetricBar({ label, value }) {
  const color =
    value >= 80
      ? '#ef4444'
      : value >= 65
      ? '#f97316'
      : value >= 40
      ? '#eab308'
      : '#22c55e'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#8a8a8a',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>{value}</span>
      </div>
      <div
        style={{
          height: '4px',
          background: '#2a2a2a',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: color,
            borderRadius: '2px',
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  )
}

function CaveatBlock({ text }) {
  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #2a2a2a',
        borderLeft: '4px solid #f97316',
        borderRadius: '12px',
        padding: '20px 24px',
        width: '100%',
      }}
    >
      <p
        style={{
          fontSize: '14px',
          fontWeight: 400,
          color: '#c8c8c8',
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        {text ||
          'Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.'}
      </p>
    </div>
  )
}

export default function ResultCard({ data, onReset }) {
  if (!data) return null

  const {
    target,
    score,
    risk_band,
    confidence,
    tweet_count,
    metrics = {},
    signals = [],
    explanation,
    caveat,
  } = data

  const isLowConfidence = confidence === 'rendah'

  return (
    <section
      style={{
        background: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '28px',
        boxShadow:
          '0 4px 6px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.5), 0 0 60px rgba(249,115,22,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Header: username + score */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid #2a2a2a',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#8a8a8a',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            HASIL ANALISIS
          </p>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            @{target}
          </h2>
        </div>

        <ScoreDisplay score={score} riskBand={risk_band} />

        {/* Confidence */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#8a8a8a',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Confidence:
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: isLowConfidence ? '#eab308' : '#22c55e',
              background: isLowConfidence
                ? 'rgba(234,179,8,0.1)'
                : 'rgba(34,197,94,0.1)',
              border: `1px solid ${isLowConfidence ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`,
              borderRadius: '6px',
              padding: '2px 10px',
            }}
          >
            {isLowConfidence ? 'Rendah' : 'Normal'}
          </span>
          {tweet_count && (
            <span style={{ fontSize: '12px', color: '#8a8a8a' }}>
              ({tweet_count} tweet dikumpulkan)
            </span>
          )}
        </div>

        {isLowConfidence && (
          <p style={{ fontSize: '13px', color: '#eab308', margin: 0, lineHeight: 1.6 }}>
            Kepercayaan hasil rendah karena jumlah tweet yang tersedia terbatas.
          </p>
        )}
      </div>

      {/* Metric Breakdown */}
      {Object.keys(metrics).length > 0 && (
        <div>
          <h3
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#8a8a8a',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            BREAKDOWN METRIK
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            {Object.entries(metrics).map(([key, value]) => (
              <div
                key={key}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <MetricBar label={METRIC_LABELS[key] || key} value={value} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signals + Explanation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        {signals.length > 0 && (
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#8a8a8a',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              SINYAL PERILAKU
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {signals.map((signal, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '14px',
                    color: '#c8c8c8',
                    lineHeight: 1.6,
                  }}
                >
                  <span
                    style={{
                      marginTop: '6px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#f97316',
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {explanation && (
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#8a8a8a',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              PENJELASAN ANALISIS
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#c8c8c8',
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {explanation}
            </p>
          </div>
        )}
      </div>

      {/* Caveat — mandatory, always visible, never collapsible */}
      <CaveatBlock text={caveat} />

      {/* Analisis Lagi button */}
      {onReset && (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={onReset}
            style={{
              background: 'transparent',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              padding: '10px 20px',
              color: '#c8c8c8',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-main)',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f97316'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a'
              e.currentTarget.style.color = '#c8c8c8'
            }}
          >
            ← Analisis Lagi
          </button>
        </div>
      )}
    </section>
  )
}
