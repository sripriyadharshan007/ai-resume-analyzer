import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import MagneticButton from '../../components/ui/MagneticButton';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeft, Mic, MicOff, Send, Award, Sparkles, CheckCircle2, 
  HelpCircle, ChevronRight, AlertTriangle, AlertCircle, ShieldCheck, RefreshCw
} from 'lucide-react';

export default function InterviewPrep() {
  const { id } = useParams(); // analysisId
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Live feedback for current question
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const navigate = useNavigate();

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setAnswerText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Fetch or Start Interview Session
  useEffect(() => {
    const startSession = async () => {
      try {
        const response = await axios.post('/api/interview/start', { analysisId: id });
        setSession(response.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to initialize the mock interview session.');
      } finally {
        setLoading(false);
      }
    };

    startSession();

    // Clean up recognition
    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [id]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setError('');
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setError('');
    setSubmitting(true);

    const activeQuestion = session.questions[currentIdx];

    try {
      const response = await axios.post(`/api/interview/${session.id}/submit`, {
        questionId: activeQuestion.questionId,
        userAnswerText: answerText
      });

      // Update feedback cards
      setCurrentFeedback(response.data);

      // Append answer to session details locally
      const updatedAnswers = [...session.answers, response.data];
      const updatedSession = { ...session, answers: updatedAnswers };
      
      if (updatedAnswers.length >= session.questions.length) {
        updatedSession.status = "COMPLETED";
      }
      setSession(updatedSession);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentFeedback(null);
    setAnswerText('');
    
    if (currentIdx + 1 < session.questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleRetake = async () => {
    setLoading(true);
    setError('');
    setSession(null);
    setCurrentIdx(0);
    setAnswerText('');
    setCurrentFeedback(null);
    setShowSummary(false);
    
    try {
      const response = await axios.post('/api/interview/start', { analysisId: id });
      setSession(response.data);
    } catch (err) {
      setError('Failed to restart the session.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex flex-col justify-center items-center py-20">
        <div className="h-16 w-16 border-4 border-white/5 border-t-brand-500 rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-6"></div>
        <p className="text-brand-300 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Setting up your AI mock interview session...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-full flex flex-col justify-center items-center py-20 px-4">
        <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-8 max-w-md w-full rounded-3xl text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Starting Mock</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Link to="/dashboard" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const activeQuestion = session.questions[currentIdx];
  const totalQuestions = session.questions.length;

  // Render Session Completed Summary
  if (showSummary || session.status === 'COMPLETED' && !currentFeedback) {
    const totalScore = session.answers.reduce((sum, ans) => sum + ans.aiScore, 0);
    const avgScore = Math.round(totalScore / session.answers.length);

    return (
      <div className="min-h-full flex flex-col items-center px-4 md:px-8 py-8 relative">
        <div className="max-w-4xl w-full z-10">
          
          <div className="flex items-center justify-between mb-8">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition group">
              <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>
            <button 
              onClick={handleRetake}
              className="px-4 py-2 bg-white/[0.03] hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-white/[0.15] font-semibold rounded-xl transition text-xs flex items-center gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retake Interview
            </button>
          </div>

          {/* Overall Score Summary Header */}
          <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-8 rounded-3xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-brand-950/20 to-cyan-950/20 border-brand-500/20">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck className="h-3.5 w-3.5" /> Interview Completed
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Evaluation Report</h2>
              <p className="text-slate-400 text-sm max-w-md">
                Review scores, detailed constructive feedback and keyword metrics for each question.
              </p>
            </div>
            
            <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-2xl text-center min-w-[160px] bg-white/[0.03] border-slate-800">
              <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Average Grade</span>
              <span className={`text-4xl font-extrabold block ${
                avgScore >= 75 ? 'text-brand-400' : avgScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>{avgScore}%</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                {avgScore >= 75 ? 'Excellent Work' : avgScore >= 50 ? 'Solid Attempt' : 'Requires Practice'}
              </span>
            </div>
          </div>

          {/* Graded Questions List */}
          <div className="space-y-6">
            {session.questions.map((q, idx) => {
              const matchedAns = session.answers.find(a => a.questionId === q.questionId);
              if (!matchedAns) return null;

              return (
                <div key={q.questionId} className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-2xl">
                  <div className="flex justify-between items-center gap-4 mb-4 pb-4 border-b border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-white/[0.03] border border-white/[0.05] rounded-lg text-xs font-bold text-slate-400">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{q.category}</span>
                    </div>
                    <span className={`px-2.5 py-1 border rounded-lg text-xs font-extrabold ${
                      matchedAns.aiScore >= 75 ? 'text-brand-400 border-brand-500/10 bg-brand-500/5' :
                      matchedAns.aiScore >= 50 ? 'text-amber-400 border-amber-500/10 bg-amber-500/5' :
                      'text-rose-400 border-rose-500/10 bg-rose-500/5'
                    }`}>
                      Score: {matchedAns.aiScore}%
                    </span>
                  </div>

                  <p className="text-white font-bold text-sm mb-4 leading-relaxed italic">
                    "{q.questionText}"
                  </p>

                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] mb-4">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Your Answer</span>
                    <p className="text-slate-300 text-xs leading-relaxed font-mono">
                      {matchedAns.userAnswerText}
                    </p>
                  </div>

                  <div className="bg-brand-500/5 p-4 border border-brand-500/10 rounded-xl mb-4">
                    <span className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1.5">AI Feedback</span>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {matchedAns.aiFeedback}
                    </p>
                  </div>

                  {matchedAns.idealKeywords && matchedAns.idealKeywords.length > 0 && (
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Recommended Keywords</span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedAns.idealKeywords.map((kw, kidx) => (
                          <span key={kidx} className="px-2 py-1 bg-white/[0.03] text-slate-400 border border-white/[0.05] rounded-lg text-[10px] font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  // Render question-by-question console
  return (
    <div className="min-h-full flex flex-col items-center px-4 md:px-8 py-8 relative">
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-brand-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-3xl w-full z-10">
        
        {/* Header navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link to={`/report/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition group">
            <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" />
            <span>Cancel Session</span>
          </Link>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Question {currentIdx + 1} of {totalQuestions}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Core Question Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 md:p-8 rounded-3xl mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3.5 py-1.5 bg-brand-500/15 border border-brand-500/20 rounded-xl text-xs font-bold text-brand-400">
              {activeQuestion.category}
            </span>
            <span className="px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-xl text-xs font-semibold text-slate-400">
              Difficulty: {activeQuestion.difficulty}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed italic">
            "{activeQuestion.questionText}"
          </h2>

          {!currentFeedback ? (
            /* Input Answer Form */
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div className="relative">
                <textarea
                  required
                  disabled={submitting}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Record your voice or type your response here in detail..."
                  className="w-full min-h-[160px] bg-white/[0.02] border border-white/[0.05] focus:border-brand-500 rounded-2xl p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none transition-all leading-relaxed"
                ></textarea>

                {/* Speech Dictation Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={submitting}
                  className={`absolute bottom-4 right-4 p-3 rounded-full border transition-all ${
                    isRecording 
                      ? 'bg-red-600/20 border-red-500 text-red-500 animate-pulse' 
                      : 'bg-white/[0.03] border-slate-800 text-slate-400 hover:text-white hover:border-white/[0.15]'
                  }`}
                  title={isRecording ? "Stop dictation" : "Dictate response"}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>

              {isRecording && (
                <div className="flex items-center gap-2 text-red-500 text-xs animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span>Recording voice input... Speak clearly.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !answerText.trim()}
                className="w-full py-4 mt-2 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {submitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Evaluating answer via AI...</span>
                  </>
                ) : (
                  <>
                    Submit Answer <Send className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Live Answer Grade Feedback view */
            <div className="space-y-6 pt-4 border-t border-white/[0.05] animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl">
                <div>
                  <h4 className="font-bold text-white mb-1">Answer Evaluated</h4>
                  <p className="text-slate-400 text-xs">AI reciter generated constructive pointers.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Score:</span>
                  <span className={`px-3.5 py-1.5 rounded-xl border text-sm font-extrabold ${
                    currentFeedback.aiScore >= 75 ? 'text-brand-400 border-brand-500/20 bg-brand-500/10' :
                    currentFeedback.aiScore >= 50 ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                    'text-rose-400 border-rose-500/20 bg-rose-500/10'
                  }`}>{currentFeedback.aiScore}%</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1.5">Improvement Feedback</span>
                <p className="text-slate-300 text-sm leading-relaxed bg-brand-500/5 border border-brand-500/10 p-4 rounded-xl">
                  {currentFeedback.aiFeedback}
                </p>
              </div>

              {currentFeedback.idealKeywords && currentFeedback.idealKeywords.length > 0 && (
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Keywords looked for</span>
                  <div className="flex flex-wrap gap-2">
                    {currentFeedback.idealKeywords.map((kw, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-xl text-xs font-medium text-slate-400">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full py-4 mt-4 bg-white/[0.03] hover:bg-slate-850 text-white font-bold rounded-2xl border border-slate-800 hover:border-white/[0.15] transition-all flex items-center justify-center gap-2"
              >
                {currentIdx + 1 < totalQuestions ? (
                  <>
                    Next Question <ChevronRight className="h-4.5 w-4.5" />
                  </>
                ) : (
                  <>
                    View Interview Summary <Award className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
