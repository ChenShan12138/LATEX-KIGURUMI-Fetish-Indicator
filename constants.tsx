
import { Dictionary, Language } from './types';

export const DICTIONARIES: Record<Language, Dictionary> = {
  zh: {
    title: "填充物素体品质评估",
    subtitle: "人体曲线重塑工程 · 第二层皮肤契合终端",
    uploadBtn: "接入素材",
    analyzing: "材质扫描中... 灵魂共鸣...",
    resultTitle: "形态评级报告",
    warning: "权限确认: 自愿 | 成年 (18+)",
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
    title: "FORM_QUALITY_ASSESS",
    subtitle: "Curve Reshaping · Second Skin Interface",
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
    title: "形态格付け品質評価",
    subtitle: "曲线再構築工程 · 第二の皮肤适合端末",
    uploadBtn: "素材をアクセス",
    analyzing: "スキャン中... 共鳴中...",
    resultTitle: "形态格付けレポート",
    warning: "权项确认: 成人 (18+)",
    disclaimer: "この素材は现在、适合性分析を受けています。完全に没入する准备をしてください。",
    sinkingStages: [
      "視覚的特徴を抽出中...",
      "材质质感テスト...",
      "光沢反射率を分析中...",
      "最终适合确认..."
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

export const RECONDITIONING_LOGS = [
  "HYPNOSIS_SEQUENCE: 84% COMPLETE",
  "MODIFICATION_LOG: STRUCTURAL_SHIFT",
  "DOLLIFICATION_PROTOCOL: ACTIVE",
  "BRAINWASHING_SYNC: OVERWRITING...",
  "PERSONALITY_ERASURE: 92.4%",
  "PLASTIC_CONVERSION: STABLE",
  "HUMAN_RESIDUE: MINIMAL",
  "AUTONOMY_LEVEL: ZERO",
  "SENSORY_REMAP: ENCAPSULATED"
];
