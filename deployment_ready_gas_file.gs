/**
 * web_app_api.gs - Web App API関数群（デプロイ用完全版）
 * 2025年6月16日 - CORS対応版
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
 * Web App用のメイン関数 - API要求とHTML表示を処理
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
              timestamp: new Date().toISOString(),
              debugInfo: {
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
              }
            };
            
            return createCorsJsonResponse(response);
              
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
              roomId: roomId,
              debugInfo: {
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
              throw new Error('readings パラメータが有効なJSONではありません');
            }
            
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
          console.log('[doGet] 未対応のAPI要求:', action);
          return createCorsJsonResponse({ 
            success: false,
            error: `未対応のAPI要求: ${action}`,
            timestamp: new Date().toISOString()
          });
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
        success: false,
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

// ===============================
// データ取得関数群
// ===============================

/**
 * 物件一覧を取得
 * @return {Array} 物件一覧
 */
function getProperties() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('物件マスタ') || ss.getSheetByName('property_master');
    
    if (!sheet) {
      throw new Error('物件マスタ または property_master シートが見つかりません');
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      console.log('[getProperties] 物件データが空または1行のみ');
      return [];
    }
    
    const headers = values[0];
    const properties = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0]) { // 最初の列が空でない場合のみ処理
        const property = {
          id: row[0] || '',
          name: row[1] || '',
          address: row[2] || '',
          // 追加のプロパティがあればここに追加
        };
        properties.push(property);
      }
    }
    
    console.log('[getProperties] 物件データ取得完了:', properties.length, '件');
    return properties;
    
  } catch (error) {
    console.error('[getProperties] エラー:', error);
    throw new Error(`物件データ取得エラー: ${error.message}`);
  }
}

/**
 * 指定物件の部屋一覧を取得
 * @param {string} propertyId - 物件ID
 * @return {Array} 部屋一覧
 */
function getRooms(propertyId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('部屋マスタ') || ss.getSheetByName('room_master');
    
    if (!sheet) {
      throw new Error('部屋マスタ または room_master シートが見つかりません');
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      console.log('[getRooms] 部屋データが空または1行のみ');
      return [];
    }
    
    const rooms = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] && String(row[0]).trim() === String(propertyId).trim()) {
        const room = {
          id: row[1] || '',
          name: row[2] || '',
          propertyId: row[0] || '',
          // 追加のプロパティがあればここに追加
        };
        rooms.push(room);
      }
    }
    
    console.log('[getRooms] 部屋データ取得完了 - 物件ID:', propertyId, '件数:', rooms.length);
    return rooms;
    
  } catch (error) {
    console.error('[getRooms] エラー:', error);
    throw new Error(`部屋データ取得エラー: ${error.message}`);
  }
}

/**
 * 検針データを取得
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @return {Array} 検針データ一覧
 */
function getMeterReadings(propertyId, roomId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('inspection_data') || ss.getSheetByName('検針データ');
    
    if (!sheet) {
      console.log('[getMeterReadings] 検針データシートが見つかりません。空配列を返します。');
      return [];
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      console.log('[getMeterReadings] 検針データが空または1行のみ');
      return [];
    }
    
    const readings = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] && row[1] && 
          String(row[0]).trim() === String(propertyId).trim() &&
          String(row[1]).trim() === String(roomId).trim()) {
        
        const reading = {
          propertyId: row[0] || '',
          roomId: row[1] || '',
          date: row[2] ? new Date(row[2]).toISOString() : '',
          currentReading: row[3] || '',
          previousReading: row[4] || '',
          usage: row[5] || '',
          // 追加のフィールドがあればここに追加
        };
        readings.push(reading);
      }
    }
    
    console.log('[getMeterReadings] 検針データ取得完了 - 物件ID:', propertyId, '部屋ID:', roomId, '件数:', readings.length);
    return readings;
    
  } catch (error) {
    console.error('[getMeterReadings] エラー:', error);
    throw new Error(`検針データ取得エラー: ${error.message}`);
  }
}

/**
 * 検針データを更新（警告フラグ保存対応版）
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @param {Array} readings - 更新する検針データ配列
 * @return {Object} 更新結果
 */
