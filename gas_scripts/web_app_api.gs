/**
 * web_app_api.gs - Web App API関数群（軽量版）
 */

function createCorsJsonResponse(data) {
  const response = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // CORSヘッダーを明示的に設定
  response.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Max-Age': '86400'
  });
  
  return response;
}

/**
 * OPTIONSリクエスト（プリフライト）の処理
 */
function doOptions(e) {
  return createCorsJsonResponse({ 
    success: true, 
    message: 'CORS preflight request handled',
    timestamp: new Date().toISOString(),
    method: 'OPTIONS'
  });
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
        
        try {
          const result = getMeterReadings(e.parameter.propertyId, e.parameter.roomId);
          console.log('[web_app_api] getMeterReadings結果:', result);
          console.log('[web_app_api] result type:', typeof result);
          console.log('[web_app_api] result isArray:', Array.isArray(result));
          
          // 結果の形式を確認
          if (result && typeof result === 'object' && result.hasOwnProperty('propertyName')) {
            console.log('[web_app_api] ✅ 統合版の戻り値を検出');
            return createCorsJsonResponse({
              success: true,
              data: {
                propertyName: result.propertyName || '物件名不明',
                roomName: result.roomName || '部屋名不明',
                readings: Array.isArray(result.readings) ? result.readings : []
              }
            });
          } else if (Array.isArray(result)) {
            console.log('[web_app_api] ⚠️ 旧形式（配列）の戻り値を検出');
            // 後方互換性: 旧形式への対応
            return createCorsJsonResponse({
              success: true,
              data: result
            });
          } else {
            console.error('[web_app_api] ❌ 予期しない戻り値形式:', result);
            throw new Error('getMeterReadings関数の戻り値が予期しない形式です');
          }
        } catch (error) {
          Logger.log(`[web_app_api] getMeterReadingsエラー: ${error.message}`);
          return createCorsJsonResponse({
            success: false,
            error: `検針データ取得に失敗しました: ${error.message}`
          });
        }
        
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
         case 'completeInspection':
      case 'completePropertyInspection':
        if (!e.parameter.propertyId) {
          return createCorsJsonResponse({ 
            success: false,
            error: 'propertyIdが必要です'
          });
        }

        try {
          // 追加のパラメータを取得（オプション）
          const completedAt = e.parameter.completedAt || new Date().toISOString();
          const completedBy = e.parameter.completedBy || 'user';
          
          console.log(`[completeInspection] 処理開始 - propertyId: ${e.parameter.propertyId}, completedAt: ${completedAt}, completedBy: ${completedBy}`);
          
          const result = completePropertyInspection(e.parameter.propertyId);
          
          // 追加情報をログに記録
          if (result.success) {
            console.log(`[completeInspection] 成功 - ${result.message}`);
          }
          
          return createCorsJsonResponse(result);
        } catch (error) {
          Logger.log(`[web_app_api] completeInspectionエラー: ${error.message}`);
          return createCorsJsonResponse({
            success: false,
            error: `検針完了処理に失敗しました: ${error.message}`
          });
        }
        
      default:
        return createCorsJsonResponse({ 
          success: false,
          error: `未対応のAPI要求: ${action}`,
          timestamp: new Date().toISOString()
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
  // POST用のAPI処理
  try {
    console.log('[doPost] POSTリクエスト処理開始');
    
    // URLパラメータからactionを取得
    const action = e?.parameter?.action;
    
    if (action === 'completeInspection' || action === 'completePropertyInspection') {
      if (!e.parameter.propertyId) {
        return createCorsJsonResponse({ 
          success: false,
          error: 'propertyIdが必要です'
        });
      }

      try {
        const result = completePropertyInspection(e.parameter.propertyId);
        return createCorsJsonResponse(result);
      } catch (error) {
        Logger.log(`[doPost] completePropertyInspectionエラー: ${error.message}`);
        return createCorsJsonResponse({
          success: false,
          error: `検針完了処理に失敗しました: ${error.message}`
        });
      }
    }
    
    // その他のPOST処理
    return createCorsJsonResponse({ 
      success: true, 
      message: 'POST request received successfully',
      timestamp: new Date().toISOString(),
      method: 'POST',
      action: action || 'unknown'
    });
  } catch (error) {
    console.error('[doPost] エラー:', error);
    return createCorsJsonResponse({ 
      success: false,      error: error.message,
      timestamp: new Date().toISOString(),
      method: 'POST'
    });  }
}
