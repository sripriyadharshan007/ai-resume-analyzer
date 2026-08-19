import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Logo from './components/ui/Logo';
import SmoothScroll from './components/ui/SmoothScroll';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UploadResume from './pages/upload/UploadResume';
import Dashboard from './pages/dashboard/Dashboard';
import AnalysisReport from './pages/report/AnalysisReport';
import InterviewPrep from './pages/interview/InterviewPrep';
import DashboardLayout from './layouts/DashboardLayout';
import CoursesView from './pages/courses/CoursesView';
import ResumeBuilder from './pages/builder/ResumeBuilder';
import GithubAnalyzer from './pages/github/GithubAnalyzer';
import CoverLetterGenerator from './pages/coverletter/CoverLetterGenerator';
import JobMatcher from './pages/match/JobMatcher';
import TrainingData from './pages/training/TrainingData';

function PagePlaceholder({ title }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#030509] flex flex-col justify-center items-center px-6">
      <div className="bg-white/[0.02] border border-white/[0.05] p-10 max-w-md w-full rounded-[32px] text-center flex flex-col items-center">
        <Logo size="lg" hideText={true} className="mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
        <p className="text-slate-400 text-[14px] mb-8 leading-relaxed">
          This module is under construction for the next release phase.
        </p>
        <Link to="/" className="h-12 w-full flex items-center justify-center rounded-xl bg-white text-[#030509] font-bold text-[14px] hover:bg-slate-200 transition-colors mb-3">Return Home</Link>
        <button onClick={logout} className="h-12 w-full flex items-center justify-center rounded-xl bg-white/[0.05] text-white font-bold text-[14px] hover:bg-white/[0.1] transition-colors">Log Out</button>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#030509] flex justify-center items-center"><div className="h-10 w-10 border-4 border-brand-600/30 border-t-brand-600 rounded-full animate-spin"></div></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#030509] flex justify-center items-center"><div className="h-10 w-10 border-4 border-brand-600/30 border-t-brand-600 rounded-full animate-spin"></div></div>;
  return !user ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <AuthProvider>
      <SmoothScroll>
        <div className="relative min-h-screen bg-[#030509]">
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><DashboardLayout><Dashboard /></DashboardLayout></PrivateRoute>} />
              <Route path="/upload" element={<PrivateRoute><DashboardLayout><UploadResume /></DashboardLayout></PrivateRoute>} />
              <Route path="/report/:id" element={<PrivateRoute><DashboardLayout><AnalysisReport /></DashboardLayout></PrivateRoute>} />
              <Route path="/courses/:id" element={<PrivateRoute><DashboardLayout><CoursesView /></DashboardLayout></PrivateRoute>} />
              <Route path="/builder" element={<PrivateRoute><DashboardLayout><ResumeBuilder /></DashboardLayout></PrivateRoute>} />
              <Route path="/github" element={<PrivateRoute><DashboardLayout><GithubAnalyzer /></DashboardLayout></PrivateRoute>} />
              <Route path="/cover-letter" element={<PrivateRoute><DashboardLayout><CoverLetterGenerator /></DashboardLayout></PrivateRoute>} />
              <Route path="/job-match" element={<PrivateRoute><DashboardLayout><JobMatcher /></DashboardLayout></PrivateRoute>} />
              <Route path="/training" element={<PrivateRoute><DashboardLayout><TrainingData /></DashboardLayout></PrivateRoute>} />
              <Route path="/interview/:id" element={<PrivateRoute><InterviewPrep /></PrivateRoute>} />
            </Routes>
          </Router>
        </div>
      </SmoothScroll>
    </AuthProvider>
  );
}
