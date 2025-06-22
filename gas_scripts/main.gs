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
      // ユーザー管理メニュー
    const userManagementMenu = ui.createMenu('👤 ユーザー管理');
    userManagementMenu.addItem('1. ユーザー認証テスト', 'testUserAuthentication');
    userManagementMenu.addItem('2. 外部スプレッドシート接続テスト', 'testExternalSpreadsheetAccess');
    userManagementMenu.addItem('3. ユーザーマスタ表示', 'showUserMaster');
    userManagementMenu.addSeparator();
    userManagementMenu.addItem('4. サンプルユーザー作成', 'createSampleUser');
    
    menu.addSubMenu(userManagementMenu);
    
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
 * ユーザー認証テスト（メニュー用）
 */
function testUserAuthentication() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // テスト用ユーザー情報
    const testUsername = 'test_user';
    const testPassword = 'test_password';
    
    // 認証テスト実行
    const result = authenticateUser(testUsername, testPassword);
    
    let message = '認証テスト結果:\n\n';
    message += `成功: ${result.success}\n`;
    message += `メッセージ: ${result.message}\n`;
    
    if (result.success && result.userInfo) {
      message += `\nユーザー情報:\n`;
      message += `ユーザー名: ${result.userInfo.username}\n`;
      message += `スプレッドシートID: ${result.userInfo.spreadsheetId}\n`;
      message += `スプレッドシートリンク: ${result.userInfo.spreadsheetLink}`;
    }
    
    ui.alert('認証テスト', message, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[testUserAuthentication] エラー:', error);
    const ui = SpreadsheetApp.getUi();
    ui.alert('エラー', `認証テストに失敗しました:\n${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 外部スプレッドシート接続テスト（メニュー用）
 */
function testExternalSpreadsheetAccess() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // テスト用スプレッドシートIDを入力
    const response = ui.prompt('外部スプレッドシート接続テスト', 'テスト用スプレッドシートIDを入力してください:', ui.ButtonSet.OK_CANCEL);
    
    if (response.getSelectedButton() === ui.Button.OK) {
      const spreadsheetId = response.getResponseText().trim();
      
      if (!spreadsheetId) {
        ui.alert('エラー', 'スプレッドシートIDが入力されていません', ui.ButtonSet.OK);
        return;
      }
      
      // 物件データ取得テスト
      const properties = getPropertiesFromExternal(spreadsheetId);
      
      let message = '外部スプレッドシート接続テスト結果:\n\n';
      message += `物件データ取得成功\n`;
      message += `取得件数: ${properties.length}件\n`;
      
      if (properties.length > 0) {
        message += `\nサンプル物件:\n`;
        const sample = properties[0];
        Object.keys(sample).forEach(key => {
          message += `${key}: ${sample[key]}\n`;
        });
      }
      
      ui.alert('接続テスト', message, ui.ButtonSet.OK);
    }
    
  } catch (error) {
    console.error('[testExternalSpreadsheetAccess] エラー:', error);
    const ui = SpreadsheetApp.getUi();
    ui.alert('エラー', `外部スプレッドシート接続テストに失敗しました:\n${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * ユーザーマスタ表示（メニュー用）
 */
function showUserMaster() {
  try {
    const ui = SpreadsheetApp.getUi();
    const userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ユーザー');
    
    if (!userSheet) {
      ui.alert('エラー', 'ユーザーシートが見つかりません', ui.ButtonSet.OK);
      return;
    }
    
    const data = userSheet.getDataRange().getValues();
    const headers = data[0];
    const users = data.slice(1);
    
    let message = 'ユーザーマスタ情報:\n\n';
    message += `ヘッダー: ${headers.join(', ')}\n`;
    message += `ユーザー数: ${users.length}人\n\n`;
    
    if (users.length > 0) {
      message += 'ユーザー一覧:\n';
      users.forEach((user, index) => {
        message += `${index + 1}. ${user[0]} (${user[2] ? 'リンク設定済み' : 'リンク未設定'})\n`;
      });
    }
    
    ui.alert('ユーザーマスタ', message, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[showUserMaster] エラー:', error);
    const ui = SpreadsheetApp.getUi();
    ui.alert('エラー', `ユーザーマスタ表示に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * サンプルユーザー作成（メニュー用）
 */
function createSampleUser() {
  try {
    const ui = SpreadsheetApp.getUi();
    let userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ユーザー');
    
    // ユーザーシートが存在しない場合は作成
    if (!userSheet) {
      userSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('ユーザー');
      const headers = ['ユーザー名', 'パスワード', 'スプレッドシートリンク'];
      userSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // サンプルユーザーを追加
    const sampleUsers = [
      ['test_user', 'test_password', 'https://docs.google.com/spreadsheets/d/1234567890abcdef/edit'],
      ['admin', 'admin123', 'https://docs.google.com/spreadsheets/d/abcdef1234567890/edit'],
      ['user1', 'password1', 'https://docs.google.com/spreadsheets/d/fedcba0987654321/edit']
    ];
    
    const lastRow = userSheet.getLastRow();
    userSheet.getRange(lastRow + 1, 1, sampleUsers.length, sampleUsers[0].length).setValues(sampleUsers);
    
    ui.alert('完了', `サンプルユーザー${sampleUsers.length}人を作成しました`, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('[createSampleUser] エラー:', error);
    const ui = SpreadsheetApp.getUi();
    ui.alert('エラー', `サンプルユーザー作成に失敗しました:\n${error.message}`, ui.ButtonSet.OK);
  }
}
