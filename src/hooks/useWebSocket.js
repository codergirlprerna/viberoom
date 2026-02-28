// src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";

export function useWebSocket(roomId) {
  const [connected,  setConnected]  = useState(false);
  const stompClient                  = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    let client;

    const connect = async () => {
      try {
        const { Client }  = await import("@stomp/stompjs");
        const SockJS      = (await import("sockjs-client")).default;
        const { auth }    = await import("../firebase/firebase");

        let token = null;
        try {
          if (auth.currentUser) token = await auth.currentUser.getIdToken();
        } catch { /* guest — no token */ }

        client = new Client({
          webSocketFactory: () => new SockJS(WS_URL),
          connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
          reconnectDelay: 5000,
          onConnect: () => {
            setConnected(true);
            client.publish({ destination: `/app/room/${roomId}/join`, body: "{}" });
          },
          onDisconnect: () => setConnected(false),
          onStompError: () => {}, // silent — backend not up yet
        });

        client.activate();
        stompClient.current = client;
      } catch {
        // sockjs or stomp not available — silent fail
      }
    };

    connect();

    return () => {
      if (stompClient.current) {
        try { stompClient.current.publish({ destination: `/app/room/${roomId}/leave`, body: "{}" }); } catch {}
        try { stompClient.current.deactivate(); } catch {}
      }
    };
  }, [roomId]);

  return { stompClient: stompClient.current, connected };
}
