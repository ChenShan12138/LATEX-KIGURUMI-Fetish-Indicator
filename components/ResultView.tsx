
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
  if (rating >= 7) return { text: 'text-yellow-400', glow: 'drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]', radar: '#facc15', fill: '#facc15' };
  if (rating >= 5) return { text: 'text-fuchsia-500', glow: 'drop-shadow-[0_0_15px_rgba(217,70,239,0.6)]', radar: '#d946ef', fill: '#d946ef' };
  if (rating >= 3) return { text: 'text-cyan-400', glow: 'drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]', radar: '#22d3ee', fill: '#22d3ee' };
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
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#050505',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
      });
      const link = document.createElement('a');
      link.download = `LATEX_REPORT_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to capture report:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-20 px-4 animate-in fade-in duration-1000">
      <div 
        ref={reportRef} 
        id="capture-container"
        className="bg-[#050505] p-8 md:p-12 rounded-[40px] border border-zinc-900 overflow-hidden shadow-2xl flex flex-col gap-8"
      >
        {/* Top Centered Titles */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${result.rating >= 5 ? 'bg-fuchsia-500 shadow-[0_0_8px_#d946ef]' : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'}`}></div>
            <span className={`font-orbitron text-[9px] tracking-[0.5em] uppercase ${result.rating >= 5 ? 'text-fuchsia-500' : 'text-cyan-500'}`}>
              Assessment_Summary
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-orbitron font-black text-white tracking-tighter italic leading-none">
            {result.summaryPhraseZh}
          </h2>
          <h3 className="text-base md:text-xl font-orbitron font-bold text-zinc-500 tracking-[0.2em] uppercase italic opacity-80 leading-none">
            {result.summaryPhraseEn}
          </h3>
          <div className={`h-0.5 w-48 mx-auto mt-4 bg-gradient-to-r from-transparent via-current to-transparent opacity-30 ${result.rating >= 5 ? 'text-fuchsia-600' : 'text-cyan-600'}`}></div>
        </div>

        {/* Evaluation Box (Contains Image & Radar) */}
        <div className="bg-zinc-950/40 border border-zinc-900/50 p-8 md:p-10 rounded-[32px] space-y-10">
          
          {/* Main Visual Content: Image (Left) and Radar (Right) */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-center">
            
            {/* Specimen Image */}
            <div className="shrink-0">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-1 shadow-2xl relative overflow-hidden w-[240px] md:w-[280px]">
                <div className="aspect-[3/4] w-full relative rounded-2xl overflow-hidden bg-black">
                  <img 
                    src={image} 
                    alt="Specimen" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute top-3 left-3">
                    <span className={`text-white text-[7px] font-black px-2 py-0.5 rounded-full italic shadow-lg backdrop-blur-md border border-white/10 ${result.rating >= 5 ? 'bg-fuchsia-600/80' : 'bg-cyan-600/80'}`}>
                      ASSET_LOCKED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Radar Chart Section */}
            <div className="relative w-full md:w-[320px] lg:w-[380px] aspect-square flex items-center justify-center">
              {/* Grade Label: Centered inside Radar */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className={`font-orbitron font-black italic flex flex-col items-center ${colors.text} translate-y-2`}>
                  <span className="text-[8px] tracking-[0.5em] opacity-30 mb-[-12px] uppercase">Grade</span>
                  <span className={`text-[120px] md:text-[140px] lg:text-[160px] leading-none ${colors.glow}`}>
                    {gradeLabel}
                  </span>
                </div>
              </div>
              
              <div className="absolute inset-0 z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={result.dimensions} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                    <PolarGrid stroke="#222" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Radar
                      name="Value"
                      dataKey="value"
                      stroke={colors.radar}
                      fill={colors.fill}
                      fillOpacity={0.12}
                      animationDuration={1500}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Comment Log */}
          <div className="space-y-6 pt-6 border-t border-zinc-900/50">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px] text-zinc-600 tracking-widest uppercase shrink-0">
                {lang === 'zh' ? '主审员处理意见' : 'CHIEF_EXAMINER_LOG'}
              </span>
              <div className="h-px flex-1 bg-zinc-900"></div>
            </div>
            <div className="relative pl-8 border-l-2 border-zinc-800">
              <p className="text-zinc-200 font-serif text-lg md:text-xl lg:text-2xl leading-relaxed italic whitespace-pre-wrap">
                {result.comment}
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center space-y-1 opacity-20 border-t border-zinc-900 pt-6">
           <p className="text-[7px] text-zinc-600 font-mono tracking-[0.4em] uppercase">
             // NON_HUMAN_OBJECTIFICATION_PROTOCOL_V2.5 //
           </p>
        </div>
      </div>

      {/* Buttons (Not Captured) */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto pt-4">
        <button 
          onClick={handleSaveReport}
          disabled={saving}
          className="flex-1 px-8 py-5 bg-cyan-600 text-white font-orbitron text-xs font-black tracking-widest hover:bg-cyan-500 transition-all rounded-3xl shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {saving ? 'PROCESSING...' : (lang === 'zh' ? '导出完整评估报告' : 'EXPORT REPORT')}
        </button>
        <button 
          onClick={onReset}
          className="flex-1 px-8 py-5 bg-zinc-900 text-zinc-500 border border-zinc-800 font-orbitron text-xs font-black tracking-widest hover:bg-white hover:text-black transition-all rounded-3xl"
        >
          {dict.onReset}
        </button>
      </div>
    </div>
  );
};
