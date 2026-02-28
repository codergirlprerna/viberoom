// src/hooks/useRoom.js
import { useState, useEffect, useCallback } from "react";
import { roomAPI } from "../services/api";

export function useRoom(roomId) {
  const [room,    setRoom]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) { setLoading(false); return; }
    const fetch = async () => {
      try {
        const res = await roomAPI.getById(roomId);
        setRoom(res.data);
      } catch {
        // Backend not up — use a mock room so page still renders
        setRoom({ id: roomId, name: "My Room", mood: "Chill", isPublic: true, hostId: null });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [roomId]);

  return { room, loading };
}

export function useMyRooms() {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roomAPI.getMine();
      setRooms(res.data);
    } catch {
      setRooms([]); // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { rooms, loading, refetch: fetch };
}

export function usePublicRooms() {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await roomAPI.getPublic();
        setRooms(res.data);
      } catch {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { rooms, loading };
}

export function useCreateRoom() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const createRoom = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await roomAPI.create(data);
      return res.data;
    } catch (err) {
      setError(err.message);
      // Return a mock room so UI still works without backend
      return { id: Date.now().toString(), ...data, listeners: 1 };
    } finally {
      setLoading(false);
    }
  };

  return { createRoom, loading, error };
}

export function useJoinRoom(roomId) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const joinAsUser = async () => {
    setLoading(true);
    try { await roomAPI.join(roomId); return true; }
    catch { return true; } // allow through even without backend
    finally { setLoading(false); }
  };

  const joinAsGuest = async (guestName) => {
    setLoading(true);
    try { await roomAPI.joinAsGuest(roomId, guestName); return true; }
    catch { return true; }
    finally { setLoading(false); }
  };

  return { joinAsUser, joinAsGuest, loading, error };
}

export function useListeners(roomId) {
  const [listeners, setListeners] = useState([]);

  useEffect(() => {
    if (!roomId) return;
    const fetch = async () => {
      try {
        const res = await roomAPI.getListeners(roomId);
        setListeners(res.data);
      } catch { /* silent */ }
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [roomId]);

  return listeners;
}
