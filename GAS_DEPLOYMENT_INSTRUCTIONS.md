# 🚀 Google Apps Script デプロイ手順書

## ⚠️ 重要：CORS対応完了済みファイル

ファイル名: `deployment_ready_gas_file.gs`
作成日: 2025年6月16日
対応内容: CORS対応 + 503エラー修正

---

## 📋 デプロイ手順

### 1. Google Apps Script エディタにアクセス
- Google スプレッドシートを開く
- **拡張機能** → **Apps Script** をクリック

### 2. 既存コードのバックアップ（推奨）
- 現在のコードをコピーして別の場所に保存

### 3. 新しいコードをデプロイ
1. **Code.gs** ファイル（またはメインファイル）を開く
2. **全ての内容を削除**
3. `deployment_ready_gas_file.gs` の**全内容をコピー&ペースト**
4. **Ctrl + S** で保存

### 4. Web App として公開
1. 右上の **「デプロイ」** ボタンをクリック
2. **「新しいデプロイ」** を選択
3. **「種類を選択」** で **「ウェブアプリ」** を選択
4. 設定：
   - **説明**: `CORS対応版 - 2025年6月16日`
   - **実行者**: `自分`
   - **アクセスできるユーザー**: `全員`
5. **「デプロイ」** をクリック

### 5. 新しいURL取得
- デプロイ完了後に表示される **WebアプリのURL** をコピー
- 形式: `https://script.google.com/macros/s/NEW_DEPLOYMENT_ID/exec`

---

## 🔍 動作確認手順

### 1. ブラウザで直接テスト
新しいURLをブラウザで開く：
```
https://script.google.com/macros/s/NEW_DEPLOYMENT_ID/exec
```

**期待される結果**: API テストページが表示される

### 2. API エンドポイントテスト
```
https://script.google.com/macros/s/NEW_DEPLOYMENT_ID/exec?action=getProperties
```

**期待される結果**: JSON形式の物件データが返される（CORSヘッダー付き）

### 3. CORS確認
ブラウザの開発者ツールで以下のヘッダーが設定されていることを確認：
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`

---

## 📝 更新が必要なファイル

新しいURLが取得できたら、以下のファイルでURLを更新：

### HTML ファイル
- `html_files/main_app/property_select.html`
- `html_files/main_app/room_select.html`
- `html_files/main_app/meter_reading.html`
- `html_files/testing/api_test.html`
- `html_files/utilities/column_validation.html`

### 検索・置換
**旧URL**:
```
AKfycbyQ22XFqc8I8eq8khOlds1vdq28_QMBilQM2ASYlSWUEbF3awBgYAsHeRsqdJ6uw_Nd9w
```

**新URL**:
```
NEW_DEPLOYMENT_ID (デプロイ時に取得)
```

---

## ⚡ 期待される修正効果

✅ **503エラー解決**: `doGet`関数が正しく動作  
✅ **CORSエラー解決**: 適切なヘッダーが設定  
✅ **API アクセス可能**: Webアプリケーションからの呼び出し成功  

---

## 🆘 トラブルシューティング

### デプロイ後も503エラーが続く場合
1. ブラウザキャッシュをクリア
2. 数分待ってから再テスト
3. 新しいURLが正しく設定されているか確認

### CORS エラーが続く場合
1. デプロイが完了しているか確認
2. 適切な権限設定（「全員」アクセス可能）になっているか確認
3. 古いデプロイメントが残っていないか確認

### コード実行エラーが発生する場合
1. スプレッドシートに必要なシート（物件マスタ、部屋マスタ）が存在するか確認
2. Apps Script の実行権限を確認
3. ログを確認（Apps Script エディタの「実行数」タブ）

---

📞 **サポート**: 問題が解決しない場合は、エラーメッセージとスクリーンショットを添えてお問い合わせください。
