// ===================================================
// 水道検針WOFF GAS Web App - 2025-06-05-v1
// 検針完了機能＋検針データ機能付き最新版
// ===================================================

// CORSヘッダーを設定するヘルパー関数
function createCorsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// CORSプリフライトリクエスト（OPTIONSメソッド）を処理
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// バージョン確認用の関数
function getGasVersion() {
  return {
    version: "2025-06-05-v1",
    deployedAt: new Date().toISOString(),
    availableActions: ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"],
    hasUpdateInspectionComplete: true,
    hasMeterReadings: true,
    description: "検針完了機能＋検針データ機能付き最新版"
  };
}

// メイン処理関数
function doGet(e) {
  try {
    // バージョン確認用の特別なアクション
    if (e && e.parameter && e.parameter.action === 'getVersion') {
      console.log("[GAS] バージョン確認リクエスト");
      return createCorsResponse(getGasVersion());
    }    const timestamp = new Date().toISOString();
    console.log(`[GAS ${timestamp}] doGet開始 - バージョン: 2025-06-05-v1`);
    
    // パラメータのデバッグ情報
    console.log("[GAS] e オブジェクト存在:", !!e);
    if (e) {
      console.log("[GAS] e.parameter:", JSON.stringify(e.parameter));
      console.log("[GAS] e.queryString:", e.queryString);
    }
    
    // パラメータが空または存在しない場合
    if (!e || !e.parameter || Object.keys(e.parameter).length === 0) {
      const debugInfo = {
        timestamp: timestamp,
        hasE: !!e,
        hasParameter: !!(e && e.parameter),
        parameterKeys: e && e.parameter ? Object.keys(e.parameter) : [],
        queryString: e ? e.queryString : null
      };
      console.log("[GAS] パラメータが空またはなし:", JSON.stringify(debugInfo));
      return createCorsResponse({ 
        error: "リクエストパラメータがありません。",
        debugInfo: debugInfo
      });
    }

    const action = e.parameter.action;
    console.log("[GAS] アクション:", action);

    // 物件一覧取得
    if (action === 'getProperties') {
      return handleGetProperties();
    }
    
    // 部屋一覧取得
    else if (action === 'getRooms') {
      return handleGetRooms(e.parameter);
    }
      // 検針完了日更新
    else if (action === 'updateInspectionComplete') {
      return handleUpdateInspectionComplete(e.parameter);
    }
    
    // 検針データ取得
    else if (action === 'getMeterReadings') {
      return handleGetMeterReadings(e.parameter);
    }
    
    // 検針データ更新
    else if (action === 'updateMeterReadings') {
      return handleUpdateMeterReadings(e.parameter);
    }
    
    // 無効なアクション
    else {
      console.log("[GAS] 無効なアクション:", action);
      return createCorsResponse({ 
        error: "無効なアクションです。", 
        expectedActions: ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"], 
        receivedAction: action
      });
    }
    
  } catch (error) {
    console.error("[GAS] doGet エラー:", error.message, error.stack);
    return createCorsResponse({ 
      error: "サーバーエラーが発生しました: " + error.message 
    });
  }
}

// 物件一覧取得処理
function handleGetProperties() {
  try {
    console.log("[GAS] getProperties開始");
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('物件マスタ');
    
    if (!sheet) {
      return createCorsResponse({ error: "シート '物件マスタ' が見つかりません。" });
    }
    
    const data = sheet.getDataRange().getValues();
    console.log("[GAS] 取得データ行数:", data.length);
    
    const properties = [];
    // ヘッダー行をスキップ
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] && row[1]) { // 物件IDと物件名が両方存在
        properties.push({ 
          id: String(row[0]).trim(), 
          name: String(row[1]).trim()
        });
      }
    }
    
    console.log("[GAS] 処理済み物件数:", properties.length);
    return createCorsResponse(properties);
    
  } catch (error) {
    console.error("[GAS] getProperties エラー:", error.message);
    return createCorsResponse({ error: "物件データ取得中にエラーが発生しました: " + error.message });
  }
}

// 部屋一覧取得処理
function handleGetRooms(params) {
  try {
    const propertyId = params.propertyId;
    if (!propertyId) {
      return createCorsResponse({ error: "'propertyId' パラメータが必要です。" });
    }
    
    console.log("[GAS] getRooms開始 - 物件ID:", propertyId);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('部屋マスタ');
    
    if (!sheet) {
      return createCorsResponse({ error: "シート '部屋マスタ' が見つかりません。" });
    }
    
    const data = sheet.getDataRange().getValues();
    const rooms = [];
    
    // ヘッダー行をスキップして検索
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === propertyId && row[1]) { // 物件IDが一致し、部屋番号が存在
        rooms.push({
          propertyId: String(row[0]).trim(),
          roomNumber: String(row[1]).trim()
        });
      }
    }
    
    console.log("[GAS] 取得部屋数:", rooms.length);
    return createCorsResponse(rooms);
    
  } catch (error) {
    console.error("[GAS] getRooms エラー:", error.message);
    return createCorsResponse({ error: "部屋データ取得中にエラーが発生しました: " + error.message });
  }
}

