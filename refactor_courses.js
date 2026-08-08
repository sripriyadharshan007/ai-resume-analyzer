const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/courses/CoursesView.jsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('GlassCard')) {
  content = content.replace(
    "import { useParams, Link } from 'react-router-dom';",
    "import { useParams, Link } from 'react-router-dom';\nimport GlassCard from '../../components/ui/GlassCard';\nimport MagneticButton from '../../components/ui/MagneticButton';\nimport { motion } from 'framer-motion';"
  );
}

// 2. Fix root wrapper
content = content.replace(
  'className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8 relative"',
  'className="min-h-full flex flex-col items-center px-4 md:px-8 py-8 relative"'
);

// 3. Replace glow-card with GlassCard class styles
content = content.replace(/className="glow-card ([^"]+)"/g, 'className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl $1"');

// 4. Update inner styles
content = content.replace(/border-slate-900/g, 'border-white/[0.05]');
content = content.replace(/hover:border-slate-800/g, 'hover:border-white/[0.15]');

content = content.replace(/bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700/g, 'bg-white/[0.02] hover:bg-white/[0.05] text-white font-bold border border-white/[0.05] hover:border-white/[0.1] shadow-inner');

content = content.replace(/text-slate-400 hover:text-white transition group/g, 'text-slate-400 hover:text-white transition-colors group font-bold tracking-wider text-[10px] uppercase');

content = content.replace(/text-3xl md:text-4xl font-extrabold tracking-tight/g, 'text-4xl md:text-5xl font-heading font-black tracking-tight text-white');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactored CoursesView.jsx successfully.');
