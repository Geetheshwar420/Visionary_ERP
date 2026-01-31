import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '@/config/firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await resetPassword(email);
      // Success - In standard Firebase, the email is sent and user is directed to check inbox
      alert('Password reset link sent to your email!');
      navigate('/login');
    } catch (err: any) {
      console.error('Reset error:', err);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">

          <div className="p-8 pb-0 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 mb-6">
              <KeyRound className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">Forgot Password?</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="p-8 pt-6">
            {isLoading ? (
              // Skeleton Loading State
              <div className="space-y-6 animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
                <div className="h-12 w-full bg-slate-300 dark:bg-slate-600 rounded-xl" />
                <div className="flex justify-center">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ) : (
              // Actual Form
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5 flex items-center justify-center group"
                >
                  Send Reset Link <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}

            {!isLoading && (
              <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
                <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center gap-1 transition-colors">
                  <ArrowLeft size={12} /> Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}