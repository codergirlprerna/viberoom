// src/components/MusicPlayer.jsx
const globalStyles = `
  input[type=range] { -webkit-appearance:none; appearance:none; background:transparent; cursor:pointer; }
  input[type=range]::-webkit-slider-runnable-track { height:4px; border-radius:4px; background:rgba(255,255,255,0.1); }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#b8f724; margin-top:-5px; box-shadow:0 0 8px rgba(184,247,36,0.5); }
  input[type=range]::-moz-range-track { height:4px; border-radius:4px; background:rgba(255,255,255,0.1); }
  input[type=range]::-moz-range-thumb { width:14px; height:14px; border-radius:50%; background:#b8f724; border:none; }
  @keyframes wv { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
  .wbar { width:3px; border-radius:3px; background:#b8f724; animation:wv 0.9s ease-in-out infinite; }
`;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const MOODS = {
  Chill: { icon:"🌊", color:"#06b6d4" },
  Party: { icon:"🎉", color:"#f59e0b" },
  Focus: { icon:"🧠", color:"#b8f724" },
  Sad:   { icon:"🌧️", color:"#93c5fd" },
  Hype:  { icon:"💪", color:"#f87171" },
  Indie: { icon:"🎸", color:"#34d399" },
};

export default function MusicPlayer({
  currentSong,
  isPlaying,
  progress,       // 0–100
  duration,       // seconds
  volume,
  isMuted,
  mood,
  onPlayPause,
  onSeek,
  onPrev,
  onNext,
  onVolumeChange,
  onMuteToggle,
}) {
  const moodInfo   = MOODS[mood] || MOODS.Chill;
  const currentTime = Math.floor((progress / 100) * duration);

  return (
    <>
      <style>{globalStyles}</style>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{background:"radial-gradient(ellipse 60% 50% at 50% 50%, rgba(184,247,36,0.04) 0%, transparent 70%)"}} />

        {/* Album art */}
        <div className="relative mb-8">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl flex items-center justify-center text-[80px] md:text-[100px] relative overflow-hidden"
            style={{
              background:"linear-gradient(135deg,#0e110e,#141814)",
              border:"1px solid rgba(255,255,255,0.07)",
              boxShadow:"0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,247,36,0.05)"
            }}>
            🎵
          </div>
          {/* Mood badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap"
            style={{background:"#0e110e", border:"1px solid rgba(255,255,255,0.07)", color: moodInfo.color}}>
            {moodInfo.icon} {mood}
          </div>
        </div>

        {/* Song info */}
        <div className="text-center mb-6">
          <div className="font-cab font-black text-[24px] md:text-[28px] text-[#f0f4f0] mb-1">
            {currentSong?.title || "No song playing"}
          </div>
          <div className="text-[#c8d8c8] text-sm">{currentSong?.artist || "—"}</div>
        </div>

        {/* Waveform */}
        <div className={`flex items-center gap-[3px] mb-6 h-8 transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-30"}`}>
          {[6,10,16,12,8,14,18,11,7,13,17,9,15,10,6].map((h, i) => (
            <div key={i} className="wbar" style={{height:h, animationDelay:`${i * 0.07}s`}} />
          ))}
        </div>

        {/* Seek bar */}
        <div className="w-full max-w-[480px] mb-3">
          <input type="range" min="0" max="100" value={progress}
            onChange={e => onSeek?.(Number(e.target.value))}
            className="w-full" />
          <div className="flex justify-between text-[11px] text-[#c8d8c8] mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5 mb-6">
          <button onClick={onPrev}
            className="w-10 h-10 flex items-center justify-center text-[#c8d8c8] hover:text-[#f0f4f0] bg-transparent border-none cursor-pointer text-xl transition-colors">
            ⏮
          </button>
          <button onClick={onPlayPause}
            className="w-14 h-14 rounded-full flex items-center justify-center text-[#080a08] text-2xl cursor-pointer transition-all hover:scale-105 border-none"
            style={{background:"#b8f724", boxShadow:"0 4px 20px rgba(184,247,36,0.4)"}}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={onNext}
            className="w-10 h-10 flex items-center justify-center text-[#c8d8c8] hover:text-[#f0f4f0] bg-transparent border-none cursor-pointer text-xl transition-colors">
            ⏭
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-full max-w-[200px]">
          <button onClick={onMuteToggle}
            className="text-[#c8d8c8] hover:text-[#f0f4f0] bg-transparent border-none cursor-pointer text-base transition-colors flex-shrink-0">
            {isMuted || volume === 0 ? "🔇" : volume < 50 ? "🔉" : "🔊"}
          </button>
          <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
            onChange={e => onVolumeChange?.(Number(e.target.value))}
            className="flex-1" />
        </div>
      </div>
    </>
  );
}
