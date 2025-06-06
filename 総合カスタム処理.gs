// 総合カスタム処理.gs
// 複数のGoogle Apps Scriptファイルの機能を統合したカスタム処理スクリプト

// UI操作を安全に処理するためのグローバルヘルパー関数
function safeAlert(title, message) {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert(title, message, ui.ButtonSet.OK);
  } catch (e) {
    Logger.log(`${title}: ${message}`);
    console.log(`${title}: ${message}`);
  }
}

// --- データ連携.gs の内容 ---
function populateInspectionDataFromMasters() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  const propertyMasterSheetName = '物件マスタ';
  const roomMasterSheetName = '部屋マスタ';
  const inspectionDataSheetName = 'inspection_data';

  const propertyMasterSheet = ss.getSheetByName(propertyMasterSheetName);
  const roomMasterSheet = ss.getSheetByName(roomMasterSheetName);
  const inspectionDataSheet = ss.getSheetByName(inspectionDataSheetName);
  if (!propertyMasterSheet) {
    safeAlert('エラー', `シート「${propertyMasterSheetName}」が見つかりません。`);
    return;
  }
  if (!roomMasterSheet) {
    safeAlert('エラー', `シート「${roomMasterSheetName}」が見つかりません。`);
    return;
  }
  if (!inspectionDataSheet) {
    safeAlert('エラー', `シート「${inspectionDataSheetName}」が見つかりません。`);
    return;
  }

  try {
    // 1. 物件マスタのデータを読み込み、物件IDをキーとするオブジェクトを作成
    const propertyMasterData = propertyMasterSheet.getRange(2, 1, propertyMasterSheet.getLastRow() - 1, 2).getValues();
    const propertyMap = {};
    propertyMasterData.forEach(row => {
      const propertyId = String(row[0]).trim();
      const propertyName = String(row[1]).trim();
      if (propertyId) {
        propertyMap[propertyId] = propertyName;
      }
    });
    Logger.log(`物件マスタ読み込み完了: ${Object.keys(propertyMap).length}件`);

    // 2. inspection_dataシートのヘッダーと既存データを読み込み
    const inspectionDataHeaders = inspectionDataSheet.getRange(1, 1, 1, inspectionDataSheet.getLastColumn()).getValues()[0];
    const inspectionDataRange = inspectionDataSheet.getDataRange();
    const inspectionData = inspectionDataSheet.getLastRow() > 1 ? inspectionDataRange.getValues().slice(1) : [];

    const existingInspectionEntries = new Set();
    const propertyIdColIdxInspection = inspectionDataHeaders.indexOf('物件ID');
    const roomIdColIdxInspection = inspectionDataHeaders.indexOf('部屋ID');    if (propertyIdColIdxInspection === -1 || roomIdColIdxInspection === -1) {
      safeAlert('エラー', `「${inspectionDataSheetName}」シートに「物件ID」または「部屋ID」列が見つかりません。`);
      return;
    }

    inspectionData.forEach(row => {
      const propertyId = String(row[propertyIdColIdxInspection]).trim();
      const roomId = String(row[roomIdColIdxInspection]).trim();
      if (propertyId && roomId) {
        existingInspectionEntries.add(`${propertyId}_${roomId}`);
      }
    });
    Logger.log(`inspection_data既存データ読み込み完了: ${existingInspectionEntries.size}件`);

    // 3. 部屋マスタのデータを処理
    const roomMasterData = roomMasterSheet.getRange(2, 1, roomMasterSheet.getLastRow() - 1, 3).getValues();
    const newRowsToInspectionData = [];
    let addedCount = 0;

    roomMasterData.forEach((row, index) => {
      const roomPropertyId = String(row[0]).trim();
      const roomId = String(row[1]).trim();
      const roomName = String(row[2]).trim();

      if (!roomPropertyId || !roomId) {
        Logger.log(`部屋マスタの ${index + 2} 行目は物件IDまたは部屋IDが空のためスキップします。`);
        return;
      }

      if (!existingInspectionEntries.has(`${roomPropertyId}_${roomId}`)) {
        const propertyName = propertyMap[roomPropertyId] || `物件名不明(${roomPropertyId})`;
        const newRowData = [];
        inspectionDataHeaders.forEach(header => {
          switch (header) {
            case '記録ID': newRowData.push(Utilities.getUuid()); break;
            case '物件名': newRowData.push(propertyName); break;
            case '物件ID': newRowData.push(roomPropertyId); break;
            case '部屋ID': newRowData.push(roomId); break;
            case '部屋名': newRowData.push(roomName); break;
            default: newRowData.push(''); break;
          }
        });
        newRowsToInspectionData.push(newRowData);
        addedCount++;
        Logger.log(`追加対象: 物件ID=${roomPropertyId}, 部屋ID=${roomId}, 物件名=${propertyName}, 部屋名=${roomName}`);
      }
    });    if (newRowsToInspectionData.length > 0) {
      inspectionDataSheet.getRange(inspectionDataSheet.getLastRow() + 1, 1, newRowsToInspectionData.length, newRowsToInspectionData[0].length).setValues(newRowsToInspectionData);
      safeAlert('完了', `${addedCount} 件の新しい部屋情報を「${inspectionDataSheetName}」シートに追加しました。`);
      Logger.log(`${addedCount} 件の新しい部屋情報を「${inspectionDataSheetName}」シートに追加しました。`);
    } else {
      safeAlert('情報', '追加する新しい部屋情報はありませんでした。');
      Logger.log('追加する新しい部屋情報はありませんでした。');
    }

  } catch (e) {
    Logger.log(`エラーが発生しました: ${e.message}\n${e.stack}`);
    safeAlert('スクリプト実行エラー', `データ連携処理中にエラーが発生しました: ${e.message}`);
  }
}

