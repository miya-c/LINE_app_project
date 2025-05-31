# Google Apps Script デプロイ手順

## 修正された物件.gsをデプロイする手順

### 1. Google Apps Scriptエディタにアクセス
- [Google Apps Script](https://script.google.com/) にアクセス
- 既存のプロジェクトを開く

### 2. 物件.gsファイルを更新
- 左側のファイル一覧から「物件.gs」を選択
- **重要な修正箇所 (141行目周辺):**
```javascript
// ★★★ 修正前 (問題のあるコード) ★★★
// return ContentService.createTextOutput(JSON.stringify([]));

// ★★★ 修正後 (正しいコード) ★★★
const emptyResponseObject = {
  readings: [],
  debugInfo: {
    message: "データが存在しません（ヘッダー行のみ）",
    detectedHeaders: data.length > 0 ? data[0] : [],
    headerCount: data.length > 0 ? data[0].length : 0,
    threeTimesPreviousIndex: -1,
    threeTimesPreviousExists: false,
    totalDataRows: 0,
    filteredReadings: 0
  }
};
return ContentService.createTextOutput(JSON.stringify(emptyResponseObject))
  .setMimeType(ContentService.MimeType.JSON);
```

### 3. ファイル全体をコピー＆ペースト
- ローカルの`物件.gs`ファイルの内容をすべてコピー
- Google Apps Scriptエディタに貼り付け
- `Ctrl+S` で保存

### 4. 新しいデプロイを作成
1. **「デプロイ」ボタン**をクリック
2. **「新しいデプロイ」**を選択
3. 設定：
   - **種類**: ウェブアプリ
   - **実行者**: 自分
   - **アクセスできるユーザー**: 全員
4. **「デプロイ」ボタン**をクリック
5. **新しいウェブアプリURL**をコピー

### 5. meter_reading.htmlのURLを更新
- `meter_reading.html`の`const GAS_URL`を新しいURLに更新

### 6. テスト
- ブラウザでmeter_reading.htmlを開いて動作確認

## 確認すべき変更点

### サーバーサイド (物件.gs)
- [ ] Line 141: 空データ時のレスポンス構造修正
- [ ] threeTimesPrevious列の処理改善
- [ ] デバッグ情報の追加

### 期待される結果
- ブラウザコンソールで`reading.threeTimesPrevious`がundefinedではなく実際の値を表示
- サーバーレスポンスが`{readings: [], debugInfo: {}}`構造で返される

## トラブルシューティング
- デプロイ後も古いレスポンスが返される場合：キャッシュをクリア
- 権限エラーが発生する場合：スプレッドシートの共有設定を確認
