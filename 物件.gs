function doGet(e) {
  // eオブジェクトとe.parameterの存在を確認
  if (!e || !e.parameter) {
    return ContentService.createTextOutput(JSON.stringify({ error: "リクエストパラメータがありません。" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const action = e.parameter.action;

  // actionパラメータを確認
  if (action == 'getProperties') {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName('物件マスタ'); // シート名を確認
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ error: "シート '物件マスタ' が見つかりません。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const data = sheet.getDataRange().getValues();
      const properties = [];
      // ヘッダー行 (1行目) をスキップするため、i = 1 から開始
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        // A列(インデックス0)が物件ID、B列(インデックス1)が物件名と仮定
        if (row[0] && row[1]) { // 物件IDと物件名の両方が存在する場合のみ
          properties.push({ 
            id: String(row[0]).trim(), 
            name: String(row[1]).trim()
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify(properties))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
      console.error("getPropertiesエラー:", error.message, error.stack);
      return ContentService.createTextOutput(JSON.stringify({ error: "物件データ取得中にエラーが発生しました: " + error.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
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
    console.log("--- [物件.gs] getMeterReadings action received ---");
    try {
      const roomId = e.parameter.roomId;
      const propertyId = e.parameter.propertyId; // 物件IDも取得
      if (!roomId) {
        console.error("[物件.gs] getMeterReadings - 'roomId' パラメータがありません。");
        return ContentService.createTextOutput(JSON.stringify({ error: "'roomId' パラメータが必要です。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (!propertyId) {
        console.error("[物件.gs] getMeterReadings - 'propertyId' パラメータがありません。");
        return ContentService.createTextOutput(JSON.stringify({ error: "'propertyId' パラメータが必要です。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      console.log(`[物件.gs] getMeterReadings - propertyId: ${propertyId}, roomId: ${roomId} の検針データを取得開始`);

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheetName = 'inspection_data'; 
      const sheet = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        console.error(`[物件.gs] getMeterReadings - シート '${sheetName}' が見つかりません。`);
        return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' が見つかりません。` }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const data = sheet.getDataRange().getValues();
      
      const debugInfoBase = { // デバッグ情報を格納するオブジェクトのベース
        message: "",
        detectedHeaders: [],
        headerCount: 0,
        threeTimesPreviousIndex: -1,
        threeTimesPreviousExists: false,
        totalDataRows: 0,
        filteredReadingsCount: 0,
        columnMapping: {}
      };

      if (data.length <= 1) { // ヘッダー行のみ、または空の場合
        console.warn(`[物件.gs] getMeterReadings - シート \'${sheetName}\' にデータがありません（ヘッダー行を除く）。`);
        debugInfoBase.message = "データが存在しません（ヘッダー行のみ）";
        if (data.length > 0) {
          debugInfoBase.detectedHeaders = data[0];
          debugInfoBase.headerCount = data[0].length;
        }
        const emptyResponseObject = { readings: [], debugInfo: debugInfoBase };
        return ContentService.createTextOutput(JSON.stringify(emptyResponseObject))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const headers = data.shift(); // ヘッダー行を取得
      console.log(`[物件.gs] getMeterReadings - シート \'${sheetName}\' から読み込んだヘッダー: ${JSON.stringify(headers)}`);
      
      debugInfoBase.detectedHeaders = headers;
      debugInfoBase.headerCount = headers.length;
      debugInfoBase.totalDataRows = data.length; // ヘッダーを除いたデータ行数

      // 列インデックスの取得
      const propertyNameColIndex = headers.indexOf('物件名');
      const propertyIdColIndex = headers.indexOf('物件ID');
      const roomIdColIndex = headers.indexOf('部屋ID');
      const dateColIndex = headers.indexOf('検針日時');
      const currentReadingColIndex = headers.indexOf('今回の指示数');
      const previousReadingColIndex = headers.indexOf('前回指示数');
      const previousPreviousReadingColIndex = headers.indexOf('前々回指示数');
      const threeTimesPreviousReadingColIndex = headers.indexOf('前々々回指示数');
      const usageColIndex = headers.indexOf('今回使用量');
      const statusColIndex = headers.indexOf('警告フラグ');

      debugInfoBase.threeTimesPreviousIndex = threeTimesPreviousReadingColIndex;
      debugInfoBase.threeTimesPreviousExists = threeTimesPreviousReadingColIndex !== -1;
      debugInfoBase.columnMapping = {
        '物件名': propertyNameColIndex, '物件ID': propertyIdColIndex, '部屋ID': roomIdColIndex,
        '検針日時': dateColIndex, '今回の指示数': currentReadingColIndex, '前回指示数': previousReadingColIndex,
        '前々回指示数': previousPreviousReadingColIndex, '前々々回指示数': threeTimesPreviousReadingColIndex,
        '今回使用量': usageColIndex, '警告フラグ': statusColIndex
      };
      
      console.log(`[物件.gs] getMeterReadings - 前々々回指示数列インデックス: ${threeTimesPreviousReadingColIndex}`);

      let missingHeaders = [];
      if (propertyNameColIndex === -1) missingHeaders.push('物件名');
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
        console.error(`[物件.gs] getMeterReadings - ${errorMessage} 実際に読み込んだヘッダー: ${JSON.stringify(headers)}`);
        debugInfoBase.message = errorMessage;
        return ContentService.createTextOutput(JSON.stringify({ error: errorMessage, debugInfo: debugInfoBase }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const readings = data.filter(row => 
        String(row[propertyIdColIndex]).trim() == String(propertyId).trim() &&
        String(row[roomIdColIndex]).trim() == String(roomId).trim()
      )
      .map((row, filteredIndex) => {
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
            const originalRowIndex = data.findIndex(dataRow => dataRow === row); // data は既に shift() されているので注意
            if (originalRowIndex !== -1) {
              const sheetRowNumber = originalRowIndex + 2; // ヘッダー行が1行目、データは2行目からなので +2
              const currentReadingCell = sheet.getRange(sheetRowNumber, currentReadingColIndex + 1);
              const comment = currentReadingCell.getComment();
              if (comment && comment.startsWith("写真: ")) {
                readingObject.photoUrl = comment.substring("写真: ".length);
              }
            }
          } catch (commentError) {
            console.error(`[物件.gs] getMeterReadings - コメント取得エラー (行 ${filteredIndex}):`, commentError.message);
          }
          
          return readingObject;
        });
      
      debugInfoBase.filteredReadingsCount = readings.length;
      if (readings.length > 0) {
        debugInfoBase.message = "検針データを取得しました。";
      } else {
        debugInfoBase.message = "該当する検針データが見つかりませんでした。";
      }
      
      console.log(`[物件.gs] getMeterReadings - propertyId: ${propertyId}, roomId: ${roomId} の検針データを返却: ${readings.length}件`);
      
      const responseObject = {
        readings: readings,
        debugInfo: debugInfoBase // 本番用に調整したデバッグ情報
      };
      return ContentService.createTextOutput(JSON.stringify(responseObject))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      console.error("[物件.gs] getMeterReadingsで予期せぬエラー:", error.message, error.stack, e.parameter ? JSON.stringify(e.parameter) : "no params");
      const errorResponse = {
        error: "検針データの取得中にサーバー側でエラーが発生しました。",
        details: error.message,
        debugInfo: { // エラー時にも基本的なデバッグ情報を提供
          message: "サーバーエラー発生",
          params: e.parameter ? JSON.stringify(e.parameter) : "no params"
        }
      };
      return ContentService.createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    // actionパラメータが 'getProperties' でも 'getRooms' でもない場合
    return ContentService.createTextOutput(JSON.stringify({ 
        error: "無効なアクションです。", 
        expectedActions: ["getProperties", "getRooms"], 
        receivedAction: action, 
        queryString: e.queryString 
      }))
      .setMimeType(ContentService.MimeType.JSON);
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
        response = { success: updatedCount > 0, message: message + ` エラー: ${errors.join('; ')}`, error: errors.join('; ') };
      }
      console.log("[物件.gs] updateMeterReadings - 処理結果: " + JSON.stringify(response));

    } else {
      throw new Error("無効なアクションです。'updateMeterReadings' を期待していました。");
    }
  } catch (error) {
    console.error("[物件.gs] doPostエラー:", error.message, error.stack);
    response = { success: false, error: "サーバー処理中にエラーが発生しました: " + error.message };
  }
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ★★★ デバッグ用: スプレッドシート構造を確認する関数 ★★★
function debugSpreadsheetStructure() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('inspection_data');
    
    if (!sheet) {
      console.error("シート 'inspection_data' が見つかりません。");
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0]; // ヘッダー行
    
    console.log("=== スプレッドシート構造情報 ===");
    console.log("シート名: inspection_data");
    console.log("総行数: " + data.length);
    console.log("総列数: " + headers.length);
    console.log("ヘッダー行: " + JSON.stringify(headers));
    
    const currentReadingColIndex = headers.indexOf('今回の指示数');
    const photoUrlColIndex = headers.indexOf('写真URL');
    
    console.log("「今回の指示数」列インデックス: " + currentReadingColIndex);
    console.log("「写真URL」列インデックス: " + photoUrlColIndex);
    
    // サンプルデータを表示
    if (data.length > 1) {
      console.log("サンプル行 (2行目): " + JSON.stringify(data[1]));
      
      // 今回の指示数セルの確認
      if (currentReadingColIndex !== -1 && data.length > 1) {
        const sampleCell = sheet.getRange(2, currentReadingColIndex + 1);
        const comment = sampleCell.getComment();
        console.log("サンプル行の「今回の指示数」セルのコメント: \"" + comment + "\"");
      }
      
      // 最新の10行のコメントをチェック
      console.log("=== 最新10行のコメント確認 ===");
      const startRow = Math.max(2, data.length - 9); // 最新10行、最低でも2行目から
      const endRow = data.length;
      
      for (let i = startRow; i <= endRow; i++) {
        if (currentReadingColIndex !== -1) {
          const cell = sheet.getRange(i, currentReadingColIndex + 1);
          const comment = cell.getComment();
          const cellValue = cell.getValue();
          console.log(`行 ${i}: 値="${cellValue}", コメント="${comment || '(なし)'}"`);
        }
      }
    }
    
    console.log("=== 構造確認完了 ===");
    
  } catch (error) {
    console.error("デバッグ中にエラーが発生しました:", error.message, error.stack);
  }
}

// ★★★ コメント設定専用のテスト関数 ★★★
function testCommentSetting() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('inspection_data');
    
    if (!sheet) {
      console.error("シート 'inspection_data' が見つかりません。");
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const currentReadingColIndex = headers.indexOf('今回の指示数');
    
    if (currentReadingColIndex === -1) {
      console.error("「今回の指示数」列が見つかりません。");
      return;
    }
    
    // テスト用のコメントを設定
    const testRow = 2; // 2行目でテスト
    const testCell = sheet.getRange(testRow, currentReadingColIndex + 1);
    const testComment = "テスト写真: " + new Date().toISOString();
    
    console.log(`テストコメント設定開始: 行${testRow}, 列${currentReadingColIndex + 1}`);
    console.log(`設定するコメント: "${testComment}"`);
    
    testCell.setComment(testComment);
    
    // 設定確認
    Utilities.sleep(500); // 少し待つ
    const verifyComment = testCell.getComment();
    console.log(`設定後の確認: "${verifyComment}"`);
    
    if (verifyComment === testComment) {
      console.log("✅ コメント設定テスト成功！");
    } else {
      console.log("❌ コメント設定テスト失敗");
    }
    
  } catch (error) {
    console.error("テスト中にエラーが発生しました:", error.message, error.stack);
  }
}

// ★★★ 特定の物件・部屋のコメント状況を確認する関数 ★★★
function checkCommentsForPropertyRoom(propertyId, roomId) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('inspection_data');
    
    if (!sheet) {
      console.error("シート 'inspection_data' が見つかりません。");
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const propertyIdColIndex = headers.indexOf('物件ID');
    const roomIdColIndex = headers.indexOf('部屋ID');
    const currentReadingColIndex = headers.indexOf('今回の指示数');
    
    console.log(`=== 物件ID: ${propertyId}, 部屋ID: ${roomId} のコメント確認 ===`);
    console.log(`列インデックス - 物件ID: ${propertyIdColIndex}, 部屋ID: ${roomIdColIndex}, 今回の指示数: ${currentReadingColIndex}`);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (String(row[propertyIdColIndex]).trim() === String(propertyId).trim() && 
          String(row[roomIdColIndex]).trim() === String(roomId).trim()) {
        
        const rowInSheet = i + 1;
        const cell = sheet.getRange(rowInSheet, currentReadingColIndex + 1);
        const comment = cell.getComment();
        const value = cell.getValue();
        
        console.log(`行 ${rowInSheet}: 値="${value}", コメント="${comment || '(なし)'}"`);
      }
    }
    
    console.log("=== コメント確認完了 ===");
    
  } catch (error) {
    console.error("コメント確認中にエラーが発生しました:", error.message, error.stack);
  }
}

// 使用例: checkCommentsForPropertyRoom('P001', 'R001');

// ★★★ スプレッドシートの構造とサンプルデータを詳細確認する関数 ★★★
function inspectSpreadsheetStructure() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('inspection_data');
    
    if (!sheet) {
      console.error("シート 'inspection_data' が見つかりません。");
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0]; // ヘッダー行
    
    console.log("=== 📊 スプレッドシート詳細分析 ===");
    console.log("シート名: inspection_data");
    console.log("総行数: " + data.length);
    console.log("総列数: " + headers.length);
    
    // ヘッダーの詳細分析
    console.log("=== ヘッダー分析 ===");
    headers.forEach((header, index) => {
      console.log(`列[${index}]: "${header}" (長さ: ${String(header).length}, 型: ${typeof header})`);
    });
    
    // 重要な列のインデックス確認
    const importantColumns = [
      '物件名', '物件ID', '部屋ID', '検針日時', 
      '今回の指示数', '前回指示数', '前々回指示数', '前々々回指示数',
      '今回使用量', '警告フラグ', '写真URL'
    ];
    
    console.log("=== 重要列インデックス確認 ===");
    importantColumns.forEach(colName => {
      const index = headers.indexOf(colName);
      console.log(`「${colName}」: インデックス ${index} ${index === -1 ? '❌ 見つからず' : '✅ 存在'}`);
    });
    
    // サンプルデータの分析（最初の3行）
    console.log("=== サンプルデータ分析 ===");
    const sampleRowCount = Math.min(4, data.length); // ヘッダー + 最大3行
    for (let i = 0; i < sampleRowCount; i++) {
      console.log(`行${i + 1} ${i === 0 ? '(ヘッダー)' : '(データ)'}:`);
      const row = data[i];
      row.forEach((cell, colIndex) => {
        if (colIndex < 15) { // 最初の15列のみ表示
          console.log(`  [${colIndex}] "${cell}" (型: ${typeof cell}, 長さ: ${String(cell).length})`);
        }
      });
      console.log("---");
    }
    
    // 前々々回指示数の特別分析
    const threeTimesPreviousIndex = headers.indexOf('前々々回指示数');
    console.log("=== 前々々回指示数 特別分析 ===");
    console.log(`列インデックス: ${threeTimesPreviousIndex}`);
    
    if (threeTimesPreviousIndex !== -1) {
      console.log("✅ 前々々回指示数列が存在します");
      console.log("この列のサンプルデータ（最初の5行）:");
      for (let i = 1; i < Math.min(6, data.length); i++) { // ヘッダーを除く
        const value = data[i][threeTimesPreviousIndex];
        console.log(`  行${i + 1}: "${value}" (型: ${typeof value}, 値: ${value})`);
      }
      
      // 非空の値の数を数える
      let nonEmptyCount = 0;
      let numericCount = 0;
      for (let i = 1; i < data.length; i++) {
        const value = data[i][threeTimesPreviousIndex];
        if (value !== null && value !== undefined && String(value).trim() !== '') {
          nonEmptyCount++;
          if (!isNaN(parseFloat(value))) {
            numericCount++;
          }
        }
      }
      console.log(`非空の値: ${nonEmptyCount}/${data.length - 1}行`);
      console.log(`数値として解析可能: ${numericCount}/${data.length - 1}行`);
    } else {
      console.log("❌ 前々々回指示数列が見つかりません");
      console.log("類似する列名を検索:");
      headers.forEach((header, index) => {
        if (String(header).includes('前') || String(header).includes('回') || String(header).includes('指示')) {
          console.log(`  [${index}]: "${header}"`);
        }
      });
    }
    
    console.log("=== 分析完了 ===");
    
  } catch (error) {
    console.error("スプレッドシート分析中にエラーが発生しました:", error.message, error.stack);
  }
}

// ★★★ 特定の物件・部屋のデータを詳細表示する関数 ★★★
function inspectSpecificData(propertyId = 'P000001', roomId = 'R000003') {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('inspection_data');
    
    if (!sheet) {
      console.error("シート 'inspection_data' が見つかりません。");
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const propertyIdColIndex = headers.indexOf('物件ID');
    const roomIdColIndex = headers.indexOf('部屋ID');
    const threeTimesPreviousIndex = headers.indexOf('前々々回指示数');
    
    console.log(`=== 物件ID: ${propertyId}, 部屋ID: ${roomId} の詳細データ ===`);
    console.log(`物件ID列インデックス: ${propertyIdColIndex}`);
    console.log(`部屋ID列インデックス: ${roomIdColIndex}`);
    console.log(`前々々回指示数列インデックス: ${threeTimesPreviousIndex}`);
    
    let foundRows = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (String(row[propertyIdColIndex]).trim() === String(propertyId).trim() && 
          String(row[roomIdColIndex]).trim() === String(roomId).trim()) {
        foundRows++;
        console.log(`=== 一致する行 ${i + 1} ===`);
        console.log(`物件ID: "${row[propertyIdColIndex]}"`);
        console.log(`部屋ID: "${row[roomIdColIndex]}"`);
        console.log(`検針日時: "${row[headers.indexOf('検針日時')]}"`);
        console.log(`今回の指示数: "${row[headers.indexOf('今回の指示数')]}"`);
        console.log(`前回指示数: "${row[headers.indexOf('前回指示数')]}"`);
        console.log(`前々回指示数: "${row[headers.indexOf('前々回指示数')]}"`);
        if (threeTimesPreviousIndex !== -1) {
          const threeTimesPrevValue = row[threeTimesPreviousIndex];
          console.log(`前々々回指示数: "${threeTimesPrevValue}" (型: ${typeof threeTimesPrevValue})`);
        } else {
          console.log(`前々々回指示数: 列が存在しません`);
        }
        console.log("---");
      }
    }
    
    console.log(`総一致行数: ${foundRows}`);
    
  } catch (error) {
    console.error("特定データ分析中にエラーが発生しました:", error.message, error.stack);
  }
}