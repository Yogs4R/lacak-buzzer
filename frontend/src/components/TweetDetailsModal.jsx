import React, { useState, useMemo, useEffect } from 'react';

const TweetDetailsModal = ({ isOpen, onClose, metricName, metricScore, metricDescription, tweets }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  // Reset filter state ketika modal baru dibuka
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setFilterType('all');
      setSortOrder('newest');
    }
  }, [isOpen]);

  const processedTweets = useMemo(() => {
    if (!tweets) return [];
    let filtered = tweets.filter(tweet => {
      if (searchQuery && !tweet.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterType === 'media' && !(tweet.media?.length > 0)) return false;
      if (filterType === 'mention' && !(tweet.mentions?.length > 0)) return false;
      if (filterType === 'hashtag' && !(tweet.hashtags?.length > 0)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [tweets, searchQuery, filterType, sortOrder]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-[#141414] border border-[#2a2a2a] rounded-[12px] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          <h2 className="text-xl font-bold text-white tracking-wide">
            {metricName} Details
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        {metricDescription && (
          <div className="px-6 py-3 bg-[#161616] border-b border-[#2a2a2a]">
            <p className="text-sm text-gray-300 leading-relaxed">{metricDescription}</p>
          </div>
        )}

        {/* Summary Info & Filters */}
        <div className="px-6 py-4 bg-[#111111] border-b border-[#2a2a2a] flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Skor Metrik: <span className="text-white font-bold">{metricScore}/100</span>
            </div>
            {tweets && tweets.length > 0 && (
              <div className="text-sm text-gray-400">
                Menampilkan: <span className="text-white font-semibold">{processedTweets.length}</span> / {tweets.length} Tweets
              </div>
            )}
          </div>
          
          {tweets && tweets.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                placeholder="Cari kata kunci..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[#f97316] transition-colors placeholder-gray-500"
              />
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[#f97316] transition-colors"
              >
                <option value="all">Semua Tweet</option>
                <option value="media">Ada Media</option>
                <option value="hashtag">Ada Hashtag</option>
                <option value="mention">Ada Mention</option>
              </select>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[#f97316] transition-colors"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {!tweets || tweets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#e03a1e] mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg font-bold text-white mb-2">Data Terlindungi</h3>
              <p className="text-gray-400 max-w-sm">
                Data tweet tidak disimpan demi aturan privasi, namun skor metrik ini valid berdasarkan analisis sebelumnya.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedTweets.map((tweet, index) => (
                <div key={`${tweet.id || 't'}-${index}`} className="p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] hover:border-[#555555] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(tweet.created_at).toLocaleString('id-ID')}
                    </span>
                    {tweet.url && (
                      <a 
                        href={tweet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] px-3 py-1 bg-gradient-to-r from-[#e03a1e] to-[#f97316] text-white rounded-md hover:opacity-90 transition-opacity font-semibold"
                      >
                        Lihat Asli ↗
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {tweet.text}
                  </p>
                  
                  {/* Metadata Tags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tweet.hashtags?.map(h => (
                      <span key={h} className="text-[10px] px-2 py-0.5 bg-[#2a2a2a] text-blue-400 rounded-md">#{h}</span>
                    ))}
                    {tweet.mentions?.map(m => (
                      <span key={m} className="text-[10px] px-2 py-0.5 bg-[#2a2a2a] text-green-400 rounded-md">@{m}</span>
                    ))}
                    {tweet.media?.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#2a2a2a] text-purple-400 rounded-md">🖼 Media</span>
                    )}
                  </div>
                </div>
              ))}
              {processedTweets.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Tidak ada tweet yang cocok dengan filter pencarian.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetDetailsModal;
