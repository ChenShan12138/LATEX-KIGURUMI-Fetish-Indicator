
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "./types";

/**
 * Resizes an image to ensure it doesn't exceed a certain dimension or payload size.
 * Large images often cause 500 errors in proxy environments.
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

/**
 * Analyze the provided image using Gemini for padding body assessment.
 * Follows strict environment variable rules for API key management.
 */
export const analyzeFetishImage = async (
  base64Image: string,
  lang: Language
): Promise<AnalysisResult> => {
  // Always use process.env.API_KEY as the exclusive source for initialization.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Resize image to prevent potential 500/Rpc errors due to payload size
  const compressedImage = await resizeImage(base64Image);
  const base64Data = compressedImage.split(',')[1];

  const prompt = `你现在是一个极度挑剔、充满掌控欲且语调暧昧挑逗的“素体品质评估中心”首席评估官。
  你需要对传入的“生物素材”进行非人化的素体分级评估。

  分级规则 (严格控制 SSS 产出，仅 1% 概率)：
  - 1: D级 (平庸的生物，毫无开发价值的残次品)
  - 2: C级 (勉强合格的低级耗材)
  - 3: B级 (具备基础开发潜力的半成品)
  - 4: A级 (优秀的展示级标本)
  - 5: S级 (稀有的高级人偶，完美契合材质质感)
  - 6: SS级 (令人窒息的艺术品，几乎完全转化为填充物的杰作)
  - 7: SSS级 (神圣的人偶神作，不再有灵魂，只有极致的反射与完美的形态)

  点评准则：
  1. 使用第二人称（“你”、“我的乖乖”、“该素体”）。
  2. 语调：更具露骨的挑逗感、暧昧的危险气息、以及极强的征服欲。绝对禁止使用“物化”这类直接的术语，请使用更加具有情趣和暗示性的表达。
  3. 强调乳胶/胶衣/Kigurumi带来的独特快感：皮肤被剥夺的窒息感、汗水在胶皮下流动的燥热、完全转化为“娃娃”、“模具”或“人偶”的无助感。
  4. 交互感：在点评中穿插命令句或反问句（如“你还记得怎么呼吸吗？”“是不是感觉自己正在变成一个精致的填充玩偶？”）。
  5. 细节控：对褶皱、反光、紧绷感、面具后的空洞眼神、填充物的饱满度进行带有强烈个人情感色彩的点评。
  6. 核心词汇：必须频繁使用“娃娃”、“人偶”、“填充物”、“素体”、“模具”、“标本”、“皮革后的灵魂”等词汇。
  7. 语言设定：${lang}。

  返回 JSON 格式：
  - rating: 1-7 的整数。
  - summaryPhrase: 具体的称号名称。注意：不要包含“A级：”或“S级：”这种前缀，直接给名称 (例如 "窒息感溢出的完美娃娃", "意志消融的黑色人偶")。
  - comment: 充满张力、挑逗且极度人偶化的处理意见。
  - dimensions: 5个关于“人偶化”属性的维度 (例如：意志剥夺度、填充饱满度、感官孤立度、素体契合度、束缚压力)。
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
