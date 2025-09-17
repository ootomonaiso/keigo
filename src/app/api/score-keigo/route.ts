import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { userText, context } = await request.json();
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Keyが設定されていません' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
以下のユーザーの敬語表現を詳しく採点してください。

【ユーザーの入力】
"${userText}"

【文脈・シチュエーション】
${context || '一般的なビジネス・接客シーン'}

以下のJSON形式で回答してください（必ず「正しい敬語表現例」を含めてください）：
{
  "score": 85,
  "category": "謙譲語",
  "isCorrect": true,
  "explanation": "詳しい解説",
  "goodPoints": ["良い点1", "良い点2"],
  "improvements": ["改善点1", "改善点2"],
  "betterExpressions": ["より良い表現1", "より良い表現2"],
  "grammarCheck": "文法的な指摘があれば",
  "correctExample": "最も正しい敬語表現例"
}

採点基準：
- 100点: 完璧な敬語（尊敬語・謙譲語・丁寧語が適切に使われている）
- 80-99点: とても良い敬語（少し改善の余地がある）
- 60-79点: 一般的な敬語レベル（基本はできているが向上が必要）
- 40-59点: 敬語の使い方に問題がある
- 20-39点: 敬語として不適切
- 0-19点: 敬語になっていない

要件：
- scoreは0-100の数値
- categoryは「尊敬語」「謙譲語」「丁寧語」「普通語」「不適切」のいずれか
- isCorrectは敬語として適切かどうかのboolean
- explanationは敬語の種類と評価理由の詳しい説明
- goodPointsは良かった点（配列）
- improvementsは改善点（配列）
- betterExpressionsはより良い表現の提案（配列）
- grammarCheckは文法的な問題があれば指摘（なければ空文字）
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // JSONを抽出
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const scoreData = JSON.parse(jsonMatch[0]);
      return NextResponse.json(scoreData);
    } else {
      throw new Error('Invalid response format');
    }

  } catch (error: unknown) {
    console.error('AI keigo scoring error:', error);
    
    // フォールバック用の簡易採点
    const { userText } = await request.json(); // userTextを再取得
    const hasPolite = userText.includes('です') || userText.includes('ます') || userText.includes('ございます');
    const hasHonorific = userText.includes('いらっしゃる') || userText.includes('なさる') || userText.includes('れる') || userText.includes('られる');
    const hasHumble = userText.includes('申し上げ') || userText.includes('させていただ') || userText.includes('伺') || userText.includes('拝見');
    
    let score = 30;
    let category = '普通語';
    let isCorrect = false;
    
    if (hasHumble) {
      score = 85;
      category = '謙譲語';
      isCorrect = true;
    } else if (hasHonorific) {
      score = 85;
      category = '尊敬語';
      isCorrect = true;
    } else if (hasPolite) {
      score = 70;
      category = '丁寧語';
      isCorrect = true;
    }
    
    const fallbackScore = {
      score,
      category,
      isCorrect,
      explanation: `${category}が使われています。${isCorrect ? '適切な敬語表現です。' : 'もう少し丁寧な表現を心がけましょう。'}`,
      goodPoints: isCorrect ? [`${category}を適切に使用`] : [],
      improvements: isCorrect ? [] : ['「です・ます」を使ってより丁寧に'],
      betterExpressions: [],
      grammarCheck: ''
    };
    
    return NextResponse.json(fallbackScore);
  }
}