// --- 物件IDフォーマット変更.gs の内容 ---
const PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING = '物件マスタ';
const PROPERTY_ID_COLUMN_INDEX_FOR_FORMATTING = 0;
const HEADER_ROWS_FOR_FORMATTING = 1;

function formatPropertyIdsInPropertyMaster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  const sheet = ss.getSheetByName(PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING);

  if (!sheet) {
    Logger.log(`エラー: "${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}" シートが見つかりません。`);
    safeAlert('エラー', `"${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}" シートが見つかりません。`);
    return;
  }

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  let updatedCount = 0;

  if (values.length <= HEADER_ROWS_FOR_FORMATTING) {
    Logger.log(`"${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}" シートに処理対象のデータがありません。`);
    safeAlert('情報', `"${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}" シートに処理対象のデータがありません。`);
    return;
  }

  try {
    for (let i = HEADER_ROWS_FOR_FORMATTING; i < values.length; i++) {
      const originalValue = values[i][PROPERTY_ID_COLUMN_INDEX_FOR_FORMATTING];
      let numericStringPart = '';
      let needsFormatting = false;

      if (originalValue !== null && originalValue !== '') {
        const valStr = String(originalValue);
        if (valStr.startsWith('P')) {
          numericStringPart = valStr.substring(1);
          if (!isNaN(Number(numericStringPart))) {
            needsFormatting = true;
          } else {
            Logger.log(`行 ${i + 1} (${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}): 値 "${originalValue}" はPで始まりますが、続く部分が数値ではないためスキップします。`);
            continue;
          }
        } else if (!isNaN(Number(valStr))) {
          numericStringPart = valStr;
          needsFormatting = true;
        } else {
          Logger.log(`行 ${i + 1} (${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}): 値 "${originalValue}" は処理対象の形式ではないためスキップします。`);
          continue;
        }

        if (needsFormatting) {
          const numericValue = Number(numericStringPart);
          const formattedId = 'P' + String(numericValue).padStart(6, '0');
          if (valStr !== formattedId) {
            values[i][PROPERTY_ID_COLUMN_INDEX_FOR_FORMATTING] = formattedId;
            updatedCount++;
            Logger.log(`行 ${i + 1} (${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}): "${originalValue}" を "${formattedId}" に更新しました。`);
          }
        }
      }
    }    if (updatedCount > 0) {
      dataRange.setValues(values);
      Logger.log(`${updatedCount} 件の物件IDを「${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}」でフォーマットしました。`);
      safeAlert('完了', `${updatedCount} 件の物件IDを「${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}」でフォーマットしました。`);
    } else {
      Logger.log(`「${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}」で更新対象の物件IDはありませんでした。`);
      safeAlert('情報', `「${PROPERTY_MASTER_SHEET_NAME_FOR_FORMATTING}」で更新対象の物件IDはありませんでした。`);
    }
  } catch (e) {
    Logger.log(`物件IDフォーマット変更処理中にエラーが発生しました: ${e.message}\n${e.stack}`);
    safeAlert('スクリプト実行エラー', `物件IDフォーマット変更処理中にエラーが発生しました: ${e.message}`);
  }
}

// --- 部屋マスタ物件IDフォーマット.gs の内容 ---
const ROOM_MASTER_FORMAT_TARGET_SHEET_NAME = '部屋マスタ';
const PROPERTY_ID_COLUMN_INDEX_IN_ROOM_MASTER_FOR_FORMATTING = 0;
const HEADER_ROWS_IN_ROOM_MASTER_FOR_FORMATTING = 1;

