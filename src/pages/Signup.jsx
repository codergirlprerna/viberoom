// src/pages/Signup.jsx
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');
  body { font-family: 'Instrument Sans', sans-serif; background: #080a08; color: #f0f4f0; }
  .font-cab { font-family: 'Cabinet Grotesk', sans-serif; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width:18px; height:18px; border:2px solid rgba(8,10,8,0.3); border-top-color:#080a08; border-radius:9999px; animation:spin 0.7s linear infinite; }
`;

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", level: "" };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  const levels = ["", "weak", "fair", "good", "strong"];
  const labels = ["", "Weak",  "Fair", "Good", "Strong"];
  return { score, label: labels[score], level: levels[score] };
}

const strengthBar = { weak:"bg-[#ef4444]", fair:"bg-[#f59e0b]", good:"bg-[#b8f724]", strong:"bg-[#b8f724]" };
const strengthTxt = { weak:"text-[#ef4444]", fair:"text-[#f59e0b]", good:"text-[#b8f724]", strong:"text-[#b8f724]" };

const leftFeatures = [
  { icon:"🔗", title:"Invite without an account", desc:"Your friends join with just a link — no signup needed on their end." },
  { icon:"🎭", title:"Mood rooms",                desc:"Every room has a vibe. Pick yours before you even join." },
  { icon:"⚡", title:"Floating reactions",         desc:"Send emojis that float across everyone's screen in real time." },
];

const inputCls = (hasError) =>
  `w-full bg-[#0e110e] border rounded-[10px] px-3.5 py-[11px] text-[#f0f4f0] text-sm outline-none transition-all placeholder:text-[#5a6b5a] focus:border-[#b8f724] focus:shadow-[0_0_0_3px_rgba(184,247,36,0.08)] ${hasError ? "border-[#ef4444]" : "border-white/[.07]"}`;

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use":   return "This email is already registered. Try logging in.";
    case "auth/invalid-email":          return "That doesn't look like a valid email.";
    case "auth/weak-password":          return "Password is too weak. Use at least 8 characters.";
    case "auth/popup-closed-by-user":   return "Google sign-in was cancelled.";
    case "auth/network-request-failed": return "Network error. Check your connection.";
    default:                            return "Something went wrong. Please try again.";
  }
}

export default function Signup({ onLogin, onSuccess }) {
  const [form,    setForm]    = useState({ firstName:"", lastName:"", email:"", password:"", confirmPassword:"" });
  const [errors,  setErrors]  = useState({});
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [agreed,  setAgreed]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading,setGLoading]= useState(false);
  const [fbError, setFbError] = useState("");

  const pwStrength = getPasswordStrength(form.password);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: "" }));
    if (fbError) setFbError("");
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim())  e.firstName = "First name is required";
    if (!form.lastName.trim())   e.lastName  = "Last name is required";
    if (!form.email.trim())      e.email     = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)          e.password  = "Password is required";
    else if (form.password.length < 8) e.password = "Must be at least 8 characters";
    if (!form.confirmPassword)   e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!agreed) e.agreed = "You must accept the terms";
    return e;
  };

  // ── Email/Password signup via Firebase ──
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(result.user, {
        displayName: `${form.firstName} ${form.lastName}`,
      });
      onSuccess?.();
    } catch (err) {
      setFbError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Google signup via Firebase ──
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

  return (
    <>
      <style>{globalStyles}</style>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#080a08] text-[#f0f4f0]">

        {/* ── Left: Branding ── */}
        <div className="hidden md:flex flex-col p-10 bg-[#0e110e] border-r border-white/[.07] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[.03] pointer-events-none"
            style={{backgroundImage:"linear-gradient(#b8f724 1px,transparent 1px),linear-gradient(90deg,#b8f724 1px,transparent 1px)",backgroundSize:"40px 40px"}} />
          <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{background:"radial-gradient(circle,rgba(184,247,36,0.07) 0%,transparent 70%)"}} />

          <a href="/" className="font-cab font-black text-xl flex items-center gap-2.5 no-underline text-[#f0f4f0] relative">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-[17px]"
              style={{boxShadow:"0 0 18px rgba(184,247,36,0.3)"}}>V</div>
            Viberoom
          </a>

          <div className="flex-1 flex flex-col justify-center relative">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold text-[#b8f724] mb-6 w-fit"
              style={{background:"rgba(184,247,36,0.08)",border:"1px solid rgba(184,247,36,0.18)"}}>✦ Free forever</div>
            <h2 className="font-cab font-black text-[40px] leading-[1.05] tracking-[-1.5px] mb-4 text-[#f0f4f0]">
              Music hits different<br /><span className="text-[#b8f724]">with your people.</span>
            </h2>
            <p className="text-[15px] text-[#c8d8c8] leading-[1.7] max-w-[380px] mb-10">
              Create a room, drop a song, share a link. Your friends are in — no setup, no friction, just music.
            </p>
            <div className="flex flex-col gap-3.5">
              {leftFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#141814] border border-white/[.07] rounded-xl p-4">
                  <div className="text-[20px] flex-shrink-0 mt-px">{f.icon}</div>
                  <div>
                    <div className="font-cab font-black text-[14px] text-[#f0f4f0] mb-0.5">{f.title}</div>
                    <div className="text-xs text-[#c8d8c8] leading-[1.5]">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="flex flex-col items-center justify-center px-6 md:px-12 py-10 overflow-y-auto">
          <div className="w-full max-w-[400px]">

            <div className="flex md:hidden items-center gap-2 font-cab font-black text-[18px] text-[#f0f4f0] mb-8">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-[17px]">V</div>
              Viberoom
            </div>

            <div className="font-cab font-black text-[28px] tracking-[-0.5px] text-[#f0f4f0] mb-1.5">Create your account</div>
            <p className="text-sm text-[#c8d8c8] mb-8">
              Already have one?{" "}
              <a href="#" className="text-[#b8f724] font-semibold no-underline hover:underline"
                onClick={e => { e.preventDefault(); onLogin?.(); }}>Log in →</a>
            </p>

            {/* Firebase error banner */}
            {fbError && (
              <div className="flex items-center gap-2 rounded-[10px] px-3.5 py-[11px] text-[13px] text-[#fca5a5] mb-5"
                style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)"}}>
                ⚠️ {fbError}
              </div>
            )}

            {/* Google button */}
            <button onClick={handleGoogle} disabled={gLoading}
              className="w-full py-[11px] bg-[#0e110e] text-[#f0f4f0] border border-white/[.07] rounded-[10px] text-sm font-semibold cursor-pointer flex items-center justify-center gap-2.5 hover:bg-[#141814] hover:border-white/[.15] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {gLoading
                ? <div className="spinner" style={{borderTopColor:"#f0f4f0"}} />
                : <span className="text-[18px] font-bold">G</span>}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-5 text-xs text-[#5a6b5a]">
              <div className="flex-1 h-px bg-white/[.07]" /><span>or sign up with email</span><div className="flex-1 h-px bg-white/[.07]" />
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">First name</label>
                <input className={inputCls(errors.firstName)} placeholder="Rohan"
                  value={form.firstName} onChange={e => set("firstName", e.target.value)} />
                {errors.firstName && <p className="text-xs text-[#ef4444] mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">Last name</label>
                <input className={inputCls(errors.lastName)} placeholder="Mehta"
                  value={form.lastName} onChange={e => set("lastName", e.target.value)} />
                {errors.lastName && <p className="text-xs text-[#ef4444] mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">Email</label>
              <input type="email" className={inputCls(errors.email)} placeholder="rohan@example.com"
                value={form.email} onChange={e => set("email", e.target.value)} />
              {errors.email && <p className="text-xs text-[#ef4444] mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} className={`${inputCls(errors.password)} pr-11`}
                  placeholder="Min. 8 characters" value={form.password}
                  onChange={e => set("password", e.target.value)} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#c8d8c8] cursor-pointer text-base hover:text-[#f0f4f0] p-0">
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${i <= pwStrength.score ? strengthBar[pwStrength.level] : "bg-[#141814]"}`} />
                    ))}
                  </div>
                  <span className={`text-[11px] ${strengthTxt[pwStrength.level] || "text-[#c8d8c8]"}`}>{pwStrength.label}</span>
                </div>
              )}
              {errors.password && <p className="text-xs text-[#ef4444] mt-1">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">Confirm password</label>
              <div className="relative">
                <input type={showCpw ? "text" : "password"} className={`${inputCls(errors.confirmPassword)} pr-11`}
                  placeholder="Repeat your password" value={form.confirmPassword}
                  onChange={e => set("confirmPassword", e.target.value)} />
                <button type="button" onClick={() => setShowCpw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#c8d8c8] cursor-pointer text-base hover:text-[#f0f4f0] p-0">
                  {showCpw ? "🙈" : "👁"}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-[#ef4444] mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5 mb-2 cursor-pointer" onClick={() => setAgreed(a => !a)}>
              <div className="w-[18px] h-[18px] rounded-[5px] flex-shrink-0 flex items-center justify-center mt-px transition-all"
                style={{border:`1.5px solid ${agreed ? "#b8f724" : "rgba(255,255,255,0.07)"}`, background: agreed ? "#b8f724" : "#0e110e"}}>
                {agreed && <span className="text-[#080a08] text-[11px] font-black leading-none">✓</span>}
              </div>
              <span className="text-[13px] text-[#c8d8c8] leading-[1.5]">
                I agree to Viberoom's{" "}
                <a href="#" className="text-[#b8f724] no-underline hover:underline" onClick={e => e.stopPropagation()}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-[#b8f724] no-underline hover:underline" onClick={e => e.stopPropagation()}>Privacy Policy</a>
              </span>
            </div>
            {errors.agreed && <p className="text-xs text-[#ef4444] mb-3">{errors.agreed}</p>}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full mt-4 py-[13px] bg-[#b8f724] text-[#080a08] rounded-[10px] font-cab font-black text-[15px] cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[#d4ff4d] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{boxShadow:"0 4px 18px rgba(184,247,36,0.3)"}}>
              {loading ? <><div className="spinner" /> Creating account...</> : "Create Account →"}
            </button>

          </div>
        </div>
      </div>
    </>
  );
}
