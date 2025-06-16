/**
 * main.gs - メインエントリーポイント
 * 水道検針アプリのメインエントリーポイントとメニュー管理
 */

/**
 * スプレッドシート開始時に呼び出されるメニュー作成関数
 */
function onOpen() {
  try {
    console.log('[onOpen] メニュー作成開始');
    
    const ui = SpreadsheetApp.getUi();
    
    // メインメニューを作成
    const menu = ui.createMenu('🔧 水道検針システム');
    
    // 基本機能メニュー
    menu.addItem('📱 水道検針アプリを開く', 'showWaterMeterApp');
    menu.addSeparator();
    
    // データ管理メニュー
    const dataManagementMenu = ui.createMenu('📊 データ管理');
    dataManagementMenu.addItem('1. 物件マスタの物件IDフォーマット', 'formatPropertyIdsInPropertyMaster');
    dataManagementMenu.addItem('2. 部屋マスタの物件IDフォーマット', 'formatPropertyIdsInRoomMaster');
    dataManagementMenu.addItem('3. 部屋マスタの孤立データ削除', 'cleanUpOrphanedRooms');
    dataManagementMenu.addSeparator();
    dataManagementMenu.addItem('4. 初期検針データ作成', 'createInitialInspectionData');
    dataManagementMenu.addItem('5. マスタから検針データへ新規部屋反映', 'populateInspectionDataFromMasters');
    dataManagementMenu.addSeparator();
    dataManagementMenu.addItem('6. 月次検針データ保存とリセット', 'processInspectionDataMonthly');
    
    menu.addSubMenu(dataManagementMenu);
    
    // データ品質管理メニュー
    const dataQualityMenu = ui.createMenu('🔍 データ品質管理');
    dataQualityMenu.addItem('1. 重複データクリーンアップ', 'optimizedCleanupDuplicateInspectionData');
    dataQualityMenu.addItem('2. データ整合性チェック', 'validateInspectionDataIntegrity');
    dataQualityMenu.addItem('3. データ高速検索インデックス作成', 'createDataIndexes');
    
    menu.addSubMenu(dataQualityMenu);
    
    // システム管理メニュー
    const systemMenu = ui.createMenu('⚙️ システム管理');
    systemMenu.addItem('1. 全体最適化バッチ処理', 'runComprehensiveDataOptimization');
    systemMenu.addItem('2. システム診断', 'runSystemDiagnostics');
    systemMenu.addItem('3. エラーログ収集', 'collectErrorLogs');
    systemMenu.addSeparator();
    systemMenu.addItem('4. 統合作業サマリー表示', 'showIntegrationSummary');
    
    menu.addSubMenu(systemMenu);
    
    // メニューを追加
    menu.addToUi();
    
    console.log('[onOpen] メニュー作成完了');
    dataManagementMenu.addItem('🧹 重複データクリーンアップ', 'optimizedCleanupDuplicateInspectionData');
    dataManagementMenu.addItem('⚡ データインデックス作成', 'createDataIndexes');
    dataManagementMenu.addSeparator();
    dataManagementMenu.addItem('🚀 総合データ最適化（全実行）', 'runComprehensiveDataOptimization');
    dataManagementMenu.addToUi();
    
    Logger.log('✅ 統合版メニューが正常に作成されました');
    
  } catch (e) {
    Logger.log(`❌ onOpen関数内でメニュー作成エラー: ${e.message}`);
    Logger.log(`📋 詳細: ${e.stack}`);
  }
}

/**
 * 水道検針アプリのメインエントリーポイント（メニュー用）
 */
function showWaterMeterApp() {
  try {
    console.log('[showWaterMeterApp] アプリ起動開始');
    
    // UIが利用可能かチェック
    const ui = SpreadsheetApp.getUi();
    if (!ui) {
      console.log('[showWaterMeterApp] UI利用不可 - Web App URLを表示');
      showExecutionGuidance();
      return;
    }
    
    // 物件選択ダイアログを表示
    showPropertySelectDialog();
    
  } catch (error) {
    console.error('[showWaterMeterApp] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `アプリの起動に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[showWaterMeterApp] UI表示エラー:', uiError);
      showExecutionGuidance();
    }
  }
}

/**
 * UI利用不可時の案内表示
 */
function showExecutionGuidance() {
  console.log('[showExecutionGuidance] Web App URL案内を表示');
  
  // Web App URLを取得して表示
  const webAppUrl = getWebAppUrl();
  console.log('[showExecutionGuidance] Web App URL:', webAppUrl);
  
  // ログに案内を出力
  console.log('='.repeat(50));
  console.log('💡 水道検針アプリの利用方法');
  console.log('='.repeat(50));
  console.log('スクリプトエディタからは直接実行できません。');
  console.log('以下のWeb App URLにアクセスしてください:');
  console.log(webAppUrl || 'Web App URLを取得できませんでした');
  console.log('='.repeat(50));
}

/**
 * Web App URLを取得
 */
function getWebAppUrl() {
  try {
    const scriptId = ScriptApp.getScriptId();
    return `https://script.google.com/macros/s/${scriptId}/exec`;
  } catch (error) {
    console.error('[getWebAppUrl] エラー:', error);
    return null;
  }
}
