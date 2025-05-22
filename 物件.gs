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
  } else if (action == 'getRooms') { // ★★★ 部屋情報を取得する処理を追加 ★★★
    try {
      const propertyId = e.parameter.propertyId;
      if (!propertyId) {
        return ContentService.createTextOutput(JSON.stringify({ error: "'propertyId' パラメータが必要です。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet(); // 物件マスタと同じスプレッドシートと仮定
      const sheetName = '部屋マスタ'; // 部屋マスタのシート名
      const sheet = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' が見つかりません。` }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const data = sheet.getDataRange().getValues();
      const headers = data.shift(); // ヘッダー行を取得
      
      const propertyIdColIndex = headers.indexOf('物件ID');
      const roomIdColIndex = headers.indexOf('部屋ID');
      const roomNameColIndex = headers.indexOf('部屋名');
      const meterIdColIndex = headers.indexOf('メーターID'); // メーターIDの列も取得

      if (propertyIdColIndex === -1 || roomIdColIndex === -1 || roomNameColIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ error: "必要な列（物件ID, 部屋ID, 部屋名）がシート '${sheetName}' に見つかりません。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const rooms = data.filter(row => String(row[propertyIdColIndex]).trim() == String(propertyId).trim())
        .map(row => {
          let roomObject = {
            id: String(row[roomIdColIndex]).trim(),
            name: String(row[roomNameColIndex]).trim(),
            propertyId: String(row[propertyIdColIndex]).trim()
          };
          // メーターIDが存在し、空でない場合のみ追加
          if (meterIdColIndex !== -1 && typeof row[meterIdColIndex] !== 'undefined' && String(row[meterIdColIndex]).trim() !== "") {
            roomObject.meterId = String(row[meterIdColIndex]).trim();
          }
          return roomObject;
        });

      return ContentService.createTextOutput(JSON.stringify(rooms))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      console.error("getRoomsエラー:", error.message, error.stack, e.parameter ? JSON.stringify(e.parameter) : "no params");
      return ContentService.createTextOutput(JSON.stringify({ error: "部屋データ取得中にエラーが発生しました: " + error.toString(), details: error.message }))
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