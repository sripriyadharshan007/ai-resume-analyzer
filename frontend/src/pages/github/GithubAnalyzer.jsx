import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Github, Sparkles, TrendingUp, Award, AlertCircle, 
  CheckCircle2, Code, Star, GitFork, Users, Search, 
  RefreshCw, History, ShieldAlert, BookOpen, ChevronRight 
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import MagneticButton from '../../components/ui/MagneticButton';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function GithubAnalyzer() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  
  // Current loaded analysis report details
  const [analysis, setAnalysis] = useState(null);
  
  // Previous analyses lists
  const [history, setHistory] = useState([]);

  // Fetch History reports
  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/github/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Run Profile Analysis
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username || !username.trim()) return;

    setLoading(true);
    setError('');
    setAnalysis(null);

    // Simulate progress steps
    setLoadingStep('Fetching public repositories from GitHub...');
    
    setTimeout(() => {
      setLoadingStep('Analyzing repository language distribution...');
    }, 1200);

    setTimeout(() => {
      setLoadingStep('Running AI README and metadata audit with Gemini...');
    }, 2400);

    try {
      const res = await axios.post('/api/github/analyze', { username: username.trim() });
      setAnalysis(res.data);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze GitHub profile. Make sure the username is correct.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // Load from history
  const handleLoadFromHistory = async (id) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`/api/github/${id}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load profile report.');
    } finally {
      setLoading(false);
    }
  };

  // Convert language array/strings to Recharts format
  const getLanguageData = () => {
    if (!analysis || !analysis.topLanguages) return [];
    return analysis.topLanguages.map((lang, idx) => ({
      name: lang,
      value: 100 - (idx * 25) // mock relative ranking weights
    }));
  };

  const COLORS = ['#3b82f6', '#06b6d4', '#6366f1'];

  return (
    <div className="min-h-full flex flex-col items-center px-4 md:px-8 py-8 relative selection:bg-brand-500 selection:text-white">
      {/* Glow Blur Details */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-brand-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl w-full z-10 space-y-8">
        
        {/* Header Title */}
        <div className="space-y-1 text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Github className="h-7 w-7 text-brand-400" />
            <span>GitHub Profile Analyzer</span>
          </h1>
          <p className="text-slate-400 text-xs">
            Scan public repository statistics, track language metrics, and evaluate README files using Gemini AI.
          </p>
        </div>

        {/* Input Bar Card & History Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Form Column (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Input Form Card */}
            <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] bg-white/[0.01]">
              <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex-grow space-y-1.5 w-full">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GitHub Username</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. torvalds"
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] focus:border-brand-500 shadow-inner text-xs font-semibold text-white pl-9.5 pr-4 py-3 rounded-2xl outline-none transition"
                    />
                    <Github className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition shrink-0 flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  <span>{loading ? 'Analyzing...' : 'Analyze Profile'}</span>
                </button>
              </form>

              {/* Error Bubble */}
              {error && (
                <div className="mt-4 p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-2.5 text-xs text-rose-400">
                  <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Loading Panel */}
            {loading && (
              <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-12 text-center rounded-3xl border border-white/[0.05] space-y-4">
                <RefreshCw className="h-10 w-10 text-brand-400 mx-auto animate-spin" />
                <h4 className="text-base font-bold text-white">Analyzing GitHub Profile</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto animate-pulse">{loadingStep}</p>
              </div>
            )}

            {/* Result Report Dashboard */}
            {analysis && !loading && (
              <div className="space-y-6">
                
                {/* Scorecard Profile block */}
                <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] bg-white/[0.01] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Candidate Identity */}
                    <div className="flex items-center gap-4.5">
                      <img 
                        src={analysis.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                        alt="GitHub Avatar" 
                        className="h-16 w-16 rounded-full border border-white/[0.08] object-cover"
                      />
                      <div className="text-left space-y-1">
                        <h3 className="text-lg font-black text-white">{analysis.name || analysis.githubUsername}</h3>
                        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <Github className="h-3.5 w-3.5" />
                          <span>@{analysis.githubUsername}</span>
                        </span>
                      </div>
                    </div>

                    {/* Score Wheel */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">GitHub Score</span>
                        <span className="text-2xl font-black text-brand-400">{analysis.githubScore}/100</span>
                      </div>
                      <div className="h-14 w-14 rounded-full border-4 border-white/[0.05] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-brand-500/5 animate-pulse"></div>
                        <Award className="h-6 w-6 text-brand-400" />
                      </div>
                    </div>

                  </div>

                  {/* Tech Counter Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/[0.05]">
                    <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center gap-3">
                      <Code className="h-5 w-5 text-brand-400" />
                      <div className="text-left">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wide">Public Repos</span>
                        <span className="text-xs font-bold text-white">{analysis.publicRepos}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center gap-3">
                      <Users className="h-5 w-5 text-cyan-400" />
                      <div className="text-left">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wide">Followers</span>
                        <span className="text-xs font-bold text-white">{analysis.followers}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center gap-3">
                      <Star className="h-5 w-5 text-amber-400" />
                      <div className="text-left">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wide">Total Stars</span>
                        <span className="text-xs font-bold text-white">{analysis.totalStars}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center gap-3">
                      <GitFork className="h-5 w-5 text-indigo-400" />
                      <div className="text-left">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wide">Forks Received</span>
                        <span className="text-xs font-bold text-white">{analysis.totalForks}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Split grid: Language charts & Strengths */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Chart Card */}
                  <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] space-y-4">
                    <h4 className="text-sm font-heading font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-brand-400" />
                      <span>Language Distribution</span>
                    </h4>

                    {getLanguageData().length > 0 ? (
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getLanguageData()} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} tickLine={false} />
                            <Tooltip 
                              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                              contentStyle={{ background: '#030509', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '9px' }}
                            />
                            <Bar dataKey="value" radius={6} barSize={12}>
                              {getLanguageData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-500 text-xs">No language data found.</div>
                    )}
                  </div>

                  {/* README Quality Audit */}
                  <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-heading font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-cyan-400" />
                        <span>Profile README Quality</span>
                      </h4>

                      <p className="text-[11px] leading-relaxed text-slate-400">
                        Evaluates the completeness of your portfolio metadata, contact cards, badges, and project highlights.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-between">
                      <div className="text-left space-y-0.5">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Audit Grade</span>
                        <span className="text-xs font-extrabold text-white">{analysis.readmeQuality} Quality</span>
                      </div>
                      <span className={`px-3 py-1.5 text-[9px] font-bold uppercase rounded-lg border ${
                        analysis.readmeQuality === 'High' 
                          ? 'bg-brand-500/10 border-brand-500/20 text-brand-400'
                          : analysis.readmeQuality === 'Medium'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {analysis.readmeQuality === 'High' ? 'Excellent' : 'Needs Work'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Strengths Card */}
                  <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] space-y-4">
                    <h4 className="text-sm font-heading font-black text-brand-400 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      <span>Identified Strengths</span>
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-300 text-left">
                      {analysis.strengths && analysis.strengths.map((str, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="h-1.5 w-1.5 bg-brand-400 rounded-full mt-1.5 shrink-0"></span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses Card */}
                  <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] space-y-4">
                    <h4 className="text-sm font-heading font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="h-4.5 w-4.5" />
                      <span>Areas for Improvement</span>
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-300 text-left">
                      {analysis.weaknesses && analysis.weaknesses.map((weak, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="h-1.5 w-1.5 bg-rose-400 rounded-full mt-1.5 shrink-0"></span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Employability Project Recommendations */}
                <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] space-y-6">
                  <div className="text-left">
                    <h4 className="text-sm font-heading font-black text-white uppercase tracking-widest">Suggested Employability Projects</h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Build these key open-source packages to showcase architectural skill gaps and improve employment matchmaking.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {analysis.suggestedProjects && analysis.suggestedProjects.map((proj, idx) => (
                      <div key={idx} className="p-4.5 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.05] rounded-2xl flex flex-col justify-between space-y-4 transition-all">
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="text-xs font-bold text-white leading-tight">{proj.title}</h5>
                            <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded ${
                              proj.difficulty === 'Hard' 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                                : proj.difficulty === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                                : 'bg-brand-500/10 text-brand-400 border border-brand-500/10'
                            }`}>
                              {proj.difficulty}
                            </span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-slate-400">{proj.description}</p>
                        </div>
                        <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[9px] text-brand-400 font-mono">
                          <span>Stack: {proj.technologies}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Empty view */}
            {!analysis && !loading && (
              <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-16 text-center rounded-3xl border border-white/[0.05]">
                <Github className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <h4 className="text-base font-bold text-white mb-2">No Profile Scanned Yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Type in your public GitHub handle above to scan repository metrics and compile an AI scorecard.
                </p>
              </div>
            )}

          </div>

          {/* History Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] space-y-4">
              <h3 className="text-sm font-heading font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <History className="h-4 w-4 text-brand-400" />
                <span>Scan History</span>
              </h3>

              {history && history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleLoadFromHistory(item.id)}
                      className={`p-3.5 bg-white/[0.02] border rounded-2xl text-left cursor-pointer hover:border-white/[0.15] transition flex items-center justify-between ${
                        analysis?.id === item.id ? 'border-brand-500/40' : 'border-white/[0.05]'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white">@{item.githubUsername}</h4>
                        <div className="flex gap-1.5 text-[8.5px] text-slate-500 font-semibold">
                          <span>Score: {item.githubScore}</span>
                          <span>•</span>
                          <span>{new Date(item.analyzedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-600 text-xs font-medium">
                  No scan history found.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
