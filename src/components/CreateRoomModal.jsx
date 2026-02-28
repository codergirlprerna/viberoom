// src/components/CreateRoomModal.jsx
import { useState } from "react";

const MOODS = [
  { icon:"🌊", label:"Chill",  color:"#06b6d4" },
  { icon:"🎉", label:"Party",  color:"#f59e0b" },
  { icon:"🧠", label:"Focus",  color:"#b8f724" },
  { icon:"🌧️", label:"Sad",   color:"#93c5fd" },
  { icon:"💪", label:"Hype",   color:"#f87171" },
  { icon:"🎸", label:"Indie",  color:"#34d399" },
];

export default function CreateRoomModal({ onClose, onCreate }) {
  const [name,     setName]     = useState("");
  const [mood,     setMood]     = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleCreate = () => {
    if (!name.trim() || !mood) return;
    onCreate({ name: name.trim(), mood, isPublic });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{background:"rgba(8,10,8,0.85)", backdropFilter:"blur(8px)"}}>
      <div className="w-full max-w-[440px] bg-[#0e110e] border border-white/[.07] rounded-2xl p-6 relative">

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 text-[#c8d8c8] hover:text-[#f0f4f0] bg-transparent border-none cursor-pointer text-lg transition-colors">✕</button>

        <div className="font-cab font-black text-[22px] text-[#f0f4f0] mb-1">Create a room</div>
        <p className="text-sm text-[#c8d8c8] mb-6">Give it a name, pick a mood, share the link.</p>

        {/* Room name */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">Room name</label>
          <input
            className="w-full bg-[#141814] border border-white/[.07] rounded-[10px] px-3.5 py-[11px] text-[#f0f4f0] text-sm outline-none transition-all placeholder:text-[#5a6b5a] focus:border-[#b8f724] focus:shadow-[0_0_0_3px_rgba(184,247,36,0.08)]"
            placeholder="e.g. Late Night Lofi"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
          />
        </div>

        {/* Mood picker */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-2">Pick a mood</label>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map(m => (
              <button key={m.label} onClick={() => setMood(m.label)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${mood === m.label
                  ? "border-[#b8f724] text-[#f0f4f0]"
                  : "border-white/[.07] text-[#c8d8c8] hover:border-white/20"}`}
                style={mood === m.label ? {background:"rgba(184,247,36,0.08)"} : {background:"#141814"}}>
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Public / Private toggle */}
        <div className="flex items-center justify-between mb-6 bg-[#141814] border border-white/[.07] rounded-xl px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-[#f0f4f0]">{isPublic ? "Public room" : "Private room"}</div>
            <div className="text-xs text-[#c8d8c8]">{isPublic ? "Anyone can find and join" : "Only people with the link can join"}</div>
          </div>
          <div onClick={() => setIsPublic(p => !p)}
            className="w-11 h-6 rounded-full cursor-pointer transition-all relative flex-shrink-0"
            style={{background: isPublic ? "#b8f724" : "#1e231e", border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${isPublic ? "left-5 bg-[#080a08]" : "left-0.5 bg-[#5a6b5a]"}`} />
          </div>
        </div>

        {/* Create button */}
        <button onClick={handleCreate} disabled={!name.trim() || !mood}
          className="w-full py-[13px] bg-[#b8f724] text-[#080a08] rounded-[10px] font-cab font-black text-[15px] cursor-pointer transition-all hover:bg-[#d4ff4d] hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          style={{boxShadow:"0 4px 18px rgba(184,247,36,0.3)"}}>
          Create Room →
        </button>
      </div>
    </div>
  );
}
