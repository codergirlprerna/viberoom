// src/App.jsx
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase/firebase";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import Login       from "./pages/Login";
import Signup      from "./pages/Signup";
import Dashboard   from "./pages/Dashboard";
import RoomPage    from "./pages/RoomPage";
import JoinRoom    from "./pages/JoinRoom";
import Profile     from "./pages/Profile";
import NotFound    from "./pages/NotFound";

function Spinner() {
  return (
    <div className="min-h-screen bg-[#080a08] flex items-center justify-center">
      <div style={{width:32,height:32,border:"3px solid rgba(184,247,36,0.2)",borderTopColor:"#b8f724",borderRadius:"9999px",animation:"spin 0.7s linear infinite"}} />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

// Allows both logged-in users AND guests (who have a guestName in sessionStorage)
function RoomRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  const guestName = sessionStorage.getItem("guestName");
  // Allow if: logged in OR has a guest name set
  if (user || guestName) return children;
  // Otherwise redirect to login
  return <Navigate to="/login" replace />;
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("guestName");
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onLogin={() => navigate("/login")} onSignup={() => navigate("/signup")} />} />
      <Route path="/login"  element={<AuthRoute><Login  onSignup={() => navigate("/signup")} onSuccess={() => navigate("/dashboard")} /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><Signup onLogin={() => navigate("/login")}   onSuccess={() => navigate("/dashboard")} /></AuthRoute>} />

      {/* Guest join — no auth needed */}
      <Route path="/join/:roomId" element={<JoinRoom />} />

      {/* Room — open to logged-in users AND guests */}
      <Route path="/room/:roomId" element={<RoomRoute><RoomPage onLeave={() => navigate("/dashboard")} /></RoomRoute>} />

      {/* Protected pages */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={{ name: user?.displayName || user?.email?.split("@")[0] || "User" }} onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*"          element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
