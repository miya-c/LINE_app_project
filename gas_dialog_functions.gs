/**
 * GAS HTML Dialog Functions - 統合版
 * Google Apps Script対応のダイアログ表示関数群
 * 実行コンテキストエラー対応済み
 */

/**
 * 実行コンテキストを検証し、UIが利用可能かチェック
 * @returns {boolean} UIが利用可能な場合true
 */
function isUiAvailable() {
  try {
    SpreadsheetApp.getUi();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 実行コンテキストエラー時のユーザーガイダンス
 */
function showExecutionGuidance() {
  console.log('='.repeat(80));
  console.log('【重要】実行方法について');
  console.log('='.repeat(80));
  console.log('');
  console.log('❌ スクリプトエディタから直接実行することはできません。');
  console.log('');
  console.log('✅ 正しい実行方法:');
  console.log('1. Googleスプレッドシートを開く');
  console.log('2. メニューバーの「水道検針」→「アプリを開く」をクリック');
  console.log('');
  console.log('📝 メニューが表示されない場合:');
  console.log('1. スプレッドシートを再読み込み（F5キー）');
  console.log('2. または下記の関数を実行: setupOnOpenTrigger()');
  console.log('');
  console.log('='.repeat(80));
  
  return '実行ガイダンスをコンソールに出力しました。上記の手順に従ってスプレッドシートから実行してください。';
}

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
 * 物件選択ダイアログを表示
 */
function showPropertySelectDialog() {
  if (!isUiAvailable()) {
    throw new Error('この関数はスプレッドシートのメニューから実行してください。スクリプトエディタからの直接実行はサポートされていません。');
  }
  
  try {
    const htmlOutput = HtmlService.createTemplateFromFile('property_select_gas');
    const html = htmlOutput.evaluate()
      .setWidth(800)
      .setHeight(600)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    SpreadsheetApp.getUi().showModalDialog(html, '物件選択');
  } catch (error) {
    console.error('[showPropertySelectDialog] エラー:', error);
    if (!isUiAvailable()) {
      return showExecutionGuidance();
    }
    throw new Error('物件選択ダイアログの表示に失敗しました: ' + error.message);
  }
}

/**
 * 部屋選択ダイアログを表示
 * @param {string} propertyId - 物件ID
 * @param {string} propertyName - 物件名
 */
function openRoomSelectDialog(propertyId, propertyName) {
  if (!isUiAvailable()) {
    throw new Error('この関数はスプレッドシートのメニューから実行してください。スクリプトエディタからの直接実行はサポートされていません。');
  }
  
  try {
    console.log('[openRoomSelectDialog] 開始 - propertyId:', propertyId, 'propertyName:', propertyName);
    
    // 部屋データを取得
    const rooms = getRooms(propertyId);
    
    const htmlOutput = HtmlService.createTemplateFromFile('room_select_gas');
    
    // テンプレートに変数を渡す
    htmlOutput.propertyId = propertyId;
    htmlOutput.propertyName = propertyName;
    htmlOutput.rooms = JSON.stringify(rooms); // JSONエンコード
    
    const html = htmlOutput.evaluate()
      .setWidth(800)
      .setHeight(600)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    SpreadsheetApp.getUi().showModalDialog(html, `部屋選択 - ${propertyName}`);
  } catch (error) {
    console.error('[openRoomSelectDialog] エラー:', error);
    if (!isUiAvailable()) {
      return showExecutionGuidance();
    }
    throw new Error('部屋選択ダイアログの表示に失敗しました: ' + error.message);
  }
}

/**
 * 検針入力ダイアログを表示
 * @param {string} propertyId - 物件ID
 * @param {string} propertyName - 物件名
 * @param {string} roomId - 部屋ID
 * @param {string} roomName - 部屋名
 */
function openMeterReadingDialog(propertyId, propertyName, roomId, roomName) {
  if (!isUiAvailable()) {
    throw new Error('この関数はスプレッドシートのメニューから実行してください。スクリプトエディタからの直接実行はサポートされていません。');
  }
  
  try {
    console.log('[openMeterReadingDialog] 開始');
    console.log('- propertyId:', propertyId);
    console.log('- propertyName:', propertyName);
    console.log('- roomId:', roomId);
    console.log('- roomName:', roomName);
    
    // 検針データを事前に取得
    const meterReadings = getMeterReadings(propertyId, roomId);
    
    const htmlOutput = HtmlService.createTemplateFromFile('meter_reading_gas');
    
    // テンプレートに変数を渡す
    htmlOutput.propertyId = propertyId;
    htmlOutput.propertyName = propertyName;
    htmlOutput.roomId = roomId;
    htmlOutput.roomName = roomName;
    htmlOutput.meterReadings = JSON.stringify(meterReadings); // JSONエンコード
    
    const html = htmlOutput.evaluate()
      .setWidth(900)
      .setHeight(700)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    SpreadsheetApp.getUi().showModalDialog(html, `検針情報 - ${propertyName} ${roomName}`);
  } catch (error) {
    console.error('[openMeterReadingDialog] エラー:', error);
    if (!isUiAvailable()) {
      return showExecutionGuidance();
    }
    throw new Error('検針ダイアログの表示に失敗しました: ' + error.message);
  }
}

// ===================================
// 物件.gs統合 - Web App API関数群
// ===================================

/**
 * Web App用のメイン関数 - API要求とHTML表示を処理 (物件.gsから統合)
 * @param {Object} e - リクエストイベントオブジェクト  
 * @returns {HtmlOutput|TextOutput} HTMLページまたはJSONレスポンス
 */
function doGetFromBukken(e) {
  try {
    console.log('[doGet] Web App アクセス開始');
    console.log('[doGet] パラメータ:', e?.parameter);
    
    // API要求の場合（actionパラメータが存在）
    if (e?.parameter?.action) {
      const action = e.parameter.action;
      console.log('[doGet] API要求 - アクション:', action);
      
      switch (action) {
        case 'getProperties':
          console.log('[doGet] API: getProperties');
          try {
            const properties = getProperties();
            console.log('[doGet] 物件データ取得完了 - 件数:', Array.isArray(properties) ? properties.length : 'not array');
            
            const response = {
              success: true,
              data: Array.isArray(properties) ? properties : [],
              count: Array.isArray(properties) ? properties.length : 0,
              timestamp: new Date().toISOString(),
              debugInfo: {
                functionCalled: 'getProperties',
                propertiesType: typeof properties,
                isArray: Array.isArray(properties)
              }
            };
            
            return ContentService
              .createTextOutput(JSON.stringify(response))
              .setMimeType(ContentService.MimeType.JSON);
          } catch (apiError) {
            console.error('[doGet] getProperties API エラー:', apiError);
            
            const errorResponse = {
              success: false,
              error: `物件データ取得エラー: ${apiError.message}`,
              data: [],
              count: 0,
              timestamp: new Date().toISOString(),
              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack
              }
            };
            
            return ContentService
              .createTextOutput(JSON.stringify(errorResponse))
              .setMimeType(ContentService.MimeType.JSON);
          }
          
        case 'getRooms':
          console.log('[doGet] API: getRooms');
          try {
            const propertyId = e.parameter.propertyId;
            if (!propertyId) {
              throw new Error('propertyId パラメータが必要です');
            }
            
            console.log('[doGet] 部屋データ取得開始 - propertyId:', propertyId);
            const rooms = getRooms(propertyId);
            console.log('[doGet] 部屋データ取得完了 - 件数:', Array.isArray(rooms) ? rooms.length : 'not array');
            
            const response = {
              success: true,
              data: Array.isArray(rooms) ? rooms : [],
              count: Array.isArray(rooms) ? rooms.length : 0,
              timestamp: new Date().toISOString(),
              propertyId: propertyId,
              debugInfo: {
                functionCalled: 'getRooms',
                roomsType: typeof rooms,
                isArray: Array.isArray(rooms)
              }
            };
            
            return ContentService
              .createTextOutput(JSON.stringify(response))
              .setMimeType(ContentService.MimeType.JSON);
              
          } catch (apiError) {
            console.error('[doGet] getRooms API エラー:', apiError);
            
            const errorResponse = {
              success: false,
              error: `部屋データ取得エラー: ${apiError.message}`,
              data: [],
              count: 0,
              timestamp: new Date().toISOString(),
              propertyId: e.parameter.propertyId || 'unknown',
              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack
              }
            };
            
            return ContentService
              .createTextOutput(JSON.stringify(errorResponse))
              .setMimeType(ContentService.MimeType.JSON);
          }
          
        case 'getMeterReadings':
          console.log('[doGet] API: getMeterReadings');
          try {
            const propertyId = e.parameter.propertyId;
            const roomId = e.parameter.roomId;
            
            if (!propertyId || !roomId) {
              throw new Error('propertyId と roomId パラメータが必要です');
            }
            
            console.log('[doGet] 検針データ取得開始 - propertyId:', propertyId, 'roomId:', roomId);
            const meterReadings = getMeterReadings(propertyId, roomId);
            console.log('[doGet] 検針データ取得完了 - 件数:', Array.isArray(meterReadings) ? meterReadings.length : 'not array');
            
            const response = {
              success: true,
              data: Array.isArray(meterReadings) ? meterReadings : [],
              count: Array.isArray(meterReadings) ? meterReadings.length : 0,
              timestamp: new Date().toISOString(),
              propertyId: propertyId,
              roomId: roomId,
              debugInfo: {
                functionCalled: 'getMeterReadings',
                dataType: typeof meterReadings,
                isArray: Array.isArray(meterReadings)
              }
            };
            
            return ContentService
              .createTextOutput(JSON.stringify(response))
              .setMimeType(ContentService.MimeType.JSON);
              
          } catch (apiError) {
            console.error('[doGet] getMeterReadings API エラー:', apiError);
            
            const errorResponse = {
              success: false,
              error: `検針データ取得エラー: ${apiError.message}`,
              data: [],
              count: 0,
              timestamp: new Date().toISOString(),
              propertyId: e.parameter.propertyId || 'unknown',
              roomId: e.parameter.roomId || 'unknown',
              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack
              }
            };
            
            return ContentService
              .createTextOutput(JSON.stringify(errorResponse))
              .setMimeType(ContentService.MimeType.JSON);
          }
          
        case 'updateMeterReadings':
          console.log('[doGet] API: updateMeterReadings');
          try {
            const propertyId = e.parameter.propertyId;
            const roomId = e.parameter.roomId;
            const readingsParam = e.parameter.readings;
            
            if (!propertyId || !roomId || !readingsParam) {
              throw new Error('propertyId, roomId, readings パラメータが必要です');
            }
            
            let readings;
            try {
              readings = JSON.parse(readingsParam);
            } catch (parseError) {
              throw new Error('readings パラメータが有効なJSONではありません');
            }
            
            console.log('[doGet] 検針データ更新開始 - propertyId:', propertyId, 'roomId:', roomId);
            const result = updateMeterReadings(propertyId, roomId, readings);
            console.log('[doGet] 検針データ更新完了:', result);
            
            return ContentService
              .createTextOutput(JSON.stringify(result))
              .setMimeType(ContentService.MimeType.JSON);
              
          } catch (apiError) {
            console.error('[doGet] updateMeterReadings API エラー:', apiError);
            
            const errorResponse = {
              success: false,
              error: `検針データ更新エラー: ${apiError.message}`,
              timestamp: new Date().toISOString(),
              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack
              }
            };
            
            return ContentService
              .createTextOutput(JSON.stringify(errorResponse))
              .setMimeType(ContentService.MimeType.JSON);
          }
          
        default:
          throw new Error(`未対応のアクション: ${action}`);
      }
    }
    
    // HTML表示の場合（pageパラメータが存在）
    const page = e?.parameter?.page || 'property_select';
    console.log('[doGet] HTML要求 - ページ:', page);
    
    // 各ページの表示処理は既存のdoGet関数に統合済み
    return doGet(e);
    
  } catch (error) {
    console.error('[doGet] 全体エラー:', error);
    
    // API要求でのエラー処理
    if (e?.parameter?.action) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          error: `APIエラー: ${error.message}`,
          action: e.parameter.action,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // HTML表示でのエラー処理
    const errorHtml = HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>エラー - 水道検針アプリ</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; background: #f5f5f5; }
            .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>🚨 アプリケーションエラー</h2>
            <p>申し訳ございません。アプリケーションの読み込みに失敗しました。</p>
            <p><strong>エラー詳細:</strong> ${error.message}</p>
          </div>
        </body>
      </html>
    `);
    
    return errorHtml.setTitle('エラー - 水道検針アプリ');
  }
}

/**
 * 検針データを更新 (物件.gsから統合)
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @param {Array} readings - 更新する検針データ
 * @return {Object} 更新結果
 */
function updateMeterReadings(propertyId, roomId, readings) {
  try {
    console.log('[updateMeterReadings] ========= 関数開始 =========');
    console.log('[updateMeterReadings] 実行日時:', new Date().toISOString());
    console.log('[updateMeterReadings] バージョン: v2025-06-15-修正版');
    console.log('[updateMeterReadings] propertyId:', propertyId, 'roomId:', roomId, 'データ数:', readings.length);
    console.log('[updateMeterReadings] 更新データ:', JSON.stringify(readings));
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('inspection_data');
    
    if (!sheet) {
      throw new Error('inspection_data シートが見つかりません');
    }
    
    console.log('[updateMeterReadings] inspection_data シート取得成功');
    
    // スプレッドシートのデータを取得
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      throw new Error('スプレッドシートにデータが不足しています');
    }
    
    // ヘッダーから列インデックスを動的に取得
    const headers = data[0];
    console.log('[updateMeterReadings] ========= スプレッドシート詳細情報 =========');
    console.log('[updateMeterReadings] スプレッドシート名:', sheet.getName());
    console.log('[updateMeterReadings] データ行数:', data.length);
    console.log('[updateMeterReadings] スプレッドシートのヘッダー:', headers);
    console.log('[updateMeterReadings] 検針日時列検索:', headers.indexOf('検針日時'));
    console.log('[updateMeterReadings] 今回の指示数列検索:', headers.indexOf('今回の指示数'));
    console.log('[updateMeterReadings] 今回指示数（水道）列検索:', headers.indexOf('今回指示数（水道）'));
    console.log('[updateMeterReadings] ========================================');
    
    const columnIndexes = {
      propertyId: headers.indexOf('物件ID'),
      roomId: headers.indexOf('部屋ID'),
      date: headers.indexOf('検針日時'),
      currentReading: headers.indexOf('今回の指示数') >= 0 ? headers.indexOf('今回の指示数') : headers.indexOf('今回指示数（水道）'),
      previousReading: headers.indexOf('前回指示数'),
      usage: headers.indexOf('今回使用量'),
      warningFlag: headers.indexOf('警告フラグ'),
      recordId: headers.indexOf('記録ID')
    };
    
    console.log('[updateMeterReadings] 列インデックス:', columnIndexes);
    
    // 必要な列が存在するかチェック
    const requiredColumns = ['物件ID', '部屋ID'];
    for (const colName of requiredColumns) {
      if (!headers.includes(colName)) {
        console.log('[updateMeterReadings] ❌ 必須列が見つかりません:', colName);
        console.log('[updateMeterReadings] 利用可能な列一覧:', headers);
        throw new Error(`必要な列が見つかりません: ${colName}`);
      }
    }
    
    // 検針日時と今回指示数の列を検索
    if (columnIndexes.date === -1) {
      console.log('[updateMeterReadings] ❌ 検針日時列が見つかりません。利用可能な列:', headers);
      console.log('[updateMeterReadings] 検針日時列存在チェック:', headers.includes('検針日時'));
      throw new Error('必要な列が見つかりません: 検針日時');
    }
    if (columnIndexes.currentReading === -1) {
      console.log('[updateMeterReadings] ❌ 今回指示数列が見つかりません。利用可能な列:', headers);
      console.log('[updateMeterReadings] 今回の指示数列存在チェック:', headers.includes('今回の指示数'));
      console.log('[updateMeterReadings] 今回指示数（水道）列存在チェック:', headers.includes('今回指示数（水道）'));
      throw new Error('必要な列が見つかりません: 今回の指示数 (または 今回指示数（水道）)');
    }
    
    let updatedCount = 0;
    const updatedReadings = [];
    
    console.log('[updateMeterReadings] ===== データ処理開始 =====');
    console.log('[updateMeterReadings] 対象件数:', readings.length);
    
    // 各検針データを処理
    for (let i = 0; i < readings.length; i++) {
      const reading = readings[i];
      console.log(`[updateMeterReadings] 処理中 [${i}]:`, reading);
      
      let skip = false;
      try {
        // 検針日時の適切な処理
        let recordDate = '';
        if (reading.date && reading.date !== '') {
          if (reading.date instanceof Date) {
            const year = reading.date.getFullYear();
            const month = String(reading.date.getMonth() + 1).padStart(2, '0');
            const day = String(reading.date.getDate()).padStart(2, '0');
            recordDate = `${year}-${month}-${day}`;
          } else {
            recordDate = String(reading.date).trim();
          }
        }
        
        const currentReadingValue = parseFloat(reading.currentReading) || 0;
        
        // 既存データを検索
        let existingRowIndex = -1;
        for (let j = 1; j < data.length; j++) {
          if (data[j][columnIndexes.propertyId] === propertyId && 
              data[j][columnIndexes.roomId] === roomId) {
            existingRowIndex = j;
            break;
          }
        }
        
        let usage = 0;
        if (existingRowIndex >= 0) {
          // 既存データを更新
          const previousReadingValue = parseFloat(data[existingRowIndex][columnIndexes.previousReading]) || 0;
          
          if (previousReadingValue === 0 || data[existingRowIndex][columnIndexes.previousReading] === '' || 
              data[existingRowIndex][columnIndexes.previousReading] === null) {
            usage = currentReadingValue;
            console.log(`[updateMeterReadings] 新規検針データ - 今回指示数をそのまま使用量として設定: ${usage}`);
          } else {
            usage = Math.max(0, currentReadingValue - previousReadingValue);
            console.log(`[updateMeterReadings] 既存データ更新 - 使用量計算: ${currentReadingValue} - ${previousReadingValue} = ${usage}`);
          }
          
          // 既存行を更新
          if (recordDate) data[existingRowIndex][columnIndexes.date] = recordDate;
          data[existingRowIndex][columnIndexes.currentReading] = currentReadingValue;
          if (columnIndexes.usage >= 0) data[existingRowIndex][columnIndexes.usage] = usage;
          if (columnIndexes.warningFlag >= 0) data[existingRowIndex][columnIndexes.warningFlag] = '正常';
          
        } else {
          // 新規データを追加
          const previousReading = 0;
          usage = currentReadingValue;
          
          const newRow = new Array(headers.length).fill('');
          newRow[columnIndexes.propertyId] = propertyId;
          newRow[columnIndexes.roomId] = roomId;
          if (recordDate) newRow[columnIndexes.date] = recordDate;
          newRow[columnIndexes.currentReading] = currentReadingValue;
          newRow[columnIndexes.previousReading] = previousReading;
          if (columnIndexes.usage >= 0) newRow[columnIndexes.usage] = usage;
          if (columnIndexes.warningFlag >= 0) newRow[columnIndexes.warningFlag] = '正常';
          if (columnIndexes.recordId >= 0) newRow[columnIndexes.recordId] = Utilities.getUuid();
          
          data.push(newRow);
          console.log(`[updateMeterReadings] 新規データ追加: 指示数=${currentReadingValue}, 使用量=${usage}`);
        }
        
        updatedReadings.push({
          date: recordDate,
          currentReading: currentReadingValue,
          usage: usage,
          updated: true
        });
        
        updatedCount++;
        console.log(`[updateMeterReadings] 検針データ更新: ${recordDate || '空の日付'} - 指示数: ${currentReadingValue}, 使用量: ${usage}`);
        
      } catch (updateError) {
        console.error(`[updateMeterReadings] 検針データ更新エラー (行${i}):`, updateError.message);
        updatedReadings.push({
          date: reading.date,
          currentReading: reading.currentReading,
          error: updateError.message,
          updated: false
        });
        skip = true;
      }
      if (skip) continue;
    }
    
    console.log('[updateMeterReadings] ===== 検針データ更新処理完了 =====');
    console.log(`[updateMeterReadings] 総処理件数: ${updatedReadings.length}`);
    console.log(`[updateMeterReadings] 成功件数: ${updatedCount}`);
    
    // スプレッドシートに書き戻し
    sheet.getDataRange().setValues(data);
    console.log('[updateMeterReadings] スプレッドシート更新完了');
    
    return {
      success: true,
      updatedCount: updatedCount,
      message: `${updatedCount}件のデータを更新しました`,
      updatedReadings: updatedReadings,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[updateMeterReadings] エラー:', error);
    return {
      success: false,
      error: error.message,
      message: '検針データの更新に失敗しました',
      timestamp: new Date().toISOString()
    };
  }
}

// ===================================
// 総合カスタム処理.gs統合 - データ管理関数群
// ===================================

/**
 * inspection_dataを物件マスタと部屋マスタから自動生成 (総合カスタム処理.gsから統合)
 */
function populateInspectionDataFromMasters() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  
  const propertyMasterSheetName = '物件マスタ';
  const roomMasterSheetName = '部屋マスタ';
  const inspectionDataSheetName = 'inspection_data';

  const propertyMasterSheet = ss.getSheetByName(propertyMasterSheetName);
  const roomMasterSheet = ss.getSheetByName(roomMasterSheetName);
  const inspectionDataSheet = ss.getSheetByName(inspectionDataSheetName);
  
  if (!propertyMasterSheet) {
    safeAlert('エラー', `「${propertyMasterSheetName}」シートが見つかりません。`);
    return;
  }
  if (!roomMasterSheet) {
    safeAlert('エラー', `「${roomMasterSheetName}」シートが見つかりません。`);
    return;
  }
  if (!inspectionDataSheet) {
    safeAlert('エラー', `「${inspectionDataSheetName}」シートが見つかりません。`);
    return;
  }

  try {
    Logger.log('📊 inspection_dataの自動生成を開始します...');

    // 1. 物件マスタのデータを読み込み、物件IDと物件名のマッピングを作成
    const propertyMasterData = propertyMasterSheet.getRange(2, 1, propertyMasterSheet.getLastRow() - 1, 2).getValues();
    const propertyMap = {};
    propertyMasterData.forEach(row => {
      const propertyId = String(row[0]).trim();
      const propertyName = String(row[1]).trim();
      if (propertyId && propertyName) {
        propertyMap[propertyId] = propertyName;
      }
    });
    Logger.log(`物件マスタ読み込み完了: ${Object.keys(propertyMap).length}件`);

    // 2. inspection_dataシートのヘッダーと既存データを読み込み
    const inspectionDataHeaders = inspectionDataSheet.getRange(1, 1, 1, inspectionDataSheet.getLastColumn()).getValues()[0];
    const inspectionDataRange = inspectionDataSheet.getDataRange();
    const inspectionData = inspectionDataSheet.getLastRow() > 1 ? inspectionDataRange.getValues().slice(1) : [];

    const existingInspectionEntries = new Set();
    const propertyIdColIdxInspection = inspectionDataHeaders.indexOf('物件ID');
    const roomIdColIdxInspection = inspectionDataHeaders.indexOf('部屋ID');
    
    if (propertyIdColIdxInspection === -1 || roomIdColIdxInspection === -1) {
      safeAlert('エラー', `「${inspectionDataSheetName}」シートに「物件ID」または「部屋ID」列が見つかりません。`);
      return;
    }

    inspectionData.forEach(row => {
      const propertyId = String(row[propertyIdColIdxInspection]).trim();
      const roomId = String(row[roomIdColIdxInspection]).trim();
      if (propertyId && roomId) {
        existingInspectionEntries.add(`${propertyId}_${roomId}`);
      }
    });
    Logger.log(`inspection_data既存データ読み込み完了: ${existingInspectionEntries.size}件`);

    // 3. 部屋マスタのデータを処理
    const roomMasterData = roomMasterSheet.getRange(2, 1, roomMasterSheet.getLastRow() - 1, 3).getValues();
    const newRowsToInspectionData = [];
    let addedCount = 0;

    roomMasterData.forEach((row, index) => {
      const roomPropertyId = String(row[0]).trim();
      const roomId = String(row[1]).trim();
      const roomName = String(row[2]).trim();

      if (!roomPropertyId || !roomId) {
        Logger.log(`部屋マスタの ${index + 2} 行目は物件IDまたは部屋IDが空のためスキップします。`);
        return;
      }

      if (!existingInspectionEntries.has(`${roomPropertyId}_${roomId}`)) {
        const propertyName = propertyMap[roomPropertyId] || `物件名不明(${roomPropertyId})`;
        const newRowData = [];
        inspectionDataHeaders.forEach(header => {
          switch (header) {
            case '記録ID': newRowData.push(Utilities.getUuid()); break;
            case '物件名': newRowData.push(propertyName); break;
            case '物件ID': newRowData.push(roomPropertyId); break;
            case '部屋ID': newRowData.push(roomId); break;
            case '部屋名': newRowData.push(roomName); break;
            default: newRowData.push(''); break;
          }
        });
        newRowsToInspectionData.push(newRowData);
        addedCount++;
      }
    });

    // 4. 新しいデータをinspection_dataシートに追加
    if (newRowsToInspectionData.length > 0) {
      const nextRow = inspectionDataSheet.getLastRow() + 1;
      inspectionDataSheet.getRange(nextRow, 1, newRowsToInspectionData.length, inspectionDataHeaders.length).setValues(newRowsToInspectionData);
    }

    const endTime = new Date();
    Logger.log(`📊 inspection_data自動生成完了: ${addedCount}件の新しいエントリを追加しました`);
    safeAlert('完了', `✅ inspection_dataの自動生成が完了しました。\n追加されたエントリ: ${addedCount}件`);

  } catch (e) {
    Logger.log(`エラー: inspection_data自動生成中にエラーが発生しました: ${e.message}`);
    safeAlert('エラー', `inspection_data自動生成中にエラーが発生しました:\n${e.message}`);
  }
}

/**
 * 物件マスタの物件IDフォーマット変更 (総合カスタム処理.gsから統合)
 */
function formatPropertyIdsInPropertyMaster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  
  const sheet = ss.getSheetByName('物件マスタ');

  if (!sheet) {
    safeAlert('エラー', '物件マスタシートが見つかりません。');
    return;
  }

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  let updatedCount = 0;

  if (values.length <= 1) {
    safeAlert('情報', '物件マスタシートにデータがありません。');
    return;
  }

  try {
    for (let i = 1; i < values.length; i++) {
      const currentId = String(values[i][0]).trim();
      
      if (currentId && !currentId.startsWith('P')) {
        const formattedId = `P${currentId.padStart(6, '0')}`;
        values[i][0] = formattedId;
        updatedCount++;
        Logger.log(`行 ${i + 1}: ${currentId} → ${formattedId}`);
      }
    }

    if (updatedCount > 0) {
      dataRange.setValues(values);
      Logger.log(`物件マスタのフォーマット変更完了: ${updatedCount}件`);
      safeAlert('完了', `物件マスタのIDフォーマット変更が完了しました。\n更新件数: ${updatedCount}件`);
    } else {
      safeAlert('情報', '更新が必要な物件IDはありませんでした。');
    }
  } catch (e) {
    Logger.log(`エラー: 物件マスタフォーマット変更中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `物件マスタフォーマット変更中にエラーが発生しました:\n${e.message}`);
  }
}

