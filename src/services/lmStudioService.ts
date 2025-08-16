import { contractRuleService, SearchResult } from './contractRuleService';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LMStudioService {
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL?: string, apiKey?: string) {
    this.baseURL = baseURL || '/api/lm-studio';
    this.apiKey = apiKey || process.env.LM_STUDIO_API_KEY;
  }

  /**
   * LM Studioのヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/v1/models`);
      return response.ok && response.status === 200;
    } catch (error) {
      console.error('LM Studio health check failed:', error);
      return false;
    }
  }

  /**
   * チャット完了リクエストを送信
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat completion request failed:', error);
      throw new Error('LM Studioとの通信に失敗しました');
    }
  }

  /**
   * 契約関連の質問に回答（RAG機能付き）
   */
  async answerContractQuestion(question: string): Promise<string> {
    try {
      // 1. 契約書から関連情報を検索
      const searchResults = contractRuleService.searchRules(question);
      
      // 2. 検索結果をプロンプト用に整形
      const context = contractRuleService.formatSearchResultsForPrompt(searchResults, 2500);
      
      // 3. AIに質問とコンテキストを送信
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `あなたは研修業務委託契約の専門家です。以下の契約書の内容を参考に、質問に対して自然で分かりやすい回答を提供してください。

契約書の内容：
${context}`
        },
        {
          role: 'user',
          content: question
        }
      ];

      const response = await this.chatCompletion({
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0]?.message?.content || '回答を生成できませんでした';
    } catch (error) {
      console.error('契約質問への回答生成に失敗:', error);
      return '申し訳ございません。エラーが発生しました。しばらく待ってから再試行してください。';
    }
  }

  /**
   * シンプルなチャット（RAGなし）
   */
  async simpleChat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.chatCompletion({
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0]?.message?.content || '回答を生成できませんでした';
    } catch (error) {
      console.error('チャット生成に失敗:', error);
      return '申し訳ございません。エラーが発生しました。';
    }
  }
}

// シングルトンインスタンス
export const lmStudioService = new LMStudioService(); 