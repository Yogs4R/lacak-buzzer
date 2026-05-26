// frontend/src/components/Footer.jsx
// Footer sederhana — hanya copyright & meta.
// Caveat block TIDAK diletakkan di sini karena:
//   - About.jsx sudah punya caveat block di konten halamannya
//   - ResultCard.jsx sudah punya caveat block inline di hasil analisis

export default function Footer() {
  return (
    <footer
      style={{
        background: '#0a0a0a',
        borderTop: '1px solid #2a2a2a',
        padding: '24px 32px',
        fontFamily: 'var(--font-main)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <p style={{ fontSize: '13px', color: '#8a8a8a', margin: 0 }}>
          © 2026 Lacak Buzzer. Platform Indikator Risiko Amplifikasi Terkoordinasi.
        </p>
        <p style={{ fontSize: '12px', color: '#555555', margin: 0 }}>
          Hanya menganalisis data publik yang tersedia di platform X.
        </p>
      </div>
    </footer>
  )
}

// Named export tetap tersedia jika dibutuhkan di tempat lain
export function CaveatBlock({ text }) {
  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #2a2a2a',
        borderLeft: '4px solid #f97316',
        borderRadius: '12px',
        padding: '20px 28px',
      }}
    >
      <p style={{ fontSize: '14px', fontWeight: 400, color: '#c8c8c8', lineHeight: 1.7, margin: 0 }}>
        {text || 'Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.'}
      </p>
    </div>
  )
}
