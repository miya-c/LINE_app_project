/**
 * api_data_functions.gs - API用データ関数群（軽量版）
 * スプレッドシートからのデータ取得とデータ更新処理を管理
 */

/**
 * 物件一覧を取得（軽量版）
 * @returns {Array} 物件データの配列
 */
function getProperties() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('物件マスタ');
    
    if (!sheet) {
      throw new Error('物件マスタシートが見つかりません');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    const headers = data[0];
    return data.slice(1).map(row => {
      const property = {};
      headers.forEach((header, colIndex) => {
        property[header] = row[colIndex];
      });
      return property;
    });
    
  } catch (error) {
    throw error;
  }
}

/**
 * 指定された物件の部屋一覧と検針状況を取得する（軽量版）
 * @param {string} propertyId - 物件ID
 * @returns {Object} 物件情報と部屋データの配列
 */
function getRooms(propertyId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const propertySheet = ss.getSheetByName('物件マスタ');
    const roomSheet = ss.getSheetByName('部屋マスタ');
    const inspectionSheet = ss.getSheetByName('inspection_data');
    
    if (!propertySheet || !roomSheet) {
      throw new Error('必要なシートが見つかりません');
    }
    
    // 物件情報取得
    const propertyData = propertySheet.getDataRange().getValues();
    const propertyHeaders = propertyData[0];
    const propertyIdIndex = propertyHeaders.indexOf('物件ID');
    const propertyNameIndex = propertyHeaders.indexOf('物件名');
    
    const propertyRow = propertyData.slice(1).find(row => 
      String(row[propertyIdIndex]).trim() === String(propertyId).trim()
    );
    
    if (!propertyRow) {
      throw new Error('物件が見つかりません');
    }
    
    // 部屋情報取得
    const roomData = roomSheet.getDataRange().getValues();
    const roomHeaders = roomData[0];
    const roomPropertyIdIndex = roomHeaders.indexOf('物件ID');
    const roomIdIndex = roomHeaders.indexOf('部屋ID');
    const roomNameIndex = roomHeaders.indexOf('部屋名');
    
    const rooms = roomData.slice(1)
      .filter(row => String(row[roomPropertyIdIndex]).trim() === String(propertyId).trim())
      .map(row => ({
        id: row[roomIdIndex] || '',
        name: row[roomNameIndex] || '',
        readingStatus: 'pending',
        isCompleted: false,
        readingDateFormatted: null
      }));
    
    // 今日の検針データ確認（簡素化）
    if (inspectionSheet) {
      const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const inspectionData = inspectionSheet.getDataRange().getValues();
      
      if (inspectionData.length > 1) {
        const inspHeaders = inspectionData[0];
        const inspPropertyIdIndex = inspHeaders.indexOf('物件ID');
        const inspRoomIdIndex = inspHeaders.indexOf('部屋ID');
        const inspDateIndex = inspHeaders.indexOf('検針日時');
        
        const todayReadings = new Set();
        inspectionData.slice(1).forEach(row => {
          if (row[inspPropertyIdIndex] && row[inspRoomIdIndex] && row[inspDateIndex]) {
            const readingDate = Utilities.formatDate(new Date(row[inspDateIndex]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
            if (readingDate === today && String(row[inspPropertyIdIndex]).trim() === String(propertyId).trim()) {
              todayReadings.add(String(row[inspRoomIdIndex]).trim());
            }
          }
        });
        
        rooms.forEach(room => {
          if (todayReadings.has(String(room.id).trim())) {
            room.readingStatus = 'completed';
            room.isCompleted = true;
            const date = new Date();
            room.readingDateFormatted = `${date.getMonth() + 1}月${date.getDate()}日`;
          }
        });
      }
    }
    
    return {
      property: {
        id: propertyRow[propertyIdIndex],
        name: propertyRow[propertyNameIndex]
      },
      rooms: rooms
    };
    
  } catch (error) {
    throw error;
  }
}

/**
 * 指定物件・部屋の検針データを取得（軽量版）
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @returns {Array} 検針データの配列
 */
function getMeterReadings(propertyId, roomId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('inspection_data');
    
    if (!sheet) {
      throw new Error('inspection_dataシートが見つかりません');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    const headers = data[0];
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
    
    return meterReadings;
    
  } catch (error) {
    throw error;
  }
}

/**
 * 検針データを更新（軽量版）
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @param {Array} readings - 更新する検針データ
 * @return {Object} 更新結果
 */
function updateMeterReadings(propertyId, roomId, readings) {
  try {
    // 基本検証のみ
    if (!propertyId || !roomId || !Array.isArray(readings) || readings.length === 0) {
      throw new Error('無効なパラメータ');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('inspection_data');
    
    if (!sheet) {
      throw new Error('inspection_dataシートが見つかりません');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // 必要な列インデックスのみ取得
    const colIndexes = {
      propertyId: headers.indexOf('物件ID'),
      roomId: headers.indexOf('部屋ID'),
      date: headers.indexOf('検針日時'),
      currentReading: headers.indexOf('今回の指示数') >= 0 ? 
        headers.indexOf('今回の指示数') : headers.indexOf('今回指示数（水道）'),
      previousReading: headers.indexOf('前回指示数'),
      usage: headers.indexOf('今回使用量')
    };
    
    // 必須列チェック
    if (colIndexes.propertyId === -1 || colIndexes.roomId === -1 || 
        colIndexes.date === -1 || colIndexes.currentReading === -1) {
      throw new Error('必要な列が見つかりません');
    }
    
    let updatedCount = 0;
    
    // データ処理（簡素化）
    for (const reading of readings) {
      if (!reading || typeof reading !== 'object') continue;
      
      const currentValue = parseFloat(reading.currentReading) || 0;
      if (currentValue < 0) continue;
      
      // 既存データ検索
      let existingRowIndex = -1;
      for (let j = 1; j < data.length; j++) {
        if (String(data[j][colIndexes.propertyId]).trim() === String(propertyId).trim() && 
            String(data[j][colIndexes.roomId]).trim() === String(roomId).trim()) {
          existingRowIndex = j;
          break;
        }
      }
      
      let usage = 0;
      if (existingRowIndex >= 0) {
        // 既存データ更新
        const prevValue = parseFloat(data[existingRowIndex][colIndexes.previousReading]) || 0;
        usage = prevValue > 0 ? currentValue - prevValue : currentValue;
        
        data[existingRowIndex][colIndexes.date] = reading.date || '';
        data[existingRowIndex][colIndexes.currentReading] = currentValue;
        if (colIndexes.usage >= 0) data[existingRowIndex][colIndexes.usage] = usage;
        
      } else {
        // 新規データ追加
        const newRow = new Array(headers.length).fill('');
        newRow[colIndexes.propertyId] = propertyId;
        newRow[colIndexes.roomId] = roomId;
        newRow[colIndexes.date] = reading.date || '';
        newRow[colIndexes.currentReading] = currentValue;
        if (colIndexes.usage >= 0) newRow[colIndexes.usage] = currentValue;
        
        data.push(newRow);
      }
      
      updatedCount++;
    }
    
    // 一括書き込み
    sheet.getRange(1, 1, data.length, headers.length).setValues(data);
    
    return {
      success: true,
      updatedCount: updatedCount,
      message: `${updatedCount}件のデータを更新しました`
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 物件IDの妥当性を検証
 * @param {string} propertyId - 物件ID
 * @returns {boolean} 妥当性
 */
function validatePropertyId(propertyId) {
  try {
    if (!propertyId) return false;
    
    const properties = getProperties();
    return properties.some(property => 
      String(property['物件ID']).trim() === String(propertyId).trim()
    );
  } catch (error) {
    return false;
  }
}

/**
 * 部屋IDの妥当性を検証
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @returns {boolean} 妥当性
 */
function validateRoomId(propertyId, roomId) {
  try {
    if (!propertyId || !roomId) return false;
    
    const roomData = getRooms(propertyId);
    return roomData.rooms.some(room => 
      String(room.id).trim() === String(roomId).trim()
    );
  } catch (error) {
    return false;
  }
}

/**
 * スプレッドシート情報を取得
 * @returns {Object} スプレッドシート情報
 */
function getSpreadsheetInfo() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets().map(sheet => ({
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      cols: sheet.getLastColumn()
    }));
    
    return {
      success: true,
      spreadsheetId: ss.getId(),
      name: ss.getName(),
      sheets: sheets,
      url: ss.getUrl()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 物件名を取得
 * @param {string} propertyId - 物件ID
 * @returns {string} 物件名
 */
function getPropertyName(propertyId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('物件マスタ');
    
    if (!sheet) {
      return '';
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const propertyIdIndex = headers.indexOf('物件ID');
    const propertyNameIndex = headers.indexOf('物件名');
    
    if (propertyIdIndex === -1 || propertyNameIndex === -1) {
      return '';
    }
    
    const propertyRow = data.slice(1).find(row => 
      String(row[propertyIdIndex]).trim() === String(propertyId).trim()
    );
    
    return propertyRow ? propertyRow[propertyNameIndex] : '';
    
  } catch (error) {
    return '';
  }
}

/**
 * 部屋名を取得
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @returns {string} 部屋名
 */
function getRoomName(propertyId, roomId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('部屋マスタ');
    
    if (!sheet) {
      return '';
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const propertyIdIndex = headers.indexOf('物件ID');
    const roomIdIndex = headers.indexOf('部屋ID');
    const roomNameIndex = headers.indexOf('部屋名');
    
    if (propertyIdIndex === -1 || roomIdIndex === -1 || roomNameIndex === -1) {
      return '';
    }
    
    const roomRow = data.slice(1).find(row => 
      String(row[propertyIdIndex]).trim() === String(propertyId).trim() && 
      String(row[roomIdIndex]).trim() === String(roomId).trim()
    );
    
    return roomRow ? roomRow[roomNameIndex] : '';
    
  } catch (error) {
    return '';
  }
}
