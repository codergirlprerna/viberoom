// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { roomAPI } from "../services/api";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');
  body { font-family: 'Instrument Sans', sans-serif; background: #080a08; color: #f0f4f0; }
  .font-cab { font-family: 'Cabinet Grotesk', sans-serif; }
  @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
  .live-dot { width:7px; height:7px; border-radius:9999px; background:#b8f724; animation:blink 1.4s infinite; display:inline-block; }
`;

const MOODS = [
  { icon:"🌊", label:"Chill",  color:"#06b6d4" },
  { icon:"🎉", label:"Party",  color:"#f59e0b" },
  { icon:"🧠", label:"Focus",  color:"#b8f724" },
  { icon:"🌧️", label:"Sad",   color:"#93c5fd" },
  { icon:"💪", label:"Hype",   color:"#f87171" },
  { icon:"🎸", label:"Indie",  color:"#34d399" },
];

// ── Create Room Modal ──
function CreateRoomModal({ onClose, onCreate }) {
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
      style={{background:"rgba(8,10,8,0.88)", backdropFilter:"blur(8px)"}}>
      <div className="w-full max-w-[440px] bg-[#0e110e] border border-white/[.07] rounded-2xl p-6 relative">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-[#c8d8c8] hover:text-[#f0f4f0] bg-transparent border-none cursor-pointer text-lg">✕</button>

        <div className="font-cab font-black text-[22px] text-[#f0f4f0] mb-1">Create a room</div>
        <p className="text-sm text-[#c8d8c8] mb-6">Give it a name, pick a mood, share the link.</p>

        <div className="mb-4">
          <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-1.5">Room name</label>
          <input
            className="w-full bg-[#141814] border border-white/[.07] rounded-[10px] px-3.5 py-[11px] text-[#f0f4f0] text-sm outline-none transition-all placeholder:text-[#5a6b5a] focus:border-[#b8f724] focus:shadow-[0_0_0_3px_rgba(184,247,36,0.08)]"
            placeholder="e.g. Late Night Lofi" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()} />
        </div>

        <div className="mb-5">
          <label className="block text-[11px] font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-2">Pick a mood</label>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map(m => (
              <button key={m.label} onClick={() => setMood(m.label)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${mood === m.label ? "border-[#b8f724] text-[#f0f4f0]" : "border-white/[.07] text-[#c8d8c8] hover:border-white/20"}`}
                style={mood === m.label ? {background:"rgba(184,247,36,0.08)"} : {background:"#141814"}}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 bg-[#141814] border border-white/[.07] rounded-xl px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-[#f0f4f0]">{isPublic ? "Public room" : "Private room"}</div>
            <div className="text-xs text-[#c8d8c8]">{isPublic ? "Anyone can find and join" : "Only people with the link"}</div>
          </div>
          <div onClick={() => setIsPublic(p => !p)}
            className="w-11 h-6 rounded-full cursor-pointer transition-all relative flex-shrink-0"
            style={{background: isPublic ? "#b8f724" : "#1e231e", border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${isPublic ? "left-5 bg-[#080a08]" : "left-0.5 bg-[#5a6b5a]"}`} />
          </div>
        </div>

        <button onClick={handleCreate} disabled={!name.trim() || !mood}
          className="w-full py-[13px] bg-[#b8f724] text-[#080a08] rounded-[10px] font-cab font-black text-[15px] cursor-pointer transition-all hover:bg-[#d4ff4d] hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          style={{boxShadow:"0 4px 18px rgba(184,247,36,0.3)"}}>
          Create Room →
        </button>
      </div>
    </div>
  );
}

// ── Section: Home ──
function HomeSection({ rooms, onCreateRoom, onOpenRoom }) {
  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="font-cab font-black text-lg text-[#f0f4f0]">Your Rooms</div>
          {rooms.length > 0 && (
            <button onClick={onCreateRoom}
              className="text-xs font-semibold text-[#b8f724] hover:underline bg-transparent border-none cursor-pointer">
              + New room
            </button>
          )}
        </div>

        {rooms.length === 0 ? (
          <div className="border border-dashed border-white/[.1] rounded-2xl p-10 flex flex-col items-center text-center">
            <div className="text-[48px] mb-4">🎵</div>
            <div className="font-cab font-black text-[18px] text-[#f0f4f0] mb-2">No rooms yet</div>
            <p className="text-sm text-[#c8d8c8] max-w-[280px] mb-6 leading-relaxed">
              Create your first room, pick a mood and drop a song. Share the link — your friends are in instantly.
            </p>
            <button onClick={onCreateRoom}
              className="px-6 py-2.5 bg-[#b8f724] text-[#080a08] rounded-xl font-cab font-black text-sm cursor-pointer hover:bg-[#d4ff4d] hover:-translate-y-px transition-all"
              style={{boxShadow:"0 4px 14px rgba(184,247,36,0.25)"}}>
              Create Your First Room →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rooms.map(room => {
              const mood = MOODS.find(m => m.label === room.mood);
              return (
                <div key={room.id} onClick={() => onOpenRoom(room.id)}
                  className="bg-[#0e110e] border border-white/[.07] rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5"
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(184,247,36,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{background:`${mood?.color || "#b8f724"}18`}}>{mood?.icon || "🎵"}</div>
                    <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{background:"rgba(184,247,36,0.1)", border:"1px solid rgba(184,247,36,0.2)", color:"#b8f724"}}>
                      <div className="live-dot" style={{width:5,height:5}} /> LIVE
                    </div>
                  </div>
                  <div className="font-cab font-black text-[16px] text-[#f0f4f0] mb-1">{room.name}</div>
                  <div className="text-xs text-[#c8d8c8] mb-3">{room.mood} · {room.isPublic ? "Public" : "Private"}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#c8d8c8]">👤 {room.listeners} listening</span>
                    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/join/${room.id}`); }}
                      className="text-xs font-semibold text-[#b8f724] bg-transparent border-none cursor-pointer hover:underline">
                      Share link →
                    </button>
                  </div>
                </div>
              );
            })}
            <button onClick={onCreateRoom}
              className="bg-transparent border border-dashed border-white/[.1] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[rgba(184,247,36,0.25)] hover:bg-[rgba(184,247,36,0.02)] transition-all min-h-[140px]">
              <div className="text-2xl text-[#c8d8c8]">+</div>
              <div className="text-sm font-semibold text-[#c8d8c8]">New room</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section: Explore ──
