# 🚀 デプロイチェックリスト - 2025-01-02 CORS修正版

## ✅ **完了済み**
- [x] 古いファイルの整理・削除
- [x] GASスクリプト統合 (`物件.gs` v2025-01-02-v2)
- [x] フロントエンド実装完了
- [x] 検針完了ボタン実装
- [x] CORS対応完了
- [x] sessionStorage URL管理
- [x] GET方式での検針データ更新実装
- [x] React状態管理修正

## 🎯 **緊急対応が必要**

### ❌ **現在の問題**
- Google Apps Script が古いバージョンでデプロイされている
- `updateMeterReadings` と `updateInspectionComplete` が「無効なアクション」エラーになる

### 🔧 **解決方法**

#### 手順1: Google Apps Script の更新・再デプロイ
```
1. https://script.google.com/ にアクセス
2. 既存の水道検針プロジェクトを開く
3. 現在のコードを全て削除
4. 物件.gs (v2025-01-02-v2) の内容を全てコピー&ペースト
5. 保存 (Ctrl+S)
6. 「デプロイ」→「新しいデプロイ」または「デプロイを管理」→「新しいバージョン」
7. 実行ユーザーを「自分」、アクセス許可を「全員」に設定
8. 新しいWeb App URLを取得
```

#### 手順2: バージョン確認テスト
```
新しいURLで以下をテスト:
https://script.google.com/macros/s/[新しいURL]/exec?action=getVersion

期待される応答:
{
  "version": "2025-01-02-v2",
  "availableActions": ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"],
  "description": "CORS修正完了版：updateMeterReadings/updateInspectionComplete対応"
}
```

#### 手順3: フロントエンドのURL更新
- property_select.html で新しいGAS URLに変更
- テストページで動作確認

## 🎯 **今すぐ必要なアクション**

### 1. GAS Web Appデプロイ
```
1. https://script.google.com/ にアクセス
2. 既存プロジェクトを開く
3. 物件.gs の内容を全てコピー&ペースト
4. 保存 (Ctrl+S)
5. 「デプロイ」→「新しいデプロイ」
6. 新しいWeb App URLをコピー
```

### 2. 実装済み機能
- ✅ `getProperties` - 物件一覧取得
- ✅ `getRooms` - 部屋一覧取得  
- ✅ `updateInspectionComplete` - 検針完了日更新
- ✅ `getMeterReadings` - 検針データ取得
- ✅ `updateMeterReadings` - 検針データ更新
- ✅ `getVersion` - バージョン確認

### 3. テスト手順
```
1. test_gas_connection.html でGAS接続テスト
2. property_select.html → room_select.html → meter_reading.html の流れテスト
3. 検針完了ボタンのテスト
4. データ更新のテスト
```

## 📋 **必要なスプレッドシート構造**

### シート名と列構成
1. **物件マスタ**:
   - 物件ID | 物件名 | 検針完了日

2. **部屋マスタ**:
   - 物件ID | 部屋ID | 部屋名 | メーターID(オプション)

3. **inspection_data**:
   - 物件名 | 物件ID | 部屋ID | 検針日時 | 今回の指示数 | 前回指示数 | 前々回指示数 | 前々々回指示数 | 今回使用量 | 警告フラグ

## 🔧 **現在のGAS URL**
```
https://script.google.com/macros/s/AKfycbzra0CxJmciDBNons98S3F1jPCYsZqCHl2r-ZeDG6IkGjZ64f0qgEXkZguaIxLwriTUcA/exec
```

## ⚠️ **注意事項**
- 新しいデプロイ後は、property_select.html のURLを更新する必要があります
- 全ての古いファイルはarchive/フォルダに移動済み
- 最新のコードは物件.gs のみ使用してください

## 🎉 **デプロイ後確認項目**
- [ ] バージョン確認 (getVersion アクション)
- [ ] 物件一覧取得
- [ ] 部屋一覧取得
- [ ] 検針完了ボタン動作
- [ ] 検針データ更新
- [ ] エラーハンドリング

---
**最終更新**: 2025-06-05
**バージョン**: 2025-06-05-v1
**ステータス**: デプロイ準備完了 ✅
