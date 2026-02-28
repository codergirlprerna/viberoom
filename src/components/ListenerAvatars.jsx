// src/components/ListenerAvatars.jsx

export default function ListenerAvatars({ listeners = [], max = 4, showNames = false }) {
  const visible = listeners.slice(0, max);
  const extra   = listeners.length - max;

  return (
    <div className={`flex items-center ${showNames ? "gap-3 flex-wrap" : "-space-x-2"}`}>
      {visible.map(l => (
        <div key={l.id} className={`relative flex-shrink-0 ${showNames ? "flex flex-col items-center gap-1" : ""}`}>
          <div
            title={l.name}
            className={`rounded-full flex items-center justify-center font-black text-[#080a08] ${showNames ? "w-8 h-8 text-[11px]" : "w-7 h-7 text-[10px] border-2 border-[#080a08]"}`}
            style={{background: l.color}}>
            {l.avatar}
          </div>
          {/* Host star badge */}
          {l.isHost && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#b8f724] flex items-center justify-center text-[7px] text-[#080a08] font-black">★</div>
          )}
          {showNames && (
            <span className="text-[9px] text-[#c8d8c8] max-w-[36px] truncate text-center">{l.name}</span>
          )}
        </div>
      ))}

      {/* +N overflow */}
      {extra > 0 && (
        <div className={`rounded-full flex items-center justify-center text-[10px] font-bold text-[#c8d8c8] bg-[#141814] border border-white/[.07] flex-shrink-0 ${showNames ? "w-8 h-8" : "w-7 h-7 border-2 border-[#080a08]"}`}>
          +{extra}
        </div>
      )}
    </div>
  );
}
