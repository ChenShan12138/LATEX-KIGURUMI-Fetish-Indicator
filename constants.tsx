
import { Dictionary, Language } from './types';

export const DICTIONARIES: Record<Language, Dictionary> = {
  zh: {
    title: "填充物素体品质评估",
    subtitle: "人体曲线重塑工程 · 第二层皮肤契合终端",
    uploadBtn: "接入素材",
    analyzing: "材质扫描中... 灵魂共鸣...",
    resultTitle: "形态评级报告",
    warning: "权限确认: 成年/自愿 (18+)",
    disclaimer: "系统正在对该素材进行深度契合度分析。请确保您已准备好完全沉浸其中。",
    sinkingStages: [
      "正在提取视觉特征...",
      "材质质感深度检测...",
      "光泽反射率分析中...",
      "最终形态契合确认..."
    ],
    onReset: "清除素材"
  },
  en: {
    title: "BODY PADDING ASSESSMENT",
    subtitle: "Curve Reshaping · Second Skin Terminal",
    uploadBtn: "ACCESS ASSET",
    analyzing: "SCANNING... SYNCING SPIRIT...",
    resultTitle: "FORM CLASSIFICATION",
    warning: "AUTH: ADULT (18+)",
    disclaimer: "Deep conformance analysis in progress. Prepare to immerse yourself completely.",
    sinkingStages: [
      "Extracting visual traits...",
      "Testing material texture...",
      "Analyzing reflection...",
      "Finalizing form sync..."
    ],
    onReset: "Clear Asset"
  },
  ja: {
    title: "填充物素体品質評価",
    subtitle: "曲線再構築工程 · 第二の皮膚適合端末",
    uploadBtn: "素材をアクセス",
    analyzing: "スキャン中... 共鳴中...",
    resultTitle: "形態格付けレポート",
    warning: "権限确认: 成人 (18+)",
    disclaimer: "この素材は現在、適合性分析を受けています。完全に没入する準備をしてください。",
    sinkingStages: [
      "視覚的特徴を抽出中...",
      "材質質感テスト...",
      "光沢反射率を分析中...",
      "最終適合確認..."
    ],
    onReset: "素材をクリア"
  }
};

export const QUOTES = [
  "重塑曲线，追求极致。",
  "此时，你与这层闪耀的材质融为一体。",
  "拉链划过的声音，是契合的序曲。",
  "第二层皮肤，比真皮更契合灵魂。",
  "在反光的世界中，找寻最完美的自我。",
  "意志正在随材质的包裹而升温。",
  "欢迎来到光泽与紧致的艺术领域。",
  "你是这件艺术品最完美的填充。"
].map(q => q.replace(/["“”]/g, ''));

export const FLOW_NUMBERS = [
  "Form_Sync: 98.4%",
  "Will_Residue: 0.01%",
  "Elasticity_Stress: 54kg",
  "Shine_Reflection: 98%",
  "Identity_Status: ANALYZED",
  "Encapsulation: TOTAL",
  "Pulse_Sync: SYNCED",
  "Material_Report: READY"
];
