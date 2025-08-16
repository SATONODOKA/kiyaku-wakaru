import axios from 'axios';
import { contractRuleService } from './contractRuleService';

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
    // Next.jsのAPI Routes経由でLM Studioにアクセス
    this.baseURL = baseURL || '/api/lm-studio';
    this.apiKey = apiKey || process.env.LM_STUDIO_API_KEY;
  }

  /**
   * LM Studioのヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    try {
      // LM Studioのモデル一覧エンドポイントを使用してヘルスチェック
      const response = await axios.get(`${this.baseURL}/v1/models`);
      return response.status === 200 && response.data.data && response.data.data.length > 0;
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

      // タイムアウト設定を追加（5分）
      const response = await axios.post(
        `${this.baseURL}/v1/chat/completions`,
        request,
        { 
          headers,
          timeout: 300000, // 5分
          maxRedirects: 0,
          validateStatus: (status) => status < 500
        }
      );

      return response.data;
    } catch (error) {
      console.error('Chat completion request failed:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('LM Studioからの応答がタイムアウトしました。しばらく待ってから再試行してください。');
        } else if (error.code === 'ECONNRESET') {
          throw new Error('LM Studioとの接続が切断されました。LM Studioが正常に動作しているか確認してください。');
        }
      }
      throw new Error('LM Studioとの通信に失敗しました');
    }
  }

  /**
   * 契約関連の質問に回答
   */
  async answerContractQuestion(
    question: string,
    context?: string
  ): Promise<string> {
    // 契約ルール集から関連情報を検索
    const ruleContext = contractRuleService.generateContextForQuestion(question);
    
    const systemPrompt = `あなたは研修業務委託契約に関する専門家です。
以下の質問に対して、契約ルール集に基づいて専門的かつ分かりやすく回答してください。

契約ルール集からの参考情報:
${ruleContext}

${context ? `追加の参考情報: ${context}\n\n` : ''}
質問: ${question}

回答の際は以下の点に注意してください：
1. 契約ルール集の内容に基づいて正確に回答する
2. 関連する章や条項を具体的に示す
3. リスクレベルが高い項目については特に注意を促す
4. 実務的なアドバイスも含める
5. 回答はマークダウン形式で記述し、見出し、テーブル、リスト、強調などを適切に使用する
6. HTMLタグは使用せず、マークダウンの記法のみを使用する
7. テーブルは見やすく整理し、重要なポイントを強調する`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ];

    try {
      console.log('LM Studio API呼び出し開始...');
      const response = await this.chatCompletion({
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      console.log('LM Studio API応答:', response);
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error('AIからの回答が空です');
      }
      
      const content = response.choices[0]?.message?.content;
      if (!content || content.trim() === '') {
        throw new Error('AIからの回答内容が空です');
      }

      return content;
    } catch (error) {
      console.error('Contract question answer failed:', error);
      if (error instanceof Error) {
        throw new Error(`質問への回答生成に失敗しました: ${error.message}`);
      }
      throw new Error('質問への回答生成に失敗しました');
    }
  }

  /**
   * 利用可能なモデル一覧を取得
   */
  async listModels(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/v1/models`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }
}

// シングルトンインスタンス
export const lmStudioService = new LMStudioService(); 