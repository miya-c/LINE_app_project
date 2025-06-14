// Google Apps Script - 水道メーター読み取りアプリ API
// 物件データ、部屋データ、検針データの管理

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
              throw new Error('propertyId および roomId パラメータが必要です');
            }
            
            console.log('[doGet] 検針データ取得開始 - propertyId:', propertyId, 'roomId:', roomId);
            const readings = getMeterReadings(propertyId, roomId);
            console.log('[doGet] 検針データ取得完了 - 件数:', Array.isArray(readings) ? readings.length : 'not array');
            
            // レスポンスを直接配列で返す（既存のコードとの互換性のため）
            return ContentService
              .createTextOutput(JSON.stringify(readings))
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
              throw new Error('propertyId, roomId, および readings パラメータが必要です');
            }
            
            console.log('[doGet] 検針データ更新開始 - propertyId:', propertyId, 'roomId:', roomId);
            console.log('[doGet] readings param:', readingsParam);
            
            // JSON文字列をパース
            const readings = JSON.parse(readingsParam);
            
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
          
        default:
          console.log('[doGet] 未対応のAPI要求:', action);
          return ContentService
            .createTextOutput(JSON.stringify({ error: `未対応のAPI要求: ${action}` }))
            .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // HTMLページ要求の場合
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'HTML表示はサポートされていません' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('[doGet] 予期しないエラー:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: `サーバーエラー: ${error.message}` }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}