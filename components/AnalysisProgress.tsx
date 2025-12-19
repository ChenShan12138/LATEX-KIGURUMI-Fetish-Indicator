
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { DICTIONARIES } from '../constants';

interface Props {
  lang: Language;
}

export const AnalysisProgress: React.FC<Props> = ({ lang }) => {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const dict = DICTIONARIES[lang];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => (p < 100 ? p + 1 : 100));
    }, 50);

    const stageTimer = setInterval(() => {
      setStageIndex(i => (i + 1) % dict.sinkingStages.length);
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(stageTimer);
    };
  }, [dict]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-1000">
      <div className="relative w-64 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-fuchsia-600 to-cyan-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        >
          {/* Zipper Animation Mockup */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-6 bg-zinc-300 rounded-sm border-2 border-zinc-800 flex items-center justify-center">
             <div className="w-1 h-3 bg-zinc-800 rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-orbitron tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-pulse">
          {dict.analyzing}
        </h3>
        <p className="text-zinc-500 italic font-serif text-lg">
          {dict.sinkingStages[stageIndex]}
        </p>
      </div>

      {/* Sinking Overlay Animation */}
      <div className="fixed inset-0 bg-black pointer-events-none transition-opacity duration-1000" style={{ opacity: progress / 200 }}></div>
    </div>
  );
};
