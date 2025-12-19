
import React, { useRef, useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
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
  if (rating >= 7) return { 
    grade: 'text-yellow-400', 
    accent: '#facc15',
    glow: 'drop-shadow-[0_0_35px_rgba(250,204,21,0.9)]', 
    radarFill: '#facc15'
  };
  if (rating >= 5) return { 
    grade: 'text-fuchsia-500', 
    accent: '#d946ef',
    glow: 'drop-shadow-[0_0_25px_rgba(217,70,239,0.7)]', 
    radarFill: '#d946ef'
  };
  if (rating >= 3) return { 
    grade: 'text-cyan-400', 
    accent: '#22d3ee',
    glow: 'drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]', 
    radarFill: '#22d3ee'
  };
  return { 
    grade: 'text-zinc-500', 
    accent: '#71717a',
    glow: '', 
    radarFill: '#3f3f46'
  };
};

const LABEL_STYLE = "text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-bold leading-none";

const QuoteSVG: React.FC<{ className?: string; flip?: boolean }> = ({ className, flip }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className} style={{ transform: flip ? 'rotate(180deg)' : 'none' }}>
    <path d="M25,30 c0,15 -5,25 -15,35 v10 h25 v-45 h-10 Z M65,30 c0,15 -5,25 -15,35 v10 h25 v-45 h-10 Z" />
  </svg>
);

const HighlightedTitle: React.FC<{ text: string; keywords: string[]; accent: string }> = ({ text, keywords, accent }) => {
  const cleanText = text.trim();
  if (!keywords || keywords.length === 0) return <span className="export-text">{cleanText}</span>;
  const keyword = keywords[0];
  const parts = cleanText.split(keyword);
  return (<span className="export-text">{parts[0]}<span style={{ color: accent }}>{keyword}</span>{parts.slice(1).join(keyword)}</span>);
};

