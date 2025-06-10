/**
 * GAS HTML Dialog Functions
 * Google Apps Script対応のダイアログ表示関数群
 */

/**
 * 物件選択ダイアログを表示
 */
function showPropertySelectDialog() {
  try {
    const htmlOutput = HtmlService.createTemplateFromFile('property_select_gas');
    const html = htmlOutput.evaluate()
      .setWidth(800)
      .setHeight(600)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    SpreadsheetApp.getUi().showModalDialog(html, '物件選択');
  } catch (error) {
    console.error('[showPropertySelectDialog] エラー:', error);
    throw new Error('物件選択ダイアログの表示に失敗しました: ' + error.message);
  }
}

/**
 * 部屋選択ダイアログを表示
 * @param {string} propertyId - 物件ID
 * @param {string} propertyName - 物件名
 */
function openRoomSelectDialog(propertyId, propertyName) {
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
    throw new Error('検針ダイアログの表示に失敗しました: ' + error.message);
  }
}

/**
 * 物件一覧を取得
 * @return {Array} 物件一覧
 */
function getProperties() {
  try {
    console.log('[getProperties] 物件一覧取得開始');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const propertySheet = ss.getSheetByName('property_master');
    
    if (!propertySheet) {
      throw new Error('property_masterシートが見つかりません');
    }
    
    const data = propertySheet.getDataRange().getValues();
    const headers = data[0];
    const properties = [];
    
    // ヘッダー行をスキップして処理
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const property = {};
      
      headers.forEach((header, index) => {
        property[header] = row[index];
      });
      
      // 物件IDと物件名が存在する場合のみ追加
      if (property['物件ID'] && property['物件名']) {
        properties.push({
          id: property['物件ID'],
          name: property['物件名'],
          completionDate: property['検針完了日'] || ''
        });
      }
    }
    
    console.log('[getProperties] 取得した物件数:', properties.length);
    return properties;
    
  } catch (error) {
    console.error('[getProperties] エラー:', error);
    throw new Error('物件一覧の取得に失敗しました: ' + error.message);
  }
}

/**
 * 指定物件の部屋一覧を取得
 * @param {string} propertyId - 物件ID
 * @return {Array} 部屋一覧
 */
function getRooms(propertyId) {
  try {
    console.log('[getRooms] 部屋一覧取得開始 - propertyId:', propertyId);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const roomSheet = ss.getSheetByName('room_master');
    
    if (!roomSheet) {
      throw new Error('room_masterシートが見つかりません');
    }
    
    const data = roomSheet.getDataRange().getValues();
    const headers = data[0];
    const rooms = [];
    
    // ヘッダー行をスキップして処理
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const room = {};
      
      headers.forEach((header, index) => {
        room[header] = row[index];
      });
      
      // 指定された物件IDに一致し、部屋IDと部屋名が存在する場合のみ追加
      if (room['物件ID'] === propertyId && room['部屋ID'] && room['部屋名']) {
        rooms.push({
          id: room['部屋ID'],
          name: room['部屋名'],
          propertyId: room['物件ID']
        });
      }
    }
    
    console.log('[getRooms] 取得した部屋数:', rooms.length);
    return rooms;
    
  } catch (error) {
    console.error('[getRooms] エラー:', error);
    throw new Error('部屋一覧の取得に失敗しました: ' + error.message);
  }
}

/**
 * 検針データを取得
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @return {Object} 検針データ
 */
function getMeterReadings(propertyId, roomId) {
  try {
    console.log('[getMeterReadings] 検針データ取得開始');
    console.log('- propertyId:', propertyId);
    console.log('- roomId:', roomId);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inspectionSheet = ss.getSheetByName('inspection_data');
    
    if (!inspectionSheet) {
      throw new Error('inspection_dataシートが見つかりません');
    }
    
    const data = inspectionSheet.getDataRange().getValues();
    const headers = data[0];
    const readings = [];
    
    // ヘッダー行をスキップして処理
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const reading = {};
      
      headers.forEach((header, index) => {
        reading[header] = row[index];
      });
      
      // 指定された物件IDと部屋IDに一致するデータのみ処理
      if (reading['物件ID'] === propertyId && reading['部屋ID'] === roomId) {
        readings.push({
          date: reading['検針日時'],
          currentReading: reading['今回の指示数'],
          previousReading: reading['前回指示数'],
          usage: reading['今回使用量'],
          status: reading['状態'] || '正常'
        });
      }
    }
    
    console.log('[getMeterReadings] 取得した検針データ数:', readings.length);
    
    return {
      readings: readings,
      debugInfo: {
        propertyId: propertyId,
        roomId: roomId,
        totalRows: data.length - 1,
        matchingRows: readings.length
      }
    };
    
  } catch (error) {
    console.error('[getMeterReadings] エラー:', error);
    throw new Error('検針データの取得に失敗しました: ' + error.message);
  }
}

/**
 * 検針データを更新
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @param {Array} readings - 更新する検針データ
 * @return {Object} 更新結果
 */
