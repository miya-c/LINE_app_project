/*
// filepath: /Users/miya/Documents/GitHub/LINE_app_project/部屋.gs
function doGet(e) {
  try {
    // パラメータの存在チェック
    if (!e || !e.parameter) {
      return ContentService.createTextOutput(JSON.stringify({ error: "リクエストパラメータがありません。" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const action = e.parameter.action;
    const propertyId = e.parameter.propertyId;

    // アクションが 'getRooms' で、propertyId が存在する場合のみ部屋情報を返す
    if (action === 'getRooms' && propertyId) {
      const spreadsheetId = 'ここに部屋マスタのスプレッドシートIDを入力してください'; // ★★★ あなたの「部屋マスタ」スプレッドシートのIDに置き換えてください ★★★
      const sheetName = '部屋マスタ'; // 実際のシート名に合わせてください

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet(); // または SpreadsheetApp.openById(spreadsheetId);
      const sheet = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ error: `シート '${sheetName}' が見つかりません。` }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const data = sheet.getDataRange().getValues();
      const headers = data.shift(); 
      
      const propertyIdColIndex = headers.indexOf('物件ID');
      const roomIdColIndex = headers.indexOf('部屋ID');
      const roomNameColIndex = headers.indexOf('部屋名');
      const meterIdColIndex = headers.indexOf('メーターID'); // メーターIDの列も取得

      if (propertyIdColIndex === -1 || roomIdColIndex === -1 || roomNameColIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ error: "必要な列（物件ID, 部屋ID, 部屋名）がシートに見つかりません。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const rooms = data.filter(row => String(row[propertyIdColIndex]).trim() == String(propertyId).trim())
        .map(row => {
          let roomObject = {
            id: String(row[roomIdColIndex]).trim(),
            name: String(row[roomNameColIndex]).trim(),
            propertyId: String(row[propertyIdColIndex]).trim() // 物件IDも念のため追加
          };
          // メーターIDが存在し、空でない場合のみ追加
          if (meterIdColIndex !== -1 && typeof row[meterIdColIndex] !== 'undefined' && String(row[meterIdColIndex]).trim() !== "") {
            roomObject.meterId = String(row[meterIdColIndex]).trim();
          }
          return roomObject;
        });

      return ContentService.createTextOutput(JSON.stringify(rooms))
        .setMimeType(ContentService.MimeType.JSON);

    } else {
      // 無効なアクションまたはパラメータが不足している場合のエラー
      let errorPayload = {
        error: "無効なリクエストです。",
        details: "期待するアクションは 'getRooms' で、'propertyId' パラメータが必要です。",
        receivedAction: action,
        receivedPropertyId: propertyId
      };
      return ContentService.createTextOutput(JSON.stringify(errorPayload))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (err) {
    console.error("doGetエラー (部屋.gs):", err.message, err.stack, e && e.parameter ? JSON.stringify(e.parameter) : "no params");
    return ContentService.createTextOutput(JSON.stringify({ error: "サーバー内部エラーが発生しました。", details: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/