function formatPropertyIdsInRoomMaster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  const sheet = ss.getSheetByName(ROOM_MASTER_FORMAT_TARGET_SHEET_NAME);

  if (!sheet) {
    Logger.log(`エラー: "${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}" シートが見つかりません。`);
    safeAlert('エラー', `"${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}" シートが見つかりません。`);
    return;
  }

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  let updatedCount = 0;

  if (values.length <= HEADER_ROWS_IN_ROOM_MASTER_FOR_FORMATTING) {
    Logger.log(`"${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}" シートに処理対象のデータがありません。`);
    safeAlert('情報', `"${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}" シートに処理対象のデータがありません。`);
    return;
  }

  try {
    for (let i = HEADER_ROWS_IN_ROOM_MASTER_FOR_FORMATTING; i < values.length; i++) {
      const originalValue = values[i][PROPERTY_ID_COLUMN_INDEX_IN_ROOM_MASTER_FOR_FORMATTING];
      if (originalValue === null || originalValue === '') {
        Logger.log(`行 ${i + 1} (${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}): 物件IDが空のためスキップします。`);
        continue;
      }
      const valStr = String(originalValue);
      if (/^P\d{6}$/.test(valStr)) {
        Logger.log(`行 ${i + 1} (${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}): 値 "${originalValue}" は既に正しいP+6桁形式です。`);
        continue;
      }
      let numericPartStr;
      if (valStr.startsWith('P')) {
        numericPartStr = valStr.substring(1);
      } else {
        numericPartStr = valStr;
      }
      if (!isNaN(Number(numericPartStr)) && Number.isInteger(Number(numericPartStr))) {
        const numericValue = Number(numericPartStr);
        const formattedId = 'P' + String(numericValue).padStart(6, '0');
        if (valStr !== formattedId) {
          values[i][PROPERTY_ID_COLUMN_INDEX_IN_ROOM_MASTER_FOR_FORMATTING] = formattedId;
          updatedCount++;
          Logger.log(`行 ${i + 1} (${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}): "${originalValue}" を "${formattedId}" に更新しました。`);
        }
      } else {
        Logger.log(`行 ${i + 1} (${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}): 値 "${originalValue}" は純粋な整数またはP+数値の形式ではないためスキップします。`);
      }
    }    if (updatedCount > 0) {
      dataRange.setValues(values);
      Logger.log(`${updatedCount} 件の物件IDを「${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}」でフォーマットしました。`);
      safeAlert('完了', `${updatedCount} 件の物件IDを「${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}」でフォーマットしました。`);
    } else {
      Logger.log(`「${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}」で更新対象の物件IDはありませんでした。`);
      safeAlert('情報', `「${ROOM_MASTER_FORMAT_TARGET_SHEET_NAME}」で更新対象の物件IDはありませんでした。`);
    }
  } catch (e) {
    Logger.log(`部屋マスタ物件IDフォーマット処理中にエラーが発生しました: ${e.message}\n${e.stack}`);
    safeAlert('スクリプト実行エラー', `部屋マスタ物件IDフォーマット処理中にエラーが発生しました: ${e.message}`);
  }
}

// --- 部屋マスタ整合性チェック.gs の内容 ---
const ROOM_MASTER_SHEET_FOR_CLEANUP = '部屋マスタ';
const PROPERTY_MASTER_SHEET_FOR_CLEANUP = '物件マスタ';
const PROP_ID_COL_ROOM_MASTER_CLEANUP = 0;
const PROP_ID_COL_PROPERTY_MASTER_CLEANUP = 0;
const HEADER_ROWS_CLEANUP = 1;

