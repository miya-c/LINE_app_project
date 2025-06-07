# Google Apps Script デプロイ手順

## 1. Google Apps Script エディタを開く
- https://script.google.com/ にアクセス
- 「新しいプロジェクト」をクリック

## 2. コードを貼り付け
- デフォルトの `Code.gs` を削除
- `物件_simplified.gs` の内容を全てコピーして貼り付け

## 3. デプロイ
1. 「デプロイ」ボタンをクリック
2. 「新しいデプロイ」を選択
3. 「種類」を「ウェブアプリ」に設定
4. 「実行ユーザー」を「自分」に設定
5. 「アクセスできるユーザー」を「全員」に設定
6. 「デプロイ」をクリック

## 4. ウェブアプリURLの取得
- デプロイ後に表示されるURLをコピー
- 例: `https://script.google.com/macros/s/AKfycbxxxxx/exec`

## 5. URLの設定
- コピーしたURLを property_select.html の gasWebAppUrl に設定
- または、ブラウザの開発者ツールで sessionStorage に直接設定:
  ```javascript
  sessionStorage.setItem('gasWebAppUrl', 'YOUR_DEPLOYED_URL');
  ```

## 6. テスト
1. ローカルサーバーで property_select.html を開く
2. 「パルハイツ平田」を選択
3. 「101」を選択
4. meter_reading.html で実際のデータが表示されることを確認

## 現在のテストデータ
- 物件: パルハイツ平田 (P000001)
- 部屋: 101 (R000001)
- 検針日: 2025/05/31
- 今回指示数: 1208
- 前回指示数: 1186
- 使用量: 22
- 写真URL: https://drive.google.com/file/d/1QpCfRS7nL9yxhTqrRlrNlhTtggZ6XaDI/view?usp=drivesdk

## 注意事項
- この簡潔版は「パルハイツ平田の101」のデータのみを返します
- 実際のスプレッドシートとの連携は次のステップで実装します
- CORS問題は ContentService により解決済みです
