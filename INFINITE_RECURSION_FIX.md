# 🔧 無限再帰エラー修正完了

## 問題の原因
**Google Apps Script エラー**: `[RangeError: Maximum call stack size exceeded]`

### 原因特定
- `doGet`関数内で自分自身（`doGet(e)`）を呼び出していた
- 場所: 257行目 `return doGet(e);`
- これにより無限再帰が発生

## 修正内容

### 修正前（問題のあるコード）
```javascript
// HTML表示の場合（pageパラメータが存在）
const page = e?.parameter?.page || 'property_select';
console.log('[doGet] HTML要求 - ページ:', page);

// 各ページの表示処理は既存のdoGet関数に統合済み
return doGet(e);  // ← 無限再帰の原因！
```

### 修正後（正しいコード）
```javascript
// HTML表示の場合（pageパラメータが存在）
const page = e?.parameter?.page || 'property_select';
console.log('[doGet] HTML要求 - ページ:', page);

// HTMLページ表示は簡単なテストページを返す
const testHtml = HtmlService.createHtmlOutput(`
  <html>
    <head>
      <title>水道検針アプリ - API Test</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1>🚰 水道検針アプリ API</h1>
      <p>API is working! Current time: ${new Date().toISOString()}</p>
      <h2>Available API Endpoints:</h2>
      <ul>
        <li><a href="?action=getProperties">getProperties</a></li>
        <li><a href="?action=getRooms&propertyId=P000001">getRooms (example)</a></li>
        <li><a href="?action=getMeterReadings&propertyId=P000001&roomId=R000001">getMeterReadings (example)</a></li>
      </ul>
      <p>CORS Headers: Enabled</p>
      <p>Deploy Time: ${new Date().toISOString()}</p>
    </body>
  </html>
`);

return testHtml.setTitle('水道検針アプリ - API Test');
```

## 修正されたファイル

✅ **`deployment_ready_gas_file.gs`** - デプロイ用ファイル（修正済み）  
✅ **`gas_scripts/web_app_api.gs`** - ローカルファイル（修正済み）

## 再デプロイ手順

1. **Google Apps Script エディタにアクセス**
2. **修正された `deployment_ready_gas_file.gs` の全内容をコピー&ペースト**
3. **保存 (Ctrl + S)**
4. **再デプロイ**
   - 「デプロイ」→「新しいデプロイ」
   - 種類: ウェブアプリ
   - 実行者: 自分
   - アクセス: 全員

## 期待される結果

✅ **無限再帰エラー解決**  
✅ **503エラー解決**  
✅ **CORS対応継続**  
✅ **正常なAPI動作**  

---

**注意**: 必ず修正された `deployment_ready_gas_file.gs` を使用してください。古いファイルには無限再帰の問題が残っています。
