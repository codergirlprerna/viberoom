// src/pages/Login.jsx
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');
  body { font-family: 'Instrument Sans', sans-serif; background: #080a08; color: #f0f4f0; }
  .font-cab { font-family: 'Cabinet Grotesk', sans-serif; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width:18px; height:18px; border:2px solid rgba(8,10,8,0.3); border-top-color:#080a08; border-radius:9999px; animation:spin 0.7s linear infinite; }
`;

const inputCls = (hasError) =>
  `w-full bg-[#0e110e] border rounded-[10px] px-3.5 py-[11px] text-[#f0f4f0] text-sm outline-none transition-all placeholder:text-[#5a6b5a] focus:border-[#b8f724] focus:shadow-[0_0_0_3px_rgba(184,247,36,0.08)] ${hasError ? "border-[#ef4444]" : "border-white/[.07]"}`;

function friendlyError(code) {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":     return "Incorrect email or password.";
    case "auth/invalid-email":          return "That doesn't look like a valid email.";
    case "auth/too-many-requests":      return "Too many attempts. Please wait a moment.";
    case "auth/popup-closed-by-user":   return "Google sign-in was cancelled.";
    case "auth/network-request-failed": return "Network error. Check your connection.";
    default:                            return "Something went wrong. Please try again.";
  }
}

export default function Login({ onSignup, onSuccess }) {
  const [form,      setForm]      = useState({ email:"", password:"" });
  const [errors,    setErrors]    = useState({});
  const [showPw,    setShowPw]    = useState(false);
  const [remember,  setRemember]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);
  const [fbError,   setFbError]   = useState("");
  const [resetSent, setResetSent] = useState(false);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: "" }));
    if (fbError) setFbError("");
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())  e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)      e.password = "Password is required";
    return e;
  };

  // ── Email/Password login via Firebase ──
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      onSuccess?.();
    } catch (err) {
      setFbError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Google login via Firebase ──
  const handleGoogle = async () => {
    setGLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess?.();
    } catch (err) {
      setFbError(friendlyError(err.code));
    } finally {
      setGLoading(false);
    }
  };

  // ── Forgot password ──
  const handleForgotPassword = async () => {
    if (!form.email.trim()) {
      setErrors(e => ({ ...e, email: "Enter your email first to reset password" }));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, form.email);
      setResetSent(true);
    } catch (err) {
      setFbError(friendlyError(err.code));
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#080a08] text-[#f0f4f0]">

        {/* ── Left: Branding ── */}
        <div className="hidden md:flex flex-col p-10 bg-[#0e110e] border-r border-white/[.07] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[.03] pointer-events-none"
            style={{backgroundImage:"linear-gradient(#b8f724 1px,transparent 1px),linear-gradient(90deg,#b8f724 1px,transparent 1px)",backgroundSize:"40px 40px"}} />
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{background:"radial-gradient(circle,rgba(184,247,36,0.06) 0%,transparent 70%)"}} />

          <a href="/" className="font-cab font-black text-xl flex items-center gap-2.5 no-underline text-[#f0f4f0] relative">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-[17px]"
              style={{boxShadow:"0 0 18px rgba(184,247,36,0.3)"}}>V</div>
            Viberoom
          </a>

          <div className="flex-1 flex flex-col justify-center relative">
            <h2 className="font-cab font-black text-[40px] leading-[1.05] tracking-[-1.5px] mb-4 text-[#f0f4f0]">
              Good to have<br />you <span className="text-[#b8f724]">back.</span>
            </h2>
            <p className="text-[15px] text-[#c8d8c8] leading-[1.7] max-w-[360px] mb-10">
              Your rooms, your music, your people — all right where you left them.
            </p>

            {/* Stat pills */}
            <div className="flex gap-2.5 flex-wrap mb-8">
              {[["100%","free"],["5","mood rooms"],["∞","invites"]].map(([num, label], i) => (
                <div key={i} className="flex items-center gap-2 bg-[#141814] border border-white/[.07] rounded-full px-4 py-1.5 text-[13px] text-[#f0f4f0]">
                  <strong className="font-cab font-black text-[#b8f724]">{num}</strong> {label}
                </div>
              ))}
            </div>

            {/* Quote card */}
            <div className="bg-[#141814] border border-white/[.07] rounded-2xl p-[22px]">
              <p className="text-[15px] text-[#f0f4f0] leading-[1.6] mb-3.5 italic">
                <span className="text-[#b8f724] text-[20px] not-italic">"</span>
                We listen to music together every night now. It actually feels like we're in the same room.
                <span className="text-[#b8f724] text-[20px] not-italic">"</span>
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-[34px] h-[34px] rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold text-[#080a08]"
                  style={{background:"linear-gradient(135deg,#b8f724,#10b981)"}}>Z</div>
                <div>
                  <div className="text-[13px] font-semibold text-[#f0f4f0]">Zara K.</div>
                  <div className="text-[11px] text-[#c8d8c8]">Viberoom user</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="flex flex-col items-center justify-center px-6 md:px-12 py-10 overflow-y-auto">
          <div className="w-full max-w-[380px]">

            <div className="flex md:hidden items-center gap-2 font-cab font-black text-[18px] text-[#f0f4f0] mb-8">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-[17px]">V</div>
              Viberoom
            </div>

            <div className="font-cab font-black text-[28px] tracking-[-0.5px] text-[#f0f4f0] mb-1.5">Welcome back</div>
            <p className="text-sm text-[#c8d8c8] mb-8">
              Don't have an account?{" "}
              <a href="#" className="text-[#b8f724] font-semibold no-underline hover:underline"
                onClick={e => { e.preventDefault(); onSignup?.(); }}>Sign up free →</a>
            </p>

            {/* Firebase error */}
            {fbError && (
              <div className="flex items-center gap-2 rounded-[10px] px-3.5 py-[11px] text-[13px] text-[#fca5a5] mb-5"
                style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)"}}>
                ⚠️ {fbError}
              </div>
            )}

            {/* Password reset success */}
            {resetSent && (
              <div className="flex items-center gap-2 rounded-[10px] px-3.5 py-[11px] text-[13px] text-[#b8f724] mb-5"
                style={{background:"rgba(184,247,36,0.08)",border:"1px solid rgba(184,247,36,0.2)"}}>
                ✓ Reset email sent! Check your inbox.
              </div>
            )}

            {/* Google */}
            <button onClick={handleGoogle} disabled={gLoading}
              className="w-full py-[11px] bg-[#0e110e] text-[#f0f4f0] border border-white/[.07] rounded-[10px] text-sm font-semibold cursor-pointer flex items-center justify-center gap-2.5 hover:bg-[#141814] hover:border-white/[.15] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {gLoading
                ? <div className="spinner" style={{borderTopColor:"#f0f4f0"}} />
                : <span className="text-[18px] font-bold">G</span>}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-5 text-xs text-[#5a6b5a]">
              <div className="flex-1 h-px bg-white/[.07]" /><span>or log in with email</span><div className="flex-1 h-px bg-white/[.07]" />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">Email</label>
              <input type="email" className={inputCls(errors.email)}
                placeholder="rohan@example.com" value={form.email}
                onChange={e => set("email", e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              {errors.email && <p className="text-xs text-[#ef4444] mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px]">Password</label>
                <button type="button" onClick={handleForgotPassword}
                  className="text-xs text-[#b8f724] font-semibold bg-transparent border-none cursor-pointer hover:underline p-0">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} className={`${inputCls(errors.password)} pr-11`}
                  placeholder="Your password" value={form.password}
                  onChange={e => set("password", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#c8d8c8] cursor-pointer text-base hover:text-[#f0f4f0] p-0">
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#ef4444] mt-1">{errors.password}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5 mb-6 cursor-pointer" onClick={() => setRemember(r => !r)}>
              <div className="w-[18px] h-[18px] rounded-[5px] flex-shrink-0 flex items-center justify-center transition-all"
                style={{border:`1.5px solid ${remember ? "#b8f724" : "rgba(255,255,255,0.07)"}`, background: remember ? "#b8f724" : "#0e110e"}}>
                {remember && <span className="text-[#080a08] text-[11px] font-black leading-none">✓</span>}
              </div>
              <span className="text-[13px] text-[#c8d8c8]">Keep me logged in</span>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-[13px] bg-[#b8f724] text-[#080a08] rounded-[10px] font-cab font-black text-[15px] cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[#d4ff4d] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mb-6"
              style={{boxShadow:"0 4px 18px rgba(184,247,36,0.3)"}}>
              {loading ? <><div className="spinner" /> Logging in...</> : "Log In →"}
            </button>

            <div className="h-px bg-white/[.07] mb-6" />

            <p className="text-[13px] text-[#c8d8c8] text-center">
              New here?{" "}
              <a href="#" className="text-[#b8f724] font-semibold no-underline hover:underline"
                onClick={e => { e.preventDefault(); onSignup?.(); }}>
                Create a free account →
              </a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
