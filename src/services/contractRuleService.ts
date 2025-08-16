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

    this.rules.chapters.forEach((chapter: any) => {
      // タイトル、内容、タグで検索
      const titleMatch = chapter.title.toLowerCase().includes(searchTerm);
      const contentMatch = chapter.content.toLowerCase().includes(searchTerm);
      const tagMatch = chapter.tags.some((tag: string) => 
        tag.toLowerCase().includes(searchTerm)
      );

      if (titleMatch || contentMatch || tagMatch) {
        results.push({
          id: chapter.id,
          title: chapter.title,
          content: chapter.content,
          category: chapter.id,
          tags: chapter.tags,
          riskLevel: chapter.riskLevel
        });
      }
    });

    return results;
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
        riskLevel: chapter.riskLevel
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
        riskLevel: chapter.riskLevel
      }));
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
    
    let context = '契約ルール集からの参考情報：\n\n';
    
    if (searchResults.length > 0) {
      context += '関連する契約ルール：\n';
      searchResults.slice(0, 3).forEach((rule, index) => {
        context += `${index + 1}. ${rule.title}\n`;
        context += `   内容: ${rule.content.substring(0, 200)}...\n`;
        context += `   リスクレベル: ${rule.riskLevel}\n\n`;
      });
    }
    
    if (faqResults.length > 0) {
      context += 'よくある質問：\n';
      faqResults.slice(0, 2).forEach((faq, index) => {
        context += `${index + 1}. Q: ${faq.question}\n`;
        context += `   A: ${faq.answer}\n\n`;
      });
    }
    
    return context;
  }
}

// シングルトンインスタンス
export const contractRuleService = new ContractRuleService(); 