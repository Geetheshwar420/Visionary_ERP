import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Forecast from './pages/Forecast';
import ProductDetails from './pages/ProductDetails';
import UserProfile from './pages/UserProfile';
import Financials from './pages/Financials';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';
import AIChat from './components/AIChat';
import { LanguageProvider } from './contexts/LanguageContext';
import { authApi, getAccessToken } from './services/api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true' && !!getAccessToken();
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string; photoURL?: string } | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Apply Theme & PWA Theme Color
  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (metaThemeColor) metaThemeColor.setAttribute("content", "#0f172a");
    } else {
      document.documentElement.classList.remove('dark');
      if (metaThemeColor) metaThemeColor.setAttribute("content", "#F8FAFC");
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('isAuthenticated');
    }
  };

  return (
    <LanguageProvider>
      <HashRouter>
        <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
          {!isAuthenticated ? (
            <div className="animate-in fade-in duration-500">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login onLogin={handleLogin} toggleTheme={toggleTheme} isDark={theme === 'dark'} />} />
                <Route path="/signup" element={<Signup toggleTheme={toggleTheme} isDark={theme === 'dark'} />} />
                <Route path="/verify-email" element={<VerifyEmail onVerified={handleLogin} />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          ) : (
            <div className="flex h-screen overflow-hidden">
              <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onLogout={handleLogout}
                user={user}
                toggleTheme={toggleTheme}
                theme={theme}
              />

              <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0 pb-20 md:pb-0 relative">
                {/* Mobile Header */}
                <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 rounded-lg">
                      <div className="w-5 h-5 border-2 border-white rounded-sm flex items-center justify-center font-bold text-[10px] text-white">V</div>
                    </div>
                    <span className="font-heading font-bold text-slate-800 dark:text-white">Visionary ERP</span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-slate-600 dark:text-slate-400"
                  >
                    <Menu size={24} />
                  </button>
                </header>

                <div className="max-w-[1600px] mx-auto p-4 md:p-8 min-h-full">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/forecast" element={<Forecast />} />
                    <Route path="/financials" element={<Financials />} />
                    <Route path="/profile" element={<UserProfile user={user} />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>

                <AIChat />
              </main>
            </div>
          )}
        </div>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;