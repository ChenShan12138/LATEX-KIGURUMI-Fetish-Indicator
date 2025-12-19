
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

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// @google/genai Guideline: Always use process.env.API_KEY exclusively.
// The GoogleGenAI instance must be initialized with only the apiKey property.
export const analyzeFetishImage = async (
  base64Image: string,
  lang: Language,
  attempt: number = 1
): Promise<AnalysisResult> => {
  // Initialize the AI client with the mandatory API key.
  const ai = new GoogleGenAI({ 
    apiKey: process.env.API_KEY as string
  });
  
  try {
    const compressedImage = await resizeImage(base64Image);
    const base64Data = compressedImage.split(',')[1];

    const prompt = `你现在是“形态契合评估中心”的首席评估官，性格挑剔、追求极致、语调充满挑逗性与掌控欲。

任务目标：
1. 识别图片内容：判断是以乳胶(胶衣)为主，还是以Kigurumi(头壳与kig皮)为主。
2. **术语规范（强制执行）**：
   - 严禁出现括号批注（如“（Latex）”）等书面化多余表达。
   - 所有面具、全头装束一律称呼为“头壳”。
   - 乳胶材质的紧身衣称为“胶衣”。
   - 布料材质的紧身衣称为“kig皮”。
3. **针对性评语逻辑**：
   - **乳胶题材**：强调光泽、肉体被包裹后的曲线、以及作为“物件”的质感。
   - **Kigurumi题材**：重心在于“角色代入”。识别角色及作品，提及原作关系链，创造沉溺感。
   - **无关题材**：评分 1。用冷酷的话语斥责。

返回 JSON 格式：
- rating: 1-7 的整数。
- summaryPhraseZh: 称号。
- summaryPhraseEn: 英文称号。
- comment: 评价。
- dimensions: 5个维度（如：角色还原度、光泽感知、视觉冲击力等）。
`;

    // @google/genai Guideline: Use ai.models.generateContent directly with model name and contents.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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

    // @google/genai Guideline: Access the text property directly (not a method).
    return JSON.parse(response.text || '{}') as AnalysisResult;

  } catch (error: any) {
    // Handle 503 Service Unavailable with retries
    if ((error.status === 503 || error.message?.includes('503') || error.message?.includes('Rpc failed')) && attempt < 3) {
      console.warn(`Attempt ${attempt} failed with 503. Retrying in ${attempt * 2}s...`);
      await delay(attempt * 2000);
      return analyzeFetishImage(base64Image, lang, attempt + 1);
    }
    throw error;
  }
};
