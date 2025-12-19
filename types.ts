
export type Language = 'zh' | 'en' | 'ja';

export interface AnalysisResult {
  rating: number; // 1-5
  summaryPhrase: string;
  comment: string;
  dimensions: {
    name: string;
    value: number; // 0-100
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
}

export const LANGUAGES: Record<Language, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語'
};
