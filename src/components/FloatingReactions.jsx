// src/components/FloatingReactions.jsx
import { useEffect } from "react";

const globalStyles = `
  @keyframes floatUp {
    0%   { opacity:1; transform:translateY(0) scale(1); }
    80%  { opacity:1; }
    100% { opacity:0; transform:translateY(-180px) scale(1.4); }
  }
  .float-reaction {
    position:absolute;
    animation:floatUp 2.4s ease-out forwards;
    pointer-events:none;
    font-size:28px;
    z-index:50;
  }
`;

function SingleReaction({ emoji, x, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="float-reaction" style={{left: x, bottom: 60}}>{emoji}</div>
  );
}

export default function FloatingReactions({ reactions = [], onRemove }) {
  return (
    <>
      <style>{globalStyles}</style>
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {reactions.map(r => (
          <SingleReaction
            key={r.id}
            emoji={r.emoji}
            x={r.x}
            onDone={() => onRemove(r.id)}
          />
        ))}
      </div>
    </>
  );
}
