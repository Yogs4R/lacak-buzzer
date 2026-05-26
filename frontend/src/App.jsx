import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Home from './pages/Home';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
