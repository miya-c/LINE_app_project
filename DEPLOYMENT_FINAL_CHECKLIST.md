# 🚀 最終デプロイチェックリスト - 水道検針アプリ

## ✅ デプロイ前確認事項

### 1. **ファイル準備完了確認**
- ✅ `gas_dialog_functions.gs` (985行 - メイン統合ファイル)
- ✅ `property_select_gas.html` (572行 - 物件選択UI)
- ✅ `room_select_gas.html` (482行 - 部屋選択UI)  
- ✅ `meter_reading_gas.html` (1073行 - 検針入力UI)
- ✅ 全ファイルエラー0件

### 2. **Google Spreadsheet準備**
- [ ] 対象のGoogle Spreadsheetを開く
- [ ] 以下のシートが存在することを確認：
  - `物件マスタ` (列: 物件ID, 物件名, 検針完了日)
  - `部屋マスタ` (列: 物件ID, 部屋ID, 部屋名, メーターID)
  - `inspection_data` (検針データ用 - 自動作成されます)

---

## 🔧 Step 1: Google Apps Script エディタへの追加

### **1.1 Apps Script エディタを開く**
```
1. Google Spreadsheet → 拡張機能 → Apps Script
2. 新しいプロジェクトが開きます
```

### **1.2 メインスクリプトファイルの追加**
```
1. デフォルトの「Code.gs」を削除
2. 「+」ボタン → 「スクリプト」
3. ファイル名: gas_dialog_functions
4. gas_dialog_functions.gs の内容を全てコピー＆ペースト
```

### **1.3 HTMLファイルの追加**
```
各HTMLファイルを順番に追加:

ファイル1:
- 「+」ボタン → 「HTML」
- ファイル名: property_select_gas
- property_select_gas.html の内容をコピー＆ペースト

ファイル2:  
- 「+」ボタン → 「HTML」
- ファイル名: room_select_gas
- room_select_gas.html の内容をコピー＆ペースト

ファイル3:
- 「+」ボタン → 「HTML」  
- ファイル名: meter_reading_gas
- meter_reading_gas.html の内容をコピー＆ペースト
```

### **1.4 保存と確認**
```
1. Ctrl+S (Cmd+S) で保存
2. エラーがないことを確認
3. プロジェクト名を「水道検針アプリ」に変更
```

---

## 🎯 Step 2: 初回テスト実行

### **2.1 システム健全性チェック**
```
1. 関数選択ドロップダウンから「checkSystemHealth」を選択
2. 「実行」ボタンをクリック
3. 実行ログで以下を確認：
   ✅ HTML ファイル存在確認
   ✅ シート存在確認  
   ✅ 基本機能確認
```

### **2.2 メニュー設定**
```
1. 関数「setupOnOpenTrigger」を実行
2. Google Spreadsheetを再読み込み (F5)
3. メニューバーに以下が表示されることを確認：
   - 「水道検針」メニュー
   - 「総合カスタム処理」メニュー
```

---

## 🌐 Step 3: Web App デプロイ (オプション)

### **3.1 Web App として公開**
```
1. Apps Script エディタで「デプロイ」→「新しいデプロイ」
2. 設定:
   - 種類: ウェブアプリ
   - 実行ユーザー: 自分
   - アクセス権限: 組織内のユーザー（推奨）
3. 「デプロイ」をクリック
4. Web AppのURLをコピーして保存
```

### **3.2 Web App テスト**
```
1. デプロイされたURLにアクセス
2. 物件選択画面が表示されることを確認
3. Web App環境の制限メッセージが表示されることを確認
```

---

## 📋 Step 4: 運用開始

### **4.1 推奨利用方法**
```
✅ メイン利用: Spreadsheetメニュー「水道検針」→「アプリを開く」
⚠️ 補助利用: Web App URL（制限あり）
```

### **4.2 ユーザーガイダンス**
```
エンドユーザーには以下を案内:
1. Google Spreadsheetを開く
2. メニューバー「水道検針」をクリック
3. 「アプリを開く」を選択
4. 物件選択 → 部屋選択 → 検針入力の順で操作
```

---

## 🔍 Step 5: トラブルシューティング

### **5.1 よくある問題と解決法**

#### **メニューが表示されない**
```
解決法:
1. Spreadsheetを再読み込み (F5)
2. setupOnOpenTrigger() 関数を再実行
3. ブラウザのキャッシュをクリア
```

#### **「この関数はスプレッドシートのメニューから...」エラー**
```
解決法:
1. Apps Script エディタから直接実行しない
2. Spreadsheetのメニューから操作する
3. showExecutionGuidance() 関数で詳細確認
```

#### **データが表示されない**
```
解決法:
1. シート名の確認（物件マスタ、部屋マスタ）
2. データ形式の確認（必須列の存在）
3. checkSystemHealth() で診断実行
```

---

## 🎉 デプロイ完了確認

### **最終チェックリスト:**
- [ ] Google Apps Script にファイル追加完了
- [ ] システム健全性チェック実行 ✅
- [ ] Spreadsheet メニュー表示確認 ✅  
- [ ] 物件選択ダイアログ動作確認 ✅
- [ ] 部屋選択機能動作確認 ✅
- [ ] 検針入力機能動作確認 ✅
- [ ] Web App デプロイ完了 ✅（オプション）

### **🎯 運用開始準備完了！**

---

## 📞 サポート機能

### **診断関数:**
- `checkSystemHealth()` - システム全体の健全性確認
- `testExecutionContext()` - 実行コンテキストテスト  
- `showExecutionGuidance()` - 実行方法ガイダンス

### **メンテナンス関数:**
- `createInitialInspectionData()` - 検針データ初期化
- `populateInspectionDataFromMasters()` - マスタ連携
- `formatPropertyIdsInPropertyMaster()` - 物件ID正規化

**最終更新:** 2024年12月19日  
**デプロイステータス:** 🚀 **準備完了**
