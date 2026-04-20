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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#10123d] via-[#1a1c56] to-[#0a0a20] p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#2e3192] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#626ab4] rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-md p-3 border border-white/10 shadow-[0_0_30px_rgba(46,49,146,0.3)]">
            <img src={logo} alt="KBC Logo" className="w-full h-auto object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Lineup</h1>
          <p className="text-[#a8addb] font-medium tracking-wide text-sm uppercase">Editorial Content Calendar</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#1a1c56]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
          
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ed1c24] via-[#2e3192] to-[#00a651]"></div>

          <div className="px-8 py-8">
            {view === 'login' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
                  <p className="text-[#a8addb] text-sm">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200 text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#8188c8]" />
                      Work Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@kbc.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-[#10123d]/50 border-white/10 text-white placeholder:text-slate-500 h-12 focus:border-[#626ab4] focus:ring-[#626ab4]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-200 text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#8188c8]" />
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => setView('forgot-password')}
                        className="text-xs font-medium text-[#8188c8] hover:text-white transition-colors"
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
                        className="bg-[#10123d]/50 border-white/10 text-white placeholder:text-slate-500 h-12 pr-10 focus:border-[#626ab4] focus:ring-[#626ab4]"
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
                    <div className="bg-[#e44b4b]/10 border border-[#e44b4b]/20 text-[#f6a9a9] px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                      <div className="mt-0.5 font-bold">!</div>
                      <p>{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 mt-2 bg-gradient-to-r from-[#2e3192] to-[#1f2168] hover:from-[#626ab4] hover:to-[#2e3192] text-white font-medium border border-white/10 shadow-lg shadow-blue-900/20 transition-all duration-300"
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
                  <p className="text-[#a8addb] text-sm leading-relaxed">
                    Enter your work email address and we'll send you a secure link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-slate-200 text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#8188c8]" />
                      Work Email Address
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your.email@kbc.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-[#10123d]/50 border-white/10 text-white placeholder:text-slate-500 h-12 focus:border-[#626ab4] focus:ring-[#626ab4]"
                    />
                  </div>

                  {error && (
                    <div className="bg-[#e44b4b]/10 border border-[#e44b4b]/20 text-[#f6a9a9] px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                      <div className="mt-0.5 font-bold">!</div>
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="pt-2 space-y-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-[#2e3192] to-[#1f2168] hover:from-[#626ab4] hover:to-[#2e3192] text-white font-medium border border-white/10 shadow-lg shadow-blue-900/20 transition-all duration-300"
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setView('login')}
                      className="w-full h-12 text-[#a8addb] hover:text-white hover:bg-white/5"
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              </>
            )}

            {view === 'forgot-success' && (
              <div className="text-center py-4 space-y-6">
                <div className="mx-auto w-16 h-16 bg-[#00a651]/10 rounded-full flex items-center justify-center border border-[#00a651]/20">
                  <CheckCircle2 className="w-8 h-8 text-[#41d582]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Check Your Email</h2>
                  <p className="text-[#a8addb] text-sm leading-relaxed max-w-xs mx-auto">
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
            <div className="bg-[#10123d]/40 px-8 py-5 border-t border-white/5">
              <p className="text-xs font-medium text-[#8188c8] mb-3 uppercase tracking-wider">Demo Access</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-md px-3 py-2">
                  <span className="text-xs font-medium text-white">Super Admin</span>
                  <span className="text-xs text-[#a8addb] font-mono">sarah.johnson@kbc.com</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-md px-3 py-2">
                  <span className="text-xs font-medium text-white">Editor</span>
                  <span className="text-xs text-[#a8addb] font-mono">michael.chen@kbc.com</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-md px-3 py-2">
                  <span className="text-xs font-medium text-white">Assignee</span>
                  <span className="text-xs text-[#a8addb] font-mono">emily.davis@kbc.com</span>
                </div>
              </div>
              <p className="text-[10px] text-[#8188c8] mt-3 text-center">Use any password to sign in</p>
              <div className="mt-4 pt-3 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/email-template')}
                  className="text-xs text-[#a8addb] hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
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
          <p className="text-[#8188c8] text-xs font-medium">
            Internal Secure System
          </p>
          <p className="text-[#626ab4]/60 text-xs">
            © 2026 KBC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
