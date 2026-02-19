import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import "../styles/index.css";
import {
  Navbar,
  Footer,
  ProgressTracker,
  ApplicationFlow,
} from "./components/client";
import { SupportWidget } from "./components/SupportWidget";
import { Home } from "./components/Home";
import { Login, Register } from "./components/auth";
import { Dashboard } from "./components/dashboard/Dashboard";
import Profile from "./components/Profile";
import { authService } from "../lib/authUtils";
import { FormFeedback } from "./components/FormFeedback";

// Wrapper to handle conditional Gate rendering and Navigation logic
const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [pendingApplication, setPendingApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Validate session and initialize user state
    const initializeAuth = async () => {
      setIsLoading(true);
      setAuthError("");

      try {
        // Validate existing session
        const validatedUser = await authService.validateSession();

        if (validatedUser) {
          setUser(validatedUser);
        } else {
          // Clear any invalid session data
          setUser(null);
        }

        // Check for pending application
        const pendingApp = authService.getPendingApplication();
        if (pendingApp) {
          setPendingApplication(pendingApp);
        }
      } catch (error: any) {
        console.error("Auth initialization error:", error);
        setAuthError("Authentication error occurred. Please refresh the page.");
        // Clear potentially corrupted auth data
        authService.logout(() => { });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Save pending application to localStorage when it changes
  useEffect(() => {
    if (pendingApplication) {
      localStorage.setItem(
        "pendingApplication",
        JSON.stringify(pendingApplication),
      );
    } else {
      localStorage.removeItem("pendingApplication");
    }
  }, [pendingApplication]);

  // Handle scroll to top on route change
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const handleLogout = () => {
    authService.logout(navigate);
    setUser(null);
    setPendingApplication(null);
    setAuthError("");
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setAuthError("");
  };

  // Show loading state while initializing auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {!isDashboard && <Navbar user={user} onLogout={handleLogout} />}

      {/* Auth Error Display */}
      {authError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
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
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              user ? (
                pendingApplication ? (
                  <Navigate to="/apply" />
                ) : (
                  <Navigate to="/dashboard" />
                )
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                pendingApplication ? (
                  <Navigate to="/apply" />
                ) : (
                  <Navigate to="/dashboard" />
                )
              ) : (
                <Register onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/apply"
            element={
              <div className="pt-24 pb-20 px-6 bg-slate-50 min-h-screen">
                <div className="max-w-[1200px] mx-auto">
                  <ProgressTracker currentStep={1} />
                  <ApplicationFlow
                    user={user}
                    pendingApplication={pendingApplication}
                    setPendingApplication={setPendingApplication}
                  />
                </div>
              </div>
            }
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>

      {!isDashboard && <Footer />}

      {/* Support Widget */}
      <SupportWidget />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
