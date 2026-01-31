import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { auth, sendVerification } from '../config/firebase';

interface VerifyEmailProps {
  onVerified: () => void;
}

export default function VerifyEmail({ onVerified }: VerifyEmailProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const isFirebase = location.state?.isFirebase || false;

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isFirebase) {
      // For Firebase, we check if the user has been verified
      setIsLoading(true);
      try {
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            onVerified();
            navigate('/dashboard');
          } else {
            setError('Email still not verified. Please click the link in your inbox.');
          }
        } else {
          setError('User session not found. Please log in again.');
        }
      } catch (err) {
        setError('Failed to refresh user state.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authApi.verifyEmail(email, code);
      if (result.success) {
        onVerified();
        navigate('/dashboard');
      } else {
        setError(result.error || 'Verification failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);
      if (isFirebase) {
        await sendVerification();
      } else {
        await authApi.resendCode(email);
      }
      setTimer(30);
      setError('');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">

          <div className="p-8 pb-0 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 mb-6">
              <Mail className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We've sent a verification {isFirebase ? 'link' : 'code'} to <br />
              <span className="font-bold text-slate-800 dark:text-slate-200">{email}</span>
            </p>
          </div>

          <div className="p-8 pt-6">
            <form onSubmit={handleVerify} className="space-y-6">
              {error && (
                <div className="bg-red-50/50 dark:bg-red-900/20 backdrop-blur-sm text-red-600 dark:text-red-400 p-3 rounded-xl text-xs flex items-center border border-red-100 dark:border-red-800/50 justify-center font-medium animate-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              {!isFirebase && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center">Verification Code</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder-slate-300 text-center text-xl tracking-[0.5em] font-mono font-bold"
                      placeholder="------"
                    />
                  </div>
                </div>
              )}

              {isFirebase && (
                <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200 text-sm text-center">
                  Click the link in the email we sent to verify your account, then click the button below.
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (!isFirebase && code.length !== 6)}
                className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></span>
                ) : (
                  <>
                    {isFirebase ? 'I have verified' : 'Verify Account'} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Didn't receive the email?
              </p>

              <button
                onClick={handleResend}
                disabled={timer > 0}
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto gap-2"
              >
                <RefreshCw size={14} className={timer > 0 ? 'animate-spin' : ''} />
                {timer > 0 ? `Resend in ${timer}s` : (isFirebase ? 'Resend Link' : 'Resend Email')}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
              <Link to="/signup" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center gap-1 transition-colors">
                <ArrowLeft size={12} /> Back to Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}