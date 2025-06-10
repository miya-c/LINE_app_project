# 🚀 Google Apps Script デプロイメント手順書

## 📋 デプロイメント前の確認事項

### 必要なファイル
- ✅ `property_select_gas.html` (物件選択画面)
- ✅ `room_select_gas.html` (部屋選択画面)  
- ✅ `meter_reading_gas.html` (検針入力画面)
- ✅ `gas_dialog_functions_fixed.gs` (GAS関数ライブラリ)

### 前提条件
- Google Spreadsheetが作成済み
- 必要なシート（`property_master`, `room_master`, `inspection_data`）が存在
- Google Apps Script プロジェクトが作成済み

## 🔧 ステップ1: HTMLファイルの追加

### 1.1 Google Apps Script エディタを開く
1. Google Spreadsheetを開く
2. 「拡張機能」→「Apps Script」をクリック

### 1.2 HTMLファイルを追加
各HTMLファイルを以下の手順で追加：

1. **ファイル追加**:
   - 「+」ボタン → 「HTML」を選択
   - ファイル名を入力（例：`property_select_gas`）

2. **内容をコピー**:
   - ローカルのHTMLファイル内容をコピー
   - GASエディタにペースト

3. **保存**:
   - `Ctrl+S` (Windows) または `Cmd+S` (Mac)

### 1.3 追加するHTMLファイル
```
property_select_gas.html → property_select_gas
room_select_gas.html     → room_select_gas  
meter_reading_gas.html   → meter_reading_gas
```

## 🔧 ステップ2: GAS関数の統合

### 2.1 既存のコード.gsファイルを開く
または新しい .gs ファイルを作成

### 2.2 gas_dialog_functions_fixed.gs の内容を追加
1. ローカルの `gas_dialog_functions_fixed.gs` を開く
2. 全内容をコピー
3. GASエディタにペースト（既存コードの下に追加）

### 2.3 保存と確認
- `Ctrl+S` で保存
- 関数一覧に以下の関数が表示されることを確認：
  - `showPropertySelectDialog`
  - `openRoomSelectDialog`
  - `openMeterReadingDialog`
  - `getProperties`
  - `getRooms`
  - `getMeterReadings`
  - `updateMeterReadings`

## 🔧 ステップ3: 初期設定の実行

### 3.1 onOpenトリガーの設定
1. GASエディタで関数 `setupOnOpenTrigger` を選択
2. 「実行」ボタンをクリック
3. 必要に応じて権限を許可

### 3.2 実行結果の確認
実行ログに以下のメッセージが表示されればOK：
```
✅ onOpenトリガーが正常に設定されました
```

## 🔧 ステップ4: メニューの確認

### 4.1 Spreadsheetを再読み込み
1. Google Spreadsheetのタブを閉じる
2. 再度Spreadsheetを開く

### 4.2 メニュー確認
メニューバーに「検針アプリ」が表示されることを確認：
```
ファイル 編集 表示 挿入 書式 データ ツール 拡張機能 ヘルプ 検針アプリ
                                                    ↑
                                               追加されたメニュー
```

## 🔧 ステップ5: 動作テスト

### 5.1 基本動作テスト
1. **物件選択**:
   - 「検針アプリ」→「物件選択」をクリック
   - 物件一覧が表示されることを確認

2. **部屋選択**:
   - 物件を選択
   - 部屋選択ダイアログが開くことを確認

3. **検針入力**:
   - 部屋を選択
   - 検針入力ダイアログが開くことを確認

### 5.2 データ入力テスト
1. **新規検針データ**:
   - 初回検針の場合、指示数入力フォームが表示
   - 数値を入力して保存

2. **既存データ更新**:
   - 既存の検針データが表示
   - 指示数を変更して更新

## 🔧 ステップ6: バリデーション実行

### 6.1 テスト関数の実行
1. GASエディタで `runAllValidationTests` を選択
2. 「実行」ボタンをクリック

### 6.2 実行ログの確認
以下のテストが全て PASS することを確認：
- データ検出ロジックのテスト
- CSVデータ構造のテスト  
- 修正されたクリーンアップ機能の安全性テスト

## 🚨 トラブルシューティング

### エラー: "HTMLファイルが見つからない"
**原因**: HTMLファイル名の不一致
**解決方法**: 
1. GASエディタのファイル名を確認
2. 正確なファイル名（拡張子なし）で作成

### エラー: "関数が定義されていない"  
**原因**: GAS関数の追加漏れ
**解決方法**:
1. `gas_dialog_functions_fixed.gs` の内容が正しく追加されているか確認
2. ファイルを保存して再実行

### エラー: メニューが表示されない
**原因**: onOpenトリガーの設定不備
**解決方法**:
1. `setupOnOpenTrigger()` を再実行
2. Spreadsheetを完全に閉じて再度開く

### エラー: 権限エラー
**原因**: スクリプトの実行権限不足
**解決方法**:
1. 実行時に表示される権限許可ダイアログで「許可」をクリック
2. 必要に応じてGoogleアカウントでの認証を完了

## ✅ デプロイメント完了チェックリスト

- [ ] HTMLファイル3つが正しく追加されている
- [ ] GAS関数が正しく追加されている  
- [ ] `setupOnOpenTrigger()` が正常実行されている
- [ ] 「検針アプリ」メニューが表示されている
- [ ] 物件選択ダイアログが正常に開く
- [ ] 部屋選択ダイアログが正常に開く
- [ ] 検針入力ダイアログが正常に開く
- [ ] データ入力・更新が正常に動作する
- [ ] `runAllValidationTests()` が全てPASSしている

## 🎉 デプロイメント完了

全てのチェック項目が完了したら、水道メーター読み取りLINEアプリのGoogle Apps Script版デプロイメントは完了です！

---

**最終更新**: 2025年6月11日  
**ステータス**: ✅ 完成
