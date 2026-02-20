import React, { useState, useEffect } from "react";
// === Scroll Animations Integration (added 2026-02-20) ===
import "../lib/scrollAnimations.js";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "../styles/index.css";
import { Navbar, Footer } from "./components/client";
import { SupportWidget } from "./components/SupportWidget";
import { Home } from "./components/Home";
import { Login, Register } from "./components/auth";
import { Dashboard } from "./components/dashboard/Dashboard";
import Profile from "./components/Profile";
import { authService } from "../lib/authUtils";
import { FormFeedback } from "./components/FormFeedback";

// ─── Route guards ─────────────────────────────────────────────────────────────

/** Visible only when NOT logged in. Logged-in users are sent to /dashboard */
const GuestRoute = ({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) => {
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

/** Visible only when logged in. Guests are sent to /login. */
const ProtectedRoute = ({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) => {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ─── Premium loading screen ───────────────────────────────────────────────────
const AppLoader = () => (
  <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
    {/* Background blobs */}
    <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-100/60 blur-3xl rounded-full pointer-events-none" />
    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-100/60 blur-3xl rounded-full pointer-events-none" />

    <div className="relative z-10 flex flex-col items-center gap-6">
      {/* Animated logo mark */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/40 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        {/* Spinning ring */}
        <div className="absolute -inset-2 rounded-[28px] border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
      </div>

      {/* Brand name */}
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tighter text-slate-900">
          GET<span className="text-blue-600">VERTEX</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Preparing your workspace…
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-600"
            style={{
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>

    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
);

// ─── App shell ────────────────────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

  // Which routes get the public navbar / footer
  const isAppRoute = ["/dashboard", "/profile"].some((p) =>
    location.pathname.startsWith(p)
  );
  const isAuthRoute = ["/login", "/register"].some((p) =>
    location.pathname.startsWith(p)
  );

  // ── Session init ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Optimistic restore — avoids flash of un-authenticated state
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch { }
    }

    const initializeAuth = async () => {
      try {
        const validatedUser = await authService.validateSession();
        setUser(validatedUser ?? null);
      } catch (err: any) {
        console.error("Auth init error:", err);
        setAuthError("Session error. Please refresh.");
        authService.logout(() => { });
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Scroll animations
    if (typeof window !== "undefined" && (window as any).ScrollAnimator) {
      (window as any).ScrollAnimator.addScrollClasses();
    }
  }, []);

  // ── Scroll-to-top on route change ───────────────────────────────────────────
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(location.hash.replace("#", ""));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  // ── Auth handlers ────────────────────────────────────────────────────────────
  const handleLogout = () => {
    authService.logout(navigate);
    setUser(null);
    setAuthError("");
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setAuthError("");
    // authService already called navigate(/dashboard) internally
  };

  // ── Auth loading ─────────────────────────────────────────────────────────────
  if (isLoading) return <AppLoader />;

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Public navbar — hidden on dashboard, profile, and auth pages */}
      {!isAppRoute && !isAuthRoute && (
        <Navbar user={user} onLogout={handleLogout} />
      )}

      {/* Auth error banner */}
      {authError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4">
          <FormFeedback
            status="error"
            message={authError}
            onDismiss={() => setAuthError("")}
            showRetry={true}
            onRetry={() => window.location.reload()}
            actionText="Refresh Page"
          />
        </div>
      )}

      <main>
        <Routes>
          {/* ── Public ──────────────────────────────────────────────────── */}
          <Route path="/" element={<Home user={user} />} />

          {/* ── Guest-only (redirect to dashboard when logged in) ────────── */}
          <Route
            path="/login"
            element={
              <GuestRoute user={user}>
                <Login onLoginSuccess={handleLoginSuccess} />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute user={user}>
                <Register onLoginSuccess={handleLoginSuccess} />
              </GuestRoute>
            }
          />

          {/* ── Protected ────────────────────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile user={user} />
              </ProtectedRoute>
            }
          />

          {/* /apply is no longer a standalone page — redirect to dashboard */}
          <Route
            path="/apply"
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
          />

          {/* ── Catch-all ─────────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Public footer — hidden on dashboard and profile pages */}
      {!isAppRoute && !isAuthRoute && <Footer />}

      {/* Floating support widget — only on public pages */}
      {!isAppRoute && <SupportWidget />}
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const App: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
