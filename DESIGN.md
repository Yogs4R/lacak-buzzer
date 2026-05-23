# Lacak Buzzer — Design System (Multi-Page)

## Instruction for AI
You are given this spec + a logo image. Output a **React + Vite project** implementing exactly 3 separate pages using React Router. Do not add extra sections, do not change colors, do not change copy. Place the logo at `src/assets/lacak-buzzer-logo.webp` and import it normally.

Tech stack: **React**, **Vite**, **Tailwind CSS** (for utility classes only — all design tokens below must be applied via the CSS variables defined in `index.css`, not Tailwind color classes).

Project structure to generate:
```
src/
├── assets/
│   └── lacak-buzzer-logo.webp
├── components/
│   └── Navbar.jsx
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   └── FAQ.jsx
├── App.jsx          ← React Router routes
├── main.jsx
└── index.css        ← CSS variables + base styles
```

The 3 pages are: **Home**, **About**, **FAQ**  
Use `react-router-dom` (`<BrowserRouter>`, `<Routes>`, `<Route>`) for routing — not show/hide. Active nav link has white color (`#ffffff`); inactive is `#8a8a8a`.

---

## CSS Variables — Copy exactly

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap');

:root {
  --canvas:      #0a0a0a;
  --surface:     #141414;
  --border:      #2a2a2a;
  --ink:         #ffffff;
  --body:        #c8c8c8;
  --muted:       #8a8a8a;
  --placeholder: #555555;
  --grad-start:  #e03a1e;
  --grad-end:    #f97316;
  --gradient:    linear-gradient(135deg, #e03a1e, #f97316);
  --radius-btn:  6px;
  --radius-card: 12px;
  --font-main:   'Barlow', sans-serif;
  --font-mono:   'JetBrains Mono', monospace;
}
* { margin:0; padding:0; box-sizing:border-box; }
body { background: var(--canvas); color: var(--ink); font-family: var(--font-main); }
```

---

## Navbar (shared across all pages)

```
[logo image]   [Home] [About] [FAQ]   [Coba Gratis]
```
- Sticky top, `background: rgba(10,10,10,0.85)`, `backdrop-filter: blur(12px)`
- `border-bottom: 1px solid #2a2a2a`, padding `16px 32px`
- Logo: `<img src="logo.png" height="36" alt="Lacak Buzzer">`
- Nav links: 14px/600, default color `#8a8a8a`
- **Active page link**: color `#ffffff`
- "Coba Gratis" button: `background: var(--gradient)`, white, padding `10px 20px`, radius `6px`

---

## Page 1 — Home (id="page-home")

### Hero Section
Two columns side by side (55% left / 45% right), `min-height: 90vh`, `padding: 0 32px`, vertically centered.

**Left column:**
1. Eyebrow: `ANALISIS INTELIJEN SOSIAL` — 13px/600, `#8a8a8a`, letter-spacing 2px, uppercase
2. Headline: `Deteksi Buzzer di X Secara Akurat` — 80px/700, `#ffffff`, line-height 1.05, letter-spacing -1px. Split across 3 lines.
3. Subtext: `Analisis username atau tweet secara instan. Ungkap pola perilaku yang mengindikasikan amplifikasi terkoordinasi berbasis AI dengan akurasi tinggi.` — 18px/400, `#c8c8c8`, margin-top 24px, max-width 480px

   > **Safety note:** Do not use "jaringan buzzer" or "akun bot" in this subtext. The approved phrasing is "pola perilaku yang mengindikasikan amplifikasi terkoordinasi" — consistent with AGENTS.md framing.

4. Stat row — margin-top 40px, `padding-top 32px`, `border-top: 1px solid #2a2a2a`, flex row, gap 32px:
   - **98.4%** / Akurasi Deteksi
   - **2.1s** / Waktu Analisis
   - **12M+** / Akun Dipindai
   - Stat number: 28px/700 white. Stat label: 12px/600 `#8a8a8a` uppercase
   - Separated by `border-right: 1px solid #2a2a2a`, padding 0 32px (first has no left padding)

**Right column — Analysis Card:**
```
background: #141414
border: 1px solid #2a2a2a
border-radius: 12px
padding: 32px
box-shadow: 0 4px 6px rgba(0,0,0,0.3),
            0 20px 40px rgba(0,0,0,0.5),
            0 0 60px rgba(249,115,22,0.1)
```
Inside the card (top to bottom):
1. Eyebrow: `ANALISIS TARGET` — 13px/600, `#8a8a8a`, letter-spacing 2px, uppercase
2. Tab bar (margin-top 16px):
   - Container: `background: #0a0a0a`, `border-radius: 8px`, `padding: 4px`, display flex
   - 3 tabs: `Username` | `URL Tweet` | `Bulk`
   - Active tab: `background: var(--gradient)`, white text, radius 6px, padding 8px 16px
   - Inactive tab: transparent, `#8a8a8a`, padding 8px 16px
   - Default active: "Username"
3. Input row (margin-top 20px) — display flex, gap 8px:
   - Input: `background: #0a0a0a`, `border: 1px solid #2a2a2a`, radius 6px, padding `12px 16px`, font `var(--font-mono)`, placeholder `@username`, color white, flex 1
   - Button: `background: var(--gradient)`, white, padding `12px 20px`, radius 6px, 15px/600, label `Analisis`
4. Helper text (margin-top 12px): 12px/400, `#555555`  
   `* Masukkan username tanpa @, URL tweet lengkap, atau beberapa username dipisah koma untuk analisis bulk.`

---

## Page 2 — About (id="page-about")

Full-page section, `padding: 80px 32px`, max-width 1200px centered.

**Structure (top to bottom):**

1. Eyebrow: `TENTANG KAMI` — 13px/600, `#8a8a8a`, letter-spacing 2px, uppercase
2. Headline: `Platform Indikator Risiko Amplifikasi Terkoordinasi` — 40px/700, white, margin-top 16px

   > **Safety note:** The headline uses the full approved product label from AGENTS.md. Do not shorten to "Platform Deteksi Buzzer" alone — that framing implies certainty. If a shorter variant is needed for layout, use: `Platform Analisis Pola Perilaku di X`.

3. Two columns (60% left / 40% right), gap 48px, margin-top 48px:

   **Left column:**
   - Paragraph 1 (18px/400, `#c8c8c8`):  
     `Lacak Buzzer menggunakan kecerdasan buatan untuk menganalisis pola perilaku akun di X. Kami membantu jurnalis, peneliti, dan organisasi memahami risiko amplifikasi terkoordinasi dengan akurasi tinggi.`
   - Paragraph 2 (margin-top 24px, same style):  
     `Sistem kami tidak menuduh. Kami hanya menyajikan indikator risiko berbasis pola perilaku — bukan bukti bahwa akun tersebut palsu, dibayar, atau memiliki niat tertentu.`

   **Right column — 3 stat cards (stacked vertically, gap 16px):**
   - Each card: `background: #141414`, `border: 1px solid #2a2a2a`, radius 12px, padding 24px
   - Card 1: `500K+` (28px/700 white) / `Analisis Selesai` (13px/600 `#8a8a8a` uppercase)
   - Card 2: `99.1%` / `Uptime Platform`
   - Card 3: `< 3s` / `Rata-rata Waktu Respons`

4. Safety note (margin-top 64px) — **mandatory, must always be visible**:
   - Container: `background: #141414`, `border: 1px solid #2a2a2a`, `border-left: 4px solid #f97316`, radius 12px, padding 24px 32px
   - Text (16px/400, `#c8c8c8`):  
     `Catatan Penting: Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.`

---

## Page 3 — FAQ (id="page-faq")

Full-page section, `padding: 80px 32px`, max-width 800px centered.

**Structure:**
1. Eyebrow: `FAQ` — same eyebrow style
2. Headline: `Pertanyaan yang Sering Diajukan` — 40px/700, white, margin-top 16px
3. Accordion list (margin-top 48px):
   - Each item: `border-bottom: 1px solid #2a2a2a`, padding `24px 0`
   - Question row: flex between question text (16px/600 white) + arrow icon (`▼`, rotates 180° when open)
   - Answer: hidden by default, 16px/400 `#c8c8c8`, padding-top 16px
   - Click question to toggle

**Questions & Answers:**
1. Q: `Bagaimana cara kerja deteksi buzzer?`  
   A: `Sistem kami menganalisis pola posting, interaksi, dan metadata akun menggunakan model machine learning untuk menghasilkan indikator risiko berbasis pola perilaku.`

2. Q: `Apakah data pengguna aman?`  
   A: `Kami hanya menganalisis data publik yang tersedia di platform X. Tidak ada data pribadi yang disimpan di server kami.`

3. Q: `Berapa akurasi sistem deteksi?`  
   A: `Model kami mencapai akurasi 98.4% berdasarkan benchmark internal dengan dataset berlabel manual.`

4. Q: `Apakah ada batas penggunaan gratis?`  
   A: `Paket gratis memberikan 5 analisis per IP per hari. Untuk kebutuhan lebih besar, tersedia paket Pro dan Enterprise.`

5. Q: `Apa itu Indikator Risiko Amplifikasi Terkoordinasi?`  
   A: `Ini adalah skor 0–100 yang menunjukkan potensi risiko berdasarkan pola perilaku akun, bukan bukti bahwa akun tersebut melakukan koordinasi. Skor tinggi berarti pola perilakunya mirip dengan akun yang terkoordinasi, bukan berarti terbukti bersalah.`

---

## React Router — Routing Setup

### App.jsx
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Navbar.jsx — active link highlight
```jsx
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Navbar() {
  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#ffffff' : '#8a8a8a',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
  });

  return (
    <nav style={{ /* sticky styles per spec */ }}>
      <img src={logo} height="36" alt="Lacak Buzzer" />
      <div>
        <NavLink to="/" style={linkStyle}>Home</NavLink>
        <NavLink to="/about" style={linkStyle}>About</NavLink>
        <NavLink to="/faq" style={linkStyle}>FAQ</NavLink>
      </div>
      <button style={{ background: 'var(--gradient)' }}>Coba Gratis</button>
    </nav>
  );
}
```

### Tab switching in Home.jsx
```jsx
const [activeTab, setActiveTab] = useState('Username');
const placeholders = {
  'Username': '@username',
  'URL Tweet': 'https://x.com/user/status/...',
  'Bulk': 'user1, user2, user3',
};
```

### FAQ accordion in FAQ.jsx
```jsx
const [openIndex, setOpenIndex] = useState(null);
const toggle = (i) => setOpenIndex(openIndex === i ? null : i);
```

---

## Responsive Rules
- Below 768px: hero columns stack (card below text), stat row wraps, about columns stack, navbar links reduce font size
- Hero headline: 48px on mobile, 64px on tablet

---

## Do's and Don'ts
- ✅ Dark canvas `#0a0a0a` always
- ✅ Gradient only on: CTA button, active tab, logo
- ✅ Mono font for all input fields
- ✅ Eyebrow above every section headline
- ✅ Nav: exactly 3 links — Home, About, FAQ (separate pages)
- ✅ Caveat text must always be visible on the About page — never hidden or collapsible
- ✅ All user-facing copy must be in Indonesian (per AGENTS.md)
- ✅ Use approved framing: "indikator risiko", "pola perilaku", "amplifikasi terkoordinasi"
- ❌ No white/light backgrounds
- ❌ No pill buttons (6px radius only)
- ❌ No extra accent colors
- ❌ No font weight above 700
- ❌ No accusation language: do not use "terbukti", "adalah buzzer", "akun palsu", "dibayar"
- ❌ No scoring logic in the frontend — scores come from the backend API only

---

## Safety Copywriting Rules (from AGENTS.md)

These rules apply to every string rendered in the UI. Any copy change must be reviewed against this list before merging.

| Rule | Approved phrasing | Forbidden phrasing |
|------|-------------------|--------------------|
| Product label | Indikator Risiko Amplifikasi Terkoordinasi | "Ini buzzer", "akun palsu" |
| Score description | indikator risiko berbasis pola perilaku | bukti koordinasi / bukti pemalsuan |
| High score framing | pola perilakunya mirip dengan akun terkoordinasi | terbukti bersalah / terkoordinasi |
| Caveat | must appear verbatim (see below) | shortened or omitted caveat |

**Required caveat — must appear verbatim on every result view:**
```
Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.
```
