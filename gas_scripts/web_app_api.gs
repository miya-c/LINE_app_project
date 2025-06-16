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
  const jsonOutput = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Google Apps ScriptではsetHeaderメソッドは存在しません
  // CORSはWeb Appの設定で自動的に処理されます
  return jsonOutput;
}

/**
 * CORSプリフライトリクエスト（OPTIONS）専用の処理
 * @param {Object} e - リクエストイベントオブジェクト
 * @returns {TextOutput} CORSヘッダー付きレスポンス
 */
function doOptions(e) {
  console.log('[doOptions] CORSプリフライトリクエスト受信');
  
  // OPTIONSリクエストには空のレスポンスを返す
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
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
    console.log('[doPost] POSTリクエスト処理開始');
    return createCorsJsonResponse({ 
      success: true, 
      message: 'POST request received successfully',
      timestamp: new Date().toISOString(),
      method: 'POST'
    });
  } catch (error) {
    console.error('[doPost] エラー:', error);
    return createCorsJsonResponse({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString(),
      method: 'POST'
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
        case 'test':
          console.log('[doGet] テストリクエスト');
          return createCorsJsonResponse({
            success: true,
            message: 'Google Apps Script Web App正常動作',
            timestamp: new Date().toISOString(),
            version: '2025-01-16-CORS-FIX',
            debugInfo: {
              receivedAction: action,
              allParams: e?.parameter
            }
          });
          
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
            
            console.log('[doGet] 受信パラメータ詳細:');
            console.log('[doGet] - propertyId:', propertyId, '型:', typeof propertyId);
            console.log('[doGet] - roomId:', roomId, '型:', typeof roomId);
            console.log('[doGet] - readingsParam:', readingsParam, '型:', typeof readingsParam);
            
            if (!propertyId || propertyId === 'undefined') {
              throw new Error('propertyId パラメータが必要です。受信値: ' + propertyId);
            }
            
            if (!roomId || roomId === 'undefined') {
              throw new Error('roomId パラメータが必要です。受信値: ' + roomId);
            }
            
            if (!readingsParam || readingsParam === 'undefined') {
              throw new Error('readings パラメータが必要です。受信値: ' + readingsParam);
            }
            
            console.log('[doGet] 検針データ更新開始 - propertyId:', propertyId, 'roomId:', roomId);
            console.log('[doGet] readings param:', readingsParam);
            
            // JSON文字列をパース
            let readings;
            try {
              readings = JSON.parse(readingsParam);
              console.log('[doGet] JSON パース成功:', readings);
              console.log('[doGet] パース後の型:', typeof readings, 'isArray:', Array.isArray(readings));
              
              if (Array.isArray(readings)) {
                console.log('[doGet] パース後のreadingsの長さ:', readings.length);
                console.log('[doGet] パース後のreadingsの内容:', JSON.stringify(readings));
              }
              
            } catch (parseError) {
              console.error('[doGet] JSON パースエラー:', parseError);
              console.error('[doGet] パース対象の文字列:', readingsParam);
              throw new Error(`readingsパラメータのJSONパースに失敗しました: ${parseError.message}`);
            }
            
            if (!Array.isArray(readings)) {
              throw new Error(`readingsは配列である必要があります。受信した型: ${typeof readings}, 値: ${JSON.stringify(readings)}`);
            }
            
            if (readings.length === 0) {
              throw new Error('readings配列が空です。最低1つの検針データが必要です。');
            }
            
            // updateMeterReadings関数を呼び出し
            const result = updateMeterReadings(propertyId, roomId, readings);
            console.log('[doGet] 検針データ更新完了:', result);
            
            return createCorsJsonResponse(result);
            
          } catch (apiError) {
            console.error('[doGet] updateMeterReadings API エラー:', apiError);
            console.error('[doGet] エラースタック:', apiError.stack);
            
            const errorResponse = {
              success: false,
              error: `検針データ更新エラー: ${apiError.message}`,
              timestamp: new Date().toISOString(),
              propertyId: e.parameter.propertyId || 'unknown',
              roomId: e.parameter.roomId || 'unknown',
              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack,
                receivedParams: {
                  propertyId: e.parameter.propertyId,
                  roomId: e.parameter.roomId,
                  readings: e.parameter.readings,
                  allParams: e.parameter
                }
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
      // HTMLページ表示
    const testHtml = HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>水道検針アプリ - API Test</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>🚰 水道検針アプリ API</h1>
          <p>API テストページ</p>
          <p>現在時刻: ${new Date().toISOString()}</p>
          <h2>API エンドポイント:</h2>
          <ul>
            <li><a href="?action=getProperties">物件一覧を取得</a></li>
            <li>部屋一覧を取得: ?action=getRooms&propertyId=物件ID</li>
            <li>検針データを取得: ?action=getMeterReadings&propertyId=物件ID&roomId=部屋ID</li>
          </ul>
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
        error: `サーバーエラー: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // HTML表示でのエラー処理
    const errorHtml = HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>エラー - 水道検針アプリ</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>エラーが発生しました</h1>
          <p>${error.message}</p>
          <p>時刻: ${new Date().toISOString()}</p>
        </body>
      </html>
    `);
      return errorHtml.setTitle('エラー - 水道検針アプリ');
  }
}
