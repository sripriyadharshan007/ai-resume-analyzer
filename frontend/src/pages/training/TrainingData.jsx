import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, Database, Trash2, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import MagneticButton from '../../components/ui/MagneticButton';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function TrainingData() {
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTrainingResumes();
  }, []);

  const fetchTrainingResumes = async () => {
    try {
      const response = await axios.get('/api/training');
      setResumes(response.data);
    } catch (err) {
      console.error('Failed to fetch training resumes', err);
    }
  };

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
    setSuccess('');
    if (!file) return;

    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
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

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a reference resume file first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'Standard');

      await axios.post('/api/training/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Reference resume successfully added to the Knowledge Base.');
      setFile(null);
      fetchTrainingResumes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload training resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this reference resume from the AI Knowledge Base?')) {
      return;
    }

    try {
      await axios.delete(`/api/training/${id}`);
      fetchTrainingResumes();
      setSuccess('Reference resume removed successfully.');
    } catch (err) {
      setError('Failed to delete resume.');
    }
  };

  return (
    <div className="min-h-full p-4 md:p-8 flex flex-col items-center relative">
      <div className="max-w-5xl w-full z-10">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-3 text-white flex items-center gap-4">
            <Database className="h-10 w-10 text-brand-500" /> AI Knowledge Base
          </h1>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-2xl font-medium">
            Upload ideal reference resumes here. Our AI will securely store and analyze these resumes as standard examples, actively learning your industry benchmarks and formatting expectations to provide highly accurate and tailored grading.
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm font-semibold shadow-inner">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-sm font-semibold shadow-inner">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Uploader section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-5 flex flex-col">
            <GlassCard className="p-6 h-full flex flex-col">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Add Reference Data</h2>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={cn(
                  "flex-grow relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 group min-h-[250px]",
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
                    <div className="p-3 bg-brand-500/20 rounded-2xl mb-3 text-brand-400">
                      <FileText className="h-8 w-8" />
                    </div>
                    <span className="text-white font-bold text-sm truncate max-w-[180px]">{file.name}</span>
                    <span className="text-slate-400 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    
                    <button 
                      type="button" 
                      onClick={removeFile}
                      className="mt-4 px-4 py-1.5 rounded-xl bg-white/[0.05] hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 text-xs font-bold transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center pointer-events-none relative z-10">
                    <div className="p-4 bg-white/[0.03] group-hover:bg-brand-500/10 rounded-2xl mb-4 text-slate-400 group-hover:text-brand-400 transition-colors">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-xs text-slate-200 font-semibold mb-1">
                      Drag & drop ideal resume
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      PDF, DOCX limit 10MB
                    </span>
                  </div>
                )}
              </div>
              <MagneticButton
                onClick={handleUpload}
                disabled={loading || !file}
                className={cn(
                  "mt-4 w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg",
                  (!file || loading) ? "opacity-50 cursor-not-allowed" : "shadow-brand-500/20"
                )}
              >
                {loading ? "Uploading to AI..." : "Store as Reference"}
              </MagneticButton>
            </GlassCard>
          </motion.div>

          {/* List section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-7 flex flex-col">
            <GlassCard className="p-6 h-full flex flex-col">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Active Knowledge Base</span>
                <span className="bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-md text-[10px]">
                  {resumes.length} Document(s)
                </span>
              </h2>
              
              <div className="flex-grow flex flex-col gap-3 overflow-y-auto custom-scrollbar max-h-[400px] pr-2">
                {resumes.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-white/[0.05] rounded-3xl bg-white/[0.01]">
                    <Database className="h-10 w-10 text-slate-600 mb-3" />
                    <p className="text-slate-400 text-sm font-medium">Knowledge Base is currently empty.</p>
                    <p className="text-slate-500 text-xs mt-1">Upload reference resumes to train the AI.</p>
                  </div>
                ) : (
                  resumes.map((r, index) => (
                    <motion.div 
                      key={r.id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-2xl flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold truncate max-w-[200px] md:max-w-[300px]">
                            {r.filename}
                          </p>
                          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                            Added: {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Remove from AI Context"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
