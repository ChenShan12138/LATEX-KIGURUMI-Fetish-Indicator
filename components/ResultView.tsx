import React, { useRef, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { AnalysisResult, Language } from '../types';
import { DICTIONARIES } from '../constants';
import html2canvas from 'html2canvas';

interface Props {
  result: AnalysisResult;
  lang: Language;
  image: string;
  onReset: () => void;
}

const GRADE_MAP = ["D", "C", "B", "A", "S", "SS", "SSS"];

const GET_GRADE_COLORS = (rating: number) => {
  if (rating >= 7) return { text: 'text-yellow-400', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.5)]', radar: '#facc15', fill: '#facc15' };
  if (rating >= 5) return { text: 'text-fuchsia-500', glow: 'shadow-[0_0_25px_rgba(217,70,239,0.5)]', radar: '#d946ef', fill: '#d946ef' };
  if (rating >= 3) return { text: 'text-cyan-400', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]', radar: '#22d3ee', fill: '#22d3ee' };
  return { text: 'text-zinc-500', glow: '', radar: '#71717a', fill: '#71717a' };
};

export const ResultView: React.FC<Props> = ({ result, lang, image, onReset }) => {
  const dict = DICTIONARIES[lang];
  const gradeLabel = GRADE_MAP[result.rating - 1] || "D";
  const colors = GET_GRADE_COLORS(result.rating);
  const reportRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveReport = async () => {
    if (!reportRef.current) return;
    setSaving(true);
    
    try {
      // Use a consistent window width for export to prevent layout squeezing in the image
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#050505',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1400, // Slightly wider to ensure horizontal breathing room
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('capture-container');
          if (el) {
            el.style.width = '1400px';
            el.style.padding = '60px';
            el.style.borderRadius = '0px';
            el.style.border = 'none';
          }
        }
      });
      const link = document.createElement('a');
      link.download = `BODY_ASSESSMENT_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to capture report:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-1000 pb-20">
      {/* Captured Section */}
      <div 
        ref={reportRef} 
        id="capture-container"
        className="bg-[#050505] p-6 md:p-12 rounded-[40px] border border-zinc-900 overflow-hidden"
      >
        <div className="mb-12 flex justify-between items-end border-b border-zinc-800 pb-6">
          <div className="space-y-1">
             <h1 className="text-2xl font-orbitron font-black tracking-tighter text-white uppercase">
               {dict.title}
             </h1>
             <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">{dict.subtitle}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
             <span className="text-[10px] font-mono text-zinc-700 tracking-tighter">TERMINAL_REF: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
             <span className="text-[8px] font-mono text-zinc-800 tracking-widest uppercase">SYSTM_STAMP: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid xl:grid-cols-[400px_1fr] gap-12 items-start">
          
          {/* Left Column: Specimen Image */}
          <div className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-1 shadow-2xl relative group overflow-hidden">
              <div className="aspect-[3/4] w-full relative rounded-2xl overflow-hidden">
                <img 
                  src={image} 
                  alt="Captured Specimen" 
                  className="w-full h-full object-cover transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute top-4 left-4">
                  <span className={`text-white text-[10px] font-black px-3 py-1 rounded-full italic shadow-lg backdrop-blur-md border border-white/10 ${result.rating >= 5 ? 'bg-fuchsia-600/80' : 'bg-cyan-600/80'}`}>
                    ASSET_LOCKED
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {["DATA_SYNCED", "FORM_LOCKED", "WILL_FLUSHED", "SKIN_MERGED"].map((tag, i) => (
                <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-xl flex flex-col gap-2">
                  <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${result.rating >= 5 ? 'bg-fuchsia-900' : 'bg-cyan-900'}`} style={{ width: `${60 + i * 10}%` }}></div>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-600 tracking-tighter uppercase">{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Evaluation Terminal */}
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row gap-8 items-start justify-between bg-zinc-950/20 border border-zinc-900/50 p-8 rounded-3xl">
              
              {/* Summary Header */}
              <div className="flex-1 space-y-6 min-w-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${result.rating >= 5 ? 'bg-fuchsia-500' : 'bg-cyan-500'}`}></div>
                  <span className={`font-orbitron text-[10px] tracking-[0.4em] uppercase ${result.rating >= 5 ? 'text-fuchsia-500' : 'text-cyan-500'}`}>
                    {lang === 'zh' ? '评估报告' : 'Assessment_Report'}
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-black text-white tracking-tighter italic leading-tight break-words">
                  {result.summaryPhrase}
                </h2>
                
                <div className={`h-1 w-32 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 ${result.rating >= 5 ? 'text-fuchsia-600' : 'text-cyan-600'}`}></div>
              </div>

              {/* Radar Chart Section - Removed Boxy Background */}
              <div className="relative w-full md:w-[300px] h-[300px] shrink-0">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className={`font-orbitron font-black italic select-none transition-all duration-1000 flex flex-col items-center ${colors.text}`}>
                    <span className="text-[10px] tracking-[0.5em] opacity-30 mb-[-10px]">GRADE</span>
                    <span className={`text-[100px] leading-none drop-shadow-2xl`}>
                      {gradeLabel}
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={result.dimensions} margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                      <PolarGrid stroke="#222" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#666', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                      <Radar
                        name="Value"
                        dataKey="value"
                        stroke={colors.radar}
                        fill={colors.fill}
                        fillOpacity={0.15}
                        animationDuration={1500}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Comment Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
                    {lang === 'zh' ? '主审员处理意见' : 'CHIEF_EXAMINER_LOG'}
                  </span>
                </div>
                <div className="h-px flex-1 bg-zinc-900"></div>
              </div>

              <div className="relative pl-10">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-current to-transparent opacity-40 ${colors.text}`}></div>
                <p className="text-zinc-200 font-serif text-xl md:text-2xl leading-relaxed italic selection:bg-cyan-500/40 whitespace-pre-wrap">
                  {result.comment}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-zinc-900/50">
              {["MATERIAL_PURITY", "BODY_CONFORMANCE", "WILL_STABILITY", "REFLECTIVE_INDEX"].map((label, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-tighter">{label}</span>
                    <span className="text-[8px] font-mono text-zinc-400">{(Math.random() * 20 + 80).toFixed(1)}%</span>
                  </div>
                  <div className="h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-700 w-full opacity-50 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Capturable Footer */}
        <div className="mt-16 pt-8 border-t border-zinc-900 text-center space-y-2 opacity-50">
           <p className="text-[9px] text-zinc-600 font-mono tracking-[0.4em] uppercase">
             // FORM_LIQUEFACTION_TERMINAL_V2.0 //
           </p>
           <p className="text-[7px] text-zinc-800 font-mono tracking-widest uppercase">
             Unauthorized extraction of specimen data is strictly prohibited by central command
           </p>
        </div>
      </div>

      {/* Persistent Controls (Not Captured) */}
      <div className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto pt-6">
        <button 
          onClick={handleSaveReport}
          disabled={saving}
          className="flex-1 px-10 py-6 bg-cyan-600 text-white font-orbitron text-xs font-black tracking-[0.3em] hover:bg-cyan-500 transition-all duration-300 rounded-[24px] shadow-2xl hover:shadow-cyan-600/30 uppercase group flex flex-col items-center disabled:opacity-50"
        >
          <span className="mb-1">{saving ? '正在处理数据流...' : (lang === 'zh' ? '导出完整评估报告' : 'EXPORT REPORT')}</span>
          <span className="text-[8px] opacity-40 font-mono tracking-widest">SYSTEM_EXPORT_PNG</span>
        </button>
        
        <button 
          onClick={onReset}
          className="flex-1 px-10 py-6 bg-zinc-900/80 text-zinc-500 border border-zinc-800 font-orbitron text-xs font-black tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 rounded-[24px] uppercase group flex flex-col items-center"
        >
          <span className="mb-1">{dict.onReset}</span>
          <span className="text-[8px] opacity-40 font-mono tracking-widest">FLUSH_SPECIMEN</span>
        </button>
      </div>
    </div>
  );
};