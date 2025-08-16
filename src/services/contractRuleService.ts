import contractRules from '../../data/contract-rules.json';
import { ContractRule } from '../types';

export class ContractRuleService {
  private rules: any;

  constructor() {
    this.rules = contractRules;
  }

  /**
   * キーワードによる契約ルールの検索
   */
  searchRules(keyword: string): ContractRule[] {
    const searchTerm = keyword.toLowerCase();
    const results: ContractRule[] = [];
    
    // 検索語を分割して複数のキーワードで検索
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 1);
    
    // 料金関連の質問かどうかを判定
    const isPricingQuestion = /料金|価格|報酬|単価|費用|支払|金額/.test(searchTerm);
    
    this.rules.chapters.forEach((chapter: any) => {
      let matchScore = 0;
      
      // タイトルでの完全一致（高スコア）
      if (chapter.title.toLowerCase().includes(searchTerm)) {
        matchScore += 10;
      }
      
      // 個別のキーワードでの検索
      searchWords.forEach(word => {
        // タイトルでの部分一致
        if (chapter.title.toLowerCase().includes(word)) {
          matchScore += 5;
        }
        // 内容での部分一致
        if (chapter.content.toLowerCase().includes(word)) {
          matchScore += 3;
        }
        // タグでの部分一致
        if (chapter.tags.some((tag: string) => tag.toLowerCase().includes(word))) {
          matchScore += 4;
        }
      });
      
      // 料金関連の質問の場合は、料金に関連する章のスコアを上げる
      if (isPricingQuestion && (
        chapter.title.includes('報酬') || 
        chapter.title.includes('料金') || 
        chapter.title.includes('支払') ||
        chapter.content.includes('円') ||
        chapter.content.includes('料金') ||
        chapter.content.includes('報酬')
      )) {
        matchScore += 8;
      }
      
      // スコアが一定以上の場合に結果に追加
      if (matchScore > 0) {
        results.push({
          id: chapter.id,
          title: chapter.title,
          content: chapter.content,
          category: chapter.id,
          tags: chapter.tags,
          riskLevel: chapter.riskLevel,
          matchScore: matchScore
        });
      }
    });
    
    // スコア順でソート
    return results.sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  /**
   * リスクレベル別の契約ルール取得
   */
  getRulesByRiskLevel(riskLevel: 'low' | 'medium' | 'high'): ContractRule[] {
    return this.rules.chapters
      .filter((chapter: any) => chapter.riskLevel === riskLevel)
      .map((chapter: any) => ({
        id: chapter.id,
        title: chapter.title,
        content: chapter.content,
        category: chapter.id,
        tags: chapter.tags,
        riskLevel: chapter.riskLevel,
        matchScore: 0
      }));
  }

  /**
   * 特定の章の詳細情報取得
   */
  getChapterById(chapterId: string): any | null {
    return this.rules.chapters.find((chapter: any) => chapter.id === chapterId) || null;
  }

  /**
   * FAQの検索
   */
  searchFAQ(keyword: string): any[] {
    const searchTerm = keyword.toLowerCase();
    return this.rules.faq.filter((faq: any) => 
      faq.question.toLowerCase().includes(searchTerm) ||
      faq.answer.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * 関連する章の情報を取得
   */
  getRelatedChapters(chapterIds: string[]): ContractRule[] {
    return chapterIds
      .map(id => this.getChapterById(id))
      .filter(Boolean)
      .map((chapter: any) => ({
        id: chapter.id,
        title: chapter.title,
        content: chapter.content,
        category: chapter.id,
        tags: chapter.tags,
        riskLevel: chapter.riskLevel,
        matchScore: 0
      }));
  }

  /**
   * 料金表の情報を取得
   */
  getPricingInfo(): any {
    return this.rules.pricing || null;
  }

  /**
   * 特定の料金カテゴリの情報を取得
   */
  getPricingByCategory(category: 'training' | 'meetings' | 'materials' | 'reporting' | 'others'): any {
    return this.rules.pricing?.[category] || null;
  }

  /**
   * 料金に関する質問かどうかを判定
   */
  isPricingQuestion(question: string): boolean {
    return /料金|価格|報酬|単価|費用|支払|金額|円/.test(question);
  }

  /**
   * 契約ルール集の概要情報取得
   */
  getSummary(): any {
    return {
      title: this.rules.title,
      version: this.rules.version,
      totalChapters: this.rules.chapters.length,
      totalFAQ: this.rules.faq.length,
      riskLevels: {
        low: this.rules.chapters.filter((c: any) => c.riskLevel === 'low').length,
        medium: this.rules.chapters.filter((c: any) => c.riskLevel === 'medium').length,
        high: this.rules.chapters.filter((c: any) => c.riskLevel === 'high').length
      }
    };
  }

  /**
   * 質問に関連する契約ルールの検索とコンテキスト生成
   */
  generateContextForQuestion(question: string): string {
    const searchResults = this.searchRules(question);
    const faqResults = this.searchFAQ(question);
    
    // 料金関連の質問かどうかを判定
    const isPricingQuestion = /料金|価格|報酬|単価|費用|支払|金額/.test(question);
    
    // デバッグ情報をコンソールに出力
    console.log('=== 契約ルール集検索デバッグ ===');
    console.log('質問:', question);
    console.log('料金関連質問か:', isPricingQuestion);
    console.log('検索結果数:', searchResults.length);
    console.log('FAQ結果数:', faqResults.length);
    console.log('検索結果:', searchResults);
    console.log('FAQ結果:', faqResults);
    console.log('==============================');
    
    let context = '**契約ルール集からの参考情報**：\n\n';
    
    // 料金関連の質問の場合は、料金表の情報を簡潔に提供
    if (isPricingQuestion && this.rules.pricing) {
      context += '**料金情報**：\n';
      
      // 研修登壇料金（簡潔に）
      if (this.rules.pricing.training) {
        context += `研修登壇: 半日35,000円(3時間以内30名以下)、1日60,000円(6時間以内50名以下)、延長8,000円/1時間\n`;
      }
      
      // 打ち合わせ料金（簡潔に）
      if (this.rules.pricing.meetings) {
        context += `打ち合わせ: 初回5,000円、中間3,000円、最終無償\n`;
      }
      
      // 資料作成料金（簡潔に）
      if (this.rules.pricing.materials) {
        context += `資料作成: オリジナル20,000円、カスタマイズ8,000円、ワークシート5,000円\n`;
      }
      
      context += '\n';
    }
    
    if (searchResults.length > 0) {
      context += '**関連する契約ルール**：\n';
      // 最初の2つの結果のみを使用してコンテキストを短縮
      searchResults.slice(0, 2).forEach((rule, index) => {
        context += `${index + 1}. ${rule.title}: ${rule.content.substring(0, 200)}...\n`;
      });
    }
    
    if (faqResults.length > 0) {
      context += '**関連FAQ**：\n';
      // 最初の1つのFAQのみを使用
      const faq = faqResults[0];
      context += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
    }
    
    context += '**重要**: 上記の契約ルール集の内容を必ず引用・参照して回答してください。\n';
    
    return context;
  }
}

// シングルトンインスタンス
export const contractRuleService = new ContractRuleService(); 