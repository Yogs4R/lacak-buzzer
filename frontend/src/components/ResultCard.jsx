export default function ResultCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hasil Analisis</h2>
          <p className="text-gray-500 text-sm">Menampilkan data untuk @akun_contoh</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Risiko Ekstrem
          </div>
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold">
            85/100
          </div>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Sinyal Perilaku</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span className="text-gray-700 font-medium">Kemiripan antar tweet sangat tinggi</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span className="text-gray-700 font-medium">Intensitas postingan di luar kewajaran</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span className="text-gray-700 font-medium">Profil baru tanpa riwayat bio (Kosong)</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Penjelasan Analisis</h3>
          <p className="text-gray-700 leading-relaxed text-sm">
            Akun ini menunjukkan pola aktivitas terotomatisasi atau terkoordinasi yang kuat. 
            Dari 100 tweet terakhir, terdapat tingkat repetisi dan kesamaan teks yang berlebihan. 
            Selain itu, volume interaksi dalam waktu singkat mengindikasikan amplifikasi pesan tertentu 
            secara tidak natural.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Jumlah Tweet: 100</span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">Confidence: Normal</span>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 border-t border-yellow-100 flex gap-3 text-sm">
        <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <p className="text-yellow-800">
          <strong>Catatan:</strong> Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu.
        </p>
      </div>
    </div>
  )
}
