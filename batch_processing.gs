/**
 * Batch Processing Functions
 * バッチ処理機能とデータ処理の一括実行
 * 元ファイル: 総合カスタム処理.gs および gas_dialog_functions.gs から抽出
 */

/**
 * 全体最適化バッチ処理 (総合カスタム処理.gsから統合)
 */
function runComprehensiveDataOptimization() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }

  try {
    Logger.log('🚀 全体最適化バッチ処理を開始します...');
    const overallStartTime = new Date();

    // 1. IDフォーマット統一
    Logger.log('📋 ステップ1: IDフォーマット統一');
    formatPropertyIdsInPropertyMaster();
    formatPropertyIdsInRoomMaster();

    // 2. 孤立データクリーンアップ
    Logger.log('🧹 ステップ2: 孤立データクリーンアップ');
    cleanUpOrphanedRooms();

    // 3. inspection_data自動生成
    Logger.log('📊 ステップ3: inspection_data自動生成');
    populateInspectionDataFromMasters();

    // 4. 重複データクリーンアップ
    Logger.log('🔧 ステップ4: 重複データクリーンアップ');
    optimizedCleanupDuplicateInspectionData();

    // 5. データ整合性チェック
    Logger.log('🔍 ステップ5: データ整合性チェック');
    const integrityResults = validateInspectionDataIntegrity();

    const overallEndTime = new Date();
    const totalProcessingTime = ((overallEndTime - overallStartTime) / 1000).toFixed(2);

    Logger.log(`🚀 全体最適化バッチ処理完了 (総処理時間: ${totalProcessingTime}秒)`);
    
    let summary = `✅ 全体最適化バッチ処理が完了しました！\n総処理時間: ${totalProcessingTime}秒\n\n`;
    summary += '実行された処理:\n';
    summary += '1. ✅ IDフォーマット統一\n';
    summary += '2. ✅ 孤立データクリーンアップ\n';
    summary += '3. ✅ inspection_data自動生成\n';
    summary += '4. ✅ 重複データクリーンアップ\n';
    summary += '5. ✅ データ整合性チェック\n';
    
    if (integrityResults && Object.values(integrityResults).some(arr => arr.length > 0)) {
      summary += '\n⚠️ 一部データに問題が検出されました。詳細は整合性チェック結果をご確認ください。';
    } else {
      summary += '\n🎉 すべてのデータが正常です！';
    }
    
    safeAlert('全体最適化完了', summary);

  } catch (e) {
    Logger.log(`エラー: 全体最適化バッチ処理中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `全体最適化バッチ処理中にエラーが発生しました:\n${e.message}`);
  }
}

/**
 * 検針データの月次保存処理 (総合カスタム処理.gsから統合)
 */
function processInspectionDataMonthly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  
  const sourceSheetName = "inspection_data";
  const sourceSheet = ss.getSheetByName(sourceSheetName);

  if (!sourceSheet) {
    safeAlert('エラー', `${sourceSheetName} シートが見つかりません。`);
    return;
  }

  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const newSheetName = `検針データ_${currentYear}年${currentMonth}月`;

    // 既存の月次シートがあるかチェック
    if (ss.getSheetByName(newSheetName)) {
      safeAlert('情報', `${newSheetName} は既に存在します。`);
      return;
    }

    // 新しいシートを作成
    const newSheet = ss.insertSheet(newSheetName);

    // ソースデータを取得
    const sourceValues = sourceSheet.getDataRange().getValues();
    const sourceHeaders = sourceValues[0];

    // 必要な列のインデックスを取得
    const columnsToCopy = [
      "記録ID", "物件名", "物件ID", "部屋ID", "部屋名",
      "検針日時", "今回使用量", "今回の指示数", "前回指示数", "写真URL"
    ];
    const columnIndicesToCopy = columnsToCopy.map(header => sourceHeaders.indexOf(header));

    // 必要な列が見つからない場合はエラー
    if (columnIndicesToCopy.some(index => index === -1)) {
      const missingColumns = columnsToCopy.filter((_, i) => columnIndicesToCopy[i] === -1);
      safeAlert('エラー', `必要な列が見つかりません: ${missingColumns.join(", ")}`);
      if (ss.getSheetByName(newSheetName)) {
        ss.deleteSheet(ss.getSheetByName(newSheetName));
      }
      return;
    }

    // 新しいシートにデータをコピー
    const dataToCopyToNewSheet = sourceValues.map(row => {
      return columnIndicesToCopy.map(index => row[index]);
    });

    if (dataToCopyToNewSheet.length > 0) {
      newSheet.getRange(1, 1, dataToCopyToNewSheet.length, columnsToCopy.length).setValues(dataToCopyToNewSheet);
    }

    Logger.log(`月次検針データ保存完了: ${newSheetName}`);
    safeAlert('完了', `月次検針データの保存が完了しました。\nシート名: ${newSheetName}`);

  } catch (e) {
    Logger.log(`エラー: 月次検針データ保存中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `月次検針データ保存中にエラーが発生しました:\n${e.message}`);
  }
}

