import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { existingTopics } = await request.json();
    
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
日本語の敬語学習用の新しいトピックを1つ生成してください。

既存のトピック（重複を避けてください）:
${existingTopics.join(', ')}

以下のJSON形式で回答してください：
{
  "topic": "○○敬語",
  "question": "具体的なシチュエーションでの敬語の質問",
  "hint": "学習者へのヒント"
}

要件：
- 日常生活やビジネスシーンで実際に使える実用的なシチュエーション
- 親しみやすく、面白みのある設定
- 既存のトピックとは異なる新しい視点
- 敬語（尊敬語、謙譲語、丁寧語）の学習に役立つ内容
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // JSONを抽出
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const topicData = JSON.parse(jsonMatch[0]);
      return NextResponse.json(topicData);
    } else {
      throw new Error('Invalid response format');
    }

  } catch (error: unknown) {
    console.error('AI topic generation error:', error);
    
    // フォールバック用のランダムトピック
    const fallbackTopics = [
      {
        topic: '病院敬語',
        question: '病院の受付で「診察券をお持ちですか？」を丁寧に言うと？',
        hint: 'お客様（患者様）に対する最上級の敬語を考えてみましょう'
      },
      {
        topic: '美容院敬語',
        question: '美容師さんに「もう少し短くしてください」を敬語で言ってみて！',
        hint: 'プロの技術者に対する敬意を込めた表現'
      },
      {
        topic: '銀行敬語',
        question: '銀行窓口で「口座を作りたいです」をもっと丁寧に！',
        hint: '金融機関での正式な手続きの場面'
      }
    ];
    
    const randomFallback = fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];
    return NextResponse.json(randomFallback);
  }
}
