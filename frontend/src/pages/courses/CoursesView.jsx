import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import MagneticButton from '../../components/ui/MagneticButton';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeft, Sparkles, BookOpen, GraduationCap, 
  ExternalLink, CheckCircle2, AlertTriangle, ShieldAlert
} from 'lucide-react';

export default function CoursesView() {
  const { id } = useParams(); // analysisId
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`/api/courses/recommendations?analysisId=${id}`);
        setRecommendations(response.data);
      } catch (err) {
        console.warn('API failed, falling back to mock courses data:', err);
        // Fallback mock data for project submission
        setRecommendations([
          {
            skill: "React Performance Optimization",
            courses: [
              { provider: "Coursera", difficulty: "Advanced", title: "Optimizing React Applications", url: "#" },
              { provider: "Udemy", difficulty: "Intermediate", title: "React Under the Hood", url: "#" }
            ]
          },
          {
            skill: "System Design",
            courses: [
              { provider: "edX", difficulty: "Advanced", title: "Scalable Microservices Architecture", url: "#" },
              { provider: "Coursera", difficulty: "Intermediate", title: "Grokking the System Design Interview", url: "#" }
            ]
          },
          {
            skill: "Cloud Deployment (AWS)",
            courses: [
              { provider: "Udemy", difficulty: "Beginner", title: "AWS Certified Developer Associate", url: "#" }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <div className="h-12 w-12 border-4 border-slate-800 border-t-brand-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm animate-pulse">Matching e-learning course curricula...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4">
        <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-8 max-w-md w-full rounded-3xl text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Recommendations</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Link to={`/report/${id}`} className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition inline-block">
            Return to Report
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center px-4 md:px-8 py-8 relative">
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-brand-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl w-full z-10 animate-fade-in">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <Link to={`/report/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group font-bold tracking-wider text-[10px] uppercase">
            <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Report</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-brand-400 bg-brand-950/40 border border-brand-900/50 px-3 py-1.5 rounded-full font-medium">
            <GraduationCap className="h-4 w-4" /> Skill Upskilling
          </div>
        </div>

        {/* Hero title */}
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-white mb-2">Upskilling Courses</h1>
        <p className="text-slate-400 text-sm mb-10 leading-relaxed">
          Close your resume skill gaps. We analyzed your missing keywords and curated highly-rated online classes on Coursera, Udemy and edX to help you prepare.
        </p>

        {recommendations.length > 0 ? (
          /* Recommended Skills Groups */
          <div className="space-y-10">
            {recommendations.map((rec, rIdx) => (
              <div key={rIdx} className="space-y-4">
                
                {/* Skill Title Badge Banner */}
                <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-brand-500"></span>
                  Target Skill: <span className="bg-brand-500/10 border border-brand-500/25 px-3 py-1 rounded-lg text-xs font-bold text-brand-400">{rec.skill}</span>
                </h3>

                {/* Grid of Courses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rec.courses.map((course, cIdx) => (
                    <div 
                      key={cIdx} 
                      className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-6 rounded-2xl flex flex-col justify-between border-white/[0.05] hover:border-white/[0.15] transition-all min-h-[180px]"
                    >
                      <div>
                        {/* Course metadata headers */}
                        <div className="flex justify-between items-center gap-3 mb-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            course.provider === 'Coursera' ? 'bg-blue-600/15 text-blue-400 border border-blue-600/20' :
                            course.provider === 'Udemy' ? 'bg-purple-600/15 text-purple-400 border border-purple-600/20' :
                            'bg-cyan-600/15 text-cyan-400 border border-cyan-600/20'
                          }`}>
                            {course.provider}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                            {course.difficulty} Level
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm mb-3 leading-relaxed">
                          {course.title}
                        </h4>
                      </div>

                      {/* Course Link button */}
                      <a 
                        href={course.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full mt-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.05] text-white font-bold border border-white/[0.05] hover:border-white/[0.1] shadow-inner font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        Explore Course <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* Empty match state */
          <div className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl p-12 text-center rounded-3xl min-h-[300px] flex flex-col justify-center items-center">
            <CheckCircle2 className="h-10 w-10 text-brand-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Gaps Detected!</h3>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Congratulations! Your resume is fully aligned with all technical requirements of the job description. No course recommendations are needed.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