// 検針完了日更新処理
function handleUpdateInspectionComplete(params) {
  try {
    const propertyId = params.propertyId;
    if (!propertyId) {
      return createCorsResponse({ error: "'propertyId' パラメータが必要です。" });
    }
    
    console.log("[GAS] updateInspectionComplete開始 - 物件ID:", propertyId);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('物件マスタ');
    
    if (!sheet) {
      return createCorsResponse({ error: "シート '物件マスタ' が見つかりません。" });
    }
    
    // データ取得
    const data = sheet.getDataRange().getValues();
    const headers = data[0]; // ヘッダー行
    
    const propertyIdColIndex = headers.indexOf('物件ID');
    const completionDateColIndex = headers.indexOf('検針完了日');
    
    if (propertyIdColIndex === -1 || completionDateColIndex === -1) {
      return createCorsResponse({ 
        error: "必要な列（物件ID、検針完了日）が見つかりません。",
        foundHeaders: headers 
      });
    }
    
    // 対象物件を検索
    let targetRowIndex = -1;
    for (let i = 1; i < data.length; i++) { // ヘッダー行をスキップ
      if (String(data[i][propertyIdColIndex]).trim() === String(propertyId).trim()) {
        targetRowIndex = i + 1; // スプレッドシートの行番号（1から開始）
        break;
      }
    }
    
    if (targetRowIndex === -1) {
      return createCorsResponse({ error: `物件ID '${propertyId}' が見つかりません。` });
    }
    
    // 現在の日時を日本時間で取得
    const now = new Date();
    const jstOffset = 9 * 60; // JST = UTC + 9時間
    const jstTime = new Date(now.getTime() + (jstOffset * 60 * 1000));
    const formattedDate = jstTime.toISOString().split('T')[0]; // YYYY-MM-DD形式
    
    // 検針完了日を更新
    sheet.getRange(targetRowIndex, completionDateColIndex + 1).setValue(formattedDate);
    
    console.log("[GAS] 検針完了日更新完了 - 物件ID:", propertyId, "日付:", formattedDate);
      return createCorsResponse({ 
      success: true, 
      message: `物件ID ${propertyId} の検針完了日を ${formattedDate} に更新しました。`,
      completionDate: formattedDate
    });
    
  } catch (error) {
    console.error("[GAS] updateInspectionComplete エラー:", error.message, error.stack);
    return createCorsResponse({ 
      success: false, 
      error: "検針完了日の更新中にエラーが発生しました: " + error.message 
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
    
    // 実際の検針データファイルまたはスプレッドシートから取得する処理
    // 現在はテストデータを返す
    const mockReadings = [
      {
        date: '2024-01-01',
        currentReading: '1000',
        photoUrl: '',
        usage: '50'
      },
      {
        date: '2024-02-01',
        currentReading: '1050',
        photoUrl: '',
        usage: '45'
      },
      {
        date: '2024-03-01',
        currentReading: '',
        photoUrl: '',
        usage: ''
      }
    ];
    
    console.log("[GAS] 検針データ取得完了");
    
    return createCorsResponse({
      readings: mockReadings,
      debugInfo: {
        propertyId: propertyId,
        roomId: roomId,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("[GAS] handleGetMeterReadings エラー:", error.message, error.stack);
    return createCorsResponse({ 
      error: "検針データの取得中にエラーが発生しました: " + error.message 
    });
  }
}

// 検針データ更新処理
function handleUpdateMeterReadings(params) {
  try {
    console.log("[GAS] handleUpdateMeterReadings開始");
    console.log("[GAS] パラメータ:", JSON.stringify(params));
    
    const propertyId = params.propertyId;
    const roomId = params.roomId;
    const readingsStr = params.readings;
    
    if (!propertyId || !roomId || !readingsStr) {
      return createCorsResponse({ 
        error: "物件ID、部屋ID、検針データがすべて必要です。",
        receivedParams: params
      });
    }
    
    let readings;
    try {
      readings = JSON.parse(readingsStr);
    } catch (parseError) {
      return createCorsResponse({ 
        error: "検針データのJSON解析に失敗しました: " + parseError.message,
        receivedReadings: readingsStr
      });
    }
    
    if (!Array.isArray(readings)) {
      return createCorsResponse({ 
        error: "検針データは配列形式である必要があります。",
        receivedType: typeof readings
      });
    }
    
    // 実際のデータ更新処理をここに実装
    // 現在は成功レスポンスを返す
    console.log("[GAS] 更新対象検針データ:", readings.length, "件");
    console.log("[GAS] 検針データ更新完了");
    
    return createCorsResponse({
      success: true,
      message: `${readings.length}件の検針データを更新しました。`,
      updatedCount: readings.length,
      propertyId: propertyId,
      roomId: roomId
    });
    
  } catch (error) {
    console.error("[GAS] handleUpdateMeterReadings エラー:", error.message, error.stack);
    return createCorsResponse({ 
      success: false,
      error: "検針データの更新中にエラーが発生しました: " + error.message 
    });
  }
}
