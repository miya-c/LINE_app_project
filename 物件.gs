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

function doGet(e) {
  // 最新のデバッグ情報
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG ${timestamp}] doGet開始`);
  
  // eオブジェクトの詳細分析
  console.log("[DEBUG] e オブジェクト存在:", !!e);
  
  if (e) {
    console.log("[DEBUG] e.parameter:", JSON.stringify(e.parameter));
    console.log("[DEBUG] e.queryString:", e.queryString);
    console.log("[DEBUG] e.parameters:", JSON.stringify(e.parameters));
    
    // プロパティを一つずつチェック
    for (let key in e) {
      console.log(`[DEBUG] e.${key}:`, e[key]);
    }
  }
  
  // パラメータが空または存在しない場合の詳細チェック
  if (!e || !e.parameter || Object.keys(e.parameter).length === 0) {
    const debugInfo = {
      timestamp: timestamp,
      hasE: !!e,
      hasParameter: !!(e && e.parameter),
      parameterKeys: e && e.parameter ? Object.keys(e.parameter) : [],
      queryString: e ? e.queryString : null,
      allKeys: e ? Object.keys(e) : []
    };
    
    console.log("[DEBUG] パラメータが空またはなし - デバッグ情報:", JSON.stringify(debugInfo));
      return ContentService.createTextOutput(JSON.stringify({ 
      error: "リクエストパラメータがありません。",
      debugInfo: debugInfo
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
  const action = e.parameter.action;
  console.log("[DEBUG] doGet - actionパラメータ:", action);

  // actionパラメータを確認
  if (action == 'getProperties') {
    console.log("[DEBUG] doGet - getPropertiesアクション開始");
    try {      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName('物件マスタ'); // シート名を確認
      console.log("[DEBUG] doGet - 物件マスタシート取得:", sheet ? "成功" : "失敗");
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ error: "シート '物件マスタ' が見つかりません。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const data = sheet.getDataRange().getValues();
      console.log("[DEBUG] doGet - 取得データ行数:", data.length);
      console.log("[DEBUG] doGet - ヘッダー行:", JSON.stringify(data[0]));
      const properties = [];
      // ヘッダー行 (1行目) をスキップするため、i = 1 から開始
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        // A列(インデックス0)が物件ID、B列(インデックス1)が物件名と仮定
        if (row[0] && row[1]) { // 物件IDと物件名の両方が存在する場合のみ
          properties.push({ 
            id: String(row[0]).trim(), 
            name: String(row[1]).trim()          });
        }
      }
      console.log("[DEBUG] doGet - 処理済み物件数:", properties.length);
      console.log("[DEBUG] doGet - 返却データ:", JSON.stringify(properties));      return ContentService.createTextOutput(JSON.stringify(properties))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    } catch (error) {
      console.error("getPropertiesエラー:", error.message, error.stack);      return ContentService.createTextOutput(JSON.stringify({ error: "物件データ取得中にエラーが発生しました: " + error.toString() }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    }
  // ... （doGet関数の冒頭、getPropertiesの処理は変更なし） ...

  } else if (action == 'getRooms') { // ★★★ 部屋情報を取得する処理 ★★★
    try {
      const propertyId = e.parameter.propertyId;
      if (!propertyId) {
        return ContentService.createTextOutput(JSON.stringify({ error: "'propertyId' パラメータが必要です。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheetName = '部屋マスタ'; // 部屋マスタのシート名
      const sheet = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        console.error(`[物件.gs] getRooms - シート '${sheetName}' が見つかりません。`);
        return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' が見つかりません。` }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const data = sheet.getDataRange().getValues();
      if (data.length === 0) {
        console.warn(`[物件.gs] getRooms - シート '${sheetName}' は空です。ヘッダー行がありません。`);
        return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' は空です。ヘッダー行がありません。` }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const headers = data.shift(); // ヘッダー行を取得
      // ★★★ 実際に読み込んだヘッダーをログに出力 ★★★
      console.log(`[物件.gs] getRooms - シート '${sheetName}' から読み込んだヘッダー: ${JSON.stringify(headers)}`);
      
      const propertyIdColIndex = headers.indexOf('物件ID');
      const roomIdColIndex = headers.indexOf('部屋ID');
      const roomNameColIndex = headers.indexOf('部屋名');
      const meterIdColIndex = headers.indexOf('メーターID');

      if (propertyIdColIndex === -1 || roomIdColIndex === -1 || roomNameColIndex === -1) {
        // ★★★ どのヘッダーが見つからなかったかの詳細と、読み込んだヘッダーをエラー情報に追加 ★★★
        let missingHeaders = [];
        if (propertyIdColIndex === -1) missingHeaders.push('物件ID');
        if (roomIdColIndex === -1) missingHeaders.push('部屋ID');
        if (roomNameColIndex === -1) missingHeaders.push('部屋名');
        
        const errorMessage = `必要な列（${missingHeaders.join(', ')}）がシート '${sheetName}' に見つかりません。`;
        console.error(`[物件.gs] getRooms - ${errorMessage} 期待するヘッダー: ['物件ID', '部屋ID', '部屋名'], 実際に読み込んだヘッダー: ${JSON.stringify(headers)}`);
        
        return ContentService.createTextOutput(JSON.stringify({ 
          error: errorMessage,
          expectedHeaders: ['物件ID', '部屋ID', '部屋名'],
          foundHeaders: headers, // クライアント側でのデバッグ用に読み込んだヘッダーを含める
          sheetName: sheetName // 正しく解決されたシート名をレスポンスに含める
        }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const rooms = data.filter(row => String(row[propertyIdColIndex]).trim() == String(propertyId).trim())
        .map(row => {
          let roomObject = {
            id: String(row[roomIdColIndex]).trim(),
            name: String(row[roomNameColIndex]).trim(),
            propertyId: String(row[propertyIdColIndex]).trim()
          };
          if (meterIdColIndex !== -1 && typeof row[meterIdColIndex] !== 'undefined' && String(row[meterIdColIndex]).trim() !== "") {
            roomObject.meterId = String(row[meterIdColIndex]).trim();
          }
          return roomObject;
        });

      return ContentService.createTextOutput(JSON.stringify(rooms))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      console.error("[物件.gs] getRoomsエラー:", error.message, error.stack, e.parameter ? JSON.stringify(e.parameter) : "no params");
      return ContentService.createTextOutput(JSON.stringify({ error: "部屋データ取得中にエラーが発生しました: " + error.toString(), details: error.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else if (action == 'getMeterReadings') { // ★★★ 検針データを取得する処理 ★★★
    // console.log("--- [物件.gs] getMeterReadings action received ---"); // デバッグ用ログ削除
    try {
      const roomId = e.parameter.roomId;
      const propertyId = e.parameter.propertyId;
      if (!roomId) {
        // console.error("[物件.gs] getMeterReadings - 'roomId' パラメータがありません。"); // デバッグ用ログ削除
        return ContentService.createTextOutput(JSON.stringify({ error: "'roomId' パラメータが必要です。", debugInfo: { message: "'roomId' パラメータがありません。" } }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (!propertyId) {
        // console.error("[物件.gs] getMeterReadings - 'propertyId' パラメータがありません。"); // デバッグ用ログ削除
        return ContentService.createTextOutput(JSON.stringify({ error: "'propertyId' パラメータが必要です。", debugInfo: { message: "'propertyId' パラメータがありません。" } }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      // console.log(`[物件.gs] getMeterReadings - propertyId: ${propertyId}, roomId: ${roomId} の検針データを取得開始`); // デバッグ用ログ削除

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheetName = 'inspection_data'; 
      const sheet = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        // console.error(`[物件.gs] getMeterReadings - シート '${sheetName}' が見つかりません。`); // デバッグ用ログ削除
        return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' が見つかりません。`, debugInfo: { message: `シート '${sheetName}' が見つかりません。` } }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const data = sheet.getDataRange().getValues();
      
      // 機能コードに不要な debugInfoBase の初期化を削除

      if (data.length <= 1) { // ヘッダー行のみ、または空の場合
        // console.warn(`[物件.gs] getMeterReadings - シート '${sheetName}' にデータがありません（ヘッダー行を除く）。`); // デバッグ用ログ削除
        const emptyResponseObject = { readings: [], debugInfo: { message: "データが存在しません（ヘッダー行のみ）" } };
        return ContentService.createTextOutput(JSON.stringify(emptyResponseObject))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const headers = data.shift(); // ヘッダー行を取得
      // console.log(`[物件.gs] getMeterReadings - シート '${sheetName}' から読み込んだヘッダー: ${JSON.stringify(headers)}`); // デバッグ用ログ削除
      
      // 機能コードに不要な debugInfoBase へのヘッダー情報代入を削除

      // 列インデックスの取得
      const propertyIdColIndex = headers.indexOf('物件ID'); // 物件ID列のインデックスを追加
      const roomIdColIndex = headers.indexOf('部屋ID');
      const dateColIndex = headers.indexOf('検針日時');
      const currentReadingColIndex = headers.indexOf('今回の指示数');
      const previousReadingColIndex = headers.indexOf('前回指示数');
      const previousPreviousReadingColIndex = headers.indexOf('前々回指示数'); 
      const threeTimesPreviousReadingColIndex = headers.indexOf('前々々回指示数');
      const usageColIndex = headers.indexOf('今回使用量');
      const statusColIndex = headers.indexOf('警告フラグ');
      // const propertyNameColIndex = headers.indexOf('物件名'); // 物件名はフィルタリングに直接使用しないため、必須チェックからは除外可能

      // 機能コードに不要な debugInfoBase への列マッピング情報代入を削除
      // console.log(`[物件.gs] getMeterReadings - 前々々回指示数列インデックス: ${threeTimesPreviousReadingColIndex}`); // デバッグ用ログ削除

      let missingHeaders = [];
      // if (propertyNameColIndex === -1) missingHeaders.push('物件名'); // 物件名は必須としない
      if (propertyIdColIndex === -1) missingHeaders.push('物件ID');
      if (roomIdColIndex === -1) missingHeaders.push('部屋ID');
      if (dateColIndex === -1) missingHeaders.push('検針日時');
      if (currentReadingColIndex === -1) missingHeaders.push('今回の指示数');
      if (previousReadingColIndex === -1) missingHeaders.push('前回指示数');
      if (previousPreviousReadingColIndex === -1) missingHeaders.push('前々回指示数');
      // 前々々回指示数はオプションなので必須チェックから除外
      if (usageColIndex === -1) missingHeaders.push('今回使用量');
      if (statusColIndex === -1) missingHeaders.push('警告フラグ');
      
      if (missingHeaders.length > 0) {
        const errorMessage = `必須の列ヘッダー（${missingHeaders.join(', ')}）がシート '${sheetName}' に見つかりません。`;
        // console.error(`[物件.gs] getMeterReadings - ${errorMessage} 実際に読み込んだヘッダー: ${JSON.stringify(headers)}`); // デバッグ用ログ削除
        return ContentService.createTextOutput(JSON.stringify({ error: errorMessage, debugInfo: { message: errorMessage, foundHeaders: headers } }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const readings = data.filter(row => 
        String(row[propertyIdColIndex]).trim() == String(propertyId).trim() &&
        String(row[roomIdColIndex]).trim() == String(roomId).trim()
      )
      .map((row, filteredIndex) => { // filteredIndex はデバッグ以外では不要
          const getDateValue = (index) => (index !== -1 && row[index] !== undefined && row[index] !== null) ? String(row[index]).trim() : null;
          
          let threeTimesPreviousValue = null;
          if (threeTimesPreviousReadingColIndex !== -1) {
            const rawValue = row[threeTimesPreviousReadingColIndex];
            if (rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== '') {
              threeTimesPreviousValue = String(rawValue).trim();
            }
          }
          
          let readingObject = {
            date: getDateValue(dateColIndex),
            currentReading: getDateValue(currentReadingColIndex),
            previousReading: getDateValue(previousReadingColIndex),
            previousPreviousReading: getDateValue(previousPreviousReadingColIndex),
            threeTimesPrevious: threeTimesPreviousValue,
            usage: getDateValue(usageColIndex),
            status: getDateValue(statusColIndex),
            photoUrl: null // 初期値
          };
          
          // コメントから写真URL取得
          try {
            // data は既に shift() されているので、元の行インデックスを見つけるには注意が必要
            // ただし、このmap処理内のrowは、フィルタリング後のdataの要素そのもの
            const originalRowIndexInData = data.findIndex(dataRow => dataRow === row);

            if (originalRowIndexInData !== -1) {
                // スプレッドシートの行番号（1始まり）。ヘッダー行が shift() で削除されているため、
                // data 配列のインデックスに +2 (ヘッダー行分 + 1行目開始分)
                const sheetRowNumber = originalRowIndexInData + 2; 
                const currentReadingCell = sheet.getRange(sheetRowNumber, currentReadingColIndex + 1); // 列番号は1始まり
                const comment = currentReadingCell.getComment();
                if (comment && comment.startsWith("写真: ")) {
                    readingObject.photoUrl = comment.substring("写真: ".length);
                }
            }
          } catch (commentError) {
            // console.error(`[物件.gs] getMeterReadings - コメント取得エラー (行 ${filteredIndex}):`, commentError.message); // デバッグ用ログ削除
            // エラーが発生しても処理は継続し、photoUrl は null のまま
          }
          
          return readingObject;
        });
      
      // 機能コードに不要な debugInfoBase への件数やメッセージ代入を削除
      // console.log(`[物件.gs] getMeterReadings - propertyId: ${propertyId}, roomId: ${roomId} の検針データを返却: ${readings.length}件`); // デバッグ用ログ削除
      
      const responseObject = {
        readings: readings,
        // debugInfo はエラー時以外は含めないか、最小限にする
        // debugInfo: { message: readings.length > 0 ? "検針データを取得しました。" : "該当する検針データが見つかりませんでした。" } 
      };
      if (readings.length === 0) {
        responseObject.debugInfo = { message: "該当する検針データが見つかりませんでした。" };
      }

      return ContentService.createTextOutput(JSON.stringify(responseObject))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      // console.error("[物件.gs] getMeterReadingsで予期せぬエラー:", error.message, error.stack, e.parameter ? JSON.stringify(e.parameter) : "no params"); // デバッグ用ログ削除
      const errorResponse = {
        error: "検針データの取得中にサーバー側でエラーが発生しました。",
        details: error.message, // エラー詳細は開発時には有用だが、本番では抑制することも検討
        debugInfo: { 
          message: "サーバーエラー発生",
          // params: e.parameter ? JSON.stringify(e.parameter) : "no params" // パラメータはエラーログには残すが、クライアントには返さないことも検討
        }
      };      return ContentService.createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else if (action == 'updateInspectionComplete') {
    // 検針完了機能（GETリクエスト対応）
    console.log("[DEBUG] doGet - updateInspectionCompleteアクション開始");
    
    try {
      const propertyId = e.parameter.propertyId;
      
      if (!propertyId) {
        return createCorsResponse({ error: "'propertyId' パラメータが必要です。" });
      }

      console.log(`[物件.gs] updateInspectionComplete (GET) - 物件ID: ${propertyId} の検針完了日を更新`);

      // スプレッドシートの取得
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName('物件マスタ');

      if (!sheet) {
        return createCorsResponse({ error: "シート '物件マスタ' が見つかりません。" });
      }

      // データ取得
      const data = sheet.getDataRange().getValues();
      const headers = data.shift(); // ヘッダー行を取得
      
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
      for (let i = 0; i < data.length; i++) {
        if (data[i][propertyIdColIndex] === propertyId) {
          targetRowIndex = i + 2; // ヘッダー行を除いているため+2
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

      console.log(`[物件.gs] updateInspectionComplete (GET) - 物件ID: ${propertyId} の検針完了日を ${formattedDate} に更新しました。`);

      return createCorsResponse({ 
        success: true, 
        message: `物件ID ${propertyId} の検針完了日を ${formattedDate} に更新しました。`,
        completionDate: formattedDate
      });

    } catch (error) {
      console.error("[物件.gs] updateInspectionComplete (GET) エラー:", error.message, error.stack);
      return createCorsResponse({ 
        success: false, 
        error: "検針完了日の更新中にエラーが発生しました: " + error.message 
      });
    }

  } else {    // actionパラメータが無効な場合
    console.log("[DEBUG] doGet - 無効なアクション受信:", action);
    console.log("[DEBUG] doGet - 利用可能なアクション:", ["getProperties", "getRooms", "updateInspectionComplete"]);
    console.log("[DEBUG] doGet - クエリ文字列:", e.queryString);
    return createCorsResponse({ 
        error: "無効なアクションです。", 
        expectedActions: ["getProperties", "getRooms", "updateInspectionComplete"], 
        receivedAction: action, 
        queryString: e.queryString 
      });
  }
}

/*
// 古いgetMeterReadings関数はコメントアウトします。
// こちらの関数はdoGet内のaction分岐で処理が統一されたため不要です。
function getMeterReadings(propertyId, roomId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('検針データ');
    if (!sheet) {
      Logger.log("シート '検針データ' が見つかりません。propertyId: " + propertyId + ", roomId: " + roomId);
      return ContentService.createTextOutput(JSON.stringify({ error: "シート '検針データ' が見つかりません。" })).setMimeType(ContentService.MimeType.JSON);
    }
    const data = sheet.getDataRange().getValues();
    const header = data.shift(); // ヘッダー行を除外

    // 新しい列のインデックス (0始まり)
    // 記録ID, 部屋ID, 検針日時, 今回使用量, 今回の指示数, 前回指示数, 前々回指示数, 警告フラグ, 写真URL
    const COL_ROOM_ID = 1;
    const COL_DATE = 2;
    const COL_USAGE = 3;
    const COL_CURRENT_READING = 4;
    const COL_PREVIOUS_READING = 5;
    const COL_PREVIOUS_PREVIOUS_READING = 6; // 前々回指示数の列インデックス
    const COL_STATUS = 7; // 警告フラグ
    const COL_PHOTO_URL = 8;

    Logger.log("getMeterReadings - propertyId: " + propertyId + ", roomId: " + roomId + ". Filtering " + data.length + " rows.");

    const readings = data.filter(row => row[COL_ROOM_ID] == roomId) // roomIdでフィルタリング
      .map(row => {
        let dateValue = row[COL_DATE];
        // 日付オブジェクトをISO文字列に変換してタイムゾーン問題を回避することを検討
        if (dateValue instanceof Date) {
          // dateValue = dateValue.toISOString(); 
        }
        return {
          date: dateValue,
          currentReading: row[COL_CURRENT_READING],
          previousReading: row[COL_PREVIOUS_READING],
          previousPreviousReading: row[COL_PREVIOUS_PREVIOUS_READING], // 前々回指示数を追加
          usage: row[COL_USAGE],
          status: row[COL_STATUS], 
          photoUrl: row[COL_PHOTO_URL]
        };
      })
      .sort((a, b) => { // 日付で降順ソート
        // 日付の比較はDateオブジェクトで行うのが確実
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1; // 無効な日付は後方に
        if (isNaN(dateB.getTime())) return -1; // 無効な日付は後方に
        return dateB - dateA; // 降順
      });

    Logger.log("Found " + readings.length + " readings for roomId: " + roomId);
    return ContentService.createTextOutput(JSON.stringify(readings)).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    Logger.log("getMeterReadings Error: " + e.toString() + " Stack: " + e.stack + " for roomId: " + roomId);
    return ContentService.createTextOutput(JSON.stringify({ error: "検針データの取得中にエラーが発生しました: " + e.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
*/

function doPost(e) {
  let response;
  try {
    console.log("[物件.gs] doPost - 受信データ (raw): " + e.postData.contents);
    const params = JSON.parse(e.postData.contents);
    console.log("[物件.gs] doPost - パース後パラメータ: " + JSON.stringify(params));

    if (params.action === 'updateMeterReadings') {
      const propertyId = params.propertyId;
      const roomId = params.roomId;
      const readingsToUpdate = params.readings; // [{date: 'YYYY-MM-DDTHH:mm:ss.sssZ', currentReading: '新しい値', photoData: 'base64...'}, ...]

      if (!propertyId || !roomId || !Array.isArray(readingsToUpdate) || readingsToUpdate.length === 0) {
        throw new Error("必要なパラメータ（propertyId, roomId, readings）が不足しているか、形式が正しくありません。");
      }

      console.log(`[物件.gs] updateMeterReadings - 物件ID: ${propertyId}, 部屋ID: ${roomId} の検針データを更新開始。更新対象件数: ${readingsToUpdate.length}`);

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheetName = 'inspection_data';
      const sheet = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        throw new Error(`シート '${sheetName}' が見つかりません。`);
      }
      const data = sheet.getDataRange().getValues();
      const headers = data.shift(); // ヘッダー行を取得

      const propertyNameColIndex = headers.indexOf('物件名');
      const propertyIdColIndex = headers.indexOf('物件ID');
      const roomIdColIndex = headers.indexOf('部屋ID');
      const dateColIndex = headers.indexOf('検針日時');      const currentReadingColIndex = headers.indexOf('今回の指示数');
      console.log(`[物件.gs] updateMeterReadings - 列インデックス確認: currentReadingColIndex = ${currentReadingColIndex}`);
      console.log(`[物件.gs] updateMeterReadings - 全ヘッダー: ${JSON.stringify(headers)}`);
      // const photoUrlColIndex = headers.indexOf('写真URL'); // この変数は使用しない

      if (propertyNameColIndex === -1 || propertyIdColIndex === -1 || roomIdColIndex === -1 || dateColIndex === -1 || currentReadingColIndex === -1) {
        let missing = [];
        if (propertyNameColIndex === -1) missing.push('物件名');
        if (propertyIdColIndex === -1) missing.push('物件ID');
        if (roomIdColIndex === -1) missing.push('部屋ID');
        if (dateColIndex === -1) missing.push('検針日時');
        if (currentReadingColIndex === -1) missing.push('今回の指示数');
        throw new Error(`必要な列（${missing.join(', ')}）がシート '${sheetName}' に見つかりません。ヘッダー: ${JSON.stringify(headers)}`);
      }      // ★★★ 既存の写真URL列データをコメントに移行する処理 ★★★
      const photoUrlColIndex = headers.indexOf('写真URL');
      if (photoUrlColIndex !== -1) {
        console.log(`[物件.gs] updateMeterReadings - 写真URL列が見つかりました。既存データをコメントに移行します。`);
        let migrationCount = 0;
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const photoUrlValue = row[photoUrlColIndex];
          
          if (photoUrlValue && photoUrlValue.trim() !== '' && photoUrlValue !== '写真URL') { // ヘッダー行を除く
            const rowInSheet = i + 2; // ヘッダー行を考慮した行番号
            const currentReadingCell = sheet.getRange(rowInSheet, currentReadingColIndex + 1);
            const existingComment = currentReadingCell.getComment();
            
            // 既にコメントに写真URLが設定されていない場合のみ移行
            if (!existingComment || !existingComment.includes("写真: ")) {
              try {
                const newComment = "写真: " + photoUrlValue.trim();
                currentReadingCell.setComment(newComment);
                
                // 設定確認
                Utilities.sleep(50);
                const verifyComment = currentReadingCell.getComment();
                
                if (verifyComment === newComment) {
                  console.log(`[物件.gs] updateMeterReadings - 行 ${rowInSheet}: 写真URLをコメントに移行成功: "${photoUrlValue}"`);
                  migrationCount++;
                  
                  // 写真URL列の値をクリア
                  sheet.getRange(rowInSheet, photoUrlColIndex + 1).setValue('');
                  console.log(`[物件.gs] updateMeterReadings - 行 ${rowInSheet}: 写真URL列をクリアしました。`);
                } else {
                  console.error(`[物件.gs] updateMeterReadings - 行 ${rowInSheet}: コメント移行失敗`);
                }
              } catch (migrationError) {
                console.error(`[物件.gs] updateMeterReadings - 行 ${rowInSheet}: データ移行中にエラー: ${migrationError.message}`);
              }
            } else {
              console.log(`[物件.gs] updateMeterReadings - 行 ${rowInSheet}: 既にコメントが設定済みのため移行をスキップ`);
            }
          }
        }
        
        console.log(`[物件.gs] updateMeterReadings - データ移行完了: ${migrationCount}件を移行しました。`);
      }

      const driveFolderName = "MeterReadingPhotos";
      let driveFolder;
      const folders = DriveApp.getFoldersByName(driveFolderName);
      if (folders.hasNext()) {
        driveFolder = folders.next();
      } else {
        driveFolder = DriveApp.createFolder(driveFolderName);
        console.log(`[物件.gs] updateMeterReadings - Google Driveにフォルダ '${driveFolderName}' を作成しました。`);
      }

      let updatedCount = 0;
      let photoSavedCount = 0;
      let errors = [];
      let newRecordsCount = 0;      for (const readingToUpdate of readingsToUpdate) {
        console.log(`[物件.gs] updateMeterReadings - 処理開始: readingToUpdate = ${JSON.stringify(readingToUpdate)}`);
        let found = false;
        let latestRecordIndex = -1;
        let latestDate = null;
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          if (String(row[propertyIdColIndex]).trim() === String(propertyId).trim() && 
              String(row[roomIdColIndex]).trim() === String(roomId).trim()) {
            
            const sheetDateValue = row[dateColIndex];
            let sheetDate;
            if (sheetDateValue instanceof Date) {
              sheetDate = sheetDateValue;
            } else if (sheetDateValue) { 
              try {
                sheetDate = new Date(String(sheetDateValue));
                if (isNaN(sheetDate.getTime())) { 
                   console.warn(`[物件.gs] updateMeterReadings - 無効な日付形式です: ${sheetDateValue} at data row ${i}. このレコードはスキップされます。`);
                   sheetDate = null; 
                }
              } catch (dateParseError) {
                console.warn(`[物件.gs] updateMeterReadings - 日付の解析に失敗: ${sheetDateValue} at data row ${i}. Error: ${dateParseError.message}. このレコードはスキップされます。`);
                sheetDate = null; 
              }
            } else {
                console.warn(`[物件.gs] updateMeterReadings - 空の日付です at data row ${i}. このレコードはスキップされます。`);
                sheetDate = null; 
            }
            
            if (sheetDate && (latestDate === null || sheetDate > latestDate)) {
              latestDate = sheetDate;
              latestRecordIndex = i; // data 配列内でのインデックス (0始まり)
              found = true;
            }
          }
        }
          let photoUrl = null;
        console.log(`[物件.gs] updateMeterReadings - 写真データ確認: readingToUpdate.photoData exists: ${!!readingToUpdate.photoData}, type: ${typeof readingToUpdate.photoData}`);
        if (readingToUpdate.photoData) {
          console.log(`[物件.gs] updateMeterReadings - 写真データ詳細: length: ${readingToUpdate.photoData.length}, starts with data:image: ${readingToUpdate.photoData.startsWith('data:image/')}`);
        }
        
        if (readingToUpdate.photoData && typeof readingToUpdate.photoData === 'string' && readingToUpdate.photoData.startsWith('data:image/')) {
          try {
            console.log(`[物件.gs] updateMeterReadings - 写真保存処理開始`);
            const base64Data = readingToUpdate.photoData.split(',')[1];
            const contentType = readingToUpdate.photoData.substring(readingToUpdate.photoData.indexOf(':') + 1, readingToUpdate.photoData.indexOf(';'));
            const imageBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType);
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            const fileName = `meter_${propertyId}_${roomId}_${timestamp}.${contentType.split('/')[1] || 'jpg'}`;
            const imageFile = driveFolder.createFile(imageBlob.setName(fileName));
            photoUrl = imageFile.getUrl();
            console.log(`[物件.gs] updateMeterReadings - 写真をDriveに保存しました: ${fileName}, URL: ${photoUrl}`);
            photoSavedCount++;
          } catch (photoError) {
            const photoErrMsg = `写真の保存に失敗 (物件ID: ${propertyId}, 部屋ID: ${roomId}): ${photoError.message}`;
            console.error("[物件.gs] " + photoErrMsg, photoError.stack);
            errors.push(photoErrMsg);
          }
        } else {
          console.log(`[物件.gs] updateMeterReadings - 写真データなし、または形式が正しくありません`);
        }if (found && latestRecordIndex >= 0) { // 既存レコードの更新処理
          try {
            const recordRowInSheet = latestRecordIndex + 2; // スプレッドシート上の行番号 (1始まり、ヘッダー分+1)

            if (readingToUpdate.currentReading !== undefined && readingToUpdate.currentReading !== null) {
                // 値を設定
                sheet.getRange(recordRowInSheet, currentReadingColIndex + 1).setValue(readingToUpdate.currentReading);
                console.log(`[物件.gs] updateMeterReadings - 指示数更新成功: 行 ${recordRowInSheet}, 物件ID ${propertyId}, 部屋ID ${roomId}, 新しい指示数 ${readingToUpdate.currentReading}`);
                
                const currentDateTime = new Date();
                sheet.getRange(recordRowInSheet, dateColIndex + 1).setValue(currentDateTime);
                console.log(`[物件.gs] updateMeterReadings - 検針日時更新成功: 行 ${recordRowInSheet}, 新しい日時 ${currentDateTime.toISOString()}`);
            }            // ★★★ 「写真URL」列が存在する場合、その値を強制的にクリア ★★★
            const photoUrlHeaderIndex = headers.indexOf('写真URL');
            if (photoUrlHeaderIndex !== -1) {
                sheet.getRange(recordRowInSheet, photoUrlHeaderIndex + 1).setValue('');
                console.log(`[物件.gs] updateMeterReadings (既存レコード) - 「写真URL」列 (行 ${recordRowInSheet}) の値を強制的にクリアしました。`);
            }            // ★★★ 写真URLのコメント設定を必ず実行 ★★★
            console.log(`[物件.gs] updateMeterReadings - コメント設定チェック: photoUrl exists: ${!!photoUrl}, currentReadingColIndex: ${currentReadingColIndex}`);
            if (photoUrl) {
                try {
                    console.log(`[物件.gs] updateMeterReadings - コメント設定開始: 行 ${recordRowInSheet}, 列 ${currentReadingColIndex + 1}`);
                    const commentCell = sheet.getRange(recordRowInSheet, currentReadingColIndex + 1);
                    const commentText = "写真: " + photoUrl;
                    
                    // 既存のコメントを確認
                    const existingComment = commentCell.getComment();
                    console.log(`[物件.gs] updateMeterReadings - 既存コメント: "${existingComment}"`);
                    
                    // コメントを設定
                    commentCell.setComment(commentText);
                    
                    // 少し待ってから確認
                    Utilities.sleep(100);
                    
                    // コメントが正しく設定されたかを確認
                    const verifyComment = commentCell.getComment();
                    console.log(`[物件.gs] updateMeterReadings - コメント確認: "${verifyComment}"`);
                    
                    if (verifyComment === commentText) {
                        console.log(`[物件.gs] updateMeterReadings - コメント設定成功を確認`);
                    } else {
                        console.error(`[物件.gs] updateMeterReadings - コメント設定失敗: 期待値 "${commentText}", 実際値 "${verifyComment}"`);
                        
                        // 再試行
                        console.log(`[物件.gs] updateMeterReadings - コメント設定を再試行します`);
                        commentCell.setComment(commentText);
                        Utilities.sleep(200);
                        const retryVerifyComment = commentCell.getComment();
                        console.log(`[物件.gs] updateMeterReadings - 再試行後のコメント確認: "${retryVerifyComment}"`);
                    }
                } catch (commentError) {
                    console.error(`[物件.gs] updateMeterReadings - コメント設定中にエラー: ${commentError.message}`, commentError.stack);
                }
            } else {
                console.log(`[物件.gs] updateMeterReadings - 写真URLがないため、コメント設定をスキップ`);
            }

            updatedCount++;

          } catch (cellUpdateError) {
            const errMsg = `セル(行:${latestRecordIndex + 2})の更新に失敗: ${cellUpdateError.message}`;
            console.error("[物件.gs] " + errMsg, cellUpdateError.stack);
            errors.push(errMsg);
          }
        } else {
          try {
            console.log(`[物件.gs] updateMeterReadings - 新規データを追加します: 物件ID ${propertyId}, 部屋ID ${roomId}`);
            
            let propertyName = '';
            try {
              const propertyMasterSheet = spreadsheet.getSheetByName('物件マスタ');
              if (propertyMasterSheet) {
                const propertyData = propertyMasterSheet.getDataRange().getValues();
                for (let i = 1; i < propertyData.length; i++) { 
                  if (String(propertyData[i][0]).trim() === String(propertyId).trim()) { 
                    propertyName = String(propertyData[i][1]).trim();
                    break;
                  }
                }
              }
            } catch (propertyLookupError) {
              console.error("[物件.gs] 物件名の取得に失敗:", propertyLookupError.message);
              propertyName = `物件ID:${propertyId}`; 
            }
              const newRowIndexInSheet = sheet.getLastRow() + 1;
            const currentDateTime = new Date();
              // ★★★ 各列のデータを明示的に設定（写真URLは絶対に含めない）★★★
            const newRowData = [];
            for (let colIdx = 0; colIdx < headers.length; colIdx++) {
              const columnName = headers[colIdx];
              
              // 写真URL列には絶対に空文字列を設定（photoUrlを使用しない）
              if (columnName === '写真URL') {
                newRowData.push('');
                console.log(`[物件.gs] updateMeterReadings - 写真URL列（インデックス ${colIdx}）に空文字列を強制設定（photoUrlは使用しない）`);
                continue;
              }
              
              // その他の列は既存のロジック通り
              if (colIdx === propertyNameColIndex) {
                newRowData.push(propertyName);
              } else if (colIdx === propertyIdColIndex) {
                newRowData.push(propertyId);
              } else if (colIdx === roomIdColIndex) {
                newRowData.push(roomId);
              } else if (colIdx === dateColIndex) {
                newRowData.push(currentDateTime);
              } else if (colIdx === currentReadingColIndex) {
                newRowData.push(readingToUpdate.currentReading || '');
              } else if (columnName === '前回指示数') {
                newRowData.push('');
              } else if (columnName === '前々回指示数') {
                newRowData.push('');
              } else if (columnName === '前々々回指示数') { // ★ 新しい列の処理を追加
                newRowData.push(''); // 初期値は空文字列
              } else if (columnName === '今回使用量') {
                newRowData.push('初回登録'); 
              } else if (columnName === '警告フラグ') {
                newRowData.push('初回検針');
              } else {
                newRowData.push(''); 
              }
            }
            
            // sheet.appendRow(newRowData); // この行を削除
            // console.log(`[物件.gs] updateMeterReadings - 新規データ追加成功: 行 ${newRowIndexInSheet}`); // この行を削除            // ★★★ データをシートに書き込み ★★★
            sheet.getRange(newRowIndexInSheet, 1, 1, newRowData.length).setValues([newRowData]);
            console.log(`[物件.gs] updateMeterReadings - 新規データ本体追加成功: 行 ${newRowIndexInSheet}, データ: ${JSON.stringify(newRowData)}`);
              // ★★★ 「写真URL」列が存在する場合、その値を強制的にクリア ★★★
            const photoUrlHeaderIndex = headers.indexOf('写真URL');
            if (photoUrlHeaderIndex !== -1) {
                sheet.getRange(newRowIndexInSheet, photoUrlHeaderIndex + 1).setValue('');
                console.log(`[物件.gs] updateMeterReadings (新規レコード) - 「写真URL」列 (行 ${newRowIndexInSheet}) の値を強制的にクリアしました。`);
            }            // ★★★ 写真URLのコメント設定を必ず実行 ★★★
            console.log(`[物件.gs] updateMeterReadings (新規) - コメント設定チェック: photoUrl exists: ${!!photoUrl}, currentReadingColIndex: ${currentReadingColIndex}`);
            if (photoUrl && currentReadingColIndex !== -1) {
                try {
                    console.log(`[物件.gs] updateMeterReadings (新規) - コメント設定開始: 行 ${newRowIndexInSheet}, 列 ${currentReadingColIndex + 1}`);
                    const commentCell = sheet.getRange(newRowIndexInSheet, currentReadingColIndex + 1);
                    const commentText = "写真: " + photoUrl;
                    
                    // 既存のコメントを確認
                    const existingComment = commentCell.getComment();
                    console.log(`[物件.gs] updateMeterReadings (新規) - 既存コメント: "${existingComment}"`);
                    
                    // コメントを設定
                    commentCell.setComment(commentText);
                    
                    // 少し待ってから確認
                    Utilities.sleep(100);
                    
                    // コメントが正しく設定されたかを確認
                    const verifyComment = commentCell.getComment();
                    console.log(`[物件.gs] updateMeterReadings - 新規データのコメント確認: "${verifyComment}"`);
                    
                    if (verifyComment === commentText) {
                        console.log(`[物件.gs] updateMeterReadings (新規) - コメント設定成功を確認`);
                    } else {
                        console.error(`[物件.gs] updateMeterReadings (新規) - コメント設定失敗: 期待値 "${commentText}", 実際値 "${verifyComment}"`);
                        
                        // 再試行
                        console.log(`[物件.gs] updateMeterReadings (新規) - コメント設定を再試行します`);
                        commentCell.setComment(commentText);
                        Utilities.sleep(200);
                        const retryVerifyComment = commentCell.getComment();
                        console.log(`[物件.gs] updateMeterReadings (新規) - 再試行後のコメント確認: "${retryVerifyComment}"`);
                    }
                } catch (commentError) {
                    console.error(`[物件.gs] updateMeterReadings (新規) - コメント設定中にエラー: ${commentError.message}`, commentError.stack);
                }
            } else {
                console.log(`[物件.gs] updateMeterReadings (新規) - 写真URLがないか列インデックスが無効のため、コメント設定をスキップ. photoUrl: ${photoUrl}, currentReadingColIndex: ${currentReadingColIndex}`);
            }

            newRecordsCount++;
            updatedCount++;
            
          } catch (addError) {
            const errMsg = `新規データの追加に失敗: ${addError.message}`;
            console.error("[物件.gs] " + errMsg, addError.stack);
            errors.push(errMsg);
          }
        }
      }

      let message = "";
      if (updatedCount > 0) {
        message += `${updatedCount}件の検針記録を処理しました。`;
        if (photoSavedCount > 0) {
          message += ` ${photoSavedCount}件の写真を保存しました。`;
        }
        if (newRecordsCount > 0) {
          message += ` うち ${newRecordsCount}件が新規登録です。`;
        }
      } else {
        message = "更新対象のデータが見つかりませんでした。";
      }

      if (errors.length === 0) {
        response = { success: true, message: message };
      } else {
        response = { success: updatedCount > 0, message: message + ` エラー: ${errors.join('; ')}`, error: errors.join('; ') };      }
      console.log("[物件.gs] updateMeterReadings - 処理結果: " + JSON.stringify(response));

    } else if (params.action === 'updateInspectionComplete') {
      // 検針完了日を更新する処理
      const propertyId = params.propertyId;
      
      if (!propertyId) {
        throw new Error("propertyId パラメータが必要です。");
      }
      
      console.log(`[物件.gs] updateInspectionComplete - 物件ID: ${propertyId} の検針完了日を更新`);
      
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName('物件マスタ');
      
      if (!sheet) {
        throw new Error("シート '物件マスタ' が見つかりません。");
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data.shift(); // ヘッダー行を取得
      
      const propertyIdColIndex = headers.indexOf('物件ID');
      const inspectionCompleteDateColIndex = headers.indexOf('検針完了日');
      
      if (propertyIdColIndex === -1) {
        throw new Error("物件マスタシートに '物件ID' 列が見つかりません。");
      }
      
      if (inspectionCompleteDateColIndex === -1) {
        throw new Error("物件マスタシートに '検針完了日' 列が見つかりません。シート構造を確認してください。");
      }
      
      // 該当する物件IDの行を検索
      let foundRowIndex = -1;
      for (let i = 0; i < data.length; i++) {
        if (String(data[i][propertyIdColIndex]).trim() === String(propertyId).trim()) {
          foundRowIndex = i;
          break;
        }
      }
      
      if (foundRowIndex === -1) {
        throw new Error(`物件ID '${propertyId}' が物件マスタシートに見つかりません。`);
      }
      
      // 今日の日付を日本時間で取得（YYYY/MM/DD形式）
      const today = new Date();
      const jstOffset = 9 * 60; // JST is UTC+9
      const jstDate = new Date(today.getTime() + (jstOffset * 60 * 1000));
      const formattedDate = `${jstDate.getUTCFullYear()}/${String(jstDate.getUTCMonth() + 1).padStart(2, '0')}/${String(jstDate.getUTCDate()).padStart(2, '0')}`;
      
      // 検針完了日を更新（行番号は1ベースなので+2: ヘッダー行+配列インデックス調整）
      const targetRow = foundRowIndex + 2;
      const targetCol = inspectionCompleteDateColIndex + 1;
      
      sheet.getRange(targetRow, targetCol).setValue(formattedDate);
      
      console.log(`[物件.gs] updateInspectionComplete - 物件ID: ${propertyId} の検針完了日を ${formattedDate} に更新しました。`);
      
      response = { 
        success: true,        message: `物件ID ${propertyId} の検針完了日を ${formattedDate} に更新しました。`,
        completionDate: formattedDate
      };

    } else {
      throw new Error("無効なアクションです。'updateMeterReadings' または 'updateInspectionComplete' を期待していました。");
    }
  } catch (error) {
    console.error("[物件.gs] doPostエラー:", error.message, error.stack);
    response = { success: false, error: "サーバー処理中にエラーが発生しました: " + error.message };
  }
  
  // CORSヘッダーを設定してレスポンスを返す
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

/*
テスト用関数: GASでパラメータが正しく受信されるかテスト
*/
function testDoGet() {
  // テスト用のeオブジェクトをシミュレート
  const testE = {
    parameter: {
      action: 'getProperties'
    },
    queryString: 'action=getProperties'
  };
  
  console.log("[TEST] testDoGet - テスト開始");
  const result = doGet(testE);
  console.log("[TEST] testDoGet - 結果:", result.getContent());
  return result.getContent();
}

/*
デバッグ用関数: 現在のスプレッドシート情報を確認
*/
function debugSpreadsheetInfo() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log("[DEBUG] スプレッドシート名:", spreadsheet.getName());
    console.log("[DEBUG] スプレッドシートID:", spreadsheet.getId());
    
    const sheets = spreadsheet.getSheets();
    console.log("[DEBUG] シート数:", sheets.length);
    
    sheets.forEach((sheet, index) => {
      console.log(`[DEBUG] シート${index + 1}: ${sheet.getName()}`);
    });
    
    const propertySheet = spreadsheet.getSheetByName('物件マスタ');
    if (propertySheet) {
      const data = propertySheet.getDataRange().getValues();
      console.log("[DEBUG] 物件マスタ行数:", data.length);
      console.log("[DEBUG] 物件マスタヘッダー:", JSON.stringify(data[0]));
      if (data.length > 1) {
        console.log("[DEBUG] 物件マスタ最初のデータ行:", JSON.stringify(data[1]));
      }
    } else {
      console.log("[DEBUG] 物件マスタシートが見つかりません");
    }
    
    return "デバッグ完了";
  } catch (error) {
    console.error("[DEBUG] debugSpreadsheetInfo エラー:", error.message, error.stack);
    return "デバッグ中にエラーが発生しました: " + error.message;
  }
}

// 基本的なパラメータテスト用の関数
function simpleParamTest(e) {
  console.log("[SIMPLE TEST] 開始");
  
  if (!e) {
    console.log("[SIMPLE TEST] eオブジェクトなし");
    return "eオブジェクトなし";
  }
  
  console.log("[SIMPLE TEST] eオブジェクト存在");
  console.log("[SIMPLE TEST] e.parameter:", JSON.stringify(e.parameter || {}));
  console.log("[SIMPLE TEST] e.queryString:", e.queryString || "なし");
  
  if (e.parameter) {
    const paramKeys = Object.keys(e.parameter);
    console.log("[SIMPLE TEST] パラメータキー:", paramKeys.join(", "));
    
    paramKeys.forEach(key => {
      console.log(`[SIMPLE TEST] ${key} = ${e.parameter[key]}`);
    });
  }
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    hasE: !!e,
    hasParameter: !!(e && e.parameter),
    parameterCount: e && e.parameter ? Object.keys(e.parameter).length : 0,
    queryString: e ? e.queryString : null
  };
}

// doGetの代替バージョン（テスト用）
function testDoGetAlternative(e) {
  try {
    console.log("[ALT TEST] 代替doGet開始");
    
    // 基本テスト
    const basicTest = simpleParamTest(e);
    console.log("[ALT TEST] 基本テスト結果:", JSON.stringify(basicTest));
    
    // パラメータが存在する場合のアクション処理
    if (e && e.parameter && e.parameter.action) {
      console.log("[ALT TEST] アクション:", e.parameter.action);
      
      switch (e.parameter.action) {
        case 'getProperties':
          return { message: "getPropertiesアクションを受信", basicTest: basicTest };
        case 'test':
          return { message: "testアクションを受信", basicTest: basicTest };
        default:
          return { message: "未知のアクション", action: e.parameter.action, basicTest: basicTest };
      }
    }
    
    return {
      message: "パラメータまたはアクションなし",
      basicTest: basicTest
    };
    
  } catch (error) {
    console.log("[ALT TEST] エラー:", error.toString());
    return {
      error: error.toString(),
      stack: error.stack
    };
  }
}

