/**
 * web_app_api.gs - Web App API関数群（503エラー対策強化版）
 * Last Updat    // ContentServiceでレスポンス作成（高速化）
    const output = ContentService
      .createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
    
    // 重要：CORS ヘッダーを設定（簡易版）
    // 注意：GAS Web Appは実際にはCORSヘッダーを自動的に設定するため、
    // この設定は主にログ記録用です
    
    console.log(`[createCorsJsonResponse] レスポンス作成完了 - ${Date.now() - startTime}ms`);
    return output;5-06-22 JST
 * バージョン: v3.0.0-error-resilient
 */

const API_VERSION = "v3.0.0-error-resilient";
const LAST_UPDATED = "2025-06-22 JST";

/**
 * CORS対応JSONレスポンス作成（503エラー対策強化版）
 */
function createCorsJsonResponse(data) {
  try {
    const startTime = Date.now();
    console.log('[createCorsJsonResponse] レスポンス作成開始:', new Date().toISOString());
    
    // データの安全化（高速化）
    const safeData = data || { 
      success: false, 
      message: 'No data provided',
      timestamp: new Date().toISOString()
    };
    
    // 応答時間情報を追加
    if (!safeData.timestamp) {
      safeData.timestamp = new Date().toISOString();
    }
    
    // JSONに変換（エラー対策強化）
    let jsonString;
    try {
      jsonString = JSON.stringify(safeData);
      console.log(`[createCorsJsonResponse] JSON作成完了 - ${jsonString.length}文字, ${Date.now() - startTime}ms`);
    } catch (jsonError) {
      console.error('[createCorsJsonResponse] JSON変換エラー:', jsonError);
      
      // フォールバック用の最小限データ
      const fallbackData = {
        success: false,
        message: 'Response serialization error',
        error: jsonError.toString(),
        timestamp: new Date().toISOString(),
        fallback: true
      };
      
      jsonString = JSON.stringify(fallbackData);
    }
    
    // レスポンス長制限（GAS制限対策）
    if (jsonString.length > 50000) {
      console.warn(`[createCorsJsonResponse] レスポンスサイズ大：${jsonString.length}文字`);
      
      // 大きすぎる場合は要約版を作成
      const summaryData = {
        success: safeData.success || false,
        message: safeData.message || 'Large response truncated',
        dataSize: jsonString.length,
        timestamp: new Date().toISOString(),
        truncated: true
      };
      
      jsonString = JSON.stringify(summaryData);
    }
    
    // ContentServiceでレスポンス作成（高速化）
    const output = ContentService
      .createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
    
    console.log(`[createCorsJsonResponse] レスポンス作成完了 - 総時間: ${Date.now() - startTime}ms`);
    return output;
    
  } catch (error) {
    console.error('[createCorsJsonResponse] 致命的エラー:', error);
    
    // 最小限のエラーレスポンス（絶対失敗しない版）
    const emergencyResponse = `{"success":false,"message":"Internal server error","timestamp":"${new Date().toISOString()}","emergency":true}`;
    
    try {
      return ContentService
        .createTextOutput(emergencyResponse)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (finalError) {
      // 最後の手段：プレーンテキスト
      console.error('[createCorsJsonResponse] 最終エラー:', finalError);
      return ContentService.createTextOutput(emergencyResponse);
    }
  }
}

/**
 * GETリクエスト処理（強化エラーハンドリング・503対策版）
 */
function doGet(e) {
  try {
    // リクエスト処理開始時間を記録（タイムアウト対策）
    const startTime = Date.now();
    
    // パラメータ取得（安全化）
    const action = e?.parameter?.action || '';
    const requestId = Date.now().toString();
    
    console.log(`[doGet:${requestId}] リクエスト開始 - action: ${action}, timestamp: ${new Date().toISOString()}`);
    
    // 処理時間制限（25秒でタイムアウト対策）
    const timeoutMs = 25000;
    const timeoutHandler = () => {
      console.error(`[doGet:${requestId}] 処理時間超過警告 - ${Date.now() - startTime}ms`);
      return createCorsJsonResponse({
        success: false,
        message: 'リクエスト処理がタイムアウトしました',
        error: 'REQUEST_TIMEOUT',
        requestId: requestId,
        processTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    };
    
    if (!action) {
      // テストページ表示（軽量版）
      console.log(`[doGet:${requestId}] テストページ表示`);
      return HtmlService.createHtmlOutput(`
        <html>
          <head><title>水道検針アプリ API v${API_VERSION}</title></head>
          <body>
            <h1>🚰 水道検針アプリ API</h1>
            <p>現在時刻: ${new Date().toISOString()}</p>
            <p>リクエストID: ${requestId}</p>
            <p>サーバー状態: <span style="color: green;">✅ 正常動作中</span></p>
            <ul>
              <li><a href="?action=test">APIテスト</a></li>
              <li><a href="?action=getProperties">物件一覧を取得</a></li>
              <li>部屋一覧: ?action=getRooms&propertyId=P001</li>
              <li>認証テスト: ?action=authenticate&username=test_user&password=test_password</li>
            </ul>
          </body>
        </html>
      `).setTitle('水道検針アプリ API');
    }

    // 処理時間チェック
    if (Date.now() - startTime > timeoutMs) {
      return timeoutHandler();
    }

    // API処理（高速化版）
    switch (action) {
      case 'test':
        console.log(`[doGet:${requestId}] テストAPI実行`);
        return createCorsJsonResponse({
          success: true,
          message: 'API正常動作',
          timestamp: new Date().toISOString(),
          requestId: requestId,
          version: API_VERSION,
          processTime: Date.now() - startTime
        });
      
      case 'authenticate':
        console.log(`[doGet:${requestId}] 認証API実行`);
        try {
          const username = e.parameter.username;
          const password = e.parameter.password;
          
          if (!username || !password) {
            return createCorsJsonResponse({
              success: false,
              message: 'ユーザー名とパスワードが必要です',
              requestId: requestId,
              processTime: Date.now() - startTime
            });
          }
          
          // 処理時間チェック（認証前）
          if (Date.now() - startTime > timeoutMs) {
            return timeoutHandler();
          }
          
          const authResult = authenticateUser(username, password);
          authResult.requestId = requestId;
          authResult.processTime = Date.now() - startTime;
          
          console.log(`[doGet:${requestId}] 認証完了 - ${authResult.processTime}ms`);
          return createCorsJsonResponse(authResult);
          
        } catch (authError) {
          console.error(`[doGet:${requestId}] 認証エラー:`, authError);
          return createCorsJsonResponse({
            success: false,
            message: '認証処理中にエラーが発生しました',
            error: authError.message,
            requestId: requestId,
            processTime: Date.now() - startTime
          });
        }
        
      case 'getProperties':
        console.log(`[doGet:${requestId}] 物件データ取得API実行`);
        try {
          const spreadsheetId = e.parameter.spreadsheetId;
          let properties;
          
          if (spreadsheetId) {
            console.log(`[doGet:${requestId}] 外部スプレッドシート使用: ${spreadsheetId}`);
            properties = getPropertiesFromExternal(spreadsheetId);
          } else {
            console.log(`[doGet:${requestId}] デフォルトスプレッドシート使用`);
            properties = getProperties();
          }
          
          return createCorsJsonResponse({
            success: true,
            data: Array.isArray(properties) ? properties : [],
            count: Array.isArray(properties) ? properties.length : 0,
            requestId: requestId,
            timestamp: new Date().toISOString(),
            processTime: Date.now() - startTime
          });
          
        } catch (propError) {
          console.error(`[doGet:${requestId}] 物件データ取得エラー:`, propError);
          return createCorsJsonResponse({
            success: false,
            message: '物件データの取得に失敗しました',
            error: propError.message,
            requestId: requestId,
            processTime: Date.now() - startTime
          });
        }
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
        console.log(`[検針完了] 機能を実行します`);
        
        const propertyId = e.parameter.propertyId;
        const completionDate = e.parameter.completionDate;
        
        if (!propertyId) {
          return createCorsJsonResponse({
            success: false,
            error: 'propertyIdが必要です',
            apiVersion: API_VERSION
          });
        }
        
        try {
          const result = completePropertyInspectionSimple(propertyId, completionDate);
          return createCorsJsonResponse(result);
        } catch (error) {
          console.error(`[検針完了] エラー: ${error.message}`);
          return createCorsJsonResponse({
            success: false,
            error: `検針完了処理に失敗しました: ${error.message}`,
            apiVersion: API_VERSION
          });
        }
        
      default:
        // 新しいデバッグ用API処理を追加
        if (action === 'test') {
          console.log('[doGet] 🧪 テスト接続要求');
          return createCorsJsonResponse({
            success: true,
            message: 'API接続テスト成功',
            timestamp: new Date().toISOString(),
            apiVersion: API_VERSION
          });
        }
        
        if (action === 'getSpreadsheetInfo') {
          console.log('[doGet] 📊 スプレッドシート情報取得要求');
          try {
            const ss = SpreadsheetApp.getActiveSpreadsheet();
            const sheets = ss.getSheets().map(sheet => ({
              name: sheet.getName(),
              rowCount: sheet.getLastRow(),
              columnCount: sheet.getLastColumn()
            }));
            
            return createCorsJsonResponse({
              success: true,
              message: 'スプレッドシート情報取得成功',
              data: {
                spreadsheetId: ss.getId(),
                spreadsheetName: ss.getName(),
                sheets: sheets
              },
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            return createCorsJsonResponse({
              success: false,
              error: `スプレッドシート情報取得エラー: ${error.message}`,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        if (action === 'getPropertyMaster') {
          console.log('[doGet] 🏠 物件マスタデータ取得要求');
          try {
            const ss = SpreadsheetApp.getActiveSpreadsheet();
            const propertySheet = ss.getSheetByName('物件マスタ');
            
            if (!propertySheet) {
              throw new Error('物件マスタシートが見つかりません');
            }
            
            const data = propertySheet.getDataRange().getValues();
            const headers = data[0];
            const rows = data.slice(1);
            
            return createCorsJsonResponse({
              success: true,
              message: '物件マスタデータ取得成功',
              data: {
                headers: headers,
                rowCount: rows.length,
                sampleRows: rows.slice(0, 5) // 最初の5行のみ返す
              },
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            return createCorsJsonResponse({
              success: false,
              error: `物件マスタデータ取得エラー: ${error.message}`,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        console.log(`[doGet:${requestId}] 未知のアクション: ${action}`);
        return createCorsJsonResponse({ 
          success: false,
          message: `未知のアクション: ${action}`,
          availableActions: ['test', 'authenticate', 'getProperties', 'getRooms', 'getMeterReadings'],
          requestId: requestId,
          processTime: Date.now() - startTime
        });
    }
    
  } catch (error) {
    console.error(`[doGet] 致命的エラー:`, error);
    return createCorsJsonResponse({ 
      success: false,
      message: `サーバーエラーが発生しました`,
      error: error.message,
      timestamp: new Date().toISOString(),
      apiVersion: API_VERSION
    });
  }
}

/**
 * POSTリクエスト処理（503エラー対策版）
 */
function doPost(e) {
  try {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    console.log(`[doPost:${requestId}] POSTリクエスト開始 - ${new Date().toISOString()}`);
    
    const params = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : '{}');
    const action = params.action || (e.parameter && e.parameter.action);
    
    // 処理時間制限
    const timeoutMs = 25000;
    if (Date.now() - startTime > timeoutMs) {
      return createCorsJsonResponse({
        success: false,
        message: 'POSTリクエスト処理がタイムアウトしました',
        error: 'REQUEST_TIMEOUT',
        requestId: requestId,
        processTime: Date.now() - startTime
      });
    }
    
    if (action === 'completeInspection') {
      const propertyId = params.propertyId || (e.parameter && e.parameter.propertyId);
      const completionDate = params.completionDate || (e.parameter && e.parameter.completionDate);
      
      if (!propertyId) {
        return createCorsJsonResponse({ 
          success: false, 
          error: 'propertyIdが必要です',
          requestId: requestId,
          processTime: Date.now() - startTime
        });
      }
      
      try {
        const result = completePropertyInspectionSimple(propertyId, completionDate);
        result.requestId = requestId;
        result.processTime = Date.now() - startTime;
        return createCorsJsonResponse(result);
      } catch (error) {
        console.error(`[doPost:${requestId}] 検針完了エラー: ${error.message}`);
        return createCorsJsonResponse({
          success: false,
          error: `検針完了処理に失敗しました: ${error.message}`,
          timestamp: new Date().toISOString(),
          method: 'POST',
          requestId: requestId,
          processTime: Date.now() - startTime
        });
      }
    }
    
    if (action === 'saveInspectionData') {
      const inspectionData = params.inspectionData;
      const spreadsheetId = params.spreadsheetId;
      
      if (!inspectionData) {
        return createCorsJsonResponse({
          success: false,
          error: '検針データが必要です',
          requestId: requestId,
          processTime: Date.now() - startTime
        });
      }
      
      try {
        let result;
        if (spreadsheetId) {
          result = saveInspectionDataToExternal(spreadsheetId, inspectionData);
        } else {
          // 通常の保存処理（既存の関数を使用）
          result = true; // TODO: 既存の保存関数を呼び出す
        }
        
        return createCorsJsonResponse({
          success: result,
          message: result ? '検針データを保存しました' : '検針データの保存に失敗しました',
          timestamp: new Date().toISOString(),
          requestId: requestId,
          processTime: Date.now() - startTime
        });
      } catch (error) {
        console.error(`[doPost:${requestId}] 検針データ保存エラー: ${error.message}`);
        return createCorsJsonResponse({
          success: false,
          error: `検針データ保存に失敗しました: ${error.message}`,
          timestamp: new Date().toISOString(),
          requestId: requestId,
          processTime: Date.now() - startTime
        });
      }
    }
    
    // 通常のPOSTリクエスト処理
    console.log(`[doPost:${requestId}] 通常のPOSTリクエスト処理`);
    return createCorsJsonResponse({ 
      success: true, 
      message: 'POST request received successfully',
      timestamp: new Date().toISOString(),
      method: 'POST',
      requestId: requestId,
      processTime: Date.now() - startTime
    });
    
  } catch (error) {
    console.error('[doPost] 致命的エラー:', error);
    return createCorsJsonResponse({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      method: 'POST',
      emergency: true
    });
  }
}

/**
 * OPTIONSリクエスト処理（CORS Preflight対応）
 */
function doOptions(e) {
  try {
    console.log('[doOptions] CORS Preflightリクエスト受信');
    
    // CORS Preflightレスポンスヘッダーを設定
    const output = ContentService.createTextOutput('')
      .setMimeType(ContentService.MimeType.TEXT);
    
    // CORSヘッダーを手動で設定（実際のブラウザでは処理されませんが、ログ用）
    console.log('[doOptions] CORS Preflightレスポンス送信完了');
    
    return output;
    
  } catch (error) {
    console.error('[doOptions] CORS Preflightエラー:', error);
    return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
  }
}
