/**
 * main.gs - メインエントリーポイント
 * 水道検針アプリのメインエントリーポイントとメニュー管理
 */

/**
 * 水道検針アプリのメインエントリーポイント（メニュー用）
 */
function showWaterMeterApp() {
  if (!isUiAvailable()) {
    return showExecutionGuidance();
  }
  
  try {
    showPropertySelectDialog();
  } catch (error) {
    console.error('[showWaterMeterApp] エラー:', error);
    if (!isUiAvailable()) {
      return showExecutionGuidance();
    }
    throw error;
  }
}

/**
 * スプレッドシート開始時に呼び出されるメニュー作成関数
 */
function onOpen() {
  try {
    Logger.log('📋 onOpen関数が実行されました - 統合版メニュー作成中');
    
    const ui = SpreadsheetApp.getUi();
    
    // 水道検針アプリメニュー
    const waterMeterMenu = ui.createMenu('水道検針');
    waterMeterMenu.addItem('アプリを開く', 'showWaterMeterApp');
    waterMeterMenu.addToUi();
    
    // データ管理メニュー
    const dataManagementMenu = ui.createMenu('データ管理');
    dataManagementMenu.addItem('1. 物件マスタの物件IDフォーマット', 'formatPropertyIdsInPropertyMaster');
    dataManagementMenu.addItem('2. 部屋マスタの物件IDフォーマット', 'formatPropertyIdsInRoomMaster');
    dataManagementMenu.addItem('3. 部屋マスタの孤立データ削除', 'cleanUpOrphanedRooms');
    dataManagementMenu.addSeparator();
    dataManagementMenu.addItem('4. 初期検針データ作成', 'createInitialInspectionData');
    dataManagementMenu.addItem('5. マスタから検針データへ新規部屋反映', 'populateInspectionDataFromMasters');
    dataManagementMenu.addSeparator();
    dataManagementMenu.addItem('6. 月次検針データ保存とリセット', 'processInspectionDataMonthly');
    dataManagementMenu.addSeparator();
    dataManagementMenu.addItem('🔍 データ整合性チェック', 'validateInspectionDataIntegrity');
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
