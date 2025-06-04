# 🚀 デプロイチェックリスト - 2025-06-05

## ✅ **完了済み**
- [x] 古いファイルの整理・削除
- [x] GASスクリプト統合 (`物件.gs` v2025-06-05-v1)
- [x] フロントエンド実装完了
- [x] 検針完了ボタン実装
- [x] CORS対応
- [x] sessionStorage URL管理

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
https://script.google.com/macros/s/AKfycbxAHusba4MsRks4sEfL1cpiFlm1cYv_P7IEkoLStiaaH3KgitcmUx3jFxfmAqpQwNyDCA/exec
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
