# 🔧 GAS Web App 503/ネットワークエラー解決ガイド

## 🚨 現在の問題
- GAS Web App URL: `https://script.google.com/macros/s/AKfycbw4dn-KCK-iafRzd2Oq0GGMwID6mPwA9C3uuBHYq4yKcjKjJJmkzrkodRMZIVcSy1eu3A/exec`
- **HTTP 403 Forbidden エラー**が発生
- ログイン時にネットワークエラーとなる

## ✅ 解決手順

### Step 1: GAS プロジェクトのデプロイメント確認

1. [Google Apps Script](https://script.google.com/home) にアクセス
2. 該当プロジェクトを開く
3. 右上の「デプロイ」→「新しいデプロイ」をクリック

### Step 2: デプロイメント設定

```
種類: ウェブアプリ
説明: 水道検針アプリ API v3.0.0
実行者: 自分
アクセスできるユーザー: 全員 ← ⚠️ 重要！
```

### Step 3: 新しいURLの取得と設定

1. デプロイ完了後、新しいWeb App URLをコピー
2. 以下のファイルを更新：

#### `/Users/miya/Documents/GitHub/LINE_app_project/index.html`
```javascript
// 行302付近のGAS_WEB_APP_URLを新しいURLに更新
const GAS_WEB_APP_URL = '新しいURL';
```

#### `/Users/miya/Documents/GitHub/LINE_app_project/html_files/main_app/index.html`
```javascript
// 行284付近のGAS_WEB_APP_URLを新しいURLに更新
const GAS_WEB_APP_URL = '新しいURL';
```

### Step 4: 接続テスト

1. `/Users/miya/Documents/GitHub/LINE_app_project/gas_connection_test.html` を開く
2. 新しいURLを入力
3. 「基本接続テスト」を実行
4. 「パラメータ付きテスト」を実行
5. 「認証テスト」を実行

## 🔍 デバッグ用チェックリスト

### GAS側の確認事項
- [ ] doGet関数が実装されている
- [ ] CORSヘッダーが正しく設定されている
- [ ] 実行権限が「全員」に設定されている
- [ ] 最新版がデプロイされている

### フロントエンド側の確認事項
- [ ] URLが正しく設定されている
- [ ] fetch()でCORSヘッダーが適切に設定されている
- [ ] エラーハンドリングが実装されている

## 🛠️ GAS コードの確認

現在のGASファイル構成：
```
gas_scripts/
├── web_app_api.gs      ✅ doGet/doPost 実装済み
├── api_data_functions.gs ✅ 認証・データ取得機能
├── utilities.gs        ✅ エラーハンドリング
├── 設定.gs             ✅ 設定値・タイムアウト対策
└── main.gs            ✅ メニュー・テスト機能
```

## 📋 トラブルシューティング

### 403 Forbidden エラー
**原因**: 実行権限が適切に設定されていない
**解決**: デプロイメント設定で「アクセスできるユーザー: 全員」に設定

### CORS エラー
**原因**: CORSヘッダーが適切でない
**解決**: `web_app_api.gs`のcreateCorsJsonResponse関数が実装済み

### タイムアウトエラー
**原因**: GAS処理時間が30秒制限を超過
**解決**: 25秒タイムアウト対策を実装済み

## 🔗 便利リンク

- [Google Apps Script ダッシュボード](https://script.google.com/home)
- [Google Cloud Console](https://console.cloud.google.com/)
- [GAS接続診断ツール](./gas_connection_test.html)

## 📝 次のステップ

1. **新しいGAS Web App URLを取得**
2. **index.htmlのURLを更新**
3. **接続テストで動作確認**
4. **ログイン機能のテスト**

---

*最終更新: 2025-06-22*
