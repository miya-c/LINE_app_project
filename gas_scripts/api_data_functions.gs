/**
 * api_data_functions.gs - API用データ取得関数群
 * web_app_api.gs で使用される関数を定義
 */

/**
 * 物件データを取得
 * @returns {Array} 物件データの配列
 */
function getProperties() {
  try {
    console.log('[getProperties] 物件データ取得開始');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('物件マスタ');
    
    if (!sheet) {
      throw new Error('物件マスタシートが見つかりません');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      console.log('[getProperties] 物件マスタにデータがありません');
      return [];
    }
    
    const headers = data[0];
    console.log('[getProperties] 物件マスタヘッダー:', headers);
    
    const properties = data.slice(1).map((row, index) => {
      const property = {};
      headers.forEach((header, colIndex) => {
        property[header] = row[colIndex];
      });
      return property;
    });
    
    console.log('[getProperties] 物件データ取得完了 - 件数:', properties.length);
    return properties;
    
  } catch (error) {
    console.error('[getProperties] エラー:', error);
    throw error;
  }
}

/**
 * 指定物件の部屋データを取得
 * @param {string} propertyId - 物件ID
 * @returns {Array} 部屋データの配列
 */
function getRooms(propertyId) {
  try {
    console.log('[getRooms] 部屋データ取得開始 - propertyId:', propertyId);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('部屋マスタ');
    
    if (!sheet) {
      throw new Error('部屋マスタシートが見つかりません');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      console.log('[getRooms] 部屋マスタにデータがありません');
      return [];
    }
    
    const headers = data[0];
    console.log('[getRooms] 部屋マスタヘッダー:', headers);
    
    const propertyIdIndex = headers.indexOf('物件ID');
    
    if (propertyIdIndex === -1) {
      throw new Error('物件ID列が見つかりません');
    }
    
    const rooms = data.slice(1)
      .filter(row => String(row[propertyIdIndex]).trim() === String(propertyId).trim())
      .map(row => {
        const room = {};
        headers.forEach((header, index) => {
          room[header] = row[index];
        });
        return room;
      });
    
    console.log('[getRooms] 部屋データ取得完了 - propertyId:', propertyId, '件数:', rooms.length);
    return rooms;
    
  } catch (error) {
    console.error('[getRooms] エラー:', error);
    throw error;
  }
}

/**
 * 指定物件・部屋の検針データを取得
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @returns {Array} 検針データの配列
 */
function getMeterReadings(propertyId, roomId) {
  try {
    console.log('[getMeterReadings] 検針データ取得開始 - propertyId:', propertyId, 'roomId:', roomId);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('inspection_data');
    
    if (!sheet) {
      throw new Error('inspection_dataシートが見つかりません');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      console.log('[getMeterReadings] inspection_dataにデータがありません');
      return [];
    }
    
    const headers = data[0];
    console.log('[getMeterReadings] inspection_dataヘッダー:', headers);
    
    const propertyIdIndex = headers.indexOf('物件ID');
    const roomIdIndex = headers.indexOf('部屋ID');
    
    if (propertyIdIndex === -1 || roomIdIndex === -1) {
      throw new Error('必要な列（物件ID、部屋ID）が見つかりません');
    }
    
    const meterReadings = data.slice(1)
      .filter(row => 
        String(row[propertyIdIndex]).trim() === String(propertyId).trim() && 
        String(row[roomIdIndex]).trim() === String(roomId).trim()
      )
      .map(row => {
        const reading = {};
        headers.forEach((header, index) => {
          reading[header] = row[index];
        });
        return reading;
      });
    
    console.log('[getMeterReadings] 検針データ取得完了 - propertyId:', propertyId, 'roomId:', roomId, '件数:', meterReadings.length);
    return meterReadings;
    
  } catch (error) {
    console.error('[getMeterReadings] エラー:', error);
    throw error;
  }
}

/**
 * 物件IDの存在確認
 * @param {string} propertyId - 物件ID
 * @returns {boolean} 存在する場合はtrue
 */
function validatePropertyId(propertyId) {
  try {
    const properties = getProperties();
    return properties.some(property => String(property['物件ID']).trim() === String(propertyId).trim());
  } catch (error) {
    console.error('[validatePropertyId] エラー:', error);
    return false;
  }
}

/**
 * 部屋IDの存在確認
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @returns {boolean} 存在する場合はtrue
 */
function validateRoomId(propertyId, roomId) {
  try {
    const rooms = getRooms(propertyId);
    return rooms.some(room => String(room['部屋ID']).trim() === String(roomId).trim());
  } catch (error) {
    console.error('[validateRoomId] エラー:', error);
    return false;
  }
}

/**
 * スプレッドシートの基本情報を取得（デバッグ用）
 * @returns {Object} スプレッドシート情報
 */
function getSpreadsheetInfo() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    
    const info = {
      spreadsheetName: ss.getName(),
      spreadsheetId: ss.getId(),
      sheetsCount: sheets.length,
      sheets: sheets.map(sheet => ({
        name: sheet.getName(),
        rowCount: sheet.getLastRow(),
        columnCount: sheet.getLastColumn()
      }))
    };
    
    console.log('[getSpreadsheetInfo] スプレッドシート情報:', info);
    return info;
    
  } catch (error) {
    console.error('[getSpreadsheetInfo] エラー:', error);
    throw error;
  }
}
