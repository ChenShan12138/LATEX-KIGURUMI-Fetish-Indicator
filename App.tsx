
import React, { useState } from 'react';
import { Language, AnalysisResult, LANGUAGES } from './types';
import { DICTIONARIES, QUOTES } from './constants';
import { BackgroundElements } from './components/BackgroundElements';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultView } from './components/ResultView';
import { analyzeFetishImage } from './geminiService';

const VERSION = "v1.2.1";

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

  /**
   * Triggers the analysis workflow.
   * API Key is managed via environment variables and injected automatically.
   */
  const processAnalysis = async (imgData: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeFetishImage(imgData, lang);
      setResult(res);
    } catch (err: any) {
      setError("Analysis failed. Verify your network connection and API configuration.");
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
              <span className="text-[10px] font-mono text-zinc-600 tracking-[0.3em] uppercase hidden md:inline">LATEX_CHICKEN_INDICATOR</span>
            )}
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mt-1">
            <p className="text-zinc-500 font-serif italic">{dict.subtitle}</p>
            {lang === 'zh' && (
              <span className="text-[8px] font-mono text-zinc-700 tracking-widest uppercase hidden md:inline">// RE-SKINNING_TERMINAL_V2</span>
            )}
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
          <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-center space-y-4">
              <div className="p-8 border-2 border-dashed border-zinc-800 rounded-3xl hover:border-cyan-500/50 transition-colors group cursor-pointer relative bg-zinc-900/20 backdrop-blur-xl">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-700 group-hover:border-cyan-500 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
                    <svg className="w-8 h-8 text-zinc-500 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-orbitron tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                      {dict.uploadBtn}
                    </span>
                    {lang === 'zh' && (
                      <span className="text-[10px] font-mono text-zinc-600 mt-1 uppercase tracking-widest group-hover:text-cyan-500 transition-colors">ACCESS ASSET</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {QUOTES.slice(0, 4).map((q, i) => (
                <div key={i} className="text-[10px] text-zinc-600 font-serif italic text-center opacity-60">
                  {q}
                </div>
              ))}
            </div>
          </div>
        ) : analyzing ? (
          <AnalysisProgress lang={lang} />
        ) : result && image ? (
          <ResultView result={result} lang={lang} image={image} onReset={reset} />
        ) : null}

        {error && (
          <div className="mt-8 text-red-500 font-mono text-sm bg-red-950/20 px-6 py-3 border border-red-900 rounded-xl max-w-md text-center">
            <div className="font-bold mb-1">SYSTEM_ERROR</div>
            {error}
          </div>
        )}
      </main>

      {/* Footer / Safety Disclaimer */}
      <footer className="relative z-10 mt-12 py-6 border-t border-zinc-900/50 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-red-600/20 text-red-500 text-[10px] font-bold border border-red-600/30 rounded uppercase tracking-tighter">
            {dict.warning}
          </span>
        </div>
        <p className="text-[10px] text-zinc-600 text-center max-w-2xl px-4 italic">
          {dict.disclaimer}
        </p>
        <div className="mt-4 text-[9px] font-mono text-zinc-800 tracking-widest uppercase">
          Build_Version: {VERSION}
        </div>
      </footer>
    </div>
  );
};

export default App;
