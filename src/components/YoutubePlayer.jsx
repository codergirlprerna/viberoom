// src/components/YoutubePlayer.jsx
import { useEffect, useRef } from "react";

export default function YoutubePlayer({ videoId, isPlaying, volume = 80, onReady, onEnded }) {
  const playerRef   = useRef(null);
  const containerRef = useRef(null);
  const readyRef    = useRef(false);

  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
      }
      readyRef.current = false;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: (e) => {
            readyRef.current = true;
            e.target.setVolume(volume);
            if (isPlaying) e.target.playVideo();
            onReady?.(e.target);
          },
          onStateChange: (e) => {
            if (e.data === 0) onEnded?.(); // video ended
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      try { playerRef.current?.destroy(); } catch {}
      readyRef.current = false;
    };
  }, [videoId]);

  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return;
    try {
      if (isPlaying) playerRef.current.playVideo();
      else playerRef.current.pauseVideo();
    } catch {}
  }, [isPlaying]);

  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return;
    try { playerRef.current.setVolume(volume); } catch {}
  }, [volume]);

  return (
    <div style={{ position:"absolute", width:1, height:1, opacity:0, pointerEvents:"none", overflow:"hidden" }}>
      <div ref={containerRef} />
    </div>
  );
}
