# CORS問題完全解決 - v5 Final Fix

## 🎯 修正内容

### Critical Bug 修正
**問題**: `doPost`関数でContentServiceオブジェクトが二重にラップされていた
- `handleUpdateMeterReadings()`は既にContentServiceオブジェクトを返す
- `doPost`内で再度`ContentService.createTextOutput(JSON.stringify(result))`でラップしていた
- この二重ラップによりCORSヘッダーが失われていた

**修正**: 
```javascript
// 修正前（二重ラップ）
const result = handleUpdateMeterReadings(params);
return ContentService.createTextOutput(JSON.stringify(result))
  .setMimeType(ContentService.MimeType.JSON);

// 修正後（直接返却）
return handleUpdateMeterReadings(params);
```

### バージョン更新
- **新バージョン**: `2025-06-06-v5-CORS-FINAL-FIX`
- **説明**: doPost ContentService 二重ラップ問題修正版

## 🚀 デプロイ手順

### 1. Google Apps Script エディタを開く
- [Google Apps Script](https://script.google.com/) にアクセス
- 既存のプロジェクトを開く

### 2. 修正されたコードを貼り付け
- `物件.gs` の全内容をコピー
- Google Apps Script エディタに貼り付け
- **Ctrl+S** で保存

### 3. 新しいデプロイを作成
1. **「デプロイ」** → **「新しいデプロイ」** をクリック
2. **種類の選択**: ⚙️（歯車アイコン）→ **「ウェブアプリ」**
3. **設定**:
   - **説明**: `v5-CORS-FINAL-FIX - doPost二重ラップ問題解決`
   - **実行ユーザー**: **自分**
   - **アクセスできるユーザー**: **全員**
4. **「デプロイ」** をクリック
5. **新しいWeb アプリのURL**をコピー

### 4. フロントエンドのURL更新
`property_select.html` の Google Apps Script URL を新しいURLに更新

### 5. 動作確認テスト

#### A. バージョン確認テスト
```
GET: https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec?action=getVersion
```
期待するレスポンス：
```json
{
  "version": "2025-06-06-v5-CORS-FINAL-FIX",
  "description": "🎯 v5-CORS-FINAL-FIX版：ContentService doPost二重ラップ問題修正！"
}
```

#### B. POST リクエストテスト
```javascript
fetch('https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'updateMeterReadings',
    propertyId: 'TEST001',
    roomId: '101',
    readings: [{
      date: '2025-06-07',
      currentReading: '12345'
    }]
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## 🔍 期待される結果

### 修正前の問題
- **CORS Error**: `No 'Access-Control-Allow-Origin' header is present`
- POSTリクエストが失敗

### 修正後の期待結果
- ✅ POSTリクエスト成功
- ✅ CORSエラーなし
- ✅ 検針データ更新成功
- ✅ レスポンスが正常にJSON形式で返される

## 🎯 重要ポイント

1. **必ず新しいデプロイを作成**してください（既存のデプロイを更新するだけでは不十分）
2. **フロントエンドのURLを新しいデプロイメントIDに更新**してください
3. **テスト時はブラウザの開発者ツールでネットワークタブを確認**してください

## 🛠️ トラブルシューティング

### まだCORSエラーが発生する場合
1. 新しいデプロイが正しく作成されたか確認
2. フロントエンドのURLが正しく更新されたか確認
3. ブラウザキャッシュをクリア

### POSTリクエストが失敗する場合
1. リクエストボディのJSON形式が正しいか確認
2. `action: 'updateMeterReadings'` が含まれているか確認
3. Google Apps Script のログを確認

---

**次のステップ**: Google Apps Script でのデプロイと実際のテストを実行してください。
