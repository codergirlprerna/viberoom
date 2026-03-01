// src/pages/RoomPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth }         from "../context/AuthContext";
import { useWebSocket }    from "../hooks/useWebSocket";
import { usePlayer }       from "../hooks/usePlayer";
import { useChat }         from "../hooks/useChat";
import { useReactions }    from "../hooks/useReactions";
import { useRoom, useListeners } from "../hooks/useRoom";
import { queueAPI }        from "../services/api";

import MusicPlayer        from "../components/MusicPlayer";
import Chat               from "../components/Chat";
import Queue              from "../components/Queue";
import FloatingReactions  from "../components/FloatingReactions";
import ListenerAvatars    from "../components/ListenerAvatars";
import SongSearch         from "../components/SongSearch";
import YoutubePlayer      from "../components/YoutubePlayer";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');
  body { font-family:'Instrument Sans',sans-serif; background:#080a08; color:#f0f4f0; margin:0; }
  .font-cab { font-family:'Cabinet Grotesk',sans-serif; }
  .custom-scroll::-webkit-scrollbar { width:4px; }
  .custom-scroll::-webkit-scrollbar-track { background:transparent; }
  .custom-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
  .live-dot { width:6px;height:6px;border-radius:9999px;background:#b8f724;display:inline-block;animation:blink 1.4s infinite; }
`;

const REACTION_EMOJIS = ["🔥","😍","💯","🎵","⚡","🥲","👏","💚"];

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const { room, loading: roomLoading } = useRoom(roomId);
  const isHost = room?.hostId === user?.uid || (!user?.isGuest && !!user?.uid);

  const { stompClient, connected } = useWebSocket(roomId);

  const player    = usePlayer(roomId, isHost, stompClient);
  const chat      = useChat(roomId, user, stompClient);
  const reactions = useReactions(roomId, stompClient);
  const listeners = useListeners(roomId);

  const [showQueue,  setShowQueue]  = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const [copied,     setCopied]     = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSong = async (song) => {
    // song from YouTube search: { youtubeId, title, artist, thumbnail }
    try {
      await queueAPI.add(roomId, song);
    } catch { /* silent */ }

    // If nothing playing yet, start this song
    if (!player.youtubeId) {
      player.setYoutubeId(song.youtubeId);
      player.setCurrentSong(song);
      player.setIsPlaying(true);
      player.setQueue(q => [...q, { ...song, current: true }]);
    } else {
      player.setQueue(q => [...q, { ...song, current: false }]);
    }
  };

  if (roomLoading) return (
    <div className="min-h-screen bg-[#080a08] flex items-center justify-center">
      <div style={{width:32,height:32,border:"3px solid rgba(184,247,36,0.2)",borderTopColor:"#b8f724",borderRadius:"9999px",animation:"spin 0.7s linear infinite"}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const roomName = room?.name || "Viberoom";
  const mood     = room?.mood || "Chill";

  return (
    <>
      <style>{globalStyles}</style>
      <div className="h-screen flex flex-col bg-[#080a08] text-[#f0f4f0] overflow-hidden">

        {/* Hidden YouTube player */}
        <YoutubePlayer
          videoId={player.youtubeId}
          isPlaying={player.isPlaying}
          volume={player.isMuted ? 0 : player.volume}
          onEnded={player.handleSongEnd}
          onReady={(ytPlayer) => {
            // Get real duration from YouTube
            try {
              const dur = ytPlayer.getDuration();
              if (dur > 0) player.setDuration(dur);
            } catch {}
          }}
        />

        {/* Top bar */}
        <header className="flex-shrink-0 h-14 bg-[#0e110e] border-b border-white/[.07] flex items-center px-4 md:px-6 gap-3 z-30">
          <div className="flex items-center gap-2 mr-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#b8f724] flex items-center justify-center text-[#080a08] font-black text-sm font-cab"
              style={{boxShadow:"0 0 12px rgba(184,247,36,0.3)"}}>V</div>
            <span className="font-cab font-black text-base text-[#f0f4f0] hidden sm:block">Viberoom</span>
          </div>
          <div className="w-px h-5 bg-white/[.07]" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="min-w-0">
              <div className="font-cab font-black text-[15px] text-[#f0f4f0] truncate">{roomName}</div>
              <div className="flex items-center gap-1.5">
                <div className="live-dot" />
                <span className="text-[10px] text-[#b8f724] font-semibold">LIVE</span>
                <span className="text-[10px] text-[#c8d8c8]">· {listeners.length || 1} listening</span>
                {!connected && <span className="text-[10px] text-[#f59e0b]">· reconnecting...</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:block"><ListenerAvatars listeners={listeners} max={4} /></div>
            <button onClick={copyLink}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${copied ? "border-[#b8f724] text-[#b8f724] bg-[rgba(184,247,36,0.08)]" : "border-white/[.07] text-[#c8d8c8] bg-transparent hover:border-white/20"}`}>
              {copied ? "✓ Copied!" : "🔗 Share"}
            </button>
            <button onClick={() => setShowQueue(q => !q)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${showQueue ? "border-[#b8f724] text-[#b8f724] bg-[rgba(184,247,36,0.08)]" : "border-white/[.07] text-[#c8d8c8] bg-transparent hover:border-white/20"}`}>
              🎵 Queue
            </button>
            <button onClick={() => setMobileChat(c => !c)}
              className="md:hidden px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-white/[.07] text-[#c8d8c8]">💬</button>
            <button onClick={() => navigate("/dashboard")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-white/[.07] text-[#c8d8c8] bg-transparent hover:border-[#ef4444] hover:text-[#ef4444] transition-all">
              Leave
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
            <FloatingReactions reactions={reactions.reactions} onRemove={reactions.removeReaction} />

            <MusicPlayer
              currentSong={player.currentSong}
              isPlaying={player.isPlaying}
              progress={player.progress}
              duration={player.duration}
              volume={player.volume}
              isMuted={player.isMuted}
              mood={mood}
              isHost={isHost}
              onPlayPause={player.handlePlayPause}
              onSeek={player.handleSeek}
              onPrev={player.handlePrev}
              onNext={player.handleNext}
              onVolumeChange={player.handleVolumeChange}
              onMuteToggle={player.handleMuteToggle}
            />

            {/* Reactions */}
            <div className="flex-shrink-0 border-t border-white/[.07] px-4 py-3 flex items-center justify-center gap-2 bg-[#0e110e]">
              <span className="text-xs text-[#c8d8c8] mr-1 hidden sm:block">React:</span>
              {REACTION_EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => reactions.sendReaction(emoji)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl cursor-pointer transition-all bg-transparent border border-white/[.07] hover:border-[rgba(184,247,36,0.3)] hover:bg-[rgba(184,247,36,0.06)] hover:-translate-y-0.5 hover:scale-110">
                  {emoji}
                </button>
              ))}
            </div>

            {showQueue && (
              <Queue
                queue={player.queue}
                isHost={isHost}
                onClose={() => setShowQueue(false)}
                onAddSong={() => { setShowQueue(false); setShowSearch(true); }}
                onRemove={(song, i) => {
                  player.setQueue(q => q.filter((_, idx) => idx !== i));
                }}
              />
            )}
          </main>

          {/* Right chat */}
          <aside className="hidden md:flex flex-col w-[300px] lg:w-[340px] flex-shrink-0 border-l border-white/[.07] bg-[#0e110e]">
            <div className="flex-shrink-0 px-4 py-3 border-b border-white/[.07] flex items-center justify-between">
              <div className="font-cab font-black text-[14px] text-[#f0f4f0]">Chat</div>
              <div className="flex items-center gap-1.5 text-xs text-[#c8d8c8]">
                <div className="live-dot" style={{width:5,height:5}} />
                {listeners.length || 1} online
              </div>
            </div>
            <div className="flex-shrink-0 px-4 py-3 border-b border-white/[.07]">
              <ListenerAvatars listeners={listeners} max={8} showNames={true} />
            </div>
            <Chat messages={chat.messages} onSend={chat.sendMessage} />
          </aside>
        </div>

        {/* Mobile chat */}
        {mobileChat && (
          <div className="md:hidden fixed inset-0 z-40 flex flex-col bg-[#080a08]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[.07] bg-[#0e110e]">
              <div className="font-cab font-black text-[15px] text-[#f0f4f0]">Chat</div>
              <button onClick={() => setMobileChat(false)} className="text-[#c8d8c8] bg-transparent border-none cursor-pointer text-lg">✕</button>
            </div>
            <div className="px-4 py-3 border-b border-white/[.07]">
              <ListenerAvatars listeners={listeners} max={6} showNames={true} />
            </div>
            <div className="flex-1 overflow-hidden">
              <Chat messages={chat.messages} onSend={chat.sendMessage} />
            </div>
          </div>
        )}

        {showSearch && (
          <SongSearch onSelect={handleAddSong} onClose={() => setShowSearch(false)} />
        )}
      </div>
    </>
  );
}
