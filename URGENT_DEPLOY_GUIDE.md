# 🚨 緊急解決手順 - 水道検針WOFFアプリ CORS問題

## 📋 **現在の状況**
- ✅ フロントエンド: CORS対応完了（GET方式実装済み）
- ✅ Google Apps Script: コード修正完了
- ❌ **問題**: Google Apps Script が古いバージョンでデプロイされている
- ❌ **症状**: "無効なアクションです" エラーが発生

## 🔧 **解決手順（5分で完了）**

### 手順1: Google Apps Script の更新
1. 🌐 https://script.google.com/ にアクセス
2. 📁 既存の水道検針プロジェクトを開く
3. 🗑️ 現在のコードを全て削除
4. 📋 **物件.gs** の内容を全てコピー&ペースト
5. 💾 保存 (Ctrl+S)

### 手順2: 新しいデプロイ作成
6. 🚀 「デプロイ」→「新しいデプロイ」をクリック
7. ⚙️ 種類: 「ウェブアプリ」を選択
8. 👤 実行ユーザー: 「自分」
9. 🌍 アクセス許可: 「全員」
10. 🔄 「デプロイ」をクリック
11. 📎 **新しいウェブアプリURL**をコピー

### 手順3: バージョン確認テスト
12. 🧪 gas_test_manual.html を開く
13. 🔗 新しいURLを入力して「URL保存」
14. 🎯 「getVersion テスト」をクリック
15. ✅ version: "2025-01-02-v2" が表示されることを確認

### 手順4: 動作確認
16. 🧪 各テストボタンで動作確認
17. ✅ updateMeterReadings が正常動作することを確認
18. ✅ updateInspectionComplete が正常動作することを確認

## 📁 **修正済みファイル一覧**

### バックエンド
- ✅ **物件.gs** (v2025-01-02-v2)
  - updateMeterReadings 対応
  - updateInspectionComplete 対応
  - CORS ヘッダー対応
  - GET/POST 両方対応

### フロントエンド
- ✅ **meter_reading.html**
  - React state管理修正
  - GET方式での更新実装
  - エラーハンドリング強化

- ✅ **property_select.html**
  - sessionStorage URL管理

## 🎯 **期待される結果**

### 正常動作時の応答例
```json
// getVersion
{
  "version": "2025-01-02-v2",
  "availableActions": ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"],
  "description": "CORS修正完了版：updateMeterReadings/updateInspectionComplete対応"
}

// updateMeterReadings
{
  "success": true,
  "message": "1件の検針データを更新しました。",
  "updatedCount": 1
}
```

## ⚠️ **重要な注意事項**
1. **必ず新しいデプロイを作成**してください（既存の更新ではなく）
2. **URLが変わる場合**は、property_select.html の gasWebAppUrl も更新
3. テスト後に本番環境でも同様の手順を実行

## 🛠️ **トラブルシューティング**

### エラー: "スクリプトの実行権限がありません"
→ Google Apps Script の実行権限を「自分」に設定

### エラー: "このアプリは確認されていません"
→ 「詳細設定」→「安全でないページに移動」をクリック

### エラー: まだ "無効なアクションです"
→ ブラウザのキャッシュをクリアして再テスト

## 📞 **完了確認**
✅ gas_test_manual.html で全ての機能がテスト成功  
✅ meter_reading.html で検針データ更新が成功  
✅ property_select.html から room_select.html への遷移が成功  

---
*最終更新: 2025-01-02*
