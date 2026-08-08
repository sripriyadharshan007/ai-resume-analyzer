import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Upload, LogOut, Sparkles, User, Menu, X, FileText, Github, FileSpreadsheet, Briefcase, ChevronRight
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { cn } from '../lib/utils';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyze Resume', path: '/upload', icon: Upload },
    { name: 'Resume Builder', path: '/builder', icon: FileText },
    { name: 'GitHub Analyzer', path: '/github', icon: Github },
    { name: 'Cover Letter', path: '/cover-letter', icon: FileSpreadsheet },
    { name: 'Job Matcher', path: '/job-match', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-[#030509] bg-noise text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-white relative overflow-hidden">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none animate-blob-float mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-blob-float mix-blend-screen" style={{ animationDelay: '-3s' }} />

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-white/[0.04] bg-[#030509]/40 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <Link to="/" className="flex items-center w-full">
            <Logo size="md" />
          </Link>
        </div>

        {/* User Account Controls */}
        <div className="relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-200">{user?.name || 'Developer'}</span>
              <span className="text-[10px] text-brand-400 font-bold tracking-widest uppercase">Pro Plan</span>
            </div>
            <div className="h-10 w-10 bg-white/[0.03] border border-white/[0.08] hover:border-brand-500/50 rounded-full flex items-center justify-center text-brand-400 font-bold transition-all shadow-inner">
              <User className="h-5 w-5 text-slate-400" />
            </div>
          </button>

          {/* User Account Dropdown */}
          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-[#030509]/90 backdrop-blur-2xl border border-white/[0.08] p-2 rounded-2xl shadow-2xl z-50"
                >
                  <div className="px-3 py-3 border-b border-white/[0.04] mb-2 text-left">
                    <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                    <div className="text-xs text-slate-400 truncate mt-1">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-400 rounded-xl text-sm font-semibold hover:bg-rose-500/10 transition-all text-left group"
                  >
                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Body Shell Wrapper */}
      <div className="flex-grow flex relative z-10">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-72 bg-white/[0.01] backdrop-blur-md border-r border-white/[0.04] p-6 space-y-8 shrink-0">
          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Dashboard</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'group flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden',
                    isActive 
                      ? 'text-white bg-white/[0.06] border border-white/[0.08]' 
                      : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/[0.03]'
                  )}
                >
                  {isActive && <motion.div layoutId="active-nav" className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent" />}
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-brand-400" : "text-slate-500 group-hover:text-slate-300")} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-brand-400 relative z-10" />}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#030509]/80 backdrop-blur-md md:hidden" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute left-0 top-0 bottom-0 w-72 bg-[#030509] border-r border-white/[0.04] p-6 flex flex-col space-y-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading font-extrabold text-lg text-white">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Navigation</span>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all',
                          isActive 
                            ? 'text-white bg-white/[0.06] border border-white/[0.08]' 
                            : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/[0.03]'
                        )}
                      >
                        <Icon className={cn("h-5 w-5", isActive ? "text-brand-400" : "")} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Body view window */}
        <main className="flex-grow min-w-0 relative z-10">
          <div className="h-full w-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
