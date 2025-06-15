/**
 * dialog_functions.gs - ダイアログ表示関数
 * HTML ダイアログの表示を管理する関数群
 */

/**
 * 物件選択ダイアログを表示
 */
function showPropertySelectDialog() {
  if (!isUiAvailable()) {
    throw new Error('この関数はスプレッドシートのメニューから実行してください。スクリプトエディタからの直接実行はサポートされていません。');
  }
  
  try {
    const htmlOutput = HtmlService.createTemplateFromFile('property_select_gas');
    const html = htmlOutput.evaluate()
      .setWidth(800)
      .setHeight(600)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    SpreadsheetApp.getUi().showModalDialog(html, '物件選択');
  } catch (error) {
    console.error('[showPropertySelectDialog] エラー:', error);
    if (!isUiAvailable()) {
      return showExecutionGuidance();
    }
    throw new Error('物件選択ダイアログの表示に失敗しました: ' + error.message);
  }
}

/**
 * 部屋選択ダイアログを表示
 * @param {string} propertyId - 物件ID
 * @param {string} propertyName - 物件名
 */
function openRoomSelectDialog(propertyId, propertyName) {
  if (!isUiAvailable()) {
    throw new Error('この関数はスプレッドシートのメニューから実行してください。スクリプトエディタからの直接実行はサポートされていません。');
  }
  
  try {
    console.log('[openRoomSelectDialog] 開始 - propertyId:', propertyId, 'propertyName:', propertyName);
    
    // 部屋データを取得
    const rooms = getRooms(propertyId);
    
    const htmlOutput = HtmlService.createTemplateFromFile('room_select_gas');
    
    // テンプレートに変数を渡す
    htmlOutput.propertyId = propertyId;
    htmlOutput.propertyName = propertyName;
    htmlOutput.rooms = JSON.stringify(rooms); // JSONエンコード
    
    const html = htmlOutput.evaluate()
      .setWidth(800)
      .setHeight(600)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    SpreadsheetApp.getUi().showModalDialog(html, `部屋選択 - ${propertyName}`);
  } catch (error) {
    console.error('[openRoomSelectDialog] エラー:', error);
    if (!isUiAvailable()) {
      return showExecutionGuidance();
    }
    throw new Error('部屋選択ダイアログの表示に失敗しました: ' + error.message);
  }
}

/**
 * 検針入力ダイアログを表示
 * @param {string} propertyId - 物件ID
 * @param {string} propertyName - 物件名
 * @param {string} roomId - 部屋ID
 * @param {string} roomName - 部屋名
 */
function openMeterReadingDialog(propertyId, propertyName, roomId, roomName) {
  if (!isUiAvailable()) {
    throw new Error('この関数はスプレッドシートのメニューから実行してください。スクリプトエディタからの直接実行はサポートされていません。');
  }
  
  try {
    console.log('[openMeterReadingDialog] 開始');
    console.log('- propertyId:', propertyId);
    console.log('- propertyName:', propertyName);
    console.log('- roomId:', roomId);
    console.log('- roomName:', roomName);
    
    // 検針データを事前に取得
    const meterReadings = getMeterReadings(propertyId, roomId);
    
    const htmlOutput = HtmlService.createTemplateFromFile('meter_reading_gas');
    
    // テンプレートに変数を渡す
    htmlOutput.propertyId = propertyId;
    htmlOutput.propertyName = propertyName;
    htmlOutput.roomId = roomId;
    htmlOutput.roomName = roomName;
    htmlOutput.meterReadings = JSON.stringify(meterReadings); // JSONエンコード
    
    const html = htmlOutput.evaluate()
      .setWidth(900)
      .setHeight(700)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    SpreadsheetApp.getUi().showModalDialog(html, `検針情報 - ${propertyName} ${roomName}`);
  } catch (error) {
    console.error('[openMeterReadingDialog] エラー:', error);
    if (!isUiAvailable()) {
      return showExecutionGuidance();
    }
    throw new Error('検針ダイアログの表示に失敗しました: ' + error.message);
  }
}
