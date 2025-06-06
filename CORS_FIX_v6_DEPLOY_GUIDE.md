# 🚀 CORS修正 v6 デプロイメントガイド

## 📌 現在の状況
- **修正バージョン**: `v6-CORS-STRUCTURE-FIX`
- **修正内容**: doPost関数の構造問題修正、CORS完全対応
- **現在のURL**: `https://script.google.com/macros/s/AKfycby9heEnCsXcNa8MLaRAtehu2lL_rPl2P6-yY7PKy81YUkBEvQa2ZywqVWtMpu3RNZYnmg/exec`

## 🔧 緊急デプロイ手順

### 1. Google Apps Script エディタにアクセス
1. https://script.google.com/ にアクセス
2. 既存の「水道検針アプリ」プロジェクトを開く

### 2. コードの完全更新
1. 左側のファイルリストから「物件.gs」を選択
2. **エディタ内のすべてのコードを削除** (Ctrl+A → Delete)
3. ローカルの `c:\Users\user\Documents\GitHub\LINE_app_project\物件.gs` ファイル全体をコピー
4. Google Apps Script エディタに貼り付け
5. **Ctrl+S で保存**

### 3. 新しいデプロイメント作成
1. 右上の「デプロイ」ボタンをクリック
2. **「新しいデプロイ」**を選択（既存のデプロイを編集ではなく）
3. デプロイ設定:
   - **種類**: ウェブアプリ
   - **説明**: v6-CORS-STRUCTURE-FIX - doPost構造修正版
   - **実行するアカウント**: 自分
   - **アクセスできるユーザー**: 全員
4. **「デプロイ」**をクリック

### 4. 新しい URL の取得
- デプロイ完了後、新しい Web アプリ URL が表示されます
- この新しい URL をメモしてください

### 5. 動作確認テスト
新しい URL で以下のテストを実行:

#### 5.1 バージョン確認
```
https://[新しいURL]/exec?action=getVersion
```

**期待される結果:**
```json
{
  "version": "2025-06-06-v6-CORS-STRUCTURE-FIX",
  "availableActions": ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"],
  "corsFixed": true,
  "contentServiceUsed": true,
  "description": "🎯 v6-CORS-STRUCTURE-FIX版：doPost構造修正・CORS完全対応！"
}
```

#### 5.2 CORS プリフライトテスト
```javascript
// ブラウザのコンソールで実行
fetch('[新しいURL]', {
  method: 'OPTIONS',
  mode: 'cors'
}).then(response => {
  console.log('OPTIONS成功:', response.status);
}).catch(error => {
  console.error('OPTIONS失敗:', error);
});
```

#### 5.3 POST リクエストテスト
```javascript
// ブラウザのコンソールで実行
fetch('[新しいURL]', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'updateMeterReadings',
    propertyId: 'TEST001',
    roomId: 'TEST001',
    readings: []
  }),
  mode: 'cors'
}).then(response => response.json())
.then(data => {
  console.log('POST成功:', data);
}).catch(error => {
  console.error('POST失敗:', error);
});
```

### 6. HTMLファイルのURL更新
新しいURLが確認できたら、以下のファイルのURLを更新してください：

1. **property_select.html**
2. **test_gas_connection.html** 
3. **v5_cors_test_tool.html**

更新箇所：
```javascript
// 古いURL（例）
const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycby9heEnCsXcNa8MLaRAtehu2lL_rPl2P6-yY7PKy81YUkBEvQa2ZywqVWtMpu3RNZYnmg/exec';

// 新しいURLに変更
const gasWebAppUrl = '[新しいURL]';
```

## 🎯 修正された主要問題

### ✅ 解決済み
1. **doPost関数の構造問題** - POSTデータ処理後の分岐修正
2. **ContentService二重ラップ問題** - 直接return修正
3. **CORSプリフライト対応** - doOptions関数でHtmlService使用
4. **JSON形式レスポンス** - createCorsResponse関数でContentService使用

### 🔍 期待される動作
- **GET リクエスト**: 全アクション正常動作
- **POST リクエスト**: updateMeterReadings正常動作
- **OPTIONS リクエスト**: CORS プリフライト正常応答
- **写真アップロード**: POSTによる大きなデータ転送対応

## ⚠️ 重要注意事項

1. **必ず新しいデプロイメントを作成**してください（既存の編集ではなく）
2. **古いURLは使用を停止**し、新しいURLに完全移行してください
3. **テスト用ツール**（v5_cors_test_tool.html）で動作確認を行ってください
4. **写真アップロード機能**のテストも実行してください

## 📞 トラブルシューティング

### エラーが継続する場合
1. Google Apps Scriptエディタで**ログを確認**
2. ブラウザの**開発者ツール**でネットワークタブを確認
3. **新しいデプロイメント**が確実に作成されているか確認
4. **キャッシュクリア**を実行

### 成功確認方法
- `getVersion` で正しいバージョン情報が返される
- CORS エラーが発生しない
- POST リクエストが正常に処理される
- 写真アップロード機能が動作する
