
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, RadarProps } from 'recharts';
import { AnalysisResult, Language } from '../types';
import { DICTIONARIES } from '../constants';

interface Props {
  result: AnalysisResult;
  lang: Language;
  image: string;
  onReset: () => void;
}

const GRADE_MAP = ["D", "C", "B", "A", "S", "SS", "SSS"];

export const ResultView: React.FC<Props> = ({ result, lang, image, onReset }) => {
  const dict = DICTIONARIES[lang];
  const gradeLabel = GRADE_MAP[result.rating - 1] || "D";
  
  const isHighGrade = result.rating >= 5;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-1000">
      <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-stretch">
        
        {/* Left Column: Image (Top) & Radar (Bottom) */}
        <div className="space-y-6 flex flex-col">
          {/* Captured Subject Image */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-1 shadow-2xl relative group overflow-hidden">
            <div className="aspect-[3/4] w-full relative rounded-xl overflow-hidden">
              <img 
                src={image} 
                alt="Captured Specimen" 
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute top-2 left-2 flex gap-2">
                <span className="bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded italic">SPECIMEN_CAPTURED</span>
              </div>
              <div className="absolute bottom-4 left-4 font-mono text-[10px] text-zinc-400 tracking-tighter">
                SCAN_TS: {new Date().toISOString().split('T')[0]} / UUID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Dimensional Radar */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl flex-1 relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]"></div>
             <h3 className="text-[10px] font-orbitron text-zinc-500 mb-4 uppercase tracking-[0.3em] border-b border-zinc-800 pb-2 flex justify-between">
               <span>Structural_Integrity</span>
               <span className="text-cyan-600 animate-pulse">● LIVE_DATA</span>
             </h3>
             <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={result.dimensions}>
                    <PolarGrid stroke="#222" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Radar
                      name="Value"
                      dataKey="value"
                      stroke={isHighGrade ? "#f5d0fe" : "#06b6d4"}
                      fill={isHighGrade ? "#d946ef" : "#0891b2"}
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Right Column: Large Grade & Evaluation Report */}
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-8 md:p-12 relative overflow-hidden flex-1 shadow-inner">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-[60px] leading-none select-none pointer-events-none">
               {gradeLabel}
             </div>
             
             {/* Grade Header */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-10 mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-ping"></div>
                    <span className="font-orbitron text-[11px] text-fuchsia-500 tracking-[0.4em] uppercase">Processing_Status: Complete</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-orbitron font-black text-white tracking-tighter italic">
                    {result.summaryPhrase}
                  </h2>
                </div>

                <div className="relative flex items-center justify-center min-w-[160px]">
                  <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150"></div>
                  <div className="relative text-center">
                    <div className="text-[120px] md:text-[160px] leading-none font-orbitron font-black italic text-transparent stroke-white/20 [webkit-text-stroke:1px_rgba(255,255,255,0.1)] absolute inset-0 -translate-y-2 translate-x-2">
                      {gradeLabel}
                    </div>
                    <div className={`text-[100px] md:text-[140px] leading-none font-orbitron font-black italic relative z-10 ${
                      isHighGrade 
                      ? 'text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-400 via-white to-fuchsia-600 drop-shadow-[0_0_25px_rgba(217,70,239,0.6)]' 
                      : 'text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    }`}>
                      {gradeLabel}
                    </div>
                  </div>
                </div>
             </div>

             {/* Evaluation Report Content */}
             <div className="space-y-8 relative">
                <div className="flex items-center gap-4 text-zinc-700">
                  <span className="font-mono text-[10px] tracking-widest whitespace-nowrap">DETAILED_REPORT_LOG</span>
                  <div className="h-px w-full bg-zinc-900"></div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fuchsia-600 via-zinc-800 to-transparent"></div>
                  <p className="text-zinc-300 font-serif text-xl md:text-2xl leading-relaxed italic first-letter:text-6xl first-letter:font-bold first-letter:text-fuchsia-500 first-letter:mr-3 first-letter:float-left selection:bg-fuchsia-500/30">
                    {result.comment}
                  </p>
                </div>
             </div>

             {/* Action Buttons */}
             <div className="mt-16 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onReset}
                  className="px-8 py-5 bg-white text-black font-orbitron text-xs font-black tracking-[0.2em] hover:bg-fuchsia-500 hover:text-white transition-all duration-300 rounded-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(217,70,239,0.4)] uppercase"
                >
                  Terminate_Analysis // Re-Initialize
                </button>
                <div className="px-6 py-5 border border-zinc-800 rounded-lg flex items-center justify-center flex-1">
                  <span className="text-[10px] font-mono text-zinc-600 tracking-widest">ENCRYPTION: 256-BIT // ASSET_SECURED</span>
                </div>
             </div>
          </div>
          
          {/* Metadata Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {["WILL_DRAIN", "VACUUM_LEVEL", "SKIN_SYNC", "OBJECT_VAL"].map((tag, i) => (
               <div key={i} className="bg-zinc-900/20 border border-zinc-900 p-3 rounded-xl flex flex-col gap-2">
                 <div className="h-0.5 w-full bg-zinc-800">
                   <div className="h-full bg-fuchsia-900 animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }}></div>
                 </div>
                 <span className="text-[9px] font-mono text-zinc-500 tracking-tighter">{tag} // OK</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
