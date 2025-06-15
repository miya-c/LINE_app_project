# 水道検針アプリ - 関数機能リファレンス

## 概要
元の巨大ファイル `gas_dialog_functions.gs` (1737行) を10個の機能別ファイルに分割した後の、各ファイルの関数機能一覧です。

## ファイル構成と関数一覧

### 1. main.gs - メインエントリーポイント
**役割**: アプリケーションのメインエントリーポイントとメニュー管理

| 関数名 | 説明 | 元ファイル |
|--------|------|-----------|
| `showWaterMeterApp()` | 水道検針アプリのメインエントリーポイント（メニュー用） | gas_dialog_functions.gs |
| `onOpen()` | スプレッドシート開始時のメニュー作成関数 | gas_dialog_functions.gs |

### 2. utilities.gs - ユーティリティ関数
**役割**: 共通ユーティリティ機能とUI操作サポート

| 関数名 | 説明 | 元ファイル |
|--------|------|-----------|
| `isUiAvailable()` | 実行コンテキストを検証し、UIが利用可能かチェック | gas_dialog_functions.gs |
| `showExecutionGuidance()` | 実行コンテキストエラー時のユーザーガイダンス | gas_dialog_functions.gs |
| `safeAlert(title, message)` | UI操作を安全に処理するためのヘルパー関数 | 総合カスタム処理.gs |

### 3. dialog_functions.gs - ダイアログ表示機能
**役割**: HTML ダイアログの表示とユーザーインターフェース

| 関数名 | 説明 | 元ファイル |
|--------|------|-----------|
| `showPropertySelectDialog()` | 物件選択ダイアログを表示 | gas_dialog_functions.gs |
| `openRoomSelectDialog(propertyId, propertyName)` | 部屋選択ダイアログを表示 | gas_dialog_functions.gs |
| `openMeterReadingDialog(propertyId, propertyName, roomId, roomName)` | 検針入力ダイアログを表示 | gas_dialog_functions.gs |

### 4. web_app_api.gs - Web App API ハンドラー
**役割**: Web アプリケーション API とデータ更新処理

| 関数名 | 説明 | 元ファイル |
|--------|------|-----------|
| `doGetFromBukken(e)` | Web App用のメイン関数 - API要求とHTML表示を処理 | 物件.gs |
| `updateMeterReadings(propertyId, roomId, readings)` | 検針データを更新 | 物件.gs |

### 5. data_management.gs - データ管理機能
**役割**: マスターデータの管理と検針データの生成・処理

| 関数名 | 説明 | 元ファイル |
|--------|------|-----------|
| `populateInspectionDataFromMasters()` | inspection_dataを物件マスタと部屋マスタから自動生成 | 総合カスタム処理.gs |
| `createInitialInspectionData()` | inspection_dataの初期データ作成 | 総合カスタム処理.gs |
| `processInspectionDataMonthly()` | 検針データの月次保存処理 | 総合カスタム処理.gs |

### 6. data_formatting.gs - データフォーマット機能
**役割**: データフォーマットの統一と変換処理

| 関数名 | 説明 | 元ファイル |
|--------|------|-----------|
| `formatPropertyIdsInPropertyMaster()` | 物件マスタの物件IDフォーマット変更 | 総合カスタム処理.gs |
| `formatPropertyIdsInRoomMaster()` | 部屋マスタの物件IDフォーマット変更 | 総合カスタム処理.gs |

### 7. data_validation.gs - データ検証と整合性チェック
**役割**: データの整合性検証とインデックス作成

| 関数名 | 説明 | 元ファイル |
|--------|------|-----------|
| `validateInspectionDataIntegrity()` | データ整合性チェック機能 | 総合カスタム処理.gs |
| `createDataIndexes()` | データ高速検索用のインデックスを作成 | 総合カスタム処理.gs |
| `generateDataStatistics()` | データの基本統計情報を収集・表示 | 新規追加 |

### 8. data_cleanup.gs - データクリーンアップ機能
**役割**: 重複データや孤立データの削除処理

| 関数名 | 説明 | 元ファイル |
|--------|------|-----------|
| `optimizedCleanupDuplicateInspectionData()` | 重複データクリーンアップ機能 | 総合カスタム処理.gs |
| `cleanUpOrphanedRooms()` | 部屋マスタ整合性チェックと孤立部屋データの削除 | 総合カスタム処理.gs |
| `cleanUpEmptyData()` | 空白・無効データの削除 | 新規追加 |
| `cleanUpOrphanedInspectionData()` | inspection_dataから孤立データを削除 | 新規追加 |
| `runCompleteDataCleanup()` | 全データクリーンアップの実行 | 新規追加 |

### 9. batch_processing.gs - バッチ処理機能
**役割**: 大規模データ処理とシステム最適化の一括実行

