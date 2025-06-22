# 🚨 GAS Web App CORS エラー解決ガイド

## 現在の状況
- **Failed to fetch** エラーが発生
- CORS Preflight (OPTIONS) リクエストが **405 Method Not Allowed** 
- GAS Web App は動作しているが、ブラウザからのCORSリクエストが制限されている

## 解決方法

### 1. 🔧 GAS Web App デプロイメントの再設定

#### A. Google Apps Script で以下を確認:
```
1. script.google.com/home にアクセス
2. プロジェクトを開く
3. 「デプロイ」→「新しいデプロイ」
4. 設定を以下に変更:
   - 種類: ウェブアプリ
   - 実行者: 自分
   - アクセスできるユーザー: 全員 ← 重要！
5. 「デプロイ」をクリック
6. 新しいWeb App URLをコピー
```

#### B. 新しいURLを取得したら:
```bash
# このスクリプトで一括更新
./update_gas_url.sh "新しいURL"
```

### 2. 🧪 テスト方法

#### A. ローカルHTTPサーバーでテスト:
```bash
# ターミナルで実行
python3 -m http.server 8080

# ブラウザで以下を開く:
http://localhost:8080/cors_workaround_test.html
http://localhost:8080/login_test_fixed.html
```

#### B. コマンドラインでの直接テスト:
```bash
# 接続テスト
curl -L "https://script.google.com/macros/s/NEW_URL/exec?action=test"

# 認証テスト
curl -L "https://script.google.com/macros/s/NEW_URL/exec?action=authenticate&username=test_user&password=test_password"
```

### 3. 🔄 代替アプローチ

#### A. GAS Web App を使わない方法:
1. **Vercel/Netlify デプロイメント**
2. **Google Cloud Functions**
3. **Firebase Functions**

#### B. GAS内でのテスト:
1. main.gs の「ユーザー認証テスト」メニューを使用
2. スプレッドシート内で直接動作確認

### 4. 📋 チェックリスト

- [ ] GAS Web App が「全員」アクセス許可で デプロイされている
- [ ] 新しいデプロイメントを作成済み（古いURLは無効になる）
- [ ] ローカルHTTPサーバーでテスト実行済み
- [ ] curl での直接テストが成功している
- [ ] ブラウザの Developer Tools で詳細エラーを確認済み

### 5. 🆘 最終手段

上記すべてが失敗した場合:

#### A. GAS プロジェクトを新規作成:
1. 新しいGoogle Apps Script プロジェクトを作成
2. gas_scripts/ 内のコードをすべてコピー
3. 新しいWeb App URLでデプロイ
4. 新しいURLでテスト

#### B. プロキシサーバー経由:
1. CORS対応のプロキシサーバーを立てる
2. プロキシ経由でGAS Web Appにアクセス

---

## 現在推奨するテスト順序:

1. **cors_workaround_test.html** のiframeテストで到達確認
2. **ターミナルでcurlテスト**で機能確認
3. **GAS Web Appの再デプロイ**
4. **新しいURLでの再テスト**

問題が解決しない場合は、GAS Web App以外のホスティング方法を検討することをお勧めします。
