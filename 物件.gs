function doGet(e) { // ← この名前が重要！
  // 1. 今開いているスプレッドシートを取得します
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // 2. その中の '物件マスタ' という名前のシートを取得します
  const sheet = spreadsheet.getSheetByName('物件マスタ');

  // 3. シートのデータがある範囲全体を取得します
  const data = sheet.getDataRange().getValues();

  // 4. WOFFアプリに返すための物件リストを入れる空の箱（配列）を用意します
  const properties = [];

  // 5. 取得したデータを1行ずつ見ていきます
  //    最初の行 (data[0]) はヘッダーなので、2行目 (i = 1) から処理します
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const propertyId = row[0];   // A列のデータ (物件ID)
    const propertyName = row[1]; // B列のデータ (物件名)

    // 物件IDと物件名をセットにして、properties の箱に追加します
    properties.push({
      id: propertyId,
      name: propertyName
    });
  }

  // 6. 取得した物件リストをJSON形式のテキストにして返します
  //    ContentService.createTextOutput() でテキストデータを作り、
  //    .setMimeType(ContentService.MimeType.JSON) で「これはJSONですよ」と指定します。
  return ContentService.createTextOutput(JSON.stringify(properties))
    .setMimeType(ContentService.MimeType.JSON);
}