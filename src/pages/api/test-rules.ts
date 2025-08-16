import type { NextApiRequest, NextApiResponse } from 'next';
import { contractRuleService } from '../../services/contractRuleService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 基本的なデータアクセステスト
    const summary = contractRuleService.getSummary();
    const allRules = contractRuleService.searchRules('研修');
    const testSearch = contractRuleService.searchRules('料金');
    
    res.status(200).json({
      success: true,
      summary,
      totalRules: allRules.length,
      testSearchResults: testSearch.length,
      sampleRule: allRules[0] || null,
      searchTest: {
        query: '料金',
        results: testSearch.slice(0, 2)
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 