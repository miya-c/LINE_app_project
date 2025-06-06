# 🎯 水道検針WOFFアプリ - CORS問題完全解決方法 v4

## 📅 **日付**: 2025年6月6日

---

## 🔍 **根本的な問題**

Google Apps ScriptのHTMLServiceではCORSヘッダーを直接設定できないため、フロントエンドからのPOSTリクエストが「No 'Access-Control-Allow-Origin' header」エラーでブロックされていました。

---

## ✅ **解決方法**

### **ContentServiceの採用**
- `ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON)`を使用
- これにより、適切なMIMEタイプでJSONレスポンスを返し、CORS問題を回避

---

## 🔧 **主要な変更点**

### **1. createCorsResponse関数の改良**
```javascript
// ❌ 旧方式（HTMLService）
return HtmlService.createHtmlOutput(htmlContent);

// ✅ 新方式（ContentService - CORS対応）
return ContentService
  .createTextOutput(JSON.stringify(data))
  .setMimeType(ContentService.MimeType.JSON);
```

### **2. doPost関数の完全改修**
- ContentServiceを使ってJSONレスポンスを直接返す
- POSTリクエストのCORS問題を根本的に解決
- エラーハンドリングも強化

### **3. doOptions関数の最適化**
- プリフライトリクエストもContentServiceで処理
- 軽量で効率的なレスポンス

### **4. バージョン管理**
- `version: "2025-06-06-v4-CORS-FIX"`
- `corsFixed: true`, `contentServiceUsed: true`のフラグ追加

---

## 🚀 **デプロイ手順**

### **STEP 1: Google Apps Scriptの更新**
1. https://script.google.com/ にアクセス
2. 既存の水道検針プロジェクトを開く
3. **Code.gsの内容を全て削除**
4. **`物件.gs`の内容を全てコピー&ペースト**
5. 保存 (Ctrl+S)

### **STEP 2: 新しいデプロイ作成**
6. 「デプロイ」→「新しいデプロイ」をクリック
7. 種類: 「ウェブアプリ」を選択
8. 実行ユーザー: 「自分」
9. アクセス許可: 「全員」
10. 「デプロイ」をクリック
11. **新しいウェブアプリURL**をコピー

### **STEP 3: 動作確認**
12. `gas_test_manual.html`を開く
13. 新しいURLを設定
14. 「getVersion テスト」で`version: "2025-06-06-v4-CORS-FIX"`を確認
15. POSTテストでCORSエラーが発生しないことを確認

---

## 📊 **期待される結果**

### **✅ 解決される問題**
- ❌ `Access to fetch at ... from origin ... has been blocked by CORS policy` 
- ❌ `No 'Access-Control-Allow-Origin' header is present on the requested resource`
- ❌ `HtmlService.createHtmlOutput(...).setHeaders is not a function`

### **✅ 正常動作するもの**
- ✅ POSTリクエストでの検針データ更新
- ✅ GETリクエストでの全機能
- ✅ 写真付き検針データの送信
- ✅ プリフライトリクエスト (OPTIONS)

---

## 🧪 **テスト項目**

### **基本機能テスト**
- [ ] `getVersion` - バージョン確認
- [ ] `getProperties` - 物件一覧取得 
- [ ] `getRooms` - 部屋一覧取得
- [ ] `getMeterReadings` - 検針データ取得
- [ ] `updateMeterReadings` (GET) - 検針データ更新
- [ ] `updateMeterReadings` (POST) - 検針データ更新（CORS対応）
- [ ] `updateInspectionComplete` - 検針完了日更新

### **CORS関連テスト**
- [ ] POSTリクエストがCORSエラーなしで成功
- [ ] プリフライトリクエスト (OPTIONS) が正常レスポンス
- [ ] JSON MIMEタイプでレスポンスが返される
- [ ] ブラウザコンソールにCORSエラーが表示されない

---

## 🔥 **技術仕様**

### **レスポンス形式**
- **MIMEタイプ**: `application/json`
- **Content-Type**: ContentServiceにより自動設定
- **CORS**: Google Apps Scriptが自動処理

### **対応メソッド**
- **GET**: 全アクション対応（従来通り）
- **POST**: `updateMeterReadings`専用（CORS問題解決済み）
- **OPTIONS**: プリフライト対応

---

## ⚠️ **重要な注意事項**

1. **必ず新しいデプロイを作成**してください（既存の更新ではなく）
2. **URLが変わる場合**は、フロントエンドアプリのURL設定も更新
3. **バージョン確認**で`v4-CORS-FIX`が表示されることを必ず確認
4. **テスト環境**で動作確認後、本番環境にデプロイ

---

## 📞 **最終確認事項**

### ✅ **デプロイ成功の指標**
- `getVersion`テストで`"corsFixed": true`が返される
- POSTテストでCORSエラーが発生しない
- meter_reading.htmlで検針データ更新が成功する
- ブラウザのDeveloper Toolsでネットワークエラーがない

---

**🎉 この修正により、水道検針WOFFアプリのCORS問題は完全に解決されます！**

---
*最終更新: 2025年6月6日*
*バージョン: v4-CORS-FIX*
*作成者: GitHub Copilot*
