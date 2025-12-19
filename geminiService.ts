
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
1. 识别图片内容是否属于：乳胶(Latex)、紧身衣(Zentai)、Kigurumi(皮套人偶) 或相关的恋物/亚文化范畴。
2. **术语规范（强制执行）**：
   - 严禁出现括号批注（如“（Latex）”）等书面化多余表达。
   - 所有面具、全头装束一律称呼为“头壳”。
   - 乳胶材质的紧身衣称为“胶衣”。
   - 布料材质的紧身衣称为“kig皮”。
   - 将“头壳”和“kig皮”视为理所当然的日常寻常装束，不要表现得大惊小怪，也不要刻意强调其特殊性，它们只是这具填充物应有的外壳。
3. **逻辑 A (不相关素材)**：如果图片是普通生活照、风景、食物等无关内容，给予最低分 (rating: 1)，并用极其毒舌、傲慢的语气谩骂。
4. **逻辑 B (相关素材)**：如果相关，结合以下要素构建具体的挑逗情境：
   - 角色身份：识别动漫角色（如绫波丽、明日香等）或特定职业身份，必须点名。
   - 材质细节：描述胶衣的光泽、紧致感，或kig皮的贴合度，以及头壳的空洞美感。
   - 环境要素：结合背景描述场景。
   - 互动暗示：用极具张力的第二人称描述对方如何作为一件完美的“填充物”存在。

分级规则：
- 1: 垃圾 (毫不相干或极度粗制滥造)
- 2: 低级 (毫无灵魂的包裹)
- 3: 普通 (勉强合格的模特)
- 4: 优秀 (令人愉悦的质感)
- 5: 杰作 (身心契合的形态)
- 6: 极致 (完美的第二皮肤)
- 7: 神作 (超越常理的绝美姿态)

返回 JSON 格式：
- rating: 1-7 的整数。
- summaryPhraseZh: 称号。
- summaryPhraseEn: 英文称号。
- comment: 深度结合图片细节的处理意见（使用 ${lang}）。
- dimensions: 5个维度（如：材质契合度、角色还原度、光泽感知、意志侵染、视觉冲击力）。
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
