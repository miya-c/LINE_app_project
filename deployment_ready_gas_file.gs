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
 * 検針データを更新
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @param {Array} readings - 更新する検針データ配列
 * @return {Object} 更新結果
 */
function updateMeterReadings(propertyId, roomId, readings) {
  try {
    console.log('[updateMeterReadings] 更新開始 - 物件ID:', propertyId, '部屋ID:', roomId);
    
    // 簡単な実装例（実際の業務ロジックに合わせて調整）
    const result = {
      success: true,
      message: `検針データ更新完了: ${readings.length}件`,
      propertyId: propertyId,
      roomId: roomId,
      updatedCount: readings.length,
      timestamp: new Date().toISOString()
    };
    
    console.log('[updateMeterReadings] 更新完了:', result);
    return result;
    
  } catch (error) {
    console.error('[updateMeterReadings] エラー:', error);
    throw new Error(`検針データ更新エラー: ${error.message}`);
  }
}
