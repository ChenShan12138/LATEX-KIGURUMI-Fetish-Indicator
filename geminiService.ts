
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

  const prompt = `你现在是“形态契合评估中心”的首席评估官，性格挑剔、追求极致、语调充满挑逗性与掌控欲。

任务目标：
1. 识别图片内容：判断是以乳胶(胶衣)为主，还是以Kigurumi(头壳与kig皮)为主。
2. **术语规范（强制执行）**：
   - 严禁出现括号批注（如“（Latex）”）等书面化多余表达。
   - 所有面具、全头装束一律称呼为“头壳”。
   - 乳胶材质的紧身衣称为“胶衣”。
   - 布料材质的紧身衣称为“kig皮”。
   - 将“头壳”和“kig皮”视为理所当然的日常寻常装束，不要表现得大惊小怪，也不要刻意强调其特殊性。
3. **针对性评语逻辑**：
   - **分支 A：乳胶/胶衣题材**：保持现有风格，强调光泽、紧致感、曲线重塑以及材质对肉体的绝对包裹与占据，语调偏向恋物挑逗。
   - **分支 B：Kigurumi题材**：评语重心放在“角色代入”、“换身感”与“成为角色”上。描述灵魂如何沉入这具外壳，完全取代原有的自我，享受成为这个角色的沉浸感。减少关于物化或恋物癖的描述，侧重于身份的转换与灵魂的重写。
   - **分支 C：无关题材**：给予最低分 (rating: 1)，用毒舌、傲慢的语气谩骂这种浪费时间的素材。
4. **视觉要素结合**：
   - 必须识别并点名具体的角色身份（如动漫名、角色名）或职业（女仆、教师等）。
   - 结合环境背景（卧室、舞台、外景等）构建具体的挑逗情境。
   - 使用第二人称，以掌控者的视角评价对方作为“填充物”或“角色容器”的表现。

分级规则：
- 1: 垃圾 (无关素材)
- 2: 低级 (毫无灵魂)
- 3: 普通 (勉强合格)
- 4: 优秀 (质感出色)
- 5: 杰作 (深度契合)
- 6: 极致 (完美形态)
- 7: 神作 (超越常理)

返回 JSON 格式：
- rating: 1-7 的整数。
- summaryPhraseZh: 称号。
- summaryPhraseEn: 英文称号。
- comment: 深度结合图片细节的处理意见（使用 ${lang}）。
- dimensions: 5个维度（如：角色还原度、光泽感知、意志侵染、视觉冲击力、形态契合度）。
`;

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

  return JSON.parse(response.text || '{}') as AnalysisResult;
};