function updateMeterReadings(propertyId, roomId, readings) {
  try {
    console.log('[updateMeterReadings] 検針データ更新開始');
    console.log('- propertyId:', propertyId);
    console.log('- roomId:', roomId);
    console.log('- readings:', readings);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inspectionSheet = ss.getSheetByName('inspection_data');
    
    if (!inspectionSheet) {
      throw new Error('inspection_dataシートが見つかりません');
    }
    
    const data = inspectionSheet.getDataRange().getValues();
    const headers = data[0];
    let updatedCount = 0;
    
    // 各読み取りデータを処理
    readings.forEach(reading => {
      const { date, currentReading } = reading;
      let recordFound = false;
      
      // 既存レコードを検索して更新
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowPropertyId = row[headers.indexOf('物件ID')];
        const rowRoomId = row[headers.indexOf('部屋ID')];
        const rowDate = row[headers.indexOf('検針日時')];
        
        if (rowPropertyId === propertyId && rowRoomId === roomId && 
            (rowDate === date || (date === '' && !rowDate))) {
          
          // レコードを更新
          row[headers.indexOf('今回の指示数')] = currentReading;
          row[headers.indexOf('検針日時')] = date;
          
          // 使用量を計算
          const previousReading = row[headers.indexOf('前回指示数')] || 0;
          const usage = calculateUsage(currentReading, previousReading);
          row[headers.indexOf('今回使用量')] = usage;
          
          recordFound = true;
          updatedCount++;
          break;
        }
      }
      
      // 新しいレコードを追加（初回検針の場合）
      if (!recordFound && date !== '') {
        const newRow = new Array(headers.length).fill('');
        newRow[headers.indexOf('物件ID')] = propertyId;
        newRow[headers.indexOf('部屋ID')] = roomId;
        newRow[headers.indexOf('検針日時')] = date;
        newRow[headers.indexOf('今回の指示数')] = currentReading;
        newRow[headers.indexOf('今回使用量')] = currentReading; // 初回は指示数がそのまま使用量
        newRow[headers.indexOf('状態')] = '正常';
        
        data.push(newRow);
        updatedCount++;
      }
    });
    
    // シートに書き戻し
    inspectionSheet.clear();
    inspectionSheet.getRange(1, 1, data.length, headers.length).setValues(data);
    
    console.log('[updateMeterReadings] 更新完了 - 件数:', updatedCount);
    
    return {
      success: true,
      updatedCount: updatedCount,
      message: `${updatedCount}件のデータを更新しました`
    };
    
  } catch (error) {
    console.error('[updateMeterReadings] エラー:', error);
    return {
      success: false,
      error: '検針データの更新に失敗しました: ' + error.message
    };
  }
}

/**
 * 使用量を計算
 * @param {number} currentReading - 今回指示数
 * @param {number} previousReading - 前回指示数
 * @return {number} 使用量
 */
function calculateUsage(currentReading, previousReading) {
  const current = parseFloat(currentReading) || 0;
  const previous = parseFloat(previousReading) || 0;
  
  if (!previousReading || previous === 0) {
    return current; // 初回検針は指示数がそのまま使用量
  }
  
  const usage = current - previous;
  return usage >= 0 ? usage : 0;
}

/**
 * 最新の検針日を取得
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @return {string} 最新検針日
 */
function getLatestInspectionDate(propertyId, roomId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inspectionSheet = ss.getSheetByName('inspection_data');
    
    if (!inspectionSheet) {
      return '';
    }
    
    const data = inspectionSheet.getDataRange().getValues();
    const headers = data[0];
    let latestDate = '';
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowPropertyId = row[headers.indexOf('物件ID')];
      const rowRoomId = row[headers.indexOf('部屋ID')];
      const rowDate = row[headers.indexOf('検針日時')];
      
      if (rowPropertyId === propertyId && rowRoomId === roomId && rowDate) {
        if (!latestDate || new Date(rowDate) > new Date(latestDate)) {
          latestDate = rowDate;
        }
      }
    }
    
    return latestDate;
  } catch (error) {
    console.error('[getLatestInspectionDate] エラー:', error);
    return '';
  }
}

/**
 * 実際の検針データが存在するかチェック
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @return {boolean} 検針データ存在フラグ
 */
function hasActualReadingData(propertyId, roomId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inspectionSheet = ss.getSheetByName('inspection_data');
    
    if (!inspectionSheet) {
      return false;
    }
    
    const data = inspectionSheet.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowPropertyId = row[headers.indexOf('物件ID')];
      const rowRoomId = row[headers.indexOf('部屋ID')];
      const currentReading = row[headers.indexOf('今回の指示数')];
      
      if (rowPropertyId === propertyId && rowRoomId === roomId && 
          currentReading !== null && currentReading !== undefined && currentReading !== '') {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[hasActualReadingData] エラー:', error);
    return false;
  }
}

/**
 * HTMLファイルの内容を取得（テンプレートエンジン用）
 * @param {string} filename - ファイル名
 * @return {string} HTMLの内容
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * メイン実行関数（ボタンから呼び出し用）
 */
function showWaterMeterApp() {
  showPropertySelectDialog();
}

/**
 * スプレッドシートにカスタムメニューを追加
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('水道検針')
      .addItem('アプリを開く', 'showWaterMeterApp')
      .addSeparator()
      .addItem('物件選択', 'showPropertySelectDialog')
      .addToUi();
  } catch (error) {
    console.error('[onOpen] メニュー作成エラー:', error);
  }
}

/**
 * トリガー設定関数（スクリプトエディタから実行可能）
 */
function setupOnOpenTrigger() {
  try {
    // 既存のonOpenトリガーを削除
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'onOpen') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // 新しいonOpenトリガーを作成
    ScriptApp.newTrigger('onOpen')
      .onOpen()
      .create();
    
    console.log('✅ onOpenトリガーが正常に設定されました');
    return 'onOpenトリガーの設定が完了しました。スプレッドシートを再度開いてメニューを確認してください。';
  } catch (error) {
    console.error('❌ トリガー設定エラー:', error);
    return `エラー: ${error.message}`;
  }
}
