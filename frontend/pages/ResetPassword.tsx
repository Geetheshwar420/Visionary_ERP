import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'your email';

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
    }

    setIsLoading(true);

    // Mock API call with Skeleton loading
    setTimeout(() => {
      // Success - Redirect to login
      navigate('/login');
    }, 2500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
          
          <div className="p-8 pb-0 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 shadow-lg shadow-slate-500/30 mb-6">
               <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Sent code to <span className="font-bold text-slate-800 dark:text-slate-200">{email}</span>.
            </p>
          </div>

          <div className="p-8 pt-6">
            {isLoading ? (
               // Skeleton Loading State
               <div className="space-y-6 animate-pulse">
                <div className="space-y-1.5">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    </div>
                </div>
                <div className="h-12 w-full bg-slate-300 dark:bg-slate-600 rounded-xl mt-4" />
               </div>
            ) : (
              // Actual Form
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-50/50 dark:bg-red-900/20 backdrop-blur-sm text-red-600 dark:text-red-400 p-3 rounded-xl text-xs flex items-center border border-red-100 dark:border-red-800/50 justify-center font-medium animate-in slide-in-from-top-1">
                      <AlertCircle size={14} className="mr-2" /> {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center">Verification Code</label>
                    <input
                        type="text"
                        maxLength={6}
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all text-slate-900 dark:text-white placeholder-slate-300 text-center text-lg tracking-[0.5em] font-mono font-bold"
                        placeholder="------"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">New Pass</label>
                    <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="••••••"
                        />
                    </div>
                    </div>
                    <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Confirm</label>
                    <div className="relative group">
                        <CheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="••••••"
                        />
                    </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5 flex items-center justify-center group"
                >
                    Reset Password <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}