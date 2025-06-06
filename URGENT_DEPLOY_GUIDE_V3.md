# 🚨 緊急デプロイガイド - Google Apps Script CORS修正版 v3

## ❗ 重要な修正点

**問題**: Google Apps Scriptの`doGet`関数で、`getVersion`アクションの処理が他の条件分岐を阻害していたため、6つのアクションのうち3つしか認識されていませんでした。

**修正内容**:
- `doGet`関数の構造を修正し、`getVersion`アクションを正しい位置に配置
- 全6アクション（getProperties, getRooms, updateInspectionComplete, getMeterReadings, updateMeterReadings, getVersion）が正常に認識されるよう修正
- バージョンを2025-01-02-v3に更新

## 🔧 デプロイ手順

### 1. Google Apps Scriptエディタへアクセス
1. ブラウザで以下のURLにアクセス:
   ```
   https://script.google.com/
   ```

2. 既存の「水道検針アプリ」プロジェクトを開く

### 2. コードの置き換え
1. 左側のファイルリストから「物件.gs」を選択
2. **全てのコード**を削除
3. `c:\Users\choyu\Documents\GitHub\LINE_app_project\物件.gs`ファイルの内容を**完全にコピー&ペースト**

### 3. デプロイの実行
1. 右上の「デプロイ」ボタンをクリック
2. 「新しいデプロイ」を選択
3. デプロイの設定:
   - **種類**: ウェブアプリ
   - **実行するアカウント**: 自分
   - **アクセスできるユーザー**: 全員
4. 「デプロイ」をクリック

### 4. 新しいURLの取得
- デプロイ完了後、新しいWebアプリURLが表示されます
- このURLをコピーしてください（通常は既存のURLと同じです）

### 5. 動作確認
1. まず手動テスト画面で確認:
   ```
   c:\Users\choyu\Documents\GitHub\LINE_app_project\gas_test_manual.html
   ```
   をブラウザで開いて各機能をテスト

2. 全6アクションが正常に動作することを確認:
   - ✅ getProperties
   - ✅ getRooms  
   - ✅ updateInspectionComplete
   - ✅ getMeterReadings
   - ✅ updateMeterReadings
   - ✅ getVersion

## 🎯 期待される結果

- **修正前**: `expectedActions: Array(3)` - 3つのアクションのみ認識
- **修正後**: `expectedActions: Array(6)` - 全6アクションが認識される
- `updateMeterReadings`アクションが正常に動作し、「無効なアクションです」エラーが解消される

## 📝 確認ポイント

1. **バージョン確認**: getVersionアクションで`"version": "2025-01-02-v3"`が返されること
2. **アクション数確認**: expectedActionsに6つのアクションがすべて含まれていること
3. **updateMeterReadings動作**: 検針データ更新が正常に完了すること

## ⚠️ 注意事項

- デプロイ後は必ず動作確認を実行してください
- 問題が発生した場合は、Google Apps Scriptのログ（実行ログ）を確認してください
- WebアプリURLが変更された場合は、フロントエンドのHTMLファイルも更新が必要です

## 🔧 修正された主な問題

### 問題1: doGet関数の構造エラー
```javascript
// ❌ 修正前（問題のある構造）
function doGet(e) {
  try {
    // getVersionが先頭で独立処理されていた
    if (e && e.parameter && e.parameter.action === 'getVersion') {
      return createCorsResponse(getGasVersion());
    }
    // この後のコードが実行されない場合があった
    
// ✅ 修正後（正しい構造）
function doGet(e) {
  try {
    // パラメータチェック後、すべてのアクションを同列で処理
    const action = e.parameter.action;
    
    if (action === 'getVersion') {
      return createCorsResponse(getGasVersion());
    }
    else if (action === 'getProperties') {
      return handleGetProperties();
    }
    // ... 他のアクション
```

この修正により、すべてのアクションが正常に認識されるようになります。
