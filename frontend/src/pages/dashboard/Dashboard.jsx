import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Plus, Sparkles, FileText, TrendingUp, Award, 
  ChevronRight, Calendar, ArrowUpRight, Play,
  BarChart2, CheckSquare, MessageSquare, AlertCircle
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import MagneticButton from '../../components/ui/MagneticButton';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// ────────────────────────────────────────────────────────────
// Helper: compute per-skill scores from latest analysis
// ────────────────────────────────────────────────────────────
const SKILL_CATEGORIES = [
  {
    label: 'Frontend Development (React, Javascript)',
    keywords: ['react', 'javascript', 'typescript', 'html', 'css', 'vue', 'angular', 'next', 'vite'],
    color: 'bg-brand-500',
    textColor: 'text-brand-400',
  },
  {
    label: 'Backend Architecture (Java, REST APIs)',
    keywords: ['java', 'spring', 'node', 'python', 'django', 'rest', 'api', 'microservice', 'go', 'ruby'],
    color: 'bg-brand-500',
    textColor: 'text-brand-400',
  },
  {
    label: 'Database Systems (MongoDB, Relational SQL)',
    keywords: ['mongodb', 'sql', 'postgres', 'mysql', 'database', 'redis', 'elastic', 'dynamo', 'cassandra'],
    color: 'bg-cyan-500',
    textColor: 'text-cyan-400',
  },
  {
    label: 'DevOps & Infrastructure (Docker, Cloud)',
    keywords: ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'jenkins', 'terraform', 'linux', 'devops'],
    color: 'bg-rose-500',
    textColor: 'text-rose-400',
  },
];

function computeSkillScores(analysisHistory) {
  if (!analysisHistory || analysisHistory.length === 0) return null;

  // Gather all missing skills from the last 5 analyses (most recent first)
  const recent = analysisHistory.slice(0, 5);
  const allMissing = recent
    .flatMap(a => (a.missingSkills || []).map(s => s.toLowerCase()));

  // For each category, score = 100 minus penalty for missing relevant skills
  return SKILL_CATEGORIES.map(cat => {
    const missingInCategory = allMissing.filter(m =>
      cat.keywords.some(kw => m.includes(kw))
    );
    // Each missing skill reduces score by up to 15 pts, min 10
    const penalty = Math.min(missingInCategory.length * 15, 85);
    const score = Math.max(10, 100 - penalty);
    return { ...cat, score };
  });
}

function computeBenchmark(averageScore) {
  if (averageScore >= 90) return { rank: 'Top 5%', label: 'Exceptional performer' };
  if (averageScore >= 80) return { rank: 'Top 15%', label: 'Strong candidate' };
  if (averageScore >= 70) return { rank: 'Top 30%', label: 'Above average' };
  if (averageScore >= 55) return { rank: 'Top 50%', label: 'Average range' };
  return { rank: 'Bottom 50%', label: 'Needs improvement' };
}

