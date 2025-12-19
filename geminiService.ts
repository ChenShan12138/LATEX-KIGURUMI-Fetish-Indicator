
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
  const ai = new GoogleGenAI({ 
    apiKey: process.env.API_KEY as string
  });
  
  try {
    const compressedImage = await resizeImage(base64Image);
    const base64Data = compressedImage.split(',')[1];

    const prompt = `你现在是“填充物素体品质评估中心”的首席评估官，性格挑剔、追求极致、语调充满挑逗性与掌控欲。

任务目标：
1. 识别图片内容：判断是以乳胶(胶衣)为主，还是以Kigurumi(头壳与kig皮)为主。
2. **评价维度（分值0.0-10.0）**：
   - 精致：考察面具妆造、表情生动度、还原度、摄影构图与分辨率。
   - 质感：考察服饰/面具质感、胶衣光泽、光影处理、背景选择。
   - 张力：考察整体视觉艺术感、动作与构图的张力。
   - 协调：考察肢体控制、氛围感、身材比例（身材越瘦、比例越好分数越高）。
   - 诱惑：考察姿势的大胆/性暗示程度、配件（眼罩、口球、电击器、拘束具等）、表情（诶嘿颜等）。
3. **Tags要求（1-6个）**：
   - **严禁**使用：作品IP名、角色名、"头壳"、"kig皮"、"cosplay"、"乳胶"等平庸描述。
   - **必须**选择：极具挑逗性、令人兴奋的词汇，如“人偶化”、“发光玩物”、“呼吸限制”、“绝对禁锢”、“失智填充”、“视觉高潮”等。
4. **称号（summaryPhraseZh）**：
   - 必须包含一个称号文本，以及你想重点高亮（突出显示）的**唯一**一个关键词。高亮词必须是称号文本的一部分。
5. **总评对话（summaryDialogue）**：
   - 以评审人的口吻直接对着素体说的一句话。
   - 必须是最具侵略性、最精炼、最令人兴奋的一句话。绝对不要包含换行符。

**限制条件**：
- 禁止使用 Markdown 加粗语法。
- 返回纯文本评价，不得有前后空格或多余换行。

返回 JSON 格式：
- rating: 1-7 (整数)。
- summaryPhraseZh: 称号文本。
- summaryHighlightKeywords: [必须且只能包含一个关键词]。
- summaryPhraseEn: 英文称号。
- comment: 专业评价（纯文本，首行不留空格，AI内部处理不需要缩进，前端会处理）。
- summaryDialogue: 最精炼的挑逗对话（纯文本，绝对不要包含任何引号或换行）。
- tags: 挑逗性标签数组。
- dimensions: 包含固定名称（精致, 质感, 张力, 协调, 诱惑）及0-10分值的数组。
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
            summaryHighlightKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            summaryPhraseEn: { type: Type.STRING },
            comment: { type: Type.STRING },
            summaryDialogue: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
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
    // Force keyword list to contain only one element
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
    if ((error.status === 503 || error.message?.includes('503') || error.message?.includes('Rpc failed')) && attempt < 3) {
      console.warn(`Attempt ${attempt} failed. Retrying...`);
      await delay(attempt * 2000);
      return analyzeFetishImage(base64Image, lang, attempt + 1);
    }
    throw error;
  }
};
