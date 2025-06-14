# 🦁 Braveブラウザ キャッシュ問題 解決ガイド

## 📋 問題概要
BraveブラウザでWOFF削除済みのアプリを開くと、古いキャッシュされたWOFFコードが実行される問題が発生しています。

## 🔧 解決方法

### 方法1: ハードリフレッシュ（推奨）
```
1. Braveブラウザでアプリページを開く
2. 以下のキーを同時押し：
   - Windows/Linux: Ctrl + Shift + R
   - macOS: Cmd + Shift + R
```

### 方法2: 開発者ツールでキャッシュクリア
```
1. F12キーで開発者ツールを開く
2. Networkタブをクリック
3. 右クリック → "Clear browser cache"
4. ページをリロード（F5）
```

### 方法3: Braveブラウザ設定でキャッシュクリア
```
1. Brave設定を開く（brave://settings/）
2. 左メニュー「プライバシーとセキュリティ」
3. 「閲覧データの消去」をクリック
4. 「キャッシュされた画像とファイル」にチェック
5. 「データを消去」をクリック
```

### 方法4: プライベートウィンドウを使用
```
1. Ctrl/Cmd + Shift + N でプライベートウィンドウを開く
2. プライベートウィンドウでアプリにアクセス
```

## ✅ 正常動作の確認方法
ブラウザのコンソール（F12）で以下のエラーが**出ないこと**を確認：
```
❌ [ReactApp] woff.init with woffId: Mtmj4rddmxBddYCPD0G81A
```

正常時のログ：
```
✅ [PWA] Property Select page loaded with PWA support
✅ [ReactApp] Fetching properties from: [API URL]
```

## 🎯 なぜこの問題が発生するのか
- Braveブラウザは強力なキャッシュ機能を持っている
- WOFFコード削除前のJavaScriptファイルがキャッシュに残存
- Vercelの配信キャッシュとブラウザキャッシュの組み合わせ

## 📱 他ブラウザでの確認
以下のブラウザでは正常動作が確認されています：
- ✅ Safari (macOS/iOS)
- ✅ Chrome (デスクトップ/モバイル)
- ✅ Firefox (デスクトップ/モバイル)
- ✅ Edge (デスクトップ)
