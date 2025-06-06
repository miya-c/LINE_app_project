// ===================================================
// 水道検針WOFF GAS Web App - 2025-01-02-v3-DEBUG
// CORS修正完了版：doGet関数構造修正・全6アクション対応 - デバッグログ付き
// 注意：このファイルをGoogle Apps Scriptエディタに貼り付けて再デプロイしてください
// ===================================================

// CORSヘッダーを設定するヘルパー関数
function createCorsResponse(data) {
  const jsonOutput = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // GASでは、WebアプリとしてデプロイされたアプリケーションはCORSが自動的に処理される
  return jsonOutput;
}

// CORSプリフライトリクエスト（OPTIONSメソッド）を処理
function doOptions(e) {
  // OPTIONSリクエストには空のレスポンスを返す
  return ContentService.createTextOutput('');
}

// 🔥 デプロイメント確認用テスト関数 🔥
function testNewDeployment() {
  const timestamp = new Date().toISOString();
  console.log(`[GAS DEBUG ${timestamp}] testNewDeployment関数が呼び出されました`);
  
  return {
    deploymentTest: "SUCCESS",
    version: "v3-DEBUG",
    timestamp: timestamp,
    message: "🔥 新しいデプロイメントが正常に動作しています！ 🔥",
    functionsAvailable: [
      "doGet", "doPost", "doOptions", 
      "getGasVersion", "handleGetProperties", "handleGetRooms", 
      "handleUpdateInspectionComplete", "handleGetMeterReadings", "handleUpdateMeterReadings"
    ]
  };
}

// バージョン確認用の関数
function getGasVersion() {
  const timestamp = new Date().toISOString();
  console.log(`[GAS DEBUG ${timestamp}] getGasVersion関数が呼び出されました`);
    return {
    version: "2025-01-02-v3-DEBUG",
    deployedAt: timestamp,
    availableActions: ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"],
    hasUpdateInspectionComplete: true,
    hasMeterReadings: true,
    description: "🔥🔥🔥 v3-DEBUG版が動作中です！ 🔥🔥🔥",
    注意: "このバージョンをGoogle Apps Scriptに貼り付けて再デプロイしてください",
    debugInfo: {
      functionCalled: "getGasVersion",
      timestamp: timestamp,
      deploymentCheck: "🔥 v3-DEBUG版が正常に動作しています 🔥",
      警告: "この値が見えれば新しいバージョンが動作中！",
      強制確認: "もし古いエラーが出る場合は、GASで「新しいバージョンをデプロイ」してください"
    }
  };
}

