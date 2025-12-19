
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { AnalysisResult, Language } from '../types';
import { DICTIONARIES } from '../constants';

interface Props {
  result: AnalysisResult;
  lang: Language;
  image: string;
  onReset: () => void;
}

const GRADE_LABELS = ["D", "C", "B", "A", "S", "SS", "SSS"];

export const ResultView: React.FC<Props> = ({ result, lang, image, onReset }) => {
  const dict = DICTIONARIES[lang];
  const grade = GRADE_LABELS[result.rating - 1] || "D";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-1000">
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
        
        {/* Left Column: Image & Radar */}
        <div className="space-y-6 flex flex-col">
          {/* Image */}
          <div className="bg-black border border-zinc-800 rounded-2xl p-1 shadow-2xl overflow-hidden relative group">
            <div className="aspect-[3/4] w-full relative">
               <img 
                 src={image} 
                 alt="Asset for analysis" 
                 className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
               />
               <div className="absolute inset-0 border-[20px] border-black/10 pointer-events-none"></div>
               <div className="absolute top-4 left-4 font-mono text-[8px] text-cyan-500/50 uppercase tracking-widest bg-black/40 px-2 py-1 backdrop-blur-sm">
                 Visual_Input_Capture // Processing...
               </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden h-[380px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]"></div>
            <h3 className="text-xs font-orbitron text-zinc-500 mb-2 uppercase tracking-[0.3em] border-b border-zinc-900 pb-2">
              Dimensional_Analysis_Report
            </h3>
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart data={result.dimensions}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#555', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <Radar
                    name="Intensity"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    animationBegin={500}
                    animationDuration={1500}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Rating & Detailed Comment */}
        <div className="space-y-8 h-full">
          {/* Grade Display */}
          <div className="bg-zinc-950/90 border border-zinc-900 rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-500/10 blur-[80px] group-hover:bg-cyan-500/10 transition-colors duration-1000"></div>
            
            <div className="flex items-end justify-between border-b border-zinc-800 pb-6 mb-8">
               <div className="space-y-1">
                 <p className="font-orbitron text-[10px] text-zinc-500 tracking-[0.4em] uppercase">Asset_Classification</p>
                 <h2 className="text-4xl md:text-5xl font-orbitron font-black text-white italic tracking-tighter">
                   {result.summaryPhrase}
                 </h2>
               </div>
               <div className="relative">
                  <div className="text-8xl md:text-9xl font-orbitron font-black text-transparent stroke-white/10 [webkit-text-stroke:2px_rgba(255,255,255,0.05)] select-none">
                    {grade}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-6xl md:text-7xl font-orbitron font-black italic ${grade.includes('S') ? 'text-fuchsia-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'text-cyan-500'} animate-pulse`}>
                      {grade}
                    </div>
                  </div>
               </div>
            </div>

            {/* Comment Section */}
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                 <div className="h-px flex-1 bg-zinc-800"></div>
                 <span className="font-orbitron text-[9px] text-zinc-600 tracking-widest">PROCESSING_LOG</span>
                 <div className="h-px flex-1 bg-zinc-800"></div>
               </div>
               
               <div className="relative">
                 <p className="text-zinc-200 font-serif text-xl leading-relaxed italic selection:bg-fuchsia-500/40 relative z-10">
                   {result.comment}
                 </p>
                 <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-zinc-800 to-transparent"></div>
               </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row gap-4">
              <button 
                onClick={onReset}
                className="flex-1 py-4 bg-zinc-900 border border-zinc-800 text-zinc-500 font-orbitron text-xs tracking-widest hover:text-white hover:border-cyan-500 transition-all duration-300 rounded-lg group"
              >
                INITIALIZE_NEW_SEQUENCE <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
              </button>
              <div className="px-4 py-4 border border-zinc-900 rounded-lg flex items-center justify-center">
                 <span className="text-[10px] font-mono text-zinc-700">STATUS: RE-ENCAPSULATED</span>
              </div>
            </div>
          </div>

          {/* Footer Metadata in Result */}
          <div className="grid grid-cols-3 gap-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="bg-black/40 border border-zinc-900 p-3 rounded-lg flex flex-col gap-1">
                 <div className="h-1 w-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-cyan-900 animate-[loading_2s_infinite]" style={{ width: `${Math.random() * 100}%` }}></div>
                 </div>
                 <span className="text-[8px] font-mono text-zinc-600">AUX_DATA_0{i}</span>
               </div>
             ))}
          </div>
        </div>

      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
