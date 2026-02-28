// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#080a08] flex items-center justify-center">
      <div style={{
        width: 32, height: 32,
        border: "3px solid rgba(184,247,36,0.2)",
        borderTopColor: "#b8f724",
        borderRadius: "9999px",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  );

  return user ? children : <Navigate to="/login" replace />;
}
