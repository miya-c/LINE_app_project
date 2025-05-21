/*
// filepath: /Users/miya/Documents/GitHub/LINE_app_project/部屋.gs
function doGet(e) {
  // eオブジェクトとe.parameterの存在を確認
  if (!e || !e.parameter) {
    return ContentService.createTextOutput(JSON.stringify({ error: "リクエストパラメータがありません。" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // actionパラメータとpropertyIdパラメータを確認
  if (e.parameter.action == 'getRooms' && e.parameter.propertyId) {
    try {
      const propertyId = e.parameter.propertyId;
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName('部屋マスタ'); // シート名を確認

      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ error: "シート '部屋マスタ' が見つかりません。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const data = sheet.getDataRange().getValues();
      const rooms = [];
      // ヘッダー行 (1行目) をスキップするため、i = 1 から開始
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        // A列(インデックス0)が物件ID、B列(インデックス1)が部屋ID、C列(インデックス2)が部屋名と仮定
        // 物件IDが一致し、部屋IDと部屋名が存在する場合のみ
        if (row[0] && String(row[0]) === propertyId && row[1] && row[2]) { 
          rooms.push({ 
            id: String(row[1]),      // 部屋ID
            name: String(row[2]),    // 部屋名
            propertyId: String(row[0]) // 参考として物件IDも保持
          });
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify(rooms))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({ error: "部屋データ取得中にエラーが発生しました: " + error.toString(), propertyId: e.parameter.propertyId }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    // actionパラメータが異なる場合や無い場合、またはpropertyIdが無い場合
    let errorMsg = "無効なアクションまたはパラメータが不足しています。";
    if (!e.parameter.action) {
      errorMsg += " 'action'パラメータが必要です。";
    }
    if (e.parameter.action && e.parameter.action !== 'getRooms') {
      errorMsg += " 'action'パラメータは'getRooms'である必要があります。";
    }
    if (!e.parameter.propertyId) {
      errorMsg += " 'propertyId'パラメータが必要です。";
    }
    return ContentService.createTextOutput(JSON.stringify({ 
        error: errorMsg, 
        expectedAction: "getRooms", 
        receivedAction: e.parameter.action, 
        propertyIdProvided: !!e.parameter.propertyId,
        queryString: e.queryString 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/
