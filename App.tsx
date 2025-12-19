
import React, { useState } from 'react';
import { Language, AnalysisResult, LANGUAGES } from './types';
import { DICTIONARIES, QUOTES } from './constants';
import { BackgroundElements } from './components/BackgroundElements';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultView } from './components/ResultView';
import { analyzeFetishImage } from './geminiService';

const VERSION = "v1.2.8";

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const dict = DICTIONARIES[lang];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        processAnalysis(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAnalysis = async (imgData: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeFetishImage(imgData, lang);
      setResult(res);
    } catch (err: any) {
      const is503 = err.message?.includes('503') || err.message?.includes('Rpc failed');
      // @google/genai Guideline: Removed mentions of custom endpoints as they are prohibited.
      const msg = is503 
        ? (lang === 'zh' ? "后端负载过高 (503)。服务正在拥塞，请稍后重试。" : "Service Unavailable (503). System is congested, please try again later.")
        : (lang === 'zh' ? "评估中断。请检查网络连接或 API 配置。" : "Assessment Aborted. Check connection or API config.");
      setError(msg);
      console.error(err);
      setImage(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setAnalyzing(false);
    setError(null);
  };

  return (
    <div className="min-h-screen relative flex flex-col p-4 md:p-8">
      <BackgroundElements />

      {/* Header */}
      <header className="relative z-50 flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div className="text-center md:text-left">
          <div className="flex flex-col md:flex-row items-baseline gap-2">
            <h1 className="text-3xl md:text-5xl font-orbitron font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-500">
              {dict.title}
            </h1>
            {lang === 'zh' && (
              <span className="text-[10px] font-mono text-zinc-600 tracking-[0.3em] uppercase hidden md:inline">LATEX_KIGURUMI_INDICATOR</span>
            )}
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mt-1">
            <p className="text-zinc-500 font-serif italic">{dict.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-zinc-900/80 p-1 rounded-full border border-zinc-800">
            {(Object.keys(LANGUAGES) as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-1 rounded-full text-xs font-orbitron transition-all ${
                  lang === l ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {LANGUAGES[l]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {!image && !analyzing ? (
          <div className="w-full max-w-lg space-y-8">
            <div className="text-center space-y-4">
              <div className="p-10 border-2 border-dashed border-zinc-800 rounded-3xl hover:border-cyan-500/50 transition-colors group cursor-pointer relative bg-zinc-900/20 backdrop-blur-xl">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover:border-cyan-500 transition-all">
                    <svg className="w-10 h-10 text-zinc-600 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="text-xl font-orbitron font-black tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors uppercase">{dict.uploadBtn}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {QUOTES.slice(0, 4).map((q, i) => (
                <div key={i} className="text-[11px] text-zinc-600 font-serif italic text-center opacity-60 leading-relaxed tracking-wide">"{q}"</div>
              ))}
            </div>
          </div>
        ) : analyzing ? (
          <AnalysisProgress lang={lang} />
        ) : result && image ? (
          <ResultView result={result} lang={lang} image={image} onReset={reset} />
        ) : null}

        {error && (
          <div className="mt-8 text-red-500 font-mono text-sm bg-red-950/20 px-8 py-4 border border-red-900/50 rounded-2xl max-w-md text-center shadow-2xl animate-in slide-in-from-top-2 duration-300">
            <div className="font-black mb-2 tracking-widest text-xs">SYSTEM_FAILURE</div>
            <p className="opacity-80 leading-relaxed">{error}</p>
            <div className="flex gap-4 justify-center mt-4">
              <button onClick={() => window.location.reload()} className="text-[10px] text-cyan-500 underline uppercase tracking-widest hover:text-cyan-400">Retry Now</button>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 mt-12 py-8 border-t border-zinc-900/50 flex flex-col items-center gap-4">
        <span className="px-3 py-1 bg-red-900/20 text-red-500 text-[10px] font-black border border-red-900/30 rounded-lg uppercase tracking-[0.2em]">{dict.warning}</span>
        <p className="text-[10px] text-zinc-600 text-center max-w-2xl px-6 italic leading-relaxed opacity-60">{dict.disclaimer}</p>
        <div className="mt-4 text-[8px] font-mono text-zinc-800 tracking-[0.5em] uppercase opacity-40">BUILD_HASH: {VERSION}_STABLE</div>
      </footer>
    </div>
  );
};

export default App;
