import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface KeigoAnalysis {
  isCorrect: boolean;
  category: '尊敬語' | '謙譲語' | '丁寧語' | '普通語' | '不適切';
  score: number; // 0-100
  explanation: string;
  suggestion?: string;
  examples?: string[];
}

interface KeigoPromptData {
  userInput: string;
  context: string;
  situation: string;
}

class KeigoJudgeService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',  // より安定したモデルに変更
      generationConfig: {
        temperature: 0.3,  // より一貫した結果のために温度を下げる
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 512,  // トークン数を制限してレスポンス時間を短縮
      }
    });
  }

  async analyzeKeigo(data: KeigoPromptData): Promise<KeigoAnalysis> {
    const prompt = this.createPrompt(data);
    
    // リトライ機能付きでGemini APIを呼び出し
    const maxRetries = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Gemini API 呼び出し試行 ${attempt}/${maxRetries}`);
        
        // リトライの場合は少し待機
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
        
        const result = await this.model.generateContent(prompt);
        const response = result.response.text();
        console.log('Gemini API 成功:', response.substring(0, 100) + '...');
        
        return this.parseResponse(response);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Gemini API エラー (試行 ${attempt}):`, lastError.message);
        
        // 503エラー（過負荷）の場合はリトライ
        if (lastError.message.includes('503') && attempt < maxRetries) {
          console.log(`Gemini API 過負荷エラー。${2000 * attempt}ms後にリトライします...`);
          continue;
        }
        
        // その他のエラーまたは最大試行回数に達した場合
        break;
      }
    }
    
    // すべてのリトライが失敗した場合
    throw lastError || new Error('Gemini API呼び出しに失敗しました');
  }

  private createPrompt(data: KeigoPromptData): string {
    return `
以下の日本語文章の敬語使用を分析してください。

文章: "${data.userInput}"
状況: ${data.situation}

以下のJSON形式で簡潔に回答してください（必ず「正しい敬語表現例」を含めてください）：
{
  "isCorrect": true/false,
  "category": "尊敬語"/"謙譲語"/"丁寧語"/"普通語"/"不適切",
  "score": 0-100の数値,
  "explanation": "簡潔な説明（50文字以内）",
  "suggestion": "改善提案（あれば）",
  "correctExample": "最も正しい敬語表現例"
}
`;
  }

  private parseResponse(response: string): KeigoAnalysis {
    try {
      // JSONの開始と終了を探す
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('JSONが見つかりません');
      }
      
      const jsonString = response.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonString);
      
      return {
        isCorrect: parsed.isCorrect || false,
        category: parsed.category || '不適切',
        score: Math.max(0, Math.min(100, parsed.score || 0)),
        explanation: parsed.explanation || '分析結果を取得できませんでした',
        suggestion: parsed.suggestion,
        examples: parsed.examples || []
      };
    } catch (error) {
      console.error('Response parsing error:', error);
      return {
        isCorrect: false,
        category: '不適切',
        score: 0,
        explanation: 'レスポンスの解析に失敗しました',
        suggestion: '再度お試しください',
        examples: []
      };
    }
  }

  // 事前定義されたシナリオでの練習用
  getScenarios() {
    return [
      {
        id: 'business-meeting',
        title: 'ビジネス会議',
        context: '重要な商談の場面',
        situation: '上司と顧客が同席している会議室'
      },
      {
        id: 'customer-service',
        title: '顧客対応',
        context: 'お客様からの問い合わせ対応',
        situation: '電話での顧客サービス'
      },
      {
        id: 'email-writing',
        title: 'メール作成',
        context: '社外への重要なメール',
        situation: '取引先への提案メール'
      },
      {
        id: 'presentation',
        title: 'プレゼンテーション',
        context: '役員への報告',
        situation: '四半期業績発表会'
      }
    ];
  }
}

export default KeigoJudgeService;
export type { KeigoAnalysis, KeigoPromptData };
