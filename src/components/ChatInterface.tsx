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
  topic?: {
    topic: string
    question: string
    hint: string
    answer?: string
    alternatives?: string[]
    explanation?: string
    category?: string
  }
}

const KEIGO_TOPICS = [
  {
    topic: 'コンビニ敬語',
    question: 'コンビニで「温めますか？」を敬語で言ってみて！',
    hint: 'お客様に対する丁寧な表現を考えてみましょう',
    answer: 'お温めいたしますか？',
    explanation: '「いたします」は謙譲語で、お客様に対する敬意を表現します'
  },
  {
    topic: 'ファミレス敬語',
    question: 'ファミレスで「お席にご案内します」の前に何て言う？',
    hint: 'お客様をお迎えする最初の一言',
    answer: 'いらっしゃいませ。お席にご案内いたします',
    explanation: '「いらっしゃいませ」でお迎えし、「ご案内いたします」で謙譲語を使用'
  },
  {
    topic: '電話敬語',
    question: '電話に出るとき「はい、○○です」じゃダメ？もっと丁寧に！',
    hint: '会社の代表として電話に出る場面',
    answer: 'はい、○○でございます。いつもお世話になっております',
    explanation: '「でございます」は丁寧語の最上級、挨拶も加えてより丁寧に'
  },
  {
    topic: 'エレベーター敬語',
    question: 'エレベーターで上司に「お疲れ様」以外の挨拶は？',
    hint: '時間帯や状況に応じた敬語表現',
    answer: 'お先に失礼いたします（帰宅時）/ おはようございます（朝）',
    explanation: '時間帯に応じて適切な挨拶を選び、謙譲語で敬意を表現'
  },
  {
    topic: 'メール敬語',
    question: 'メールで「ありがとうございました」より丁寧な表現は？',
    hint: 'ビジネスメールでよく使われる感謝の敬語',
    answer: '誠にありがとうございました',
    explanation: '「誠に」を加えることで、より深い感謝の気持ちを表現'
  },
  {
    topic: '謝罪敬語',
    question: '「すみません」を超丁寧に言うと？',
    hint: '深くお詫びする場面での表現',
    answer: '申し訳ございません',
    explanation: '「申し訳ございません」は謙譲語で、最も丁寧な謝罪表現'
  }
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiTopics, setAiTopics] = useState<typeof KEIGO_TOPICS>([])
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false)
  const [lastTopic, setLastTopic] = useState<{
    topic: string
    question: string
    hint: string
    answer?: string
    alternatives?: string[]
    explanation?: string
    category?: string
  } | null>(null)

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
    // AIで生成されたトピックがあれば優先的に使用
    const allTopics = aiTopics.length > 0 ? [...KEIGO_TOPICS, ...aiTopics] : KEIGO_TOPICS
    return allTopics[Math.floor(Math.random() * allTopics.length)]
  }

  const generateAITopic = async () => {
    setIsGeneratingTopic(true)
    try {
      const response = await fetch('/api/generate-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          existingTopics: [...KEIGO_TOPICS, ...aiTopics].map(t => t.topic)
        })
      })

      if (response.ok) {
        const newTopic = await response.json()
        setAiTopics(prev => [...prev, newTopic])
        return newTopic
      } else {
        // フォールバック
        return getRandomTopic()
      }
    } catch (error) {
      console.error('AI topic generation failed:', error)
      return getRandomTopic()
    } finally {
      setIsGeneratingTopic(false)
    }
  }

  const analyzeKeigo = async (text: string): Promise<KeigoAnalysis | null> => {
    try {
      // AIスコアリングAPIを呼び出し
      const response = await fetch('/api/score-keigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userText: text,
          context: lastTopic ? `トピック: ${lastTopic.topic}, 質問: ${lastTopic.question}` : '一般的な敬語表現'
        })
      });

      if (response.ok) {
        const aiScore = await response.json();
        return {
          isCorrect: aiScore.isCorrect,
          category: aiScore.category as KeigoAnalysis['category'],
          score: aiScore.score,
          explanation: aiScore.explanation,
          suggestion: aiScore.improvements.length > 0 ? aiScore.improvements.join(', ') : undefined,
          examples: aiScore.betterExpressions
        };
      } else {
        throw new Error('AI scoring failed');
      }
    } catch (error) {
      console.error('AI keigo analysis failed, using fallback:', error);
      
      // フォールバック用の簡易分析
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
  }

  const generateResponse = (userInput: string, analysis: KeigoAnalysis | null): string => {
    const input = userInput.toLowerCase()
    
    // ネタリクエスト
    if (input.includes('ネタ') || input.includes('お題') || input.includes('問題') || input.includes('ちょうだい')) {
      // ランダムでAI生成かプリセットかを選択
      const useAI = Math.random() < 0.3 // 30%の確率でAI生成
      if (useAI && !isGeneratingTopic) {
        // AI生成トピックを非同期で取得
        generateAITopic().then(topic => {
          setLastTopic(topic) // AI生成トピックも保存
          const aiMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: `🤖 **AI生成トピック**\n\n【${topic.topic}】\n\n${topic.question}\n\n💡 ${topic.hint}`,
            sender: 'assistant',
            timestamp: new Date(),
            topic: topic
          }
          setMessages(prev => [...prev, aiMessage])
        })
        return '🤖 AIが新しいトピックを考えています...'
      } else {
        const topic = getRandomTopic()
        setLastTopic(topic)
        return `【${topic.topic}】\n\n${topic.question}\n\n💡 ${topic.hint}`
      }
    }

    // 答えを求められた場合
    if (input.includes('答え') || input.includes('正解') || input.includes('こたえ')) {
      if (lastTopic && lastTopic.answer) {
        let answerText = `💡 **正解は...**\n\n「${lastTopic.answer}」\n\n`
        
        if (lastTopic.alternatives && lastTopic.alternatives.length > 0) {
          answerText += `� **他の言い方**\n`
          lastTopic.alternatives.forEach((alt: string, index: number) => {
            answerText += `${index + 1}. 「${alt}」\n`
          })
          answerText += '\n'
        }
        
        if (lastTopic.category) {
          answerText += `📚 **敬語の種類**: ${lastTopic.category}\n\n`
        }
        
        answerText += `�📝 **解説**\n${lastTopic.explanation || '適切な敬語表現です！'}`
        return answerText
      } else {
        return '答えを表示するには、まず「ネタちょうだい」でお題を出してもらってくださいね〜'
      }
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
    const response = generateResponse(inputText, analysis)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      sender: 'assistant',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setIsLoading(false)
    setInputText('')
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* メインコンテナ */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-soft border border-white/20 overflow-hidden animate-fade-in">
          {/* ヘッダー */}
          <div className="gradient-primary text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎌</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">敬語チャット</h1>
                  <p className="text-white/90 text-lg">AIと一緒に楽しく敬語を学ぼう</p>
                </div>
              </div>
            </div>
            {/* 装飾的な要素 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          </div>

          {/* メッセージエリア */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/50 to-slate-50/50">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3 max-w-[85%]">
                  {/* アバター */}
                  {message.sender === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">🤖</span>
                    </div>
                  )}
                  
                  {/* メッセージバブル */}
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-soft ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto'
                        : 'bg-white/90 text-gray-800 border border-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                    
                    {/* 敬語分析結果 */}
                    {message.analysis && (
                      <div className="mt-3 p-3 bg-white/60 rounded-xl border border-white/40">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getCategoryEmoji(message.analysis.category)}</span>
                          <span className="text-sm font-medium text-gray-700">{message.analysis.category}</span>
                          <span className={`text-sm font-bold px-2 py-1 rounded-full border ${getScoreColor(message.analysis.score)}`}>
                            {message.analysis.score}点
                          </span>
                        </div>
                        
                        {/* 詳細な解説 */}
                        <div className="text-xs text-gray-600 mt-2 space-y-2">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <span className="font-medium">📝 解説:</span> {message.analysis.explanation}
                          </div>
                          
                          {/* 改善提案 */}
                          {message.analysis.suggestion && (
                            <div className="bg-orange-50 p-2 rounded-lg">
                              <span className="font-medium">💡 改善提案:</span> {message.analysis.suggestion}
                            </div>
                          )}
                          
                          {/* より良い表現例 */}
                          {message.analysis.examples && message.analysis.examples.length > 0 && (
                            <div className="bg-green-50 p-2 rounded-lg">
                              <div className="font-medium mb-1">✨ より良い表現例:</div>
                              {message.analysis.examples.map((example, index) => (
                                <div key={index} className="ml-2 text-green-700">
                                  • {example}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs opacity-60 mt-2">
                      {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString() : ''}
                    </div>
                  </div>
                  
                  {/* ユーザーアバター */}
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">👤</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-pulse-soft">
                <div className="bg-white/90 rounded-2xl px-4 py-3 shadow-soft border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm text-gray-600">考え中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 入力エリア */}
          <div className="border-t border-gray-100 p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="敬語で話しかけてみて！「ネタちょうだい」でお題も出すよ〜"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 text-gray-800 placeholder-gray-500 transition-all duration-200"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
              >
                送信
              </button>
            </div>
            
            {/* クイックボタン */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => setInputText('ネタちょうだい')}
                className="text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 px-3 py-2 rounded-full text-gray-700 transition-all duration-200 shadow-soft hover:shadow-medium border border-gray-200"
              >
                🎲 ネタちょうだい
              </button>
              <button
                onClick={async () => {
                  if (!isGeneratingTopic) {
                    setIsLoading(true)
                    const topic = await generateAITopic()
                    setLastTopic(topic)
                    const aiMessage: Message = {
                      id: Date.now().toString(),
                      content: `🤖 **AI生成トピック**\n\n【${topic.topic}】\n\n${topic.question}\n\n💡 ${topic.hint}`,
                      sender: 'assistant',
                      timestamp: new Date()
                    }
                    setMessages(prev => [...prev, aiMessage])
                    setIsLoading(false)
                  }
                }}
                disabled={isGeneratingTopic || isLoading}
                className="text-sm bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 px-3 py-2 rounded-full text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-medium border border-purple-200"
              >
                🤖 AIトピック {isGeneratingTopic ? '生成中...' : ''}
              </button>
              <button
                onClick={() => setInputText('答え')}
                className="text-sm bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 px-3 py-2 rounded-full text-green-700 transition-all duration-200 shadow-soft hover:shadow-medium border border-green-200"
              >
                💡 答えを見る
              </button>
              <button
                onClick={() => setInputText('いつもお世話になっております')}
                className="text-sm bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 px-3 py-2 rounded-full text-blue-700 transition-all duration-200 shadow-soft hover:shadow-medium border border-blue-200"
              >
                📧 ビジネス敬語
              </button>
              <button
                onClick={() => setInputText('申し訳ございません')}
                className="text-sm bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 px-3 py-2 rounded-full text-orange-700 transition-all duration-200 shadow-soft hover:shadow-medium border border-orange-200"
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
