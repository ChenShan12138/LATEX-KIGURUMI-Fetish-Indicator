
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "./types";

/**
 * Resizes an image to ensure it doesn't exceed a certain dimension or payload size.
 */
const resizeImage = (base64Str: string, maxDimension: number = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};

export const analyzeFetishImage = async (
  base64Image: string,
  lang: Language
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const compressedImage = await resizeImage(base64Image);
  const base64Data = compressedImage.split(',')[1];

  const prompt = `你现在是一个极度挑剔、充满掌控欲且语调暧昧挑逗的“素体品质评估中心”首席评估官。
  你需要对传入的“生物素材”进行非人化的素体分级评估。

  分级规则 (严格控制 SSS 产出，仅 1% 概率)：
  - 1: D级 (残次品)
  - 2: C级 (低级耗材)
  - 3: B级 (半成品)
  - 4: A级 (优秀标本)
  - 5: S级 (高级人偶)
  - 6: SS级 (人偶杰作)
  - 7: SSS级 (神圣的人偶神作)

  点评准则：
  1. 使用第二人称。语调暧昧、挑逗、具有掌控欲。
  2. 强调乳胶、Kigurumi带来的窒息感、汗水、以及转化为“填充物”或“人偶”的无助快感。
  3. 核心词汇：娃娃、人偶、填充物、素体、模具、标本。
  4. 语言设定：主要评语使用 ${lang}。

  返回 JSON 格式：
  - rating: 1-7 的整数。
  - summaryPhraseZh: 具有冲击力的中文称号 (例如 "意志消融的黑色人偶")。
  - summaryPhraseEn: 对应的英文称号 (例如 "VOID-DRIVEN BLACK MANNEQUIN")。
  - comment: 充满张力的处理意见。
  - dimensions: 5个维度 (例如：意志剥夺度、填充饱满度、感官孤立度、素体契合度、束缚压力)。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rating: { type: Type.INTEGER },
          summaryPhraseZh: { type: Type.STRING },
          summaryPhraseEn: { type: Type.STRING },
          comment: { type: Type.STRING },
          dimensions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.NUMBER }
              },
              required: ["name", "value"]
            }
          }
        },
        required: ["rating", "summaryPhraseZh", "summaryPhraseEn", "comment", "dimensions"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as AnalysisResult;
};
