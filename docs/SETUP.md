# 契約わかる君 - セットアップガイド

## 前提条件

- Node.js 18.0.0以上
- npm または yarn
- LM Studio（ローカルでGPT-OSSモデルを実行）

## 1. LM Studio のセットアップ

### 1.1 LM Studio のインストール
1. [LM Studio](https://lmstudio.ai/) からアプリケーションをダウンロード
2. macOS用のインストーラーを実行
3. アプリケーションを起動

### 1.2 モデルのダウンロード
1. LM Studio内の「Search」タブで適切なGPT-OSSモデルを検索
2. 推奨モデル：
   - **Llama 3.1 8B Instruct** (軽量で高速)
   - **Mistral 7B Instruct** (バランスが良い)
   - **CodeLlama 34B Instruct** (コード理解に優れている)
3. モデルをダウンロード（数GB〜数十GB）

### 1.3 ローカルサーバーの起動
1. LM Studio内で「Local Server」タブを開く
2. 以下の設定でサーバーを起動：
   - **Port**: 1234 (デフォルト)
   - **Context Length**: 4096 (またはモデルの最大値)
   - **Threads**: 4-8 (CPUコア数に応じて)
3. 「Start Server」をクリック
4. サーバーが起動したら、ブラウザで `http://localhost:1234` にアクセスして確認

## 2. プロジェクトのセットアップ

### 2.1 依存関係のインストール
```bash
# プロジェクトディレクトリに移動
cd 契約わかる君

# 依存関係をインストール
npm install
```

### 2.2 環境変数の設定
```bash
# .envファイルを作成
cp .env.example .env

# .envファイルを編集
nano .env
```

`.env`ファイルの内容：
```env
# LM Studio 設定
LM_STUDIO_BASE_URL=http://localhost:1234
LM_STUDIO_API_KEY=

# アプリケーション設定
NEXT_PUBLIC_APP_NAME=契約わかる君
NEXT_PUBLIC_APP_DESCRIPTION=研修業務委託契約に関する質問に回答するAIチャットボット

# 開発環境設定
NODE_ENV=development
PORT=3000
```

### 2.3 開発サーバーの起動
```bash
# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてアプリケーションを確認

## 3. 動作確認

### 3.1 LM Studio の接続確認
1. チャットボットで簡単な質問を送信
2. コンソールでエラーメッセージを確認
3. LM Studioのサーバーが起動していることを確認

### 3.2 契約ルール集の検索確認
1. 契約関連の質問を送信（例：「キャンセル料について教えて」）
2. 関連する契約ルールが表示されることを確認
3. AIの回答が契約ルール集の内容に基づいていることを確認

## 4. トラブルシューティング

### 4.1 LM Studio が起動しない
- ポート1234が他のアプリケーションで使用されていないか確認
- ファイアウォールの設定を確認
- LM Studioのログを確認

### 4.2 モデルのダウンロードが遅い
- インターネット接続を確認
- モデルサイズを小さくする（8B以下を推奨）
- ダウンロードを一時停止して再開

### 4.3 アプリケーションが起動しない
- Node.jsのバージョンを確認（18.0.0以上が必要）
- 依存関係のインストールを再実行
- ポート3000が使用されていないか確認

## 5. 本番環境への展開

### 5.1 ビルド
```bash
# 本番用ビルド
npm run build

# 本番サーバー起動
npm start
```

### 5.2 環境変数の設定
本番環境では適切な環境変数を設定：
- `NODE_ENV=production`
- `LM_STUDIO_BASE_URL` を本番環境のURLに変更
- 必要に応じてAPIキーを設定

## 6. カスタマイズ

### 6.1 契約ルール集の更新
`data/contract-rules.json` を編集して契約ルールを更新

### 6.2 AIプロンプトの調整
`src/services/lmStudioService.ts` の `systemPrompt` を編集

### 6.3 UIのカスタマイズ
`src/components/ChatBot.tsx` を編集してUIを調整

## 7. 次のステップ

1. **ベクトル検索の実装**: より高度な検索機能の追加
2. **履歴管理**: チャット履歴の保存と分析
3. **ユーザー認証**: 複数ユーザー対応
4. **API エンドポイント**: 外部システムとの連携
5. **モニタリング**: ログ収集とパフォーマンス監視 