
import React, { useRef, useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { AnalysisResult, Language } from '../types';
import { DICTIONARIES, RECONDITIONING_LOGS } from '../constants';
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

const HighlightedTitle: React.FC<{ text: string; keywords: string[]; accent: string }> = ({ text, keywords, accent }) => {
  const cleanText = text.trim();
  if (!keywords || keywords.length === 0) {
    return <span className="export-text inline">{cleanText}</span>;
  }

  const keyword = keywords[0];
  const parts = cleanText.split(keyword);

  return (
    <span className="export-text inline">{parts[0]}<span style={{ color: accent }}>{keyword}</span>{parts.slice(1).join(keyword)}</span>
  );
};

const QuoteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L11.017 3V21H14.017ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H7.017C5.91243 8 5.017 7.10457 5.017 6V3L2.017 3V21H5.017Z" />
  </svg>
);

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
    img.onload = () => {
      setIsPortrait(img.height > img.width);
    };
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
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('capture-container');
          if (el) {
            el.style.padding = '40px 30px';
            el.style.overflow = 'visible';
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
          }
        }
      });
      const link = document.createElement('a');
      link.download = `FORM_REPORT_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const RatingBox = () => (
    <div className="tech-border rounded-3xl p-4 flex items-center justify-between relative overflow-visible h-32 mt-16">
      <div className="absolute -top-24 left-4 pointer-events-none z-20">
        <span className={`text-[11rem] font-orbitron font-black italic leading-none ${colors.grade} ${colors.glow} select-none drop-shadow-[0_20px_50px_rgba(0,0,0,1)] tracking-tighter`}>
          {gradeLabel}
        </span>
      </div>
      <div className="flex-1"></div>
      <div className="h-full w-px bg-zinc-800/50 mx-4"></div>
      <div className="text-right">
        <div className="text-[10px] font-mono text-zinc-600 mb-1 export-text uppercase">Quality_Rank</div>
        <div className="text-xs font-bold text-white tracking-widest font-orbitron export-text uppercase leading-none">AUTHENTICATED</div>
      </div>
    </div>
  );

  const RadarBox = () => (
    <div className="tech-border rounded-3xl p-4 flex flex-col h-[380px]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest export-text">Morphology_Stats</span>
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]"></div>
      </div>
      <div className="flex-1 w-full h-full flex items-center justify-center">
        <RadarChart cx={130} cy={130} outerRadius={85} width={260} height={260} data={result.dimensions}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: '800' }} 
          />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
            itemStyle={{ color: colors.accent }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke={colors.accent}
            fill={colors.radarFill}
            fillOpacity={0.4}
            isAnimationActive={!saving}
          />
        </RadarChart>
      </div>
      <div className="text-center mt-1">
         <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest export-text">Scale: 0.0 - 10.0</span>
      </div>
    </div>
  );

  const TagsRow = () => (
    <div className="flex flex-wrap justify-center gap-3 w-full py-4">
      {result.tags.map((tag, idx) => (
        <span 
          key={idx} 
          className="px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-950/80 text-white font-mono text-[10px] font-black tracking-widest uppercase shadow-xl shadow-cyan-950/30 backdrop-blur-md"
        >
          {tag}
        </span>
      ))}
    </div>
  );

  const CommentBox = () => (
    <div className="tech-border rounded-3xl p-8 md:p-10 flex flex-col h-full overflow-hidden relative">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-[10px] text-zinc-500 tracking-[0.4em] uppercase export-text text-left">CHIEF_OFFICER_LOG</span>
        <div className="h-px flex-1 bg-zinc-800/60"></div>
      </div>
      <div className="flex-1 flex flex-col items-start w-full z-10">
        <p className="text-zinc-200 font-sans text-lg md:text-2xl tracking-tight export-text indent-text italic font-medium text-left w-full whitespace-pre-wrap">{result.comment.trim()}</p>
      </div>
      {/* Decorative Logs Overlay - Repositioned to bottom center to avoid text clash */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-10 font-mono text-[7px] text-cyan-400 pointer-events-none select-none text-center w-full px-10">
        {RECONDITIONING_LOGS.slice(0, 2).join(' | ')}
      </div>
    </div>
  );

  const DialogueBox = () => (
    <div className="relative mt-4 rounded-3xl overflow-hidden bg-zinc-950/40 border border-zinc-800 p-8 md:p-14 lg:p-20">
      <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-5 px-10 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-cyan-400 rounded-full transition-all duration-500" 
            style={{ height: `${Math.random() * 60 + 10}%` }}
          />
        ))}
      </div>
      
      {/* Aesthetic Side Log Labels - Repositioned far sides */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-20 pointer-events-none select-none text-right">
        {RECONDITIONING_LOGS.slice(3, 5).map((log, i) => (
          <div key={i} className="text-[7px] font-mono text-fuchsia-400 whitespace-nowrap uppercase tracking-widest">{log}</div>
        ))}
      </div>

      <div className="relative z-10 w-full flex flex-col items-center max-w-5xl mx-auto px-6 md:px-12 text-center">
        {/* Large Decorative SVG Quotes */}
        <QuoteIcon className="absolute -top-12 left-0 w-16 h-16 text-cyan-900/40 rotate-180 select-none pointer-events-none" />
        <QuoteIcon className="absolute -bottom-16 right-0 w-16 h-16 text-cyan-900/40 select-none pointer-events-none" />

        <div className="flex items-center gap-2 mb-6 opacity-40 justify-center">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
           <span className="text-[8px] font-mono text-white tracking-[0.3em] uppercase">DIRECT_VOICE_SYNC</span>
        </div>
        <p className="text-cyan-400 font-sans text-2xl md:text-5xl font-black tracking-tighter italic leading-tight export-text text-center w-full drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          {result.summaryDialogue.trim()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 px-4 overflow-visible">
      <div 
        ref={reportRef} 
        id="capture-container"
        className="bg-[#020202] p-8 md:p-12 rounded-[3rem] flex flex-col gap-6 relative overflow-visible global-protocol-frame"
      >
        <div className="frame-corner top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl"></div>
        <div className="frame-corner top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl"></div>
        <div className="frame-corner bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl"></div>
        <div className="frame-corner bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl"></div>

        {/* Global Header info */}
        <div className="pt-2 border-b border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-6 pb-6 relative">
          <div className="text-center md:text-left">
            <h4 className="text-white font-orbitron font-black text-[12px] tracking-[0.6em] uppercase export-text leading-none text-left">{dict.title}</h4>
            <p className="text-zinc-600 font-mono text-[9px] tracking-widest mt-2 export-text text-left">SECURE_DATA_PACKAGE // SYNC_STABLE</p>
          </div>
          {/* Decorative Log - Positioned center in header to stay clear of text */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-1 text-[8px] font-mono text-fuchsia-600 opacity-40 text-center tracking-widest uppercase">
             {RECONDITIONING_LOGS[0]} <span className="mx-2 text-zinc-800">|</span> {RECONDITIONING_LOGS[1]}
          </div>
          <div className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase text-center md:text-right leading-relaxed export-text text-right">
            SYSTEM_PROTOCOL_V3.0_RELEASE<br/>
            // IDENTITY_SUBMERGED // 
          </div>
        </div>

        {/* Evaluation Title */}
        <div className="text-center space-y-2 mt-4 relative">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-6 bg-cyan-900"></span>
            <span className="text-[9px] font-mono tracking-[0.5em] text-zinc-500 uppercase export-text text-center">FORM_ANALYSIS_DATA</span>
            <span className="h-px w-6 bg-cyan-900"></span>
          </div>
          <h2 className="text-3xl md:text-5xl font-orbitron font-black text-white tracking-tight italic leading-tight export-text text-center">
            <HighlightedTitle text={result.summaryPhraseZh} keywords={result.summaryHighlightKeywords} accent={colors.accent} />
          </h2>
          <p className="text-[10px] md:text-xs font-orbitron font-bold text-zinc-600 tracking-[0.3em] uppercase italic leading-none export-text text-center">{result.summaryPhraseEn.trim()}</p>
        </div>

        {isPortrait ? (
          <div className="flex flex-col gap-6 overflow-visible">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-stretch overflow-visible">
              <div className="relative bg-zinc-950/50 rounded-[2rem] border border-zinc-800/50 overflow-hidden shadow-2xl flex items-center justify-center min-h-[450px]">
                <img src={image} alt="Specimen" className="max-w-full h-auto max-h-[80vh] block object-contain shadow-inner" />
                <div className="absolute top-4 left-6 pointer-events-none">
                  <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest export-text">SCAN_RENDER_STABLE</span>
                </div>
              </div>
              <div className="flex flex-col gap-6 overflow-visible">
                <RatingBox />
                <RadarBox />
              </div>
            </div>
            <TagsRow />
            <CommentBox />
            <DialogueBox />
          </div>
        ) : (
          <div className="flex flex-col gap-6 overflow-visible">
            <div className="flex flex-col items-center w-full">
              <div className="relative group w-full max-w-4xl flex items-center justify-center">
                <div className="absolute -inset-1 bg-zinc-800/10 rounded-[2rem] blur-sm"></div>
                <div className="relative bg-zinc-950/50 rounded-[2rem] border border-zinc-800/50 overflow-hidden shadow-2xl flex items-center justify-center">
                  <img src={image} alt="Specimen" className="max-w-full h-auto max-h-[60vh] block object-contain shadow-inner" />
                  <div className="absolute top-4 right-6 pointer-events-none">
                    <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest export-text">SCAN_RENDER_STABLE</span>
                  </div>
                </div>
              </div>
              <TagsRow />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-stretch mt-2 overflow-visible">
              <div className="flex flex-col gap-6 overflow-visible">
                <RatingBox />
                <RadarBox />
              </div>
              <CommentBox />
            </div>
            <DialogueBox />
          </div>
        )}

        {/* Global Bottom Section with 3 centered lines */}
        <div className="mt-12 pt-8 border-t border-zinc-900/50 flex flex-col items-center gap-3 relative">
          {/* Background Decorative Log - Bottom center */}
          <div className="absolute -top-4 opacity-10 text-[7px] font-mono text-cyan-600 tracking-[1em] uppercase pointer-events-none">
             {RECONDITIONING_LOGS[RECONDITIONING_LOGS.length-1]}
          </div>
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em] export-text text-center">
            Authorized_Protocol
          </div>
          <div className="text-sm font-bold text-white tracking-[0.2em] font-orbitron export-text leading-none text-center">
            MORPH_UNIT_07_TERMINAL
          </div>
          <div className="text-[9px] font-mono text-zinc-500/60 tracking-[0.2em] export-text text-center lowercase mt-1">
            https://latex-kigurumi-fetish-indicator.vercel.app/
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto pt-10">
        <button 
          onClick={handleSaveReport}
          disabled={saving}
          className="flex-1 px-10 py-6 bg-white text-black font-orbitron text-xs font-black tracking-widest hover:bg-cyan-500 hover:text-white transition-all rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95 disabled:opacity-50"
        >
          {saving ? 'COMPILING_DATA...' : (lang === 'zh' ? '导出完整评估报告' : 'EXPORT REPORT')}
        </button>
        <button 
          onClick={onReset}
          className="px-10 py-6 bg-zinc-900/50 text-zinc-500 border border-zinc-800 font-orbitron text-xs font-black tracking-widest hover:text-zinc-200 transition-all rounded-full active:scale-95"
        >
          {dict.onReset}
        </button>
      </div>
    </div>
  );
};
