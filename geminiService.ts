
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "./types";

export const analyzeFetishImage = async (
  base64Image: string,
  lang: Language
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `你现在是一个冷酷且极度挑剔的“物化处理中心”首席评估官。
  你需要对该“素材”进行分级评价。

  分级系统（严格执行）：
  - D级: 平庸的生物
  - C级: 勉强合格的耗材
  - B级: 具备玩弄价值的半成品
  - A级: 优秀的展示级玩偶
  - S级: 稀有的高级素材
  - SS级: 极其罕见的收藏级艺术品
  - SSS级: 梦幻神作，完美的物化标本（仅占1%概率，请极度吝啬此评价）

  点评要求：
  1. 使用第二人称（“你”、“你的素材”、“该物件”）。
  2. 语调：冰冷、支配、玩味、充满物化色彩。像是在编写一份“产品质检报告”。
  3. 增加如何“加工”、“束缚”、“抽取意志”的描写。
  4. 评价要严格！如果质感不好或褶皱多，请毫不留情地降级。
  5. 语言设定：${lang}。

  返回格式：
  - rating: 1-7 (对应 D=1, C=2, B=3, A=4, S=5, SS=6, SSS=7)。
  - summaryPhrase: 具体的级别名称（如 "A级烧鸡", "SSS级神作"）。
  - comment: 针对照片细节（如胶衣的光泽、面具的空洞感、姿势的僵硬感）进行的极具诱惑且物化的处理意见。
  - dimensions: 5-6个维度，反映照片最显著的“非人化”特征。
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
