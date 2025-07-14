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

interface Scenario {
  id: string
  title: string
  context: string
  situation: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadScenarios()
  }, [])

  const loadScenarios = async () => {
    try {
      const response = await fetch('/api/analyze')
      const data = await response.json()
      setScenarios(data.scenarios)
      if (data.scenarios.length > 0) {
        setCurrentScenario(data.scenarios[0])
      }
    } catch (error) {
      console.error('シナリオの読み込みに失敗しました:', error)
    }
  }

  const analyzeKeigo = async (text: string): Promise<KeigoAnalysis | null> => {
    if (!currentScenario) return null

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: text,
          context: currentScenario.context,
          situation: currentScenario.situation
        })
      })

      if (!response.ok) {
        throw new Error('分析に失敗しました')
      }

      return await response.json()
    } catch (error) {
      console.error('敬語分析エラー:', error)
      return null
    }
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

    // Gemini APIで敬語を分析
    const analysis = await analyzeKeigo(inputText)
    if (analysis) {
      userMessage.analysis = analysis
    }

    // アシスタントの応答を生成
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: generateResponse(analysis),
      sender: 'assistant',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setIsLoading(false)
    setInputText('')
  }

  const generateResponse = (analysis: KeigoAnalysis | null): string => {
    if (!analysis) {
      return '申し訳ございません。分析に失敗しました。再度お試しください。'
    }

    const { isCorrect, category, score, explanation, suggestion, examples } = analysis

    let response = `【敬語分析結果】\n`
    response += `カテゴリ: ${category}\n`
    response += `スコア: ${score}点\n\n`
    response += `【分析】\n${explanation}\n\n`

    if (!isCorrect && suggestion) {
      response += `【改善提案】\n${suggestion}\n\n`
    }

    if (examples && examples.length > 0) {
      response += `【参考例】\n`
      examples.forEach((example, index) => {
        response += `${index + 1}. ${example}\n`
      })
    }

    return response
  }

  const startNewScenario = (scenario: Scenario) => {
    setCurrentScenario(scenario)
    setMessages([])
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `【${scenario.title}】\n${scenario.situation}\n\n練習を始めましょう！適切な敬語を使って話してみてください。`,
      sender: 'assistant',
      timestamp: new Date()
    }
    
    setMessages([welcomeMessage])
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '尊敬語': return 'bg-blue-100 text-blue-800'
      case '謙譲語': return 'bg-green-100 text-green-800'
      case '丁寧語': return 'bg-purple-100 text-purple-800'
      case '普通語': return 'bg-gray-100 text-gray-800'
      case '不適切': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー - シナリオ選択 */}
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">練習シナリオ</h2>
        <div className="space-y-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => startNewScenario(scenario)}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                currentScenario?.id === scenario.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">{scenario.title}</div>
              <div className="text-sm text-gray-600 mt-1">{scenario.context}</div>
            </button>
          ))}
        </div>
      </div>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold">敬語練習チャット</h1>
          {currentScenario && (
            <p className="text-gray-600">{currentScenario.title} - {currentScenario.context}</p>
          )}
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* 敬語分析結果の表示 */}
                {message.analysis && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(message.analysis.category)}`}>
                        {message.analysis.category}
                      </span>
                      <span className={`text-sm font-semibold ${getScoreColor(message.analysis.score)}`}>
                        {message.analysis.score}点
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {message.analysis.explanation}
                    </div>
                  </div>
                )}

                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-gray-600">分析中...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 入力エリア */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="敬語を使って話してみてください..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
      </div>
    </div>
  )
}
