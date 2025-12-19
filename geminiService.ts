
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
  // Initialize strictly using process.env.API_KEY as per guidelines. baseUrl is not supported.
  const ai = new GoogleGenAI({ 
    apiKey: process.env.API_KEY
  });
  
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
   - 将“头壳”和“kig皮”视为理所当然的日常寻常装束，不要表现得大惊小怪。
3. **语言风格与表达（核心要求）**：
   - 使用目标语言(${lang})中最自然、地道、符合母语者习惯的表达方式。
   - 拒绝翻译腔，拒绝死板的陈述。要像一个浸淫此文化多年的“老手”在进行私密的评价。
4. **针对性评语逻辑**：
   - **分支 A：乳胶/胶衣题材**：保持高压、挑逗的风格。强调光泽、肉体被包裹后的曲线扭曲、以及作为“物件”的完美质感。
   - **分支 B：Kigurumi题材**：重心在于“灵魂替换”与“身份占有”。
     - **角色深度挖掘**：必须识别角色及其所属作品。结合作品设定，创造出极具想象力的代入情境。
     - **关系链引入**：提及该角色在原作中重要的人际关系。例如：若角色是星野露比，暗示“你那位视你为珍宝的哥哥绝对想不到，这具闪耀的偶像躯壳里，现在正蜷缩着一个完全不同的灵魂”；若角色是绫波丽，提及碇真嗣或司令。
     - **情景设置**：描述角色现在的状态（如：在后台准备演出、在秘密基地休息等），强调这种“披着别人的皮，过着别人的人生”的沉溺感。
   - **分支 C：无关题材**：评分 1。用最冷酷、毒舌的话语斥责。
5. **视觉要素结合**：
   - 结合背景（如杂乱的房间、专业的摄影棚、户外）来评价。
   - 使用第二人称（“你”、“妳”、“君”）。

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