function cleanUpOrphanedRooms() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  const roomSheet = ss.getSheetByName(ROOM_MASTER_SHEET_FOR_CLEANUP);
  const propertySheet = ss.getSheetByName(PROPERTY_MASTER_SHEET_FOR_CLEANUP);

  if (!roomSheet) {
    Logger.log(`エラー: "${ROOM_MASTER_SHEET_FOR_CLEANUP}" シートが見つかりません。`);
    safeAlert('エラー', `"${ROOM_MASTER_SHEET_FOR_CLEANUP}" シートが見つかりません。`);
    return;
  }
  if (!propertySheet) {
    Logger.log(`エラー: "${PROPERTY_MASTER_SHEET_FOR_CLEANUP}" シートが見つかりません。`);
    safeAlert('エラー', `"${PROPERTY_MASTER_SHEET_FOR_CLEANUP}" シートが見つかりません。`);
    return;
  }

  try {
    const propertyMasterValues = propertySheet.getDataRange().getValues();
    const validPropertyIds = new Set();
    for (let i = HEADER_ROWS_CLEANUP; i < propertyMasterValues.length; i++) {
      const propId = propertyMasterValues[i][PROP_ID_COL_PROPERTY_MASTER_CLEANUP];
      if (propId !== null && String(propId).trim() !== '') {
        validPropertyIds.add(String(propId).trim());
      }
    }    if (validPropertyIds.size === 0) {
      Logger.log(`"${PROPERTY_MASTER_SHEET_FOR_CLEANUP}" シートに有効な物件IDが見つかりませんでした。`);
      safeAlert('情報', `"${PROPERTY_MASTER_SHEET_FOR_CLEANUP}" シートに有効な物件IDが見つかりませんでした。`);
      return;
    }
    Logger.log(`"${PROPERTY_MASTER_SHEET_FOR_CLEANUP}" から ${validPropertyIds.size} 件の有効な物件IDを読み込みました。`);

    const roomSheetValues = roomSheet.getDataRange().getValues();
    let deletedRowCount = 0;

    for (let i = roomSheetValues.length - 1; i >= HEADER_ROWS_CLEANUP; i--) {
      const propertyIdInRoomCell = roomSheetValues[i][PROP_ID_COL_ROOM_MASTER_CLEANUP];
      if (propertyIdInRoomCell === null || String(propertyIdInRoomCell).trim() === '') {
        Logger.log(`行 ${i + 1} (${ROOM_MASTER_SHEET_FOR_CLEANUP}): 物件IDが空のためスキップします。`);
        continue;
      }
      const propertyIdInRoom = String(propertyIdInRoomCell).trim();
      if (!validPropertyIds.has(propertyIdInRoom)) {
        Logger.log(`行 ${i + 1} (${ROOM_MASTER_SHEET_FOR_CLEANUP}): 物件ID "${propertyIdInRoom}" は "${PROPERTY_MASTER_SHEET_FOR_CLEANUP}" に存在しません。この行を削除します。`);
        roomSheet.deleteRow(i + 1);
        deletedRowCount++;
      }
    }    if (deletedRowCount > 0) {
      Logger.log(`${deletedRowCount} 件の行を「${ROOM_MASTER_SHEET_FOR_CLEANUP}」から削除しました。`);
      safeAlert('完了', `${deletedRowCount} 件の孤立した部屋情報を「${ROOM_MASTER_SHEET_FOR_CLEANUP}」から削除しました。`);
    } else {
      Logger.log(`「${ROOM_MASTER_SHEET_FOR_CLEANUP}」に孤立した部屋情報はありませんでした。`);
      safeAlert('情報', `「${ROOM_MASTER_SHEET_FOR_CLEANUP}」に孤立した部屋情報はありませんでした。`);
    }
  } catch (e) {
    Logger.log(`部屋マスタ整合性チェック処理中にエラーが発生しました: ${e.message}\n${e.stack}`);
    safeAlert('スクリプト実行エラー', `部屋マスタ整合性チェック処理中にエラーが発生しました: ${e.message}`);
  }
}

// --- 検針データ保存.gs の内容 ---
function processInspectionDataMonthly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  const sourceSheetName = "inspection_data";
  const sourceSheet = ss.getSheetByName(sourceSheetName);

  if (!sourceSheet) {
    safeAlert('エラー', `シート "${sourceSheetName}" が見つかりません。`);
    return;
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const newSheetName = `${year}年${month}月`;

    let targetSheet = ss.getSheetByName(newSheetName);
    if (targetSheet) {
      try {
        const ui = SpreadsheetApp.getUi();
        const response = ui.alert(
          '確認',
          `シート "${newSheetName}" は既に存在します。上書きしますか？\n（「いいえ」を選択すると処理を中断します）`,
          ui.ButtonSet.YES_NO
        );
        if (response == ui.Button.NO || response == ui.Button.CLOSE) {
          safeAlert('情報', '処理を中断しました。');
          Logger.log(`シート "${newSheetName}" が既に存在するため、ユーザーが処理を中断しました。`);
          return;
        }
      } catch (e) {
        // UIが使用できない場合は、既存シートを削除して続行
        Logger.log(`UIが使用できません。既存のシート "${newSheetName}" を削除して続行します。`);
      }
      ss.deleteSheet(targetSheet);
      Logger.log(`既存のシート "${newSheetName}" を削除しました。`);
    }
    targetSheet = ss.insertSheet(newSheetName);
    Logger.log(`新しいシート "${newSheetName}" を作成しました。`);

    const sourceDataRange = sourceSheet.getDataRange();
    const sourceValues = sourceDataRange.getValues();
    const sourceHeaders = sourceValues[0];

    const columnsToCopy = [
      "記録ID", "物件名", "物件ID", "部屋ID", "部屋名",
      "検針日時", "今回使用量", "今回の指示数", "前回指示数", "写真URL"
    ];
    const columnIndicesToCopy = columnsToCopy.map(header => sourceHeaders.indexOf(header));    if (columnIndicesToCopy.some(index => index === -1)) {
      const missingColumns = columnsToCopy.filter((_, i) => columnIndicesToCopy[i] === -1);
      safeAlert('エラー', `必要な列が見つかりません: ${missingColumns.join(", ")}`);
      if (ss.getSheetByName(newSheetName)) {
        ss.deleteSheet(ss.getSheetByName(newSheetName));
      }
      return;
    }

    const dataToCopyToNewSheet = sourceValues.map(row => {
      return columnIndicesToCopy.map(index => row[index]);
    });
    targetSheet.getRange(1, 1, dataToCopyToNewSheet.length, dataToCopyToNewSheet[0].length).setValues(dataToCopyToNewSheet);
    if (dataToCopyToNewSheet.length > 0) {
      targetSheet.getRange(1, 1, dataToCopyToNewSheet.length, dataToCopyToNewSheet[0].length).createFilter();
    }    safeAlert('完了', `データがシート "${newSheetName}" にコピーされ、フィルタが設定されました。`);
    Logger.log(`データがシート "${newSheetName}" にコピーされ、フィルタが設定されました。`);

    const currentReadingIndex = sourceHeaders.indexOf("今回の指示数");
    const previousReadingIndex = sourceHeaders.indexOf("前回指示数");
    const prevPrevReadingIndex = sourceHeaders.indexOf("前々回指示数");
    const threeTimesPreviousReadingIndex = sourceHeaders.indexOf("前々々回指示数");
    const photoUrlIndex = sourceHeaders.indexOf("写真URL");

    if ([currentReadingIndex, previousReadingIndex, prevPrevReadingIndex, threeTimesPreviousReadingIndex, photoUrlIndex].some(index => index === -1)) {
      safeAlert('エラー', "指示数関連の列または写真URL列のいずれかが見つかりません。");
      return;
    }

    for (let i = 1; i < sourceValues.length; i++) {
      const row = sourceValues[i];
      sourceSheet.getRange(i + 1, threeTimesPreviousReadingIndex + 1).setValue(row[prevPrevReadingIndex]);
      sourceSheet.getRange(i + 1, prevPrevReadingIndex + 1).setValue(row[previousReadingIndex]);
      sourceSheet.getRange(i + 1, previousReadingIndex + 1).setValue(row[currentReadingIndex]);
      sourceSheet.getRange(i + 1, currentReadingIndex + 1).setValue("");
      sourceSheet.getRange(i + 1, photoUrlIndex + 1).setValue("");    }
    safeAlert('完了', `シート "${sourceSheetName}" の指示数データと写真URLが更新されました。`);
    Logger.log(`シート "${sourceSheetName}" の指示数データと写真URLが更新されました。`);

  } catch (e) {
    Logger.log(`検針データ保存処理中にエラーが発生しました: ${e.message}\n${e.stack}`);
    safeAlert('スクリプト実行エラー', `検針データ保存処理中にエラーが発生しました: ${e.message}`);
  }
}

