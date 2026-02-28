import { useState, useEffect } from "react";

/* ------------------------------------------------------------------
   One tiny <style> block ONLY for things Tailwind cannot do:
   - CSS custom property animations (keyframes)
   - CSS ::before/::after pseudo elements
   - mask-image (not in Tailwind core)
   - font import
   Everything else is pure Tailwind utility classes.
------------------------------------------------------------------ */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes blink {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.4; transform:scale(1.5); }
  }
  @keyframes slideBar {
    0%   { background-position: 0%; }
    100% { background-position: 200%; }
  }
  @keyframes wv {
    0%,100% { transform: scaleY(0.3); }
    50%      { transform: scaleY(1); }
  }

  .anim-fadeup-1 { animation: fadeUp 0.6s 0.1s ease both; }
  .anim-fadeup-2 { animation: fadeUp 0.6s 0.2s ease both; }
  .anim-fadeup-3 { animation: fadeUp 0.6s 0.3s ease both; }
  .anim-fadeup-4 { animation: fadeUp 0.6s 0.4s ease both; }
  .anim-fadeup-5 { animation: fadeUp 0.8s 0.4s ease both; }

  .live-dot {
    width: 6px; height: 6px; border-radius: 9999px;
    background: #b8f724; animation: blink 1.4s infinite;
  }
  .m-player-topbar {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #b8f724, #10b981, #b8f724);
    background-size: 200%;
    animation: slideBar 3s linear infinite;
  }
  .m-wbar {
    width: 2px; border-radius: 2px;
    background: #b8f724;
    animation: wv 0.9s ease-in-out infinite;
  }
  .hero-grid {
    position: absolute; inset: 0; opacity: 0.025; pointer-events: none;
    background-image: linear-gradient(#b8f724 1px, transparent 1px),
                      linear-gradient(90deg, #b8f724 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
  }

  body { font-family: 'Instrument Sans', sans-serif; color: #f0f4f0; background: #080a08; }
  .font-cab { font-family: 'Cabinet Grotesk', sans-serif; }

  html { scroll-behavior: smooth; }
`;

/* ── Data ─────────────────────────────────────────────────────────── */
const features = [
  { icon:"🔗", title:"No Account? No Problem.",        desc:"Want your friend in the room but they won't bother signing up? Send them the link. They're in — instantly, no friction, no account needed.", tag:"Invite anyone" },
  { icon:"🎭", title:"Rooms That Match Your Mood",      desc:"Set a mood when you create a room — Chill, Focus, Hype, Sad, or Party. People join knowing exactly what energy they're walking into.",    tag:"5 moods" },
  { icon:"⚡", title:"Reactions That Actually Feel Fun",desc:"Tap an emoji and it floats across everyone's screen at the same time. It sounds small. It feels huge when the beat drops.",                tag:"Floating reactions" },
  { icon:"🔄", title:"Perfectly in Sync",              desc:"Every person in the room hears the same second of the same song. Not approximately — exactly. Like you're in the same room.",             tag:"Zero drift" },
  { icon:"💬", title:"Talk While You Listen",           desc:"A simple chat runs alongside the music. React to the song, share a memory it triggered, or just say nothing — it's your space.",          tag:"Intimate chat" },
  { icon:"🆓", title:"Free. Genuinely.",                desc:"No hidden tiers, no feature locks. Viberoom is free because music is better when everyone can be part of it.",                              tag:"Free forever" },
];

const steps = [
  { n:"01", icon:"✍️", title:"Sign up in 10 seconds",         desc:"Your name, email, password. Done. No onboarding quiz, no profile setup, no tutorial to skip." },
  { n:"02", icon:"🎭", title:"Pick a mood, name your room",   desc:"Choose the vibe — Chill, Focus, Party, Hype or Sad. Give it a name. Your room is live in seconds." },
  { n:"03", icon:"🎵", title:"Search any song from YouTube",  desc:"Type a song name, pick from results, hit play. Everyone in the room hears it at the exact same moment." },
  { n:"04", icon:"🔗", title:"Send the link. That's it.",     desc:"Copy the room link and send it to whoever you want. They click, they're in — no account required to join." },
];

const moods       = [
  { icon:"🌊", label:"Chill" }, { icon:"🎉", label:"Party" }, { icon:"🧠", label:"Focus" },
  { icon:"🌧️", label:"Sad"  }, { icon:"💪", label:"Hype"  }, { icon:"🎸", label:"Indie" },
];
const navLinks    = [
  { label:"How it works", href:"#how" },
  { label:"Features",     href:"#features" },
  { label:"Moods",        href:"#moods" },
];
const mockupRooms = [
  { icon:"🌙", name:"Late Night Lofi",  sub:"Dreamy Beats · 24 listening", color:"#06b6d4" },
  { icon:"🎉", name:"Friday Party Mix", sub:"Get Lucky · 87 listening",    color:"#f59e0b" },
  { icon:"🧠", name:"Deep Focus Zone",  sub:"Brian Eno · 15 listening",    color:"#b8f724" },
];
const mockupMsgs  = [
  { em:"Z", text:"this track 🔥", color:"#b8f724", own:false },
  { em:"R", text:"vibing hard",   color:"#06b6d4", own:false },
  { em:"Y", text:"same omg",      color:"#34d399", own:true  },
];
const proofStats  = [
  { num:"100%", label:"Free, no hidden fees" },
  { num:"5",    label:"Mood categories" },
  { num:"∞",    label:"Friends you can invite" },
];

/* ── Component ────────────────────────────────────────────────────── */
export default function LandingPage({ onLogin, onSignup }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{globalStyles}</style>

      <div style={{color:"#f0f4f0"}}>
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-10 gap-8 transition-all duration-300 border-b ${scrolled ? "bg-[#080a08]/88 backdrop-blur-xl border-white/[.07]" : "border-transparent"}`}>

        <a href="#" className="font-cab font-black text-xl flex items-center gap-2.5 no-underline text-[#f0f4f0]">
          <div className="w-8 h-8 rounded-lg bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-base" style={{boxShadow:"0 0 16px rgba(184,247,36,0.35)"}}>V</div>
          Viberoom
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 ml-auto">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} className="text-[#c8d8c8] text-sm font-medium no-underline hover:text-[#f0f4f0] transition-colors">{l.label}</a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button onClick={onLogin}  className="px-[18px] py-2 rounded-lg border border-white/[.07] bg-transparent text-[#f0f4f0] text-sm font-semibold cursor-pointer hover:border-[#b8f724] hover:text-[#b8f724] transition-all">Log in</button>
          <button onClick={onSignup} className="px-[18px] py-2 rounded-lg bg-[#b8f724] text-[#080a08] text-sm font-semibold cursor-pointer hover:bg-[#d4ff4d] hover:-translate-y-px transition-all" style={{boxShadow:"0 4px 16px rgba(184,247,36,0.3)"}}>Get Started →</button>
        </div>

        {/* Hamburger */}
        <button onClick={() => setMobileMenu(m => !m)}
          className="md:hidden ml-auto bg-transparent border border-white/[.07] rounded-lg px-2.5 py-1.5 text-[#f0f4f0] text-lg cursor-pointer">
          {mobileMenu ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-[#080a08] border-b border-white/[.07] px-5 py-4 flex flex-col gap-1 md:hidden" style={{backdropFilter:"blur(12px)"}}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMobileMenu(false)}
              className="py-3 border-b border-white/[.07] text-[#c8d8c8] text-[15px] font-medium no-underline hover:text-[#f0f4f0] transition-colors">{l.label}</a>
          ))}
          <div className="flex gap-2.5 mt-3">
            <button onClick={() => { setMobileMenu(false); onLogin?.();  }} className="flex-1 py-2.5 rounded-lg border border-white/[.07] text-[#f0f4f0] text-sm font-semibold cursor-pointer bg-transparent">Log in</button>
            <button onClick={() => { setMobileMenu(false); onSignup?.(); }} className="flex-1 py-2.5 rounded-lg bg-[#b8f724] text-[#080a08] text-sm font-semibold cursor-pointer">Get Started →</button>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[120px] pb-20 relative overflow-hidden bg-[#080a08]">
        {/* Glow */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{background:"radial-gradient(ellipse,rgba(184,247,36,0.08) 0%,transparent 70%)"}} />
        {/* Grid */}
        <div className="hero-grid" />

        <h1 className="font-cab font-black leading-[1.0] tracking-[-2px] mb-6 relative anim-fadeup-1 text-[#f0f4f0]"
          style={{fontSize:"clamp(40px,7vw,80px)"}}>
          Your friends are a link away.<br />
          <span className="text-[#b8f724]">Play the same song</span>{" "}
          <span className="text-[#c8d8c8]">at the same time.</span>
        </h1>

        <p className="max-w-[520px] text-[17px] text-[#c8d8c8] leading-[1.65] mb-9 relative anim-fadeup-2">
          Open a room, pick a mood, drop a song — your friends join with just a link.
          No setup on their end. You all hear the same moment, together.
        </p>

        <div className="flex gap-3 justify-center flex-wrap mb-[14px] relative anim-fadeup-3">
          <button onClick={onSignup} className="px-7 py-[13px] rounded-xl bg-[#b8f724] text-[#080a08] text-[15px] font-semibold cursor-pointer hover:bg-[#d4ff4d] hover:-translate-y-px transition-all" style={{boxShadow:"0 4px 16px rgba(184,247,36,0.3)"}}>
            Start a Room for Free →
          </button>
          <button onClick={onLogin} className="px-7 py-[13px] rounded-xl bg-transparent text-[#b8f724] text-[15px] font-semibold cursor-pointer border border-[rgba(184,247,36,0.35)] hover:bg-[rgba(184,247,36,0.08)] transition-all">
            Log in →
          </button>
        </div>
        <p className="text-xs text-[#c8d8c8] anim-fadeup-4">Free to join · Your friends don't even need an account</p>

        {/* ── App mockup ── */}
        <div className="relative w-full max-w-[860px] mt-14 anim-fadeup-5">
          <div className="bg-[#0e110e] border border-white/[.07] rounded-[18px] overflow-hidden"
            style={{boxShadow:"0 40px 100px rgba(0,0,0,0.6),0 0 0 1px rgba(184,247,36,0.04)"}}>

            {/* Browser bar */}
            <div className="bg-[#141814] border-b border-white/[.07] px-[18px] py-3 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              </div>
              <div className="flex-1 bg-[#080a08] border border-white/[.07] rounded-md py-1 px-3 text-xs text-[#c8d8c8] text-center">
                viberoom.app/room/late-night-lofi
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex gap-4 min-h-[280px]">
              {/* Room list */}
              <div className="flex-1 flex flex-col gap-3">
                {mockupRooms.map((r, i) => (
                  <div key={i} className="bg-[#141814] border border-white/[.07] rounded-[10px] p-3 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{background:`${r.color}18`}}>{r.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-cab font-black text-[13px] mb-0.5 text-[#f0f4f0]">{r.name}</div>
                      <div className="text-[10px] text-[#c8d8c8]">{r.sub}</div>
                    </div>
                    <div className="flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.5px] whitespace-nowrap"
                      style={{background:"rgba(184,247,36,0.1)",border:"1px solid rgba(184,247,36,0.2)",color:"#b8f724"}}>
                      <div className="live-dot" style={{width:5,height:5}} />
                      LIVE
                    </div>
                  </div>
                ))}
              </div>

              {/* Player + chat — hidden on small */}
              <div className="hidden sm:flex flex-col gap-2.5 w-[190px] flex-shrink-0">
                <div className="bg-[#141814] rounded-[10px] p-3 relative overflow-hidden" style={{border:"1px solid rgba(184,247,36,0.15)"}}>
                  <div className="m-player-topbar" />
                  <div className="font-cab font-black text-[12px] mb-0.5 text-[#f0f4f0]">Dreamy Beats</div>
                  <div className="text-[10px] text-[#c8d8c8] mb-2">Sleepy</div>
                  <div className="h-[3px] bg-[#080a08] rounded-full">
                    <div className="h-full w-[42%] bg-[#b8f724] rounded-full" />
                  </div>
                  <div className="flex items-center gap-0.5 mt-2 h-[14px]">
                    {[5,9,13,10,6,11,14].map((h,i) => (
                      <div key={i} className="m-wbar" style={{height:h, animationDelay:`${i*0.1}s`}} />
                    ))}
                  </div>
                </div>
                <div className="bg-[#141814] border border-white/[.07] rounded-[10px] p-2.5 flex flex-col gap-2 flex-1">
                  {mockupMsgs.map((m, i) => (
                    <div key={i} className={`flex items-start gap-1.5 ${m.own ? "flex-row-reverse" : ""}`}>
                      <div className="w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-[#080a08]"
                        style={{background:m.color}}>{m.em}</div>
                      <div className={`text-[10px] px-[7px] py-1 leading-[1.4] ${m.own ? "text-[#b8f724]" : "bg-[#080a08] text-[#f0f4f0]"}`}
                        style={m.own
                          ? {background:"rgba(184,247,36,0.1)",borderRadius:"6px 0 6px 6px"}
                          : {borderRadius:"0 6px 6px 6px"}}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow below mockup */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/5 h-[60px] pointer-events-none"
            style={{background:"radial-gradient(ellipse,rgba(184,247,36,0.12),transparent 70%)"}} />
        </div>
      </section>

      {/* ── Proof bar ── */}
      <div className="border-t border-b border-white/[.07] py-7 px-10 flex items-center justify-center gap-16 flex-wrap bg-[#080a08]">
        {proofStats.map((p,i) => (
          <div key={i} className="text-center">
            <div className="font-cab font-black text-[32px] text-[#b8f724]">{p.num}</div>
            <div className="text-xs text-[#c8d8c8] mt-0.5">{p.label}</div>
          </div>
        ))}
      </div>

      {/* ── How it works ── */}
      <section id="how" className="py-[100px] px-6 bg-[#0e110e] border-t border-b border-white/[.07]">
        <div className="max-w-[1080px] mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold text-[#b8f724] mb-[18px]"
            style={{background:"rgba(184,247,36,0.08)",border:"1px solid rgba(184,247,36,0.18)"}}>✦ How it works</div>
          <h2 className="font-cab font-black leading-[1.1] tracking-[-1px] mb-[14px] text-[#f0f4f0]" style={{fontSize:"clamp(28px,4vw,44px)"}}>
            From zero to vibing<br /><span className="text-[#b8f724]">in four steps.</span>
          </h2>
          <p className="text-base text-[#c8d8c8] leading-[1.65] max-w-[480px] mb-14">
            No confusing settings, no lengthy setup. If you've ever sent a link to a friend, you already know how to use Viberoom.
          </p>

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/[.07] rounded-[18px] overflow-hidden">
            {steps.map((s, i) => (
              <div key={i} className={`p-8 ${i < 3 ? "border-b lg:border-b-0 lg:border-r border-white/[.07]" : ""} ${i === 1 ? "sm:border-r-0 lg:border-r lg:border-white/[.07]" : ""}`}>
                <div className="font-cab font-black text-[48px] leading-none mb-4" style={{color:"rgba(184,247,36,0.12)"}}>{s.n}</div>
                <div className="text-[28px] mb-3">{s.icon}</div>
                <div className="font-cab font-black text-[17px] mb-2 text-[#f0f4f0]">{s.title}</div>
                <div className="text-sm text-[#c8d8c8] leading-[1.6]">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-[100px] px-6 bg-[#080a08]">
        <div className="max-w-[1080px] mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold text-[#b8f724] mb-[18px]"
            style={{background:"rgba(184,247,36,0.08)",border:"1px solid rgba(184,247,36,0.18)"}}>✦ Features</div>
          <h2 className="font-cab font-black leading-[1.1] tracking-[-1px] mb-[14px] text-[#f0f4f0]" style={{fontSize:"clamp(28px,4vw,44px)"}}>
            Built for real friends,<br /><span className="text-[#b8f724]">not algorithms.</span>
          </h2>
          <p className="text-base text-[#c8d8c8] leading-[1.65] max-w-[480px] mb-14">
            No recommendations engine, no "you might also like". Just you, your people, and whatever you feel like playing right now.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-[#0e110e] rounded-[18px] p-7 transition-all duration-200 cursor-default group"
                style={{border:"1px solid rgba(255,255,255,0.07)"}}
                onMouseEnter={e => e.currentTarget.style.borderColor="rgba(184,247,36,0.22)"}
                onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}>
                <div className="text-[32px] mb-4">{f.icon}</div>
                <div className="font-cab font-black text-[18px] mb-2 text-[#f0f4f0]">{f.title}</div>
                <div className="text-sm text-[#c8d8c8] leading-[1.65]">{f.desc}</div>
                <div className="inline-block mt-3.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#b8f724]"
                  style={{background:"rgba(184,247,36,0.08)",border:"1px solid rgba(184,247,36,0.18)"}}>
                  {f.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Moods ── */}
      <section id="moods" className="py-[100px] px-6 bg-[#0e110e] border-t border-b border-white/[.07]">
        <div className="max-w-[1080px] mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold text-[#b8f724] mb-[18px]"
            style={{background:"rgba(184,247,36,0.08)",border:"1px solid rgba(184,247,36,0.18)"}}>✦ Moods</div>
          <h2 className="font-cab font-black leading-[1.1] tracking-[-1px] mb-[14px] text-[#f0f4f0]" style={{fontSize:"clamp(28px,4vw,44px)"}}>
            Walk into the right room<br /><span className="text-[#b8f724]">every single time.</span>
          </h2>
          <p className="text-base text-[#c8d8c8] leading-[1.65] max-w-[480px] mb-10">
            Every room has a mood tag so you know before you even join. Late night study session? Pick Focus. 3am spiral? Sad has you covered.
          </p>
          <div className="flex gap-3 flex-wrap">
            {moods.map((m, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#141814] rounded-xl px-5 py-3 text-[15px] font-semibold cursor-default transition-all"
                style={{border:"1px solid rgba(255,255,255,0.07)"}}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(184,247,36,0.3)"; e.currentTarget.style.background="rgba(184,247,36,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.background="#141814"; }}>
                <span className="text-[20px]">{m.icon}</span>
                <span className="text-[#f0f4f0]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-[100px] px-6 text-center relative overflow-hidden bg-[#080a08]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
          style={{background:"radial-gradient(ellipse,rgba(184,247,36,0.07) 0%,transparent 70%)"}} />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold text-[#b8f724] mb-5"
            style={{background:"rgba(184,247,36,0.08)",border:"1px solid rgba(184,247,36,0.18)"}}>✦ Get started today</div>
          <h2 className="font-cab font-black leading-[1.1] tracking-[-1.5px] mb-4 text-[#f0f4f0]" style={{fontSize:"clamp(32px,5vw,56px)"}}>
            Your people are waiting.<br /><span className="text-[#b8f724]">Send them a link.</span>
          </h2>
          <p className="text-base text-[#c8d8c8] mb-9">
            Sign up free. Open a room. Your friends don't even need an account to join — just a link.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={onSignup} className="px-7 py-[13px] rounded-xl bg-[#b8f724] text-[#080a08] text-[15px] font-semibold cursor-pointer hover:bg-[#d4ff4d] hover:-translate-y-px transition-all" style={{boxShadow:"0 4px 16px rgba(184,247,36,0.3)"}}>
              Create Free Account →
            </button>
            <button onClick={onLogin} className="px-7 py-[13px] rounded-xl bg-transparent text-[#f0f4f0] text-[15px] font-semibold cursor-pointer border border-white/[.07] hover:border-[#b8f724] hover:text-[#b8f724] transition-all">
              Log in →
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[.07] px-10 py-9 flex items-center justify-between flex-wrap gap-5 bg-[#080a08]">
        <div className="font-cab font-black text-[18px] flex items-center gap-2 text-[#f0f4f0]">
          <div className="w-7 h-7 rounded-lg bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-sm">V</div>
          Viberoom
        </div>
        <div className="flex gap-6 flex-wrap">
          {["Privacy","Terms","Contact","GitHub"].map(l => (
            <a key={l} href="#" className="text-[13px] text-[#c8d8c8] no-underline hover:text-[#f0f4f0] transition-colors">{l}</a>
          ))}
        </div>
        <div className="text-xs text-[#c8d8c8]">© 2025 Viberoom. React + Spring Boot.</div>
      </footer>
      </div>
    </>
  );
}
