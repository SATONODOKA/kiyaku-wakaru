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
    
    // デバッグ用：コンテキストをコンソールに出力
    console.log('=== 契約ルール集検索結果 ===');
    console.log('質問:', question);
    console.log('検索されたコンテキスト:', ruleContext);
    console.log('========================');
    
    const systemPrompt = `あなたは研修業務委託契約に関する専門家です。
契約ルール集の内容を必ず引用・参照しながら、専門的かつ分かりやすく回答してください。

**重要**: 契約ルール集の内容を必ずベースにして回答すること。一般知識ではなく、提供されたルール集の具体的な内容を引用すること。

契約ルール集からの参考情報:
${ruleContext}

${context ? `追加の参考情報: ${context}\n\n` : ''}
質問: ${question}

回答の際は以下の点に注意してください：
1. **契約ルール集の内容を必ず引用・参照する**（章番号、条項番号、具体的な内容を含める）
2. 一般知識ではなく、ルール集に記載されている具体的な内容を回答の根拠とする
3. 関連する章や条項を具体的に示す（例：「第3章 業務範囲と報酬構成」）
4. 回答はマークダウン形式で記述し、見出し、リスト、強調などを適切に使用する
5. **必ずルール集の内容を引用し、一般知識との区別を明確にする**`;

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