// --- 0.登録用スクリプト.gs の内容 ---
// スプレッドシートIDを安全に取得する関数
function getSpreadsheetId() {
  try {
    const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSpreadsheet) {
      return activeSpreadsheet.getId();
    } else {
      Logger.log('警告: アクティブなスプレッドシートが見つかりません');
      return null;
    }
  } catch (e) {
    Logger.log(`スプレッドシートID取得エラー: ${e.message}`);
    return null;
  }
}

const SPREADSHEET_ID = getSpreadsheetId();
const PROPERTY_MASTER_SHEET_NAME = '物件マスタ';
const ROOM_MASTER_SHEET_NAME = '部屋マスタ';
const INSPECTION_DATA_SHEET_NAME = 'inspection_data';

const INSPECTION_DATA_HEADERS = [
  '記録ID', '物件名', '物件ID', '部屋ID', '部屋名',
  '検針日時', '警告フラグ', '標準偏差値', '今回使用量',
  '今回の指示数', '前回指示数', '前々回指示数', '前々々回指示数', '写真URL'
];

function createInitialInspectionData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('エラー: アクティブなスプレッドシートが見つかりません');
    safeAlert('エラー', 'アクティブなスプレッドシートが見つかりません');
    return;
  }
  const propertyMasterSheet = ss.getSheetByName(PROPERTY_MASTER_SHEET_NAME);
  const roomMasterSheet = ss.getSheetByName(ROOM_MASTER_SHEET_NAME);
  let inspectionDataSheet = ss.getSheetByName(INSPECTION_DATA_SHEET_NAME);

  if (!propertyMasterSheet) {
    safeAlert('エラー', `"${PROPERTY_MASTER_SHEET_NAME}" シートが見つかりません。`);
    return;
  }
  if (!roomMasterSheet) {
    safeAlert('エラー', `"${ROOM_MASTER_SHEET_NAME}" シートが見つかりません。`);
    return;
  }

  try {
    if (!inspectionDataSheet) {
      inspectionDataSheet = ss.insertSheet(INSPECTION_DATA_SHEET_NAME);
      Logger.log(`"${INSPECTION_DATA_SHEET_NAME}" シートを新規作成しました。`);
    }

    const headerRange = inspectionDataSheet.getRange(1, 1, 1, INSPECTION_DATA_HEADERS.length);
    if (headerRange.getValues()[0].join('') === '') {
      headerRange.setValues([INSPECTION_DATA_HEADERS]);
      Logger.log(`"${INSPECTION_DATA_SHEET_NAME}" にヘッダーを設定しました。`);
    }

    const existingRoomIds = new Set();
    const inspectionDataValues = inspectionDataSheet.getDataRange().getValues();
    if (inspectionDataValues.length > 1) {
      const roomIdColIndex = INSPECTION_DATA_HEADERS.indexOf('部屋ID');
      for (let i = 1; i < inspectionDataValues.length; i++) {
        const roomId = String(inspectionDataValues[i][roomIdColIndex]).trim();
        if (roomId) {
          existingRoomIds.add(roomId);
        }
      }
    }
    Logger.log('既存の部屋ID (inspection_dataより): ' + JSON.stringify(Array.from(existingRoomIds)));

    const propertyData = propertyMasterSheet.getDataRange().getValues();
    const propertyMap = {};
    if (propertyData.length > 1) {
      for (let i = 1; i < propertyData.length; i++) {
        const propertyId = String(propertyData[i][0]).trim();
        const propertyName = String(propertyData[i][1]).trim();
        if (propertyId && propertyName) {
          propertyMap[propertyId] = propertyName;
        }
      }
    }
    Logger.log('物件マスタデータ: ' + JSON.stringify(propertyMap));

    const roomData = roomMasterSheet.getDataRange().getValues();
    const newInspectionEntries = [];

    if (roomData.length > 1) {
      for (let i = 1; i < roomData.length; i++) {
        const roomPropertyId = String(roomData[i][0]).trim();
        const roomId = String(roomData[i][1]).trim();
        const roomName = String(roomData[i][2]).trim();

        if (roomPropertyId && roomId && !existingRoomIds.has(roomId)) {
          const propertyName = propertyMap[roomPropertyId] || `物件名不明(${roomPropertyId})`;
          const newEntry = [];
          INSPECTION_DATA_HEADERS.forEach(header => {
            switch (header) {
              case '記録ID': newEntry.push(Utilities.getUuid()); break;
              case '物件名': newEntry.push(propertyName); break;
              case '物件ID': newEntry.push(roomPropertyId); break;
              case '部屋ID': newEntry.push(roomId); break;
              case '部屋名': newEntry.push(roomName); break;
              default: newEntry.push(''); break;
            }
          });
          newInspectionEntries.push(newEntry);
          Logger.log(`新規追加対象: 物件ID=${roomPropertyId}, 部屋ID=${roomId}, 物件名=${propertyName}, 部屋名=${roomName}`);
        }
      }
    }    if (newInspectionEntries.length > 0) {
      const startRow = inspectionDataSheet.getLastRow() + 1;
      inspectionDataSheet.getRange(startRow, 1, newInspectionEntries.length, newInspectionEntries[0].length).setValues(newInspectionEntries);
      safeAlert('完了', `${newInspectionEntries.length} 件の新しい部屋情報を「${INSPECTION_DATA_SHEET_NAME}」に追加しました。`);
      Logger.log(`${newInspectionEntries.length} 件の新しい部屋情報を「${INSPECTION_DATA_SHEET_NAME}」に追加しました。`);
    } else {
      safeAlert('情報', '追加する新しい部屋情報はありませんでした。');
      Logger.log('追加する新しい部屋情報はありませんでした。');
    }

  } catch (e) {
    Logger.log(`初期検針データ作成処理中にエラーが発生しました: ${e.message}\n${e.stack}`);
    safeAlert('スクリプト実行エラー', `初期検針データ作成処理中にエラーが発生しました: ${e.message}`);
  }
}