| 関数名 | 説明 | 元ファイル |
|--------|------|-----------|
| `runComprehensiveDataOptimization()` | 全体最適化バッチ処理 | 総合カスタム処理.gs |
| `optimizeDatabase()` | データベース全体の最適化とパフォーマンス向上 | 新規追加 |
| `runScheduledMaintenance()` | 定期メンテナンス用バッチ処理 | 新規追加 |
| `exportDataBatch()` | データエクスポート用バッチ処理 | 新規追加 |

### 10. debug_functions.gs - デバッグとシステム管理
**役割**: システム診断、デバッグ、トリガー管理

| 関数名 | 説明 | 元ファイル |
|--------|------|-----------|
| `forceCreateMenu()` | 強制的にメニューを作成する関数（デバッグ用） | gas_dialog_functions.gs |
| `setupOnOpenTrigger()` | スクリプトエディタから安全に実行できるメニュー作成トリガー設定関数 | gas_dialog_functions.gs |
| `showIntegrationSummary()` | 統合作業完了後の情報表示関数 | gas_dialog_functions.gs |
| `runSystemDiagnostics()` | システム診断機能 | 新規追加 |
| `collectErrorLogs()` | エラーログの収集と表示 | 新規追加 |
| `measurePerformance()` | パフォーマンス測定機能 | 新規追加 |

## ファイル間の依存関係

### 主要な依存関係
- **main.gs** → utilities.gs, dialog_functions.gs
- **dialog_functions.gs** → utilities.gs, web_app_api.gs
- **batch_processing.gs** → data_management.gs, data_formatting.gs, data_validation.gs, data_cleanup.gs
- **debug_functions.gs** → utilities.gs, data_validation.gs

### 独立性の高いファイル
- **web_app_api.gs** - 外部API専用
- **data_formatting.gs** - データフォーマット専用
- **utilities.gs** - 基本ユーティリティ

## メニュー構成

### 水道検針メニュー
- アプリを開く (`showWaterMeterApp()` in main.gs)

### データ管理メニュー
1. 物件マスタの物件IDフォーマット (`formatPropertyIdsInPropertyMaster()` in data_formatting.gs)
2. 部屋マスタの物件IDフォーマット (`formatPropertyIdsInRoomMaster()` in data_formatting.gs)
3. 部屋マスタの孤立データ削除 (`cleanUpOrphanedRooms()` in data_cleanup.gs)
4. 初期検針データ作成 (`createInitialInspectionData()` in data_management.gs)
5. マスタから検針データへ新規部屋反映 (`populateInspectionDataFromMasters()` in data_management.gs)
6. 月次検針データ保存とリセット (`processInspectionDataMonthly()` in data_management.gs)
7. 🔍 データ整合性チェック (`validateInspectionDataIntegrity()` in data_validation.gs)
8. 🧹 重複データクリーンアップ (`optimizedCleanupDuplicateInspectionData()` in data_cleanup.gs)
9. ⚡ データインデックス作成 (`createDataIndexes()` in data_validation.gs)
10. 🚀 総合データ最適化（全実行） (`runComprehensiveDataOptimization()` in batch_processing.gs)

## 新規追加された機能

### 追加された関数（元ファイルにはなかった機能）
- `generateDataStatistics()` - データ統計情報の生成
- `cleanUpEmptyData()` - 空白データの削除
- `cleanUpOrphanedInspectionData()` - 孤立検針データの削除
- `runCompleteDataCleanup()` - 全データクリーンアップ
- `optimizeDatabase()` - データベース最適化
- `runScheduledMaintenance()` - 定期メンテナンス
- `exportDataBatch()` - データエクスポート
- `runSystemDiagnostics()` - システム診断
- `collectErrorLogs()` - エラーログ収集
- `measurePerformance()` - パフォーマンス測定

## 使用方法

### 基本的な使用手順
1. **main.gs** の `onOpen()` でメニューが自動作成される
2. **水道検針メニュー** → 「アプリを開く」でメインアプリケーション開始
3. **データ管理メニュー** → 各種データ管理機能を個別実行

### トラブルシューティング
- メニューが表示されない場合: `forceCreateMenu()` (debug_functions.gs) を実行
- システムの状態確認: `runSystemDiagnostics()` (debug_functions.gs) を実行
- パフォーマンス確認: `measurePerformance()` (debug_functions.gs) を実行

## 分割による利点

1. **保守性向上**: 機能別に分割され、修正・更新が容易
2. **開発効率向上**: 複数人での並行開発が可能
3. **再利用性向上**: 個別機能の他プロジェクトでの再利用
4. **テスト容易性**: 機能単位でのテストとデバッグ
5. **依存関係の明確化**: ファイル間の関係が明確

---

**最終更新**: 2025年6月15日  
**分割前ファイルサイズ**: gas_dialog_functions.gs (1737行)  
**分割後ファイル数**: 10個の機能別ファイル
