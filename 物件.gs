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
    try {
      const roomId = e.parameter.roomId;
      if (!roomId) {
        console.error("[物件.gs] getMeterReadings - 'roomId' パラメータがありません。");
        return ContentService.createTextOutput(JSON.stringify({ error: "'roomId' パラメータが必要です。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      console.log(`[物件.gs] getMeterReadings - roomId: ${roomId} の検針データを取得開始`);

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheetName = 'inspection_data'; // ★★★ 検針データのシート名を 'inspection_data' に変更 ★★★
      const sheet = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        console.error(`[物件.gs] getMeterReadings - シート '${sheetName}' が見つかりません。`);
        return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' が見つかりません。` }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) { // ヘッダー行のみ、または空の場合
        console.warn(`[物件.gs] getMeterReadings - シート '${sheetName}' にデータがありません（ヘッダー行を除く）。`);
        return ContentService.createTextOutput(JSON.stringify([])) // 空の配列を返す
          .setMimeType(ContentService.MimeType.JSON);
      }

      const headers = data.shift(); // ヘッダー行を取得
      console.log(`[物件.gs] getMeterReadings - シート '${sheetName}' から読み込んだヘッダー: ${JSON.stringify(headers)}`);

      // 列インデックスの取得（列名が完全に一致している必要があります）
      const roomIdColIndex = headers.indexOf('部屋ID');
      const dateColIndex = headers.indexOf('検針日時');
      const currentReadingColIndex = headers.indexOf('今回の指示数');
      const previousReadingColIndex = headers.indexOf('前回指示数');
      const previousPreviousReadingColIndex = headers.indexOf('前々回指示数'); // ★ 「前々回指示数」の列インデックスを取得
      const usageColIndex = headers.indexOf('今回使用量');
      const statusColIndex = headers.indexOf('警告フラグ');
      const photoUrlColIndex = headers.indexOf('写真URL'); // 写真URLは任意

      // 必須ヘッダーの存在チェック
      let missingHeaders = [];
      if (roomIdColIndex === -1) missingHeaders.push('部屋ID');
      if (dateColIndex === -1) missingHeaders.push('検針日時');
      if (currentReadingColIndex === -1) missingHeaders.push('今回の指示数');
      if (previousReadingColIndex === -1) missingHeaders.push('前回指示数');
      if (previousPreviousReadingColIndex === -1) missingHeaders.push('前々回指示数'); // ★ チェック対象に追加
      if (usageColIndex === -1) missingHeaders.push('今回使用量');
      if (statusColIndex === -1) missingHeaders.push('警告フラグ');
      
      if (missingHeaders.length > 0) {
        const errorMessage = `必須の列ヘッダー（${missingHeaders.join(', ')}）がシート '${sheetName}' に見つかりません。`;
        console.error(`[物件.gs] getMeterReadings - ${errorMessage} 実際に読み込んだヘッダー: ${JSON.stringify(headers)}`);
        return ContentService.createTextOutput(JSON.stringify({ 
          error: errorMessage,
          expectedHeaders: ['部屋ID', '検針日時', '今回の指示数', '前回指示数', '前々回指示数', '今回使用量', '警告フラグ'],
          foundHeaders: headers,
          sheetName: sheetName
        }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const readings = data.filter(row => String(row[roomIdColIndex]).trim() == String(roomId).trim())
        .map(row => {
          // 各列の値を取得。列が存在しない場合はnullや空文字を適切に処理
          const getDateValue = (index) => (index !== -1 && row[index] !== undefined && row[index] !== null) ? String(row[index]).trim() : null;
          
          let readingObject = {
            date: getDateValue(dateColIndex),
            currentReading: getDateValue(currentReadingColIndex),
            previousReading: getDateValue(previousReadingColIndex),
            previousPreviousReading: getDateValue(previousPreviousReadingColIndex), // ★ 「前々回指示数」のデータを取得
            usage: getDateValue(usageColIndex),
            status: getDateValue(statusColIndex),
            photoUrl: photoUrlColIndex !== -1 ? getDateValue(photoUrlColIndex) : null
          };
          return readingObject;
        });
      
      console.log(`[物件.gs] getMeterReadings - roomId: ${roomId} の検針データ ${readings.length} 件を整形完了: ${JSON.stringify(readings)}`);

      // 日付の降順（新しいものが先頭）にソート
      readings.sort((a, b) => {
        // dateがnullまたは不正な日付文字列の場合のフォールバック
        const dateA = a.date ? new Date(a.date) : null;
        const dateB = b.date ? new Date(b.date) : null;

        if (!dateA && !dateB) return 0; // 両方無効なら順序変更なし
        if (!dateA) return 1;  // aが無効ならbを前に
        if (!dateB) return -1; // bが無効ならaを前に
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB - dateA;
      });
      
      console.log(`[物件.gs] getMeterReadings - roomId: ${roomId} の検針データをソート後返却: ${JSON.stringify(readings)}`);
      return ContentService.createTextOutput(JSON.stringify(readings))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      console.error("[物件.gs] getMeterReadingsで予期せぬエラー:", error.message, error.stack, e.parameter ? JSON.stringify(e.parameter) : "no params");
      return ContentService.createTextOutput(JSON.stringify({ error: "検針データの取得中にサーバー側でエラーが発生しました。", details: error.message }))
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

      const roomIdColIndex = headers.indexOf('部屋ID');
      const dateColIndex = headers.indexOf('検針日時');
      const currentReadingColIndex = headers.indexOf('今回の指示数');
      let photoUrlColIndex = headers.indexOf('写真URL');

      // 写真URL列が存在しない場合は追加
      if (photoUrlColIndex === -1) {
        sheet.getRange(1, headers.length + 1).setValue('写真URL');
        photoUrlColIndex = headers.length; // 新しいインデックス
        headers.push('写真URL'); // ヘッダー配列にも追加
        console.log(`[物件.gs] updateMeterReadings - '写真URL' 列を ${photoUrlColIndex + 1} 列目に追加しました。`);
      }

      if (roomIdColIndex === -1 || dateColIndex === -1 || currentReadingColIndex === -1) {
        let missing = [];
        if (roomIdColIndex === -1) missing.push('部屋ID');
        if (dateColIndex === -1) missing.push('検針日時');
        if (currentReadingColIndex === -1) missing.push('今回の指示数');
        throw new Error(`必要な列（${missing.join(', ')}）がシート '${sheetName}' に見つかりません。`);
      }

      // Google Driveのフォルダ設定
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

      // スプレッドシートのデータを走査して更新
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (String(row[roomIdColIndex]).trim() === String(roomId).trim()) {
          const sheetDateValue = row[dateColIndex];
          let sheetDateStr;
          if (sheetDateValue instanceof Date) {
            sheetDateStr = sheetDateValue.toISOString();
          } else {
            sheetDateStr = String(sheetDateValue);
          }

          for (const readingToUpdate of readingsToUpdate) {
            if (sheetDateStr === readingToUpdate.date) {
              let photoUrl = null;
              // 写真データの処理
              if (readingToUpdate.photoData && typeof readingToUpdate.photoData === 'string' && readingToUpdate.photoData.startsWith('data:image/')) {
                try {
                  const base64Data = readingToUpdate.photoData.split(',')[1];
                  const contentType = readingToUpdate.photoData.substring(readingToUpdate.photoData.indexOf(':') + 1, readingToUpdate.photoData.indexOf(';'));
                  const imageBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType);
                  
                  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
                  const fileName = `meter_${propertyId}_${roomId}_${timestamp}.${contentType.split('/')[1] || 'jpg'}`;
                  
                  const imageFile = driveFolder.createFile(imageBlob.setName(fileName));
                  photoUrl = imageFile.getUrl();
                  // photoUrl = imageFile.getId(); // IDを保存する場合
                  console.log(`[物件.gs] updateMeterReadings - 写真をDriveに保存しました: ${fileName}, URL: ${photoUrl}`);
                  photoSavedCount++;
                } catch (photoError) {
                  const photoErrMsg = `写真の保存に失敗 (日時: ${readingToUpdate.date}): ${photoError.message}`
                  console.error("[物件.gs] " + photoErrMsg, photoError.stack);
                  errors.push(photoErrMsg);
                }
              }

              try {
                // 指示数の更新
                if (readingToUpdate.currentReading !== undefined && readingToUpdate.currentReading !== null) {
                    sheet.getRange(i + 2, currentReadingColIndex + 1).setValue(readingToUpdate.currentReading);
                    console.log(`[物件.gs] updateMeterReadings - 指示数更新成功: 行 ${i+2}, 日時 ${readingToUpdate.date}, 新しい指示数 ${readingToUpdate.currentReading}`);
                }
                
                // 写真URLの更新 (photoUrlColIndex は 0ベースなので +1 する)
                if (photoUrl) {
                    sheet.getRange(i + 2, photoUrlColIndex + 1).setValue(photoUrl);
                    console.log(`[物件.gs] updateMeterReadings - 写真URL更新成功: 行 ${i+2}, 日時 ${readingToUpdate.date}, URL ${photoUrl}`);
                }
                updatedCount++; // 指示数または写真が更新されたらカウント

              } catch (cellUpdateError) {
                const errMsg = `セル(行:${i+2})の更新に失敗: ${cellUpdateError.message}`;
                console.error("[物件.gs] " + errMsg);
                errors.push(errMsg);
              }
              break; 
            }
          }
        }
      }

      let message = "";
      if (updatedCount > 0) {
        message += `${updatedCount}件の検針記録を処理しました。`;
        if (photoSavedCount > 0) {
          message += ` ${photoSavedCount}件の写真を保存しました。`;
        }
      } else {
        message = "更新対象のデータが見つかりませんでした。日付が一致するか確認してください。";
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

// ... (既存の古いgetMeterReadings関数はコメントアウトされたまま) ...