// --- 統合された onOpen 関数 ---
function onOpen() {
  // スプレッドシートが開かれた時に自動実行される関数
  try {
    Logger.log('📋 onOpen関数が実行されました');
    
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('総合カスタム処理');

    menu.addItem('1. 初期検針データ作成 ', 'createInitialInspectionData');
    menu.addItem('2. マスタから検針データへ物件・部屋反映', 'populateInspectionDataFromMasters');
    menu.addSeparator();
    menu.addItem('3. 物件マスタの物件IDフォーマット', 'formatPropertyIdsInPropertyMaster');
    menu.addItem('4. 部屋マスタの物件IDフォーマット', 'formatPropertyIdsInRoomMaster');
    menu.addSeparator();
    menu.addItem('5. 部屋マスタの孤立データ削除 (整合性チェック)', 'cleanUpOrphanedRooms');
    menu.addSeparator();
    menu.addItem('6. 月次検針データ保存とリセット', 'processInspectionDataMonthly');

    menu.addToUi();
    Logger.log('✅ 総合カスタム処理メニューが正常に作成されました');
  } catch (e) {
    Logger.log(`❌ onOpen関数内でメニュー作成エラー: ${e.message}`);
    Logger.log(`📋 詳細: ${e.stack}`);
  }
}

// 安全なメニュー作成関数（手動実行およびデバッグ用）
function createCustomMenu() {
  try {
    Logger.log('🔄 createCustomMenu関数が実行されました');
    
    // コンテキストチェック
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      Logger.log('❌ アクティブなスプレッドシートが見つかりません');
      Logger.log('💡 対処法1: スプレッドシートを開いてから実行してください');
      Logger.log('💡 対処法2: setupMenuTrigger()関数を実行してトリガーを設定してください');
      return 'エラー: スプレッドシートコンテキストなし';
    }

    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('総合カスタム処理');

    menu.addItem('1. 初期検針データ作成 (部屋マスタから)', 'createInitialInspectionData');
    menu.addItem('2. マスタから検針データへ新規部屋反映', 'populateInspectionDataFromMasters');
    menu.addSeparator();
    menu.addItem('3. 物件マスタの物件IDフォーマット', 'formatPropertyIdsInPropertyMaster');
    menu.addItem('4. 部屋マスタの物件IDフォーマット', 'formatPropertyIdsInRoomMaster');
    menu.addSeparator();
    menu.addItem('5. 部屋マスタの孤立データ削除 (整合性チェック)', 'cleanUpOrphanedRooms');
    menu.addSeparator();
    menu.addItem('6. 月次検針データ保存とリセット', 'processInspectionDataMonthly');

    menu.addToUi();
    Logger.log('✅ 総合カスタム処理メニューが正常に作成されました');
    safeAlert('完了', '総合カスタム処理メニューが作成されました。スプレッドシートのメニューバーを確認してください。');
    return '成功: メニュー作成完了';
  } catch (e) {
    Logger.log(`❌ メニュー作成エラー: ${e.message}`);
    Logger.log(`📋 詳細: ${e.stack}`);
    Logger.log('💡 注意: この関数はスプレッドシートのコンテキストから実行する必要があります');
    Logger.log('💡 推奨: setupMenuTrigger()関数を実行してください');
    return `エラー: ${e.message}`;
  }
}

