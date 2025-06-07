# 🚀 Google Drive API直接アップロード システム - セットアップガイド

## 📋 概要
このガイドでは、CORS制限を回避するためのGoogle Drive API直接アップロード機能の設定方法を説明します。

### 🔄 新しいアーキテクチャ
1. **従来方式（CORS問題あり）:**
   ```
   HTML → Base64画像POST → GAS → Google Drive → スプレッドシート
   ```

2. **新方式（CORS制限回避）:**
   ```
   HTML → Google Drive API直接 → Drive保存 → GAS(GET)でURL記録 → スプレッドシート
   ```

## 🛠️ セットアップ手順

### 1. Google Cloud Console設定

#### A. プロジェクト作成・選択
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成、または既存プロジェクトを選択
3. プロジェクト名: `水道検針PWA-DriveAPI` (例)

#### B. Google Drive API有効化
1. **ナビゲーション > APIs & Services > Library**
2. **「Google Drive API」を検索**
3. **「Enable」をクリック**

#### C. OAuth 2.0認証情報作成
1. **APIs & Services > Credentials**
2. **「+ CREATE CREDENTIALS」> 「OAuth client ID」**
3. **Application type:** Web application
4. **Name:** `水道検針PWA-Client`
5. **Authorized origins:** 
   - `http://localhost:3000` (テスト用)
   - `https://yourdomain.com` (本番用)
6. **Authorized redirect URIs:**
   - `http://localhost:3000/callback` (テスト用)
   - `https://yourdomain.com/callback` (本番用)
7. **「Create」をクリック**
8. **📋 Client IDをコピーして保存**

#### D. APIキー作成（必要に応じて）
1. **「+ CREATE CREDENTIALS」> 「API key」** 
2. **「Restrict Key」をクリック**
3. **API restrictions:** Google Drive API
4. **📋 APIキーをコピーして保存**

### 2. Google Apps Script デプロイ

#### A. スクリプトファイルの更新
```javascript
// 物件.gs に以下が追加されていることを確認:
function handleUpdatePhotoUrl(params) {
  // ✅ 既に実装済み - 写真URLをスプレッドシートに記録する関数
}
```

#### B. GAS Webアプリのデプロイ
1. **Google Apps Script Editor > Deploy > New Deployment**
2. **Type:** Web app
3. **Execute as:** Me
4. **Who has access:** Anyone
5. **「Deploy」をクリック**
6. **📋 Web app URLをコピー** (例: `https://script.google.com/macros/s/...../exec`)

### 3. HTMLファイルの設定

#### A. ファイル構成
- `photo_upload_direct.html` - メインの写真アップロードページ
- `物件.gs` - バックエンドのGAS関数

#### B. HTMLファイルでの設定
```html
<!-- Google Drive API設定セクション -->
<input type="password" id="apiKey" placeholder="Google Cloud ConsoleのAPIキー">
<input type="url" id="gasUrl" placeholder="https://script.google.com/macros/s/.../exec">
```

## 🔧 使用方法

### 1. 初期設定
1. `photo_upload_direct.html` をブラウザで開く
2. **Google Drive API キー** を入力
3. **Google Apps Script URL** を入力
4. **「API接続テスト」** をクリックして接続確認

### 2. 写真アップロード手順
1. **検針情報** を入力:
   - 物件ID: `PROP_001`
   - 部屋ID: `ROOM_001` 
   - 検針値・備考（任意）

2. **写真選択**:
   - 「写真を選択」ボタンで画像ファイルを選択
   - プレビュー表示で確認

3. **アップロード実行**:
   - 「写真をアップロード」ボタンをクリック
   - 進行状況バーで処理状況を確認
   - 完了時に成功メッセージを表示

### 3. オフライン機能
- **IndexedDB**: ネットワーク切断時に写真データを一時保存
- **自動再送信**: ネットワーク復旧時に未送信データを自動アップロード

## 🐛 トラブルシューティング

### よくあるエラーと解決方法

#### 1. CORS エラー
**エラー:** `Access to fetch at 'https://script.google.com' from origin 'null' has been blocked by CORS policy`

**解決方法:**
- HTMLファイルをローカルサーバーで実行
- または、HTTPSでホスティング

#### 2. API認証エラー
**エラー:** `401 Unauthorized` または `403 Forbidden`

**解決方法:**
1. OAuth 2.0認証フローの実装確認
2. APIキーの権限設定確認
3. ドメインの認証確認

#### 3. GAS関数エラー
**エラー:** `handleUpdatePhotoUrl is not defined`

**解決方法:**
1. 最新の`物件.gs`で関数が定義されていることを確認
2. GAS Webアプリを再デプロイ

#### 4. スプレッドシート書き込みエラー
**エラー:** `Exception: You do not have permission to call SpreadsheetApp.openById`

**解決方法:**
1. スプレッドシートの共有設定確認
2. GASの実行権限確認

## 🔐 セキュリティ考慮事項

### 1. APIキー管理
- APIキーは環境変数またはセキュアな設定ファイルで管理
- 本番環境では適切なキー制限を設定

### 2. OAuth認証
- 本番環境では適切なリダイレクトURLを設定
- スコープを必要最小限に制限

### 3. ファイルアクセス制御
- Google Driveフォルダの共有設定を適切に設定
- 不要なファイルアクセス権限を制限

## 📈 パフォーマンス最適化

### 1. ファイルサイズ制限
- 写真ファイルサイズを2MB以下に制限
- 自動リサイズ機能の実装

### 2. バッチ処理
- 複数写真の一度のアップロードサポート
- 進行状況の詳細表示

### 3. キャッシュ機能
- 設定値のローカルストレージ保存
- API レスポンスの適切なキャッシュ

## 🚀 今後の拡張機能

1. **認証の自動化** - OAuth フローの自動実行
2. **バックアップ機能** - 複数クラウドストレージ対応  
3. **画像認識** - メーター数値の自動読み取り
4. **レポート機能** - アップロード統計とダッシュボード

---

## 📞 サポート

問題が発生した場合は、以下の情報と共にお問い合わせください:
- エラーメッセージ
- ブラウザ名とバージョン
- 実行環境（ローカル/ホスティング）
- Google Cloud Console設定のスクリーンショット
