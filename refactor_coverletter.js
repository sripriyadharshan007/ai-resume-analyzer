const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/coverletter/CoverLetterGenerator.jsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('GlassCard')) {
  content = content.replace(
    "import { useAuth } from '../../context/AuthContext';",
    "import { useAuth } from '../../context/AuthContext';\nimport GlassCard from '../../components/ui/GlassCard';\nimport MagneticButton from '../../components/ui/MagneticButton';\nimport { motion } from 'framer-motion';"
  );
}

// 2. Fix root wrapper
content = content.replace(
  'className="min-h-screen bg-slate-950 bg-dot-grid text-slate-100 flex flex-col items-center px-4 py-8 relative selection:bg-brand-500 selection:text-white print:p-0 print:bg-white print:text-black"',
  'className="min-h-full flex flex-col items-center px-4 md:px-8 py-8 relative selection:bg-brand-500 selection:text-white print:p-0 print:bg-white print:text-black"'
);

// 3. Replace glow-card with GlassCard class styles (changing div to div with new classes)
content = content.replace(/className="glow-card ([^"]+)"/g, 'className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl $1"');

// 4. Input styles
content = content.replace(/w-full bg-slate-900 border border-slate-850 focus:border-brand-500/g, 'w-full bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] focus:border-brand-500 shadow-inner');

// Top bar inputs
content = content.replace(/bg-slate-900 border border-slate-800 focus:border-brand-500 text-xs font-semibold text-white px-3 py-2.5/g, 'bg-white/[0.02] border border-white/[0.05] focus:border-brand-500 text-xs font-semibold text-white px-3 py-2.5 shadow-inner');
content = content.replace(/px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:text-white/g, 'px-4 py-2.5 bg-white/[0.02] border border-white/[0.05] text-slate-300 hover:text-white hover:bg-white/[0.05] shadow-inner');

content = content.replace(/className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-brand-500\/20 hover:scale-\[1.01\]/g, 'className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.01]');
content = content.replace(/className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-500\/20 hover:scale-\[1.02\]/g, 'className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02]');

// 5. Card interiors & borders
content = content.replace(/border-slate-900/g, 'border-white/[0.05]');
content = content.replace(/border border-slate-900/g, 'border border-white/[0.05]');
content = content.replace(/bg-slate-900\/35/g, 'bg-white/[0.02]');
content = content.replace(/border border-slate-850/g, 'border border-white/[0.05]');
content = content.replace(/hover:border-slate-700/g, 'hover:border-white/[0.15]');
content = content.replace(/border-slate-850/g, 'border-white/[0.05]');
content = content.replace(/bg-slate-900/g, 'bg-white/[0.03]'); // for generic bg-slate-900 like editor mode toggler

// 7. Typography (optional small tweaks to make it bolder or larger where appropriate)
content = content.replace(/text-xs font-bold text-white uppercase tracking-wider/g, 'text-xs font-heading font-black text-white uppercase tracking-widest');

// Replace glow-card in editor wrapper since it's hardcoded there maybe
content = content.replace(/className="w-full h-full p-8 md:p-12 bg-slate-950/g, 'className="w-full h-full p-8 md:p-12 bg-[#030509]');


fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactored CoverLetterGenerator.jsx successfully.');
