
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "./types";

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

export const analyzeFetishImage = async (
  base64Image: string,
  lang: Language,
  attempt: number = 1
): Promise<AnalysisResult> => {
  // CRITICAL: Create fresh instance every time to use the up-to-date API Key from the selection dialog
  const ai = new GoogleGenAI({ 
    apiKey: process.env.API_KEY as string
  });
  
  try {
    const compressedImage = await resizeImage(base64Image);
    const base64Data = compressedImage.split(',')[1];

    const prompt = `你现在是“填充物素体品质评估中心”的首席评估官，性格挑剔、追求极致、语调充满挑逗性与掌控欲。

任务目标：
1. 识别图片内容：判断是以乳胶(胶衣)为主，还是以Kigurumi为主。
2. **评价维度（分值0.0-10.0）**：
   - 精致：考察妆造、表情、还原度、构图。
   - 质感：考察材质质感、光泽、光影处理。
   - 张力：考察整体视觉艺术感、动作构图。
   - 协调：考察肢体控制、氛围感、身材比例（身材越瘦、比例越好分数越高）。
   - 诱惑：考察姿势暗示程度、配件（眼罩、口球、电击器、拘束具等）、表情。
3. **Tags要求（1-6个）**：
   - 使用极具挑逗性、令受众兴奋的词汇，如“人偶化”、“发光玩物”、“绝对禁锢”、“失智填充”、“视觉高潮”等。
4. **称号（summaryPhraseZh）**：
   - 包含一个称号文本及一个高亮关键词。
5. **总评对话（summaryDialogue）**：
   - 以评审人的口吻直接对着素体说的一句话。最具侵略性、最精炼。

限制条件：禁止使用 Markdown 加粗，返回纯 JSON。`;

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
            summaryHighlightKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            summaryPhraseEn: { type: Type.STRING },
            comment: { type: Type.STRING },
            summaryDialogue: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
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
          required: ["rating", "summaryPhraseZh", "summaryHighlightKeywords", "summaryPhraseEn", "comment", "summaryDialogue", "tags", "dimensions"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const keywords = parsed.summaryHighlightKeywords || [];
    const finalKeywords = keywords.length > 0 ? [keywords[0]] : [];

    return {
      ...parsed,
      summaryHighlightKeywords: finalKeywords,
      summaryPhraseZh: parsed.summaryPhraseZh?.trim() || "",
      summaryDialogue: parsed.summaryDialogue?.trim().replace(/["“”]/g, '') || "",
      comment: parsed.comment?.trim() || "",
    } as AnalysisResult;

  } catch (error: any) {
    if (attempt < 3 && (error.status === 503 || error.message?.includes('503') || error.message?.includes('Rpc failed'))) {
      await delay(attempt * 2000);
      return analyzeFetishImage(base64Image, lang, attempt + 1);
    }
    throw error;
  }
};
