/**
 * web_app_api.gs - Web App API関数群（最終修正版）
 * Last Updated: 2025-06-21 13:00:00 JST - 検針完了ボタン実装・CORS完全修正
 * バージョン: v2.5.5-final
 */

const API_VERSION = "v2.5.5-final";
const LAST_UPDATED = "2025-06-21 13:00:00 JST";

function createCorsJsonResponse(data) {
  console.log('[createCorsJsonResponse] データ返却開始 - APIバージョン:', API_VERSION);
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
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
    
    console.log(`[doGet] 🔍 受信したアクション詳細解析:`);
    console.log(`[doGet] - action: "${action}"`);
    console.log(`[doGet] - typeof action: ${typeof action}`);
    console.log(`[doGet] - action === 'completeInspection': ${action === 'completeInspection'}`);
    console.log(`[doGet] - action === 'completePropertyInspection': ${action === 'completePropertyInspection'}`);
    console.log(`[doGet] - 全パラメータ:`, e.parameter);
    console.log(`[doGet] - パラメータのキー一覧:`, Object.keys(e.parameter || {}));
    
    if (!action) {
      // テストページ表示（簡素版）
      return HtmlService.createHtmlOutput(`
        <html>
          <head><title>水道検針アプリ API</title></head>
          <body>
            <h1>🚰 水道検針アプリ API</h1>
            <p><strong>API バージョン:</strong> ${API_VERSION}</p>
            <p><strong>最終更新:</strong> ${LAST_UPDATED}</p>
            <p><strong>現在時刻:</strong> ${new Date().toISOString()}</p>
            <h2>利用可能なAPIエンドポイント</h2>
            <ul>
              <li><a href="?action=version">バージョン情報</a></li>
              <li><a href="?action=test">APIテスト</a></li>
              <li><a href="?action=getProperties">物件一覧を取得</a></li>
              <li>部屋一覧: ?action=getRooms&propertyId=物件ID</li>
              <li>検針データ: ?action=getMeterReadings&propertyId=物件ID&roomId=部屋ID</li>
              <li>検針完了: ?action=completeInspection&propertyId=物件ID</li>
            </ul>
          </body>
        </html>
      `).setTitle('水道検針アプリ API');
    }

    // API処理
    console.log(`[doGet] switch文開始 - action: ${action}, typeof: ${typeof action}, 全パラメータ:`, e.parameter);
    switch (action) {
      case 'version':
      case 'info':
        return createCorsJsonResponse({
          success: true,
          apiVersion: API_VERSION,
          lastUpdated: LAST_UPDATED,
          timestamp: new Date().toISOString(),
          availableActions: ['test', 'getProperties', 'getRooms', 'getMeterReadings', 'updateMeterReadings', 'completeInspection', 'completePropertyInspection', 'version', 'info']
        });
        
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
        });
        
      case 'getRooms':
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
            data: roomsResult,
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
        console.log(`[doGet] 🎯 検針完了ケースに到達 - action: ${action}`);
        console.log(`[doGet] 検針完了処理開始 - action: ${action}`);
        if (!e.parameter.propertyId) {
          return createCorsJsonResponse({ 
            success: false,
            error: 'propertyIdが必要です'
          });
        }

        try {
          const completedAt = e.parameter.completedAt || new Date().toISOString();
          const completedBy = e.parameter.completedBy || 'user';
          
          console.log(`[completeInspection] 処理開始 - propertyId: ${e.parameter.propertyId}, completedAt: ${completedAt}, completedBy: ${completedBy}`);
          
          if (typeof completePropertyInspection !== 'function') {
            throw new Error('completePropertyInspection関数が見つかりません');
          }
          
          const result = completePropertyInspection(e.parameter.propertyId);
          
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
        console.log(`[doGet] ❌ 未対応のアクション: ${action}, typeof: ${typeof action}, 全パラメータ:`, e.parameter);
        console.log(`[doGet] ❌ 利用可能なアクション: test, getProperties, getRooms, getMeterReadings, updateMeterReadings, completeInspection, completePropertyInspection`);
        return createCorsJsonResponse({ 
          success: false,
          error: `未対応のAPI要求: ${action}`,
          timestamp: new Date().toISOString(),
          receivedAction: action,
          allParameters: e.parameter,
          availableActions: ['test', 'getProperties', 'getRooms', 'getMeterReadings', 'updateMeterReadings', 'completeInspection', 'completePropertyInspection']
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
  try {
    console.log('[doPost] POSTリクエスト処理開始');
    
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
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      method: 'POST'
    });
  }
}
