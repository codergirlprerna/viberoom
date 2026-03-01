// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try { await authAPI.syncUser(); } catch { /* silent */ }
        setUser(firebaseUser);
        // Clear any guest session when real user logs in
        sessionStorage.removeItem("guestName");
        sessionStorage.removeItem("guestRoomId");
      } else {
        const guestName = sessionStorage.getItem("guestName");
        if (guestName) {
          setUser({
            uid: `guest_${Date.now()}`,
            displayName: guestName,
            email: null,
            isGuest: true,
          });
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
