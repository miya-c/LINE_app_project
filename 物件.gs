// 指定した物件ID・部屋IDの検針日時セルの値・型・JST変換を詳細ログ出力するデバッグ関数
function debugLogInspectionDate(propertyId, roomId) {
  const spreadsheet = getSpreadsheetInstance();
  const sheet = spreadsheet.getSheetByName('inspection_data');
  if (!sheet) {
    console.log('inspection_dataシートが見つかりません');
    return;
  }
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const propertyIdIndex = headers.indexOf('物件ID');
  const roomIdIndex = headers.indexOf('部屋ID');
  const dateIndex = headers.indexOf('検針日時');

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (
      String(row[propertyIdIndex]).trim() === String(propertyId).trim() &&
      String(row[roomIdIndex]).trim() === String(roomId).trim()
    ) {
      const dateValue = row[dateIndex];
      console.log('--- 検針日時デバッグ ---');
      console.log('raw value:', dateValue, 'typeof:', typeof dateValue);
      if (dateValue instanceof Date) {
        console.log('as ISO:', dateValue.toISOString());
        console.log('as JST:', Utilities.formatDate(dateValue, 'Asia/Tokyo', 'yyyy-MM-dd'));
      } else if (typeof dateValue === 'string') {
        console.log('as string:', dateValue);
        const dateObj = new Date(dateValue);
        if (!isNaN(dateObj.getTime())) {
          console.log('string→Date as ISO:', dateObj.toISOString());
          console.log('string→Date as JST:', Utilities.formatDate(dateObj, 'Asia/Tokyo', 'yyyy-MM-dd'));
        }
      }
      break;
    }
  }
}
// ===================================================
// 水道検針WOFF GAS Web App - v9-SIMPLE-RAW-DATA
// 生データ返却版：バックエンドで複雑な日付処理を行わず、フロントエンドで統一処理
// 注意：このファイルをGoogle Apps Scriptエディタに貼り付けて再デプロイしてください
// ===================================================


// 任意の値をJSTのYYYY-MM-DD文字列に正規化する（Date型・文字列・null/空対応）
function toJSTDateString(value) {
  if (value === null || value === undefined || value === '') return '';
  // Date型
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, 'Asia/Tokyo', 'yyyy-MM-dd');
  }
  // 文字列型
  if (typeof value === 'string') {
    const dateStr = value.trim();
    // YYYY-MM-DD or YYYY/MM/DD 形式ならそのまま返す（/は-に変換）
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) {
      return dateStr.replace(/\//g, '-');
    }
    // その他: Date変換できる場合
    const dateObj = new Date(dateStr);
    if (!isNaN(dateObj.getTime())) {
      return Utilities.formatDate(dateObj, 'Asia/Tokyo', 'yyyy-MM-dd');
    }
    // 解析不能な場合は空文字
    return '';
  }
  // それ以外は空文字
  return '';
}

// 現在の日本時間（JST）をYYYY-MM-DD形式で取得する関数
function getJSTDateString() {
  // Google Apps Scriptの場合、Utilities.formatDate を使用
  const now = new Date();
  return Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy-MM-dd');
}

// スプレッドシートIDを設定ファイルから取得
// getConfigSpreadsheetId() 関数は spreadsheet_config.gs で定義されています
function getSpreadsheetId() {
  try {
    const configId = getConfigSpreadsheetId();
    if (!configId) {
      throw new Error('設定ファイルでスプレッドシートIDが設定されていません');
    }
    Logger.log(`✅ 設定ファイルからスプレッドシートID取得成功: ${configId}`);
    return configId;
  } catch (e) {
    Logger.log(`❌ 設定ファイルからスプレッドシートID取得エラー: ${e.message}`);
    Logger.log(`🔧 対処法: spreadsheet_config.gs でスプレッドシートIDを正しく設定してください`);
    
    // フォールバックとしてアクティブスプレッドシートを試行
    try {
      const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSpreadsheet) {
        const activeId = activeSpreadsheet.getId();
        Logger.log(`⚠️ アクティブスプレッドシートを使用: ${activeId}`);
        return activeId;
      }
    } catch (activeError) {
      Logger.log(`❌ アクティブスプレッドシート取得も失敗: ${activeError.message}`);
    }
    
    // 完全にエラーとして扱う
    throw new Error(`スプレッドシートIDが取得できません。spreadsheet_config.gs を確認してください。`);
  }
}

