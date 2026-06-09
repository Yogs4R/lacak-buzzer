
// Safety audit: warna Ekstrem menggunakan merah asli (#ef4444) sesuai instruksi.
const RISK_BAND_COLOR = {
  Rendah: '#22c55e',
  Sedang: '#eab308',
  Tinggi: '#f97316',
  Ekstrem: '#ef4444', // Merah asli
};

const METRIC_LABELS = {
  semantic_similarity: 'Kemiripan Semantik',
  hashtag_density: 'Kepadatan Hashtag',
  activity_intensity: 'Intensitas Aktivitas',
  media_url_ratio: 'Rasio Media & URL',
  interaction_behavior: 'Perilaku Interaksi',
  profile_risk: 'Risiko Profil',
  posting_interval_regularity: 'Regulasi Interval Posting',
};

function getRiskBandColor(riskBand) {
  return RISK_BAND_COLOR[riskBand] || '#8a8a8a';
}

function ScoreDisplay({ score, riskBand }) {
  const color = getRiskBandColor(riskBand);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div
        className="text-[64px] font-bold leading-none font-main"
        style={{ color }}
      >
        {score}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-mutedText">
          dari 100
        </span>
        <span
          className="text-[14px] font-semibold tracking-wide"
          style={{ color }}
        >
          {riskBand}
        </span>
      </div>
    </div>
  );
}

