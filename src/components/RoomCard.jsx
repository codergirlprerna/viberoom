// src/components/RoomCard.jsx

const MOODS = {
  Chill: { icon:"🌊", color:"#06b6d4" },
  Party: { icon:"🎉", color:"#f59e0b" },
  Focus: { icon:"🧠", color:"#b8f724" },
  Sad:   { icon:"🌧️", color:"#93c5fd" },
  Hype:  { icon:"💪", color:"#f87171" },
  Indie: { icon:"🎸", color:"#34d399" },
};

const globalStyles = `
  @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
  .live-dot { width:6px; height:6px; border-radius:9999px; background:#b8f724; display:inline-block; animation:blink 1.4s infinite; }
`;

export default function RoomCard({ room, onClick, onShare }) {
  const mood = MOODS[room.mood] || MOODS.Chill;

  return (
    <>
      <style>{globalStyles}</style>
      <div
        onClick={onClick}
        className="bg-[#0e110e] border border-white/[.07] rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 group"
        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(184,247,36,0.2)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>

        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{background:`${mood.color}18`}}>
            {mood.icon}
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{background:"rgba(184,247,36,0.1)", border:"1px solid rgba(184,247,36,0.2)", color:"#b8f724"}}>
            <div className="live-dot" style={{width:5, height:5}} />
            LIVE
          </div>
        </div>

        {/* Room name */}
        <div className="font-cab font-black text-[16px] text-[#f0f4f0] mb-1 truncate">{room.name}</div>

        {/* Mood + visibility */}
        <div className="text-xs text-[#c8d8c8] mb-3">
          {room.mood} · {room.isPublic ? "Public" : "Private"}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#c8d8c8]">
            👤 {room.listeners ?? 1} listening
          </span>
          <button
            onClick={e => { e.stopPropagation(); onShare?.(room); }}
            className="text-xs font-semibold text-[#b8f724] bg-transparent border-none cursor-pointer hover:underline p-0">
            Share link →
          </button>
        </div>
      </div>
    </>
  );
}
