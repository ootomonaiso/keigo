import { NextRequest, NextResponse } from 'next/server';
import KeigoJudgeService, { type KeigoPromptData } from '@/services/keigoJudge';

export async function POST(request: NextRequest) {
  try {
    const body: KeigoPromptData = await request.json();
    
    // 入力値の検証
    if (!body.userInput || !body.context || !body.situation) {
      return NextResponse.json(
        { error: '必要な情報が不足しています' },
        { status: 400 }
      );
    }

    console.log('Analyzing keigo:', body.userInput);
    
    // タイムアウト設定（30秒）
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000);
    });

    const judgeService = new KeigoJudgeService();
    
    try {
      const analysis = await Promise.race([
        judgeService.analyzeKeigo(body),
        timeoutPromise
      ]);
      
      console.log('Analysis completed successfully');
      return NextResponse.json(analysis);
    } catch (apiError) {
      console.error('Gemini API Error:', apiError);
      
      // Gemini APIが利用できない場合のフォールバック
      const fallbackAnalysis = {
        isCorrect: body.userInput.includes('です') || body.userInput.includes('ます') || body.userInput.includes('ございます'),
        category: (body.userInput.includes('いらっしゃる') || body.userInput.includes('なさる')) ? '尊敬語' :
                 (body.userInput.includes('申し上げ') || body.userInput.includes('させていただ')) ? '謙譲語' :
                 (body.userInput.includes('です') || body.userInput.includes('ます')) ? '丁寧語' : '普通語' as const,
        score: calculateScore(body.userInput),
        explanation: '⚠️ AI分析は一時的に利用できません。簡易判定: ' + 
                    getSimpleAnalysis(body.userInput),
        suggestion: getSuggestion(body.userInput)
      };
      
      return NextResponse.json(fallbackAnalysis);
    }

function calculateScore(text: string): number {
  let score = 50; // ベーススコア
  if (text.includes('です') || text.includes('ます')) score += 20;
  if (text.includes('ございます')) score += 15;
  if (text.includes('いらっしゃる') || text.includes('なさる')) score += 10;
  if (text.includes('申し上げ') || text.includes('させていただ')) score += 10;
  return Math.min(100, score);
}

function getSimpleAnalysis(text: string): string {
  if (text.includes('ございます')) return '丁寧語が適切に使用されています。';
  if (text.includes('です') || text.includes('ます')) return '基本的な丁寧語が使用されています。';
  return '丁寧語の使用をお勧めします。';
}

function getSuggestion(text: string): string | undefined {
  if (!text.includes('です') && !text.includes('ます') && !text.includes('ございます')) {
    return '文末に「です・ます」を追加してより丁寧な表現にしてみてください。';
  }
  return undefined;
}

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const judgeService = new KeigoJudgeService();
    const scenarios = judgeService.getScenarios();
    
    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'シナリオの取得に失敗しました' },
      { status: 500 }
    );
  }
}
