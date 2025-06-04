# 🚨 緊急：GAS Web App 再デプロイ手順

## 現在の状況
- **パラメータ受信の問題**: フロントエンドからのパラメータがGASで受信できない
- **解決方法**: 最新のGASスクリプトを再デプロイする必要があります

## 🔧 手順1: Google Apps Script エディタでコードを更新

### 1-1. GASエディタにアクセス
1. [Google Apps Script](https://script.google.com/) を開く
2. 既存の「物件.gs」プロジェクトを開く

### 1-2. 最新コードを貼り付け
**重要**: 現在のローカルファイル `物件.gs` の内容をGASエディタに完全にコピーしてください。

特に重要な修正点：
```javascript
function doGet(e) {
  // 最新のデバッグ情報
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG ${timestamp}] doGet開始`);
  
  // eオブジェクトの詳細分析
  console.log("[DEBUG] e オブジェクト存在:", !!e);
  
  if (e) {
    console.log("[DEBUG] e.parameter:", JSON.stringify(e.parameter));
    console.log("[DEBUG] e.queryString:", e.queryString);
    console.log("[DEBUG] e.parameters:", JSON.stringify(e.parameters));
    
    // プロパティを一つずつチェック
    for (let key in e) {
      console.log(`[DEBUG] e.${key}:`, e[key]);
    }
  }
  
  // パラメータが空または存在しない場合の詳細チェック
  if (!e || !e.parameter || Object.keys(e.parameter).length === 0) {
    const debugInfo = {
      timestamp: timestamp,
      hasE: !!e,
      hasParameter: !!(e && e.parameter),
      parameterKeys: e && e.parameter ? Object.keys(e.parameter) : [],
      queryString: e ? e.queryString : null,
      allKeys: e ? Object.keys(e) : []
    };
    
    console.log("[DEBUG] パラメータが空またはなし - デバッグ情報:", JSON.stringify(debugInfo));
    
    return ContentService.createTextOutput(JSON.stringify({ 
      error: "リクエストパラメータがありません。",
      debugInfo: debugInfo
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const action = e.parameter.action;
  console.log("[DEBUG] doGet - actionパラメータ:", action);
  
  // 続きのコード...
}
```

## 🚀 手順2: 新しいデプロイの作成

### 2-1. デプロイの実行
1. GASエディタで「デプロイ」ボタンをクリック
2. **「新しいデプロイ」を選択**
3. 設定を入力：
   - **種類**: ウェブアプリ
   - **説明**: `パラメータ受信修正版 - 2025年6月4日`
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: 全員
4. **「デプロイ」をクリック**

### 2-2. 新しいURLを取得
- デプロイ完了後、**新しいWeb App URL**をコピー
- 例: `https://script.google.com/macros/s/NEW_DEPLOYMENT_ID/exec`

## 🧪 手順3: デバッグテストの実行

### 3-1. デバッグツールで新しいURLをテスト
1. `debug_gas_params.html` をブラウザで開く
2. 新しいGAS Web App URLを入力フィールドに貼り付け
3. 「緊急診断」ボタンをクリック
4. 各テストの結果を確認

### 3-2. 成功の確認
以下のようなレスポンスが表示されれば成功：
```json
{
  "success": true,
  "hasParameter": true,
  "parameterCount": 1,
  "queryString": "action=test"
}
```

## 📝 手順4: HTMLファイルのURL更新

新しいURLをテストで成功したら、以下のファイルでURLを更新：

### 4-1. property_select.html
```javascript
const gasWebAppUrl = '新しいURL';
```

### 4-2. room_select.html
```javascript
const gasWebAppUrl = '新しいURL';
```

## ⚠️ トラブルシューティング

### 問題1: まだパラメータが受信できない
**解決策**:
1. ブラウザのキャッシュをクリア（Ctrl+Shift+Del）
2. デプロイから5-10分待つ
3. GASの実行ログを確認（Apps Script エディタ > 実行数 > ログを表示）

### 問題2: 権限エラー
**解決策**:
1. GASプロジェクトの権限を再確認
2. 「アクセスできるユーザー」を「全員」に設定
3. スプレッドシートの共有設定を確認

### 問題3: スプレッドシートが見つからない
**解決策**:
1. GASプロジェクトが正しいスプレッドシートにバインドされているか確認
2. スプレッドシートに「物件マスタ」シートが存在するか確認

## 🎯 最優先タスク

1. **今すぐ実行**: GAS Web Appの再デプロイ
2. **テスト**: デバッグツールで新しいURLをテスト
3. **更新**: 成功したらHTMLファイルのURLを更新
4. **検証**: 「検針完了」ボタンの動作を確認

---

**注意**: このプロセスを完了しないと、「検針完了」機能は動作しません。
