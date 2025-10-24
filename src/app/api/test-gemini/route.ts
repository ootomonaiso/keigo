import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Keyが設定されていません', apiKey: 'not set' },
        { status: 500 }
      );
    }

    // API Keyの存在確認
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey.length);
    
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GENERATIVE_MODEL || 'models/gemini-2.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

    const startTime = Date.now();
    
    // 簡単なテストプロンプト
    const testPrompt = `
簡単なテストです。以下のJSON形式で回答してください：
{
  "test": "成功",
  "message": "Gemini APIが正常に動作しています"
}
`;

    console.log('Sending request to Gemini...');
    const result = await model.generateContent(testPrompt);
    const endTime = Date.now();
    
    const response = result.response.text();
    console.log('Gemini response received in:', endTime - startTime, 'ms');
    console.log('Response:', response);

    return NextResponse.json({
      success: true,
      apiKeySet: true,
      apiKeyLength: apiKey.length,
      responseTime: endTime - startTime,
      geminiResponse: response,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('Gemini test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'テスト失敗', 
        details: errorMessage,
        stack: errorStack
      },
      { status: 500 }
    );
  }
}
