import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Upload, FileText, Sparkles, AlertCircle, 
  ArrowLeft, CheckCircle2, ChevronRight, Briefcase
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import MagneticButton from '../../components/ui/MagneticButton';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  
  // Progress & loading states
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    setError('');
    if (!file) return;

    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/msword' // doc
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setError('Unsupported file type. Please upload a PDF or Word document (.docx/.doc).');
      setFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum permitted size is 10MB.');
      setFile(null);
      return;
    }

    setFile(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a resume file first.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please provide a target job description.');
      return;
    }

    setError('');
    setLoading(true);
    setProgress(10);
    setStatusMessage('Uploading resume document...');

    // Simulate multi-stage progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        
        // Progress stage message changes
        const nextProgress = prev + Math.floor(Math.random() * 10) + 2;
        if (nextProgress > 30 && nextProgress <= 60) {
          setStatusMessage('Parsing document text using Apache Tika...');
        } else if (nextProgress > 60 && nextProgress <= 85) {
          setStatusMessage('Analyzing keywords and metrics with Gemini AI...');
        } else if (nextProgress > 85) {
          setStatusMessage('Finalizing detailed diagnostics and scoring...');
        }
        return nextProgress;
      });
    }, 450);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobDescription', jobDescription);

      const response = await axios.post('/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage('Analysis complete!');
      
      setTimeout(() => {
        navigate(`/report/${response.data.id}`);
      }, 700);

    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      setError(err.response?.data?.message || 'Processing failed. Please check your network and Gemini API configuration.');
      setLoading(false);
      setProgress(0);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-full p-4 md:p-8 flex flex-col items-center relative">
      <div className="max-w-5xl w-full z-10">
        
        {/* Header navigation */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition group font-semibold text-xs tracking-wide uppercase">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Dashboard</span>
          </Link>

        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-3 text-white">Analyze Your Resume</h1>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-2xl font-medium">
            Upload your resume file and paste the job description below. Our system will extract the skills and evaluate them against your target role using Gemini AI.
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm font-semibold shadow-inner">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {loading ? (
          /* Process Loader View */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-16 rounded-[40px] flex flex-col items-center justify-center text-center min-h-[500px] relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-500/5 pointer-events-none mix-blend-screen" />
              
              <div className="relative mb-12">
                {/* Outer pulsing ring */}
                <div className="absolute -inset-8 bg-brand-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
                {/* Spinning circular loader */}
                <div className="h-24 w-24 border-4 border-white/5 border-t-brand-500 rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
                <Sparkles className="absolute top-9 left-9 h-6 w-6 text-brand-400 animate-pulse" />
              </div>

              <h3 className="text-4xl font-heading font-black mb-3 text-white">{progress}% Complete</h3>
              <p className="text-brand-300 text-xs font-bold uppercase tracking-[0.2em] max-w-sm h-12 leading-relaxed animate-pulse">
                {statusMessage}
              </p>

              {/* Progress Bar Container */}
              <div className="w-full max-w-lg bg-white/[0.03] border border-white/[0.05] h-3 rounded-full overflow-hidden mt-6 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-shimmer" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          /* Main Input Form */
          <motion.form 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit} 
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left side: File dropzone (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Resume Document
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={cn(
                  "flex-grow relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 group min-h-[300px]",
                  file ? "border-brand-500/50 bg-brand-500/5" : "border-white/[0.1] bg-white/[0.01] hover:border-brand-500/30 hover:bg-brand-500/5"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center animate-fade-in relative z-10">
                    <div className="p-4 bg-brand-500/20 rounded-2xl mb-4 text-brand-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <span className="text-white font-bold text-sm truncate max-w-[200px]">{file.name}</span>
                    <span className="text-slate-400 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    
                    <button 
                      type="button" 
                      onClick={removeFile}
                      className="mt-6 px-5 py-2 rounded-xl bg-white/[0.05] hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 text-xs font-bold transition-colors border border-transparent hover:border-rose-500/20"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center pointer-events-none relative z-10">
                    <div className="p-5 bg-white/[0.03] group-hover:bg-brand-500/10 rounded-3xl mb-5 text-slate-400 group-hover:text-brand-400 transition-colors shadow-inner">
                      <Upload className="h-8 w-8" />
                    </div>
                    <p className="text-sm text-slate-200 font-semibold mb-2">
                      Drag & drop your resume here
                    </p>
                    <p className="text-xs text-slate-500 mb-6 font-medium">
                      or click to browse from device
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-white/[0.03] px-3 py-1.5 rounded-lg">
                      PDF, DOCX up to 10MB
                    </span>
                  </div>
                )}
                
                {/* Decorative glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-500/0 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>

            {/* Right side: Job description (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Target Job Description
              </label>
              
              <div className="relative flex-grow flex flex-col group">
                <Briefcase className="absolute top-5 left-5 h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here. Our AI will analyze the required skills and requirements to benchmark your resume."
                  className="w-full flex-grow bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] focus:border-brand-500 focus:bg-white/[0.02] rounded-3xl p-5 pl-14 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all resize-none shadow-inner custom-scrollbar min-h-[300px]"
                ></textarea>
              </div>
            </div>

            {/* Submit button (full width) */}
            <div className="lg:col-span-12 mt-4 flex justify-end">
              <MagneticButton
                type="submit"
                disabled={loading}
                className={cn(
                  "px-10 py-5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-500/20 disabled:bg-brand-600/50 disabled:cursor-not-allowed",
                  (!file || !jobDescription) ? "opacity-50" : "opacity-100"
                )}
              >
                Start Evaluation <ChevronRight className="h-5 w-5 ml-2" />
              </MagneticButton>
            </div>
          </motion.form>
        )}

      </div>
    </div>
  );
}