// 動的にスプレッドシートインスタンスを取得する関数
function getSpreadsheetInstance() {
  const spreadsheetId = getSpreadsheetId();
  return SpreadsheetApp.openById(spreadsheetId);
}

// CORSヘッダーを設定するヘルパー関数（シンプル版）
function createCorsResponse(data) {
  // データの詳細ログ
  console.log(`[GAS DEBUG] createCorsResponse呼び出し - dataタイプ: ${typeof data}, 値:`, data);
  
  // dataがundefinedまたはnullの場合のデフォルト値
  const safeData = data !== undefined && data !== null ? data : { 
    error: 'データが提供されませんでした',
    debugInfo: {
      dataType: typeof data,
      dataValue: data,
      timestamp: new Date().toISOString()
    }
  };
  
  try {
    // JSONデータを準備
    const jsonString = JSON.stringify(safeData);
    console.log(`[GAS DEBUG] JSON レスポンス生成: ${jsonString.length}文字`);
    
    // ContentService（GASでCORSは自動処理される）
    const response = ContentService
      .createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
    
    console.log(`[GAS DEBUG] ContentService レスポンス生成完了`);
    return response;
    
  } catch (error) {
    // JSON.stringifyでエラーが発生した場合の代替処理
    console.error('[GAS ERROR] JSON.stringify エラー:', error.message);
    const fallbackData = { 
      error: 'レスポンス生成エラー', 
      originalError: error.message,
      dataType: typeof safeData,
      timestamp: new Date().toISOString()
    };
    
    try {
      const fallbackJson = JSON.stringify(fallbackData);
      return ContentService
        .createTextOutput(fallbackJson)
        .setMimeType(ContentService.MimeType.JSON);
        
    } catch (fallbackError) {
      // 最終的なフォールバック
      console.error('[GAS ERROR] フォールバックJSONも失敗:', fallbackError.message);
      return ContentService
        .createTextOutput('{"error":"レスポンス生成に失敗しました","timestamp":"' + new Date().toISOString() + '"}')
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

// CORSプリフライトリクエスト（OPTIONSメソッド）を処理
function doOptions(e) {
  const timestamp = new Date().toISOString();
  console.log(`[GAS DEBUG ${timestamp}] doOptions プリフライトリクエスト処理`);
  
  try {
    // ✅ ContentServiceを使用してCORSヘッダーを適切に設定
    const response = ContentService
      .createTextOutput('')
      .setMimeType(ContentService.MimeType.TEXT);
    
    console.log(`[GAS DEBUG] CORSプリフライトレスポンス送信完了 - ContentService使用`);
    return response;
    
  } catch (error) {
    console.error(`[GAS ERROR] doOptions エラー:`, error);
    
    // フォールバック：空のレスポンス
    try {
      return ContentService.createTextOutput('');
    } catch (fallbackError) {
      console.error(`[GAS ERROR] doOptions フォールバックも失敗:`, fallbackError);
      // 最終手段: 空の文字列レスポンス
      return ContentService.createTextOutput('');
    }
  }
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
    version: "v9-SIMPLE-RAW-DATA",
    deployedAt: timestamp,
    availableActions: ["getProperties", "getRooms", "updateInspectionComplete", "getMeterReadings", "updateMeterReadings", "getVersion"],
    hasUpdateInspectionComplete: true,
    hasMeterReadings: true,
    corsFixed: true,
    contentServiceUsed: true,
    description: "🔧 v9-SIMPLE-RAW-DATA版：バックエンドで複雑な日付処理を削除し、生データを返してフロントエンドで統一処理！",
    注意: "このバージョンではバックエンドの日付処理を簡素化し、フロントエンドで統一された日付フォーマット処理を実装",    debugInfo: {
      functionCalled: "getGasVersion",
      timestamp: timestamp,
      deploymentCheck: "✅ v9-SIMPLE-RAW-DATA版が正常に動作中 - 生データ返却＋フロントエンド統一処理",
      corsStatus: "ContentServiceでCORS問題解決済み",
      postMethodSupport: "doPost関数でContentService使用",
      dateProcessingFix: "バックエンドの複雑な日付処理を削除し、フロントエンドで統一的に処理",
      強制確認: "生データ返却によりタイムゾーン問題が完全解決された最新バージョンです"
    }
  };
}

// メイン処理関数
function doGet(e) {
  try {
    const timestamp = new Date().toISOString();    console.log(`[GAS DEBUG ${timestamp}] doGet開始 - バージョン: v8-STRING-DATE-ONLY`);
    console.log(`[GAS DEBUG] 🔧 完全String型日付処理版が動作中です（Date型を一切使用せず1日ずれ問題解決）!`);
    
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
    }    // 検針データ更新
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
      console.log("[GAS DEBUG] 物件データが空です");
      return createCorsResponse([]);
    }
    
    return createCorsResponse(properties);
    
  } catch (error) {
    console.error("[GAS] getProperties エラー:", error.message);
    return createCorsResponse({ error: "物件データ取得中にエラーが発生しました: " + error.message });
  }
}

