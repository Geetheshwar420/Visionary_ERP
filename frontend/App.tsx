import React, { useState, useEffect, useCallback } from 'react';
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
import { MOCK_PRODUCTS, INITIAL_INSIGHTS } from './constants';
import { Product, Insight } from './types';
import { productsApi, insightsApi, authApi, getAccessToken } from './services/api';

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
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string; email: string; photoURL?: string } | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // App State - Use mock data as fallback
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [insights, setInsights] = useState<Insight[]>(INITIAL_INSIGHTS);

  // Fetch data from backend when authenticated
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch products
      const productsResult = await productsApi.getAll({ limit: 100 });
      if (productsResult.success && productsResult.data?.products.length > 0) {
        setProducts(productsResult.data.products);
      }

      // Fetch insights
      const insightsResult = await insightsApi.getAll({ limit: 20 });
      if (insightsResult.success && insightsResult.data && insightsResult.data.length > 0) {
        setInsights(insightsResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Keep using mock data on error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    // Get fresh user from localStorage (it was set in authApi.login)
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    // Fetch fresh data after login
    fetchData();
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    // Reset to mock data
    setProducts(MOCK_PRODUCTS);
    setInsights(INITIAL_INSIGHTS);
  };

  return (
    <LanguageProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing toggleTheme={toggleTheme} isDark={theme === 'dark'} isAuthenticated={isAuthenticated} />} />

          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} toggleTheme={toggleTheme} isDark={theme === 'dark'} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <Signup toggleTheme={toggleTheme} isDark={theme === 'dark'} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route path="/verify-email" element={!isAuthenticated ? <VerifyEmail onVerified={handleLogin} /> : <Navigate to="/dashboard" replace />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} />
          <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" replace />} />

          {/* Protected Routes Wrapper */}
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans transition-colors duration-300">
                  <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    onLogout={handleLogout}
                    toggleTheme={toggleTheme}
                    isDark={theme === 'dark'}
                    user={user}
                  />

                  <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative">
                    {/* Mobile Header */}
                    <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">Visionary ERP</span>
                      </div>
                      <button onClick={() => setIsSidebarOpen(true)} title="Open navigation menu" className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <Menu size={24} />
                      </button>
                    </header>

                    <div className="flex-1 overflow-auto p-4 md:p-8">
                      <div className="max-w-7xl mx-auto">
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route
                            path="/dashboard"
                            element={
                              <Dashboard
                                products={products}
                                insights={insights}
                                setInsights={setInsights}
                              />
                            }
                          />
                          <Route
                            path="/inventory"
                            element={<Inventory products={products} setProducts={setProducts} />}
                          />
                          <Route
                            path="/product/:id"
                            element={<ProductDetails products={products} insights={insights} />}
                          />
                          <Route
                            path="/forecast"
                            element={<Forecast />}
                          />
                          <Route
                            path="/financials"
                            element={<Financials />}
                          />
                          <Route
                            path="/profile"
                            element={<UserProfile user={user} />}
                          />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </div>
                    </div>

                    {/* Global AI Chat Assistant */}
                    <AIChat products={products} />
                  </main>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;