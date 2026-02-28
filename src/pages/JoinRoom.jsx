// src/pages/JoinRoom.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roomAPI } from "../services/api";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');
  body { font-family:'Instrument Sans',sans-serif; background:#080a08; color:#f0f4f0; }
  .font-cab { font-family:'Cabinet Grotesk',sans-serif; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .spinner { width:18px; height:18px; border:2px solid rgba(8,10,8,0.3); border-top-color:#080a08; border-radius:9999px; animation:spin 0.7s linear infinite; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation:fadeUp 0.5s ease both; }
`;

const MOODS = {
  Chill: { icon:"🌊", color:"#06b6d4" },
  Party: { icon:"🎉", color:"#f59e0b" },
  Focus: { icon:"🧠", color:"#b8f724" },
  Sad:   { icon:"🌧️", color:"#93c5fd" },
  Hype:  { icon:"💪", color:"#f87171" },
  Indie: { icon:"🎸", color:"#34d399" },
};

export default function JoinRoom() {
  const { roomId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [guestName, setGuestName] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [roomInfo,  setRoomInfo]  = useState(null);

  // Fetch real room info
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await roomAPI.get(roomId);
        setRoomInfo(res.data);
      } catch {
        // Room not found or backend down — show generic info
        setRoomInfo({ name: "Viberoom Room", mood: "Chill", hostName: "Host", listenerCount: 0 });
      }
    };
    fetchRoom();
  }, [roomId]);

  // If logged in user, go straight to room
  useEffect(() => {
    if (user) {
      navigate(`/room/${roomId}`, { replace: true });
    }
  }, [user, roomId, navigate]);

  const joinAsGuest = async () => {
    if (!guestName.trim()) { setError("Please enter your name"); return; }
    setLoading(true);
    // Save guest name so RoomRoute lets them through
    sessionStorage.setItem("guestName", guestName.trim());
    sessionStorage.setItem("guestRoomId", roomId);
    navigate(`/room/${roomId}`);
  };

  const mood = MOODS[roomInfo?.mood] || MOODS.Chill;

  return (
    <>
      <style>{globalStyles}</style>
      <div className="min-h-screen bg-[#080a08] text-[#f0f4f0] flex flex-col items-center justify-center px-5 relative overflow-hidden">

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
          style={{background:"radial-gradient(ellipse,rgba(184,247,36,0.06) 0%,transparent 70%)"}} />

        <div className="w-full max-w-[400px] relative">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-10 fade-up">
            <div className="w-8 h-8 rounded-lg bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-base font-cab"
              style={{boxShadow:"0 0 16px rgba(184,247,36,0.3)"}}>V</div>
            <span className="font-cab font-black text-xl text-[#f0f4f0]">Viberoom</span>
          </div>

          {/* Room info card */}
          <div className="bg-[#0e110e] border border-white/[.07] rounded-2xl p-6 mb-6 fade-up" style={{animationDelay:"0.1s"}}>
            {roomInfo ? (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{background:`${mood.color}18`}}>{mood.icon}</div>
                <div>
                  <div className="font-cab font-black text-[18px] text-[#f0f4f0]">{roomInfo.name}</div>
                  <div className="text-xs text-[#c8d8c8]">
                    Hosted by <span className="text-[#f0f4f0] font-semibold">{roomInfo.hostName || "Host"}</span>
                    {" · "}{roomInfo.listenerCount || 0} listening
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#141814] animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-[#141814] rounded animate-pulse mb-2 w-3/4" />
                  <div className="h-3 bg-[#141814] rounded animate-pulse w-1/2" />
                </div>
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{background:"rgba(184,247,36,0.1)", border:"1px solid rgba(184,247,36,0.2)", color:"#b8f724"}}>
              <div style={{width:6,height:6,borderRadius:"9999px",background:"#b8f724"}} />
              LIVE NOW
            </div>
          </div>

          {/* Guest join form */}
          <div className="bg-[#0e110e] border border-white/[.07] rounded-2xl p-6 fade-up" style={{animationDelay:"0.2s"}}>
            <div className="font-cab font-black text-[20px] text-[#f0f4f0] mb-1">Join as guest</div>
            <p className="text-sm text-[#c8d8c8] mb-5">No account needed. Just enter your name.</p>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">Your name</label>
              <input
                className={`w-full bg-[#141814] border rounded-[10px] px-3.5 py-[11px] text-[#f0f4f0] text-sm outline-none transition-all placeholder:text-[#5a6b5a] focus:border-[#b8f724] focus:shadow-[0_0_0_3px_rgba(184,247,36,0.08)] ${error ? "border-[#ef4444]" : "border-white/[.07]"}`}
                placeholder="e.g. Alex"
                value={guestName}
                autoFocus
                onChange={e => { setGuestName(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && joinAsGuest()}
                maxLength={30}
              />
              {error && <p className="text-xs text-[#ef4444] mt-1">{error}</p>}
            </div>

            <button onClick={joinAsGuest} disabled={loading || !guestName.trim()}
              className="w-full py-[13px] bg-[#b8f724] text-[#080a08] rounded-[10px] font-cab font-black text-[15px] cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[#d4ff4d] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mb-4"
              style={{boxShadow:"0 4px 18px rgba(184,247,36,0.3)"}}>
              {loading ? <><div className="spinner" /> Joining...</> : "Join Room →"}
            </button>

            <div className="flex items-center gap-3 my-4 text-xs text-[#5a6b5a]">
              <div className="flex-1 h-px bg-white/[.07]" />
              <span>or</span>
              <div className="flex-1 h-px bg-white/[.07]" />
            </div>

            <p className="text-[13px] text-[#c8d8c8] text-center">
              Have an account?{" "}
              <a href="/login" className="text-[#b8f724] font-semibold no-underline hover:underline">Log in →</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