/**
 * inspection_dataの初期データ作成 (総合カスタム処理.gsから統合)
 */
function createInitialInspectionData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  
  const propertyMasterSheet = ss.getSheetByName('物件マスタ');
  const roomMasterSheet = ss.getSheetByName('部屋マスタ');
  let inspectionDataSheet = ss.getSheetByName('inspection_data');

  if (!propertyMasterSheet) {
    safeAlert('エラー', '物件マスタシートが見つかりません。');
    return;
  }
  if (!roomMasterSheet) {
    safeAlert('エラー', '部屋マスタシートが見つかりません。');
    return;
  }

  try {
    // inspection_dataシートが存在しない場合は作成
    if (!inspectionDataSheet) {
      inspectionDataSheet = ss.insertSheet('inspection_data');
      const headers = [
        '記録ID', '物件名', '物件ID', '部屋ID', '部屋名',
        '検針日時', '警告フラグ', '標準偏差値', '今回使用量',
        '今回の指示数', '前回指示数', '前々回指示数', '前々々回指示数'
      ];
      inspectionDataSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
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

    // 部屋マスタからデータを取得してinspection_dataに追加
    const roomData = roomMasterSheet.getDataRange().getValues().slice(1);
    const newRows = [];

    roomData.forEach(row => {
      const propertyId = String(row[0]).trim();
      const roomId = String(row[1]).trim();
      const roomName = String(row[2]).trim();

      if (propertyId && roomId) {
        const propertyName = propertyMap[propertyId] || '';
        newRows.push([
          Utilities.getUuid(),  // 記録ID
          propertyName,         // 物件名
          propertyId,          // 物件ID
          roomId,              // 部屋ID
          roomName,            // 部屋名
          '',                  // 検針日時
          '',                  // 警告フラグ
          '',                  // 標準偏差値
          '',                  // 今回使用量
          '',                  // 今回の指示数
          '',                  // 前回指示数
          '',                  // 前々回指示数
          ''                   // 前々々回指示数
        ]);
      }
    });

    if (newRows.length > 0) {
      const nextRow = inspectionDataSheet.getLastRow() + 1;
      inspectionDataSheet.getRange(nextRow, 1, newRows.length, 13).setValues(newRows);
    }

    Logger.log(`初期検針データ作成完了: ${newRows.length}件`);
    safeAlert('完了', `初期検針データの作成が完了しました。\n作成件数: ${newRows.length}件`);

  } catch (e) {
    Logger.log(`エラー: 初期検針データ作成中にエラーが発生しました: ${e.message}`);
    safeAlert('エラー', `初期検針データ作成中にエラーが発生しました:\n${e.message}`);
  }
}

/**
 * データベース全体の最適化とパフォーマンス向上
 */
function optimizeDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }

  try {
    Logger.log('⚡ データベース最適化を開始します...');
    const startTime = new Date();

    // 1. データフォーマット統一
    Logger.log('📋 ステップ1: データフォーマット統一');
    formatPropertyIdsInPropertyMaster();
    formatPropertyIdsInRoomMaster();

    // 2. データインデックス作成
    Logger.log('📊 ステップ2: データインデックス作成');
    createDataIndexes();

    // 3. データ整合性チェック
    Logger.log('🔍 ステップ3: データ整合性チェック');
    const validationResults = validateInspectionDataIntegrity();

    // 4. 統計情報生成
    Logger.log('📈 ステップ4: 統計情報生成');
    const statistics = generateDataStatistics();

    const endTime = new Date();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    Logger.log(`⚡ データベース最適化完了 (処理時間: ${processingTime}秒)`);
    
    let summary = `✅ データベース最適化が完了しました！\n処理時間: ${processingTime}秒\n\n`;
    summary += '実行された処理:\n';
    summary += '1. ✅ データフォーマット統一\n';
    summary += '2. ✅ データインデックス作成\n';
    summary += '3. ✅ データ整合性チェック\n';
    summary += '4. ✅ 統計情報生成\n';
    
    if (statistics) {
      summary += `\n📊 現在のデータ状況:\n`;
      summary += `   物件: ${statistics.property.count}件\n`;
      summary += `   部屋: ${statistics.room.count}件\n`;
      summary += `   検針データ: ${statistics.inspection.count}件\n`;
    }

    if (validationResults && Object.values(validationResults).some(arr => arr.length > 0)) {
      summary += '\n⚠️ 一部データに問題が検出されました。詳細は整合性チェック結果をご確認ください。';
    } else {
      summary += '\n🎉 データベースは正常に最適化されました！';
    }
    
    safeAlert('データベース最適化完了', summary);

  } catch (e) {
    Logger.log(`エラー: データベース最適化中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `データベース最適化中にエラーが発生しました:\n${e.message}`);
  }
}

/**
 * 定期メンテナンス用バッチ処理
 */
function runScheduledMaintenance() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }

  try {
    Logger.log('🔧 定期メンテナンスを開始します...');
    const startTime = new Date();

    // 1. データクリーンアップ
    Logger.log('🧹 ステップ1: データクリーンアップ');
    runCompleteDataCleanup();

    // 2. データベース最適化
    Logger.log('⚡ ステップ2: データベース最適化');
    optimizeDatabase();

    // 3. データ統計更新
    Logger.log('📈 ステップ3: データ統計更新');
    const statistics = generateDataStatistics();

    const endTime = new Date();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    Logger.log(`🔧 定期メンテナンス完了 (処理時間: ${processingTime}秒)`);
    
    let summary = `✅ 定期メンテナンスが完了しました！\n処理時間: ${processingTime}秒\n\n`;
    summary += '実行された処理:\n';
    summary += '1. ✅ データクリーンアップ\n';
    summary += '2. ✅ データベース最適化\n';
    summary += '3. ✅ データ統計更新\n';
    
    if (statistics) {
      summary += `\n📊 メンテナンス後のデータ状況:\n`;
      summary += `   物件: ${statistics.property.count}件\n`;
      summary += `   部屋: ${statistics.room.count}件\n`;
      summary += `   検針データ: ${statistics.inspection.count}件\n`;
      if (statistics.inspection.completionRate) {
        summary += `   検針完了率: ${statistics.inspection.completionRate}%\n`;
      }
    }

    summary += '\n🎉 システムは最適な状態にメンテナンスされました！';
    
    safeAlert('定期メンテナンス完了', summary);

  } catch (e) {
    Logger.log(`エラー: 定期メンテナンス中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `定期メンテナンス中にエラーが発生しました:\n${e.message}`);
  }
}

/**
 * データエクスポート用バッチ処理
 */
function exportDataBatch() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }

  try {
    Logger.log('📤 データエクスポートバッチを開始します...');
    const startTime = new Date();

    // 現在の日時をフォーマット
    const currentDate = new Date();
    const dateString = Utilities.formatDate(currentDate, Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmm');

    // 1. 月次データ保存
    Logger.log('📋 ステップ1: 月次検針データ保存');
    processInspectionDataMonthly();

    // 2. バックアップシート作成
    Logger.log('💾 ステップ2: バックアップシート作成');
    const backupSheetName = `バックアップ_${dateString}`;
    
    const inspectionSheet = ss.getSheetByName('inspection_data');
    if (inspectionSheet) {
      const backupSheet = inspectionSheet.copyTo(ss);
      backupSheet.setName(backupSheetName);
      Logger.log(`バックアップシート作成完了: ${backupSheetName}`);
    }

    const endTime = new Date();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    Logger.log(`📤 データエクスポートバッチ完了 (処理時間: ${processingTime}秒)`);
    
    let summary = `✅ データエクスポートが完了しました！\n処理時間: ${processingTime}秒\n\n`;
    summary += '実行された処理:\n';
    summary += '1. ✅ 月次検針データ保存\n';
    summary += '2. ✅ バックアップシート作成\n';
    summary += `\n💾 作成されたバックアップ: ${backupSheetName}\n`;
    summary += '\n🎉 データは安全にエクスポートされました！';
    
    safeAlert('データエクスポート完了', summary);

  } catch (e) {
    Logger.log(`エラー: データエクスポート中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `データエクスポート中にエラーが発生しました:\n${e.message}`);
  }
}
