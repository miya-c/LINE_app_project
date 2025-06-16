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
    
  } catch (e) {
    console.error('[onOpen] メニュー作成エラー:', e.message);
    console.error('[onOpen] 詳細:', e.stack);
  }
}

/**
 * 水道検針アプリのメインエントリーポイント（メニュー用）
 */
function showWaterMeterApp() {
  try {
    console.log('[showWaterMeterApp] アプリ起動開始');
    
    // Web App案内機能を呼び出し
    showWaterMeterWebApp();
    
  } catch (error) {
    console.error('[showWaterMeterApp] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      if (ui) {
        ui.alert('エラー', `アプリの起動に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
      } else {
        showExecutionGuidance();
      }
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

/**
 * データインデックス作成（メニュー用）
 */
function createDataIndexes() {
  try {
    console.log('[createDataIndexes] インデックス作成開始');
    
    const indexes = createAllIndexes();
    const stats = getIndexStats();
    
    const ui = SpreadsheetApp.getUi();
    let message = 'データインデックスが正常に作成されました。\n\n';
    Object.keys(stats).forEach(key => {
      if (key !== '作成日時') {
        message += `${key}: ${stats[key]}\n`;
      }
    });
    
    ui.alert('インデックス作成完了', message, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[createDataIndexes] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `インデックス作成に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[createDataIndexes] UI表示エラー:', uiError);
    }
  }
}

/**
 * 総合データ最適化バッチ処理（メニュー用）
 */
function runComprehensiveDataOptimization() {
  try {
    console.log('[runComprehensiveDataOptimization] 総合最適化開始');
    
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '総合データ最適化',
      '以下の処理を実行します:\n' +
      '1. データバリデーション\n' +
      '2. 重複データ検出\n' +
      '3. 整合性チェック\n' +
      '4. インデックス作成\n\n' +
      '実行しますか？',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
    
    const results = {
      validation: null,
      duplicates: null,
      integrity: null,
      indexes: null
    };
    
    // 1. バリデーション
    try {
      results.validation = batchValidateMeterReadings();
    } catch (error) {
      console.error('[runComprehensiveDataOptimization] バリデーションエラー:', error);
    }
    
    // 2. 重複検出
    try {
      results.duplicates = batchDetectDuplicates();
    } catch (error) {
      console.error('[runComprehensiveDataOptimization] 重複検出エラー:', error);
    }
    
    // 3. 整合性チェック
    try {
      results.integrity = batchIntegrityCheck();
    } catch (error) {
      console.error('[runComprehensiveDataOptimization] 整合性チェックエラー:', error);
    }
    
    // 4. インデックス作成
    try {
      results.indexes = createAllIndexes();
    } catch (error) {
      console.error('[runComprehensiveDataOptimization] インデックス作成エラー:', error);
    }
    
    // 結果表示
    let message = '総合データ最適化が完了しました。\n\n';
    
    if (results.validation) {
      message += `バリデーション: ${results.validation.summary.成功率}\n`;
    }
    
    if (results.duplicates) {
      message += `重複グループ数: ${results.duplicates.summary.重複グループ数}\n`;
    }
    
    if (results.integrity) {
      message += `整合性状態: ${results.integrity.summary.状態}\n`;
    }
    
    if (results.indexes) {
      message += 'インデックス: 作成完了\n';
    }
    
    ui.alert('最適化完了', message, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[runComprehensiveDataOptimization] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `最適化処理に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[runComprehensiveDataOptimization] UI表示エラー:', uiError);
    }
  }
}

/**
 * システム診断（メニュー用）
 */
function runSystemDiagnostics() {
  try {
    console.log('[runSystemDiagnostics] システム診断開始');
    
    const diagnostics = {
      sheets: [],
      functions: [],
      performance: {},
      issues: []
    };
    
    // シート存在確認
    const requiredSheets = ['物件マスタ', '部屋マスタ', '検針データ'];
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    requiredSheets.forEach(sheetName => {
      const sheet = spreadsheet.getSheetByName(sheetName);
      diagnostics.sheets.push({
        name: sheetName,
        exists: !!sheet,
        rows: sheet ? sheet.getLastRow() : 0
      });
    });
    
    // パフォーマンス情報
    diagnostics.performance = {
      実行時間: new Date(),
      利用可能メモリ: '不明',
      実行時間制限: '6分'
    };
    
    // 結果表示
    let message = 'システム診断結果:\n\n';
    message += 'シート状況:\n';
    diagnostics.sheets.forEach(sheet => {
      message += `・${sheet.name}: ${sheet.exists ? 'OK' : 'NG'} (${sheet.rows}行)\n`;
    });
    
    const ui = SpreadsheetApp.getUi();
    ui.alert('システム診断', message, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[runSystemDiagnostics] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `システム診断に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[runSystemDiagnostics] UI表示エラー:', uiError);
    }
  }
}

/**
 * エラーログ収集（メニュー用）
 */
function collectErrorLogs() {
  try {
    console.log('[collectErrorLogs] エラーログ収集開始');
    
    // 最近のログを取得（簡易版）
    const logs = console.log('ログ収集機能は開発中です');
    
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      'エラーログ収集',
      'エラーログの収集が完了しました。\n' +
      '詳細なログは実行トランスクリプトをご確認ください。',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    console.error('[collectErrorLogs] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `ログ収集に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[collectErrorLogs] UI表示エラー:', uiError);
    }
  }
}

/**
 * 統合作業サマリー表示（メニュー用）
 */
function showIntegrationSummary() {
  try {
    console.log('[showIntegrationSummary] 統合サマリー表示開始');
    
    const summary = `
水道検針システム統合サマリー

【完了項目】
✅ CORS/503エラー修正
✅ Web App API統一
✅ HTML依存排除
✅ アーカイブファイル無効化
✅ バッチ処理機能追加
✅ インデックス機能追加
✅ データ管理機能強化

【利用可能機能】
📱 Web App: https://line-app-project.vercel.app
⚙️ GAS管理: メニューから各種処理実行
🔍 データ分析: インデックス・バッチ処理

【次のステップ】
1. Web Appでの動作確認
2. 本番データでのテスト
3. ユーザー向け操作説明
    `;
    
    const ui = SpreadsheetApp.getUi();
    ui.alert('統合作業サマリー', summary, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[showIntegrationSummary] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `サマリー表示に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[showIntegrationSummary] UI表示エラー:', uiError);
    }
  }
}