/**
 * 部屋マスタの物件IDフォーマット変更 (総合カスタム処理.gsから統合)
 */
function formatPropertyIdsInRoomMaster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  
  const sheet = ss.getSheetByName('部屋マスタ');

  if (!sheet) {
    safeAlert('エラー', '部屋マスタシートが見つかりません。');
    return;
  }

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  let updatedCount = 0;

  if (values.length <= 1) {
    safeAlert('情報', '部屋マスタシートにデータがありません。');
    return;
  }

  try {
    for (let i = 1; i < values.length; i++) {
      const currentId = String(values[i][0]).trim();
      
      if (currentId && !currentId.startsWith('P')) {
        const formattedId = `P${currentId.padStart(6, '0')}`;
        values[i][0] = formattedId;
        updatedCount++;
        Logger.log(`行 ${i + 1}: ${currentId} → ${formattedId}`);
      }
    }

    if (updatedCount > 0) {
      dataRange.setValues(values);
      Logger.log(`部屋マスタのフォーマット変更完了: ${updatedCount}件`);
      safeAlert('完了', `部屋マスタのIDフォーマット変更が完了しました。\n更新件数: ${updatedCount}件`);
    } else {
      safeAlert('情報', '更新が必要な物件IDはありませんでした。');
    }
  } catch (e) {
    Logger.log(`エラー: 部屋マスタフォーマット変更中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `部屋マスタフォーマット変更中にエラーが発生しました:\n${e.message}`);
  }
}

/**
 * 部屋マスタ整合性チェックと孤立部屋データの削除 (総合カスタム処理.gsから統合)
 */
function cleanUpOrphanedRooms() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  
  const roomSheet = ss.getSheetByName('部屋マスタ');
  const propertySheet = ss.getSheetByName('物件マスタ');

  if (!roomSheet) {
    safeAlert('エラー', '部屋マスタシートが見つかりません。');
    return;
  }
  if (!propertySheet) {
    safeAlert('エラー', '物件マスタシートが見つかりません。');
    return;
  }

  try {
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
        Logger.log(`削除対象: 行${index + 2} - 物件ID: ${propertyId}`);
      }
    });

    if (removedCount > 0) {
      // データを更新
      roomSheet.clear();
      if (validRows.length > 0) {
        roomSheet.getRange(1, 1, validRows.length, headers.length).setValues(validRows);
      }
      
      Logger.log(`部屋マスタクリーンアップ完了: ${removedCount}件の孤立データを削除`);
      safeAlert('完了', `部屋マスタのクリーンアップが完了しました。\n削除された孤立データ: ${removedCount}件`);
    } else {
      safeAlert('情報', '削除が必要な孤立データはありませんでした。');
    }
  } catch (e) {
    Logger.log(`エラー: 部屋マスタクリーンアップ中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `部屋マスタクリーンアップ中にエラーが発生しました:\n${e.message}`);
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
 * データ整合性チェック機能 (総合カスタム処理.gsから統合)
 */
function validateInspectionDataIntegrity() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }

  try {
    Logger.log('🔍 データ整合性チェックを開始します...');
    const startTime = new Date();

    // 各マスタシートを取得
    const propertyMasterSheet = ss.getSheetByName('物件マスタ');
    const roomMasterSheet = ss.getSheetByName('部屋マスタ');
    const inspectionDataSheet = ss.getSheetByName('inspection_data');

    if (!propertyMasterSheet || !roomMasterSheet || !inspectionDataSheet) {
      safeAlert('エラー', '必要なシート（物件マスタ、部屋マスタ、inspection_data）が見つかりません');
      return;
    }

    // 物件マスタから有効な物件IDを取得
    const propertyMasterData = propertyMasterSheet.getDataRange().getValues();
    const validPropertyIds = new Set();
    for (let i = 1; i < propertyMasterData.length; i++) {
      const propertyId = String(propertyMasterData[i][0]).trim();
      if (propertyId) {
        validPropertyIds.add(propertyId);
      }
    }

    // 部屋マスタから有効な部屋IDと物件-部屋の組み合わせを取得
    const roomMasterData = roomMasterSheet.getDataRange().getValues();
    const validRoomIds = new Set();
    const validPropertyRoomCombinations = new Set();
    for (let i = 1; i < roomMasterData.length; i++) {
      const propertyId = String(roomMasterData[i][0]).trim();
      const roomId = String(roomMasterData[i][1]).trim();
      if (propertyId && roomId) {
        validRoomIds.add(roomId);
        validPropertyRoomCombinations.add(`${propertyId}_${roomId}`);
      }
    }

    // データインデックスを作成
    const indexes = createDataIndexes();
    if (!indexes) {
      return;
    }

    // 整合性チェック結果
    const issues = {
      invalidPropertyIds: [],
      invalidRoomIds: [],
      invalidCombinations: [],
      duplicateRecordIds: Array.from(indexes.duplicateRecordIds),
      missingRecordIds: [],
      inconsistentPropertyNames: []
    };

    // 検針データの各レコードをチェック
    indexes.byRecordId.forEach((rowData, recordId) => {
      const { propertyId, roomId, propertyName } = rowData;

      // 記録IDチェック
      if (!recordId || recordId === '') {
        issues.missingRecordIds.push(`行 ${rowData.rowIndex + 1}`);
      }

      // 物件IDチェック
      if (propertyId && !validPropertyIds.has(propertyId)) {
        issues.invalidPropertyIds.push(`行 ${rowData.rowIndex + 1}: ${propertyId}`);
      }

      // 部屋IDチェック
      if (roomId && !validRoomIds.has(roomId)) {
        issues.invalidRoomIds.push(`行 ${rowData.rowIndex + 1}: ${roomId}`);
      }

      // 物件-部屋組み合わせチェック
      if (propertyId && roomId) {
        const combination = `${propertyId}_${roomId}`;
        if (!validPropertyRoomCombinations.has(combination)) {
          issues.invalidCombinations.push(`行 ${rowData.rowIndex + 1}: ${combination}`);
        }
      }

      // 物件名の整合性チェック（物件マスタと比較）
      if (propertyId && validPropertyIds.has(propertyId)) {
        const masterPropertyName = propertyMasterData.find(row => 
          String(row[0]).trim() === propertyId
        )?.[1];
        if (masterPropertyName && String(masterPropertyName).trim() !== propertyName) {
          issues.inconsistentPropertyNames.push(
            `行 ${rowData.rowIndex + 1}: 検針データ="${propertyName}" vs マスタ="${masterPropertyName}"`
          );
        }
      }
    });

    const endTime = new Date();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    // 結果レポート作成
    let reportMessage = `🔍 データ整合性チェック結果\n処理時間: ${processingTime}秒\n\n`;
    
    if (Object.values(issues).every(arr => arr.length === 0)) {
      reportMessage += '✅ 問題は見つかりませんでした。';
    } else {
      if (issues.invalidPropertyIds.length > 0) {
        reportMessage += `❌ 無効な物件ID (${issues.invalidPropertyIds.length}件):\n${issues.invalidPropertyIds.join('\n')}\n\n`;
      }
      if (issues.invalidRoomIds.length > 0) {
        reportMessage += `❌ 無効な部屋ID (${issues.invalidRoomIds.length}件):\n${issues.invalidRoomIds.join('\n')}\n\n`;
      }
      if (issues.invalidCombinations.length > 0) {
        reportMessage += `❌ 無効な物件-部屋組み合わせ (${issues.invalidCombinations.length}件):\n${issues.invalidCombinations.join('\n')}\n\n`;
      }
      if (issues.duplicateRecordIds.length > 0) {
        reportMessage += `❌ 重複記録ID (${issues.duplicateRecordIds.length}件):\n${issues.duplicateRecordIds.join('\n')}\n\n`;
      }
      if (issues.missingRecordIds.length > 0) {
        reportMessage += `❌ 欠損記録ID (${issues.missingRecordIds.length}件):\n${issues.missingRecordIds.join('\n')}\n\n`;
      }
      if (issues.inconsistentPropertyNames.length > 0) {
        reportMessage += `❌ 物件名不整合 (${issues.inconsistentPropertyNames.length}件):\n${issues.inconsistentPropertyNames.join('\n')}`;
      }
    }

    Logger.log(reportMessage);
    safeAlert('データ整合性チェック完了', reportMessage);

    return issues;

  } catch (e) {
    Logger.log(`エラー: データ整合性チェック中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `データ整合性チェック中にエラーが発生しました:\n${e.message}`);
    return null;
  }
}

/**
 * データ高速検索用のインデックスを作成 (総合カスタム処理.gsから統合)
 */
function createDataIndexes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return null;
  }

  try {
    Logger.log('📊 データインデックス作成を開始します...');

    const inspectionSheet = ss.getSheetByName('inspection_data');
    if (!inspectionSheet) {
      safeAlert('エラー', 'inspection_dataシートが見つかりません');
      return null;
    }

    const data = inspectionSheet.getDataRange().getValues();
    if (data.length <= 1) {
      safeAlert('情報', 'inspection_dataシートにデータがありません');
      return null;
    }

    const headers = data[0];
    const recordIdIndex = headers.indexOf('記録ID');
    const propertyIdIndex = headers.indexOf('物件ID');
    const roomIdIndex = headers.indexOf('部屋ID');
    const propertyNameIndex = headers.indexOf('物件名');
    const roomNameIndex = headers.indexOf('部屋名');
    const inspectionDateIndex = headers.indexOf('検針日時');
    const currentReadingIndex = headers.indexOf('今回の指示数');
    const previousReadingIndex = headers.indexOf('前回指示数');
    const usageIndex = headers.indexOf('今回使用量');

    if ([recordIdIndex, propertyIdIndex, roomIdIndex].includes(-1)) {
      safeAlert('エラー', '必要な列（記録ID、物件ID、部屋ID）が見つかりません');
      return null;
    }

    // インデックス構造を作成
    const indexes = {
      byRecordId: new Map(),
      byPropertyId: new Map(),
      byRoomId: new Map(),
      byPropertyRoom: new Map(),
      duplicateRecordIds: new Set(),
      totalRecords: data.length - 1
    };

    const recordIdCounts = new Map();

    // データを処理してインデックスを作成
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const recordId = String(row[recordIdIndex] || '').trim();
      const propertyId = String(row[propertyIdIndex] || '').trim();
      const roomId = String(row[roomIdIndex] || '').trim();
      const propertyName = String(row[propertyNameIndex] || '').trim();
      const roomName = String(row[roomNameIndex] || '').trim();

      const rowData = {
        rowIndex: i,
        recordId,
        propertyId,
        roomId,
        propertyName,
        roomName,
        inspectionDate: row[inspectionDateIndex],
        currentReading: row[currentReadingIndex],
        previousReading: row[previousReadingIndex],
        usage: row[usageIndex]
      };

      // 記録IDインデックス（重複チェック含む）
      if (recordId) {
        recordIdCounts.set(recordId, (recordIdCounts.get(recordId) || 0) + 1);
        if (recordIdCounts.get(recordId) > 1) {
          indexes.duplicateRecordIds.add(recordId);
        }
        indexes.byRecordId.set(recordId, rowData);
      }

      // 物件IDインデックス
      if (propertyId) {
        if (!indexes.byPropertyId.has(propertyId)) {
          indexes.byPropertyId.set(propertyId, []);
        }
        indexes.byPropertyId.get(propertyId).push(rowData);
      }

      // 部屋IDインデックス
      if (roomId) {
        if (!indexes.byRoomId.has(roomId)) {
          indexes.byRoomId.set(roomId, []);
        }
        indexes.byRoomId.get(roomId).push(rowData);
      }

      // 物件-部屋組み合わせインデックス
      if (propertyId && roomId) {
        const key = `${propertyId}_${roomId}`;
        if (!indexes.byPropertyRoom.has(key)) {
          indexes.byPropertyRoom.set(key, []);
        }
        indexes.byPropertyRoom.get(key).push(rowData);
      }
    }

    Logger.log(`📊 データインデックス作成完了: ${indexes.totalRecords}件のレコードを処理`);
    Logger.log(`- 物件数: ${indexes.byPropertyId.size}`);
    Logger.log(`- 部屋数: ${indexes.byRoomId.size}`);
    Logger.log(`- 物件-部屋組み合わせ数: ${indexes.byPropertyRoom.size}`);
    Logger.log(`- 重複記録ID数: ${indexes.duplicateRecordIds.size}`);

    return indexes;

  } catch (e) {
    Logger.log(`エラー: データインデックス作成中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `データインデックス作成中にエラーが発生しました:\n${e.message}`);
    return null;
  }
}

