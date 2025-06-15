/**
 * Debug Functions and System Management
 * デバッグ機能とシステム管理
 * 元ファイル: 総合カスタム処理.gs および gas_dialog_functions.gs から抽出
 */

/**
 * 強制的にメニューを作成する関数（デバッグ用）
 */
function forceCreateMenu() {
  try {
    Logger.log('🔄 強制メニュー作成を開始します...');
    
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
    
    Logger.log('✅ 強制メニュー作成が完了しました！');
    Logger.log('📋 スプレッドシートのメニューバーを確認してください');
    
    // Toastメッセージでユーザーに通知
    try {
      const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSpreadsheet) {
        activeSpreadsheet.toast(
          '統合メニューが作成されました！メニューバーを確認してください。', 
          '成功', 
          5
        );
      }
    } catch (toastError) {
      Logger.log(`Toast通知エラー: ${toastError.message}`);
    }
    
    return '成功: 統合メニュー作成完了';
  } catch (e) {
    Logger.log(`❌ 強制メニュー作成エラー: ${e.message}`);
    Logger.log(`📋 詳細: ${e.stack}`);
    
    // エラーの場合もToastで通知
    try {
      const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSpreadsheet) {
        activeSpreadsheet.toast(
          `メニュー作成エラー: ${e.message}`, 
          'エラー', 
          5
        );
      }
    } catch (toastError) {
      Logger.log(`Toast通知エラー: ${toastError.message}`);
    }
    
    return `エラー: ${e.message}`;
  }
}

/**
 * スクリプトエディタから安全に実行できるメニュー作成トリガー設定関数
 */
function setupOnOpenTrigger() {
  try {
    Logger.log('📋 onOpenトリガー設定状況の確認');
    Logger.log('');
    
    // 既存のトリガーを確認
    const triggers = ScriptApp.getProjectTriggers();
    const onOpenTriggers = triggers.filter(trigger => 
      trigger.getEventType() === ScriptApp.EventType.ON_OPEN
    );
    
    Logger.log(`✅ 現在のonOpenトリガー数: ${onOpenTriggers.length}`);
    
    onOpenTriggers.forEach((trigger, index) => {
      const handlerFunction = trigger.getHandlerFunction();
      Logger.log(`${index + 1}. 関数: ${handlerFunction}`);
    });
    
    Logger.log('');
    Logger.log('💡 メニューが表示されない場合の対処法:');
    Logger.log('1. スプレッドシートを再読み込み（F5キー）');
    Logger.log('2. ブラウザのキャッシュをクリア');
    Logger.log('3. 別のブラウザで試す');
    Logger.log('4. forceCreateMenu()関数を実行');
    
    return 'トリガー情報確認完了';
  } catch (e) {
    Logger.log(`❌ トリガー情報確認エラー: ${e.message}`);
    return `エラー: ${e.message}`;
  }
}

/**
 * 統合作業完了後の情報表示関数
 */
function showIntegrationSummary() {
  Logger.log('');
  Logger.log('='.repeat(80));
  Logger.log('🎉 統合作業完了サマリー');
  Logger.log('='.repeat(80));
  Logger.log('');
  Logger.log('📁 統合されたファイル:');
  Logger.log('   ✅ 物件.gs → gas_dialog_functions.gs');
  Logger.log('   ✅ 総合カスタム処理.gs → gas_dialog_functions.gs');
  Logger.log('');
  Logger.log('🔧 統合された機能:');
  Logger.log('   ✅ Web App API関数群 (物件.gsより)');
  Logger.log('   ✅ 検針データ更新機能 (物件.gsより)');
  Logger.log('   ✅ データ管理・最適化機能 (総合カスタム処理.gsより)');
  Logger.log('   ✅ 統合メニューシステム');
  Logger.log('');
  Logger.log('📋 利用可能なメニュー:');
  Logger.log('   🌊 水道検針 - メインアプリケーション');
  Logger.log('   🗂️ データ管理 - バックエンド管理機能');
  Logger.log('');
  Logger.log('🚀 実行方法:');
  Logger.log('   1. Googleスプレッドシートを開く');
  Logger.log('   2. メニューバーの「水道検針」→「アプリを開く」をクリック');
  Logger.log('   3. データ管理は「データ管理」メニューから選択');
  Logger.log('');
  Logger.log('='.repeat(80));
  
  return '統合作業完了 - コンソールでサマリーを確認してください';
}

/**
 * システム診断機能
 */
