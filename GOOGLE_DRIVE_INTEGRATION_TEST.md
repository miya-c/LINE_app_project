# Google Drive API統合テストガイド

## 🎯 概要
meter_reading.htmlがGoogle Drive API直接アップロード方式に完全移行されました。このガイドでは、システムの動作テストと設定方法を説明します。

## 🔧 実装された機能

### 1. **Google Drive API直接アップロード**
- HTML5 File APIでファイルを選択
- Google Drive APIに直接アップロード（CORS問題を回避）
- 公開URLを生成してGASに送信（GETリクエスト）

### 2. **改善されたエラーハンドリング**
- Google API初期化待機機能
- 詳細なファイル検証（サイズ・形式）
- 認証エラーの適切な処理

### 3. **非同期処理の最適化**
- アップロード進捗表示
- タイムアウト処理
- クリーンアップ機能

## 📋 テスト前の設定

### 1. Google Cloud Console設定
```
1. Google Cloud Consoleにアクセス
2. 新しいプロジェクトを作成（または既存を選択）
3. Google Drive APIを有効化
4. 認証情報を作成：
   - APIキー
   - OAuth 2.0クライアントID
```

### 2. meter_reading.htmlの設定値更新
```javascript
// 以下の値を実際の値に置き換える
const GOOGLE_CONFIG = {
  apiKey: 'YOUR_GOOGLE_API_KEY',                    // ← 実際のAPIキー
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // ← 実際のクライアントID
  scope: 'https://www.googleapis.com/auth/drive.file',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
};
```

### 3. OAuth認証設定
```
承認済みJavaScriptオリジン:
- http://localhost:3000
- https://your-domain.com
- file:// (テスト用)

承認済みリダイレクトURI:
- http://localhost:3000
- https://your-domain.com
```

## 🧪 動作テスト手順

### Phase 1: 基本動作確認
1. **Google API初期化**
   ```
   ✓ ページを開いてConsoleで以下を確認：
   - [Google API] 初期化開始...
   - [Google API] Client初期化完了
   - window.googleApiReady = true
   ```

2. **ファイル選択**
   ```
   ✓ 「写真を追加」ボタンクリック
   ✓ カメラまたはギャラリーから画像選択
   ✓ ファイル検証メッセージの確認
   ```

### Phase 2: Google Drive連携確認
1. **認証プロセス**
   ```
   ✓ Google認証画面の表示
   ✓ 権限許可の確認
   ✓ Google Driveアクセス許可
   ```

2. **アップロード処理**
   ```
   ✓ "画像をGoogle Driveにアップロード中..." メッセージ
   ✓ Google Drive上にファイル作成確認
   ✓ 公開URL生成の確認
   ```

### Phase 3: GAS連携確認
1. **URL送信**
   ```
   ✓ "写真URLをサーバーに送信中..." メッセージ
   ✓ GAS関数updatePhotoUrlの実行
   ✓ スプレッドシートへの記録確認
   ```

2. **状態更新**
   ```
   ✓ 写真ボタンの色変更（青→緑）
   ✓ "写真をアップロードしました!" メッセージ
   ✓ 削除ボタンの表示
   ```

## 🔍 デバッグ方法

### Console出力の確認
```javascript
// 初期化確認
console.log(window.googleApiReady);    // true になるか
console.log(window.googleAuthReady);   // true になるか

// 認証状態確認
console.log(gapi.auth2.getAuthInstance().isSignedIn.get());

// アップロード結果確認
// [Google Drive] アップロード完了: {id: "file-id", name: "filename"}
// [Google Drive] 公開URL生成: https://drive.google.com/uc?id=...
```

### よくある問題と解決方法

1. **Google API初期化エラー**
   ```
   問題: window.googleApiReady が false のまま
   解決: APIキーとクライアントIDの確認
   ```

2. **認証エラー**
   ```
   問題: 認証画面が表示されない
   解決: OAuth設定の承認済みオリジンを確認
   ```

3. **アップロードエラー**
   ```
   問題: Google Drive APIエラー
   解決: Google Drive APIの有効化を確認
   ```

## 📁 ファイル構成

```
meter_reading.html - メインファイル（修正完了）
├── Google API Client Library 読み込み
├── initGoogleAPI() - 初期化関数
├── handleFileSelection() - ファイル選択処理
├── uploadFileToGoogleDrive() - Drive API直接アップロード
├── updatePhotoUrlInGAS() - GAS URL送信
└── handlePhotoDelete() - 写真削除処理
```

## 🚀 次のステップ

1. **Google Cloud Console設定の完了**
2. **実際のAPIキー・クライアントIDの設定**
3. **動作テストの実行**
4. **本番環境への適用**

## 📝 メモ
- 写真データはGoogle Driveに保存され、URLのみがGASに送信される
- CORS問題は完全に回避される
- 既存のGAS関数（handleUpdatePhotoUrl）は互換性維持
- ファイルサイズ制限: 10MB
- 対応形式: JPEG, PNG, WebP
