import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, TrendingUp, DollarSign, Menu, X, LogOut, Moon, Sun, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  toggleTheme: () => void;
  isDark: boolean;
  user: { name: string; email: string; photoURL?: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  onLogout,
  toggleTheme,
  isDark,
  user
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Persist collapsed state
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: t('inventory'), path: '/inventory', icon: Package },
    { id: 'forecast', label: t('forecast'), path: '/forecast', icon: TrendingUp },
    { id: 'financials', label: t('financials'), path: '/financials', icon: DollarSign },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out flex flex-col
    bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:relative md:translate-x-0
    ${isCollapsed ? 'md:w-20' : 'md:w-64'}
    w-64
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className={`flex items-center ${isCollapsed ? 'flex-col justify-center gap-4' : 'justify-between'} p-6 pb-2 flex-shrink-0 relative transition-all duration-300`}>
          <div className="flex items-center space-x-3 group cursor-pointer overflow-hidden" onClick={() => isCollapsed && setIsCollapsed(false)}>
            <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Eye className="text-white" size={20} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap animate-in fade-in duration-200">
                <span className="font-heading font-bold text-lg leading-tight text-slate-900 dark:text-white">Visionary</span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Precision Inventory</span>
              </div>
            )}
          </div>

          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors absolute right-4 top-6" title="Close menu">
            <X size={24} />
          </button>

          {/* Desktop Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? 'mt-2' : ''}`}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Separator */}
        <div className="px-6 py-4">
          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Check if current path starts with item path (handles nested routes like /product/:id being related to inventory if needed, strictly matching here for simplicity)
            const isActive = location.pathname.startsWith(item.path);

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-3 rounded-xl transition-all duration-200 font-medium group relative overflow-hidden ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                )}
                <Icon size={20} className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                {!isCollapsed && (
                  <span className="whitespace-nowrap animate-in fade-in duration-200">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
          {/* Language Switcher */}
          <LanguageSwitcher
            position="up"
            minimized={isCollapsed}
          />

          <button
            onClick={toggleTheme}
            title={isCollapsed ? (isDark ? t('darkMode') : t('lightMode')) : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-700`}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
              {!isCollapsed && <span>{isDark ? t('darkMode') : t('lightMode')}</span>}
            </div>
          </button>

          <button
            onClick={onLogout}
            title={isCollapsed ? t('signOut') : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 px-4'} py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="whitespace-nowrap">{t('signOut')}</span>}
          </button>
        </div>

        <div
          onClick={() => {
            navigate('/profile');
            if (window.innerWidth < 768) setIsOpen(false);
          }}
          className={`mx-4 mb-4 mt-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex-shrink-0 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group overflow-hidden ${isCollapsed ? 'flex justify-center' : ''}`}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform overflow-hidden font-heading">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-xs">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden animate-in fade-in duration-200">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate uppercase tracking-wider">{t('storeOwner')}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;