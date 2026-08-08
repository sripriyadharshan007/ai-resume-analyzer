const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/match/JobMatcher.jsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('GlassCard')) {
  content = content.replace(
    "import { useAuth } from '../../context/AuthContext';",
    "import { useAuth } from '../../context/AuthContext';\nimport GlassCard from '../../components/ui/GlassCard';\nimport MagneticButton from '../../components/ui/MagneticButton';\nimport { motion } from 'framer-motion';"
  );
}

// 2. Fix root wrapper
content = content.replace(
  'className="min-h-screen bg-slate-950 bg-dot-grid text-slate-100 flex flex-col items-center px-4 py-8 relative selection:bg-brand-500 selection:text-white"',
  'className="min-h-full flex flex-col items-center px-4 md:px-8 py-8 relative selection:bg-brand-500 selection:text-white"'
);

// 3. Replace glow-card with GlassCard class styles (changing div to div with new classes)
content = content.replace(/className="glow-card ([^"]+)"/g, 'className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl $1"');

// 4. Input styles
content = content.replace(/w-full bg-slate-900 border border-slate-850 focus:border-brand-500/g, 'w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] focus:border-brand-500 shadow-inner');

content = content.replace(/className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-brand-500\/20 hover:scale-\[1.01\]/g, 'className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.01]');

// 5. Card interiors & borders
content = content.replace(/bg-slate-900\/10/g, 'bg-white/[0.01]');
content = content.replace(/border-slate-900/g, 'border-white/[0.05]');
content = content.replace(/border border-slate-900/g, 'border border-white/[0.05]');
content = content.replace(/bg-slate-900\/35/g, 'bg-white/[0.02]');
content = content.replace(/border border-slate-850/g, 'border border-white/[0.05]');
content = content.replace(/hover:border-slate-700/g, 'hover:border-white/[0.15]');
content = content.replace(/border-slate-850/g, 'border-white/[0.05]');
content = content.replace(/bg-slate-900\/40/g, 'bg-white/[0.02]');
content = content.replace(/hover:border-slate-800/g, 'hover:border-white/[0.1]');

// 7. Typography (optional small tweaks to make it bolder or larger where appropriate)
content = content.replace(/text-xs font-bold text-white uppercase tracking-wider/g, 'text-xs font-heading font-black text-white uppercase tracking-widest');


fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactored JobMatcher.jsx successfully.');
