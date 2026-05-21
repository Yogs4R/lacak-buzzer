export default function SearchBar() {
  return (
    <div className="bg-white p-2 rounded-xl shadow-md border border-gray-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
      <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
        <div className="flex-grow flex items-center px-4">
          <span className="text-gray-400 mr-2">@</span>
          <input 
            type="text" 
            placeholder="Masukkan username atau URL profil X..."
            className="w-full py-3 bg-transparent focus:outline-none text-gray-700"
          />
        </div>
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Analisis
        </button>
      </form>
    </div>
  )
}
