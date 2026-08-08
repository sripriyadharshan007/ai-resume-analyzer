import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, 
  History, Trash2, Eye, Briefcase, ChevronRight, 
  Search, ShieldAlert, Award, BookOpen, ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import MagneticButton from '../../components/ui/MagneticButton';
import { motion } from 'framer-motion';

export default function JobMatcher() {
  const { user } = useAuth();
  
  // Inputs
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [companyName, setCompanyName] = useState('Target Company');
  const [jobDescription, setJobDescription] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Active loaded Job Match report
  const [matchResult, setMatchResult] = useState(null);
  
  // Historical Match reports
  const [historyList, setHistoryList] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/job-match/history');
      setHistoryList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Evaluate compatibility
  const handleMatchEvaluate = async (e) => {
    e.preventDefault();
    if (!jobDescription || !jobDescription.trim()) {
      showToast('Please enter a job description to match', 'error');
      return;
    }

    setLoading(true);
    setError('');
    setMatchResult(null);

    setLoadingStep('Comparing resume qualifications against role requirements...');
    
    setTimeout(() => {
      setLoadingStep('Generating upskilling suggestions for identified gaps...');
    }, 1500);

    try {
      const res = await axios.post('/api/job-match/evaluate', {
        jobTitle,
        companyName,
        jobDescription
      });
      setMatchResult(res.data);
      showToast('Job match score compiled successfully!', 'success');
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze job match.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // Load from history list
  const handleLoadHistory = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/job-match/${id}`);
      setMatchResult(res.data);
      showToast(`Loaded match report for ${res.data.jobTitle}`, 'success');
    } catch (err) {
      console.error(err);
      setError('Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  // Delete matching evaluation
  const handleDeleteMatch = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this matching report?')) return;
    try {
      await axios.delete(`/api/job-match/${id}`);
      showToast('Match report deleted successfully', 'success');
      fetchHistory();
      if (matchResult?.id === id) {
        setMatchResult(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete report.', 'error');
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center px-4 md:px-8 py-8 relative selection:bg-brand-500 selection:text-white">
      {/* Blur Backgrounds */}
      <div className="absolute top-10 left-1/3 w-80 h-80 bg-brand-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl border bg-slate-900 shadow-2xl border-brand-500/20 animate-slide-up">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-brand-400" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 text-rose-400" />
          )}
          <span className="text-xs font-semibold text-slate-200">{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl w-full z-10 space-y-8">
        
        {/* Title Header */}
        <div className="space-y-1 text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="h-7 w-7 text-brand-400" />
            <span>AI Job Matcher</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Evaluate skill compatibility scores against target job specifications and discover custom courses to bridge Gaps.
          </p>
        </div>

        {/* Split grid workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Form matching inputs */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Input Form Card */}
            <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] text-left space-y-4">
              <form onSubmit={handleMatchEvaluate} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target Role Title</label>
                    <input 
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] focus:border-brand-500 shadow-inner rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Company Name</label>
                    <input 
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] focus:border-brand-500 shadow-inner rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Job Description Requirements</label>
                  <textarea 
                    rows="6"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job qualifications details..."
                    className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] focus:border-brand-500 shadow-inner rounded-xl px-3 py-2 text-xs text-white outline-none transition resize-none font-sans"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.01] transition flex items-center justify-center gap-1.5"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span>{loading ? 'Evaluating compatibility...' : 'Analyze Match'}</span>
                </button>
              </form>

              {error && (
                <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-2.5 text-xs text-rose-400">
                  <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Loading sequence screen */}
            {loading && (
              <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-12 text-center rounded-3xl border border-white/[0.05] space-y-4">
                <RefreshCw className="h-10 w-10 text-brand-400 mx-auto animate-spin" />
                <h4 className="text-base font-bold text-white">Comparing Skills Matrices</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto animate-pulse">{loadingStep}</p>
              </div>
            )}

            {/* Result Report Dashboard */}
            {matchResult && !loading && (
              <div className="space-y-6">
                
                {/* Score wheel & summary header */}
                <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] bg-white/[0.01] relative overflow-hidden text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Role Compatibility Report</span>
                    <h3 className="text-lg font-black text-white">{matchResult.jobTitle}</h3>
                    <div className="text-xs text-brand-400 font-semibold">{matchResult.companyName}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Match Score</span>
                      <span className="text-2xl font-black text-brand-400">{matchResult.compatibilityScore}%</span>
                    </div>
                    <div className="h-14 w-14 rounded-full border-4 border-white/[0.05] flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-brand-500/5 animate-pulse"></div>
                      <Award className="h-6 w-6 text-brand-400" />
                    </div>
                  </div>
                </div>

                {/* Skills comparisons split boards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Matched Skills Card */}
                  <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] space-y-4 text-left">
                    <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      <span>Matching Gained Skills</span>
                    </h4>
                    
                    {matchResult.matchedSkills && matchResult.matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {matchResult.matchedSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-brand-500/5 border border-brand-500/10 text-brand-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic py-4">No matching technical skills identified.</div>
                    )}
                  </div>

                  {/* Missing Skills Gaps Card */}
                  <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] space-y-4 text-left">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle className="h-4.5 w-4.5" />
                      <span>Missing Skill Gaps</span>
                    </h4>
                    
                    {matchResult.missingSkills && matchResult.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {matchResult.missingSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-brand-400 font-bold py-4">Excellent! No critical skill gaps identified.</div>
                    )}
                  </div>

                </div>

                {/* Upskilling Recommendations Card */}
                <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] space-y-6 text-left">
                  <div className="space-y-1">
                    <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <BookOpen className="h-4.5 w-4.5 text-cyan-400" />
                      <span>Recommended Bridging courses</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Enroll in these courses on Coursera and Udemy to master missing technologies and raise your match index.
                    </p>
                  </div>

                  {matchResult.recommendedResources && matchResult.recommendedResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchResult.recommendedResources.map((course, idx) => (
                        <div key={idx} className="p-4 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] rounded-2xl flex flex-col justify-between space-y-3 transition">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="text-xs font-bold text-white leading-snug line-clamp-2">{course.title}</h5>
                              <span className="px-2 py-0.5 bg-slate-850 border border-slate-800 text-[8px] font-bold uppercase rounded text-slate-400 shrink-0">
                                {course.provider}
                              </span>
                            </div>
                            <span className="block text-[8px] text-slate-500 font-semibold uppercase">Difficulty: {course.difficulty}</span>
                          </div>
                          
                          <a 
                            href={course.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 mt-2.5 transition"
                          >
                            <span>Explore Course</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No course recommendations required. You already possess all target tech requirements!
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Empty landing view */}
            {!matchResult && !loading && (
              <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-16 text-center rounded-3xl border border-white/[0.05]">
                <Briefcase className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <h4 className="text-base font-bold text-white mb-2">Evaluate Career Matching</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Type in target role details and paste qualifications descriptions to trigger AI skills matchmaking.
                </p>
              </div>
            )}

          </div>

          {/* Right sidebar: Match histories */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.05] space-y-4">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <History className="h-4 w-4 text-brand-400" />
                <span>Job Match History</span>
              </h3>

              {historyList && historyList.length > 0 ? (
                <div className="space-y-3">
                  {historyList.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleLoadHistory(item.id)}
                      className={`p-3.5 bg-white/[0.02] border rounded-2xl cursor-pointer hover:border-white/[0.15] transition flex items-center justify-between ${
                        matchResult?.id === item.id ? 'border-brand-500/40' : 'border-white/[0.05]'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white truncate max-w-[140px]">{item.jobTitle}</h4>
                        <div className="flex gap-2 text-[8.5px] text-slate-500 font-semibold">
                          <span>Score: {item.compatibilityScore}%</span>
                          <span>•</span>
                          <span>{new Date(item.matchedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button 
                          className="p-1 hover:bg-slate-800 text-slate-400 rounded-lg transition"
                          title="Load report"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteMatch(item.id, e)}
                          className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-rose-450 rounded-lg transition"
                          title="Delete report"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-650 text-xs font-medium">
                  No match reports found.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
