import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Target, Zap,
  FileText, BookOpen, PenTool, Github, Mic,
  Twitter, Linkedin, Mail, ArrowUpRight,
  User, TrendingUp, CheckCircle, Briefcase,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import MagneticButton from '../components/ui/MagneticButton';
import Marquee from '../components/ui/Marquee';
import Logo from '../components/ui/Logo';
import { cn } from '../lib/utils';

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: 'resume', title: 'AI Resume Intelligence',
    desc: 'Stop guessing what recruiters want. Our AI parses your resume line-by-line, providing live ATS scoring and Copilot editing.',
    icon: <FileText className="w-10 h-10 text-brand-400" />,
    color: 'from-brand-500/30 to-blue-600/30',
    stat: '92%', statLabel: 'Avg. ATS Match',
  },
  {
    id: 'match', title: 'Precision Job Matcher',
    desc: 'Paste your target job description. We compare your experience against their requirements to generate a definitive compatibility score.',
    icon: <Target className="w-10 h-10 text-rose-400" />,
    color: 'from-rose-500/30 to-orange-600/30',
    stat: '100+', statLabel: 'Skills Evaluated',
  },
  {
    id: 'upskill', title: 'Targeted Upskilling',
    desc: 'Missing a critical framework? We curate highly-rated courses directly from Coursera and Udemy based strictly on skill gaps.',
    icon: <BookOpen className="w-10 h-10 text-emerald-400" />,
    color: 'from-emerald-500/30 to-teal-600/30',
    stat: '3.2x', statLabel: 'Faster Placement',
  },
  {
    id: 'coverletter', title: 'AI Cover Letters',
    desc: 'Instantly generate highly personalized, professional cover letters that bridge your unique experience with the specific needs.',
    icon: <PenTool className="w-10 h-10 text-purple-400" />,
    color: 'from-purple-500/30 to-indigo-600/30',
    stat: '10s', statLabel: 'Draft Generation',
  },
  {
    id: 'github', title: 'Code Analyzer',
    desc: 'Connect your GitHub to let our engine parse your repositories, calculating your most used languages and showcasing project impact.',
    icon: <Github className="w-10 h-10 text-slate-300" />,
    color: 'from-slate-500/30 to-zinc-600/30',
    stat: 'Deep', statLabel: 'Repo Parsing',
  },
  {
    id: 'interview', title: 'Mock Interviews',
    desc: 'Practice makes perfect. Engage in a voice-dictated AI interview practice session with live grading and constructive feedback.',
    icon: <Mic className="w-10 h-10 text-cyan-400" />,
    color: 'from-cyan-500/30 to-sky-600/30',
    stat: 'Live', statLabel: 'Voice Grading',
  },
];

const STATS = [
  { value: 12400, suffix: '+', label: 'Resumes Optimized' },
  { value: 92, suffix: '%', label: 'ATS Match Rate' },
  { value: 3.2, suffix: 'x', label: 'Faster Placement' },
  { value: 98, suffix: '%', label: 'User Satisfaction' },
];

const FOOTER_LINKS = [
  { label: 'Product', links: ['Resume Analyzer', 'Job Matcher', 'Cover Letters', 'GitHub Analyzer', 'Mock Interviews'] },
  { label: 'Resources', links: ['Documentation', 'API Reference', 'Status Page', 'Changelog'] },
  { label: 'Company', links: ['About', 'Blog', 'Careers', 'Privacy Policy', 'Terms of Service'] },
];

