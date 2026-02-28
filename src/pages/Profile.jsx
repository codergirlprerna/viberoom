// src/pages/Profile.jsx
import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');
  body { font-family:'Instrument Sans',sans-serif; background:#080a08; color:#f0f4f0; }
  .font-cab { font-family:'Cabinet Grotesk',sans-serif; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .spinner { width:18px; height:18px; border:2px solid rgba(8,10,8,0.3); border-top-color:#080a08; border-radius:9999px; animation:spin 0.7s linear infinite; }
`;

const AVATAR_COLORS = ["#b8f724","#06b6d4","#f59e0b","#34d399","#f87171","#a78bfa","#fb923c","#38bdf8"];

export default function Profile() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [name,     setName]     = useState(user?.displayName || "");
  const [color,    setColor]    = useState(AVATAR_COLORS[0]);
  const [loading,  setLoading]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");

  const initial = (name || user?.email || "?")[0].toUpperCase();

  const handleSave = async () => {
    if (!name.trim()) { setError("Name can't be empty"); return; }
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to update. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div className="min-h-screen bg-[#080a08] text-[#f0f4f0]">

        {/* Top bar */}
        <div className="h-14 bg-[#0e110e] border-b border-white/[.07] flex items-center px-5 gap-3">
          <button onClick={() => navigate("/dashboard")}
            className="text-[#c8d8c8] hover:text-[#f0f4f0] bg-transparent border-none cursor-pointer text-sm font-semibold transition-colors">
            ← Back
          </button>
          <div className="font-cab font-black text-base text-[#f0f4f0]">Profile</div>
        </div>

        <div className="max-w-[480px] mx-auto px-5 py-10">

          {/* Avatar */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-cab font-black text-3xl text-[#080a08] mb-4"
              style={{background: color, boxShadow:`0 0 24px ${color}40`}}>
              {initial}
            </div>
            {/* Color picker */}
            <div className="flex gap-2 flex-wrap justify-center">
              {AVATAR_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full cursor-pointer border-2 transition-all"
                  style={{
                    background: c,
                    borderColor: color === c ? "#f0f4f0" : "transparent",
                    boxShadow: color === c ? `0 0 0 2px #080a08, 0 0 0 4px ${c}` : "none"
                  }} />
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#0e110e] border border-white/[.07] rounded-2xl p-6">
            <div className="font-cab font-black text-[20px] text-[#f0f4f0] mb-5">Your info</div>

            {/* Display name */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">Display name</label>
              <input
                className="w-full bg-[#141814] border border-white/[.07] rounded-[10px] px-3.5 py-[11px] text-[#f0f4f0] text-sm outline-none transition-all placeholder:text-[#5a6b5a] focus:border-[#b8f724] focus:shadow-[0_0_0_3px_rgba(184,247,36,0.08)]"
                value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                placeholder="Your name"
                maxLength={40}
              />
              {error && <p className="text-xs text-[#ef4444] mt-1">{error}</p>}
            </div>

            {/* Email (read only) */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">Email</label>
              <div className="w-full bg-[#141814] border border-white/[.07] rounded-[10px] px-3.5 py-[11px] text-[#c8d8c8] text-sm">
                {user?.email || "—"}
              </div>
            </div>

            {/* Save */}
            {saved ? (
              <div className="w-full py-[13px] rounded-[10px] text-center text-sm font-semibold text-[#b8f724]"
                style={{background:"rgba(184,247,36,0.08)", border:"1px solid rgba(184,247,36,0.2)"}}>
                ✓ Saved!
              </div>
            ) : (
              <button onClick={handleSave} disabled={loading}
                className="w-full py-[13px] bg-[#b8f724] text-[#080a08] rounded-[10px] font-cab font-black text-[15px] cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[#d4ff4d] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{boxShadow:"0 4px 18px rgba(184,247,36,0.3)"}}>
                {loading ? <><div className="spinner" /> Saving...</> : "Save changes"}
              </button>
            )}
          </div>

          {/* Account info */}
          <div className="mt-4 bg-[#0e110e] border border-white/[.07] rounded-2xl p-6">
            <div className="font-cab font-black text-[16px] text-[#f0f4f0] mb-4">Account</div>
            <div className="flex items-center justify-between py-3 border-b border-white/[.07]">
              <span className="text-sm text-[#c8d8c8]">Joined via</span>
              <span className="text-sm font-semibold text-[#f0f4f0]">
                {user?.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-sm text-[#c8d8c8]">Account type</span>
              <span className="text-sm font-semibold text-[#b8f724]">Free</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
