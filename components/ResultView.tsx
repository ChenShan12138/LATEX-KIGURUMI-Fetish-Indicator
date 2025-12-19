
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
  // Base colors with blue (cyan) accents as requested
  const blueAccent = '#06b6d4'; // cyan-500
  
  if (rating >= 7) return { 
    grade: 'text-yellow-400', 
    gradeGlow: 'drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]', 
    radarStroke: blueAccent, 
    radarFill: blueAccent,
    radarOpacity: 0.2
  };
  if (rating >= 5) return { 
    grade: 'text-fuchsia-500', 
    gradeGlow: 'drop-shadow-[0_0_20px_rgba(217,70,239,0.7)]', 
    radarStroke: blueAccent, 
    radarFill: blueAccent,
    radarOpacity: 0.15
  };
  if (rating >= 3) return { 
    grade: 'text-cyan-400', 
    gradeGlow: 'drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]', 
    radarStroke: '#f472b6', // pink-400 as accent for cyan grade
    radarFill: '#f472b6',
    radarOpacity: 0.15
  };
  return { 
    grade: 'text-zinc-500', 
    gradeGlow: '', 
    radarStroke: blueAccent, 
    radarFill: blueAccent,
    radarOpacity: 0.1
  };
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
      link.download = `FORM_REPORT_${Date.now()}.png`;
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
        className="bg-[#050505] p-8 md:p-12 rounded-[40px] border border-zinc-900 overflow-hidden shadow-2xl flex flex-col gap-8 relative"
      >
        {/* Top Centered Titles */}
        <div className="text-center space-y-3 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-cyan-500 shadow-[0_0_8px_#06b6d4]`}></div>
            <span className="font-orbitron text-[9px] tracking-[0.5em] uppercase text-cyan-500">
              Assessment_Summary
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-orbitron font-black text-white tracking-tighter italic leading-none">
            {result.summaryPhraseZh}
          </h2>
          <h3 className="text-base md:text-xl font-orbitron font-bold text-zinc-500 tracking-[0.2em] uppercase italic opacity-80 leading-none">
            {result.summaryPhraseEn}
          </h3>
          <div className="h-0.5 w-48 mx-auto mt-4 bg-gradient-to-r from-transparent via-cyan-600 to-transparent opacity-30"></div>
        </div>

        {/* Evaluation Box (Contains Image & Radar) */}
        <div className="bg-zinc-950/40 border border-zinc-900/50 p-8 md:p-10 rounded-[32px] space-y-10 relative z-10">
          
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
                    <span className="text-white text-[7px] font-black px-2 py-0.5 rounded-full italic shadow-lg backdrop-blur-md border border-white/10 bg-cyan-600/80">
                      ASSET_LOCKED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Radar Chart Section */}
            <div className="relative w-full md:w-[320px] lg:w-[380px] aspect-square flex items-center justify-center">
              {/* Radar Chart: Background/Middle Layer */}
              <div className="absolute inset-0 z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={result.dimensions} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                    <PolarGrid stroke="#222" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Radar
                      name="Value"
                      dataKey="value"
                      stroke={colors.radarStroke}
                      fill={colors.radarFill}
                      fillOpacity={colors.radarOpacity}
                      animationDuration={1500}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Grade Label: TOP LAYER */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className={`font-orbitron font-black italic flex flex-col items-center ${colors.grade} translate-y-2`}>
                  <span className="text-[8px] tracking-[0.5em] opacity-40 mb-[-12px] uppercase">Grade</span>
                  <span className={`text-[120px] md:text-[140px] lg:text-[160px] leading-none ${colors.gradeGlow}`}>
                    {gradeLabel}
                  </span>
                </div>
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

        {/* Footer info (Always visible in UI and Export) */}
        <div className="mt-8 text-center space-y-4 border-t border-zinc-900 pt-8 relative z-10">
           <div className="flex flex-col items-center gap-1">
             <h4 className="text-white font-orbitron font-bold text-xs tracking-[0.3em] uppercase">
               {dict.title}
             </h4>
             <p className="text-cyan-500 font-mono text-[10px] tracking-wider opacity-80">
               https://latex-kigurumi-fetish-indicator.vercel.app/
             </p>
           </div>
           <p className="text-[7px] text-zinc-600 font-mono tracking-[0.4em] uppercase opacity-40">
             // PROTOCOL_V2.5_MORPHOLOGY_ASSESSMENT //
           </p>
        </div>

        {/* Decorative corner accents for the export */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-zinc-800 rounded-tl-[40px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-zinc-800 rounded-br-[40px] pointer-events-none"></div>
      </div>

      {/* Buttons (Not Captured) */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto pt-4 relative z-50">
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
