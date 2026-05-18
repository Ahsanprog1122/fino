import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

function AppRoutes() {
  const { pathname } = useLocation();
  const showFloatingToggle = pathname !== '/' && pathname !== '/dashboard';

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      {showFloatingToggle && (
        <ThemeToggle className="fixed bottom-6 right-6 z-[100] shadow-lg" />
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen font-['Inter'] selection:bg-orange-500 selection:text-white transition-colors duration-200">
        <Router>
          <AppRoutes />
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