// 部屋一覧取得処理（検針状況付き）
function handleGetRooms(params) {
  try {
    const propertyId = params.propertyId;
    if (!propertyId) {
      return createCorsResponse({ error: "'propertyId' パラメータが必要です。" });
    }
    
    console.log("[GAS DEBUG] getRooms開始 - 物件ID:", propertyId);
    
    const spreadsheet = getSpreadsheetInstance();
    
    // 利用可能なシート名を確認
    const allSheets = spreadsheet.getSheets();
    const sheetNames = allSheets.map(s => s.getName());
    console.log("[GAS DEBUG] 利用可能なシート名:", JSON.stringify(sheetNames));
    
    const roomSheet = spreadsheet.getSheetByName('部屋マスタ');
    
    if (!roomSheet) {
      console.log("[GAS DEBUG] ERROR: 部屋マスタシートが見つかりません");
      return createCorsResponse({ 
        error: "シート '部屋マスタ' が見つかりません。",
        availableSheets: sheetNames,
        debugInfo: "v3-DEBUG版でシートエラー"
      });
    }
    
    const roomData = roomSheet.getDataRange().getValues();
    console.log("[GAS DEBUG] 部屋マスタデータ行数:", roomData.length);
    
    // 🆕 検針データシートから検針状況を取得
    const inspectionSheet = spreadsheet.getSheetByName('inspection_data');
    let inspectionData = [];
    let inspectionHeaders = [];
    
    if (inspectionSheet) {
      inspectionData = inspectionSheet.getDataRange().getValues();
      inspectionHeaders = inspectionData[0] || [];
      console.log("[GAS DEBUG] inspection_dataシート取得成功 - データ行数:", inspectionData.length);
    } else {
      console.log("[GAS DEBUG] inspection_dataシートが見つかりません - 検針状況なしで継続");
    }
    
    // 検針データのインデックスを取得
    const propertyIdIndex = inspectionHeaders.indexOf('物件ID');
    const roomIdIndex = inspectionHeaders.indexOf('部屋ID');
    const dateIndex = inspectionHeaders.indexOf('検針日時');
    
    const rooms = [];
    
    // ヘッダー行をスキップして検索
    for (let i = 1; i < roomData.length; i++) {
      const row = roomData[i];
      if (String(row[0]).trim() === String(propertyId).trim() && row[1]) { // 物件IDが一致し、部屋番号が存在
        const roomId = String(row[1]).trim();
        const roomName = String(row[2]).trim();
        
        // 🆕 この部屋の検針状況を確認（空日付も適切に処理）
        let lastInspectionDate = null;
        let hasActualReading = false;
        
        if (inspectionData.length > 1 && propertyIdIndex !== -1 && roomIdIndex !== -1 && dateIndex !== -1) {
          // 指示数列のインデックスも取得して検針状況をより正確に判定
          const currentReadingIndex = inspectionHeaders.indexOf('今回の指示数');
          
          for (let j = 1; j < inspectionData.length; j++) {
            const inspectionRow = inspectionData[j];
            const inspectionPropertyId = String(inspectionRow[propertyIdIndex]).trim();
            const inspectionRoomId = String(inspectionRow[roomIdIndex]).trim();
            const inspectionDate = inspectionRow[dateIndex];
            let currentReading = null;
            if (currentReadingIndex !== -1) {
              currentReading = inspectionRow[currentReadingIndex];
            }
            if (inspectionPropertyId === propertyId && inspectionRoomId === roomId) {
              // 検針日時または指示数が入っていれば検針済み扱いにする（スペースも考慮）
              if (
                (currentReading !== null && currentReading !== undefined && currentReading !== '') ||
                (inspectionDate && String(inspectionDate).trim() !== '' && inspectionDate !== null)
              ) {
                hasActualReading = true;
              }
              // 🔧 v9-SIMPLE-RAW-DATA: 生データをそのまま返す（スペースも空として扱う）
              if (inspectionDate && String(inspectionDate).trim() !== '' && inspectionDate !== null) {
                lastInspectionDate = inspectionDate; // 生データをそのまま使用
                console.log(`[GAS DEBUG] 検針データ発見 - 部屋: ${roomId}, 日付: ${lastInspectionDate}, 型: ${typeof lastInspectionDate}, 指示数あり: ${hasActualReading}`);
              } else {
                console.log(`[GAS DEBUG] 検針日時が空または無効 - 部屋: ${roomId}, 値: "${inspectionDate}", 型: ${typeof inspectionDate}, トリム後: "${String(inspectionDate).trim()}"`);
              }
              break; // 最初に見つかったデータを使用（通常1部屋1レコード）
            }
          }
        }
        
        // 🔄 分離アーキテクチャ: 生データのみ返す - フォーマット処理はフロントエンドに移行
        const roomData = {
          propertyId: String(row[0]).trim(),
          roomNumber: roomId,
          id: roomId,
          name: roomName,
          // 生データのみ返す
          rawInspectionDate: lastInspectionDate, // 元の検針日時（Date型またはnull）
          hasActualReading: hasActualReading, // 実際に指示数が入力されているかの真偽値
          currentReadingValue: null // ここでは取得しない（getMeterReadingsで詳細取得）
        };
        
        console.log(`[GAS DEBUG] 部屋データ生成完了 - ${roomId}:`, roomData);
        rooms.push(roomData);
      }
    }
    
    console.log("[GAS DEBUG] 取得部屋数:", rooms.length);
    console.log("[GAS DEBUG] 検針状況付き部屋データ:", rooms.slice(0, 3)); // 最初の3件をログ出力
    
    // データが見つからない場合は空の配列を返す
    if (rooms.length === 0) {
      console.log("[GAS DEBUG] 指定された物件IDに対応する部屋データが見つかりません");
      return createCorsResponse({ result: [] });
    }
    
    return createCorsResponse({ result: rooms });
    
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
    
    // 分離アーキテクチャ: 日本時間（JST）で現在日付を取得
    const formattedDate = getJSTDateString(); // YYYY-MM-DD形式
    
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

// 実際の検針データを取得する関数（完全生データ版）
function getActualMeterReadings(propertyId, roomId) {
  try {
    console.log("[GAS] getActualMeterReadings開始 (Raw Data Mode) - propertyId:", propertyId, "roomId:", roomId);
    
    // 動的にスプレッドシートを取得
    const spreadsheet = getSpreadsheetInstance();
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
    const warningFlagIndex = headers.indexOf('警告フラグ');
    
    console.log("[GAS] 列インデックス確認:");
    console.log("[GAS] - 物件ID:", propertyIdIndex, "部屋ID:", roomIdIndex, "検針日時:", dateIndex);
    
    // 対象部屋のデータを検索
    const readings = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowPropertyId = String(row[propertyIdIndex]).trim();
      const rowRoomId = String(row[roomIdIndex]).trim();
      if (rowPropertyId === String(propertyId).trim() && rowRoomId === String(roomId).trim()) {
        console.log(`[GAS] ✅ マッチング成功: 行${i}`);
        // --- 詳細デバッグ: 生値と型を出力 ---
        console.log('[DEBUG] row[dateIndex]:', row[dateIndex], 'typeof:', typeof row[dateIndex]);
        if (row[dateIndex] instanceof Date) {
          console.log('[DEBUG] as ISO:', row[dateIndex].toISOString());
          console.log('[DEBUG] as JST:', Utilities.formatDate(row[dateIndex], 'Asia/Tokyo', 'yyyy-MM-dd'));
        }
        // --- JST日付変換: どんな値でもtoJSTDateStringで正規化 ---
        const processedDate = toJSTDateString(row[dateIndex]);
        const reading = {
          date: processedDate,
          currentReading: row[currentReadingIndex],
          previousReading: row[previousReadingIndex],
          previousPreviousReading: row[previousPreviousReadingIndex],
          threeTimesPrevious: row[threeTimesPreviousIndex],
          usage: row[usageIndex],
          status: row[warningFlagIndex]
        };
        console.log("[GAS] 処理済みデータを返却:", {
          date: reading.date,
          dateType: typeof reading.date,
          isDate: reading.date instanceof Date,
          currentReading: reading.currentReading,
          rawDataComplete: true
        });
        readings.push(reading);
        break;
      }
    }
    
    console.log("[GAS] 生データ取得完了:", readings.length, "件");
    return readings;
    
  } catch (error) {
    console.error("[GAS] getActualMeterReadings エラー:", error.message);
    return [];
  }
}

// 検針データ更新処理
function handleUpdateMeterReadings(params) {
  try {
    console.log("[GAS] ===== handleUpdateMeterReadings開始 =====");
    console.log("[GAS] 受信パラメータ全体:", JSON.stringify(params, null, 2));
    
    const propertyId = params.propertyId;
    const roomId = params.roomId;
    let readings = params.readings;
    
    console.log("[GAS] 抽出されたパラメータ:");
    console.log("[GAS] - propertyId:", propertyId);
    console.log("[GAS] - roomId:", roomId);
    console.log("[GAS] - readings (raw):", readings);
    console.log("[GAS] - readings type:", typeof readings);
    
    if (!propertyId || !roomId || !readings) {
      const error = {
        error: "物件ID、部屋ID、検針データがすべて必要です。",
        receivedParams: {
          hasPropertyId: !!propertyId,
          hasRoomId: !!roomId,
          hasReadings: !!readings,
          propertyId,
          roomId,
          readings
        }
      };
      console.log("[GAS] パラメータ不足エラー:", error);
      return createCorsResponse(error);
    }
    
    // readingsが文字列の場合はJSONとしてパース（GET要求の場合）
    if (typeof readings === 'string') {
      try {
        console.log("[GAS] readings文字列をJSONパース中...");
        readings = JSON.parse(readings);
        console.log("[GAS] JSONパース成功:", readings);
      } catch (parseError) {
        console.error("[GAS] JSONパースエラー:", parseError.message);
        return createCorsResponse({ 
          error: "検針データのJSON解析に失敗しました: " + parseError.message,
          receivedReadings: readings
        });
      }
    }
    
    if (!Array.isArray(readings)) {
      console.error("[GAS] readingsが配列ではありません:", typeof readings);
      return createCorsResponse({ 
        error: "検針データは配列形式である必要があります。",
        receivedType: typeof readings,
        receivedValue: readings
      });
    }
    
    console.log("[GAS] 有効な検針データ配列:", readings);
    console.log("[GAS] 配列長:", readings.length);
    
    // 実際のスプレッドシート更新処理
    console.log("[GAS] 更新対象検針データ:", readings.length, "件");
    
    const updatedReadings = [];
    
    for (let i = 0; i < readings.length; i++) {
      const reading = readings[i];
      console.log(`[GAS] 処理中の検針データ ${i + 1}/${readings.length}:`, reading);
      
      // ✅ 空の日付は保持して未検針状態を維持（現在日付は一切設定しない）
      console.log(`[GAS] 処理中の日付: "${reading.date}" (空の場合は未検針状態を保持)`);
      // effectiveDateは削除 - 常に元のreading.dateを使用
      
      // ✅ データの妥当性チェック（指示数が空でない場合のみ処理）
      if (reading.currentReading === undefined || reading.currentReading === '' || reading.currentReading === null) {
        console.log(`[GAS] スキップ - 指示数が空:`, reading);
        continue;
      }
      
      let skip = false;        try {
          // **実際のスプレッドシート更新処理を実装**
          const spreadsheet = getSpreadsheetInstance();
          const sheet = spreadsheet.getSheetByName('inspection_data');
        if (!sheet) {
          console.error("[GAS] inspection_data シートが見つかりません");
          skip = true;
          throw new Error('inspection_dataシートが見つかりません');
        }
        const data = sheet.getDataRange().getValues();
        if (data.length < 2) {
          console.error("[GAS] スプレッドシートにデータが不足しています");
          skip = true;
          throw new Error('スプレッドシートにデータが不足しています');
        }
        // ヘッダーから列インデックスを動的に取得
        const headers = data[0];
        const columnIndexes = {
          propertyId: headers.indexOf('物件ID'),
          roomId: headers.indexOf('部屋ID'),
          date: headers.indexOf('検針日時'),
          currentReading: headers.indexOf('今回の指示数'),
          previousReading: headers.indexOf('前回指示数'),
          usage: headers.indexOf('今回使用量'),
          warningFlag: headers.indexOf('警告フラグ')
        };
        // 必要な列が存在するかチェック
        const missingColumns = Object.entries(columnIndexes)
          .filter(([key, index]) => index === -1)
          .map(([key, index]) => key);
        if (missingColumns.length > 0) {
          console.error("[GAS] 必要な列が見つかりません:", missingColumns);
          skip = true;
          throw new Error('必要な列が見つかりません: ' + missingColumns.join(','));
        }
        // 対象行を検索して更新
        let targetRowFound = false;
        let usage = 0; // 使用量を格納する変数（スコープを広げる）
        console.log(`[GAS] 🔍 更新対象検索開始 - 物件ID: "${propertyId}", 部屋ID: "${roomId}"`);
        for (let j = 1; j < data.length; j++) {
          const row = data[j];
          const rowPropertyId = String(row[columnIndexes.propertyId]).trim();
          const rowRoomId = String(row[columnIndexes.roomId]).trim();
          console.log(`[GAS] 行${j + 1}: 物件ID="${rowPropertyId}", 部屋ID="${rowRoomId}"`);
          // ✅ より厳密な文字列比較
          const propertyIdMatch = rowPropertyId === String(propertyId).trim();
          const roomIdMatch = rowRoomId === String(roomId).trim();
          console.log(`[GAS] 行${j + 1} マッチング: 物件ID=${propertyIdMatch}, 部屋ID=${roomIdMatch}`);
          if (propertyIdMatch && roomIdMatch) {
            console.log(`[GAS] ✅ 更新対象行発見: 行${j + 1}`);
            targetRowFound = true;          
            // ✅ 修正: Date型を使わずString型のみで処理
          let recordDate = '';
          if (reading.date !== null && reading.date !== undefined && reading.date !== '') {
            if (reading.date instanceof Date && !isNaN(reading.date.getTime())) {
              // Date型の場合のみ、String変換（1日ずれ問題解決）
              const year = reading.date.getFullYear();
              const month = String(reading.date.getMonth() + 1).padStart(2, '0');
              const day = String(reading.date.getDate()).padStart(2, '0');
              recordDate = `${year}-${month}-${day}`;
            } else {
              // 既にString型の場合はそのまま使用
              recordDate = String(reading.date).trim();
            }
          }
            console.log(`[GAS] 更新開始 - 行${j + 1}, 日付: "${recordDate}" (空の場合は未検針状態), 指示数: ${reading.currentReading}`);
            // 実際のセル更新（1ベースのインデックスに変換）
            sheet.getRange(j + 1, columnIndexes.date + 1).setValue(recordDate); // ✅ 空の場合は空のまま保存
            sheet.getRange(j + 1, columnIndexes.currentReading + 1).setValue(reading.currentReading);
            // ✅ 使用量計算の修正（新規検針データ対応）
            const currentReadingValue = parseFloat(reading.currentReading) || 0;
            const previousReadingValue = parseFloat(row[columnIndexes.previousReading]) || 0;
            
            // 前回指示数が0または空の場合（新規検針データ）
            if (previousReadingValue === 0 || row[columnIndexes.previousReading] === '' || row[columnIndexes.previousReading] === null) {
              // 新規検針の場合は今回の指示数をそのまま使用量とする
              usage = currentReadingValue;
              console.log(`[GAS] 新規検針データ - 今回指示数をそのまま使用量として設定: ${usage}`);
            } else {
              // 前回データがある場合は差分を計算
              usage = Math.max(0, currentReadingValue - previousReadingValue);
              console.log(`[GAS] 既存データ更新 - 使用量計算: 今回=${currentReadingValue}, 前回=${previousReadingValue}, 使用量=${usage}`);
            }
            
            sheet.getRange(j + 1, columnIndexes.usage + 1).setValue(usage);
            // 警告フラグを「正常」に設定
            sheet.getRange(j + 1, columnIndexes.warningFlag + 1).setValue('正常');
            console.log(`[GAS] ✅ 行${j + 1}を更新完了 - 指示数: ${reading.currentReading}, 使用量: ${usage}`);
            break; // 対象行は1つだけなので、見つかったら終了
          }
        }
        if (!targetRowFound) {
          console.log(`[GAS] 🆕 対象データが見つからないため、新しいレコードを作成します`);
          console.log(`[GAS] 新規レコード - 物件ID: "${propertyId}", 部屋ID: "${roomId}"`);
          
          // 新しい行を追加
          const newRowIndex = data.length; // 新しい行のインデックス（1ベース）
          // ✅ 修正: Date型を使わずString型のみで処理
          let recordDate = '';
          if (reading.date !== null && reading.date !== undefined && reading.date !== '') {
            if (reading.date instanceof Date && !isNaN(reading.date.getTime())) {
              // Date型の場合のみ、String変換（1日ずれ問題解決）
              const year = reading.date.getFullYear();
              const month = String(reading.date.getMonth() + 1).padStart(2, '0');
              const day = String(reading.date.getDate()).padStart(2, '0');
              recordDate = `${year}-${month}-${day}`;
            } else {
              // 既にString型の場合はそのまま使用
              recordDate = String(reading.date).trim();
            }
          }
          const currentReadingValue = parseFloat(reading.currentReading) || 0;
          
          // 新規レコードの場合、前回指示数は0、使用量は今回の指示数
          const previousReading = 0;
          usage = currentReadingValue; // 新規レコードの使用量を設定
          
          console.log(`[GAS] 新規レコード作成 - 行${newRowIndex + 1}, 日付: "${recordDate}" (空の場合は未検針状態), 指示数: ${reading.currentReading}, 使用量: ${usage}`);
          
          // 新しい行にデータを設定
          sheet.getRange(newRowIndex + 1, columnIndexes.propertyId + 1).setValue(propertyId);
          sheet.getRange(newRowIndex + 1, columnIndexes.roomId + 1).setValue(roomId);
          sheet.getRange(newRowIndex + 1, columnIndexes.date + 1).setValue(recordDate); // ✅ 空の場合は空のまま保存
          sheet.getRange(newRowIndex + 1, columnIndexes.currentReading + 1).setValue(reading.currentReading);
          sheet.getRange(newRowIndex + 1, columnIndexes.previousReading + 1).setValue(previousReading);
          sheet.getRange(newRowIndex + 1, columnIndexes.usage + 1).setValue(usage);
          sheet.getRange(newRowIndex + 1, columnIndexes.warningFlag + 1).setValue('正常');
          
          console.log(`[GAS] ✅ 新規レコード作成完了 - 行${newRowIndex + 1}, 物件ID: ${propertyId}, 部屋ID: ${roomId}, 指示数: ${reading.currentReading}, 使用量: ${usage}`);
        }
        updatedReadings.push({
          date: reading.date, // 元の日付を使用（空の場合は空のまま）
          currentReading: reading.currentReading,
          usage: usage || '', // 計算された使用量を返却
          updated: true
        });
        console.log(`[GAS] 検針データ更新: ${reading.date || '空の日付'} - 指示数: ${reading.currentReading}, 使用量: ${usage}`);
      } catch (updateError) {
        console.error(`[GAS] 検針データ更新エラー (行${i}):`, updateError.message);
        updatedReadings.push({
          date: reading.date, // 元の日付を使用（空の場合は空のまま）
          currentReading: reading.currentReading,
          error: updateError.message,
          updated: false
        });
        skip = true;
      }
      if (skip) continue;
    }
    
    console.log("[GAS] ===== 検針データ更新処理完了 =====");
    console.log(`[GAS] 総処理件数: ${updatedReadings.length}`);
    console.log(`[GAS] 成功件数: ${updatedReadings.filter(r => r.updated).length}`);
    console.log(`[GAS] エラー件数: ${updatedReadings.filter(r => !r.updated).length}`);
    
    const successCount = updatedReadings.filter(r => r.updated).length;
    const errorCount = updatedReadings.filter(r => !r.updated).length;
    
    // メッセージを詳細に
    let message = '';
    if (successCount > 0 && errorCount === 0) {
      message = `✅ ${successCount}件の検針データを正常に更新しました。`;
    } else if (successCount > 0 && errorCount > 0) {
      message = `⚠️ ${successCount}件の検針データを更新しました（${errorCount}件でエラーが発生）。`;
    } else if (successCount === 0 && errorCount > 0) {
      message = `❌ 検針データの更新に失敗しました（${errorCount}件でエラー）。`;
    } else {
      message = `ℹ️ 更新するデータがありませんでした。`;
    }
    
    return createCorsResponse({
      success: successCount > 0,
      message: message,
      updatedCount: successCount,
      errorCount: errorCount,
      totalProcessed: updatedReadings.length,
      propertyId: propertyId,
      roomId: roomId,
      updatedReadings: updatedReadings,        debugInfo: {
          timestamp: new Date().toISOString(),
          originalReadingsCount: readings.length,
          version: "v8-STRING-DATE-ONLY"
        }
    });
    
  } catch (error) {
    console.error("[GAS] handleUpdateMeterReadings エラー:", error.message, error.stack);
    return createCorsResponse({ 
      success: false,
      error: "検針データの更新中にエラーが発生しました: " + error.message 
    });
  }
}

// GAS doPost: CORS対応・POSTアクション分岐
function doPost(e) {
  const timestamp = new Date().toISOString();
  console.log(`[GAS DEBUG ${timestamp}] doPost開始 - POSTリクエスト受信`);
  
  try {
    // POSTデータの詳細ログ
    if (e) {
      console.log('[GAS DEBUG] eオブジェクト存在:', !!e);
      console.log('[GAS DEBUG] e.postData存在:', !!(e && e.postData));
      console.log('[GAS DEBUG] e.postData.contents存在:', !!(e && e.postData && e.postData.contents));
      
      if (e.postData) {
        console.log('[GAS DEBUG] POSTデータタイプ:', e.postData.type);
        console.log('[GAS DEBUG] POSTデータ長:', e.postData.contents ? e.postData.contents.length : 'null');
        
        // 最初の500文字を表示（デバッグ用）
        if (e.postData.contents) {
          const preview = e.postData.contents.substring(0, 500);
          console.log('[GAS DEBUG] POSTデータプレビュー:', preview);
        }
      }
    }
    
    let params = {};
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
        console.log('[GAS DEBUG] JSON解析成功 - action:', params.action);
        console.log('[GAS DEBUG] POSTパラメータキー:', Object.keys(params));
        
        // デバッグログ処理
        
      } catch (parseError) {
        console.error('[GAS ERROR] JSON解析エラー:', parseError.message);
        console.error('[GAS ERROR] 生データ:', e.postData.contents.substring(0, 200));
        
        // CORSヘッダー付きのエラーレスポンスを返す
        const errorResponse = {
          success: false,
          error: 'POSTデータのJSON解析に失敗しました: ' + parseError.message,
          rawData: e.postData.contents ? e.postData.contents.substring(0, 100) : 'null',
          timestamp: timestamp
        };
        return createCorsResponse(errorResponse);
      }
    } else {
      console.error('[GAS ERROR] POSTデータがありません');
      const errorResponse = {
        success: false,
        error: 'POSTデータがありません。',
        debugInfo: {
          hasE: !!e,
          hasPostData: !!(e && e.postData),
          hasContents: !!(e && e.postData && e.postData.contents)
        },
        timestamp: timestamp
      };
      return createCorsResponse(errorResponse);
    }
    
    // アクション分岐
    if (params.action === 'updateMeterReadings') {
      console.log('[GAS DEBUG] updateMeterReadingsアクション処理開始（doPost）');
      return handleUpdateMeterReadings(params);
      
    } else if (params.action === 'test') {
      // テスト用エンドポイント
      console.log('[GAS DEBUG] テストアクション処理');
      return createCorsResponse({
        success: true,
        message: 'POSTテスト成功',
        receivedData: {
          action: params.action,
          parameterCount: Object.keys(params).length,
          timestamp: timestamp
        }
      });
      
    } else {
      console.log('[GAS ERROR] 無効なアクション（doPost）:', params.action);
      const errorResponse = {
        success: false,
        error: '無効なアクションです（doPost）',
        receivedAction: params.action,
        expected: ['updateMeterReadings', 'test'],
        timestamp: timestamp
      };
      return createCorsResponse(errorResponse);
    }
  } catch (error) {
    console.error('[GAS ERROR] doPostサーバーエラー:', error.message, error.stack);
    const errorResponse = {
      success: false,
      error: 'doPostサーバーエラー: ' + error.message,
      stack: error.stack,
      timestamp: timestamp
    };
    return createCorsResponse(errorResponse);
  }
}

// ===================================================
// テスト用関数 - ログ確認用
// ===================================================

// 手動実行でログ確認用のテスト関数
function testMeterReadingsWithLogs() {
  console.log("=== テスト関数開始 ===");
  console.log("現在時刻:", new Date().toISOString());
  
  try {
    // 検針データ取得テスト
    const testPropertyId = 'P000001';
    const testRoomId = 'R000001';
    
    console.log(`テスト対象: 物件ID=${testPropertyId}, 部屋ID=${testRoomId}`);
    
    const readings = getActualMeterReadings(testPropertyId, testRoomId);
    console.log("取得結果:", readings);
    
    if (readings && readings.length > 0) {
      console.log("✅ データ取得成功");
      console.log("最初のレコードの日付:", readings[0].date);
      console.log("最初のレコードの日付型:", typeof readings[0].date);
    } else {
      console.log("❌ データが見つかりません");
    }
    
  } catch (error) {
    console.error("テストエラー:", error.message);
    console.error("スタックトレース:", error.stack);
  }
  
  console.log("=== テスト関数終了 ===");
}