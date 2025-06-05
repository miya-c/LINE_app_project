# 🚨 緊急：Google Apps Script v3-DEBUG強制デプロイ手順

## 現在の状況
新しいURL: `https://script.google.com/macros/s/AKfycbyfRykRV1K4owG-GIXs_RtrNf83WiLIsXoXs2KQ5lQqE41A431JThmyE13izw0qir-1/exec`

**問題**: まだ古いv2バージョン（3つのアクションのみ）が動作中
**目標**: v3-DEBUG版（6つのアクション）をデプロイ

## 🔥 STEP-BY-STEP 強制デプロイ手順

### 1. Google Apps Scriptエディタでの確認
1. https://script.google.com にアクセス
2. 現在のプロジェクトを開く
3. **ファイル内容の確認**：
   - コードの最初の行に `// 水道検針WOFF GAS Web App - 2025-01-02-v3-DEBUG` があるか確認
   - `getGasVersion` 関数内で `version: "2025-01-02-v3-DEBUG"` になっているか確認

### 2. コード完全置換（重要）
1. **現在のコードを全削除**：
   - `Ctrl+A` で全選択
   - `Delete` で削除

2. **新しいコードを貼り付け**：
   - `物件.gs` ファイルの内容を全てコピー
   - GASエディタに貼り付け
   - `Ctrl+S` で保存

### 3. 新しいデプロイメント
1. **右上の「デプロイ」ボタンをクリック**
2. **「新しいデプロイ」を選択**
3. **設定**：
   - 種類：「ウェブアプリ」
   - 説明：`v3-DEBUG-FINAL-$(現在時刻)`
   - 実行ユーザー：「自分」
   - アクセスできるユーザー：「全員」
4. **「デプロイ」ボタンをクリック**

### 4. 確認テスト
新しいURLで以下をテスト：
```
https://script.google.com/macros/s/AKfycbyfRykRV1K4owG-GIXs_RtrNf83WiLIsXoXs2KQ5lQqE41A431JThmyE13izw0qir-1/exec?action=getVersion
```

**期待レスポンス（成功）**：
```json
{
  "version": "2025-01-02-v3-DEBUG",
  "description": "🔥🔥🔥 v3-DEBUG版が動作中です！ 🔥🔥🔥",
  "availableActions": ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"]
}
```

**失敗レスポンス（まだ古いバージョン）**：
```json
{
  "error": "無効なアクションです。",
  "expectedActions": ["getProperties", "getRooms", "getMeterReadings"]
}
```

## 🆘 それでも解決しない場合

### オプション1: 完全新規プロジェクト
1. **新しいGoogle Apps Scriptプロジェクトを作成**
2. **プロジェクト名**: `水道検針WOFF-v3-FINAL-NEW`
3. **Code.gsの内容を削除**
4. **`物件.gs`の内容を全てコピペ**
5. **新しいウェブアプリとしてデプロイ**

### オプション2: 強制リフレッシュ
1. **ブラウザキャッシュクリア**：`Ctrl+Shift+Delete`
2. **GASエディタリフレッシュ**：`Ctrl+F5`
3. **シークレットモードで動作確認**

## 📋 チェックリスト
- [ ] GASエディタでコードが v3-DEBUG になっている
- [ ] 新しいデプロイメントを実行済み
- [ ] 新しいURLでテスト済み
- [ ] レスポンスに "v3-DEBUG" が含まれている
- [ ] 6つのアクションが利用可能

## ⚡ 緊急時メモ
- 古いバージョンが動作する = デプロイが正しく行われていない
- 必ず「新しいデプロイ」を使用する
- 「デプロイを管理」から古いバージョンを無効化することも可能

---
最終更新: 2025年1月2日