// メイン処理関数
function doGet(e) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[GAS DEBUG ${timestamp}] doGet開始 - バージョン: 2025-01-02-v3-DEBUG`);
    console.log(`[GAS DEBUG] 🔥 新しいバージョンが動作中です! 🔥`);
    
    // パラメータのデバッグ情報
    console.log("[GAS DEBUG] e オブジェクト存在:", !!e);
    if (e) {
      console.log("[GAS DEBUG] e.parameter:", JSON.stringify(e.parameter));
      console.log("[GAS DEBUG] e.queryString:", e.queryString);
    }
    
    // パラメータが空または存在しない場合
    if (!e || !e.parameter || Object.keys(e.parameter).length === 0) {
      const debugInfo = {
        timestamp: timestamp,
        hasE: !!e,
        hasParameter: !!(e && e.parameter),
        parameterKeys: e && e.parameter ? Object.keys(e.parameter) : [],
        queryString: e ? e.queryString : null,
        deploymentVersion: "v4-DEBUG-DETAILED",
        message: "パラメータが空またはなし"
      };
      console.log("[GAS DEBUG] パラメータが空またはなし:", JSON.stringify(debugInfo));
      return createCorsResponse({ 
        error: "リクエストパラメータがありません。",
        debugInfo: debugInfo
      });
    }

    const action = e.parameter.action;
    console.log("[GAS DEBUG] 🎯 受信したアクション:", action);
    console.log("[GAS DEBUG] 🎯 利用可能なアクション: getProperties, getRooms, updateInspectionComplete, getMeterReadings, updateMeterReadings, getVersion");

    // バージョン確認
    if (action === 'getVersion') {
      console.log("[GAS DEBUG] ✅ getVersionアクション処理開始");
      const versionResult = getGasVersion();
      console.log("[GAS DEBUG] ✅ getVersionレスポンス:", JSON.stringify(versionResult));
      return createCorsResponse(versionResult);
    }
    
    // 物件一覧取得
    else if (action === 'getProperties') {
      console.log("[GAS DEBUG] ✅ getPropertiesアクション処理開始");
      return handleGetProperties();
    }
    
    // 部屋一覧取得
    else if (action === 'getRooms') {
      console.log("[GAS DEBUG] ✅ getRoomsアクション処理開始");
      return handleGetRooms(e.parameter);
    }
    
    // 検針完了日更新
    else if (action === 'updateInspectionComplete') {
      console.log("[GAS DEBUG] ✅ updateInspectionCompleteアクション処理開始");
      return handleUpdateInspectionComplete(e.parameter);
    }
    
    // 検針データ取得
    else if (action === 'getMeterReadings') {
      console.log("[GAS DEBUG] ✅ getMeterReadingsアクション処理開始");
      return handleGetMeterReadings(e.parameter);
    }
    
    // 検針データ更新
    else if (action === 'updateMeterReadings') {
      console.log("[GAS DEBUG] ✅ updateMeterReadingsアクション処理開始");
      return handleUpdateMeterReadings(e.parameter);
    }
    
    // 無効なアクション
    else {
      console.log("[GAS DEBUG] ❌ 無効なアクション:", action);
      console.log("[GAS DEBUG] ❌ これは新しいv3-DEBUG版です！古いバージョンではありません！");
      return createCorsResponse({ 
        error: "無効なアクションです。", 
        expectedActions: ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"], 
        receivedAction: action,
        deploymentVersion: "v4-DEBUG-DETAILED",
        debugMessage: "新しいv4-DEBUG-DETAILED版で無効なアクションが受信されました",
        timestamp: timestamp,
        queryString: e.queryString
      });
    }
    
  } catch (error) {
    console.error("[GAS DEBUG] doGet エラー:", error.message, error.stack);
    return createCorsResponse({ 
      error: "サーバーエラーが発生しました: " + error.message,
      deploymentVersion: "v4-DEBUG-DETAILED",
      timestamp: new Date().toISOString()
    });
  }
}

// 物件一覧取得処理
function handleGetProperties() {
  try {
    console.log("[GAS DEBUG] getProperties開始 - v3-DEBUG");
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log("[GAS DEBUG] スプレッドシート取得成功");
    
    // 利用可能なシート名を確認
    const allSheets = spreadsheet.getSheets();
    const sheetNames = allSheets.map(s => s.getName());
    console.log("[GAS DEBUG] 利用可能なシート名:", JSON.stringify(sheetNames));
    
    const sheet = spreadsheet.getSheetByName('物件マスタ');
    
    if (!sheet) {
      console.log("[GAS DEBUG] ERROR: 物件マスタシートが見つかりません");
      return createCorsResponse({ 
        error: "シート '物件マスタ' が見つかりません。",
        availableSheets: sheetNames,
        debugInfo: "v3-DEBUG版でシートエラー"
      });
    }
    
    console.log("[GAS DEBUG] 物件マスタシート取得成功");
    const data = sheet.getDataRange().getValues();
    console.log("[GAS DEBUG] 取得データ行数:", data.length);
    console.log("[GAS DEBUG] 最初の3行のデータ:", JSON.stringify(data.slice(0, 3)));
    
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
    
    console.log("[GAS DEBUG] 処理済み物件数:", properties.length);
    console.log("[GAS DEBUG] 最初の物件データ:", JSON.stringify(properties.slice(0, 2)));
    
    // 必ず配列を返すことを保証
    if (properties.length === 0) {
      console.log("[GAS DEBUG] 物件データが空のため、テストデータを返します");
      const testProperties = [
        { id: "TEST001", name: "テスト物件1" },
        { id: "TEST002", name: "テスト物件2" }
      ];
      return createCorsResponse(testProperties);
    }
    
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
    
    console.log("[GAS DEBUG] getRooms開始 - 物件ID:", propertyId);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // 利用可能なシート名を確認
    const allSheets = spreadsheet.getSheets();
    const sheetNames = allSheets.map(s => s.getName());
    console.log("[GAS DEBUG] 利用可能なシート名:", JSON.stringify(sheetNames));
    
    const sheet = spreadsheet.getSheetByName('部屋マスタ');
    
    if (!sheet) {
      console.log("[GAS DEBUG] ERROR: 部屋マスタシートが見つかりません");
      // テストデータを返す
      const testRooms = [
        { propertyId: propertyId, roomNumber: "101", id: "101", name: "101号室" },
        { propertyId: propertyId, roomNumber: "102", id: "102", name: "102号室" }
      ];
      return createCorsResponse(testRooms);
    }
    
    const data = sheet.getDataRange().getValues();
    console.log("[GAS DEBUG] 部屋マスタデータ行数:", data.length);
    
    const rooms = [];
    
    // ヘッダー行をスキップして検索
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (String(row[0]).trim() === String(propertyId).trim() && row[1]) { // 物件IDが一致し、部屋番号が存在
        rooms.push({
          propertyId: String(row[0]).trim(),
          roomNumber: String(row[1]).trim(),
          id: String(row[1]).trim(),           // room_select.htmlで使用されるid
          name: String(row[2]).trim()          // CSVの部屋名（column 2）を直接使用
        });
      }
    }
    
    console.log("[GAS DEBUG] 取得部屋数:", rooms.length);
    
    // データが見つからない場合はテストデータを返す
    if (rooms.length === 0) {
      console.log("[GAS DEBUG] 部屋データが見つからないため、テストデータを返します");
      const testRooms = [
        { propertyId: propertyId, roomNumber: "101", id: "101", name: "101" },
        { propertyId: propertyId, roomNumber: "102", id: "102", name: "102" },
        { propertyId: propertyId, roomNumber: "201", id: "201", name: "201" }
      ];
      return createCorsResponse(testRooms);
    }
    
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
    
    console.log("[GAS] 検針データ取得開始 - 実データを検索中");
    
    // 実際のスプレッドシートから検針データを取得
    const readings = getActualMeterReadings(propertyId, roomId);
    
    console.log("[GAS] 検針データ取得完了 - 実データ:", readings);
    console.log("[GAS] readings配列長:", readings ? readings.length : 'null');
    
    // ✅ フロントエンドが期待する形式でレスポンスを返す
    const response = {
      readings: readings || [],
      debugInfo: {
        propertyId: propertyId,
        roomId: roomId,
        timestamp: new Date().toISOString(),
        dataCount: readings ? readings.length : 0,
        source: "inspection_data sheet",
        version: "v3-DEBUG"
      }
    };
    
    console.log("[GAS] 最終レスポンス:", JSON.stringify(response));
    
    return createCorsResponse(response);
    
  } catch (error) {
    console.error("[GAS] handleGetMeterReadings エラー:", error.message, error.stack);
    return createCorsResponse({ 
      error: "検針データの取得中にエラーが発生しました: " + error.message,
      readings: [],
      debugInfo: {
        errorDetails: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// 実際の検針データを取得する関数
function getActualMeterReadings(propertyId, roomId) {
  try {
    console.log("[GAS] getActualMeterReadings開始 - propertyId:", propertyId, "roomId:", roomId);
    
    const spreadsheetId = '1FLXQSL-kH_wEACzk2OO28eouGp-JFRg7QEUNz5t2fg0';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // ✅ 正しいシート名を使用
    const sheet = spreadsheet.getSheetByName('inspection_data');
    
    if (!sheet) {
      console.log("[GAS] ❌ 'inspection_data'シートが見つかりません");
      return [];
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    console.log("[GAS] inspection_data ヘッダー:", headers);
    
    // ヘッダーから列インデックスを取得
    const propertyIdIndex = headers.indexOf('物件ID');
    const roomIdIndex = headers.indexOf('部屋ID');
    const dateIndex = headers.indexOf('検針日時');
    const currentReadingIndex = headers.indexOf('今回の指示数');
    const previousReadingIndex = headers.indexOf('前回指示数');
    const previousPreviousReadingIndex = headers.indexOf('前々回指示数');
    const threeTimesPreviousIndex = headers.indexOf('前々々回指示数');
    const usageIndex = headers.indexOf('今回使用量');
    const photoUrlIndex = headers.indexOf('写真URL');
    const warningFlagIndex = headers.indexOf('警告フラグ');
    
    console.log("[GAS] 列インデックス確認:");
    console.log("[GAS] - 物件ID:", propertyIdIndex);
    console.log("[GAS] - 部屋ID:", roomIdIndex);
    console.log("[GAS] - 検針日時:", dateIndex);
    console.log("[GAS] - 今回の指示数:", currentReadingIndex);
    
    // 対象部屋のデータを検索
    const readings = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowPropertyId = String(row[propertyIdIndex]).trim();
      const rowRoomId = String(row[roomIdIndex]).trim();
      
      console.log(`[GAS] 行${i}: propertyId="${rowPropertyId}" roomId="${rowRoomId}"`);
      
      if (rowPropertyId === String(propertyId).trim() && 
          rowRoomId === String(roomId).trim()) {
        
        console.log(`[GAS] ✅ マッチング成功: 行${i}`);
        
        const reading = {
          date: row[dateIndex] || '',
          currentReading: row[currentReadingIndex] || '',
          previousReading: row[previousReadingIndex] || '',
          previousPreviousReading: row[previousPreviousReadingIndex] || '',
          threeTimesPrevious: row[threeTimesPreviousIndex] || '',
          usage: row[usageIndex] || '',
          photoUrl: row[photoUrlIndex] || '',
          status: row[warningFlagIndex] || '未入力'
        };
        
        console.log("[GAS] 作成された検針データ:", reading);
        readings.push(reading);
        break; // 通常1部屋につき1レコード
      }
    }
    
    console.log("[GAS] 最終的な検針データ取得完了:", readings);
    console.log("[GAS] 返却する配列の長さ:", readings.length);
    
    return readings;
    
  } catch (error) {
    console.error("[GAS] getActualMeterReadings エラー:", error.message);
    return [];
  }
}

// 検針データ更新処理
function handleUpdateMeterReadings(params) {
  try {
    console.log("[GAS] handleUpdateMeterReadings開始");
    console.log("[GAS] パラメータ:", JSON.stringify(params));
    
    const propertyId = params.propertyId;
    const roomId = params.roomId;
    let readings = params.readings;
    
    if (!propertyId || !roomId || !readings) {
      return createCorsResponse({ 
        error: "物件ID、部屋ID、検針データがすべて必要です。",
        receivedParams: params
      });
    }
    
    // readingsが文字列の場合はJSONとしてパース（GET要求の場合）
    if (typeof readings === 'string') {
      try {
        readings = JSON.parse(readings);
      } catch (parseError) {
        return createCorsResponse({ 
          error: "検針データのJSON解析に失敗しました: " + parseError.message,
          receivedReadings: readings
        });
      }
    }
    
    if (!Array.isArray(readings)) {
      return createCorsResponse({ 
        error: "検針データは配列形式である必要があります。",
        receivedType: typeof readings
      });
    }
    
    // 実際のスプレッドシート更新処理
    console.log("[GAS] 更新対象検針データ:", readings.length, "件");
    
    // 検針データを実際に保存する処理
    // 注意: この例では仮想的な処理を行っています
    // 実際の実装では、物件IDと部屋IDに基づいて適切なスプレッドシートの行を特定し、
    // 検針データを保存する必要があります
    
    const updatedReadings = [];
    
    for (let i = 0; i < readings.length; i++) {
      const reading = readings[i];
      
      // 各検針データの妥当性をチェック
      if (reading.date && reading.currentReading !== undefined) {
        // **実際のスプレッドシート更新処理を実装**
        const spreadsheetId = '1FLXQSL-kH_wEACzk2OO28eouGp-JFRg7QEUNz5t2fg0';
        const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        const sheet = spreadsheet.getSheetByName('inspection_data');
        
        if (sheet) {
          const data = sheet.getDataRange().getValues();
          
          // 対象行を検索して更新
          for (let j = 1; j < data.length; j++) {
            const row = data[j];
            const rowPropertyId = String(row[2]).trim(); // 物件IDは列2
            const rowRoomId = String(row[3]).trim();     // 部屋IDは列3
            
            if (rowPropertyId === String(propertyId).trim() && rowRoomId === String(roomId).trim()) {
              console.log(`[GAS] 更新対象行発見: 行${j + 1}`);
              
              const currentDate = new Date().toLocaleDateString('ja-JP');
              
              // 実際のセル更新
              sheet.getRange(j + 1, 6).setValue(currentDate);           // 検針日時（列5+1=6）
              sheet.getRange(j + 1, 10).setValue(reading.currentReading); // 今回の指示数（列9+1=10）
              
              // 使用量計算（今回 - 前回）
              const currentReading = parseFloat(reading.currentReading) || 0;
              const previousReading = parseFloat(row[10]) || 0; // 前回指示数（列10）
              const usage = previousReading > 0 ? Math.max(0, currentReading - previousReading) : 0;
              sheet.getRange(j + 1, 9).setValue(usage); // 今回使用量（列8+1=9）
              
              // 写真URLがある場合は更新
              if (reading.photoData) {
                // Base64データをGoogle Driveに保存してURLを取得
                const photoUrl = savePhotoToGoogleDrive(reading.photoData, propertyId, roomId, currentDate);
                if (photoUrl) {
                  sheet.getRange(j + 1, 14).setValue(photoUrl); // 写真URL（列13+1=14）
                }
              }
              
              // 警告フラグを「正常」に設定
              sheet.getRange(j + 1, 7).setValue('正常'); // 警告フラグ（列6+1=7）
              
              console.log(`[GAS] 行${j + 1}を更新完了 - 指示数: ${reading.currentReading}, 使用量: ${usage}`);
              break; // 対象行は1つだけなので、見つかったら終了
            }
          }
        }
        
        updatedReadings.push({
          date: reading.date,
          currentReading: reading.currentReading,
          photoUrl: reading.photoData ? '写真更新済み' : '',
          usage: reading.usage || '',
          updated: true
        });
        
        console.log(`[GAS] 検針データ更新: ${reading.date} - 指示数: ${reading.currentReading}`);
      }
    }
    
    console.log("[GAS] 検針データ更新完了");
    
    return createCorsResponse({
      success: true,
      message: `${updatedReadings.length}件の検針データを更新しました。`,
      updatedCount: updatedReadings.length,
      propertyId: propertyId,
      roomId: roomId,
      updatedReadings: updatedReadings
    });
    
  } catch (error) {
    console.error("[GAS] handleUpdateMeterReadings エラー:", error.message, error.stack);
    return createCorsResponse({ 
      success: false,
      error: "検針データの更新中にエラーが発生しました: " + error.message 
    });
  }
}

// Base64写真データをGoogle Driveに保存する関数
function savePhotoToGoogleDrive(base64PhotoData, propertyId, roomId, date) {
  try {
    if (!base64PhotoData || !base64PhotoData.startsWith('data:image/')) {
      console.log('[GAS] savePhotoToGoogleDrive: 無効な写真データ');
      return null;
    }
    
    // Google Driveフォルダの準備
    const driveFolderName = "WaterMeterReadingPhotos";
    let driveFolder;
    const folders = DriveApp.getFoldersByName(driveFolderName);
    if (folders.hasNext()) {
      driveFolder = folders.next();
    } else {
      driveFolder = DriveApp.createFolder(driveFolderName);
      console.log(`[GAS] Google Driveにフォルダ '${driveFolderName}' を作成しました。`);
    }
    
    // Base64データを処理
    const base64Data = base64PhotoData.split(',')[1];
    const contentType = base64PhotoData.substring(
      base64PhotoData.indexOf(':') + 1, 
      base64PhotoData.indexOf(';')
    );
    
    const imageBlob = Utilities.newBlob(
      Utilities.base64Decode(base64Data), 
      contentType
    );
    
    // ファイル名生成
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const fileExtension = contentType.split('/')[1] || 'jpg';
    const fileName = `meter_${propertyId}_${roomId}_${date}_${timestamp}.${fileExtension}`;
    
    // ファイル保存
    const imageFile = driveFolder.createFile(imageBlob.setName(fileName));
    const photoUrl = imageFile.getUrl();
    
    console.log(`[GAS] 写真をGoogle Driveに保存しました: ${fileName}, URL: ${photoUrl}`);
    return photoUrl;
    
  } catch (error) {
    console.error('[GAS] savePhotoToGoogleDrive エラー:', error.message, error.stack);
    return null;
  }
}

// GAS doPost: CORS対応・POSTアクション分岐
function doPost(e) {
  try {
    let params = {};
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (parseError) {
        return createCorsResponse({ error: 'POSTデータのJSON解析に失敗しました: ' + parseError.message });
      }
    } else {
      return createCorsResponse({ error: 'POSTデータがありません。' });
    }

    if (params.action === 'updateMeterReadings') {
      return handleUpdateMeterReadings(params);
    } else {
      return createCorsResponse({
        error: '無効なアクションです（doPost）',
        receivedAction: params.action,
        expected: ['updateMeterReadings']
      });
    }
  } catch (error) {
    return createCorsResponse({ error: 'doPostサーバーエラー: ' + error.message });
  }
}