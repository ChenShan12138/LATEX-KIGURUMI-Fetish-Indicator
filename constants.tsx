
import { Dictionary, Language } from './types';

export const DICTIONARIES: Record<Language, Dictionary> = {
  zh: {
    title: "填充物素体品质评估",
    subtitle: "人体形态塑形工程 · 第二层皮肤重塑终端",
    uploadBtn: "接入素材",
    analyzing: "真空泵运转中... 意志抽取...",
    resultTitle: "素材评级报告",
    warning: "权限确认: 成年/自愿 (18+)",
    disclaimer: "系统正在对该物件进行非人化评估。请确保您已准备好放弃主权。",
    sinkingStages: [
      "正在移除生物特征...",
      "材质完美度检测...",
      "意志残留清除中...",
      "最终人偶化封装..."
    ],
    onReset: "清除素材"
  },
  en: {
    title: "BODY PADDING ASSESSMENT",
    subtitle: "Form Liquefaction · Reshaping Terminal",
    uploadBtn: "ACCESS ASSET",
    analyzing: "PUMPING... EXTRACTING WILL...",
    resultTitle: "ASSET CLASSIFICATION",
    warning: "AUTH: ADULT (18+)",
    disclaimer: "Dehumanization assessment in progress. Subject is treated as material.",
    sinkingStages: [
      "Removing bio-traits...",
      "Testing material fit...",
      "Clearing identity residuals...",
      "Final objectification..."
    ],
    onReset: "Clear Asset"
  },
  ja: {
    title: "填充物素体品質評価",
    subtitle: "人間性液化工程 · 第二の皮膚再構築端末",
    uploadBtn: "素材をアクセス",
    analyzing: "真空引き中... 意志を抽出中...",
    resultTitle: "素材格付けレポート",
    warning: "権限确认: 成人 (18+)",
    disclaimer: "このオブジェクトは现在、非人间化评価を受けています。",
    sinkingStages: [
      "生物学的特徴を削除中...",
      "材质适合テスト...",
      "自我の残滓を消去中...",
      "最终的な物件化..."
    ],
    onReset: "素材をクリア"
  }
};

export const QUOTES = [
  "消解人格，重塑完美。",
  "此时，你不再是人，只是一层闪耀的材质。",
  "真空泵的声音，是你唯一的呼吸节奏。",
  "第二层皮肤，比真皮更值得信任。",
  "黑色的深邃中，只有你被人偶化的躯壳。",
  "意志正在被拉链锁死在黑暗中。",
  "欢迎来到无需思考的标本世界。",
  "你是被精密加工过的、最完美的耗材。"
].map(q => q.replace(/["“”]/g, ''));

export const FLOW_NUMBERS = [
  "Form_Sync: 98.4%",
  "Will_Residue: 0.01%",
  "Elasticity_Stress: 54kg",
  "Shine_Reflection: 98%",
  "Identity_Status: DELETED",
  "Encapsulation: TOTAL",
  "Pulse_Sync: CONTROLLED",
  "Material_Report: READY"
];
