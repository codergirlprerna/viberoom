// src/hooks/useReactions.js
import { useState, useRef, useCallback, useEffect } from "react";

export function useReactions(roomId, stompClient = null) {
  const [reactions, setReactions] = useState([]);
  const reactionId = useRef(0);

  useEffect(() => {
    if (!stompClient || !roomId) return;
    try {
      const sub = stompClient.subscribe?.(`/topic/room/${roomId}/reactions`, (msg) => {
        const event = JSON.parse(msg.body);
        addReactionToScreen(event.emoji);
      });
      return () => sub?.unsubscribe?.();
    } catch {}
  }, [stompClient, roomId]);

  const addReactionToScreen = useCallback((emoji) => {
    const id = ++reactionId.current;
    const x  = `${15 + Math.random() * 70}%`;
    setReactions(r => [...r, { id, emoji, x }]);
  }, []);

  const sendReaction = useCallback((emoji) => {
    addReactionToScreen(emoji);
    try {
      if (stompClient?.connected) {
        stompClient.publish({ destination: `/app/room/${roomId}/reaction`, body: JSON.stringify({ emoji }) });
      }
    } catch {}
  }, [stompClient, roomId, addReactionToScreen]);

  const removeReaction = useCallback((id) => {
    setReactions(r => r.filter(x => x.id !== id));
  }, []);

  return { reactions, sendReaction, removeReaction };
}
