import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Shield, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import logo from '../../assets/KBC-PODCASTS-LOGO-1.png';

export function LoginPage() {
  const [view, setView] = useState<'login' | 'forgot-password' | 'forgot-success'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Passwords are not strictly checked in demo, just email
      const success = login(email);

      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Please try again or use a demo account.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your work email address');
      return;
    }

    setIsLoading(true);

    // Simulate Firebase Auth password reset email
    setTimeout(() => {
      setIsLoading(false);
      setView('forgot-success');
    }, 1000);
  };

  return (
    <div className="min-h-screen max-w-none flex items-center justify-center bg-linear-to-br from-blue-950 via-blue-900 to-[#0a0a20] p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-md p-3 border border-white/10 shadow-[0_0_30px_rgba(46,49,146,0.3)]">
            <img src={logo} alt="KBC Logo" className="w-full h-auto object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Lineup</h1>
          <p className="text-blue-300 font-medium tracking-wide text-sm uppercase">Editorial Content Calendar</p>
        </div>

        {/* Auth Card */}
        <div className="bg-blue-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
          
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-600 via-blue-600 to-green-600"></div>

          <div className="px-8 py-8">
            {view === 'login' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
                  <p className="text-blue-300 text-sm">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200 text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      Work Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@kbc.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-blue-950/50 border-white/10 text-white placeholder:text-slate-500 h-12 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-200 text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-400" />
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => setView('forgot-password')}
                        className="text-xs font-medium text-blue-400 hover:text-white transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-blue-950/50 border-white/10 text-white placeholder:text-slate-500 h-12 pr-10 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                      <div className="mt-0.5 font-bold">!</div>
                      <p>{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 mt-2 bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-600 text-white font-medium border border-white/10 shadow-lg shadow-blue-900/20 transition-all duration-300"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </>
            )}

            {view === 'forgot-password' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
                  <p className="text-blue-300 text-sm leading-relaxed">
                    Enter your work email address and we'll send you a secure link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-slate-200 text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      Work Email Address
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your.email@kbc.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-blue-950/50 border-white/10 text-white placeholder:text-slate-500 h-12 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                      <div className="mt-0.5 font-bold">!</div>
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="pt-2 space-y-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-600 text-white font-medium border border-white/10 shadow-lg shadow-blue-900/20 transition-all duration-300"
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setView('login')}
                      className="w-full h-12 text-blue-300 hover:text-white hover:bg-white/5"
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              </>
            )}

            {view === 'forgot-success' && (
              <div className="text-center py-4 space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center border border-green-600/20">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Check Your Email</h2>
                  <p className="text-blue-300 text-sm leading-relaxed max-w-xs mx-auto">
                    We've sent a password reset link to <span className="text-white font-medium">{email}</span>. The link will expire in 1 hour.
                  </p>
                </div>
                <div className="pt-4">
                  <Button
                    type="button"
                    onClick={() => setView('login')}
                    className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-all duration-300"
                  >
                    Return to Sign In
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Demo Info */}
          {view === 'login' && (
            <div className="bg-blue-950/40 px-8 py-5 border-t border-white/5">
              <p className="text-xs font-medium text-blue-400 mb-3 uppercase tracking-wider">Demo Access</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-md px-3 py-2">
                  <span className="text-xs font-medium text-white">Super Admin</span>
                  <span className="text-xs text-blue-300 font-mono">sarah.johnson@kbc.com</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-md px-3 py-2">
                  <span className="text-xs font-medium text-white">Editor</span>
                  <span className="text-xs text-blue-300 font-mono">michael.chen@kbc.com</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-md px-3 py-2">
                  <span className="text-xs font-medium text-white">Assignee</span>
                  <span className="text-xs text-blue-300 font-mono">emily.davis@kbc.com</span>
                </div>
              </div>
              <p className="text-[10px] text-blue-400 mt-3 text-center">Use any password to sign in</p>
              <div className="mt-4 pt-3 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/email-template')}
                  className="text-xs text-blue-300 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  Preview Password Reset Email Template
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-blue-400 text-xs font-medium">
            Internal Secure System
          </p>
          <p className="text-blue-500/60 text-xs">
            © 2026 KBC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
