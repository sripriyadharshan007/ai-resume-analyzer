import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, Plus, Trash2, Download, Save, History, 
  FileText, User, Briefcase, GraduationCap, Award, 
  BrainCircuit, RefreshCw, Eye, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import MagneticButton from '../../components/ui/MagneticButton';
import { motion } from 'framer-motion';

export default function ResumeBuilder() {
  const { user } = useAuth();
  
  // Active Tab: 'personal' | 'experience' | 'education' | 'projects' | 'history'
  const [activeTab, setActiveTab] = useState('personal');
  
  // Selected Template Style: 'modern' | 'minimalist' | 'tech'
  const [templateStyle, setTemplateStyle] = useState('modern');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [enhancingField, setEnhancingField] = useState(null); // track which field is enhancing
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Resume State Data
  const [resumeId, setResumeId] = useState('');
  const [title, setTitle] = useState('My AI Resume');
  const [version, setVersion] = useState(1);
  const [personalDetails, setPersonalDetails] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    summary: ''
  });
  const [experience, setExperience] = useState([
    { company: '', role: '', startDate: '', endDate: '', description: '' }
  ]);
  const [education, setEducation] = useState([
    { school: '', degree: '', startDate: '', endDate: '', description: '' }
  ]);
  const [projects, setProjects] = useState([
    { name: '', technologies: '', description: '' }
  ]);
  const [skills, setSkills] = useState('');
  const [certifications, setCertifications] = useState('');

  // List of saved resumes (for Version History)
  const [savedResumes, setSavedResumes] = useState([]);

  // Fetch Saved Resumes History List
  const fetchSavedResumes = async () => {
    try {
      const response = await axios.get('/api/resumes/builder/list');
      setSavedResumes(response.data);
    } catch (err) {
      console.error('Failed to fetch saved resumes history', err);
    }
  };

  useEffect(() => {
    fetchSavedResumes();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Enhance Wording utilizing Gemini API
  const handleEnhanceText = async (text, context, updateCallback, fieldKey) => {
    if (!text || !text.trim()) {
      showToast('Please enter some text first to enhance', 'error');
      return;
    }
    setEnhancingField(fieldKey);
    try {
      const response = await axios.post('/api/resumes/builder/enhance', { text, context });
      updateCallback(response.data.enhancedText);
      showToast('Wording enhanced successfully by Gemini AI!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to enhance wording. Using smart local suggestions.', 'warning');
      // local fallback
      const mockResult = `Spearheaded design and implementation of key features (${text}), optimizing overall system modular structure and improving scalability by 25%.`;
      updateCallback(mockResult);
    } finally {
      setEnhancingField(null);
    }
  };

  // Save Resume in Database
  const handleSaveResume = async () => {
    setSaveLoading(true);
    try {
      // Split comma separated lists
      const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
      const parsedCerts = certifications.split(',').map(c => c.trim()).filter(Boolean);

      const payload = {
        id: resumeId || null,
        title,
        personalDetails,
        experience,
        education,
        projects,
        skills: parsedSkills,
        certifications: parsedCerts
      };

      const response = await axios.post('/api/resumes/builder/save', payload);
      setResumeId(response.data.id);
      setVersion(response.data.version);
      showToast(`Resume "${title}" saved successfully (v${response.data.version})!`, 'success');
      fetchSavedResumes();
    } catch (err) {
      console.error(err);
      showToast('Failed to save resume.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // Load a Saved Resume Version
  const handleLoadResume = (res) => {
    setResumeId(res.id);
    setTitle(res.title);
    setVersion(res.version);
    setPersonalDetails(res.personalDetails || { fullName: '', email: '', phone: '', location: '', linkedin: '', portfolio: '', summary: '' });
    setExperience(res.experience || []);
    setEducation(res.education || []);
    setProjects(res.projects || []);
    setSkills(res.skills ? res.skills.join(', ') : '');
    setCertifications(res.certifications ? res.certifications.join(', ') : '');
    showToast(`Loaded resume "${res.title}" (v${res.version})`, 'success');
    setActiveTab('personal');
  };

  // Delete a Resume Version
  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume version?')) return;
    try {
      await axios.delete(`/api/resumes/builder/${id}`);
      showToast('Resume deleted successfully', 'success');
      fetchSavedResumes();
      if (resumeId === id) {
        // Clear active
        setResumeId('');
        setTitle('My AI Resume');
        setVersion(1);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete resume', 'error');
    }
  };

  // Download PDF layout hack using native window.print()
  const handleDownloadPDF = () => {
    window.print();
  };

  // Helpers to add/remove dynamic lists
  const addExperience = () => {
    setExperience([...experience, { company: '', role: '', startDate: '', endDate: '', description: '' }]);
  };
  const removeExperience = (index) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };
  const updateExperience = (index, key, value) => {
    const updated = [...experience];
    updated[index][key] = value;
    setExperience(updated);
  };

  const addEducation = () => {
    setEducation([...education, { school: '', degree: '', startDate: '', endDate: '', description: '' }]);
  };
  const removeEducation = (index) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };
  const updateEducation = (index, key, value) => {
    const updated = [...education];
    updated[index][key] = value;
    setEducation(updated);
  };

  const addProject = () => {
    setProjects([...projects, { name: '', technologies: '', description: '' }]);
  };
  const removeProject = (index) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };
  const updateProject = (index, key, value) => {
    const updated = [...projects];
    updated[index][key] = value;
    setProjects(updated);
  };

  return (
    <div className="min-h-full flex flex-col items-center px-2 md:px-6 py-8 relative selection:bg-brand-500 selection:text-white print:p-0 print:bg-white print:text-black">
      {/* Decorative Blur Backgrounds - Hidden in print */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-brand-500/5 rounded-full blur-[120px] pointer-events-none print:hidden"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none print:hidden"></div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl border bg-slate-900 shadow-2xl animate-slide-up border-brand-500/20 print:hidden">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-brand-400" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="h-4.5 w-4.5 text-rose-400" />
          ) : (
            <Sparkles className="h-4.5 w-4.5 text-amber-400" />
          )}
          <span className="text-xs font-semibold text-slate-205">{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl w-full z-10 flex flex-col print:max-w-full">
        
        {/* Editor Top Control Bar - Hidden in print */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <BrainCircuit className="h-7 w-7 text-brand-400" />
              <span>AI Resume Builder</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Construct ATS-compliant resumes with smart Gemini sentence enhancers and instant A4 PDF exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resume Title..."
              className="bg-slate-900 border border-slate-800 focus:border-brand-500 text-xs font-semibold text-white px-3 py-2.5 rounded-xl outline-none"
            />
            {resumeId && (
              <span className="px-2.5 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold rounded-lg uppercase">
                v{version} Saved
              </span>
            )}
            <button 
              onClick={handleSaveResume}
              disabled={saveLoading}
              className="px-4.5 py-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Resume</span>
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="px-4.5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Templates Selection Ribbon - Hidden in print */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 border-b border-white/[0.05] print:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-2">Template style:</span>
          <button 
            onClick={() => setTemplateStyle('modern')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition shrink-0 ${
              templateStyle === 'modern' 
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' 
                : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Emerald Modern
          </button>
          <button 
            onClick={() => setTemplateStyle('minimalist')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition shrink-0 ${
              templateStyle === 'minimalist' 
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' 
                : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Minimalist Classic
          </button>
          <button 
            onClick={() => setTemplateStyle('tech')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition shrink-0 ${
              templateStyle === 'tech' 
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' 
                : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Tech Console (Monospace)
          </button>
        </div>

        {/* Workspace Panels Grid: Left Form, Right Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block print:w-full">
          
          {/* LEFT SIDE PANEL (Form Editor Tabs, lg:col-span-6) - Hidden in print */}
          <div className="lg:col-span-6 space-y-6 print:hidden">
            
            {/* Editor Tab Navigation Ribbon */}
            <div className="flex bg-white/[0.02] border border-white/[0.05] p-1 rounded-2xl gap-1 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('personal')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'personal' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Contact</span>
              </button>
              <button 
                onClick={() => setActiveTab('experience')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'experience' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Experience</span>
              </button>
              <button 
                onClick={() => setActiveTab('education')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'education' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Education</span>
              </button>
              <button 
                onClick={() => setActiveTab('projects')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'projects' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Skills/Projects</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'history' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>History</span>
              </button>
            </div>

            {/* Tab Body: Personal Details */}
            {activeTab === 'personal' && (
              <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl space-y-4 border border-slate-900">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Personal Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                    <input 
                      type="text" 
                      value={personalDetails.fullName}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                      placeholder="e.g. Sri Priyadharshan"
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email" 
                      value={personalDetails.email}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })}
                      placeholder="e.g. dev@example.com"
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                    <input 
                      type="text" 
                      value={personalDetails.phone}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Location</label>
                    <input 
                      type="text" 
                      value={personalDetails.location}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">LinkedIn profile link</label>
                    <input 
                      type="text" 
                      value={personalDetails.linkedin}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/username"
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Portfolio / Website link</label>
                    <input 
                      type="text" 
                      value={personalDetails.portfolio}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, portfolio: e.target.value })}
                      placeholder="e.g. github.com/username"
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Professional Summary</label>
                    <button 
                      onClick={() => handleEnhanceText(
                        personalDetails.summary, 
                        `Summary for ${title}`, 
                        (enhanced) => setPersonalDetails({ ...personalDetails, summary: enhanced }),
                        'summary'
                      )}
                      className="text-[10px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 transition"
                    >
                      {enhancingField === 'summary' ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      <span>AI Enhance summary</span>
                    </button>
                  </div>
                  <textarea 
                    rows="4"
                    value={personalDetails.summary}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, summary: e.target.value })}
                    placeholder="Brief professional profile summary..."
                    className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Tab Body: Experience List */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl space-y-4 border border-slate-900 relative">
                    <button 
                      onClick={() => removeExperience(index)}
                      className="absolute top-5 right-5 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Work Experience #{index + 1}</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Company name</label>
                        <input 
                          type="text" 
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="e.g. Microsoft"
                          className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Job Role / Title</label>
                        <input 
                          type="text" 
                          value={exp.role}
                          onChange={(e) => updateExperience(index, 'role', e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Start Date</label>
                        <input 
                          type="text" 
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          placeholder="e.g. June 2021"
                          className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">End Date</label>
                        <input 
                          type="text" 
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          placeholder="e.g. Present"
                          className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Description & Achievements</label>
                        <button 
                          onClick={() => handleEnhanceText(
                            exp.description, 
                            `Experience achievements description for role of ${exp.role} at ${exp.company}`, 
                            (enhanced) => updateExperience(index, 'description', enhanced),
                            `exp-${index}`
                          )}
                          className="text-[10px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 transition"
                        >
                          {enhancingField === `exp-${index}` ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          <span>AI Enhance description</span>
                        </button>
                      </div>
                      <textarea 
                        rows="4"
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Detail key metrics, actions, tools used..."
                        className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition resize-none"
                      />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addExperience}
                  className="w-full py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-dashed border-white/[0.1] hover:border-brand-500/30 text-slate-400 hover:text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add Experience Block
                </button>
              </div>
            )}

            {/* Tab Body: Education List */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                {education.map((edu, index) => (
                  <div key={index} className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl space-y-4 border border-slate-900 relative">
                    <button 
                      onClick={() => removeEducation(index)}
                      className="absolute top-5 right-5 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Education #{index + 1}</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Institution / School</label>
                        <input 
                          type="text" 
                          value={edu.school}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          placeholder="e.g. Stanford University"
                          className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Degree / Program</label>
                        <input 
                          type="text" 
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="e.g. B.S. Computer Science"
                          className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Start Date</label>
                        <input 
                          type="text" 
                          value={edu.startDate}
                          onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                          placeholder="e.g. 2017"
                          className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">End Date</label>
                        <input 
                          type="text" 
                          value={edu.endDate}
                          onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                          placeholder="e.g. 2021"
                          className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Details (Optional)</label>
                      <textarea 
                        rows="3"
                        value={edu.description}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        placeholder="e.g. GPA: 3.9, Relevant coursework..."
                        className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition resize-none"
                      />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addEducation}
                  className="w-full py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-dashed border-white/[0.1] hover:border-brand-500/30 text-slate-400 hover:text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add Education Block
                </button>
              </div>
            )}

            {/* Tab Body: Projects, Skills & Certifications */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                
                {/* Skills tagging input */}
                <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl space-y-4 border border-slate-900">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills Matrix</h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Technical Skills (Comma separated)</label>
                    <textarea 
                      rows="2"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="React, Java, Spring Boot, MongoDB, Docker..."
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition resize-none"
                    />
                  </div>
                </div>

                {/* Projects List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Projects</h4>
                  {projects.map((proj, index) => (
                    <div key={index} className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl space-y-4 border border-slate-900 relative">
                      <button 
                        onClick={() => removeProject(index)}
                        className="absolute top-5 right-5 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Project Name</label>
                          <input 
                            type="text" 
                            value={proj.name}
                            onChange={(e) => updateProject(index, 'name', e.target.value)}
                            placeholder="e.g. AI Resume Builder"
                            className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Technologies used</label>
                          <input 
                            type="text" 
                            value={proj.technologies}
                            onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                            placeholder="e.g. React, Spring Boot, MongoDB"
                            className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Description</label>
                          <button 
                            onClick={() => handleEnhanceText(
                              proj.description, 
                              `Project description for ${proj.name} using ${proj.technologies}`, 
                              (enhanced) => updateProject(index, 'description', enhanced),
                              `proj-${index}`
                            )}
                            className="text-[10px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 transition"
                          >
                            {enhancingField === `proj-${index}` ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                            <span>AI Enhance project</span>
                          </button>
                        </div>
                        <textarea 
                          rows="3"
                          value={proj.description}
                          onChange={(e) => updateProject(index, 'description', e.target.value)}
                          placeholder="Detail scope, architecture and outcomes..."
                          className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition resize-none"
                        />
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addProject}
                    className="w-full py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-dashed border-white/[0.1] hover:border-brand-500/30 text-slate-400 hover:text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Add Project Block
                  </button>
                </div>

                {/* Certifications tagging input */}
                <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl space-y-4 border border-slate-900">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certifications</h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Credentials (Comma separated)</label>
                    <textarea 
                      rows="2"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      placeholder="AWS Certified Solutions Architect, Oracle Java SE Developer..."
                      className="w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition resize-none"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Tab Body: Version History List */}
            {activeTab === 'history' && (
              <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-3xl border border-slate-900 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Saved Resumes History</h3>
                
                {savedResumes && savedResumes.length > 0 ? (
                  <div className="space-y-3">
                    {savedResumes.map((res) => (
                      <div 
                        key={res.id} 
                        onClick={() => handleLoadResume(res)}
                        className={`p-4 bg-slate-900/40 border rounded-2xl flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all ${
                          resumeId === res.id ? 'border-brand-500/40' : 'border-slate-850'
                        }`}
                      >
                        <div className="space-y-1 text-left">
                          <h4 className="text-xs font-bold text-white">{res.title}</h4>
                          <div className="flex gap-2 text-[9px] text-slate-500 font-semibold">
                            <span>v{res.version}</span>
                            <span>•</span>
                            <span>{new Date(res.updatedAt || res.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                            title="Load resume details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteResume(res.id, e)}
                            className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition"
                            title="Delete resume version"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No saved resume versions found. Complete details and click Save Resume.
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT SIDE PANEL (Live Printable A4 Template Preview, lg:col-span-6) */}
          <div className="lg:col-span-6 print:w-full print:block">
            
            {/* Live Preview Wrapper */}
            <div className="sticky top-6 print:relative print:top-0">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 print:hidden">Live A4 Preview</span>
              
              {/* Simulated Paper A4 Sheet */}
              <div 
                id="resume-printable-area"
                className={`w-full min-h-[820px] bg-white text-black p-8 md:p-10 shadow-2xl rounded-2xl relative overflow-hidden flex flex-col justify-between print:shadow-none print:rounded-none print:p-0 ${
                  templateStyle === 'tech' ? 'font-mono' : 'font-sans'
                }`}
              >
                
                {/* Style 1: Modern Theme (Default) */}
                {templateStyle === 'modern' && (
                  <div className="space-y-6 text-left flex-grow">
                    
                    {/* Header */}
                    <div className="border-b-2 border-emerald-500 pb-4 flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-none">{personalDetails.fullName || 'Candidate Name'}</h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-1.5 block">{personalDetails.location || 'Location'}</span>
                      </div>
                      <div className="text-right text-[9px] text-slate-500 space-y-0.5">
                        <div className="font-semibold text-slate-800">{personalDetails.email || 'email@example.com'}</div>
                        <div>{personalDetails.phone || 'Phone'}</div>
                        <div className="text-[8px]">{personalDetails.linkedin || personalDetails.portfolio}</div>
                      </div>
                    </div>

                    {/* Summary */}
                    {personalDetails.summary && (
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider border-l-2 border-emerald-500 pl-2">Professional Summary</h3>
                        <p className="text-[10px] leading-relaxed text-slate-650 font-normal">{personalDetails.summary}</p>
                      </div>
                    )}

                    {/* Work Experience */}
                    {experience && experience.some(e => e.company || e.role) && (
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider border-l-2 border-emerald-500 pl-2">Work Experience</h3>
                        
                        <div className="space-y-3">
                          {experience.map((exp, idx) => (
                            (exp.company || exp.role) && (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-900">
                                  <span>{exp.role} — <span className="text-emerald-600">{exp.company}</span></span>
                                  <span className="text-[9px] font-semibold text-slate-500">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <p className="text-[9px] leading-relaxed text-slate-600 whitespace-pre-line">{exp.description}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {education && education.some(e => e.school || e.degree) && (
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider border-l-2 border-emerald-500 pl-2">Education</h3>
                        
                        <div className="space-y-2">
                          {education.map((edu, idx) => (
                            (edu.school || edu.degree) && (
                              <div key={idx} className="space-y-0.5">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-900">
                                  <span>{edu.degree} — <span className="text-slate-700 font-semibold">{edu.school}</span></span>
                                  <span className="text-[9px] font-semibold text-slate-500">{edu.startDate} - {edu.endDate}</span>
                                </div>
                                <p className="text-[9px] text-slate-600">{edu.description}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {projects && projects.some(p => p.name || p.technologies) && (
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider border-l-2 border-emerald-500 pl-2">Projects</h3>
                        
                        <div className="space-y-2.5">
                          {projects.map((proj, idx) => (
                            (proj.name || proj.description) && (
                              <div key={idx} className="space-y-0.5">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-900">
                                  <span>{proj.name}</span>
                                  <span className="text-[8px] font-mono text-emerald-600">{proj.technologies}</span>
                                </div>
                                <p className="text-[9px] leading-relaxed text-slate-600">{proj.description}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills Grid */}
                    {skills && (
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider border-l-2 border-emerald-500 pl-2">Core Competencies</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {skills.split(',').map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 text-[8px] font-bold rounded">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {certifications && (
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider border-l-2 border-emerald-500 pl-2">Certifications</h3>
                        <p className="text-[9px] leading-relaxed text-slate-600">{certifications}</p>
                      </div>
                    )}

                  </div>
                )}

                {/* Style 2: Minimalist Classic */}
                {templateStyle === 'minimalist' && (
                  <div className="space-y-6 text-left flex-grow">
                    
                    {/* Header */}
                    <div className="text-center space-y-1 pb-4 border-b border-slate-200">
                      <h2 className="text-3xl font-normal tracking-tight text-slate-900 leading-none">{personalDetails.fullName || 'Candidate Name'}</h2>
                      <div className="flex justify-center gap-3 text-[9px] text-slate-500">
                        <span>{personalDetails.email || 'email@example.com'}</span>
                        <span>•</span>
                        <span>{personalDetails.phone || 'Phone'}</span>
                        <span>•</span>
                        <span>{personalDetails.location || 'Location'}</span>
                      </div>
                      <div className="text-[8px] text-slate-400">{personalDetails.linkedin} • {personalDetails.portfolio}</div>
                    </div>

                    {/* Summary */}
                    {personalDetails.summary && (
                      <div className="space-y-1">
                        <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-widest text-center">Summary</h3>
                        <p className="text-[9.5px] leading-relaxed text-slate-650 text-center px-4 font-light">{personalDetails.summary}</p>
                      </div>
                    )}

                    {/* Work Experience */}
                    {experience && experience.some(e => e.company || e.role) && (
                      <div className="space-y-2">
                        <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">Experience</h3>
                        
                        <div className="space-y-3">
                          {experience.map((exp, idx) => (
                            (exp.company || exp.role) && (
                              <div key={idx} className="space-y-0.5">
                                <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-900">
                                  <span>{exp.role} <span className="font-normal text-slate-500">|</span> {exp.company}</span>
                                  <span className="text-[8.5px] font-normal text-slate-500">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <p className="text-[9px] leading-relaxed text-slate-650">{exp.description}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {education && education.some(e => e.school || e.degree) && (
                      <div className="space-y-2">
                        <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">Education</h3>
                        
                        <div className="space-y-2">
                          {education.map((edu, idx) => (
                            (edu.school || edu.degree) && (
                              <div key={idx} className="space-y-0.5">
                                <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-900">
                                  <span>{edu.degree} <span className="font-normal text-slate-500">|</span> {edu.school}</span>
                                  <span className="text-[8.5px] font-normal text-slate-500">{edu.startDate} - {edu.endDate}</span>
                                </div>
                                <p className="text-[9px] text-slate-650">{edu.description}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {projects && projects.some(p => p.name || p.technologies) && (
                      <div className="space-y-2">
                        <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">Projects</h3>
                        
                        <div className="space-y-2.5">
                          {projects.map((proj, idx) => (
                            (proj.name || proj.description) && (
                              <div key={idx} className="space-y-0.5">
                                <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-900">
                                  <span>{proj.name}</span>
                                  <span className="text-[8.5px] font-normal text-slate-500">{proj.technologies}</span>
                                </div>
                                <p className="text-[9px] leading-relaxed text-slate-650">{proj.description}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills Grid */}
                    {skills && (
                      <div className="space-y-1.5">
                        <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">Skills</h3>
                        <p className="text-[9px] leading-relaxed text-slate-650 mt-1">{skills}</p>
                      </div>
                    )}

                    {/* Certifications */}
                    {certifications && (
                      <div className="space-y-1.5">
                        <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">Certifications</h3>
                        <p className="text-[9px] leading-relaxed text-slate-650">{certifications}</p>
                      </div>
                    )}

                  </div>
                )}

                {/* Style 3: Tech Monospace style */}
                {templateStyle === 'tech' && (
                  <div className="space-y-6 text-left flex-grow">
                    
                    {/* Header */}
                    <div className="border border-slate-800 p-4 rounded-xl space-y-1">
                      <h2 className="text-xl font-bold text-slate-900">[ {personalDetails.fullName || 'Candidate Name'} ]</h2>
                      <div className="text-[9px] text-slate-600 space-y-0.5">
                        <div>$ contact --email: "{personalDetails.email || 'email@example.com'}"</div>
                        <div>$ contact --phone: "{personalDetails.phone || 'Phone'}" --location: "{personalDetails.location || 'Location'}"</div>
                        <div className="text-[8px] text-slate-500">$ profiles --linkedin: "{personalDetails.linkedin}" --portfolio: "{personalDetails.portfolio}"</div>
                      </div>
                    </div>

                    {/* Summary */}
                    {personalDetails.summary && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">&gt; ABOUT_ME</div>
                        <p className="text-[9.5px] leading-relaxed text-slate-600 font-light">{personalDetails.summary}</p>
                      </div>
                    )}

                    {/* Work Experience */}
                    {experience && experience.some(e => e.company || e.role) && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">&gt; EXPERIENCE_HISTORY</div>
                        
                        <div className="space-y-3">
                          {experience.map((exp, idx) => (
                            (exp.company || exp.role) && (
                              <div key={idx} className="border-l border-emerald-500 pl-3.5 space-y-1">
                                <div className="text-[9.5px] font-bold text-slate-900">
                                  <span>* {exp.role} @ {exp.company}</span>
                                  <span className="text-[8.5px] font-normal text-slate-500 block">Duration: {exp.startDate} - {exp.endDate}</span>
                                </div>
                                <p className="text-[9px] leading-relaxed text-slate-600">{exp.description}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {education && education.some(e => e.school || e.degree) && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">&gt; ACADEMICS</div>
                        
                        <div className="space-y-2">
                          {education.map((edu, idx) => (
                            (edu.school || edu.degree) && (
                              <div key={idx} className="border-l border-slate-300 pl-3.5 space-y-0.5">
                                <div className="text-[9.5px] font-bold text-slate-900">
                                  <span>* {edu.degree} @ {edu.school}</span>
                                  <span className="text-[8.5px] font-normal text-slate-500 block">Class: {edu.startDate} - {edu.endDate}</span>
                                </div>
                                <p className="text-[9px] text-slate-600">{edu.description}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {projects && projects.some(p => p.name || p.technologies) && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">&gt; PERSONAL_PROJECTS</div>
                        
                        <div className="space-y-2.5">
                          {projects.map((proj, idx) => (
                            (proj.name || proj.description) && (
                              <div key={idx} className="border-l border-slate-300 pl-3.5 space-y-0.5">
                                <div className="text-[9.5px] font-bold text-slate-900 flex justify-between">
                                  <span>* {proj.name}</span>
                                  <span className="text-[8px] text-emerald-600 font-mono">[{proj.technologies}]</span>
                                </div>
                                <p className="text-[9px] leading-relaxed text-slate-600">{proj.description}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills Grid */}
                    {skills && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">&gt; TECH_STACK_MODULES</div>
                        <p className="text-[9px] leading-relaxed text-slate-600 mt-1">{skills}</p>
                      </div>
                    )}

                    {/* Certifications */}
                    {certifications && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">&gt; CERTIFICATIONS_MANIFEST</div>
                        <p className="text-[9px] leading-relaxed text-slate-650">{certifications}</p>
                      </div>
                    )}

                  </div>
                )}

                {/* Footer Brand Marker (Hidden in print) */}
                <div className="border-t border-slate-100 pt-3 text-center text-[7px] text-slate-400 font-medium uppercase tracking-widest flex items-center justify-center gap-1.5 print:hidden">
                  <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />
                  <span>AI Resume Builder Engine</span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
      
      {/* Global CSS Inject to customize printing styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #resume-printable-area, #resume-printable-area * {
            visibility: visible;
          }
          #resume-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            min-height: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
