import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';

interface ChatBotProps {
  onSendMessage: (message: string) => Promise<string>;
  isLoading?: boolean;
}

export const ChatBot: React.FC<ChatBotProps> = ({ onSendMessage, isLoading = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 初期メッセージをuseEffectで設定
  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'こんにちは！研修業務委託契約について何でもお聞きください。',
        timestamp: new Date()
      }
    ]);
  }, []);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const response = await onSendMessage(inputMessage);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-bold">契約わかる君</h1>
        <p className="text-sm opacity-90">研修業務委託契約に関する質問にお答えします</p>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-2xl xl:max-w-4xl px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm prose prose-sm max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // テーブルのスタイリング - レスポンシブ対応
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto mb-4">
                        <div className="min-w-full inline-block align-middle">
                          <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200" {...props} />
                          </div>
                        </div>
                      </div>
                    ),
                    th: ({node, ...props}) => (
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200" {...props} />
                    ),
                    // 見出しのスタイリング
                    h1: ({node, ...props}) => (
                      <h1 className="text-xl font-bold text-gray-900 mb-3" {...props} />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 className="text-lg font-bold text-gray-800 mb-2" {...props} />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 className="text-base font-bold text-gray-700 mb-2" {...props} />
                    ),
                    // リストのスタイリング
                    ul: ({node, ...props}) => (
                      <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
                    ),
                    ol: ({node, ...props}) => (
                      <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
                    ),
                    // 強調のスタイリング
                    strong: ({node, ...props}) => (
                      <strong className="font-bold text-gray-900" {...props} />
                    ),
                    em: ({node, ...props}) => (
                      <em className="italic text-gray-700" {...props} />
                    ),
                    // コードブロックのスタイリング
                    code: ({node, inline, ...props}: any) => 
                      inline ? (
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                      ) : (
                        <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                          <code className="text-sm font-mono" {...props} />
                        </pre>
                      ),
                    // ブロッククォートのスタイリング
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 italic" {...props} />
                    ),
                    // カード形式のレイアウト - 縦長画面に最適化
                    div: ({node, className, ...props}) => {
                      if (className && className.includes('card')) {
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 hover:shadow-md transition-shadow" {...props} />
                        );
                      }
                      return <div {...props} />;
                    },
                    // リストアイテムの改善
                    li: ({node, ...props}) => (
                      <li className="mb-2 leading-relaxed" {...props} />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString('ja-JP', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">考え中...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="研修業務委託契約について質問してください..."
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}; 