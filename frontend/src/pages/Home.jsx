import Header from '../components/Header'
import Footer from '../components/Footer'
import SearchBar from '../components/SearchBar'
import ResultCard from '../components/ResultCard'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-10 mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Indikator Risiko Amplifikasi Terkoordinasi
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Analisis pola perilaku akun X/Twitter untuk memperkirakan indikator risiko amplifikasi tanpa mengklaim akun tersebut palsu atau berbayar.
          </p>
        </div>
        
        <SearchBar />
        
        {/* Placeholder for results - later this will show conditionally */}
        <div className="mt-12">
          <ResultCard />
        </div>
      </main>
      <Footer />
    </div>
  )
}
