import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import GlassCard from '../../components/ui/GlassCard';
import MagneticButton from '../../components/ui/MagneticButton';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030509] bg-noise flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none animate-blob-float mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-blob-float mix-blend-screen" style={{ animationDelay: '-4s' }}></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md z-10">
        <GlassCard className="p-8 md:p-10 relative">
          <Link to="/" className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Back
          </Link>
          
          {/* Branding header */}
          <div className="flex flex-col items-center mb-10 mt-6">
            <Link to="/" className="flex items-center mb-6">
              <Logo size="lg" hideText={true} />
            </Link>
            <h2 className="text-3xl font-heading font-extrabold tracking-tight text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-1.5 text-center font-medium">
              Sign in to access your previous analyses and mock interviews
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm font-medium shadow-inner">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.03] border border-white/[0.08] group-hover:border-white/[0.15] focus:border-brand-500 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
                />
                <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-500 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors tracking-wide">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/[0.08] group-hover:border-white/[0.15] focus:border-brand-500 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
                />
                <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-500 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>

            <MagneticButton
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-bold text-sm shadow-xl shadow-brand-500/20"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="h-4.5 w-4.5" />
                </span>
              )}
            </MagneticButton>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-bold tracking-wide">
              Create account
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
