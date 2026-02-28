// src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from "react";

// Auto-switch to wss:// in production (HTTPS)
const getWsUrl = () => {
  const url = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";
  // SockJS handles http/https automatically, but let's ensure correct protocol
  return url;
};

const WS_URL = getWsUrl();

export function useWebSocket(roomId) {
  const [connected, setConnected] = useState(false);
  const stompClient = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    let client;
    let active = true;

    const connect = async () => {
      try {
        const { Client } = await import("@stomp/stompjs");
        const SockJS     = (await import("sockjs-client")).default;
        const { auth }   = await import("../firebase/firebase");

        let token = null;
        try {
          if (auth.currentUser) token = await auth.currentUser.getIdToken();
        } catch { /* guest */ }

        client = new Client({
          webSocketFactory: () => new SockJS(WS_URL),
          connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            if (!active) return;
            setConnected(true);
            try {
              client.publish({ destination: `/app/room/${roomId}/join`, body: "{}" });
            } catch {}
          },
          onDisconnect: () => {
            if (!active) return;
            setConnected(false);
          },
          onStompError: () => {},
          onWebSocketError: () => {},
        });

        client.activate();
        stompClient.current = client;
      } catch {
        // silent fail — works without WebSocket
      }
    };

    connect();

    return () => {
      active = false;
      clearTimeout(reconnectTimer.current);
      if (stompClient.current) {
        try { stompClient.current.publish({ destination: `/app/room/${roomId}/leave`, body: "{}" }); } catch {}
        try { stompClient.current.deactivate(); } catch {}
        stompClient.current = null;
      }
      setConnected(false);
    };
  }, [roomId]);

  return { stompClient: stompClient.current, connected };
}
