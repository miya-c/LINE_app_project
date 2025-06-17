/**
 * web_app_api.gs - Web App API関数群（軽量版）
 */

function createCorsJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = e?.parameter?.action;
    
    if (!action) {
      // テストページ表示（簡素版）
      return HtmlService.createHtmlOutput(`
        <html>
          <head><title>水道検針アプリ API</title></head>
          <body>
            <h1>🚰 水道検針アプリ API</h1>
            <p>現在時刻: ${new Date().toISOString()}</p>
            <ul>
              <li><a href="?action=getProperties">物件一覧を取得</a></li>
              <li>部屋一覧: ?action=getRooms&propertyId=物件ID</li>
              <li>検針データ: ?action=getMeterReadings&propertyId=物件ID&roomId=部屋ID</li>
            </ul>
          </body>
        </html>
      `).setTitle('水道検針アプリ API');
    }
    
    // API処理
    switch (action) {
      case 'test':
        return createCorsJsonResponse({
          success: true,
          message: 'API正常動作',
          timestamp: new Date().toISOString()
        });
        
      case 'getProperties':
        const properties = getProperties();
        return createCorsJsonResponse({
          success: true,
          data: Array.isArray(properties) ? properties : [],
          count: Array.isArray(properties) ? properties.length : 0
        });      case 'getRooms':
        try {
          if (!e.parameter.propertyId) {
            return createCorsJsonResponse({ 
              success: false,
              error: 'propertyIdが必要です'
            });
          }
          
          const roomsResult = getRooms(e.parameter.propertyId);
          return createCorsJsonResponse({
            success: true,
            data: roomsResult, // {property: {...}, rooms: [...]} 形式
            message: `${roomsResult.rooms ? roomsResult.rooms.length : 0}件の部屋データを取得しました`
          });
        } catch (error) {
          Logger.log(`getRooms API エラー: ${error.message}`);
          return createCorsJsonResponse({
            success: false,
            error: `部屋データの取得に失敗しました: ${error.message}`
          });
        }
        
      case 'getMeterReadings':
        if (!e.parameter.propertyId || !e.parameter.roomId) {
          return createCorsJsonResponse({ 
            success: false,
            error: 'propertyIdとroomIdが必要です'
          });
        }
        
        const readings = getMeterReadings(e.parameter.propertyId, e.parameter.roomId);
        return createCorsJsonResponse({
          success: true,
          data: Array.isArray(readings) ? readings : []
        });
        
      case 'updateMeterReadings':
        if (!e.parameter.propertyId || !e.parameter.roomId || !e.parameter.readings) {
          return createCorsJsonResponse({ 
            success: false,
            error: '必須パラメータが不足しています'
          });
        }
        
        try {
          const readings = JSON.parse(e.parameter.readings);
          if (!Array.isArray(readings) || readings.length === 0) {
            throw new Error('readings配列が無効です');
          }
          
          const result = updateMeterReadings(e.parameter.propertyId, e.parameter.roomId, readings);
          return createCorsJsonResponse(result);
          
        } catch (parseError) {
          return createCorsJsonResponse({
            success: false,
            error: `データ処理エラー: ${parseError.message}`
          });
        }
        
      default:
        return createCorsJsonResponse({ 
          success: false,
          error: `未対応のアクション: ${action}`
        });
    }
    
  } catch (error) {
    return createCorsJsonResponse({ 
      success: false,
      error: `サーバーエラー: ${error.message}`
    });
  }
}

function doPost(e) {
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
      success: false,      error: error.message,
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
          console.log('[doGet] propertyId:', e.parameter.propertyId);
          
          if (!e.parameter.propertyId) {
            return createCorsJsonResponse({ 
              success: false,
              error: 'propertyId パラメータが必要です',
              timestamp: new Date().toISOString()
            });
          }
          
          try {
            const propertyData = getRooms(e.parameter.propertyId);
            console.log('[doGet] 取得された物件データ:', propertyData);
            
            const response = {
              success: true,
              data: propertyData,
              timestamp: new Date().toISOString(),
              debugInfo: {
                functionCalled: 'getRooms',
                propertyId: e.parameter.propertyId,
                hasProperty: !!(propertyData && propertyData.property),
                roomCount: propertyData && propertyData.rooms ? propertyData.rooms.length : 0
              }
            };
            
            return createCorsJsonResponse(response);
            
          } catch (apiError) {
            console.error('[doGet] getRooms API エラー:', apiError);
            
            const errorResponse = {
              success: false,
              error: `物件部屋データ取得エラー: ${apiError.message}`,
              data: null,
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