// スクリプトエディタから安全に実行できるメニュー作成用の情報表示関数
function setupMenuTrigger() {
  try {
    Logger.log('📋 Google Apps Scriptのトリガー設定について');
    Logger.log('');
    Logger.log('⚠️  注意: onOpenトリガーは自動的に動作します');
    Logger.log('🔧 現在のスクリプトには既にonOpen関数が含まれています');
    Logger.log('');
    Logger.log('✅ 以下の手順でカスタムメニューを表示してください:');
    Logger.log('1. このGoogle Apps Scriptプロジェクトが関連付けられたスプレッドシートを開く');
    Logger.log('2. スプレッドシートを再読み込み（F5キー）する');
    Logger.log('3. メニューバーに「総合カスタム処理」が自動表示される');
    Logger.log('');
    Logger.log('🔍 既存のトリガーを確認します...');
    
    // 既存のトリガーを確認
    const triggers = ScriptApp.getProjectTriggers();
    Logger.log(`📊 現在設定されているトリガー数: ${triggers.length}`);
    
    triggers.forEach((trigger, index) => {
      const handlerFunction = trigger.getHandlerFunction();
      const eventType = trigger.getEventType();
      Logger.log(`${index + 1}. 関数: ${handlerFunction}, イベント: ${eventType}`);
    });
    
    Logger.log('');
    Logger.log('💡 もしメニューが表示されない場合:');
    Logger.log('   - ブラウザのキャッシュをクリア');
    Logger.log('   - 別のブラウザで試す');
    Logger.log('   - checkSpreadsheetInfo()関数で診断を実行');
    
    return 'トリガー情報確認完了';
  } catch (e) {
    Logger.log(`❌ 情報確認エラー: ${e.message}`);
    Logger.log(`📋 詳細: ${e.stack}`);
    return `エラー: ${e.message}`;
  }
}

// スプレッドシートの情報を確認する診断関数（スクリプトエディタから安全に実行可能）
function checkSpreadsheetInfo() {
  try {
    // 現在のプロジェクトに関連付けられたスプレッドシートを探す
    const files = DriveApp.getFiles();
    let spreadsheetFound = false;
    
    while (files.hasNext()) {
      const file = files.next();
      if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
        try {
          const spreadsheet = SpreadsheetApp.openById(file.getId());
          const script = spreadsheet.getScriptId();
          
          if (script) {
            Logger.log(`📊 発見されたスプレッドシート: ${file.getName()}`);
            Logger.log(`🔗 URL: ${file.getUrl()}`);
            Logger.log(`📝 ID: ${file.getId()}`);
            spreadsheetFound = true;
            break;
          }
        } catch (e) {
          // このスプレッドシートはスクリプトが関連付けられていない
        }
      }
    }
    
    if (!spreadsheetFound) {
      Logger.log('❌ スクリプトに関連付けられたスプレッドシートが見つかりません');
      Logger.log('💡 対処法: 新しいGoogle Sheetsを作成し、拡張機能 > Apps Script でこのスクリプトを貼り付けてください');
    }
    
    return spreadsheetFound ? 'スプレッドシート発見' : 'スプレッドシート未発見';
  } catch (e) {
    Logger.log(`診断エラー: ${e.message}`);
    return `エラー: ${e.message}`;
  }
}