function runSystemDiagnostics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }

  try {
    Logger.log('🔍 システム診断を開始します...');
    const startTime = new Date();

    const diagnostics = {
      spreadsheet: {},
      sheets: {},
      functions: {},
      triggers: {},
      permissions: {}
    };

    // スプレッドシート基本情報
    diagnostics.spreadsheet.id = ss.getId();
    diagnostics.spreadsheet.name = ss.getName();
    diagnostics.spreadsheet.url = ss.getUrl();
    diagnostics.spreadsheet.owner = ss.getOwner()?.getEmail() || '不明';

    // シート存在確認
    const requiredSheets = ['物件マスタ', '部屋マスタ', 'inspection_data'];
    requiredSheets.forEach(sheetName => {
      const sheet = ss.getSheetByName(sheetName);
      diagnostics.sheets[sheetName] = {
        exists: !!sheet,
        rowCount: sheet ? sheet.getLastRow() : 0,
        columnCount: sheet ? sheet.getLastColumn() : 0
      };
    });

    // 関数存在確認
    const requiredFunctions = [
      'showWaterMeterApp',
      'validateInspectionDataIntegrity', 
      'createDataIndexes',
      'runComprehensiveDataOptimization'
    ];
    
    requiredFunctions.forEach(funcName => {
      try {
        const func = eval(funcName);
        diagnostics.functions[funcName] = {
          exists: typeof func === 'function',
          type: typeof func
        };
      } catch (e) {
        diagnostics.functions[funcName] = {
          exists: false,
          error: e.message
        };
      }
    });

    // トリガー確認
    const triggers = ScriptApp.getProjectTriggers();
    diagnostics.triggers.count = triggers.length;
    diagnostics.triggers.onOpenCount = triggers.filter(t => 
      t.getEventType() === ScriptApp.EventType.ON_OPEN
    ).length;

    // 権限確認
    try {
      const ui = SpreadsheetApp.getUi();
      diagnostics.permissions.ui = true;
    } catch (e) {
      diagnostics.permissions.ui = false;
      diagnostics.permissions.uiError = e.message;
    }

    const endTime = new Date();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    // 診断結果レポート
    let report = `🔍 システム診断結果\n処理時間: ${processingTime}秒\n\n`;
    
    report += '📊 スプレッドシート情報:\n';
    report += `   名前: ${diagnostics.spreadsheet.name}\n`;
    report += `   所有者: ${diagnostics.spreadsheet.owner}\n\n`;

    report += '📋 シート状況:\n';
    Object.entries(diagnostics.sheets).forEach(([name, info]) => {
      const status = info.exists ? '✅' : '❌';
      report += `   ${status} ${name}: ${info.rowCount}行 × ${info.columnCount}列\n`;
    });

    report += '\n🔧 関数状況:\n';
    Object.entries(diagnostics.functions).forEach(([name, info]) => {
      const status = info.exists ? '✅' : '❌';
      report += `   ${status} ${name}\n`;
    });

    report += `\n⚡ トリガー状況:\n`;
    report += `   総数: ${diagnostics.triggers.count}\n`;
    report += `   onOpen: ${diagnostics.triggers.onOpenCount}\n`;

    report += `\n🔐 権限状況:\n`;
    report += `   UI操作: ${diagnostics.permissions.ui ? '✅' : '❌'}\n`;

    Logger.log(report);
    safeAlert('システム診断完了', report);

    return diagnostics;

  } catch (e) {
    Logger.log(`エラー: システム診断中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `システム診断中にエラーが発生しました:\n${e.message}`);
    return null;
  }
}

/**
 * エラーログの収集と表示
 */
function collectErrorLogs() {
  try {
    Logger.log('📋 エラーログ収集を開始します...');
    
    // スクリプトの実行ログを取得（過去の実行履歴）
    const project = DriveApp.getFileById(ScriptApp.getScriptId());
    
    let report = '📋 エラーログレポート\n';
    report += '='.repeat(40) + '\n\n';
    
    report += '📊 スクリプトプロジェクト情報:\n';
    report += `   名前: ${project.getName()}\n`;
    report += `   作成日: ${project.getDateCreated()}\n`;
    report += `   最終更新: ${project.getLastUpdated()}\n\n`;

    // 現在のセッション情報
    report += '🔧 現在のセッション情報:\n';
    report += `   タイムゾーン: ${Session.getScriptTimeZone()}\n`;
    report += `   実行時刻: ${new Date().toLocaleString()}\n`;
    report += `   アクティブユーザー: ${Session.getActiveUser().getEmail()}\n\n`;

    // システム状態確認
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      report += '📈 スプレッドシート状態:\n';
      report += `   ✅ アクセス可能\n`;
      report += `   ID: ${ss.getId()}\n`;
      report += `   シート数: ${ss.getSheets().length}\n\n`;
    } else {
      report += '❌ スプレッドシートにアクセスできません\n\n';
    }

    report += '💡 問題が発生した場合の対処法:\n';
    report += '1. スプレッドシートを再読み込み\n';
    report += '2. ブラウザのキャッシュをクリア\n';
    report += '3. forceCreateMenu()を実行\n';
    report += '4. runSystemDiagnostics()で詳細診断\n';

    Logger.log(report);
    safeAlert('エラーログ収集完了', report);

    return report;

  } catch (e) {
    Logger.log(`エラー: エラーログ収集中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `エラーログ収集中にエラーが発生しました:\n${e.message}`);
    return null;
  }
}

