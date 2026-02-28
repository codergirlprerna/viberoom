// src/components/Queue.jsx
const globalStyles = `
  .custom-scroll::-webkit-scrollbar { width:4px; }
  .custom-scroll::-webkit-scrollbar-track { background:transparent; }
  .custom-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
`;

export default function Queue({ queue = [], isHost = false, onClose, onAddSong, onRemove }) {
  return (
    <>
      <style>{globalStyles}</style>
      <div className="absolute inset-0 bg-[#080a08] z-10 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.07]">
          <div>
            <div className="font-cab font-black text-[17px] text-[#f0f4f0]">Queue</div>
            <div className="text-xs text-[#c8d8c8]">{queue.length} song{queue.length !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={onClose}
            className="text-[#c8d8c8] hover:text-[#f0f4f0] bg-transparent border-none cursor-pointer text-lg transition-colors">✕</button>
        </div>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 flex flex-col gap-2">
          {queue.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="text-4xl mb-3">🎵</div>
              <div className="text-sm text-[#f0f4f0] font-semibold mb-1">Queue is empty</div>
              <div className="text-xs text-[#c8d8c8]">Add a song to get started</div>
            </div>
          )}

          {queue.map((song, i) => (
            <div key={song.id || song.youtubeId || i}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${song.current
                ? "border-[rgba(184,247,36,0.25)] bg-[rgba(184,247,36,0.06)]"
                : "border-white/[.07] bg-[#0e110e] hover:border-white/20"}`}>

              {/* Index / play indicator */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 font-cab font-black ${song.current ? "bg-[#b8f724] text-[#080a08]" : "bg-[#141814] text-[#c8d8c8]"}`}>
                {song.current ? "▶" : i + 1}
              </div>

              {/* Thumbnail if available */}
              {song.thumbnail && (
                <img src={song.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
              )}

              {/* Song info */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${song.current ? "text-[#b8f724]" : "text-[#f0f4f0]"}`}>
                  {song.title}
                </div>
                <div className="text-xs text-[#c8d8c8] truncate">{song.artist}</div>
              </div>

              {/* Remove button — host only, not for currently playing song */}
              {isHost && !song.current && (
                <button
                  onClick={() => onRemove?.(song, i)}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-[#c8d8c8] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] transition-all flex-shrink-0 bg-transparent border-none cursor-pointer"
                  title="Remove from queue">
                  ✕
                </button>
              )}

              {/* Playing now badge */}
              {song.current && (
                <div className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{background:"rgba(184,247,36,0.1)", color:"#b8f724", border:"1px solid rgba(184,247,36,0.2)"}}>
                  NOW
                </div>
              )}
            </div>
          ))}

          {/* Add song — host only */}
          {isHost && (
            <button onClick={onAddSong}
              className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/[.1] text-[#c8d8c8] hover:border-[rgba(184,247,36,0.3)] hover:text-[#b8f724] transition-all cursor-pointer bg-transparent w-full mt-1">
              <div className="w-8 h-8 rounded-lg bg-[#141814] flex items-center justify-center text-sm">+</div>
              <span className="text-sm font-semibold">Add a song</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
