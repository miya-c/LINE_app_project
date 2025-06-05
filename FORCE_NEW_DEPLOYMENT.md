# 🚨 強制新規デプロイメント手順 - デバッグ版

## 現在の問題
- 新しいデプロイメントを作成しても古いバージョンが実行され続けている
- エラー: `{"error":"無効なアクションです。","expectedActions":["getProperties","getRooms","getMeterReadings"]}`
- これは古い v2 版（3つのアクションのみ）が動作していることを示している

## 🔥 強制解決手順

### 1. 完全に新しいプロジェクトを作成（推奨）

1. **新しいGoogle Apps Scriptプロジェクトを作成**
   - https://script.google.com/ にアクセス
   - 「新しいプロジェクト」をクリック
   - プロジェクト名: 「水道検針アプリ-v3-DEBUG」

2. **コードの貼り付け**
   - デフォルトの `myFunction()` を削除
   - `c:\Users\choyu\Documents\GitHub\LINE_app_project\物件.gs` の全内容をコピー&ペースト
   - **Ctrl+S で保存**

3. **新しいデプロイメント作成**
   - 「デプロイ」→「新しいデプロイ」
   - 種類: ウェブアプリ
   - 説明: v3-DEBUG版 - 強制新規作成
   - 実行するアカウント: 自分
   - アクセスできるユーザー: 全員
   - 「デプロイ」クリック

### 2. 既存プロジェクトで強制更新（代替方法）

1. **Google Apps Scriptエディタで既存プロジェクトを開く**
2. **ファイル名を変更**
   - 「物件.gs」を「物件_old.gs」にリネーム
   - 「+」ボタンで新しいスクリプトファイルを作成
   - 新しいファイル名: 「物件_v3_debug.gs」

3. **新しいファイルにコードを貼り付け**
   - `c:\Users\choyu\Documents\GitHub\LINE_app_project\物件.gs` の全内容をコピー&ペースト
   - **Ctrl+S で保存**

4. **古いファイルを削除**
   - 「物件_old.gs」を削除

5. **新しいデプロイメント作成**
   - 「デプロイ」→「新しいデプロイ」で作成

## 🔍 デプロイメント確認手順

新しいデプロイメント完了後、以下URLでテスト：

```
https://[新しいURL]/exec?action=getVersion
```

**期待される結果（v3-DEBUG版）:**
```json
{
  "version": "2025-01-02-v3-DEBUG",
  "deployedAt": "2025-06-05T...",
  "availableActions": ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"],
  "debugInfo": {
    "functionCalled": "getGasVersion",
    "deploymentCheck": "v3-DEBUG版が正常に動作しています"
  }
}
```

**もし古いバージョンが表示される場合:**
```json
{
  "error": "無効なアクションです。",
  "expectedActions": ["getProperties", "getRooms", "getMeterReadings"]
}
```

## ⚠️ トラブルシューティング

1. **ブラウザキャッシュクリア**
   - Ctrl+Shift+Delete でキャッシュを完全クリア

2. **シークレットモードでテスト**
   - 新しいシークレットウィンドウで URL をテスト

3. **URLの再確認**
   - デプロイメント時に表示された新しい URL を正確にコピー

4. **スプレッドシートの確認**
   - 新しいプロジェクトの場合、スプレッドシートがバインドされていることを確認

## 📝 成功確認後の作業

新しいデプロイメントが正常に動作することを確認できたら：

1. **フロントエンドファイルのURL更新**
2. **デバッグログの削除**（本番運用時）
3. **ドキュメント更新**