/**
 * 重複データクリーンアップ機能 (総合カスタム処理.gsから統合)
 */
function optimizedCleanupDuplicateInspectionData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }

  try {
    Logger.log('🧹 重複データクリーンアップを開始します...');
    const startTime = new Date();

    const inspectionSheet = ss.getSheetByName('inspection_data');
    if (!inspectionSheet) {
      safeAlert('エラー', 'inspection_dataシートが見つかりません');
      return;
    }

    const data = inspectionSheet.getDataRange().getValues();
    if (data.length <= 1) {
      safeAlert('情報', 'inspection_dataシートにデータがありません');
      return;
    }

    const headers = data[0];
    const recordIdIndex = headers.indexOf('記録ID');
    const propertyIdIndex = headers.indexOf('物件ID');
    const roomIdIndex = headers.indexOf('部屋ID');

    if ([recordIdIndex, propertyIdIndex, roomIdIndex].includes(-1)) {
      safeAlert('エラー', '必要な列（記録ID、物件ID、部屋ID）が見つかりません');
      return;
    }

    // 重複チェック用のマップ
    const recordIdMap = new Map();
    const propertyRoomMap = new Map();
    const duplicateRows = new Set();

    // 重複を特定
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const recordId = String(row[recordIdIndex] || '').trim();
      const propertyId = String(row[propertyIdIndex] || '').trim();
      const roomId = String(row[roomIdIndex] || '').trim();

      // 記録IDの重複チェック
      if (recordId) {
        if (recordIdMap.has(recordId)) {
          duplicateRows.add(i);
          Logger.log(`重複記録ID発見: ${recordId} (行 ${i + 1})`);
        } else {
          recordIdMap.set(recordId, i);
        }
      }

      // 物件-部屋組み合わせの重複チェック
      if (propertyId && roomId) {
        const key = `${propertyId}_${roomId}`;
        if (propertyRoomMap.has(key)) {
          // より新しいデータを保持（行番号が大きいものを優先）
          const existingRowIndex = propertyRoomMap.get(key);
          duplicateRows.add(existingRowIndex);
          propertyRoomMap.set(key, i);
          Logger.log(`重複物件-部屋組み合わせ発見: ${key} (古い行 ${existingRowIndex + 1} を削除対象に)`);
        } else {
          propertyRoomMap.set(key, i);
        }
      }
    }

    if (duplicateRows.size === 0) {
      safeAlert('情報', '重複データは見つかりませんでした。');
      return;
    }

    // 重複行を除いた新しいデータを作成
    const cleanedData = [headers];
    for (let i = 1; i < data.length; i++) {
      if (!duplicateRows.has(i)) {
        cleanedData.push(data[i]);
      }
    }

    // シートを更新
    inspectionSheet.clear();
    if (cleanedData.length > 0) {
      inspectionSheet.getRange(1, 1, cleanedData.length, headers.length).setValues(cleanedData);
    }

    const endTime = new Date();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    Logger.log(`🧹 重複データクリーンアップ完了: ${duplicateRows.size}件の重複データを削除 (処理時間: ${processingTime}秒)`);
    safeAlert('完了', `重複データクリーンアップが完了しました。\n削除件数: ${duplicateRows.size}件\n処理時間: ${processingTime}秒`);

  } catch (e) {
    Logger.log(`エラー: 重複データクリーンアップ中にエラーが発生: ${e.message}`);
    safeAlert('エラー', `重複データクリーンアップ中にエラーが発生しました:\n${e.message}`);
  }
}

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

// ===================================
// ユーティリティ関数
// ===================================

/**
 * UI操作を安全に処理するためのヘルパー関数 (総合カスタム処理.gsから統合)
 * @param {string} title - アラートのタイトル
 * @param {string} message - アラートのメッセージ
 */
function safeAlert(title, message) {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert(title, message, ui.ButtonSet.OK);
  } catch (e) {
    Logger.log(`${title}: ${message}`);
    console.log(`${title}: ${message}`);
  }
}

// ===================================

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