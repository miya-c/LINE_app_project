/**
 * web_app_api.gs - Web App API関数群
 * Web App API の処理とデータ更新を管理
 */

/**
 * CORSヘッダーを付与したJSONレスポンスを作成する関数
 * @param {Object} data - レスポンスデータ
 * @returns {TextOutput} CORSヘッダー付きJSONレスポンス
 */
function createCorsJsonResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // CORSヘッダーを設定
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    .setHeader('Access-Control-Max-Age', '3600');
}

/**
 * CORSプリフライトリクエスト（OPTIONS）に対応するdoPost関数
 * @param {Object} e - リクエストイベントオブジェクト
 * @returns {TextOutput} CORSヘッダー付きレスポンス
 */
function doPost(e) {
  console.log('[doPost] リクエスト受信 - メソッド: POST');
  console.log('[doPost] パラメータ:', e?.parameter);
  console.log('[doPost] ヘッダー:', e?.headers);
  
  // OPTIONSリクエスト（CORSプリフライト）に対応
  if (e?.parameter?.method === 'OPTIONS' || e?.headers?.['Access-Control-Request-Method']) {
    console.log('[doPost] CORSプリフライトリクエストを処理');
    return createCorsJsonResponse({ status: 'OK', message: 'CORS preflight successful' });
  }
  
  // 通常のPOSTリクエスト処理
  try {
    // POST用のAPI処理をここに追加可能
    return createCorsJsonResponse({ 
      success: true, 
      message: 'POST request received',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[doPost] エラー:', error);
    return createCorsJsonResponse({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Web App用のメイン関数 - API要求とHTML表示を処理 (物件.gsから統合)
 * @param {Object} e - リクエストイベントオブジェクト  
 * @returns {HtmlOutput|TextOutput} HTMLページまたはJSONレスポンス
 */
function doGet(e) {
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
            
            return createCorsJsonResponse(response);
          } catch (apiError) {
            console.error('[doGet] getProperties API エラー:', apiError);
            
            const errorResponse = {
              success: false,
              error: `物件データ取得エラー: ${apiError.message}`,
              data: [],
              count: 0,
              timestamp: new Date().toISOString(),              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack
              }
            };
            
            return createCorsJsonResponse(errorResponse);
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
              }            };
            
            return createCorsJsonResponse(response);
            
          } catch (apiError) {
            console.error('[doGet] getRooms API エラー:', apiError);
            
            const errorResponse = {
              success: false,
              error: `部屋データ取得エラー: ${apiError.message}`,
              data: [],
              count: 0,              timestamp: new Date().toISOString(),
              propertyId: e.parameter.propertyId || 'unknown',
              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack
              }
            };
            
            return createCorsJsonResponse(errorResponse);
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
              roomId: roomId,              debugInfo: {
                functionCalled: 'getMeterReadings',
                dataType: typeof meterReadings,
                isArray: Array.isArray(meterReadings)
              }
            };
              return createCorsJsonResponse(response);
            
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
            
            return createCorsJsonResponse(errorResponse);
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
              throw new Error('readings パラメータが有効なJSONではありません');            }
            
            console.log('[doGet] 検針データ更新開始 - propertyId:', propertyId, 'roomId:', roomId);
            const result = updateMeterReadings(propertyId, roomId, readings);
            console.log('[doGet] 検針データ更新完了:', result);
              return createCorsJsonResponse(result);
            
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
            
            return createCorsJsonResponse(errorResponse);
          }
          
        default:
          throw new Error(`未対応のアクション: ${action}`);
      }
    }
      // HTML表示の場合（pageパラメータが存在）
    const page = e?.parameter?.page || 'property_select';
    console.log('[doGet] HTML要求 - ページ:', page);
    
    // HTMLページ表示は簡単なテストページを返す
    const testHtml = HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>水道検針アプリ - API Test</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>🚰 水道検針アプリ API</h1>
          <p>API is working! Current time: ${new Date().toISOString()}</p>
          <h2>Available API Endpoints:</h2>
          <ul>
            <li><a href="?action=getProperties">getProperties</a></li>
            <li><a href="?action=getRooms&propertyId=P000001">getRooms (example)</a></li>
            <li><a href="?action=getMeterReadings&propertyId=P000001&roomId=R000001">getMeterReadings (example)</a></li>
          </ul>
          <p>CORS Headers: Enabled</p>
          <p>Deploy Time: ${new Date().toISOString()}</p>
        </body>
      </html>
    `);
    
    return testHtml.setTitle('水道検針アプリ - API Test');
    
  } catch (error) {
    console.error('[doGet] 全体エラー:', error);
    
    // API要求でのエラー処理
    if (e?.parameter?.action) {
      return createCorsJsonResponse({ 
        error: `APIエラー: ${error.message}`,
        action: e.parameter.action,
        timestamp: new Date().toISOString()
      });
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
    const requiredColumns = ['物件ID', '部屋ID', '検針日時'];
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
        
        // 検針値の処理（0を含む有効な数値かチェック）
        let currentReadingValue;
        if (reading.currentReading === null || reading.currentReading === undefined || reading.currentReading === '') {
          console.log(`[updateMeterReadings] 警告: 検針値が空またはnull/undefined`);
          continue; // 空の場合はスキップ
        }
        
        const parsedReading = parseFloat(reading.currentReading);
        if (isNaN(parsedReading)) {
          console.log(`[updateMeterReadings] 警告: 検針値が数値ではありません: ${reading.currentReading}`);
          continue; // 数値でない場合はスキップ
        }
        
        currentReadingValue = parsedReading; // 0を含む有効な数値
        console.log(`[updateMeterReadings] 検針値確定: ${currentReadingValue}`);
        
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
          const previousReadingRaw = data[existingRowIndex][columnIndexes.previousReading];
          let previousReadingValue = 0;
          
          // 前回指示数の有効性チェック
          if (previousReadingRaw !== null && previousReadingRaw !== undefined && previousReadingRaw !== '') {
            const parsedPrevious = parseFloat(previousReadingRaw);
            if (!isNaN(parsedPrevious)) {
              previousReadingValue = parsedPrevious; // 0を含む有効な数値
            }
          }
          
          if (previousReadingValue === 0 && (previousReadingRaw === '' || previousReadingRaw === null || previousReadingRaw === undefined)) {
            // 前回指示数が設定されていない場合（新規）
            usage = currentReadingValue; // 0でも有効な使用量
            console.log(`[updateMeterReadings] 新規検針データ - 今回指示数をそのまま使用量として設定: ${usage}`);
          } else {
            // 前回指示数が設定されている場合（更新）
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
