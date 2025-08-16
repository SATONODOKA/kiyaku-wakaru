import React from 'react';
import { ChatBot } from '../components/ChatBot';
import { lmStudioService } from '../services/lmStudioService';

export default function Home() {
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      console.log('質問を受信:', message);
      
      // LM Studioのヘルスチェック
      console.log('LM Studioヘルスチェック開始...');
      const isHealthy = await lmStudioService.healthCheck();
      console.log('ヘルスチェック結果:', isHealthy);
      
      if (!isHealthy) {
        return '申し訳ございません。AIサービスが利用できません。LM Studioが起動しているか確認してください。';
      }

      // 契約関連の質問に回答
      console.log('AI回答生成開始...');
      const answer = await lmStudioService.answerContractQuestion(message);
      console.log('AI回答生成完了:', answer.substring(0, 100) + '...');
      return answer;
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      if (error instanceof Error) {
        return `申し訳ございません。エラーが発生しました: ${error.message}`;
      }
      return '申し訳ございません。エラーが発生しました。もう一度お試しください。';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            契約わかる君
          </h1>
          <p className="text-xl text-gray-600">
            研修業務委託契約に関する質問に、AIが専門的かつ分かりやすくお答えします
          </p>
        </div>
        
        <div className="h-[600px]">
          <ChatBot onSendMessage={handleSendMessage} />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>※ このサービスはAIによる回答を提供しています。法的な判断が必要な場合は、専門家にご相談ください。</p>
        </div>
      </div>
    </div>
  );
} 