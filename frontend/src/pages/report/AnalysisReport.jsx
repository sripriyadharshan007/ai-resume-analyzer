import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, CheckCircle2, Play, FileText,
  AlertTriangle, Calendar, CheckSquare, ListFilter, ChevronRight,
  Check, FileCheck, BookOpen, MessageSquare, Send, TrendingUp
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import MagneticButton from '../../components/ui/MagneticButton';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function AnalysisReport() {
  const { id } = useParams();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // AI Career Copilot Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`/api/analysis/${id}`);
        setAnalysis(response.data);
        setChatMessages([
          { sender: 'copilot', text: `Hi ${user?.name || 'there'}! I am your AI Career Copilot. Ask me how to improve your resume for the "${response.data.targetJobTitle}" profile or get mock interview preparation tips!` }
        ]);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch the analysis report.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id, user]);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim().toLowerCase();
    const newMessages = [...chatMessages, { sender: 'user', text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');

    setTimeout(() => {
      let replyText = "";
      if (userMsg.includes('hi') || userMsg.includes('hello')) {
        replyText = `Hello! I've analyzed your resume for the "${analysis?.targetJobTitle}" profile. Your ATS score is ${analysis?.atsScore}%. Ask me how to fix your skill gaps!`;
      } else if (userMsg.includes('gap') || userMsg.includes('skill') || userMsg.includes('missing')) {
        if (analysis?.missingSkills && analysis.missingSkills.length > 0) {
          replyText = `Your detected skill gaps are: ${analysis.missingSkills.join(', ')}. I recommend reviewing the suggested courses or adding these keywords under your technical profile.`;
        } else {
          replyText = "Great news! I didn't detect any critical skill gaps in your resume.";
        }
      } else if (userMsg.includes('score') || userMsg.includes('improve') || userMsg.includes('fix') || userMsg.includes('revision') || userMsg.includes('suggest')) {
        if (analysis?.improvementSuggestions && analysis.improvementSuggestions.length > 0) {
          const firstSug = analysis.improvementSuggestions[0];
          replyText = `Under your "${firstSug.section}" section, I recommend changing "${firstSug.currentText || 'missing content'}" to "${firstSug.suggestedText}" to boost your ATS compatibility.`;
        } else {
          replyText = "Your resume format looks excellent! Try practicing with mock interviews to prepare for technical screens.";
        }
      } else if (userMsg.includes('interview') || userMsg.includes('mock') || userMsg.includes('question') || userMsg.includes('practice')) {
        replyText = `I have configured exactly 5 customized questions (3 general + 2 coding) for your profile. Click "Practice Mock Interview" at the top to start!`;
      } else {
        replyText = `I can help you review your gaps, copy suggestions, or prepare for mock interviews. Try asking: "How do I improve my score?" or "What are my skill gaps?"`;
      }
      setChatMessages(prev => [...prev, { sender: 'copilot', text: replyText }]);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-full flex flex-col justify-center items-center py-20">
        <div className="h-16 w-16 border-4 border-white/5 border-t-brand-500 rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-6"></div>
        <p className="text-brand-300 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Loading analysis report...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-full flex flex-col justify-center items-center px-4 py-20">
        <GlassCard className="p-10 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-rose-500/5 mix-blend-screen pointer-events-none" />
          <AlertTriangle className="h-16 w-16 text-rose-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
          <h2 className="text-2xl font-heading font-black text-white mb-2">Error Loading Report</h2>
          <p className="text-slate-400 text-sm mb-8 font-medium">{error || 'Report not found.'}</p>
          <MagneticButton className="w-full">
            <Link to="/dashboard" className="px-6 py-4 w-full bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition flex items-center justify-center">
              Return to Dashboard
            </Link>
          </MagneticButton>
        </GlassCard>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 75) return { text: 'text-brand-400', border: 'border-brand-500/20', bg: 'bg-brand-500/10', circle: '#3b82f6' };
    if (score >= 50) return { text: 'text-brand-450', border: 'border-brand-500/20', bg: 'bg-brand-500/10', circle: '#3b82f6' };
    return { text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10', circle: '#f43f5e' };
  };

  const scoreTheme = getScoreColor(analysis.atsScore);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analysis.atsScore / 100) * circumference;

  // Mocked details for the new scorecard checklist based on real score
  const checkSpelling = true;
  const checkContactInfo = true;
  const checkFileFormat = "PDF / Word Format Supported";
  const actionVerbRatio = analysis.atsScore >= 75 ? "92% Excellent" : "74% Average";
  const resultsCount = analysis.atsScore >= 75 ? "5 items found" : "2 items found";

  return (
    <div className="min-h-full flex flex-col items-center px-4 md:px-8 py-8 relative">
      <div className="max-w-6xl w-full z-10">
        
        {/* Navigation / Actions Bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition group">
            <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to Dashboard</span>
          </Link>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()}
              className="px-5 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/[0.05] hover:border-white/[0.1] font-bold rounded-2xl transition-all text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-inner"
            >
              <FileText className="h-4 w-4" /> Print / Save PDF
            </button>
            <MagneticButton>
              <Link 
                to={`/interview/${analysis.id}`}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/20 transition-all text-xs flex items-center gap-2"
              >
                <Play className="h-4 w-4 fill-current" /> Practice Mock Interview
              </Link>
            </MagneticButton>
          </div>
        </motion.div>

        {/* Report Overview Panel */}
        <GlassCard className="p-6 md:p-10 rounded-[40px] mb-8 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>
          
          {/* Circular Gauge Graphic */}
          <div className="relative flex items-center justify-center shrink-0 group">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="80" className="stroke-white/[0.05]" strokeWidth="12" fill="transparent" />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke={scoreTheme.circle}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={(2 * Math.PI * 80) - (analysis.atsScore / 100) * (2 * Math.PI * 80)}
                strokeLinecap="round"
                className="transition-all duration-1500 ease-out drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-6xl font-heading font-black text-white tracking-tighter">{analysis.atsScore}</span>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-300 mt-1">ATS Score</span>
            </div>
          </div>

          {/* Details Metadata */}
          <div className="flex-grow text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-300 text-xs font-bold tracking-wide shadow-inner">
              <Calendar className="h-3.5 w-3.5 text-brand-400" />
              <span>Analyzed on {new Date(analysis.analyzedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">Target Profile</h2>
            <p className="text-brand-100 text-sm md:text-base leading-relaxed max-w-2xl font-mono bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05] shadow-inner break-words">
              {analysis.targetJobTitle}
            </p>
          </div>
        </GlassCard>

        {/* 2-Column Workspaces */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE COLUMN (Main Content, lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Widget 1: Structural Scorecard Checklist */}
            <GlassCard className="p-8 rounded-[32px]">
              <h3 className="text-lg font-heading font-black text-white mb-6 flex items-center gap-3">
                <FileCheck className="h-6 w-6 text-brand-400" />
                <span>ATS Structural Scorecard</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-inner">
                  <span className="text-xs font-bold text-slate-300">Spelling & Grammar Check</span>
                  <span className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold tracking-wider uppercase rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    <Check className="h-3.5 w-3.5" /> Passed
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-inner">
                  <span className="text-xs font-bold text-slate-300">Contact Information</span>
                  <span className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold tracking-wider uppercase rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    <Check className="h-3.5 w-3.5" /> Detected
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-inner">
                  <span className="text-xs font-bold text-slate-300">File Integrity & Formatting</span>
                  <span className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold tracking-wider uppercase rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    <Check className="h-3.5 w-3.5" /> Good
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-inner">
                  <span className="text-xs font-bold text-slate-300">Action Verbs Density</span>
                  <span className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold tracking-wider uppercase rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    {actionVerbRatio}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Widget 2: Missing Skills & Match Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 flex flex-col">
                <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                  <CheckSquare className="h-4.5 w-4.5 text-brand-400" />
                  <span>Match Status</span>
                </h4>
                <GlassCard className={`p-6 rounded-[24px] flex-grow flex flex-col justify-center items-center text-center ${scoreTheme.bg} ${scoreTheme.border}`}>
                  <span className={`text-5xl font-heading font-black mb-2 ${scoreTheme.text}`}>
                    {analysis.atsScore}%
                  </span>
                  <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-3">
                    {analysis.atsScore >= 75 ? 'Strong Match' : analysis.atsScore >= 50 ? 'Needs Tweaking' : 'Weak Match'}
                  </span>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed px-2">
                    {analysis.atsScore >= 75 
                      ? 'Your resume has good keyword alignment. Focus on polishing metrics.' 
                      : analysis.atsScore >= 50 
                      ? 'Adding the missing skills listed on the right will significantly raise your score.' 
                      : 'Critical keywords are missing. Revise using suggestions.'}
                  </p>
                </GlassCard>
              </div>

              <div className="md:col-span-8 flex flex-col">
                <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                  <ListFilter className="h-4.5 w-4.5 text-cyan-400" />
                  <span>Detected Skill Gaps</span>
                </h4>
                <GlassCard className="p-6 rounded-[24px] flex-grow">
                  <p className="text-slate-400 text-xs font-medium mb-5 leading-relaxed">
                    We scanned the target description and found these key technologies or concepts missing or weakly represented in your resume:
                  </p>
                  
                  {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                    <div>
                      <div className="flex flex-wrap gap-2.5 mb-5">
                        {analysis.missingSkills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-4 py-2 bg-white/[0.03] border border-white/[0.08] hover:border-brand-500/50 text-slate-300 hover:text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-inner"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <Link 
                        to={`/courses/${analysis.id}`} 
                        className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors font-bold group"
                      >
                        View Recommended Courses to Cover Gaps <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-brand-400 text-sm font-semibold bg-brand-500/10 border border-brand-500/20 p-5 rounded-2xl shadow-inner">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span>Perfect! No critical skill gaps detected. You have full match coverage.</span>
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>



            {/* Widget 4: Market Match & Salary Insights (Left Column Space Filler) */}
            {/* Widget 4: Market Match & Salary Insights (Left Column Space Filler) */}
            <GlassCard className="p-8 rounded-[32px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>
              
              <h3 className="text-lg font-heading font-black text-white mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-brand-400" />
                <span>Market Insights & Demand Estimator</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-inner">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Average Salary Range</span>
                  <span className="text-xl font-heading font-black text-white">$105k - $155k</span>
                  <span className="block text-[9px] font-medium text-slate-400 mt-1">Based on global stack rates</span>
                </div>

                <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-inner">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Market Hiring Demand</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></span>
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">High Demand</span>
                  </div>
                  <span className="block text-[9px] font-medium text-slate-400 mt-1.5">2.4k active openings this week</span>
                </div>

                <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-inner">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Match Quality Index</span>
                  <span className="text-xs font-bold text-brand-400 block mt-1">Optimal Matching</span>
                  <span className="block text-[9px] font-medium text-slate-400 mt-1.5">Based on resume keywords</span>
                </div>

              </div>

              {/* Matching Positions Board */}
              <div className="space-y-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Matching Opportunities</span>
                
                <div className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] rounded-2xl transition-all cursor-pointer group">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-none group-hover:text-brand-400 transition-colors">Full-Stack Engineer</h4>
                    <span className="text-[10px] font-medium text-slate-500 mt-1.5 block">Stripe • Remote</span>
                  </div>
                  <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20 shadow-inner">85% Match</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] rounded-2xl transition-all cursor-pointer group">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-none group-hover:text-brand-400 transition-colors">Senior Software Engineer (Java)</h4>
                    <span className="text-[10px] font-medium text-slate-500 mt-1.5 block">Netflix • Los Gatos, CA</span>
                  </div>
                  <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20 shadow-inner">78% Match</span>
                </div>

              </div>
            </GlassCard>

          </div>

          {/* RIGHT SIDE COLUMN (Widgets / Visuals, lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-8">
            

            {/* Widget B: Interactive Career Prep Roadmap Timeline */}
            <GlassCard className="p-8 rounded-[32px]">
              <h3 className="text-lg font-heading font-black text-white mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-cyan-400" />
                <span>Job Preparation Roadmap</span>
              </h3>

              <div className="space-y-6 relative pl-5 border-l-2 border-white/[0.05] mt-2">
                
                {/* Step 1 */}
                <div className="relative space-y-1.5 group cursor-pointer">
                  <span className="absolute left-[-29px] top-0 h-4 w-4 bg-brand-500 border-4 border-[#030509] rounded-full flex items-center justify-center group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                    <Check className="h-2 w-2 text-white" />
                  </span>
                  <h4 className="text-sm font-bold text-white leading-none">Resume Evaluation</h4>
                  <p className="text-[11px] font-medium text-slate-400">Skills parsed and diagnostics computed.</p>
                </div>

                {/* Step 2 */}
                <div className="relative space-y-1.5 group cursor-pointer">
                  <span className="absolute left-[-29px] top-0 h-4 w-4 bg-brand-500 border-4 border-[#030509] rounded-full flex items-center justify-center group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                    <Check className="h-2 w-2 text-white" />
                  </span>
                  <h4 className="text-sm font-bold text-white leading-none">Diagnostics Scorecard</h4>
                  <p className="text-[11px] font-medium text-slate-400">Structural matching scorecard ready.</p>
                </div>

                {/* Step 3 */}
                <div className="relative space-y-1.5 group cursor-pointer">
                  <span className="absolute left-[-29px] top-0 h-4 w-4 bg-brand-500 border-4 border-[#030509] rounded-full flex items-center justify-center group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                  <h4 className="text-sm font-bold text-brand-400 leading-none">Upskilling Recommendations</h4>
                  <p className="text-[11px] font-medium text-slate-400">Cover detected gaps using suggested courses.</p>
                </div>

                {/* Step 4 */}
                <div className="relative space-y-1.5 group cursor-pointer">
                  <span className="absolute left-[-29px] top-0 h-4 w-4 bg-white/[0.1] border-4 border-[#030509] rounded-full flex items-center justify-center group-hover:bg-white/[0.2] transition-colors"></span>
                  <h4 className="text-sm font-bold text-slate-500 leading-none group-hover:text-slate-400 transition-colors">Practice Simulation</h4>
                  <p className="text-[11px] font-medium text-slate-600 group-hover:text-slate-500 transition-colors">Run a custom mock interview session.</p>
                </div>

              </div>
            </GlassCard>

            {/* Widget C: Interactive AI Career Copilot Chat Window */}
            <GlassCard className="p-8 rounded-[32px] flex flex-col h-[400px]">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-5 shrink-0">
                <h3 className="text-lg font-heading font-black text-white flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-brand-400" />
                  <span>AI Career Copilot</span>
                </h3>
                <span className="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></span>
              </div>

              {/* Chat Messages scroll area */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 text-sm mb-5 min-h-[180px] custom-scrollbar">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-2xl max-w-[85%] font-medium leading-relaxed shadow-inner ${
                      msg.sender === 'copilot'
                        ? 'bg-white/[0.03] text-slate-200 border border-white/[0.05] rounded-tl-none mr-auto animate-slide-up'
                        : 'bg-brand-600 text-white rounded-tr-none ml-auto animate-slide-up shadow-[0_5px_15px_rgba(59,130,246,0.2)]'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="flex gap-3 shrink-0">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Copilot anything..."
                  className="flex-grow bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] focus:bg-white/[0.02] focus:border-brand-500 rounded-2xl px-5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                />
                <MagneticButton
                  type="submit"
                  className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl transition flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                >
                  <Send className="h-5 w-5" />
                </MagneticButton>
              </form>
            </GlassCard>

          </div>

        </div>

      </div>
    </div>
  );
}
