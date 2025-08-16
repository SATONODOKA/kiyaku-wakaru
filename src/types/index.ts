// チャット関連の型定義
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// 契約関連の型定義
export interface ContractRule {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ContractQuestion {
  id: string;
  question: string;
  answer: string;
  relatedRules: string[];
  confidence: number;
  timestamp: Date;
}

// AI サービス関連の型定義
export interface AIResponse {
  content: string;
  confidence: number;
  sources: string[];
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// エラー関連の型定義
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
} 