export const ResultView: React.FC<Props> = ({ result, lang, image, onReset }) => {
  const dict = DICTIONARIES[lang];
  const colors = GET_GRADE_COLORS(result.rating);
  const gradeLabel = GRADE_MAP[result.rating - 1] || "D";
  const reportRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => setIsPortrait(img.height > img.width);
  }, [image]);

  const handleSaveReport = async () => {
    if (!reportRef.current) return;
    setSaving(true);
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#020202',
        scale: 2,
        useCORS: true,
        logging: false,
        width: 1200,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('capture-container');
          if (el) {
            el.style.width = '1200px';
            el.style.margin = '0 auto';
            el.style.borderRadius = '0px';
            el.style.border = 'none';
          }
        }
      });
      const link = document.createElement('a');
      link.download = `PC_REPORT_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const RatingBox = () => (
    <div className="tech-border rounded-3xl p-6 relative overflow-visible h-32 mt-16 bg-zinc-950/40">
      {/* Quality_Rank: 左上角 */}
      <div className={`absolute top-4 left-4 ${LABEL_STYLE} opacity-50`}>
        Quality_Rank
      </div>
      
      {/* 评级符号: 左右居中 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] pointer-events-none z-20">
        <span className={`text-[11rem] font-orbitron font-black italic leading-none ${colors.grade} ${colors.glow} tracking-tighter`}>
          {gradeLabel}
        </span>
      </div>
      
      {/* AUTHENTICATED: 右下角 */}
      <div className="absolute bottom-4 right-4 text-right">
        <div className="text-sm font-bold text-white tracking-[0.2em] font-orbitron uppercase leading-none">
          AUTHENTICATED
        </div>
      </div>
    </div>
  );

  const RadarBox = () => (
    <div className="tech-border rounded-3xl p-6 flex flex-col h-[380px] bg-zinc-950/40">
      <div className="flex justify-between items-center mb-4">
        <span className={LABEL_STYLE}>Morphology_Stats</span>
        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <RadarChart cx={130} cy={130} outerRadius={85} width={260} height={260} data={result.dimensions}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: '800' }} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Radar name="Score" dataKey="value" stroke={colors.accent} fill={colors.radarFill} fillOpacity={0.4} isAnimationActive={false} />
        </RadarChart>
      </div>
      <div className="text-center mt-2">
         <span className={`${LABEL_STYLE} opacity-40`}>SCALE_PROTOCOL: 0.0 - 10.0</span>
      </div>
    </div>
  );

  const CommentBox = () => (
    <div className="tech-border rounded-3xl p-6 md:p-10 flex flex-col h-full relative bg-zinc-950/40">
      <div className="flex items-center gap-4 mb-8">
        <span className={LABEL_STYLE}>CHIEF_OFFICER_LOG</span>
        <div className="h-px flex-1 bg-zinc-800/40"></div>
      </div>
      <div className="flex-1 overflow-hidden">
        {/* 首行缩进两个字符 */}
        <p 
          className="text-zinc-200 font-sans text-xl md:text-2xl leading-relaxed italic font-medium export-text block break-words"
          style={{ textIndent: '2em' }}
        >
          {result.comment.trim()}
        </p>
      </div>
    </div>
  );

  const DialogueBox = () => (
    <div className="relative mt-4 rounded-[2.5rem] overflow-hidden bg-zinc-950/60 border border-zinc-800/50 p-8 md:p-20 flex flex-col items-center justify-center min-h-[350px]">
      <div className="absolute inset-0 flex items-center justify-center gap-[2px] opacity-20 px-4 pointer-events-none">
        {Array.from({ length: 160 }).map((_, i) => {
          const x = i / 160;
          const bell = Math.exp(-Math.pow(x - 0.5, 2) / 0.05);
          const wave = Math.sin(i * 0.3) * 0.2 + 0.8;
          const height = (wave * bell * 80) + 2;
          return (<div key={i} className="flex-1 bg-cyan-500 rounded-full" style={{ height: `${height}%`, minHeight: '3px' }} />);
        })}
      </div>
      
      <div className="relative z-10 w-full flex flex-col items-start max-w-5xl">
        <QuoteSVG className="absolute -top-12 md:-top-16 -left-6 md:-left-12 w-16 h-16 md:w-24 md:h-24 text-cyan-400 opacity-20" />
        <QuoteSVG className="absolute -bottom-16 md:-bottom-24 -right-6 md:-right-12 w-16 h-16 md:w-24 md:h-24 text-cyan-400 opacity-20" flip />

        <div className="flex items-center gap-2 mb-6 md:mb-10">
           <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]"></div>
           <span className={`${LABEL_STYLE} text-cyan-400`}>DIRECT_VOICE_SYNC</span>
        </div>
        
        {/* 首行缩进两个字符 */}
        <p 
          className="text-cyan-400 font-sans text-2xl md:text-6xl font-black tracking-tighter italic leading-tight export-text block break-words drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
          style={{ textIndent: '2em' }}
        >
          {result.summaryDialogue.trim()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 pb-24 px-2 md:px-4 overflow-visible">
      <div 
        ref={reportRef} 
        id="capture-container"
        className="bg-[#020202] rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl global-protocol-frame border-zinc-800/50"
      >
        <div className="window-header h-12">
          <div className="flex gap-2">
            <div className="dot dot-red"></div>
            <div className="dot dot-yellow"></div>
            <div className="dot dot-green"></div>
          </div>
          <div className="flex-1 text-center text-[9px] md:text-[10px] font-mono text-zinc-600 tracking-[0.2em] md:tracking-[0.4em] uppercase">
            SECURE_TERMINAL_ACCESS // REPORT_ID_{Math.floor(Date.now()/1000)}
          </div>
        </div>

        <div className="p-6 md:p-16 flex flex-col gap-10 md:gap-12 relative bg-[#020202]">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-zinc-900 pb-8 md:pb-10 gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-white font-orbitron font-black text-sm md:text-base tracking-[0.4em] md:tracking-[0.6em] uppercase export-text block leading-tight">{dict.title}</h4>
              <p className="text-zinc-600 font-mono text-[9px] md:text-[10px] tracking-widest mt-2 md:mt-3 uppercase block">UNIT_07_TERMINAL // MORPH_ANALYSIS_STABLE</p>
            </div>
            <div className="text-[9px] md:text-[10px] font-mono text-zinc-700 tracking-[0.2em] md:tracking-[0.3em] uppercase text-right leading-relaxed export-text block">
              ENCRYPTION: AES_256_ACTIVE<br/>
              IDENTITY: SUBMERGED_PROTOCOL
            </div>
          </div>

          <div className="text-center space-y-4 md:space-y-6">
            <div className="flex items-center justify-center gap-4 md:gap-6 opacity-20">
              <span className="h-px w-16 md:w-24 bg-cyan-500"></span>
              <span className={LABEL_STYLE}>FORM_ANALYSIS_DATA</span>
              <span className="h-px w-16 md:w-24 bg-cyan-500"></span>
            </div>
            <h2 className="text-3xl md:text-7xl font-orbitron font-black text-white tracking-tight italic leading-[1.1] block">
              <HighlightedTitle text={result.summaryPhraseZh} keywords={result.summaryHighlightKeywords} accent={colors.accent} />
            </h2>
            <p className="text-[10px] md:text-base font-orbitron font-bold text-zinc-500 tracking-[0.3em] md:tracking-[0.6em] uppercase italic block">{result.summaryPhraseEn.trim()}</p>
          </div>

          <div className="flex flex-col gap-10 md:gap-12">
            {isPortrait ? (
              <div className="flex flex-col gap-10 md:gap-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 md:gap-12 items-stretch">
                  <div className="relative bg-zinc-950/40 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-800/50 overflow-hidden shadow-2xl flex items-center justify-center min-h-[400px] md:min-h-[550px]">
                    <img src={image} alt="Specimen" className="max-w-full h-auto max-h-[85vh] block object-contain" />
                    <div className="absolute top-6 md:top-8 left-8 md:left-10">
                      <span className={`${LABEL_STYLE} text-zinc-600`}>SCAN_RENDER_STABLE</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-8 md:gap-10">
                    <RatingBox />
                    <RadarBox />
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 md:gap-4 py-6 md:py-8 border-y border-zinc-900/50">
                  {result.tags.map((tag, idx) => (
                    <span key={idx} className="px-5 md:px-8 py-2 md:py-3 rounded-full border border-zinc-800 bg-zinc-950 text-white font-mono text-[10px] md:text-[12px] font-black tracking-widest uppercase shadow-xl export-text">{tag}</span>
                  ))}
                </div>
                <CommentBox />
              </div>
            ) : (
              <div className="flex flex-col gap-10 md:gap-12">
                <div className="relative bg-zinc-950/40 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-800/50 overflow-hidden shadow-2xl flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                  <img src={image} alt="Specimen" className="max-w-full h-auto max-h-[70vh] block object-contain" />
                  <div className="absolute top-6 md:top-8 right-8 md:right-10">
                    <span className={`${LABEL_STYLE} text-zinc-600`}>SCAN_RENDER_STABLE</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 md:gap-4 py-6 md:py-8 border-y border-zinc-900/50">
                  {result.tags.map((tag, idx) => (
                    <span key={idx} className="px-5 md:px-8 py-2 md:py-3 rounded-full border border-zinc-800 bg-zinc-950 text-white font-mono text-[10px] md:text-[12px] font-black tracking-widest uppercase shadow-xl export-text">{tag}</span>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 md:gap-10">
                  <div className="flex flex-col gap-8 md:gap-10">
                    <RatingBox />
                    <RadarBox />
                  </div>
                  <CommentBox />
                </div>
              </div>
            )}
            
            <DialogueBox />

            <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-zinc-900 flex flex-col items-center gap-3 md:gap-4">
              <div className={`${LABEL_STYLE} tracking-[0.4em] md:tracking-[0.8em] opacity-40`}>Authorized_Protocol</div>
              <div className="text-sm md:text-xl font-black text-white tracking-[0.2em] md:tracking-[0.4em] font-orbitron uppercase leading-none export-text block">MORPH_UNIT_07_TERMINAL</div>
              <div className="text-[9px] md:text-[11px] font-mono text-zinc-600 tracking-[0.1em] md:tracking-[0.3em] lowercase export-text block">https://latex-kigurumi-fetish-indicator.vercel.app/</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto pt-6 md:pt-10">
        <button 
          onClick={handleSaveReport}
          disabled={saving}
          className="flex-1 px-8 md:px-12 py-6 md:py-8 bg-white text-black font-orbitron text-sm font-black tracking-widest hover:bg-cyan-500 hover:text-white transition-all rounded-full shadow-2xl active:scale-95 disabled:opacity-50"
        >
          {saving ? 'COMPILING_DATA...' : (lang === 'zh' ? '导出完整评估报告' : 'EXPORT REPORT')}
        </button>
        <button 
          onClick={onReset}
          className="px-8 md:px-12 py-6 md:py-8 bg-zinc-900/50 text-zinc-500 border border-zinc-800 font-orbitron text-sm font-black tracking-widest hover:text-white transition-all rounded-full active:scale-95"
        >
          {dict.onReset}
        </button>
      </div>
    </div>
  );
};