function ExploreSection() {
  return (
    <div>
      <div className="font-cab font-black text-[22px] text-[#f0f4f0] mb-1">Explore</div>
      <p className="text-sm text-[#c8d8c8] mb-8">Discover public rooms that are live right now.</p>

      <div className="border border-dashed border-white/[.1] rounded-2xl p-10 flex flex-col items-center text-center mb-6">
        <div className="text-[48px] mb-4">🌍</div>
        <div className="font-cab font-black text-[18px] text-[#f0f4f0] mb-2">No public rooms yet</div>
        <p className="text-sm text-[#c8d8c8] max-w-[300px] leading-relaxed">
          Be the first to create a public room. Once people join, rooms will appear here.
        </p>
      </div>

      <div className="text-xs font-bold text-[#c8d8c8] uppercase tracking-[1px] mb-3">Browse by mood</div>
      <div className="flex flex-wrap gap-2">
        {MOODS.map(m => (
          <div key={m.label}
            className="flex items-center gap-1.5 bg-[#0e110e] border border-white/[.07] rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-all text-[#c8d8c8]"
            onMouseEnter={e => { e.currentTarget.style.borderColor=`${m.color}50`; e.currentTarget.style.color=m.color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.color="#c8d8c8"; }}>
            {m.icon} {m.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section: My Rooms ──
function MyRoomsSection({ rooms, onCreateRoom, onOpenRoom }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-cab font-black text-[22px] text-[#f0f4f0] mb-1">My Rooms</div>
          <p className="text-sm text-[#c8d8c8]">All rooms you've created.</p>
        </div>
        <button onClick={onCreateRoom}
          className="px-4 py-2 bg-[#b8f724] text-[#080a08] rounded-xl font-cab font-black text-sm cursor-pointer hover:bg-[#d4ff4d] transition-all"
          style={{boxShadow:"0 4px 14px rgba(184,247,36,0.2)"}}>
          + New room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="border border-dashed border-white/[.1] rounded-2xl p-10 flex flex-col items-center text-center">
          <div className="text-[48px] mb-4">🎵</div>
          <div className="font-cab font-black text-[18px] text-[#f0f4f0] mb-2">No rooms yet</div>
          <p className="text-sm text-[#c8d8c8] max-w-[260px] mb-6 leading-relaxed">
            You haven't created any rooms. Hit the button above to get started.
          </p>
          <button onClick={onCreateRoom}
            className="px-6 py-2.5 bg-[#b8f724] text-[#080a08] rounded-xl font-cab font-black text-sm cursor-pointer hover:bg-[#d4ff4d] transition-all"
            style={{boxShadow:"0 4px 14px rgba(184,247,36,0.25)"}}>
            Create Room →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rooms.map(room => {
            const mood = MOODS.find(m => m.label === room.mood);
            return (
              <div key={room.id} onClick={() => onOpenRoom(room.id)}
                className="bg-[#0e110e] border border-white/[.07] rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5"
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(184,247,36,0.2)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{background:`${mood?.color || "#b8f724"}18`}}>{mood?.icon || "🎵"}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{background:"rgba(184,247,36,0.1)", border:"1px solid rgba(184,247,36,0.2)", color:"#b8f724"}}>
                    LIVE
                  </span>
                </div>
                <div className="font-cab font-black text-[16px] text-[#f0f4f0] mb-1">{room.name}</div>
                <div className="text-xs text-[#c8d8c8]">{room.mood} · {room.isPublic ? "Public" : "Private"}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ──
export default function Dashboard({ user = { name:"User" }, onLogout }) {
  const navigate              = useNavigate();
  const [activeNav,    setNav] = useState("home");
  const [showCreate,   setShowCreate]    = useState(false);
  const [rooms,        setRooms]         = useState([]);
  const [mobileSidebar,setMobileSidebar] = useState(false);

  // Load rooms from backend on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await roomAPI.getMine();
        setRooms(res.data);
      } catch {
        setRooms([]); // silent fail if backend down
      }
    };
    fetchRooms();
  }, []);

  const handleCreateRoom = async (room) => {
    try {
      // Save to backend
      const res = await roomAPI.create(room);
      const newRoom = res.data;
      setRooms(r => [...r, newRoom]);
      navigate(`/room/${newRoom.id}`);
    } catch {
      // Fallback: create locally if backend down
      const id = Date.now().toString();
      setRooms(r => [...r, { ...room, id, listeners: 1 }]);
      navigate(`/room/${id}`);
    }
  };

  const handleOpenRoom = (id) => navigate(`/room/${id}`);

  const navItems = [
    { icon:"🏠", label:"Home",     id:"home"    },
    { icon:"🔍", label:"Explore",  id:"explore" },
    { icon:"🎵", label:"My Rooms", id:"myrooms" },
    { icon:"👤", label:"Profile",  id:"profile" },
  ];

  const handleNav = (id) => {
    if (id === "profile") { navigate("/profile"); return; }
    setNav(id);
    setMobileSidebar(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-lg bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-base font-cab"
          style={{boxShadow:"0 0 16px rgba(184,247,36,0.3)"}}>V</div>
        <span className="font-cab font-black text-xl text-[#f0f4f0]">Viberoom</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => (
          <button key={item.id} onClick={() => handleNav(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all text-left w-full ${activeNav === item.id ? "bg-[rgba(184,247,36,0.1)] text-[#b8f724]" : "bg-transparent text-[#c8d8c8] hover:bg-white/[.03] hover:text-[#f0f4f0]"}`}>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Create room */}
      <button onClick={() => setShowCreate(true)}
        className="w-full py-2.5 bg-[#b8f724] text-[#080a08] rounded-xl font-cab font-black text-sm cursor-pointer hover:bg-[#d4ff4d] transition-all mb-4"
        style={{boxShadow:"0 4px 14px rgba(184,247,36,0.25)"}}>
        + Create Room
      </button>

      {/* User */}
      <div className="flex items-center gap-2.5 pt-4 border-t border-white/[.07]">
        <div className="w-8 h-8 rounded-full bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-sm flex-shrink-0">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#f0f4f0] truncate">{user.name}</div>
          <div className="text-xs text-[#c8d8c8]">Online</div>
        </div>
        <button onClick={onLogout} title="Log out"
          className="text-[#c8d8c8] hover:text-[#f0f4f0] bg-transparent border-none cursor-pointer text-sm transition-colors">↩</button>
      </div>
    </>
  );

  return (
    <>
      <style>{globalStyles}</style>
      <div className="min-h-screen bg-[#080a08] text-[#f0f4f0] flex">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 bg-[#0e110e] border-r border-white/[.07] p-5 fixed top-0 left-0 bottom-0">
          <SidebarContent />
        </aside>

        {/* Mobile top bar */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0e110e] border-b border-white/[.07] flex items-center px-4 gap-3">
          <button onClick={() => setMobileSidebar(true)}
            className="text-[#f0f4f0] bg-transparent border-none cursor-pointer text-xl">☰</button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-sm">V</div>
            <span className="font-cab font-black text-lg text-[#f0f4f0]">Viberoom</span>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="px-3 py-1.5 bg-[#b8f724] text-[#080a08] rounded-lg font-cab font-black text-xs cursor-pointer">
            + Room
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebar && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="w-[220px] bg-[#0e110e] border-r border-white/[.07] p-5 flex flex-col">
              <button onClick={() => setMobileSidebar(false)}
                className="self-end text-[#c8d8c8] bg-transparent border-none cursor-pointer text-lg mb-6">✕</button>
              <SidebarContent />
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setMobileSidebar(false)} />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 md:ml-[220px] pt-14 md:pt-0 min-h-screen">
          <div className="max-w-[860px] mx-auto px-5 md:px-10 py-10">

            {/* Page heading */}
            {activeNav === "home" && (
              <div className="mb-10">
                <div className="font-cab font-black text-[28px] md:text-[36px] text-[#f0f4f0] mb-1">
                  Hey, {user.name} 👋
                </div>
                <p className="text-[#c8d8c8] text-sm">Ready to vibe? Create a room or explore what's out there.</p>
              </div>
            )}

            {/* ── Sections ── */}
            {activeNav === "home" && (
              <HomeSection
                rooms={rooms}
                onCreateRoom={() => setShowCreate(true)}
                onOpenRoom={handleOpenRoom}
              />
            )}

            {activeNav === "explore" && <ExploreSection />}

            {activeNav === "myrooms" && (
              <MyRoomsSection
                rooms={rooms}
                onCreateRoom={() => setShowCreate(true)}
                onOpenRoom={handleOpenRoom}
              />
            )}
          </div>
        </main>

        {/* Create room modal */}
        {showCreate && (
          <CreateRoomModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreateRoom}
          />
        )}
      </div>
    </>
  );
}
