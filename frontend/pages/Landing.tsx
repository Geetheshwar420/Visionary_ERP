import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, LayoutDashboard, TrendingUp, 
  ShieldCheck, Zap, Moon, Sun, ChevronRight, BarChart3, 
  Package, Globe
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface LandingProps {
  toggleTheme: () => void;
  isDark: boolean;
  isAuthenticated: boolean;
}

const Landing: React.FC<LandingProps> = ({ toggleTheme, isDark, isAuthenticated }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900 dark:text-white tracking-tight">{t('appName')}</span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                {t('dashboard')} <ArrowRight size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden md:block px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t('signIn')}
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  {t('getStarted')}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wide mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              v2.0 Now Available with AI Forecasting
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              {t('heroTitle')}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t('heroSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-lg font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {t('startFreeTrial')} <ArrowRight size={20} />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-lg font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                {t('viewDemo')}
              </button>
            </div>
          </div>

          {/* Feature Grid (Bento Box) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            
            {/* Main AI Feature */}
            <div className="md:col-span-2 row-span-1 md:row-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10" />
              <div className="p-8 h-full flex flex-col relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                  <Zap size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('aiAnalyst')}</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  Stop analyzing spreadsheets. Ask questions like "How can I improve dairy margins?" and get actionable strategies instantly.
                </p>
                <div className="mt-auto pt-8">
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                        <Sparkles size={14} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Visionary AI</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">Based on velocity data, discounting Artisan Cheese by 20% will clear stock before expiry.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-8 flex flex-col group hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Package size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('smartInventory')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Real-time tracking with automatic expiry alerts and reorder points.
              </p>
              <div className="mt-auto flex items-center justify-end text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:translate-x-1 transition-transform cursor-pointer">
                Explore <ChevronRight size={16} />
              </div>
            </div>

            {/* Analytics Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-8 flex flex-col group hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('predictiveForecasting')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                See the future of your financials with 94% accuracy models.
              </p>
              <div className="mt-auto flex items-center justify-end text-emerald-600 dark:text-emerald-400 font-bold text-sm group-hover:translate-x-1 transition-transform cursor-pointer">
                View Charts <ChevronRight size={16} />
              </div>
            </div>
            
             {/* Global Scale */}
             <div className="md:col-span-3 rounded-3xl bg-slate-900 dark:bg-black text-white p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-indigo-900/50 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-xl">
                    <h3 className="text-3xl font-heading font-bold mb-4">Ready to scale your operation?</h3>
                    <p className="text-slate-400 mb-6">Join 10,000+ store owners using Visionary ERP to modernize their supply chain.</p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-emerald-400" size={20} />
                            <span className="text-sm font-medium">Enterprise Security</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Globe className="text-blue-400" size={20} />
                            <span className="text-sm font-medium">Global Support</span>
                        </div>
                    </div>
                </div>
                <div className="relative z-10">
                    <button 
                      onClick={() => navigate('/signup')}
                      className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg shadow-white/10"
                    >
                        {t('getStarted')}
                    </button>
                </div>
             </div>

          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                 <Sparkles className="text-white dark:text-slate-900 w-4 h-4" />
             </div>
             <span className="font-bold text-slate-900 dark:text-white">{t('appName')}</span>
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-sm">
             &copy; {new Date().getFullYear()} Visionary Inc. All rights reserved.
           </p>
           <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
             <a href="#" className="hover:text-indigo-500">Privacy</a>
             <a href="#" className="hover:text-indigo-500">Terms</a>
             <a href="#" className="hover:text-indigo-500">Contact</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;