/**
 * パフォーマンス測定機能
 */
function measurePerformance() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }

  try {
    Logger.log('⚡ パフォーマンス測定を開始します...');
    
    const performanceData = {
      dataAccess: {},
      processing: {},
      ui: {}
    };

    // データアクセス速度測定
    let startTime = new Date();
    const inspectionSheet = ss.getSheetByName('inspection_data');
    if (inspectionSheet) {
      const data = inspectionSheet.getDataRange().getValues();
      performanceData.dataAccess.readTime = new Date() - startTime;
      performanceData.dataAccess.rowCount = data.length;
      performanceData.dataAccess.readSpeed = data.length / (performanceData.dataAccess.readTime / 1000);
    }

    // インデックス作成速度測定
    startTime = new Date();
    const indexes = createDataIndexes();
    performanceData.processing.indexTime = new Date() - startTime;
    if (indexes) {
      performanceData.processing.recordCount = indexes.byRecordId.size;
      performanceData.processing.indexSpeed = indexes.byRecordId.size / (performanceData.processing.indexTime / 1000);
    }

    // UI操作速度測定
    startTime = new Date();
    try {
      const ui = SpreadsheetApp.getUi();
      performanceData.ui.accessTime = new Date() - startTime;
      performanceData.ui.available = true;
    } catch (e) {
      performanceData.ui.accessTime = new Date() - startTime;
      performanceData.ui.available = false;
      performanceData.ui.error = e.message;
    }

    // パフォーマンスレポート生成
    let report = '⚡ パフォーマンス測定結果\n';
    report += '='.repeat(40) + '\n\n';

    report += '📊 データアクセス性能:\n';
    if (performanceData.dataAccess.readTime) {
      report += `   読み取り時間: ${performanceData.dataAccess.readTime}ms\n`;
      report += `   データ行数: ${performanceData.dataAccess.rowCount}行\n`;
      report += `   読み取り速度: ${performanceData.dataAccess.readSpeed.toFixed(2)}行/秒\n\n`;
    }

    report += '🔧 処理性能:\n';
    if (performanceData.processing.indexTime) {
      report += `   インデックス作成時間: ${performanceData.processing.indexTime}ms\n`;
      report += `   処理レコード数: ${performanceData.processing.recordCount}件\n`;
      report += `   処理速度: ${performanceData.processing.indexSpeed.toFixed(2)}件/秒\n\n`;
    }

    report += '🎨 UI性能:\n';
    report += `   UI アクセス時間: ${performanceData.ui.accessTime}ms\n`;
    report += `   UI 利用可能: ${performanceData.ui.available ? '✅' : '❌'}\n`;

    // パフォーマンス評価
    report += '\n📈 パフォーマンス評価:\n';
    if (performanceData.dataAccess.readTime < 1000) {
      report += '   ✅ データアクセス: 良好\n';
    } else if (performanceData.dataAccess.readTime < 3000) {
      report += '   ⚠️ データアクセス: 普通\n';
    } else {
      report += '   ❌ データアクセス: 改善が必要\n';
    }

    if (performanceData.processing.indexTime < 2000) {
      report += '   ✅ 処理速度: 良好\n';
    } else if (performanceData.processing.indexTime < 5000) {
      report += '   ⚠️ 処理速度: 普通\n';
    } else {
      report += '   ❌ 処理速度: 改善が必要\n';
    }

    Logger.log(report);
    safeAlert('パフォーマンス測定完了', report);

    return performanceData;

  } catch (e) {
    Logger.log(`エラー: パフォーマンス測定中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `パフォーマンス測定中にエラーが発生しました:\n${e.message}`);
    return null;
  }
}
