# 📁 Google Apps Script ファイル移動完了

## ✅ 移動されたファイル

すべての `.gs` ファイルが `gas_scripts/` フォルダに移動されました。

### 移動されたファイル一覧
- `data_cleanup.gs` - データクリーンアップ機能
- `data_formatting.gs` - データフォーマット機能
- `data_management.gs` - データ管理機能
- `data_validation.gs` - データ検証機能
- `debug_functions.gs` - デバッグ機能、システム診断
- `debug_headers.gs` - ヘッダー情報デバッグ
- `dialog_functions.gs` - ダイアログ表示機能
- `gas_dialog_functions.gs` - **統合された主要機能**
- `main.gs` - エントリーポイント、onOpen()トリガー
- `utilities.gs` - 共通ユーティリティ関数
- `web_app_api.gs` - Web App API関数群
- `物件.gs` - 旧物件管理（参考用）
- `設定.gs` - 設定管理
- `総合カスタム処理.gs` - 旧カスタム処理（参考用）

## 📋 新しいプロジェクト構造

```
/Users/miya/Documents/GitHub/LINE_app_project/
├── gas_scripts/                    ← 🆕 Google Apps Scriptファイル専用フォルダ
│   ├── README.md                  ← デプロイメント手順書
│   ├── appsscript.json           ← プロジェクト設定ファイル
│   ├── main.gs                   ← エントリーポイント
│   ├── web_app_api.gs           ← Web App API
│   ├── gas_dialog_functions.gs  ← メイン機能
│   └── その他の.gsファイル
├── css_styles/                    ← スタイルシート
├── archive/                       ← アーカイブファイル
├── meter_reading.html            ← フロントエンドファイル
├── property_select.html
├── room_select.html
└── その他のプロジェクトファイル
```

## 🚀 次のステップ

### 1. Google Apps Scriptプロジェクトの作成
1. [Google Apps Script](https://script.google.com) にアクセス
2. 「新しいプロジェクト」を作成
3. プロジェクト名を「水道メーター読み取りアプリ」に設定

### 2. ファイルのアップロード順序
```
1. gas_scripts/main.gs → Code.gs にリネーム
2. gas_scripts/utilities.gs → 新しいファイルとして追加
3. gas_scripts/web_app_api.gs → 新しいファイルとして追加
4. gas_scripts/gas_dialog_functions.gs → 新しいファイルとして追加
5. 必要に応じて他のファイルも追加
```

### 3. Web Appとして公開
```
1. デプロイ → 新しいデプロイ
2. 種類: ウェブアプリ
3. 実行者: 自分
4. アクセス権限: 全員（または適切な権限）
5. デプロイ
```

## 🔧 重要な設定

### appsscript.json の設定
- **タイムゾーン**: Asia/Tokyo
- **ランタイム**: V8エンジン
- **ウェブアプリ実行者**: USER_DEPLOYING
- **アクセス権限**: ANYONE

### 必要なトリガー設定
- **onOpen**: スプレッドシートを開いた時のメニュー作成
- **doGet/doPost**: Web Appリクエスト処理

## 📝 整理の効果

1. **可読性向上**: ファイルが整理され、プロジェクト構造が明確に
2. **デプロイメント効率化**: 必要なファイルのみを簡単に特定可能
3. **保守性向上**: 機能別にファイルが分類され、メンテナンスが容易
4. **バージョン管理**: GitでのGoogle Apps Scriptファイル管理が効率的

これで Google Apps Script ファイルの整理が完了しました！ 🎉