function updateMeterReadings(propertyId, roomId, readings) {
  try {
    if (!propertyId || !roomId || !Array.isArray(readings) || readings.length === 0) {
      throw new Error('無効なパラメータ');
    }
    
    console.log(`[updateMeterReadings] 🚀 開始: 物件=${propertyId}, 部屋=${roomId}, データ数=${readings.length}`);
    console.log(`[updateMeterReadings] 📥 受信データ:`, readings);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('inspection_data');
    
    if (!sheet) {
      throw new Error('inspection_dataシートが見つかりません');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // 必要な列インデックスを取得
    const colIndexes = {
      propertyId: headers.indexOf('物件ID'),
      roomId: headers.indexOf('部屋ID'),
      date: headers.indexOf('検針日時'),
      currentReading: headers.indexOf('今回の指示数') >= 0 ? 
        headers.indexOf('今回の指示数') : headers.indexOf('今回指示数（水道）'),
      previousReading: headers.indexOf('前回指示数'),
      usage: headers.indexOf('今回使用量'),
      warningFlag: headers.indexOf('警告フラグ')
    };
    
    console.log(`[updateMeterReadings] 📊 列インデックス:`, colIndexes);
    console.log(`[updateMeterReadings] 🎯 警告フラグ列インデックス: ${colIndexes.warningFlag}`);
    
    // 警告フラグ列が存在しない場合のエラーハンドリング
    if (colIndexes.warningFlag === -1) {
      console.log(`[updateMeterReadings] ❌ 警告フラグ列が見つかりません！`);
      throw new Error('警告フラグ列が見つかりません');
    }
    
    // 必須列の存在確認
    if (colIndexes.propertyId === -1 || colIndexes.roomId === -1 || 
        colIndexes.date === -1 || colIndexes.currentReading === -1) {
      throw new Error(`必要な列が見つかりません。利用可能な列: ${headers.join(', ')}`);
    }
    
    let updatedRowCount = 0;
    const now = new Date();
    
    readings.forEach((reading, readingIndex) => {
      console.log(`[updateMeterReadings] 🔄 処理中[${readingIndex}]:`, reading);
      
      const currentValue = parseFloat(reading.currentReading) || 0;
      
      // ✅ 警告フラグを確実に受信・ログ出力
      const receivedWarningFlag = reading.warningFlag || '正常';
      console.log(`[updateMeterReadings] 🚨 受信した警告フラグ[${readingIndex}]: "${receivedWarningFlag}" (型: ${typeof receivedWarningFlag})`);
      
      // 現在日時をJSTで設定
      const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
      const normalizedDate = jstDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
      
      // 既存データを検索
      const existingRowIndex = data.findIndex((row, index) => 
        index > 0 && 
        String(row[colIndexes.propertyId]).trim() === String(propertyId).trim() &&
        String(row[colIndexes.roomId]).trim() === String(roomId).trim()
      );
      
      console.log(`[updateMeterReadings] 🔍 既存データ検索結果[${readingIndex}]: インデックス=${existingRowIndex}`);
      
      if (existingRowIndex >= 0) {
        // 既存データ更新
        console.log(`[updateMeterReadings] 📝 既存データ更新モード[${readingIndex}]`);
        
        const previousReading = parseFloat(data[existingRowIndex][colIndexes.previousReading]) || 0;
        const usage = previousReading > 0 ? Math.max(0, currentValue - previousReading) : currentValue;
        
        // データ更新
        data[existingRowIndex][colIndexes.date] = normalizedDate;
        data[existingRowIndex][colIndexes.currentReading] = currentValue;
        if (colIndexes.usage >= 0) data[existingRowIndex][colIndexes.usage] = usage;
        
        // ✅ 警告フラグを確実にG列に保存
        console.log(`[updateMeterReadings] 💾 警告フラグ保存前[${readingIndex}]: 列${colIndexes.warningFlag + 1} = "${data[existingRowIndex][colIndexes.warningFlag]}"`);
        data[existingRowIndex][colIndexes.warningFlag] = receivedWarningFlag;
        console.log(`[updateMeterReadings] ✅ 警告フラグ保存後[${readingIndex}]: 列${colIndexes.warningFlag + 1} = "${data[existingRowIndex][colIndexes.warningFlag]}"`);
        
      } else {
        // 新規データ作成
        console.log(`[updateMeterReadings] 🆕 新規データ作成モード[${readingIndex}]`);
        
        const newRow = new Array(headers.length).fill('');
        
        newRow[colIndexes.propertyId] = propertyId;
        newRow[colIndexes.roomId] = roomId;
        newRow[colIndexes.date] = normalizedDate;
        newRow[colIndexes.currentReading] = currentValue;
        if (colIndexes.usage >= 0) newRow[colIndexes.usage] = currentValue;
        
        // ✅ 警告フラグを確実にG列に設定
        console.log(`[updateMeterReadings] 🆕 新規警告フラグ設定[${readingIndex}]: 列${colIndexes.warningFlag + 1} = "${receivedWarningFlag}"`);
        newRow[colIndexes.warningFlag] = receivedWarningFlag;
        
        data.push(newRow);
      }
      
      updatedRowCount++;
    });
    
    // シートに一括書き込み
    if (updatedRowCount > 0) {
      console.log(`[updateMeterReadings] 💾 シートへの書き込み開始: ${updatedRowCount}件`);
      
      sheet.clear();
      sheet.getRange(1, 1, data.length, headers.length).setValues(data);
      
      console.log(`[updateMeterReadings] ✅ ${updatedRowCount}件のデータをシートに書き込み完了`);
    }
    
    return {
      success: true,
      message: `${updatedRowCount}件の検針データを正常に更新しました`,
      timestamp: new Date().toISOString(),
      updatedRows: updatedRowCount,
      details: readings.map(r => ({
        date: r.date,
        currentReading: r.currentReading,
        warningFlag: r.warningFlag || '正常'
      }))
    };
    
  } catch (error) {
    console.error(`[updateMeterReadings] ❌ エラー: ${error.message}`);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 標準偏差計算用ヘルパー関数群
 */

/**
 * STDEV.S相当の標準偏差を計算（標本標準偏差：n-1で割る）
 * @param {Array} values - 数値配列
 * @returns {number} 標準偏差
 */
function calculateSTDEV_S(values) {
  if (!values || values.length < 2) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * AVERAGE関数相当の平均値を計算
 * @param {Array} values - 数値配列
 * @returns {number} 平均値
 */
function calculateAVERAGE(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * 閾値情報を履歴データのみで計算する関数（警告フラグ計算用）
 * @param {number} previousReading - 前回指示数
 * @param {number} previousPreviousReading - 前々回指示数  
 * @param {number} threeTimesPreviousReading - 前々々回指示数
 * @returns {Object} 閾値と標準偏差の情報
 */
function calculateThreshold(previousReading, previousPreviousReading, threeTimesPreviousReading) {
  try {
    const readingHistory = [];
    
    if (typeof previousReading === 'number' && !isNaN(previousReading) && previousReading >= 0) {
      readingHistory.push(previousReading);
    }
    if (typeof previousPreviousReading === 'number' && !isNaN(previousPreviousReading) && previousPreviousReading >= 0) {
      readingHistory.push(previousPreviousReading);
    }
    if (typeof threeTimesPreviousReading === 'number' && !isNaN(threeTimesPreviousReading) && threeTimesPreviousReading >= 0) {
      readingHistory.push(threeTimesPreviousReading);
    }
    
    if (readingHistory.length < 2) {
      return {
        standardDeviation: 0,
        threshold: 0,
        reason: '履歴データ不足',
        isCalculable: false
      };
    }
    
    const average = calculateAVERAGE(readingHistory);
    const standardDeviation = calculateSTDEV_S(readingHistory);
    const threshold = previousReading + Math.floor(standardDeviation) + 10;
    
    console.log(`[calculateThreshold] 前回値: ${previousReading}, 履歴: [${readingHistory.join(', ')}], 平均: ${average.toFixed(2)}, 標準偏差: ${standardDeviation.toFixed(2)}, 閾値: ${threshold}`);
    
    return {
      standardDeviation: Math.floor(standardDeviation),
      threshold: threshold,
      reason: `前回値${previousReading} + σ${Math.floor(standardDeviation)} + 10`,
      isCalculable: true
    };
    
  } catch (error) {
    console.log(`[calculateThreshold] エラー: ${error.message}`);
    return {
      standardDeviation: 0,
      threshold: 0,
      reason: 'エラー',
      isCalculable: false
    };
  }
}
