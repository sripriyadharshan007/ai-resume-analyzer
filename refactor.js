const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/builder/ResumeBuilder.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add GlassCard and MagneticButton imports if missing
if (!content.includes('GlassCard')) {
  content = content.replace(
    "import { useAuth } from '../../context/AuthContext';",
    "import { useAuth } from '../../context/AuthContext';\nimport GlassCard from '../../components/ui/GlassCard';\nimport MagneticButton from '../../components/ui/MagneticButton';\nimport { motion } from 'framer-motion';"
  );
}

// 2. Fix root wrapper
content = content.replace(
  'className="min-h-screen bg-slate-950 bg-dot-grid text-slate-100 flex flex-col items-center px-4 py-8 relative selection:bg-brand-500 selection:text-white print:p-0 print:bg-white print:text-black"',
  'className="min-h-full flex flex-col items-center px-2 md:px-6 py-8 relative selection:bg-brand-500 selection:text-white print:p-0 print:bg-white print:text-black"'
);

// 3. Replace glow-card with GlassCard
// We have many <div className="glow-card... and they all have an end tag </div>. We should replace them carefully or just change the className.
// Since replacing div to GlassCard requires matching the closing div, it's easier to just change the classes in the div.
content = content.replace(/className="glow-card ([^"]+)"/g, 'className="bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl $1"');

// 4. Replace input styles
content = content.replace(/bg-slate-900 border border-slate-850/g, 'bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-inner');
content = content.replace(/bg-slate-900\/50 hover:bg-slate-900 border border-dashed border-slate-800 hover:border-slate-700/g, 'bg-white/[0.02] hover:bg-white/[0.04] border border-dashed border-white/[0.1] hover:border-brand-500/30');

// 5. General colors
content = content.replace(/bg-slate-900\/40 border border-slate-900/g, 'bg-white/[0.02] border border-white/[0.05]');
content = content.replace(/border-b border-slate-900/g, 'border-b border-white/[0.05]');

// 6. Buttons
content = content.replace(/bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-500\/20 hover:scale-\[1.02\]/g, 'bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02]');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactored ResumeBuilder.jsx successfully.');
