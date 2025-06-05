# 🚨 Google Apps Script デプロイメント手順 - 最終版

## 現在の状況
- 新しい URL: `https://script.google.com/macros/s/AKfycbxTTWidncWsObUx0wyXy_hQI1WCzxFwXgQiD9sjlLSLe5-G_xYH14jV2PnUeJhcrTYO2A/exec`
- まだ "無効なアクションです" エラーが発生
- 新しい URL でも古い v2 版が動作している

## 🔧 緊急デプロイ手順

### 1. Google Apps Script エディタにアクセス
1. https://script.google.com/ にアクセス
2. 既存の「水道検針アプリ」プロジェクトを開く

### 2. コードの完全更新
1. 左側のファイルリストから「物件.gs」を選択
2. **エディタ内のすべてのコードを削除** (Ctrl+A → Delete)
3. ローカルの `c:\Users\choyu\Documents\GitHub\LINE_app_project\物件.gs` ファイル全体をコピー
4. Google Apps Script エディタに貼り付け
5. **Ctrl+S で保存**

### 3. 新しいデプロイメント作成
1. 右上の「デプロイ」ボタンをクリック
2. **「新しいデプロイ」**を選択（既存のデプロイを編集ではなく）
3. デプロイ設定:
   - **種類**: ウェブアプリ
   - **説明**: v3 CORS修正版 - 全6アクション対応
   - **実行するアカウント**: 自分
   - **アクセスできるユーザー**: 全員
4. **「デプロイ」**をクリック

### 4. 新しい URL の取得
- デプロイ完了後、新しい Web アプリ URL が表示されます
- この新しい URL をメモしてください

### 5. 動作確認
新しい URL で以下を確認:
```
https://[新しいURL]/exec?action=getVersion
```

**期待される結果:**
```json
{
  "version": "2025-01-02-v3",
  "availableActions": ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"],
  "hasUpdateInspectionComplete": true,
  "hasMeterReadings": true
}
```

### 6. アプリケーションの URL 更新
新しい URL が取得できたら、フロントエンドファイルを更新してください。

## ⚠️ 重要な注意点
- **既存のデプロイを編集** ではなく **新しいデプロイ** を作成する
- コードを貼り付けた後、必ず **保存** する
- デプロイ前に **構文エラーがないことを確認** する

## 🔍 トラブルシューティング
もし新しいデプロイでも問題が続く場合：
1. ブラウザのキャッシュをクリア
2. Google Apps Script のプロジェクトを一度閉じて再度開く
3. 完全に新しいプロジェクトを作成してコードを貼り付け
