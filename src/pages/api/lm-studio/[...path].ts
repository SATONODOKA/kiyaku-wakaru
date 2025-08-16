import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const targetPath = Array.isArray(path) ? path.join('/') : path || '';
  
  try {
    // リクエスト設定を準備
    const requestConfig: any = {
      method: req.method,
      url: `http://localhost:1234/${targetPath}`,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KeiyakuWakaruKun/1.0',
      },
      timeout: 300000, // 5分
    };

    // GETリクエストの場合はボディを送信しない
    if (req.method !== 'GET') {
      requestConfig.data = req.body;
    }

    // LM Studioへのリクエストを転送
    const response = await axios(requestConfig);

    // LM Studioからの応答をそのまま返す
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('LM Studio API error:', error);
    
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        error: 'LM Studioとの通信に失敗しました',
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: '予期しないエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
} 