// src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Axios instance + every API call Viberoom needs.
// All endpoints match the Spring Boot controllers we'll build next.
// To switch from mock → real: just set VITE_API_URL in your .env file.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import { auth } from "../firebase/firebase";

// ── Base instance ──
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ── Request interceptor: attach Firebase JWT to every request ──
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Failed to get Firebase token:", err);
  }
  return config;
});

// ── Response interceptor: normalize errors ──
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data ||
      err.message ||
      "Something went wrong";
    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// Spring Boot validates Firebase JWT and creates/fetches local user record
// ─────────────────────────────────────────────────────────────────────────────
export const authAPI = {
  // Called after Firebase login — syncs user to our DB
  // POST /api/auth/sync
  syncUser: (data) =>
    api.post("/auth/sync", data),
  // { uid, email, displayName, photoURL }

  // GET /api/auth/me
  getMe: () =>
    api.get("/auth/me"),
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOMS
// ─────────────────────────────────────────────────────────────────────────────
export const roomAPI = {
  // Create a new room (host only)
  // POST /api/rooms
  create: (data) =>
    api.post("/rooms", data),
  // { name, mood, isPublic }

  // Get all public rooms (Explore page)
  // GET /api/rooms/public
  getPublic: () =>
    api.get("/rooms/public"),

  // Get rooms created by logged-in user (My Rooms)
  // GET /api/rooms/my
  getMine: () =>
    api.get("/rooms/my"),

  // Get single room by ID
  // GET /api/rooms/:id
  getById: (roomId) =>
    api.get(`/rooms/${roomId}`),

  // Delete a room (host only)
  // DELETE /api/rooms/:id
  delete: (roomId) =>
    api.delete(`/rooms/${roomId}`),

  // Join a room (logged-in user)
  // POST /api/rooms/:id/join
  join: (roomId) =>
    api.post(`/rooms/${roomId}/join`),

  // Join as guest (no account needed — just a display name)
  // POST /api/rooms/:id/join/guest
  joinAsGuest: (roomId, guestName) =>
    api.post(`/rooms/${roomId}/join/guest`, { guestName }),

  // Leave a room
  // POST /api/rooms/:id/leave
  leave: (roomId) =>
    api.post(`/rooms/${roomId}/leave`),

  // Get current listeners in a room
  // GET /api/rooms/:id/listeners
  getListeners: (roomId) =>
    api.get(`/rooms/${roomId}/listeners`),

  // Get shareable invite link info
  // GET /api/rooms/:id/invite
  getInvite: (roomId) =>
    api.get(`/rooms/${roomId}/invite`),
};

// ─────────────────────────────────────────────────────────────────────────────
// QUEUE
// ─────────────────────────────────────────────────────────────────────────────
export const queueAPI = {
  // Get current queue for a room
  // GET /api/rooms/:id/queue
  get: (roomId) =>
    api.get(`/rooms/${roomId}/queue`),

  // Add song to queue (host only)
  // POST /api/rooms/:id/queue
  add: (roomId, song) =>
    api.post(`/rooms/${roomId}/queue`, song),
  // { youtubeId, title, artist, duration, thumbnail }

  // Remove song from queue (host only)
  // DELETE /api/rooms/:id/queue/:songId
  remove: (roomId, songId) =>
    api.delete(`/rooms/${roomId}/queue/${songId}`),

  // Reorder queue (host only)
  // PUT /api/rooms/:id/queue/reorder
  reorder: (roomId, orderedIds) =>
    api.put(`/rooms/${roomId}/queue/reorder`, { orderedIds }),
};

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER SYNC
// These are called by the host to update play state for everyone
// Actual real-time delivery happens via WebSocket (STOMP)
// These HTTP calls persist the state so late joiners get current position
// ─────────────────────────────────────────────────────────────────────────────
export const playerAPI = {
  // Host plays/pauses
  // POST /api/rooms/:id/player/play-pause
  playPause: (roomId, isPlaying) =>
    api.post(`/rooms/${roomId}/player/play-pause`, { isPlaying }),

  // Host seeks to timestamp
  // POST /api/rooms/:id/player/seek
  seek: (roomId, timestamp) =>
    api.post(`/rooms/${roomId}/player/seek`, { timestamp }),

  // Host skips to next/prev
  // POST /api/rooms/:id/player/skip
  skip: (roomId, direction) =>
    api.post(`/rooms/${roomId}/player/skip`, { direction }),
  // direction: "next" | "prev"

  // Get current player state (for late joiners)
  // GET /api/rooms/:id/player
  getState: (roomId) =>
    api.get(`/rooms/${roomId}/player`),
  // Returns: { youtubeId, isPlaying, timestamp, updatedAt }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAT
// Real-time messages via WebSocket, but HTTP fallback for history
// ─────────────────────────────────────────────────────────────────────────────
export const chatAPI = {
  // Get last N messages (for when you join mid-session)
  // GET /api/rooms/:id/chat/history
  getHistory: (roomId, limit = 50) =>
    api.get(`/rooms/${roomId}/chat/history?limit=${limit}`),

  // Send a message (also sent via WebSocket for real-time, this is fallback)
  // POST /api/rooms/:id/chat
  send: (roomId, text) =>
    api.post(`/rooms/${roomId}/chat`, { text }),
};

// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE SEARCH
// Backend proxies YouTube Data API v3 to keep API key secret
// ─────────────────────────────────────────────────────────────────────────────
export const youtubeAPI = {
  // Search songs
  // GET /api/youtube/search?q=query
  search: (query) =>
    api.get(`/youtube/search?q=${encodeURIComponent(query)}`),
  // Returns: [{ youtubeId, title, artist, duration, thumbnail }]

  // Get video details by ID
  // GET /api/youtube/video/:id
  getVideo: (youtubeId) =>
    api.get(`/youtube/video/${youtubeId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────────────────────────────────────
export const userAPI = {
  // Update display name / avatar color
  // PUT /api/users/me
  updateProfile: (data) =>
    api.put("/users/me", data),
  // { displayName, avatarColor }

  // Get user's room history
  // GET /api/users/me/history
  getHistory: () =>
    api.get("/users/me/history"),
};

export default api;
