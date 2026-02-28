// src/hooks/usePlayer.js
import { useState, useEffect, useRef, useCallback } from "react";
import { playerAPI, queueAPI } from "../services/api";

export function usePlayer(roomId, isHost = false, stompClient = null) {
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [volume,      setVolume]      = useState(80);
  const [isMuted,     setIsMuted]     = useState(false);
  const [queue,       setQueue]       = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [youtubeId,   setYoutubeId]   = useState(null);
  const tickRef = useRef(null);

  // Fetch initial state from backend
  useEffect(() => {
    if (!roomId) return;
    const init = async () => {
      try {
        const queueRes = await queueAPI.get(roomId);
        const q = queueRes.data || [];
        setQueue(q);
        const current = q.find(s => s.current) || q[0] || null;
        setCurrentSong(current);
        if (current?.youtubeId) setYoutubeId(current.youtubeId);
      } catch {
        setQueue([]);
        setCurrentSong(null);
      }
    };
    init();
  }, [roomId]);

  // Auto-tick progress when playing
  useEffect(() => {
    clearInterval(tickRef.current);
    if (!isPlaying || duration === 0) return;
    tickRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setIsPlaying(false); return 0; }
        return p + (100 / duration / 10);
      });
    }, 100);
    return () => clearInterval(tickRef.current);
  }, [isPlaying, duration]);

  // WebSocket events
  useEffect(() => {
    if (!stompClient || !roomId) return;
    try {
      const sub = stompClient.subscribe?.(`/topic/room/${roomId}/player`, (msg) => {
        const event = JSON.parse(msg.body);
        if (event.type === "PLAY_PAUSE") {
          setIsPlaying(event.isPlaying);
        }
        if (event.type === "SEEK") {
          setProgress((event.timestamp / duration) * 100);
        }
        if (event.type === "SKIP") {
          setCurrentSong(event.song);
          if (event.song?.youtubeId) setYoutubeId(event.song.youtubeId);
          setProgress(0);
          setIsPlaying(true);
        }
        if (event.type === "QUEUE_UPDATE") {
          setQueue(event.queue);
          const current = event.queue.find(s => s.current);
          if (current) {
            setCurrentSong(current);
            if (current.youtubeId) setYoutubeId(current.youtubeId);
          }
        }
      });
      return () => sub?.unsubscribe?.();
    } catch { /* not connected */ }
  }, [stompClient, roomId, duration]);

  const handlePlayPause = useCallback(async () => {
    const next = !isPlaying;
    setIsPlaying(next);
    try { await playerAPI.playPause(roomId, next); } catch { /* silent */ }
  }, [isPlaying, roomId]);

  const handleSeek = useCallback(async (val) => {
    setProgress(val);
    try { await playerAPI.seek(roomId, (val / 100) * duration); } catch { /* silent */ }
  }, [roomId, duration]);

  const handleNext = useCallback(() => {
    setQueue(q => {
      const idx = q.findIndex(s => s.current);
      const nextIdx = idx === -1 ? 0 : Math.min(idx + 1, q.length - 1);
      if (nextIdx === idx) return q;
      const updated = q.map((s, i) => ({ ...s, current: i === nextIdx }));
      const next = updated[nextIdx];
      setCurrentSong(next);
      if (next?.youtubeId) setYoutubeId(next.youtubeId);
      setProgress(0);
      setIsPlaying(true);
      return updated;
    });
    try { playerAPI.skip(roomId, "next"); } catch { /* silent */ }
  }, [roomId]);

  const handlePrev = useCallback(() => {
    setQueue(q => {
      const idx = q.findIndex(s => s.current);
      const prevIdx = Math.max(idx - 1, 0);
      if (prevIdx === idx) return q;
      const updated = q.map((s, i) => ({ ...s, current: i === prevIdx }));
      const prev = updated[prevIdx];
      setCurrentSong(prev);
      if (prev?.youtubeId) setYoutubeId(prev.youtubeId);
      setProgress(0);
      setIsPlaying(true);
      return updated;
    });
    try { playerAPI.skip(roomId, "prev"); } catch { /* silent */ }
  }, [roomId]);

  const handleSongEnd = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const handleVolumeChange = useCallback((v) => { setVolume(v); setIsMuted(false); }, []);
  const handleMuteToggle   = useCallback(() => setIsMuted(m => !m), []);

  return {
    isPlaying, progress, duration, volume, isMuted,
    queue, currentSong, youtubeId,
    handlePlayPause, handleSeek, handleNext, handlePrev,
    handleVolumeChange, handleMuteToggle, handleSongEnd,
    setDuration, setQueue, setCurrentSong, setYoutubeId, setIsPlaying,
  };
}
