'use client'

import { useState, useEffect } from 'react'

interface KeigoAnalysis {
  isCorrect: boolean
  category: '尊敬語' | '謙譲語' | '丁寧語' | '普通語' | '不適切'
  score: number
  explanation: string
  suggestion?: string
  examples?: string[]
}

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  analysis?: KeigoAnalysis
}

const KEIGO_TOPICS = [
  {
    topic: 'コンビニ敬語',
    question: 'コンビニで「温めますか？」を敬語で言ってみて！',
    hint: 'お客様に対する丁寧な表現を考えてみましょう'
  },
  {
    topic: 'ファミレス敬語',
    question: 'ファミレスで「お席にご案内します」の前に何て言う？',
    hint: 'お客様をお迎えする最初の一言'
  },
  {
    topic: '電話敬語',
    question: '電話に出るとき「はい、○○です」じゃダメ？もっと丁寧に！',
    hint: '会社の代表として電話に出る場面'
  },
  {
    topic: 'エレベーター敬語',
    question: 'エレベーターで上司に「お疲れ様」以外の挨拶は？',
    hint: '時間帯や状況に応じた敬語表現'
  },
  {
    topic: 'メール敬語',
    question: 'メールで「ありがとうございました」より丁寧な表現は？',
    hint: 'ビジネスメールでよく使われる感謝の敬語'
  },
  {
    topic: '謝罪敬語',
    question: '「すみません」を超丁寧に言うと？',
    hint: '深くお詫びする場面での表現'
  }
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Hydration問題を解決するため、useEffectで初期メッセージを設定
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: '敬語チャットへようこそ！🎌\n\n日常の面白い敬語ネタで練習しましょう！\n「ネタちょうだい」と言ってもらえれば、ランダムで敬語のお題を出しますよ〜',
        sender: 'assistant',
        timestamp: new Date()
      }
    ])
  }, [])

  const getRandomTopic = () => {
    return KEIGO_TOPICS[Math.floor(Math.random() * KEIGO_TOPICS.length)]
  }

  const analyzeKeigo = async (text: string): Promise<KeigoAnalysis | null> => {
    // 簡易的な敬語分析（フォールバック）
    const hasPolite = text.includes('です') || text.includes('ます') || text.includes('ございます')
    const hasHonorific = text.includes('いらっしゃる') || text.includes('なさる') || text.includes('お～になる') || text.includes('ご～になる')
    const hasHumble = text.includes('申し上げ') || text.includes('させていただ') || text.includes('伺') || text.includes('拝見')
    
    let category: KeigoAnalysis['category'] = '普通語'
    let score = 50
    
    if (hasHumble) {
      category = '謙譲語'
      score = 85
    } else if (hasHonorific) {
      category = '尊敬語'
      score = 85
    } else if (hasPolite) {
      category = '丁寧語'
      score = 75
    }
    
    return {
      isCorrect: hasPolite || hasHonorific || hasHumble,
      category,
      score,
      explanation: `${category}が使われています！`,
      suggestion: score < 70 ? '「です・ます」を使ってもう少し丁寧にしてみましょう' : undefined
    }
  }

  const generateResponse = (userInput: string, analysis: KeigoAnalysis | null): string => {
    const input = userInput.toLowerCase()
    
    // ネタリクエスト
    if (input.includes('ネタ') || input.includes('お題') || input.includes('問題') || input.includes('ちょうだい')) {
      const topic = getRandomTopic()
      return `【${topic.topic}】\n\n${topic.question}\n\n💡 ${topic.hint}`
    }
    
    // 挨拶
    if (input.includes('こんにちは') || input.includes('はじめまして') || input.includes('よろしく')) {
      return 'こんにちは！敬語マスターを目指して一緒に頑張りましょう！\n\n「ネタちょうだい」と言ってもらえれば、面白い敬語のお題を出しますよ〜'
    }
    
    // 敬語分析結果
    if (analysis) {
      let response = `【敬語チェック結果】\n`
      response += `種類: ${analysis.category}\n`
      response += `スコア: ${analysis.score}点\n\n`
      
      if (analysis.score >= 80) {
        response += '素晴らしい！完璧な敬語ですね！✨\n\n'
      } else if (analysis.score >= 70) {
        response += 'いいですね！もう少しで完璧です！👍\n\n'
      } else {
        response += 'もう少し丁寧にできそうですね💪\n\n'
      }
      
      if (analysis.suggestion) {
        response += `💡 アドバイス: ${analysis.suggestion}\n\n`
      }
      
      response += '他にも試してみませんか？「ネタちょうだい」でお題を出しますよ！'
      return response
    }
    
    // デフォルト応答
    return 'なるほど〜！他にも敬語を試してみませんか？\n\n「ネタちょうだい」と言ってもらえれば新しいお題を出しますよ〜'
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    setIsLoading(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    // 敬語分析（簡易版）
    const analysis = await analyzeKeigo(inputText)
    if (analysis) {
      userMessage.analysis = analysis
    }

    // アシスタントの応答
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: generateResponse(inputText, analysis),
      sender: 'assistant',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setIsLoading(false)
    setInputText('')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case '尊敬語': return '👑'
      case '謙譲語': return '🙇‍♂️'
      case '丁寧語': return '😊'
      case '普通語': return '😐'
      case '不適切': return '😅'
      default: return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <h1 className="text-2xl font-bold">敬語チャット 🎌</h1>
            <p className="text-blue-100">楽しく敬語を学ぼう！</p>
          </div>

          {/* メッセージエリア */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {/* 敬語分析結果 */}
                  {message.analysis && (
                    <div className="mt-3 p-3 bg-white bg-opacity-20 rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryEmoji(message.analysis.category)}</span>
                        <span className="text-sm font-medium text-black">{message.analysis.category}</span>
                        <span className={`text-sm font-bold ${getScoreColor(message.analysis.score)}`}>
                          {message.analysis.score}点
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs opacity-70 mt-2 text-black">
                    {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString() : ''}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-black rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>考え中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 入力エリア */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="敬語で話しかけてみて！「ネタちょうだい」でお題も出すよ〜"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputText.trim()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                送信
              </button>
            </div>
            
            {/* クイックボタン */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setInputText('ネタちょうだい')}
                className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-black"
              >
                🎲 ネタちょうだい
              </button>
              <button
                onClick={() => setInputText('いつもお世話になっております')}
                className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-black"
              >
                📧 ビジネス敬語
              </button>
              <button
                onClick={() => setInputText('申し訳ございません')}
                className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-black"
              >
                🙇‍♂️ 謝罪敬語
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
