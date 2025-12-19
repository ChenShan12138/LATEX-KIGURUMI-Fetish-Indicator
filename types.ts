
export type Language = 'zh' | 'en' | 'ja';

export interface AnalysisResult {
  rating: number; // 1-7
  summaryPhraseZh: string;
  summaryHighlightKeywords: string[]; // Specific words within summaryPhraseZh to highlight
  summaryPhraseEn: string;
  comment: string;
  summaryDialogue: string; // The provocative quote
  tags: string[]; // 1-6 short descriptive tags
  dimensions: {
    name: "精致" | "质感" | "张力" | "协调" | "诱惑";
    value: number; // 0-10
  }[];
}

export interface Dictionary {
  title: string;
  subtitle: string;
  uploadBtn: string;
  analyzing: string;
  resultTitle: string;
  warning: string;
  disclaimer: string;
  sinkingStages: string[];
  onReset: string;
}

export const LANGUAGES: Record<Language, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語'
};
