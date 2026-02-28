// src/components/SongSearch.jsx
import { useState, useRef, useEffect } from "react";
import { youtubeAPI } from "../services/api";

const globalStyles = `
  .custom-scroll::-webkit-scrollbar { width:4px; }
  .custom-scroll::-webkit-scrollbar-track { background:transparent; }
  .custom-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .spin { animation:spin 0.7s linear infinite; }
`;

export default function SongSearch({ onSelect, onClose }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const inputRef              = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await youtubeAPI.search(query);
      const songs = res.data;
      if (songs.length === 0) setError("No results found. Try a different search.");
      setResults(songs);
    } catch {
      setError("Search failed. Check your YouTube API key in application.properties.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{background:"rgba(8,10,8,0.9)", backdropFilter:"blur(8px)"}}>
        <div className="w-full max-w-[480px] bg-[#0e110e] border border-white/[.07] rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="p-4 border-b border-white/[.07]">
            <div className="flex items-center justify-between mb-3">
              <div className="font-cab font-black text-[17px] text-[#f0f4f0]">Add a song</div>
              <button onClick={onClose}
                className="text-[#c8d8c8] hover:text-[#f0f4f0] bg-transparent border-none cursor-pointer text-lg">✕</button>
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                className="flex-1 bg-[#141814] border border-white/[.07] rounded-[10px] px-3 py-2.5 text-sm text-[#f0f4f0] outline-none placeholder:text-[#5a6b5a] focus:border-[#b8f724] transition-all"
                placeholder="Search songs, artists..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
              <button onClick={handleSearch} disabled={!query.trim() || loading}
                className="px-4 py-2.5 bg-[#b8f724] text-[#080a08] rounded-[10px] font-cab font-black text-sm cursor-pointer hover:bg-[#d4ff4d] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                {loading
                  ? <div className="w-4 h-4 border-2 border-[#080a08]/30 border-t-[#080a08] rounded-full spin" />
                  : "Search"}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="overflow-y-auto custom-scroll" style={{maxHeight:360}}>
            {error && (
              <div className="px-4 py-6 text-center text-sm text-red-400">{error}</div>
            )}
            {!error && results.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="text-3xl mb-3">🔍</div>
                <div className="text-sm text-[#c8d8c8]">Search for a song to add to the queue</div>
              </div>
            )}
            {results.map(song => (
              <div key={song.youtubeId}
                onClick={() => { onSelect?.(song); onClose?.(); }}
                className="flex items-center gap-3 px-4 py-3 border-b border-white/[.04] cursor-pointer hover:bg-white/[.03] transition-colors group">
                {/* Thumbnail */}
                <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#141814]">
                  {song.thumbnail
                    ? <img src={song.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#f0f4f0] truncate group-hover:text-[#b8f724] transition-colors">{song.title}</div>
                  <div className="text-xs text-[#c8d8c8] truncate">{song.artist}</div>
                </div>
                <div className="text-xs font-semibold text-[#b8f724] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">+ Add</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
