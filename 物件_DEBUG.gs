// デバッグ版 Google Apps Script
// threeTimesPrevious問題解決のための詳細ログ付きバージョン

function doGet(e) {
  console.log("[DEBUG] doGet開始 - パラメータ:", JSON.stringify(e ? e.parameter : "パラメータなし"));
  
  // eオブジェクトとe.parameterの存在を確認
  if (!e || !e.parameter) {
    return ContentService.createTextOutput(JSON.stringify({ error: "リクエストパラメータがありません。" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const action = e.parameter.action;
  console.log("[DEBUG] アクション:", action);

  // actionパラメータを確認
  if (action == 'getProperties') {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName('物件マスタ');
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ error: "シート '物件マスタ' が見つかりません。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const data = sheet.getDataRange().getValues();
      const properties = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[1]) {
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

  } else if (action == 'getRooms') {
    try {
      const propertyId = e.parameter.propertyId;
      if (!propertyId) {
        return ContentService.createTextOutput(JSON.stringify({ error: "'propertyId' パラメータが必要です。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheetName = '部屋マスタ';
      const sheet = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        console.error(`[DEBUG] getRooms - シート '${sheetName}' が見つかりません。`);
        return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' が見つかりません。` }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const data = sheet.getDataRange().getValues();
      if (data.length === 0) {
        console.warn(`[DEBUG] getRooms - シート '${sheetName}' は空です。`);
        return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' は空です。` }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const headers = data.shift();
      console.log(`[DEBUG] getRooms - ヘッダー:`, JSON.stringify(headers));
      
      const propertyIdColIndex = headers.indexOf('物件ID');
      const roomIdColIndex = headers.indexOf('部屋ID');
      const roomNameColIndex = headers.indexOf('部屋名');
      const meterIdColIndex = headers.indexOf('メーターID');

      if (propertyIdColIndex === -1 || roomIdColIndex === -1 || roomNameColIndex === -1) {
        let missingHeaders = [];
        if (propertyIdColIndex === -1) missingHeaders.push('物件ID');
        if (roomIdColIndex === -1) missingHeaders.push('部屋ID');
        if (roomNameColIndex === -1) missingHeaders.push('部屋名');
        
        const errorMessage = `必要な列（${missingHeaders.join(', ')}）がシート '${sheetName}' に見つかりません。`;
        console.error(`[DEBUG] getRooms - ${errorMessage}`);
        
        return ContentService.createTextOutput(JSON.stringify({ 
          error: errorMessage,
          expectedHeaders: ['物件ID', '部屋ID', '部屋名'],
          foundHeaders: headers,
          sheetName: sheetName
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
      console.error("[DEBUG] getRoomsエラー:", error.message, error.stack);
      return ContentService.createTextOutput(JSON.stringify({ error: "部屋データ取得中にエラーが発生しました: " + error.toString(), details: error.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } else if (action == 'getMeterReadings') {
    console.log("[DEBUG] ★★★ getMeterReadings action received ★★★");
    try {
      const roomId = e.parameter.roomId;
      const propertyId = e.parameter.propertyId;
      console.log(`[DEBUG] getMeterReadings - propertyId: ${propertyId}, roomId: ${roomId}`);
      
      if (!roomId) {
        console.error("[DEBUG] getMeterReadings - 'roomId' パラメータがありません。");
        return ContentService.createTextOutput(JSON.stringify({ error: "'roomId' パラメータが必要です。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (!propertyId) {
        console.error("[DEBUG] getMeterReadings - 'propertyId' パラメータがありません。");
        return ContentService.createTextOutput(JSON.stringify({ error: "'propertyId' パラメータが必要です。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      console.log("[DEBUG] スプレッドシート取得成功");
      
      const sheetName = 'inspection_data';
      const sheet = spreadsheet.getSheetByName(sheetName);
      console.log(`[DEBUG] シート '${sheetName}' 取得:`, sheet ? "成功" : "失敗");

      if (!sheet) {
        console.error(`[DEBUG] getMeterReadings - シート '${sheetName}' が見つかりません。`);
        return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' が見つかりません。` }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const data = sheet.getDataRange().getValues();
      console.log(`[DEBUG] データ取得成功 - 行数: ${data.length}`);
      
      if (data.length <= 1) {
        console.warn(`[DEBUG] getMeterReadings - シート '${sheetName}' にデータがありません。`);
        const emptyResponseObject = {
          readings: [],
          debugInfo: {
            message: "データが存在しません（ヘッダー行のみ）",
            detectedHeaders: data.length > 0 ? data[0] : [],
            headerCount: data.length > 0 ? data[0].length : 0,
            threeTimesPreviousIndex: -1,
            threeTimesPreviousExists: false,
            totalDataRows: 0,
            filteredReadings: 0
          }
        };
        return ContentService.createTextOutput(JSON.stringify(emptyResponseObject))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const headers = data.shift();
      console.log(`[DEBUG] ヘッダー行:`, JSON.stringify(headers));

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

      console.log(`[DEBUG] 列インデックス:`);
      console.log(`  物件名: ${propertyNameColIndex}`);
      console.log(`  物件ID: ${propertyIdColIndex}`);
      console.log(`  部屋ID: ${roomIdColIndex}`);
      console.log(`  検針日時: ${dateColIndex}`);
      console.log(`  今回の指示数: ${currentReadingColIndex}`);
      console.log(`  前回指示数: ${previousReadingColIndex}`);
      console.log(`  前々回指示数: ${previousPreviousReadingColIndex}`);
      console.log(`  ★前々々回指示数: ${threeTimesPreviousReadingColIndex}`);
      console.log(`  今回使用量: ${usageColIndex}`);
      console.log(`  警告フラグ: ${statusColIndex}`);

      // 必須ヘッダーの存在チェック
      let missingHeaders = [];
      if (propertyNameColIndex === -1) missingHeaders.push('物件名');
      if (propertyIdColIndex === -1) missingHeaders.push('物件ID');
      if (roomIdColIndex === -1) missingHeaders.push('部屋ID');
      if (dateColIndex === -1) missingHeaders.push('検針日時');
      if (currentReadingColIndex === -1) missingHeaders.push('今回の指示数');
      if (previousReadingColIndex === -1) missingHeaders.push('前回指示数');
      if (previousPreviousReadingColIndex === -1) missingHeaders.push('前々回指示数');
      if (usageColIndex === -1) missingHeaders.push('今回使用量');
      if (statusColIndex === -1) missingHeaders.push('警告フラグ');

      console.log(`[DEBUG] 前々々回指示数列の詳細状況:`);
      console.log(`  列インデックス: ${threeTimesPreviousReadingColIndex}`);
      console.log(`  列が存在するか: ${threeTimesPreviousReadingColIndex !== -1}`);
      if (threeTimesPreviousReadingColIndex !== -1) {
        console.log(`  列の位置: ${threeTimesPreviousReadingColIndex + 1}番目（1始まり）`);
        console.log(`  ヘッダー値: "${headers[threeTimesPreviousReadingColIndex]}"`);
      } else {
        console.warn(`  前々々回指示数列が見つからないため、threeTimesPreviousはnullになります`);
        console.log(`  利用可能なヘッダー一覧:`);
        headers.forEach((header, index) => {
          console.log(`    [${index}]: "${header}"`);
        });
      }

      if (missingHeaders.length > 0) {
        const errorMessage = `必須の列ヘッダー（${missingHeaders.join(', ')}）がシート '${sheetName}' に見つかりません。`;
        console.error(`[DEBUG] getMeterReadings - ${errorMessage}`);
        return ContentService.createTextOutput(JSON.stringify({ 
          error: errorMessage,
          expectedHeaders: ['物件名', '物件ID', '部屋ID', '検針日時', '今回の指示数', '前回指示数', '前々回指示数', '前々々回指示数', '今回使用量', '警告フラグ'],
          foundHeaders: headers,
          sheetName: sheetName
        }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // データをフィルタリングして該当する行を取得
      console.log(`[DEBUG] データフィルタリング開始 - 条件: 物件ID=${propertyId}, 部屋ID=${roomId}`);
      const filteredData = data.filter(row => 
        String(row[propertyIdColIndex]).trim() == String(propertyId).trim() && 
        String(row[roomIdColIndex]).trim() == String(roomId).trim()
      );
      console.log(`[DEBUG] フィルタリング結果: ${filteredData.length}行`);

      const readings = filteredData.map((row, filteredIndex) => {
        console.log(`[DEBUG] 行${filteredIndex}の処理開始`);
        console.log(`[DEBUG] 行${filteredIndex}の生データ:`, JSON.stringify(row));

        // 各列の値を取得
        const getDateValue = (index) => (index !== -1 && row[index] !== undefined && row[index] !== null) ? String(row[index]).trim() : null;
        
        // 前々々回指示数の詳細処理
        let threeTimesPreviousValue = null;
        if (threeTimesPreviousReadingColIndex !== -1) {
          const rawValue = row[threeTimesPreviousReadingColIndex];
          console.log(`[DEBUG] 行${filteredIndex}の前々々回指示数 処理:`);
          console.log(`  生の値: ${rawValue}`);
          console.log(`  型: ${typeof rawValue}`);
          console.log(`  値が存在するか: ${rawValue !== undefined && rawValue !== null}`);
          console.log(`  文字列変換: "${String(rawValue)}"`);
          console.log(`  トリム後: "${String(rawValue).trim()}"`);
          console.log(`  空文字チェック: ${String(rawValue).trim() !== ''}`);
          
          if (rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== '') {
            threeTimesPreviousValue = String(rawValue).trim();
            console.log(`[DEBUG] 行${filteredIndex}の前々々回指示数 最終値: "${threeTimesPreviousValue}"`);
          } else {
            console.log(`[DEBUG] 行${filteredIndex}の前々々回指示数は空です`);
          }
        } else {
          console.log(`[DEBUG] 行${filteredIndex}: 前々々回指示数列が存在しないため、値はnull`);
        }

        let readingObject = {
          date: getDateValue(dateColIndex),
          currentReading: getDateValue(currentReadingColIndex),
          previousReading: getDateValue(previousReadingColIndex),
          previousPreviousReading: getDateValue(previousPreviousReadingColIndex),
          threeTimesPrevious: threeTimesPreviousValue,
          usage: getDateValue(usageColIndex),
          status: getDateValue(statusColIndex),
          photoUrl: null
        };

        console.log(`[DEBUG] 行${filteredIndex}の readingObject 完成:`, JSON.stringify(readingObject));

        // コメントから写真URL取得を試行
        try {
          const originalRowIndex = data.findIndex(dataRow => dataRow === row);
          if (originalRowIndex !== -1) {
            const sheetRowNumber = originalRowIndex + 2;
            const currentReadingCell = sheet.getRange(sheetRowNumber, currentReadingColIndex + 1);
            const comment = currentReadingCell.getComment();
            
            console.log(`[DEBUG] 行${filteredIndex} セル(${sheetRowNumber}, ${currentReadingColIndex + 1})のコメント: "${comment}"`);
            
            if (comment && comment.startsWith("写真: ")) {
              readingObject.photoUrl = comment.substring("写真: ".length);
              console.log(`[DEBUG] 行${filteredIndex} 写真URL取得成功: ${readingObject.photoUrl}`);
            }
          }
        } catch (commentError) {
          console.error(`[DEBUG] 行${filteredIndex} コメント取得エラー:`, commentError.message);
        }

        return readingObject;
      });

      console.log(`[DEBUG] 全ての readings 処理完了:`, JSON.stringify(readings));

      // デバッグ情報付きレスポンス作成
      const responseObject = {
        readings: readings,
        debugInfo: {
          detectedHeaders: headers,
          headerCount: headers.length,
          threeTimesPreviousIndex: threeTimesPreviousReadingColIndex,
          threeTimesPreviousExists: threeTimesPreviousReadingColIndex !== -1,
          columnMapping: {
            '物件名': propertyNameColIndex,
            '物件ID': propertyIdColIndex,
            '部屋ID': roomIdColIndex,
            '検針日時': dateColIndex,
            '今回の指示数': currentReadingColIndex,
            '前回指示数': previousReadingColIndex,
            '前々回指示数': previousPreviousReadingColIndex,
            '前々々回指示数': threeTimesPreviousReadingColIndex,
            '今回使用量': usageColIndex,
            '警告フラグ': statusColIndex
          },
          totalDataRows: data.length,
          filteredReadings: readings.length,
          sampleReadingData: readings.length > 0 ? {
            firstReading: readings[0],
            lastReading: readings[readings.length - 1],
            hasThreeTimesPrevious: readings.some(r => r.threeTimesPrevious !== null && r.threeTimesPrevious !== undefined && r.threeTimesPrevious !== ''),
            threeTimesPreviousValues: readings.map(r => r.threeTimesPrevious).filter(v => v !== null && v !== undefined && v !== ''),
            threeTimesPreviousCount: readings.filter(r => r.threeTimesPrevious !== null && r.threeTimesPrevious !== undefined && r.threeTimesPrevious !== '').length
          } : null,
          message: "DEBUG版: この情報はデバッグ用です。threeTimesPreviousIndexが-1の場合、'前々々回指示数'ヘッダーが見つかっていません。",
          timestamp: new Date().toISOString(),
          version: "DEBUG_v1.0"
        }
      };

      console.log(`[DEBUG] 最終レスポンス作成完了:`, JSON.stringify(responseObject));
      
      return ContentService.createTextOutput(JSON.stringify(responseObject))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      console.error("[DEBUG] getMeterReadingsで予期せぬエラー:", error.message, error.stack);
      return ContentService.createTextOutput(JSON.stringify({ 
        error: "検針データの取得中にサーバー側でエラーが発生しました。", 
        details: error.message,
        stack: error.stack,
        version: "DEBUG_v1.0"
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    return ContentService.createTextOutput(JSON.stringify({ 
        error: "無効なアクションです。", 
        expectedActions: ["getProperties", "getRooms", "getMeterReadings"], 
        receivedAction: action, 
        queryString: e.queryString 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
