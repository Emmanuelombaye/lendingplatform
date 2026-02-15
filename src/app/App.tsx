import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import '../styles/index.css';
import {
  Navbar,
  Footer,
  ProgressTracker,
  ApplicationFlow
} from './components/client';
import { Home } from './components/Home';
import { Login, Register } from './components/auth';
import { WelcomeGate } from './components/WelcomeGate';
import { UserDashboard } from './components/dashboard';

// Wrapper to handle conditional Gate rendering and Navigation logic
const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [skippedGate, setSkippedGate] = useState(() => {
    return localStorage.getItem('skippedGate') === 'true';
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for logged in user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle scroll to top on route change
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('skippedGate');
    setUser(null);
    setSkippedGate(false);
    navigate('/');
  };

  const handleSkipGate = () => {
    localStorage.setItem('skippedGate', 'true');
    setSkippedGate(true);
    // Stay on current route or go home if on root? 
    // Usually gate is an overlay. If we skip, we just remove overlay.
  };


  const showGate = !user && !skippedGate &&
    !['/login', '/register'].includes(location.pathname);

  if (showGate) {
    return (
      <WelcomeGate
        onSkip={handleSkipGate}
        onLoginSuccess={(u) => { setUser(u); setSkippedGate(true); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        user={user}
        onLogout={handleLogout}
      />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> :
              <Login onLoginSuccess={(u) => { setUser(u); setSkippedGate(true); }} />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" /> :
              <Register onLoginSuccess={(u) => { setUser(u); setSkippedGate(true); }} />
          } />
          <Route path="/dashboard" element={
            user ? <UserDashboard /> : <Navigate to="/login" />
          } />
          <Route path="/apply" element={
            // Assuming apply page wants user to be logged in? 
            // The original code didn't seem to enforce it strictly in the view check, but it's likely.
            // Let's enforce it for safety, or allow it if designed otherwise.
            // Original: {view === 'apply' && ...}
            // Let's assume protected for now as it maps to an application flow.
            <div className="pt-24 pb-20 px-6 bg-slate-50 min-h-screen">
              <div className="max-w-[1200px] mx-auto">
                <ProgressTracker currentStep={1} />
                <ApplicationFlow />
              </div>
            </div>
          } />
        </Routes>
      </main>

      <Footer />
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
