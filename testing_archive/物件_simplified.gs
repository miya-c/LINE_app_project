// ===================================================
// 水道検針WOFF GAS Web App - 2025-06-07-v8-SIMPLIFIED
// 簡潔版：パルハイツ平田の101データ取得テスト用
// ===================================================

// スプレッドシートID
const SPREADSHEET_ID = '1FLXQSL-kH_wEACzk2OO28eouGp-JFRg7QEUNz5t2fg0';

// CORSヘッダーを設定するヘルパー関数
function createCorsResponse(data) {
  console.log(`[GAS DEBUG] createCorsResponse呼び出し - dataタイプ: ${typeof data}`);
  
  const safeData = data !== undefined && data !== null ? data : { 
    error: 'データが提供されませんでした',
    timestamp: new Date().toISOString()
  };
  
  try {
    const jsonString = JSON.stringify(safeData);
    console.log(`[GAS DEBUG] JSON レスポンス生成: ${jsonString.length}文字`);
    
    return ContentService
      .createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('[GAS DEBUG] JSON.stringify エラー:', error.message);
    const fallbackData = { 
      error: 'レスポンス生成エラー', 
      originalError: error.message,
      timestamp: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(fallbackData))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// バージョン確認用の関数
function getGasVersion() {
  const timestamp = new Date().toISOString();
  console.log(`[GAS DEBUG ${timestamp}] getGasVersion関数が呼び出されました`);
  
  return {
    version: "2025-06-07-v8-SIMPLIFIED",
    deployedAt: timestamp,
    availableActions: ["getProperties", "getRooms", "getMeterReadings", "getVersion"],
    description: "🎯 パルハイツ平田の101データ取得テスト用簡潔版",
    corsFixed: true,
    contentServiceUsed: true
  };
}

// メイン処理関数
function doGet(e) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[GAS DEBUG ${timestamp}] doGet開始 - バージョン: v8-SIMPLIFIED`);
    
    // パラメータの確認
    if (!e || !e.parameter || Object.keys(e.parameter).length === 0) {
      console.log("[GAS DEBUG] パラメータが空またはなし");
      return createCorsResponse({ 
        error: "リクエストパラメータがありません。",
        version: "v8-SIMPLIFIED",
        timestamp: timestamp
      });
    }

    const action = e.parameter.action;
    console.log("[GAS DEBUG] 受信したアクション:", action);

    // バージョン確認
    if (action === 'getVersion') {
      console.log("[GAS DEBUG] getVersionアクション処理開始");
      return createCorsResponse(getGasVersion());
    }
    
    // 物件一覧取得
    else if (action === 'getProperties') {
      console.log("[GAS DEBUG] getPropertiesアクション処理開始");
      return handleGetProperties();
    }
    
    // 部屋一覧取得
    else if (action === 'getRooms') {
      console.log("[GAS DEBUG] getRoomsアクション処理開始");
      return handleGetRooms(e.parameter);
    }
    
    // 検針データ取得
    else if (action === 'getMeterReadings') {
      console.log("[GAS DEBUG] getMeterReadingsアクション処理開始");
      return handleGetMeterReadings(e.parameter);
    }
    
    // 無効なアクション
    else {
      console.log("[GAS DEBUG] 無効なアクション:", action);
      return createCorsResponse({ 
        error: "無効なアクションです。", 
        expectedActions: ["getProperties", "getRooms", "getMeterReadings", "getVersion"], 
        receivedAction: action,
        version: "v8-SIMPLIFIED",
        timestamp: timestamp
      });
    }
    
  } catch (error) {
    console.error("[GAS DEBUG] doGet エラー:", error.message);
    return createCorsResponse({ 
      error: "サーバーエラーが発生しました: " + error.message,
      version: "v8-SIMPLIFIED",
      timestamp: new Date().toISOString()
    });
  }
}

// 物件一覧取得処理
function handleGetProperties() {
  try {
    console.log("[GAS DEBUG] getProperties開始");
    
    // テスト用固定データ（パルハイツ平田のみ）
    const properties = [
      { id: "P000001", name: "パルハイツ平田" }
    ];
    
    console.log("[GAS DEBUG] 物件データ:", properties);
    return createCorsResponse(properties);
    
  } catch (error) {
    console.error("[GAS] getProperties エラー:", error.message);
    return createCorsResponse({ 
      error: "物件データ取得中にエラーが発生しました: " + error.message 
    });
  }
}

// 部屋一覧取得処理
function handleGetRooms(params) {
  try {
    const propertyId = params.propertyId;
    if (!propertyId) {
      return createCorsResponse({ error: "'propertyId' パラメータが必要です。" });
    }
    
    console.log("[GAS DEBUG] getRooms開始 - 物件ID:", propertyId);
    
    // テスト用固定データ（パルハイツ平田の101のみ）
    if (propertyId === "P000001") {
      const rooms = [
        { propertyId: "P000001", roomNumber: "101", id: "R000001", name: "101" }
      ];
      
      console.log("[GAS DEBUG] 部屋データ:", rooms);
      return createCorsResponse(rooms);
    } else {
      return createCorsResponse([]);
    }
    
  } catch (error) {
    console.error("[GAS] getRooms エラー:", error.message);
    return createCorsResponse({ 
      error: "部屋データ取得中にエラーが発生しました: " + error.message 
    });
  }
}

// 検針データ取得処理
function handleGetMeterReadings(params) {
  try {
    console.log("[GAS] handleGetMeterReadings開始");
    console.log("[GAS] パラメータ:", JSON.stringify(params));
    
    const propertyId = params.propertyId;
    const roomId = params.roomId;
    
    if (!propertyId || !roomId) {
      return createCorsResponse({ 
        error: "物件IDと部屋IDの両方が必要です。",
        receivedParams: params
      });
    }
    
    console.log("[GAS] 検針データ取得開始 - 実データを検索中");
    
    // パルハイツ平田の101のテストデータ（CSV inspection_data.csvから取得）
    if (propertyId === "P000001" && roomId === "R000001") {
      const readings = [{
        date: "2025/05/31",
        currentReading: "1208",
        previousReading: "1186",
        previousPreviousReading: "1170",
        threeTimesPrevious: "1150",
        usage: "22",
        photoUrl: "https://drive.google.com/file/d/1QpCfRS7nL9yxhTqrRlrNlhTtggZ6XaDI/view?usp=drivesdk",
        status: "正常"
      }];
      
      console.log("[GAS] パルハイツ平田の101データ取得成功:", readings);
      
      const response = {
        readings: readings,
        debugInfo: {
          propertyId: propertyId,
          roomId: roomId,
          timestamp: new Date().toISOString(),
          dataCount: readings.length,
          source: "Fixed test data for パルハイツ平田の101",
          version: "v8-SIMPLIFIED"
        }
      };
      
      console.log("[GAS] 最終レスポンス:", JSON.stringify(response));
      return createCorsResponse(response);
    } else {
      // 他の部屋の場合は空配列を返す
      console.log("[GAS] 対象外の部屋:", propertyId, roomId);
      return createCorsResponse({
        readings: [],
        debugInfo: {
          propertyId: propertyId,
          roomId: roomId,
          message: "対象外の部屋です（テスト版はパルハイツ平田の101のみ対応）",
          timestamp: new Date().toISOString(),
          version: "v8-SIMPLIFIED"
        }
      });
    }
    
  } catch (error) {
    console.error("[GAS] handleGetMeterReadings エラー:", error.message);
    return createCorsResponse({ 
      error: "検針データの取得中にエラーが発生しました: " + error.message,
      readings: [],
      debugInfo: {
        errorDetails: error.message,
        timestamp: new Date().toISOString(),
        version: "v8-SIMPLIFIED"
      }
    });
  }
}

// CORS対応のためのOPTIONSメソッド処理
function doOptions(e) {
  console.log("[GAS DEBUG] doOptions処理開始 - CORS対応");
  
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
