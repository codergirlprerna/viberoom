// src/pages/NotFound.jsx
import { useNavigate } from "react-router-dom";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');
  body { font-family:'Instrument Sans',sans-serif; background:#080a08; color:#f0f4f0; }
  .font-cab { font-family:'Cabinet Grotesk',sans-serif; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation:fadeUp 0.5s ease both; }
`;

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <style>{globalStyles}</style>
      <div className="min-h-screen bg-[#080a08] text-[#f0f4f0] flex flex-col items-center justify-center px-5 text-center relative overflow-hidden">

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
          style={{background:"radial-gradient(ellipse,rgba(184,247,36,0.05) 0%,transparent 70%)"}} />

        <div className="relative">
          {/* Big 404 */}
          <div className="font-cab font-black text-[120px] md:text-[180px] leading-none text-[#f0f4f0] fade-up"
            style={{opacity:0.06}}>
            404
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center fade-up" style={{animationDelay:"0.1s"}}>
            <div className="text-5xl mb-4">🎵</div>
            <div className="font-cab font-black text-[28px] md:text-[36px] text-[#f0f4f0] mb-3">
              Room not found
            </div>
            <p className="text-[#c8d8c8] text-base max-w-[320px] leading-relaxed mb-8">
              This room may have ended or the link is broken. Check with whoever sent it to you.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-[#b8f724] text-[#080a08] rounded-xl font-cab font-black text-sm cursor-pointer hover:bg-[#d4ff4d] hover:-translate-y-px transition-all"
                style={{boxShadow:"0 4px 16px rgba(184,247,36,0.3)"}}>
                Go to Dashboard
              </button>
              <button onClick={() => navigate("/")}
                className="px-6 py-3 bg-transparent text-[#f0f4f0] rounded-xl font-cab font-black text-sm cursor-pointer border border-white/[.07] hover:border-white/20 transition-all">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
