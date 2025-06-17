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
 * 指定された物件の部屋一覧と検針状況を取得する（CSV構造完全対応版）
 * room_select.html用の形式で返却
 * @param {string} propertyId - 物件ID
 * @returns {Object} {property: {...}, rooms: [...]} 形式
 */
function getRooms(propertyId) {
  try {
    Logger.log(`[getRooms] 開始 - propertyId: ${propertyId}`);
    
    if (!propertyId) {
      throw new Error('物件IDが指定されていません');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const propertySheet = ss.getSheetByName('物件マスタ');
    const roomSheet = ss.getSheetByName('部屋マスタ');
    
    if (!propertySheet) {
      throw new Error('物件マスタシートが見つかりません');
    }
    
    if (!roomSheet) {
      throw new Error('部屋マスタシートが見つかりません');
    }
    
    Logger.log('[getRooms] シート取得完了');    // 物件情報取得（物件マスタ.csv: 物件ID,物件名,検針完了日）
    const propertyData = propertySheet.getDataRange().getValues();
    if (propertyData.length <= 1) {
      throw new Error('物件マスタにデータがありません');
    }
    
    const propertyHeaders = propertyData[0];
    const propertyIdIndex = propertyHeaders.indexOf('物件ID');       // 列A (0)
    const propertyNameIndex = propertyHeaders.indexOf('物件名');     // 列B (1)
    
    if (propertyIdIndex === -1) {
      throw new Error('物件マスタに「物件ID」列が見つかりません');
    }
    
    if (propertyNameIndex === -1) {
      throw new Error('物件マスタに「物件名」列が見つかりません');
    }
    
    // 指定された物件IDの物件情報を検索
    const propertyRow = propertyData.slice(1).find(row => 
      String(row[propertyIdIndex]).trim() === String(propertyId).trim()
    );
    
    if (!propertyRow) {
      throw new Error(`指定された物件ID「${propertyId}」が物件マスタに見つかりません`);
    }
    
    const propertyInfo = {
      id: String(propertyRow[propertyIdIndex]).trim(),
      name: String(propertyRow[propertyNameIndex] || '物件名不明').trim()
    };
    
    Logger.log(`[getRooms] 物件情報取得完了: ${JSON.stringify(propertyInfo)}`);    // 部屋情報取得（部屋マスタ.csv: 物件ID,部屋ID,部屋名）
    const roomData = roomSheet.getDataRange().getValues();
    if (roomData.length <= 1) {
      Logger.log('[getRooms] 部屋マスタにデータなし - 空配列を返却');
      return {
        property: propertyInfo,
        rooms: []
      };
    }
    
    const roomHeaders = roomData[0];
    const roomPropertyIdIndex = roomHeaders.indexOf('物件ID');  // 列A (0)
    const roomIdIndex = roomHeaders.indexOf('部屋ID');          // 列B (1)
    const roomNameIndex = roomHeaders.indexOf('部屋名');        // 列C (2)
    
    if (roomPropertyIdIndex === -1 || roomIdIndex === -1 || roomNameIndex === -1) {
      throw new Error('部屋マスタに必要な列（物件ID、部屋ID、部屋名）が見つかりません');
    }
    
    Logger.log(`[getRooms] 部屋マスタ列構成確認: 物件ID列:${roomPropertyIdIndex}, 部屋ID列:${roomIdIndex}, 部屋名列:${roomNameIndex}`);
    
    const rooms = roomData.slice(1)
      .filter(row => String(row[roomPropertyIdIndex]).trim() === String(propertyId).trim())
      .map(row => ({
        id: String(row[roomIdIndex] || '').trim(),
        name: String(row[roomNameIndex] || '').trim(),
        readingStatus: 'not-completed', // HTMLが期待するフィールド
        isCompleted: false,             // HTMLが期待するフィールド
        readingDateFormatted: null      // HTMLが期待するフィールド
      }));
    
    Logger.log(`[getRooms] 対象部屋数: ${rooms.length}件`);    // inspection_dataから検針完了状況確認
    // inspection_data.csv: 記録ID,物件名,物件ID,部屋ID,部屋名,検針日時,警告フラグ,標準偏差値,今回使用量,今回の指示数,前回指示数,前々回指示数,前々々回指示数
    const inspectionSheet = ss.getSheetByName('inspection_data');
    if (inspectionSheet) {
      try {
        const inspectionData = inspectionSheet.getDataRange().getValues();
        
        if (inspectionData.length > 1) {
          const inspHeaders = inspectionData[0];
          const inspPropertyIdIndex = inspHeaders.indexOf('物件ID');    // 列C (2)
          const inspRoomIdIndex = inspHeaders.indexOf('部屋ID');        // 列D (3)
          const inspValueIndex = inspHeaders.indexOf('今回の指示数');   // 列J (9)
          const inspDateIndex = inspHeaders.indexOf('検針日時');        // 列F (5)
          
          Logger.log(`[getRooms] inspection_data列構成 - 物件ID列:${inspPropertyIdIndex}, 部屋ID列:${inspRoomIdIndex}, 今回の指示数列:${inspValueIndex}, 検針日時列:${inspDateIndex}`);
          
          if (inspPropertyIdIndex !== -1 && inspRoomIdIndex !== -1 && inspValueIndex !== -1) {
            const readingMap = new Map(); // 部屋IDと検針日のマップ
              // 検針完了データを検索
            inspectionData.slice(1).forEach(row => {
              // 物件IDが一致し、検針値が入力されている場合
              if (String(row[inspPropertyIdIndex]).trim() === String(propertyId).trim() &&
                  row[inspValueIndex] !== null && 
                  row[inspValueIndex] !== undefined && 
                  String(row[inspValueIndex]).trim() !== '') {
                
                const roomId = String(row[inspRoomIdIndex]).trim();
                
                // 検針日時をフォーマット（2025/05/31 → 5月31日）
                let readingDateFormatted = null;
                if (inspDateIndex !== -1 && row[inspDateIndex]) {
                  try {
                    const dateStr = String(row[inspDateIndex]).trim();
                    if (dateStr) {
                      const date = new Date(dateStr);
                      if (!isNaN(date.getTime())) {
                        readingDateFormatted = `${date.getMonth() + 1}月${date.getDate()}日`;
                      }
                    }
                  } catch (e) {
                    Logger.log(`[getRooms] 日付変換エラー: ${e.message}`);
                  }
                }
                
                // 日付がない場合のフォールバック
                if (!readingDateFormatted) {
                  const today = new Date();
                  readingDateFormatted = `${today.getMonth() + 1}月${today.getDate()}日`;
                }
                
                readingMap.set(roomId, readingDateFormatted);
              }
            });
            
            // 検針完了状況を部屋データに反映
            rooms.forEach(room => {
              if (readingMap.has(room.id)) {
                room.readingStatus = 'completed';
                room.isCompleted = true;
                room.readingDateFormatted = readingMap.get(room.id);
              }
            });
              Logger.log(`[getRooms] 検針完了部屋数: ${readingMap.size}件`);
          } else {
            Logger.log('[getRooms] inspection_dataの必要な列が見つかりません');
          }
        }
      } catch (inspectionError) {
        Logger.log(`[getRooms] inspection_data読み込みエラー（部屋一覧は継続）: ${inspectionError.message}`);
      }
    } else {
      Logger.log('[getRooms] inspection_dataシートが見つかりません（部屋一覧は継続）');
    }
    
    // HTMLが期待する形式で返却
    const result = {
      property: propertyInfo,
      rooms: rooms
    };
    
    Logger.log(`[getRooms] 完了 - 結果サマリー: 物件名=${propertyInfo.name}, 部屋数=${rooms.length}件, 検針完了=${rooms.filter(r => r.isCompleted).length}件`);
    return result;
    
  } catch (error) {
    Logger.log(`getRooms エラー: ${error.message}`);
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

/**
 * デバッグ用: スプレッドシートのシート名と基本情報を確認
 */
function debugSheetInfo() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets().map(s => s.getName());
    console.log('存在するシート:', sheets);
      const propertySheet = ss.getSheetByName('物件マスタ');
    const roomSheet = ss.getSheetByName('部屋マスタ');
    const inspectionSheet = ss.getSheetByName('inspection_data');
    
    console.log('物件マスタ行数:', propertySheet ? propertySheet.getLastRow() : 'シートなし');
    console.log('部屋マスタ行数:', roomSheet ? roomSheet.getLastRow() : 'シートなし');
    console.log('inspection_data行数:', inspectionSheet ? inspectionSheet.getLastRow() : 'シートなし');
    
    if (propertySheet && propertySheet.getLastRow() > 0) {
      const propertyHeaders = propertySheet.getRange(1, 1, 1, propertySheet.getLastColumn()).getValues()[0];
      console.log('物件マスタ列名:', propertyHeaders);
    }
    
    if (roomSheet && roomSheet.getLastRow() > 0) {
      const roomHeaders = roomSheet.getRange(1, 1, 1, roomSheet.getLastColumn()).getValues()[0];
      console.log('部屋マスタ列名:', roomHeaders);
    }
    
    return 'デバッグ情報をコンソールに出力しました';
  } catch (error) {
    console.error('デバッグエラー:', error);
    return `エラー: ${error.message}`;
  }
}

/**
 * デバッグ用: 特定物件の部屋データを確認
 */
function debugGetRooms(propertyId = 'P000001') {
  try {
    console.log(`デバッグ: 物件ID「${propertyId}」の部屋データ取得テスト`);
    const result = getRooms(propertyId);
    console.log('結果:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('デバッグエラー:', error);
    return { error: error.message };
  }
}
