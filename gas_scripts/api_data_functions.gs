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

/**
 * 検針データを更新
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID  
 * @param {Array} readings - 更新する検針データ
 * @return {Object} 更新結果
 */
function updateMeterReadings(propertyId, roomId, readings) {
  try {
    console.log('[updateMeterReadings] ========= 関数開始 =========');
    console.log('[updateMeterReadings] 実行日時:', new Date().toISOString());
    console.log('[updateMeterReadings] propertyId:', propertyId, 'roomId:', roomId, 'データ数:', readings.length);
    console.log('[updateMeterReadings] 更新データ:', JSON.stringify(readings));
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('inspection_data');
    
    if (!sheet) {
      throw new Error('inspection_data シートが見つかりません');
    }
    
    console.log('[updateMeterReadings] inspection_data シート取得成功');
    
    // スプレッドシートのデータを取得
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      throw new Error('スプレッドシートにデータが不足しています');
    }
    
    // ヘッダーから列インデックスを動的に取得
    const headers = data[0];
    console.log('[updateMeterReadings] スプレッドシートのヘッダー:', headers);
    
    const columnIndexes = {
      propertyId: headers.indexOf('物件ID'),
      roomId: headers.indexOf('部屋ID'),
      date: headers.indexOf('検針日時'),
      currentReading: headers.indexOf('今回の指示数') >= 0 ? headers.indexOf('今回の指示数') : headers.indexOf('今回指示数（水道）'),
      previousReading: headers.indexOf('前回指示数'),
      usage: headers.indexOf('今回使用量'),
      warningFlag: headers.indexOf('警告フラグ'),
      recordId: headers.indexOf('記録ID')
    };
    
    console.log('[updateMeterReadings] 列インデックス:', columnIndexes);
    
    // 必要な列が存在するかチェック
    const requiredColumns = ['物件ID', '部屋ID'];
    for (const colName of requiredColumns) {
      if (!headers.includes(colName)) {
        console.log('[updateMeterReadings] ❌ 必須列が見つかりません:', colName);
        console.log('[updateMeterReadings] 利用可能な列一覧:', headers);
        throw new Error(`必要な列が見つかりません: ${colName}`);
      }
    }
    
    // 検針日時と今回指示数の列を検索
    if (columnIndexes.date === -1) {
      console.log('[updateMeterReadings] ❌ 検針日時列が見つかりません。利用可能な列:', headers);
      console.log('[updateMeterReadings] 検針日時列存在チェック:', headers.includes('検針日時'));
      throw new Error('必要な列が見つかりません: 検針日時');
    }
    if (columnIndexes.currentReading === -1) {
      console.log('[updateMeterReadings] ❌ 今回指示数列が見つかりません。利用可能な列:', headers);
      console.log('[updateMeterReadings] 今回の指示数列存在チェック:', headers.includes('今回の指示数'));
      console.log('[updateMeterReadings] 今回指示数（水道）列存在チェック:', headers.includes('今回指示数（水道）'));
      throw new Error('必要な列が見つかりません: 今回の指示数 (または 今回指示数（水道）)');
    }
    
    let updatedCount = 0;
    const updatedReadings = [];
    
    console.log('[updateMeterReadings] ===== データ処理開始 =====');
    console.log('[updateMeterReadings] 対象件数:', readings.length);
    
    // 各検針データを処理
    for (let i = 0; i < readings.length; i++) {
      const reading = readings[i];
      console.log(`[updateMeterReadings] 処理中 [${i}]:`, reading);
      
      let skip = false;
      try {
        const recordDate = reading.date || '';
        const currentReadingValue = parseFloat(reading.currentReading) || 0;
        
        // 既存データを検索
        let existingRowIndex = -1;
        for (let j = 1; j < data.length; j++) {
          if (data[j][columnIndexes.propertyId] === propertyId && 
              data[j][columnIndexes.roomId] === roomId) {
            existingRowIndex = j;
            break;
          }
        }
        
        let usage = 0;
        if (existingRowIndex >= 0) {
          // 既存データを更新
          const previousReadingValue = parseFloat(data[existingRowIndex][columnIndexes.previousReading]) || 0;
          
          if (previousReadingValue === 0 || data[existingRowIndex][columnIndexes.previousReading] === '' || 
              data[existingRowIndex][columnIndexes.previousReading] === null) {
            usage = currentReadingValue;
            console.log(`[updateMeterReadings] 新規検針データ - 今回指示数をそのまま使用量として設定: ${usage}`);
          } else {
            usage = Math.max(0, currentReadingValue - previousReadingValue);
            console.log(`[updateMeterReadings] 既存データ更新 - 使用量計算: ${currentReadingValue} - ${previousReadingValue} = ${usage}`);
          }
          
          // 既存行を更新
          if (recordDate) data[existingRowIndex][columnIndexes.date] = recordDate;
          data[existingRowIndex][columnIndexes.currentReading] = currentReadingValue;
          if (columnIndexes.usage >= 0) data[existingRowIndex][columnIndexes.usage] = usage;
          if (columnIndexes.warningFlag >= 0) data[existingRowIndex][columnIndexes.warningFlag] = '正常';
          
        } else {
          // 新規データを追加
          const previousReading = 0;
          usage = currentReadingValue;
          
          const newRow = new Array(headers.length).fill('');
          newRow[columnIndexes.propertyId] = propertyId;
          newRow[columnIndexes.roomId] = roomId;
          if (recordDate) newRow[columnIndexes.date] = recordDate;
          newRow[columnIndexes.currentReading] = currentReadingValue;
          newRow[columnIndexes.previousReading] = previousReading;
          if (columnIndexes.usage >= 0) newRow[columnIndexes.usage] = usage;
          if (columnIndexes.warningFlag >= 0) newRow[columnIndexes.warningFlag] = '正常';
          if (columnIndexes.recordId >= 0) newRow[columnIndexes.recordId] = Utilities.getUuid();
          
          data.push(newRow);
          console.log(`[updateMeterReadings] 新規データ追加: 指示数=${currentReadingValue}, 使用量=${usage}`);
        }
        
        updatedReadings.push({
          date: recordDate,
          currentReading: currentReadingValue,
          usage: usage,
          updated: true
        });
        
        updatedCount++;
        console.log(`[updateMeterReadings] 検針データ更新: ${recordDate || '空の日付'} - 指示数: ${currentReadingValue}, 使用量: ${usage}`);
        
      } catch (updateError) {
        console.error(`[updateMeterReadings] 検針データ更新エラー (行${i}):`, updateError.message);
        updatedReadings.push({
          date: reading.date,
          currentReading: reading.currentReading,
          error: updateError.message,
          updated: false
        });
        skip = true;
      }
      if (skip) continue;
    }
    
    console.log('[updateMeterReadings] ===== 検針データ更新処理完了 =====');
    console.log(`[updateMeterReadings] 総処理件数: ${updatedReadings.length}`);
    console.log(`[updateMeterReadings] 成功件数: ${updatedCount}`);
    
    // スプレッドシートに書き戻し
    sheet.getDataRange().setValues(data);
    console.log('[updateMeterReadings] スプレッドシート更新完了');
    
    return {
      success: true,
      updatedCount: updatedCount,
      message: `${updatedCount}件のデータを更新しました`,
      updatedReadings: updatedReadings,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[updateMeterReadings] エラー:', error);
    return {
      success: false,
      error: error.message,
      message: '検針データの更新に失敗しました',
      timestamp: new Date().toISOString()
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
      console.log('[getPropertyName] 物件マスタシートが見つかりません');
      return '';
    }
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(propertyId).trim()) {
        return String(data[i][1]).trim();
      }
    }
    
    console.log('[getPropertyName] 物件名が見つかりません - propertyId:', propertyId);
    return '';
    
  } catch (error) {
    console.error('[getPropertyName] エラー:', error);
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
      console.log('[getRoomName] 部屋マスタシートが見つかりません');
      return '';
    }
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(propertyId).trim() && 
          String(data[i][1]).trim() === String(roomId).trim()) {
        return String(data[i][2]).trim();
      }
    }
    
    console.log('[getRoomName] 部屋名が見つかりません - propertyId:', propertyId, 'roomId:', roomId);
    return '';
    
  } catch (error) {
    console.error('[getRoomName] エラー:', error);
    return '';
  }
}