function MetricBar({ label, value }) {
  const color =
    value >= 80
      ? '#ef4444' // Merah asli
      : value >= 65
      ? '#f97316'
      : value >= 40
      ? '#eab308'
      : '#22c55e';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[12px] font-semibold text-mutedText uppercase tracking-wide">
          {label}
        </span>
        <span className="text-[12px] font-bold text-ink">{value}</span>
      </div>
      <div className="h-1 bg-borderCustom rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-500 ease-out"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function getLabelAlignment(x, y, cx, cy) {
  let textAnchor = 'middle';
  if (x < cx - 10) textAnchor = 'end';
  else if (x > cx + 10) textAnchor = 'start';

  let dy = '0.35em';
  if (y < cy - 10) dy = '-0.2em';
  else if (y > cy + 10) dy = '0.9em';

  return { textAnchor, dy };
}

function RadarChart({ metrics }) {
  const cx = 150;
  const cy = 150;
  const r = 85;
  const keys = Object.keys(metrics);
  const total = keys.length;

  const labelMap = {
    semantic_similarity: 'Semantik',
    hashtag_density: 'Hashtag',
    activity_intensity: 'Aktivitas',
    media_url_ratio: 'Media/URL',
    interaction_behavior: 'Interaksi',
    profile_risk: 'Profil',
    posting_interval_regularity: 'Interval',
  };

  const getCoordinates = (i, scale) => {
    const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
    const x = cx + r * scale * Math.cos(angle);
    const y = cy + r * scale * Math.sin(angle);
    return { x, y };
  };

  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = levels.map((level) => {
    const points = [];
    for (let i = 0; i < total; i++) {
      const { x, y } = getCoordinates(i, level);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  });

  const dataPoints = keys.map((key, i) => {
    const val = metrics[key] || 0;
    const scale = val / 100;
    const { x, y } = getCoordinates(i, scale);
    return { x, y };
  });
  const dataPointsStr = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-canvas border border-borderCustom rounded-btn min-h-[300px]">
      <h3 className="text-[11px] font-semibold text-mutedText tracking-widest uppercase mb-4">
        DIAGRAM POLA PERILAKU
      </h3>
      <svg viewBox="0 0 300 300" className="w-full max-w-[250px] h-auto">
        {/* Concentric grid lines */}
        {gridPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="#222222"
            strokeWidth="1.2"
          />
        ))}

        {/* Axes */}
        {keys.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#222222"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Data polygon filled */}
        <polygon
          points={dataPointsStr}
          fill="rgba(249, 115, 22, 0.15)"
          stroke="#f97316"
          strokeWidth="2"
          className="animate-fade-in"
        />

        {/* Data points (circles) */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="#e03a1e"
            stroke="#ffffff"
            strokeWidth="1"
          />
        ))}

        {/* Text labels */}
        {keys.map((key, i) => {
          const { x, y } = getCoordinates(i, 1.18);
          const { textAnchor, dy } = getLabelAlignment(x, y, cx, cy);

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dy={dy}
              fill="#8a8a8a"
              fontSize="9.5"
              fontWeight="600"
              className="font-main uppercase tracking-wider"
            >
              {labelMap[key] || key}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// Safety audit: CaveatBlock diperkuat dengan border-left oranye dan teks lebih besar
// agar disclaimer selalu terlihat jelas dan mudah dibaca — mandatory per DESIGN.md
function CaveatBlock({ text }) {
  return (
    <div className="bg-surface border border-borderCustom rounded-card p-5 sm:p-7 w-full">
      <p className="text-[11px] font-semibold text-mutedText tracking-widest uppercase mb-2">
        CATATAN PENTING
      </p>
      <p className="text-[14px] font-normal text-bodyText leading-relaxed m-0">
        {text ||
          'Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.'}
      </p>
    </div>
  );
}

export default function ResultCard({ data, onReset }) {
  if (!data) return null;

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
  } = data;

  const isLowConfidence = confidence === 'rendah';

  return (
    <section className="bg-surface border border-borderCustom rounded-card p-7 shadow-[0_4px_6px_rgba(0,0,0,0.3),_0_20px_40px_rgba(0,0,0,0.5),_0_0_60px_rgba(249,115,22,0.08)] flex flex-col gap-6">
      {/* Header: username + score */}
      <div className="flex flex-col gap-4 pb-5 border-b border-borderCustom">
        <div>
          <p className="text-[11px] font-semibold text-mutedText tracking-widest uppercase mb-1.5">
            HASIL ANALISIS
          </p>
          <h2 className="text-[22px] font-bold text-ink m-0">
            @{target}
          </h2>
        </div>

        <ScoreDisplay score={score} riskBand={risk_band} />

        {/* Confidence */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-semibold text-mutedText tracking-wider uppercase">
            Confidence:
          </span>
          <span
            className={`text-[12px] font-semibold rounded-btn px-2.5 py-0.5 border ${
              isLowConfidence
                ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
                : 'text-green-500 bg-green-500/10 border-green-500/30'
            }`}
          >
            {isLowConfidence ? 'Rendah' : 'Normal'}
          </span>
          {tweet_count && (
            <span className="text-[12px] text-mutedText">
              ({tweet_count} tweet dikumpulkan)
            </span>
          )}
        </div>

        {isLowConfidence && (
          <p className="text-[13px] text-yellow-500 leading-relaxed m-0">
            Data yang tersedia terbatas. Hasil analisis ini memiliki tingkat kepercayaan rendah
            dan sebaiknya tidak dijadikan acuan tunggal.
          </p>
        )}
      </div>

      {/* Metric Breakdown & Radar Chart */}
      {Object.keys(metrics).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* Left Column: Metrics list */}
          <div>
            <h3 className="text-[11px] font-semibold text-mutedText tracking-widest uppercase mb-4">
              BREAKDOWN METRIK
            </h3>
            <div className="grid gap-3 grid-cols-1 min-[480px]:grid-cols-2">
              {Object.entries(metrics).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-canvas border border-borderCustom rounded-btn p-3.5"
                >
                  <MetricBar label={METRIC_LABELS[key] || key} value={value} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Radar Chart */}
          <RadarChart metrics={metrics} />
        </div>
      )}

      {/* Signals + Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {signals.length > 0 && (
          <div className="bg-canvas border border-borderCustom rounded-btn p-5">
            <h3 className="text-[11px] font-semibold text-mutedText tracking-widest uppercase mb-3.5">
              SINYAL PERILAKU
            </h3>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
              {signals.map((signal, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-[14px] text-bodyText leading-relaxed"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradEnd flex-shrink-0 inline-block" />
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Penjelasan Analisis — selalu tampil, gunakan fallback jika LLM gagal */}
        <div className="bg-canvas border border-borderCustom rounded-btn p-5">
          <h3 className="text-[11px] font-semibold text-mutedText tracking-widest uppercase mb-3.5">
            PENJELASAN ANALISIS
          </h3>
          <p className="text-[14px] text-bodyText leading-relaxed m-0 whitespace-pre-wrap">
            {explanation ||
              'Penjelasan berbasis AI tidak tersedia saat ini. Hasil skor dan indikator metrik di atas tetap valid dan dapat dijadikan referensi.'}
          </p>
        </div>
      </div>

      {/* Caveat — mandatory, always visible, never collapsible */}
      <CaveatBlock text={caveat} />

      {/* Analisis Lagi button */}
      {onReset && (
        <div className="flex justify-start">
          <button
            onClick={onReset}
            className="bg-transparent border border-borderCustom hover:border-gradEnd hover:text-ink rounded-btn px-5 py-2.5 text-bodyText text-[14px] font-semibold cursor-pointer font-main transition-colors duration-200"
          >
            ← Analisis Lagi
          </button>
        </div>
      )}
    </section>
  );
}
