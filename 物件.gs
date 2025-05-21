function doGet(e) {
  // eオブジェクトとe.parameterの存在を確認
  if (!e || !e.parameter) {
    return ContentService.createTextOutput(JSON.stringify({ error: "リクエストパラメータがありません。" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // actionパラメータを確認
  if (e.parameter.action == 'getProperties') {
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
            id: String(row[0]), 
            name: String(row[1]) // ★★★ 物件名から目印を削除 ★★★
          });
        }
      }
      // ★★★ レスポンス全体から目印を削除し、直接配列を返す ★★★
      return ContentService.createTextOutput(JSON.stringify(properties))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({ error: "物件データ取得中にエラーが発生しました: " + error.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    // actionパラメータが異なる場合や無い場合
    return ContentService.createTextOutput(JSON.stringify({ error: "無効なアクションです。", expectedAction: "getProperties", receivedAction: e.parameter.action, queryString: e.queryString }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}