// onOpenトリガー用のメニュー作成関数
function createCustomMenuOnOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('総合カスタム処理');

    menu.addItem('1. 初期検針データ作成 (部屋マスタから)', 'createInitialInspectionData');
    menu.addItem('2. マスタから検針データへ新規部屋反映', 'populateInspectionDataFromMasters');
    menu.addSeparator();
    menu.addItem('3. 物件マスタの物件IDフォーマット', 'formatPropertyIdsInPropertyMaster');
    menu.addItem('4. 部屋マスタの物件IDフォーマット', 'formatPropertyIdsInRoomMaster');
    menu.addSeparator();
    menu.addItem('5. 部屋マスタの孤立データ削除 (整合性チェック)', 'cleanUpOrphanedRooms');
    menu.addSeparator();
    menu.addItem('6. 月次検針データ保存とリセット', 'processInspectionDataMonthly');

    menu.addToUi();
    Logger.log('総合カスタム処理メニューが正常に作成されました。');
  } catch (e) {
    Logger.log(`onOpenメニュー作成エラー: ${e.message}`);
  }
}

// onEditトリガー対応のメニュー自動作成（より安全）
function onEdit(e) {
  // 編集イベント発生時に1回だけメニュー作成を試行
  try {
    const properties = PropertiesService.getDocumentProperties();
    const menuCreated = properties.getProperty('customMenuCreated');
    
    if (!menuCreated) {
      // まだメニューが作成されていない場合のみ実行
      setTimeout(() => {
        try {
          createCustomMenu();
          properties.setProperty('customMenuCreated', 'true');
        } catch (e) {
          Logger.log(`onEdit内でのメニュー作成に失敗: ${e.message}`);
        }
      }, 1000); // 1秒遅延して実行
    }
  } catch (e) {
    // エラーが発生してもonEditの処理は継続
    Logger.log(`onEdit関数内でエラーが発生: ${e.message}`);
  }
}

// 直接的なメニュー作成のための簡単な指示関数
function showMenuInstructions() {
  Logger.log('🎯 総合カスタム処理メニューを表示する方法');
  Logger.log('');
  Logger.log('✅ 最も簡単な方法:');
  Logger.log('1. このスクリプトが含まれているGoogle Sheetsを開く');
  Logger.log('2. スプレッドシートで「拡張機能」→「Apps Script」を選択');
  Logger.log('3. 関数選択で「forceCreateMenu」を選び、実行ボタンをクリック');
  Logger.log('4. スプレッドシートに戻ると「総合カスタム処理」メニューが表示される');
  Logger.log('');
  Logger.log('🔄 または、スプレッドシートを再読み込み（F5）すれば自動的にメニューが表示されます');
  
  return '手順説明完了';
}

// スプレッドシートのコンテキストで強制的にメニューを作成
function forceCreateMenu() {
  try {
    Logger.log('🔄 強制メニュー作成を開始します...');
    
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('総合カスタム処理');

    menu.addItem('1. 初期検針データ作成 (部屋マスタから)', 'createInitialInspectionData');
    menu.addItem('2. マスタから検針データへ新規部屋反映', 'populateInspectionDataFromMasters');
    menu.addSeparator();
    menu.addItem('3. 物件マスタの物件IDフォーマット', 'formatPropertyIdsInPropertyMaster');
    menu.addItem('4. 部屋マスタの物件IDフォーマット', 'formatPropertyIdsInRoomMaster');
    menu.addSeparator();
    menu.addItem('5. 部屋マスタの孤立データ削除 (整合性チェック)', 'cleanUpOrphanedRooms');
    menu.addSeparator();
    menu.addItem('6. 月次検針データ保存とリセット', 'processInspectionDataMonthly');

    menu.addToUi();
    
    Logger.log('✅ 総合カスタム処理メニューが正常に作成されました！');
    Logger.log('📋 スプレッドシートのメニューバーを確認してください');
      // Toastメッセージでユーザーに通知
    try {
      const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSpreadsheet) {
        activeSpreadsheet.toast(
          '総合カスタム処理メニューが作成されました！メニューバーを確認してください。', 
          '成功', 
          5
        );
      }
    } catch (toastError) {
      Logger.log(`Toast通知エラー: ${toastError.message}`);
    }
    
    return '成功: メニュー作成完了';
  } catch (e) {
    Logger.log(`❌ 強制メニュー作成エラー: ${e.message}`);
    Logger.log(`📋 詳細: ${e.stack}`);    // エラーの場合もToastで通知
    try {
      const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSpreadsheet) {
        activeSpreadsheet.toast(
          `メニュー作成エラー: ${e.message}`, 
          'エラー', 
          5
        );
      }
    } catch (toastError) {
      Logger.log(`Toast通知エラー: ${toastError.message}`);
    }
    
    return `エラー: ${e.message}`;
  }
}