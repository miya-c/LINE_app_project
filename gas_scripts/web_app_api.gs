/**
 * web_app_api.gs - Web App API関数群（setHeaders削除・検針完了シンプル版）
 * Last Updated: 2025-06-21 15:15:00 JST
 * バージョン: v2.8.0-simple-completion
 */

const API_VERSION = "v2.8.0-simple-completion";
const LAST_UPDATED = "2025-06-21 15:15:00 JST";

function createCorsJsonResponse(data) {
  console.log('[createCorsJsonResponse] APIバージョン:', API_VERSION);
  // setHeaders は使用しません - ContentService標準のみ
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
        console.log(`[doGet] 🎯 検針完了ケース到達 - action: ${action}`);
        if (!e.parameter.propertyId) {
          console.log(`[doGet] ❌ propertyIdが不足`);
          return createCorsJsonResponse({ 
            success: false,
            error: 'propertyIdが必要です'
          });
        }

        try {
          console.log(`[completeInspection] 処理開始 - propertyId: ${e.parameter.propertyId}`);
          console.log(`[completeInspection] 🔄 物件マスタ更新処理を実行中...`);
          
          // 検針完了処理を実行（物件マスタの更新のみ）
          const result = completePropertyInspectionSimple(e.parameter.propertyId);
          
          if (result.success) {
            console.log(`[completeInspection] ✅ 成功: ${result.message}`);
            console.log(`[completeInspection] 📊 詳細情報:`, {
              propertyId: result.propertyId,
              completionDate: result.completionDate
            });
            
            // APIバージョン情報を追加
            result.apiVersion = API_VERSION;
            result.processedAt = new Date().toISOString();
            result.processedBy = 'web_app_api';
            
            console.log(`[completeInspection] 🚀 レスポンス送信準備完了`);
            return createCorsJsonResponse(result);
          } else {
            console.error(`[completeInspection] ❌ 処理失敗: ${result.error}`);
            throw new Error(result.error || '検針完了処理に失敗しました');
          }
          
        } catch (error) {
          console.error(`[completeInspection] エラー: ${error.message}`);
          return createCorsJsonResponse({
            success: false,
            error: `検針完了処理に失敗しました: ${error.message}`,
            apiVersion: API_VERSION
          });
        }
        
      case 'completePropertyInspection_OLD':
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
          Logger.log(`[web_app_api] completePropertyInspectionエラー: ${error.message}`);
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
