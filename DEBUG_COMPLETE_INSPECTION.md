# 検針完了機能デバッグガイド

## 🚨 問題の概要
部屋選択画面で「検針完了ボタン」を押してもスプレッドシートの物件マスタシート「検針完了日」に記録されない問題が発生している。

## 🔍 調査対象
1. **クライアント側** - room_select.htmlの検針完了API呼び出し
2. **GAS側** - web_app_api.gsとapi_data_functions.gsの処理
3. **スプレッドシート** - 物件マスタシートの構造と権限

## 🛠️ デバッグ手順

### Step 1: デバッグツールを使用
1. `test_complete_inspection_debug.html`をブラウザで開く
2. GAS WebApp URLを設定（Google Apps Scriptの公開URLを入力）
3. 物件ID（例: P000002）を設定
4. 各種テストを実行

### Step 2: 事前確認
```javascript
// 1. API接続テスト
testApiConnectivity() // 基本的な接続確認

// 2. スプレッドシート情報確認
checkSpreadsheetAccess() // シート一覧と構造確認

// 3. 物件マスタデータ確認
getPropertyMasterData() // 実際のデータ構造確認
```

### Step 3: 検針完了処理テスト
```javascript
// メイン機能テスト
testCompleteInspection() // 実際の検針完了処理実行
```

## 🔧 考えられる原因と対策

### 原因1: スプレッドシート権限問題
**症状**: `権限がありません` エラー
**対策**: 
- GASがスプレッドシートに書き込み権限を持っているか確認
- スプレッドシートの共有設定で「編集者」権限を付与

### 原因2: シート名・カラム名の不一致
**症状**: `シートが見つかりません` または `カラムが見つかりません`
**対策**:
- スプレッドシートで実際のシート名が「物件マスタ」であることを確認
- カラム名が「物件ID」「物件名」「検針完了日」であることを確認

### 原因3: 物件IDの不一致
**症状**: `物件IDが見つかりません`
**対策**:
- 指定した物件IDがスプレッドシートに存在することを確認
- 大文字小文字、空白文字の違いをチェック

### 原因4: APIパラメータの問題
**症状**: APIエラーまたは無応答
**対策**:
- URLパラメータが正しく設定されているか確認
- エンコーディングが適切に行われているか確認

## 📊 デバッグ用API詳細

### getSpreadsheetInfo
```
GET {gasWebAppUrl}?action=getSpreadsheetInfo
```
レスポンス例:
```json
{
  "success": true,
  "data": {
    "spreadsheetId": "1ABC...",
    "spreadsheetName": "検針管理システム",
    "sheets": [
      {"name": "物件マスタ", "rowCount": 39, "columnCount": 3},
      {"name": "部屋マスタ", "rowCount": 100, "columnCount": 5}
    ]
  }
}
```

### getPropertyMaster
```
GET {gasWebAppUrl}?action=getPropertyMaster
```
レスポンス例:
```json
{
  "success": true,
  "data": {
    "headers": ["物件ID", "物件名", "検針完了日"],
    "rowCount": 38,
    "sampleRows": [
      ["P000001", "パルハイツ平田", "2025-06-09"],
      ["P000002", "パルハイツ平田", ""],
      ["P000006", "コ－ポひろた", ""]
    ]
  }
}
```

### completeInspection
```
GET {gasWebAppUrl}?action=completeInspection&propertyId=P000002&completedAt=2025-01-21T10:30:00.000Z&completedBy=user
```
正常時レスポンス例:
```json
{
  "success": true,
  "message": "検針完了日を更新しました",
  "propertyId": "P000002",
  "completionDate": "2025-01-21",
  "oldValue": "",
  "newValue": "2025-01-21",
  "rowIndex": 3
}
```

## 🚨 エラーパターンと解決方法

### パターン1: シートアクセスエラー
```
エラー: 物件マスタシートが見つかりません
```
**解決方法**: スプレッドシートでシート名を「物件マスタ」に変更

### パターン2: カラムアクセスエラー
```
エラー: 物件マスタに「検針完了日」列が見つかりません
```
**解決方法**: スプレッドシートでヘッダー行にカラム名を追加

### パターン3: 物件ID検索エラー
```
エラー: 指定された物件ID「P000002」が物件マスタに見つかりません
```
**解決方法**: 物件IDの存在確認、データの整合性チェック

### パターン4: 権限エラー
```
エラー: 書き込み権限がありません
```
**解決方法**: GASの権限設定、スプレッドシートの共有設定確認

## 📝 ログの確認方法

### GAS側ログ
1. Google Apps Script エディタを開く
2. 「実行」→「ログを表示」でログを確認
3. `console.log`と`Logger.log`の両方を確認

### ブラウザ側ログ
1. ブラウザの開発者ツールを開く（F12）
2. Consoleタブでログを確認
3. Networkタブでリクエスト/レスポンスを確認

## 🔄 修正後の確認手順
1. GASファイルをGoogle Apps Scriptにデプロイ
2. `test_complete_inspection_debug.html`でテスト実行
3. 正常に完了したらスプレッドシートで更新を確認
4. 本番の`room_select.html`で動作確認

## 📁 関連ファイル
- `/gas_scripts/web_app_api.gs` - WebApp API処理
- `/gas_scripts/api_data_functions.gs` - データ操作関数
- `/html_files/main_app/room_select.html` - 検針完了ボタン実装
- `/test_complete_inspection_debug.html` - デバッグツール
- `/csv/物件マスタ.csv` - 参考データ構造
