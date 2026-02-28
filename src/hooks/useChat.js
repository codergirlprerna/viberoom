// src/hooks/useChat.js
import { useState, useEffect, useCallback } from "react";
import { chatAPI } from "../services/api";

const MOCK_MESSAGES = [
  { id:1, name:"Zara",  avatar:"Z", color:"#06b6d4", text:"this song is 🔥", time:"10:32" },
  { id:2, name:"Rohan", avatar:"R", color:"#f59e0b", text:"vibing so hard rn", time:"10:33" },
  { id:3, name:"Priya", avatar:"P", color:"#34d399", text:"the drop was perfect", time:"10:33" },
];

export function useChat(roomId, currentUser, stompClient = null) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  // Load history from backend (silent fail)
  useEffect(() => {
    if (!roomId) return;
    const fetch = async () => {
      try {
        const res = await chatAPI.getHistory(roomId, 50);
        if (res.data?.length > 0) {
          setMessages(res.data.map(m => ({
            id:     m.id,
            name:   m.senderName,
            avatar: m.senderName?.[0]?.toUpperCase() || "?",
            color:  m.avatarColor || "#b8f724",
            text:   m.text,
            time:   new Date(m.createdAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
          })));
        }
      } catch { /* keep mock messages */ }
    };
    fetch();
  }, [roomId]);

  // WebSocket subscription
  useEffect(() => {
    if (!stompClient || !roomId) return;
    try {
      const sub = stompClient.subscribe?.(`/topic/room/${roomId}/chat`, (msg) => {
        const m = JSON.parse(msg.body);
        setMessages(prev => [...prev, {
          id:     m.id || Date.now(),
          name:   m.senderName,
          avatar: m.senderName?.[0]?.toUpperCase() || "?",
          color:  m.avatarColor || "#c8d8c8",
          text:   m.text,
          time:   new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
        }]);
      });
      return () => sub?.unsubscribe?.();
    } catch {}
  }, [stompClient, roomId]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    const name   = currentUser?.displayName || currentUser?.guestName || "You";
    const optimistic = {
      id:     Date.now(),
      name,
      avatar: name[0].toUpperCase(),
      color:  "#b8f724",
      text:   text.trim(),
      time:   new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
    };
    setMessages(prev => [...prev, optimistic]);

    if (stompClient?.connected) {
      try {
        stompClient.publish({ destination: `/app/room/${roomId}/chat`, body: JSON.stringify({ text: text.trim() }) });
      } catch {}
    } else {
      try { await chatAPI.send(roomId, text.trim()); } catch {}
    }
  }, [roomId, currentUser, stompClient]);

  const sendReaction = useCallback((emoji) => sendMessage(emoji), [sendMessage]);

  return { messages, sendMessage, sendReaction };
}
