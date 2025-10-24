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

    const modelName = process.env.GENERATIVE_MODEL || 'models/gemini-2.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
日本語の敬語学習用の新しいトピックを1つ生成してください。

既存のトピック（重複を避けてください）:
${existingTopics.join(', ')}

以下のJSON形式で回答してください：
{
  "topic": "○○敬語",
  "question": "具体的なシチュエーションでの敬語の質問",
  "hint": "学習者へのヒント",
  "answer": "最も適切な敬語表現",
  "alternatives": ["他の正解例1", "他の正解例2"],
  "explanation": "敬語の種類と使う理由の詳しい説明",
  "category": "尊敬語/謙譲語/丁寧語"
}

要件：
- 日常生活やビジネスシーンで実際に使える実用的なシチュエーション
- 親しみやすく、面白みのある設定
- 既存のトピックとは異なる新しい視点
- 敬語（尊敬語、謙譲語、丁寧語）の学習に役立つ内容
- answerは実際に使える最も自然な敬語表現
- alternativesは同じ場面で使える他の敬語表現（2つ）
- explanationは敬語の種類、なぜその表現を使うか、相手への敬意を詳しく説明
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
        hint: 'お客様（患者様）に対する最上級の敬語を考えてみましょう',
        answer: '診察券をお持ちでいらっしゃいますでしょうか',
        alternatives: ['診察券はお持ちでございますか', '診察券をご持参いただいておりますでしょうか'],
        explanation: '「お持ちでいらっしゃる」は尊敬語、「でしょうか」で丁寧な疑問形になります',
        category: '尊敬語'
      },
      {
        topic: '美容院敬語',
        question: '美容師さんに「もう少し短くしてください」を敬語で言ってみて！',
        hint: 'プロの技術者に対する敬意を込めた表現',
        answer: 'もう少し短くしていただけますでしょうか',
        alternatives: ['もう少し短めにお願いできますでしょうか', 'もう少し短くお切りいただけますか'],
        explanation: '「していただく」は謙譲語で、相手への敬意を表現できます',
        category: '謙譲語'
      },
      {
        topic: '銀行敬語',
        question: '銀行窓口で「口座を作りたいです」をもっと丁寧に！',
        hint: '金融機関での正式な手続きの場面',
        answer: '口座を開設させていただきたいのですが',
        alternatives: ['新規口座の開設をお願いしたいのですが', '口座開設の手続きをさせていただけますでしょうか'],
        explanation: '「開設」という正式な用語と「させていただく」の謙譲語を使用',
        category: '謙譲語'
      }
    ];
    
    const randomFallback = fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];
    return NextResponse.json(randomFallback);
  }
}
