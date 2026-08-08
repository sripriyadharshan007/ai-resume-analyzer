const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/interview/InterviewPrep.jsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('GlassCard')) {
  content = content.replace(
    "import { useParams, Link, useNavigate } from 'react-router-dom';",
    "import { useParams, Link, useNavigate } from 'react-router-dom';\nimport GlassCard from '../../components/ui/GlassCard';\nimport MagneticButton from '../../components/ui/MagneticButton';\nimport { motion } from 'framer-motion';"
  );
}

// 2. Fix root wrapper
content = content.replace(
  /className="min-h-screen bg-slate-950 flex flex-col justify-center items-center/g,
  'className="min-h-full flex flex-col justify-center items-center py-20'
);
content = content.replace(
  /className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8 relative"/g,
  'className="min-h-full flex flex-col items-center px-4 md:px-8 py-8 relative"'
);

// Loading spinner adjustments
content = content.replace(
  /<div className="h-12 w-12 border-4 border-slate-800 border-t-brand-500 rounded-full animate-spin mb-4"><\/div>/g,
  '<div className="h-16 w-16 border-4 border-white/5 border-t-brand-500 rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-6"></div>'
);
content = content.replace(
  /<p className="text-slate-400 text-sm animate-pulse">/g,
  '<p className="text-brand-300 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">'
);


// 3. Replace glow-card with GlassCard class styles
content = content.replace(/className="glow-card ([^"]+)"/g, 'className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl $1"');

// 4. Update inner styles
content = content.replace(/border-slate-900/g, 'border-white/[0.05]');
content = content.replace(/border border-slate-900/g, 'border border-white/[0.05]');
content = content.replace(/border-slate-850/g, 'border-white/[0.05]');
content = content.replace(/border border-slate-850/g, 'border border-white/[0.05]');
content = content.replace(/hover:border-slate-800/g, 'hover:border-white/[0.15]');
content = content.replace(/hover:border-slate-700/g, 'hover:border-white/[0.15]');
content = content.replace(/bg-slate-900\/50/g, 'bg-white/[0.02]');
content = content.replace(/bg-slate-900/g, 'bg-white/[0.03]');
content = content.replace(/bg-slate-950\/70/g, 'bg-white/[0.02]');
content = content.replace(/bg-slate-950\/45/g, 'bg-white/[0.02]');

content = content.replace(/bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600\/50 text-white font-bold rounded-2xl shadow-xl shadow-brand-500\/20 transition-all flex items-center justify-center gap-2 hover:scale-\[1.01\]/g, 'bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.01]');
content = content.replace(/bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-2xl border border-slate-800 hover:border-slate-700/g, 'bg-white/[0.02] hover:bg-white/[0.04] text-white font-bold rounded-2xl border border-white/[0.05] hover:border-white/[0.1]');


fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactored InterviewPrep.jsx successfully.');
