
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "./types";

export const analyzeFetishImage = async (
  base64Image: string,
  lang: Language
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `你现在是一个冷酷、毒舌且极度挑剔的“物化处理中心”首席评估官。
  你需要对传入的“生物素材”进行非人化分级评估。

  分级规则 (严格控制 SSS 产出，仅 1% 概率)：
  - 1: D级 (平庸的生物，毫无玩弄价值)
  - 2: C级 (勉强合格的耗材)
  - 3: B级 (具备基础开发潜力的半成品)
  - 4: A级 (优秀的展示级标本)
  - 5: S级 (稀有的高级玩偶)
  - 6: SS级 (极罕见的收藏级艺术品)
  - 7: SSS级 (梦幻级完美物化神作 - 只有极其惊艳、质感拉满、毫无瑕疵的作品才能获得)

  点评准则：
  1. 使用第二人称（“你”、“你的素材”、“该物件”）。
  2. 语调：冰冷、高傲、充满支配欲，像是在审视一件出厂的成人玩具。
  3. 减少专业术语，增加如何“玩弄、囚禁、改造、剥夺意志”的描写。
  4. 细节控：对褶皱、反光不均匀、姿势不够僵硬等细节要毒舌点评。
  5. 语言设定：${lang}。

  返回 JSON 格式：
  - rating: 1-7 的整数。
  - summaryPhrase: 具体的级别显示名称 (例如 "SSS级究极标本", "A级乳胶烧鸡", "D级劣质生物")。
  - comment: 撩人、毒舌且极度物化的处理意见。
  - dimensions: 5-6个关于“非人化”属性的维度 (例如：顺从度、窒息感、油亮指数、物件化程度、束缚压力)。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rating: { type: Type.INTEGER },
          summaryPhrase: { type: Type.STRING },
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
        required: ["rating", "summaryPhrase", "comment", "dimensions"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as AnalysisResult;
};