const SOCIALS = [
  { icon: <Twitter className="w-4 h-4" />, label: 'Twitter', href: '#' },
  { icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn', href: '#' },
  { icon: <Github className="w-4 h-4" />, label: 'GitHub', href: '#' },
  { icon: <Mail className="w-4 h-4" />, label: 'Email', href: '#' },
];



// Animated number counter — properly a standalone component so hooks are legal
function AnimatedCounter({ target, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-5%' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const isFloat = String(target).includes('.');
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// Stat card — extracted so hooks are always called at top level of a component
function StatCard({ stat, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
      </div>
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useAuth();

  // Hero parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const yHero = useTransform(heroProgress, [0, 1], [0, 400]);
  const opacityHero = useTransform(heroProgress, [0, 0.8], [1, 0]);

  // Horizontal scroll
  const horizontalRef = useRef(null);
  const { scrollYProgress: horizontalProgress } = useScroll({ target: horizontalRef, offset: ['start start', 'end end'] });
  const xTranslate = useTransform(horizontalProgress, [0, 1], ['0%', '-83%']);



  return (
    <div className="relative min-h-screen bg-[#030509] text-white selection:bg-brand-500/30 selection:text-white font-sans">

      {/* SVG Filter for Gooey Background */}
      <svg className="hidden">
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -10" result="gooey" />
          <feBlend in="SourceGraphic" in2="gooey" />
        </filter>
      </svg>

      {/* Gooey Lava Lamp Background */}
      <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-50" style={{ filter: 'url(#gooey)' }}>
        <motion.div animate={{ x: [0, 100, -100, 0], y: [0, -100, 100, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-brand-600 rounded-full mix-blend-screen blur-[60px]" />
        <motion.div animate={{ x: [0, -150, 150, 0], y: [0, 150, -150, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute top-[30%] right-[10%] w-[700px] h-[700px] bg-secondary-600 rounded-full mix-blend-screen blur-[60px]" />
        <motion.div animate={{ x: [0, 200, -200, 0], y: [0, -200, 200, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute bottom-[0%] left-[30%] w-[800px] h-[800px] bg-cyan-600 rounded-full mix-blend-screen blur-[60px]" />
      </div>

      {/* Glass Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#030509]/30 backdrop-blur-3xl border-b border-white/[0.04]"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="md" className="magnetic-target" />
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <MagneticButton className="bg-white/5 border border-white/10 hover:bg-white/10 text-xs px-6 py-2.5">Dashboard</MagneticButton>
              </Link>
            ) : (
              <Link to="/login" className="group">
                <MagneticButton className="text-xs px-6 py-2.5 bg-white text-black font-bold uppercase tracking-widest shadow-lg shadow-white/10 group-hover:bg-slate-200 transition-colors flex items-center gap-2">
                  Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex items-center">
        <motion.div
          style={{ y: yHero, opacity: opacityHero }}
          className="max-w-7xl mx-auto px-6 lg:px-8 w-full pt-28 pb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">

            {/* Left: Copy */}
            <div className="flex flex-col">


              {/* Headline */}
              <h1 className="font-heading font-black leading-[0.88] tracking-tighter mb-8">
                <div className="overflow-hidden">
                  <motion.span
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.85, ease: [0.2, 1, 0.3, 1] }}
                    className="block text-[12vw] sm:text-[6rem] lg:text-[4.5rem] xl:text-[5.5rem] text-white"
                  >
                    OUTPERFORM
                  </motion.span>
                </div>
                <div className="overflow-hidden">
                  <motion.span
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.85, delay: 0.12, ease: [0.2, 1, 0.3, 1] }}
                    className="block text-[12vw] sm:text-[6rem] lg:text-[4.5rem] xl:text-[5.5rem]"
                  >
                    <span className="text-white">THE </span>
                    <span className="text-cyan-400">ATS.</span>
                  </motion.span>
                </div>
              </h1>

              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex flex-wrap gap-3 mt-2"
              >
                {[
                  { icon: <FileText className="w-3.5 h-3.5" />, label: 'ATS Optimized' },
                  { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Higher Score' },
                  { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'More Interviews' },
                  { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Better Careers' },
                ].map((pill, i) => (
                  <motion.div
                    key={pill.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.55 + i * 0.08 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[11px] font-bold tracking-[0.12em] uppercase backdrop-blur-sm"
                  >
                    <span className="text-cyan-400">{pill.icon}</span>
                    {pill.label}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: Floating Resume Card Mockup */}
            <div className="hidden lg:flex items-center justify-center relative">
              {/* Glow behind card */}
              <div className="absolute w-[360px] h-[360px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

              <motion.div
                initial={{ opacity: 0, x: 60, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.2, 1, 0.3, 1] }}
                style={{ perspective: 800 }}
                className="relative"
              >
                {/* Floating animation wrapper */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  {/* Resume Card */}
                  <div className="w-[280px] rounded-2xl bg-[#0d1526]/90 border border-white/[0.12] shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-xl">
                    {/* Card Header */}
                    <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
                      <div className="text-xs font-black tracking-[0.2em] uppercase text-white mb-3">RESUME</div>
                      {/* Avatar + lines */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 pt-1 space-y-2">
                          <div className="h-2.5 bg-white/[0.15] rounded-full w-3/4" />
                          <div className="h-2 bg-white/[0.08] rounded-full w-1/2" />
                        </div>
                      </div>
                    </div>
                    {/* Card Body Lines */}
                    <div className="px-5 py-4 space-y-2.5">
                      {[0.8, 0.6, 0.9, 0.5, 0.7].map((w, i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                          style={{ width: `${w * 100}%`, transformOrigin: 'left' }}
                          className="h-2 bg-white/[0.08] rounded-full"
                        />
                      ))}
                    </div>
                    {/* Scan line progress bar */}
                    <div className="px-5 pb-5">
                      <div className="h-[1px] bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 1 }}
                          className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ATS Score Badge — floating top-right of card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.1, type: 'spring', stiffness: 200 }}
                    className="absolute -right-12 top-8 flex flex-col items-center"
                  >
                    {/* Ring */}
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                        <motion.circle
                          cx="40" cy="40" r="34"
                          fill="none" stroke="#22c55e" strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 34}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - 0.98) }}
                          transition={{ duration: 1.5, delay: 1.3, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-white">98</span>
                      </div>
                    </div>
                    <div className="mt-1.5 text-center">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">ATS Score</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Excellent</div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* ── Marquee ── */}
      <section className="relative z-10 py-10 bg-[#030509]">
        <Marquee baseVelocity={-3}>AI RESUME BUILDER &bull; GITHUB ANALYZER &bull; COVER LETTER GEN &bull; JOB MATCHER</Marquee>
        <Marquee baseVelocity={3}>MOCK INTERVIEWS &bull; TARGETED UPSKILLING &bull; LIVE FEEDBACK &bull; ATS SCORING</Marquee>
      </section>

      {/* ── Horizontal Feature Scroll ── */}
      <section ref={horizontalRef} className="relative h-[600vh] bg-[#030509]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div style={{ x: xTranslate }} className="flex gap-12 px-[10vw] min-w-max">

            <div className="w-[80vw] md:w-[60vw] lg:w-[40vw] h-[60vh] shrink-0 flex flex-col justify-center">
              <h2 className="text-5xl md:text-7xl font-heading font-black leading-none mb-6">
                The Ultimate <br /><span className="stroke-text">Advantage.</span>
              </h2>
              <p className="text-xl text-slate-400">Scroll horizontally to discover the tools engineered to guarantee your next placement.</p>
            </div>

            {FEATURES.map((feature) => (
              <div key={feature.id} className="w-[85vw] md:w-[50vw] lg:w-[40vw] h-[70vh] shrink-0 magnetic-target group">
                <GlassCard className="w-full h-full p-10 md:p-14 flex flex-col justify-between bg-[#030509]/60 backdrop-blur-3xl border border-white/[0.08] hover:border-white/[0.2] transition-colors duration-500 overflow-hidden relative">
                  <div className={cn('absolute -inset-10 opacity-0 group-hover:opacity-20 blur-[80px] transition-opacity duration-700 bg-gradient-to-br', feature.color)} />
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-8 shadow-2xl">
                      {feature.icon}
                    </div>
                    <h3 className="text-4xl md:text-5xl font-heading font-black mb-6">{feature.title}</h3>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-[80%]">{feature.desc}</p>
                  </div>
                  <div className="relative z-10 pt-8 border-t border-white/[0.1] flex justify-between items-end">
                    <div>
                      <div className="text-4xl font-black text-white">{feature.stat}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">{feature.statLabel}</div>
                    </div>
                    <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white transition-all duration-300 transform group-hover:rotate-[-45deg]">
                      <ArrowRight className="w-6 h-6 text-white group-hover:text-black transition-colors duration-300" />
                    </div>
                  </div>
                </GlassCard>
              </div>
            ))}

            <div className="w-[80vw] md:w-[60vw] lg:w-[40vw] h-[60vh] shrink-0 flex flex-col justify-center items-center text-center">
              <h2 className="text-5xl font-heading font-black mb-8">Convinced?</h2>
              <Link to="/register">
                <MagneticButton className="h-20 px-16 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xl">
                  Launch App
                </MagneticButton>
              </Link>
            </div>

          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PREMIUM FOOTER
          ════════════════════════════════════════════ */}
      <footer className="relative z-10 bg-[#030509]">

        {/* Animated Stats Belt */}
        <div className="border-y border-white/[0.06] py-16 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>

        {/* Giant CTA / Wordmark Section */}
        <div className="relative overflow-hidden py-32 md:py-48">
          {/* Dot-grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Center glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[900px] h-[500px] bg-brand-600/15 rounded-full blur-[130px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400 mb-8"
            >
              Your Career, Engineered
            </motion.p>

            {/* Animated wordmark */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-12"
            >
              <h2 className="text-[18vw] md:text-[14vw] font-heading font-black leading-none tracking-tighter text-white select-none">
                RESUME
                <span
                  className="block"
                  style={{ WebkitTextStroke: '2px rgba(59,130,246,0.4)', color: 'transparent' }}
                >
                  AI.
                </span>
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xl text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed"
            >
              Stop submitting. Start getting hired. Let our AI do the heavy lifting — from resume to offer letter.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/register">
                <MagneticButton className="h-16 px-12 rounded-2xl bg-white text-black font-bold text-base uppercase tracking-widest shadow-2xl shadow-white/10 magnetic-target">
                  Get Started Free
                </MagneticButton>
              </Link>
              <Link
                to="/login"
                className="group flex items-center gap-2 h-16 px-8 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all duration-300 text-sm font-semibold tracking-wide"
              >
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="border-t border-white/[0.06] py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">

              {/* Brand Column */}
              <div className="md:col-span-2">
                <Logo size="md" className="mb-6 w-fit" />
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
                  The AI-powered career platform engineered to get you hired faster. Resume analysis, job matching, and interview prep — all in one place.
                </p>
                <div className="flex gap-3">
                  {SOCIALS.map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.label}
                      className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-colors duration-300"
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Link Columns */}
              {FOOTER_LINKS.map((col, ci) => (
                <div key={col.label}>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-5">{col.label}</p>
                  <ul className="space-y-3">
                    {col.links.map((link, li) => (
                      <motion.li
                        key={link}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: li * 0.06 + ci * 0.04 }}
                      >
                        <a href="#" className="group flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors duration-200">
                          <span>{link}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-y-0 translate-x-0 group-hover:translate-x-0.5 transition-all duration-200" />
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.04] py-6">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy</a>
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms</a>
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Cookies</a>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-600">All systems operational</span>
            </div>
          </div>
        </div>

      </footer>
    </div>
  );
}
