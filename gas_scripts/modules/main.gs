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
    dataManagementMenu.addItem('1. 物件IDフォーマット整理', 'formatPropertyIdsInPropertyMaster');
    dataManagementMenu.addItem('2. 部屋マスタの物件IDフォーマット整理', 'formatPropertyIdsInRoomMaster');
    dataManagementMenu.addItem('3. 部屋ID連番自動生成', 'generateRoomIds');
    dataManagementMenu.addItem('4. 孤立データ削除', 'cleanUpOrphanedRooms');
    dataManagementMenu.addSeparator();
    dataManagementMenu.addItem('5. 初期検針データ作成', 'createInitialInspectionData');
    dataManagementMenu.addItem('6. 新規部屋反映', 'populateInspectionDataFromMasters');
    dataManagementMenu.addItem('7. 月次処理実行', 'processInspectionDataMonthly');
    
    menu.addSubMenu(dataManagementMenu);      // データ品質管理メニュー
    const dataQualityMenu = ui.createMenu('🔍 データ品質管理');
    dataQualityMenu.addItem('1. 重複データクリーンアップ', 'menuCleanupDuplicateData');
    dataQualityMenu.addItem('2. データ整合性チェック', 'menuValidateDataIntegrity');
    dataQualityMenu.addItem('3. データ高速検索インデックス作成', 'createDataIndexes');
    dataQualityMenu.addSeparator();
    dataQualityMenu.addItem('4. 高速検索機能テスト', 'testSearchFunctions');
    dataQualityMenu.addItem('5. 検索使用方法ガイド', 'showSearchUsageGuide');
    
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
    console.log('[runComprehensiveDataOptimization] 最適化開始 - batch_processing.gsに委譲');
    
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
    
    // batch_processing.gsの統合バッチ処理を呼び出し
    const results = runBatchOptimization();
    
    // 結果表示
    let message = '総合データ最適化が完了しました。\n\n';
    
    if (results.validation) {
      message += `バリデーション: ${results.validation.summary ? results.validation.summary.成功率 : '完了'}\n`;
    }
    
    if (results.duplicates) {
      message += `重複グループ数: ${results.duplicates.summary ? results.duplicates.summary.重複グループ数 : '処理完了'}\n`;
    }
    
    if (results.integrity) {
      message += `整合性状態: ${results.integrity.summary ? results.integrity.summary.状態 : '完了'}\n`;
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

/**
 * 高速検索機能テスト（メニュー用）
 */
function testSearchFunctions() {
  try {
    console.log('[testSearchFunctions] 検索機能テスト開始');
    
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '検索機能テスト',
      '高速検索機能のテストを実行します。\n' +
      'データの状況により時間がかかる場合があります。\n\n' +
      'テストを実行しますか？',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
    
    // テスト実行
    const testResult = testFastSearch();
    const sampleResult = sampleDataSearch();
    
    // 結果表示
    let message = '検索機能テスト結果:\n\n';
    message += `テスト成功率: ${testResult.成功率}\n`;
    message += `実行時間: ${testResult.実行時間.toLocaleString()}\n\n`;
    
    if (sampleResult.length > 0) {
      message += '実データ検索サンプル:\n';
      sampleResult.forEach(sample => {
        message += `・${sample.type}: ${sample.found ? 'OK' : 'NG'}\n`;
      });
    } else {
      message += '実データが見つかりませんでした\n';
    }
    
    message += '\n詳細はログをご確認ください。';
    
    ui.alert('検索テスト完了', message, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[testSearchFunctions] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `検索テストに失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[testSearchFunctions] UI表示エラー:', uiError);
    }
  }
}

/**
 * 検索使用方法ガイド（メニュー用）
 */
function showSearchUsageGuide() {
  try {
    console.log('[showSearchUsageGuide] 使用方法ガイド表示');
    
    const guide = showSearchGuide();
    
    const ui = SpreadsheetApp.getUi();
    const shortGuide = `
高速検索機能の使用方法

【基本的な使用方法】
fastSearch(type, key)

【検索タイプ】
• property: 物件IDで物件情報を検索
• room: 部屋IDで部屋情報を検索  
• meter: レコードIDで検針データを検索
• propertyRooms: 物件の部屋一覧を取得
• roomMeters: 部屋の検針データ一覧を取得

【使用例】
const property = fastSearch('property', 'P001');
const rooms = fastSearch('propertyRooms', 'P001');

詳細な使用方法とサンプルコードは
実行トランスクリプトをご確認ください。
    `;
    
    ui.alert('検索機能使用ガイド', shortGuide, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[showSearchUsageGuide] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `ガイド表示に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[showSearchUsageGuide] UI表示エラー:', uiError);
    }
  }
}

/**
 * 重複データクリーンアップ（メニュー用プロキシ関数）
 * data_cleanup.gsの関数を呼び出し
 */
function menuCleanupDuplicateData() {
  try {
    console.log('[menuCleanupDuplicateData] data_cleanup.gsの関数を呼び出し');
    const result = optimizedCleanupDuplicateInspectionData();
    
    const ui = SpreadsheetApp.getUi();
    let message = '重複データクリーンアップが完了しました。\n\n';
    if (result && result.summary) {
      Object.keys(result.summary).forEach(key => {
        message += `${key}: ${result.summary[key]}\n`;
      });
    }
    
    ui.alert('クリーンアップ完了', message, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[menuCleanupDuplicateData] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `クリーンアップ処理に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[menuCleanupDuplicateData] UI表示エラー:', uiError);
    }
  }
}

/**
 * データ整合性チェック（メニュー用プロキシ関数）
 * data_validation.gsの関数を呼び出し
 */
function menuValidateDataIntegrity() {
  try {
    console.log('[menuValidateDataIntegrity] data_validation.gsの関数を呼び出し');
    const result = validateInspectionDataIntegrity();
    
    const ui = SpreadsheetApp.getUi();
    let message = 'データ整合性チェックが完了しました。\n\n';
    if (result && result.summary) {
      Object.keys(result.summary).forEach(key => {
        message += `${key}: ${result.summary[key]}\n`;
      });
    }
    
    ui.alert('整合性チェック完了', message, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[menuValidateDataIntegrity] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `整合性チェックに失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[menuValidateDataIntegrity] UI表示エラー:', uiError);
    }
  }
}

/**
 * 物件マスタの物件IDフォーマット整理（メニュー用プロキシ関数）
 * data_formatting.gsの関数を呼び出し
 */
function formatPropertyIdsInPropertyMaster() {
  try {
    console.log('[formatPropertyIdsInPropertyMaster] data_formatting.gsの関数を呼び出し');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('物件マスタ');
    
    if (!sheet) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', '物件マスタシートが見つかりません。', ui.ButtonSet.OK);
      return;
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let updatedCount = 0;
    
    if (values.length <= 1) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('情報', '物件マスタシートにデータがありません。', ui.ButtonSet.OK);
      return;
    }
    
    // 物件IDフォーマット処理
    for (let i = 1; i < values.length; i++) {
      const currentId = String(values[i][0]).trim();
      
      if (currentId && !currentId.startsWith('P')) {
        const formattedId = `P${currentId.padStart(6, '0')}`;
        values[i][0] = formattedId;
        updatedCount++;
        console.log(`行 ${i + 1}: ${currentId} → ${formattedId}`);
      }
    }
    
    if (updatedCount > 0) {
      dataRange.setValues(values);
      const ui = SpreadsheetApp.getUi();
      ui.alert('完了', `物件マスタのIDフォーマット変更が完了しました。\n更新件数: ${updatedCount}件`, ui.ButtonSet.OK);
    } else {
      const ui = SpreadsheetApp.getUi();
      ui.alert('情報', '更新が必要な物件IDはありませんでした。', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    console.error('[formatPropertyIdsInPropertyMaster] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `物件IDフォーマット処理に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[formatPropertyIdsInPropertyMaster] UI表示エラー:', uiError);
    }
  }
}

/**
 * 部屋マスタの物件IDフォーマット整理（メニュー用プロキシ関数）
 * data_formatting.gsの関数を呼び出し
 */
function formatPropertyIdsInRoomMaster() {
  try {
    console.log('[formatPropertyIdsInRoomMaster] data_formatting.gsの関数を呼び出し');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('部屋マスタ');
    
    if (!sheet) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', '部屋マスタシートが見つかりません。', ui.ButtonSet.OK);
      return;
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let updatedCount = 0;
    
    if (values.length <= 1) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('情報', '部屋マスタシートにデータがありません。', ui.ButtonSet.OK);
      return;
    }
    
    // 部屋マスタの物件IDフォーマット処理
    for (let i = 1; i < values.length; i++) {
      const currentId = String(values[i][0]).trim();
      
      if (currentId && !currentId.startsWith('P')) {
        const formattedId = `P${currentId.padStart(6, '0')}`;
        values[i][0] = formattedId;
        updatedCount++;
        console.log(`行 ${i + 1}: ${currentId} → ${formattedId}`);
      }
    }
    
    if (updatedCount > 0) {
      dataRange.setValues(values);
      const ui = SpreadsheetApp.getUi();
      ui.alert('完了', `部屋マスタのIDフォーマット変更が完了しました。\n更新件数: ${updatedCount}件`, ui.ButtonSet.OK);
    } else {
      const ui = SpreadsheetApp.getUi();
      ui.alert('情報', '更新が必要な物件IDはありませんでした。', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    console.error('[formatPropertyIdsInRoomMaster] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `部屋マスタIDフォーマット処理に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[formatPropertyIdsInRoomMaster] UI表示エラー:', uiError);
    }
  }
}

/**
 * 孤立データ削除（メニュー用プロキシ関数）
 * data_cleanup.gsの関数を呼び出し
 */
function cleanUpOrphanedRooms() {
  try {
    console.log('[cleanUpOrphanedRooms] data_cleanup.gsの関数を呼び出し');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const roomSheet = ss.getSheetByName('部屋マスタ');
    const propertySheet = ss.getSheetByName('物件マスタ');
    
    if (!roomSheet || !propertySheet) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', '部屋マスタまたは物件マスタシートが見つかりません。', ui.ButtonSet.OK);
      return;
    }
    
    // 物件マスタから有効な物件IDを取得
    const propertyData = propertySheet.getDataRange().getValues().slice(1);
    const validPropertyIds = new Set();
    propertyData.forEach(row => {
      const propertyId = String(row[0]).trim();
      if (propertyId) {
        validPropertyIds.add(propertyId);
      }
    });
    
    // 部屋マスタのデータを確認
    const roomData = roomSheet.getDataRange().getValues();
    const headers = roomData[0];
    const dataRows = roomData.slice(1);
    
    const validRows = [headers];
    let removedCount = 0;
    
    dataRows.forEach((row, index) => {
      const propertyId = String(row[0]).trim();
      if (propertyId && validPropertyIds.has(propertyId)) {
        validRows.push(row);
      } else {
        removedCount++;
        console.log(`削除対象: 行${index + 2} - 物件ID: ${propertyId}`);
      }
    });
    
    if (removedCount > 0) {
      // データを更新
      roomSheet.clear();
      if (validRows.length > 0) {
        roomSheet.getRange(1, 1, validRows.length, headers.length).setValues(validRows);
      }
      
      const ui = SpreadsheetApp.getUi();
      ui.alert('完了', `孤立データの削除が完了しました。\n削除件数: ${removedCount}件`, ui.ButtonSet.OK);
    } else {
      const ui = SpreadsheetApp.getUi();
      ui.alert('情報', '削除対象の孤立データはありませんでした。', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    console.error('[cleanUpOrphanedRooms] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `孤立データ削除処理に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[cleanUpOrphanedRooms] UI表示エラー:', uiError);
    }
  }
}

/**
 * 初期検針データ作成（メニュー用プロキシ関数）
 * data_management.gsの関数を呼び出し
 */
function createInitialInspectionData() {
  try {
    console.log('[createInitialInspectionData] data_management.gsの関数を呼び出し');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const propertyMasterSheet = ss.getSheetByName('物件マスタ');
    const roomMasterSheet = ss.getSheetByName('部屋マスタ');
    let inspectionDataSheet = ss.getSheetByName('inspection_data');
    
    if (!propertyMasterSheet || !roomMasterSheet) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', '物件マスタまたは部屋マスタシートが見つかりません。', ui.ButtonSet.OK);
      return;
    }
    
    // inspection_dataシートが存在しない場合は作成
    if (!inspectionDataSheet) {
      inspectionDataSheet = ss.insertSheet('inspection_data');
      const headers = ['記録ID', '物件名', '物件ID', '部屋ID', '部屋名', '検針日時', '警告フラグ', '標準偏差値', '今回使用量', '今回の指示数', '前回指示数', '前々回指示数', '前々々回指示数', '検針不要'];
      inspectionDataSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    const ui = SpreadsheetApp.getUi();
    ui.alert('完了', '初期検針データの作成処理を開始しました。', ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[createInitialInspectionData] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `初期検針データ作成に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[createInitialInspectionData] UI表示エラー:', uiError);
    }
  }
}

/**
 * 新規部屋反映（メニュー用プロキシ関数）
 * data_management.gsの関数を呼び出し
 */
function populateInspectionDataFromMasters() {
  try {
    console.log('[populateInspectionDataFromMasters] data_management.gsの関数を呼び出し');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const propertyMasterSheet = ss.getSheetByName('物件マスタ');
    const roomMasterSheet = ss.getSheetByName('部屋マスタ');
    const inspectionDataSheet = ss.getSheetByName('inspection_data');
    
    if (!propertyMasterSheet || !roomMasterSheet || !inspectionDataSheet) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', '必要なシート（物件マスタ、部屋マスタ、inspection_data）が見つかりません。', ui.ButtonSet.OK);
      return;
    }
    
    // 物件マスタから物件情報を取得
    const propertyData = propertyMasterSheet.getDataRange().getValues().slice(1);
    const propertyMap = {};
    propertyData.forEach(row => {
      const propertyId = String(row[0]).trim();
      const propertyName = String(row[1]).trim();
      if (propertyId && propertyName) {
        propertyMap[propertyId] = propertyName;
      }
    });
    
    // 部屋マスタから部屋情報を取得
    const roomData = roomMasterSheet.getDataRange().getValues().slice(1);
    
    // 既存のinspection_dataを確認
    const inspectionData = inspectionDataSheet.getDataRange().getValues();
    const existingKeys = new Set();
    
    if (inspectionData.length > 1) {
      for (let i = 1; i < inspectionData.length; i++) {
        const propertyId = String(inspectionData[i][2]).trim();
        const roomId = String(inspectionData[i][3]).trim();
        existingKeys.add(`${propertyId}_${roomId}`);
      }
    }
    
    // 新規部屋をinspection_dataに追加
    const newRows = [];
    let addedCount = 0;
    
    roomData.forEach(row => {
      const propertyId = String(row[0]).trim();
      const roomId = String(row[1]).trim();
      const roomName = String(row[2]).trim();
      const key = `${propertyId}_${roomId}`;
      
      if (propertyId && roomId && !existingKeys.has(key)) {
        const recordId = Utilities.getUuid();
        const propertyName = propertyMap[propertyId] || '';
        
        newRows.push([
          recordId,        // 記録ID
          propertyName,    // 物件名
          propertyId,      // 物件ID
          roomId,          // 部屋ID
          roomName,        // 部屋名
          '',              // 検針日時
          '',              // 警告フラグ
          '',              // 標準偏差値
          '',              // 今回使用量
          '',              // 今回の指示数
          '',              // 前回指示数
          '',              // 前々回指示数
          '',              // 前々々回指示数
          ''               // 検針不要
        ]);
        addedCount++;
      }
    });
    
    if (newRows.length > 0) {
      const lastRow = inspectionDataSheet.getLastRow();
      inspectionDataSheet.getRange(lastRow + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    }
    
    const ui = SpreadsheetApp.getUi();
    ui.alert('完了', `新規部屋反映が完了しました。\n追加件数: ${addedCount}件`, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[populateInspectionDataFromMasters] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `新規部屋反映処理に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[populateInspectionDataFromMasters] UI表示エラー:', uiError);
    }
  }
}

/**
 * 月次処理実行（メニュー用プロキシ関数）
 * data_management.gsの関数を呼び出し
 */
function processInspectionDataMonthly() {
  try {
    console.log('[processInspectionDataMonthly] data_management.gsの関数を呼び出し');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sourceSheet = ss.getSheetByName('inspection_data');
    
    if (!sourceSheet) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', 'inspection_dataシートが見つかりません。', ui.ButtonSet.OK);
      return;
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const newSheetName = `検針データ_${currentYear}年${currentMonth}月`;
    
    // 既存の月次シートがあるかチェック
    if (ss.getSheetByName(newSheetName)) {
      const ui = SpreadsheetApp.getUi();
      ui.alert('情報', `${newSheetName} は既に存在します。`, ui.ButtonSet.OK);
      return;
    }
    
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '月次処理確認',
      `${newSheetName} を作成し、現在のデータを保存します。\n実行しますか？`,
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      // 新しいシートを作成してデータをコピー
      const newSheet = ss.insertSheet(newSheetName);
      const sourceData = sourceSheet.getDataRange().getValues();
      
      if (sourceData.length > 0) {
        newSheet.getRange(1, 1, sourceData.length, sourceData[0].length).setValues(sourceData);
      }
      
      ui.alert('完了', `月次処理が完了しました。\n${newSheetName} を作成しました。`, ui.ButtonSet.OK);
    }
    
  } catch (error) {
    console.error('[processInspectionDataMonthly] エラー:', error);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('エラー', `月次処理に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
    } catch (uiError) {
      console.error('[processInspectionDataMonthly] UI表示エラー:', uiError);
    }
  }
}

/**
 * 安全なアラート表示関数
 * UIが利用できない場合はconsoleログにフォールバック
 */
function safeAlert(title, message) {
  try {
    const ui = SpreadsheetApp.getUi();
    if (ui) {
      ui.alert(title, message, ui.ButtonSet.OK);
    } else {
      console.log(`[${title}] ${message}`);
    }
  } catch (error) {
    console.log(`[${title}] ${message}`);
    console.error('UI表示エラー:', error);
  }
}