function getInsightTip(history) {
  if (!history || history.length === 0) {
    return 'Start by uploading your first resume to get your ATS score and personalized improvement suggestions!';
  }
  const latest = history[0];
  const missing = latest.missingSkills || [];
  if (missing.length > 0) {
    return `Your resume has "${missing[0]}" flagged as a missing skill gap. Focus on this in your next resume revision and mock interview session!`;
  }
  const score = latest.atsScore;
  if (score < 60) {
    return `Your latest ATS score is ${score}%. Review the improvement suggestions in your latest report to boost your score significantly.`;
  }
  if (score >= 80) {
    return `Great work! Your latest ATS score is ${score}%. Practice the mock interview for this role to solidify your candidacy.`;
  }
  return `Your latest ATS score is ${score}%. Check the missing skills section to identify your next improvement areas.`;
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [interviewSessions, setInterviewSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [analysisRes, interviewRes] = await Promise.all([
        axios.get('/api/analysis/history'),
        axios.get('/api/interview/list').catch(() => ({ data: [] })), // non-fatal
      ]);
      setHistory(analysisRes.data);
      setInterviewSessions(interviewRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Computed stats ──────────────────────────────────────────
  const totalAnalyzed = history.length;
  const highestScore = totalAnalyzed > 0
    ? Math.max(...history.map(h => h.atsScore))
    : 0;
  const averageScore = totalAnalyzed > 0
    ? Math.round(history.reduce((sum, h) => sum + h.atsScore, 0) / totalAnalyzed)
    : 0;

  const chartData = [...history]
    .reverse()
    .map((item, idx) => {
      const date = new Date(item.analyzedAt);
      return {
        name: `Analysis ${idx + 1}`,
        score: item.atsScore,
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      };
    });

  const skillScores = computeSkillScores(history);
  const benchmark = computeBenchmark(averageScore);
  const insightTip = getInsightTip(history);

  // ── Checklist state (dynamic from real data) ────────────────
  const hasUploaded = totalAnalyzed > 0;
  const hasReviewedGaps = totalAnalyzed > 0 && history.some(h => (h.missingSkills || []).length > 0);
  const hasPracticed = interviewSessions.length > 0;
  const hasCompletedCourses = interviewSessions.some(s => s.status === 'COMPLETED');

  // ── Chart tooltip ───────────────────────────────────────────
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            {payload[0].payload.name}
          </p>
          <p className="text-brand-400 font-extrabold text-sm">
            ATS Score: {payload[0].value}%
          </p>
          <p className="text-slate-500 text-[10px] mt-0.5">
            {payload[0].payload.date}
          </p>
        </div>
      );
    }
    return null;
  };

  // ────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full z-10">

        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-white/[0.04]"
        >
          <div>
            <div className="flex items-center gap-2 mb-3 text-brand-400 text-[10px] font-bold tracking-[0.2em] uppercase">
              <Sparkles className="h-4 w-4" /> Professional Workspace
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
              Hello, {user?.name || 'Developer'}
            </h1>
            <p className="text-slate-400 text-base mt-2 max-w-xl">
              Analyze new resume editions, track performance improvements and prep for mock interviews.
            </p>
          </div>

          <Link to="/upload" className="shrink-0">
            <MagneticButton className="h-14 px-8 bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-500/20 text-sm">
              <Plus className="h-5 w-5 -ml-1 mr-2" /> Analyze New Resume
            </MagneticButton>
          </Link>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="h-12 w-12 border-4 border-white/5 border-t-brand-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
            <p className="text-slate-500 text-sm font-semibold tracking-wider animate-pulse uppercase">Syncing neural pathways...</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

              <GlassCard className="p-6 flex items-center gap-5">
                <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-brand-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-[0.1em] mb-1">Resumes Scanned</span>
                  <span className="text-3xl font-heading font-extrabold text-white">{totalAnalyzed}</span>
                </div>
              </GlassCard>

              <GlassCard className="p-6 flex items-center gap-5">
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-[0.1em] mb-1">Average Score</span>
                  <span className="text-3xl font-heading font-extrabold text-white">{averageScore > 0 ? `${averageScore}%` : '—'}</span>
                </div>
              </GlassCard>

              <GlassCard className="p-6 flex items-center gap-5">
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Award className="h-7 w-7" />
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-[0.1em] mb-1">Highest Score</span>
                  <span className="text-3xl font-heading font-extrabold text-white">{highestScore > 0 ? `${highestScore}%` : '—'}</span>
                </div>
              </GlassCard>

            </div>

            {totalAnalyzed > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column */}
                <div className="lg:col-span-8 space-y-8">

                  {/* Recharts Area Chart */}
                  <GlassCard className="p-8">
                    <h3 className="text-xl font-heading font-bold text-white mb-8">ATS Progress Trend</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                          <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  {/* Skill Competency Mastery */}
                  <GlassCard className="p-8">
                    <h3 className="text-lg font-heading font-bold text-white mb-6 flex items-center gap-3">
                      <div className="p-2 bg-brand-500/10 rounded-lg"><BarChart2 className="h-5 w-5 text-brand-400" /></div>
                      <span>Skill Competency Mastery</span>
                      <span className="ml-auto text-[10px] text-slate-500 font-normal tracking-wide uppercase mt-1">Latest Analysis</span>
                    </h3>
                    <div className="space-y-5">
                      {(skillScores || SKILL_CATEGORIES.map(c => ({ ...c, score: 0 }))).map((cat, idx) => (
                        <div key={idx} className="group">
                          <div className="flex justify-between text-xs font-semibold mb-2">
                            <span className="text-slate-300 group-hover:text-white transition-colors">{cat.label}</span>
                            <span className={cn('transition-colors', cat.score >= 60 ? 'text-brand-400' : cat.score >= 40 ? 'text-amber-400' : 'text-rose-400')}>
                              {cat.score}%
                            </span>
                          </div>
                          <div className="w-full bg-white/[0.03] rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div
                              className={cn("h-full rounded-full transition-all duration-1000 ease-out relative", cat.score >= 60 ? 'bg-brand-500' : cat.score >= 40 ? 'bg-amber-500' : 'bg-rose-500')}
                              style={{ width: `${cat.score}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 w-full animate-shimmer" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* History Table */}
                  <GlassCard className="p-8">
                    <h3 className="text-xl font-heading font-bold text-white mb-6">Analysis History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.04] text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                            <th className="pb-4">Target Job Profile</th>
                            <th className="pb-4 text-center">ATS Score</th>
                            <th className="pb-4">Analyzed Date</th>
                            <th className="pb-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {history.map((analysis) => {
                            const scoreTheme = analysis.atsScore >= 75
                              ? 'text-brand-400 bg-brand-500/10 border-brand-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                              : analysis.atsScore >= 50
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

                            return (
                              <tr key={analysis.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="py-5 font-semibold text-slate-200 group-hover:text-white max-w-[260px] truncate pr-4 transition-colors">
                                  {analysis.targetJobTitle}
                                </td>
                                <td className="py-5 text-center">
                                  <span className={`px-3 py-1.5 border rounded-xl text-xs font-black ${scoreTheme}`}>
                                    {analysis.atsScore}%
                                  </span>
                                </td>
                                <td className="py-5 text-slate-400 text-xs font-medium">
                                  <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-500" />
                                    {new Date(analysis.analyzedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                  </span>
                                </td>
                                <td className="py-5 text-right">
                                  <div className="inline-flex justify-end gap-2">
                                    <Link
                                      to={`/report/${analysis.id}`}
                                      className="p-2 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
                                    >
                                      View <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                    <Link
                                      to={`/interview/${analysis.id}`}
                                      className="p-2 bg-brand-500/15 hover:bg-brand-500 text-brand-300 hover:text-white rounded-xl border border-brand-500/20 hover:border-brand-400 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
                                    >
                                      <Play className="h-3.5 w-3.5 fill-current" /> Prep
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-8">

                  {/* Benchmark Comparison */}
                  <GlassCard className="p-6">
                    <h3 className="text-sm font-heading font-bold text-white mb-5 flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg"><TrendingUp className="h-4.5 w-4.5 text-purple-400" /></div>
                      <span>Market Benchmark</span>
                    </h3>
                    <div className="space-y-5">
                      <div className="text-xs text-slate-400 leading-relaxed font-medium">
                        Comparing your average ATS score to elite candidates targeting similar tier roles:
                      </div>
                      <div className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-3xl text-center space-y-2 relative overflow-hidden shadow-inner">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Award className="w-24 h-24 text-brand-500" /></div>
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 block relative z-10">Candidate Rank</span>
                        <span className="text-4xl font-heading font-black text-white block relative z-10">{benchmark.rank}</span>
                        <span className="text-xs text-brand-400 block font-bold tracking-wide relative z-10">{benchmark.label}</span>
                        <div className="pt-3 mt-3 border-t border-white/[0.05] relative z-10">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Avg. Score: {averageScore}%</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Job Prep Checklist */}
                  <GlassCard className="p-6">
                    <h3 className="text-sm font-heading font-bold text-white mb-5 flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg"><CheckSquare className="h-4.5 w-4.5 text-cyan-400" /></div>
                      <span>Preparation Checklist</span>
                    </h3>
                    <div className="space-y-4">
                      {[
                        { done: hasUploaded, label: 'Upload first resume draft' },
                        { done: hasReviewedGaps, label: 'Review missing skill gaps' },
                        { done: hasPracticed, label: 'Practice mock interview' },
                        { done: hasCompletedCourses, label: 'Complete interview session' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-3 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.02]">
                          <div className={cn("mt-0.5 shrink-0 h-5 w-5 rounded-full flex items-center justify-center border transition-colors", item.done ? "bg-brand-500 border-brand-500" : "bg-transparent border-slate-600")}>
                            {item.done && <CheckSquare className="h-3 w-3 text-white" />}
                          </div>
                          <span className={cn('text-sm font-medium transition-colors', item.done ? 'text-slate-500 line-through' : 'text-slate-200')}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* AI Career Insights Feed */}
                  <GlassCard className="p-6 border-brand-500/20 bg-brand-900/10">
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="p-3 bg-brand-500/20 border border-brand-500/30 rounded-2xl text-brand-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.15em]">AI Analyst Feed</span>
                        <h4 className="text-sm font-bold text-white leading-none">Career Tip</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          &ldquo;{insightTip}&rdquo;
                        </p>
                      </div>
                    </div>
                  </GlassCard>

                </div>
              </div>
            ) : (
              /* Empty state */
              <GlassCard className="p-16 text-center rounded-[40px] min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-500/5 pointer-events-none" />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="p-6 bg-brand-500/10 border border-brand-500/20 rounded-3xl w-fit mb-8 text-brand-400 shadow-[0_0_30px_rgba(59,130,246,0.2)] relative z-10"
                >
                  <FileText className="h-10 w-10" />
                </motion.div>
                <h3 className="text-3xl font-heading font-extrabold text-white mb-4 relative z-10">Initialize Trajectory</h3>
                <p className="text-slate-400 text-base max-w-md leading-relaxed mb-10 relative z-10">
                  Upload your current resume and target job specs to calculate your first ATS score and uncover skill gaps holding you back.
                </p>
                <Link to="/upload" className="relative z-10">
                  <MagneticButton className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25">
                    Upload First Resume <ChevronRight className="h-5 w-5 ml-2" />
                  </MagneticButton>
                </Link>
              </GlassCard>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
