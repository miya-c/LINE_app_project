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
  try {    console.log('[updateMeterReadings] ========= 関数開始 =========');
    console.log('[updateMeterReadings] 実行日時:', new Date().toISOString());
    console.log('[updateMeterReadings] 呼び出し元:', new Error().stack);
    
    // 直接実行時のエラーガイダンス
    if (arguments.length === 0 || propertyId === undefined) {
      const errorMessage = `
❌ updateMeterReadings関数の直接実行エラー

この関数は Web API 経由でのみ実行可能です。

✅ 正しいテスト方法:
1. testUpdateMeterReadings() 関数を実行
2. testWebAppAPI() 関数を実行
3. Web ブラウザから API を呼び出し

📝 パラメータが必要です:
- propertyId: 物件ID (例: 'P000001')
- roomId: 部屋ID (例: 'R000001') 
- readings: 検針データ配列

🔧 テスト実行コマンド:
testUpdateMeterReadings() または testWebAppAPI()
      `;
      
      console.error('[updateMeterReadings]', errorMessage);
      throw new Error('updateMeterReadings関数は直接実行できません。testUpdateMeterReadings()を使用してください。');
    }
    
    console.log('[updateMeterReadings] propertyId:', propertyId, 'roomId:', roomId);
    console.log('[updateMeterReadings] readings型:', typeof readings, 'isArray:', Array.isArray(readings));
    console.log('[updateMeterReadings] readingsの内容:', JSON.stringify(readings));
    
    // パラメータバリデーションを強化
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      throw new Error('propertyId は必須パラメータです。受信値: ' + propertyId);
    }
    
    if (!roomId || roomId === 'undefined' || roomId === 'null') {
      throw new Error('roomId は必須パラメータです。受信値: ' + roomId);
    }
    
    if (readings === null || readings === undefined) {
      throw new Error('readings パラメータが null または undefined です。受信値: ' + readings);
    }
    
    if (!Array.isArray(readings)) {
      throw new Error('readings パラメータが配列ではありません。受信した型: ' + typeof readings + ', 値: ' + JSON.stringify(readings));
    }
    
    if (readings.length === 0) {
      throw new Error('readings配列が空です。最低1つの検針データが必要です。');
    }
    
    console.log('[updateMeterReadings] パラメータバリデーション通過 - データ数:', readings.length);
    
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
        // readingオブジェクトの検証
        if (!reading || typeof reading !== 'object') {
          throw new Error(`読み込み不能なデータ [${i}]: ${JSON.stringify(reading)}`);
        }
        
        const recordDate = reading.date || '';
        const currentReadingValue = parseFloat(reading.currentReading) || 0;
        
        // 数値の妥当性チェック
        if (isNaN(currentReadingValue) || currentReadingValue < 0) {
          throw new Error(`無効な指示数 [${i}]: ${reading.currentReading}`);
        }
          // 既存データを検索
        let existingRowIndex = -1;
        for (let j = 1; j < data.length; j++) {
          if (String(data[j][columnIndexes.propertyId]).trim() === String(propertyId).trim() && 
              String(data[j][columnIndexes.roomId]).trim() === String(roomId).trim()) {
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
          date: reading?.date || '',
          currentReading: reading?.currentReading || '',
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
    try {
      sheet.getDataRange().setValues(data);
      console.log('[updateMeterReadings] スプレッドシート更新完了');
    } catch (sheetError) {
      console.error('[updateMeterReadings] スプレッドシート書き込みエラー:', sheetError);
      throw new Error('スプレッドシートへの書き込みに失敗しました: ' + sheetError.message);
    }
    
    return {
      success: true,
      updatedCount: updatedCount,
      message: `${updatedCount}件のデータを更新しました`,
      updatedReadings: updatedReadings,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[updateMeterReadings] エラー:', error);
    console.error('[updateMeterReadings] エラースタック:', error.stack);
    
    return {
      success: false,      error: error.message,
      message: '検針データの更新に失敗しました',
      timestamp: new Date().toISOString(),
      receivedParameters: {
        propertyId: propertyId,
        roomId: roomId,
        readingsType: typeof readings,
        readingsIsArray: Array.isArray(readings),
        readingsLength: readings ? (Array.isArray(readings) ? readings.length : 'not array') : 'null/undefined',
        readingsValue: readings
      }
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

/**
 * updateMeterReadings関数のテスト実行用
 */
function testUpdateMeterReadings() {
  try {
    console.log('[testUpdateMeterReadings] ========= テスト実行開始 =========');
    
    // テスト用パラメータ
    const testPropertyId = 'P000001';
    const testRoomId = 'R000001';
    const testReadings = [
      {
        date: '2025-01-16',
        currentReading: '1250'
      }
    ];
    
    console.log('[testUpdateMeterReadings] テストパラメータ:');
    console.log('[testUpdateMeterReadings] - propertyId:', testPropertyId);
    console.log('[testUpdateMeterReadings] - roomId:', testRoomId);
    console.log('[testUpdateMeterReadings] - readings:', JSON.stringify(testReadings));
    
    // 関数を正しいパラメータで実行
    const result = updateMeterReadings(testPropertyId, testRoomId, testReadings);
    
    console.log('[testUpdateMeterReadings] ========= テスト実行完了 =========');
    console.log('[testUpdateMeterReadings] 結果:', JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('[testUpdateMeterReadings] エラー:', error);
    console.error('[testUpdateMeterReadings] エラースタック:', error.stack);
    throw error;
  }
}

/**
 * Web App API全体のテスト
 */
function testWebAppAPI() {
  try {
    console.log('[testWebAppAPI] ========= Web APP APIテスト開始 =========');
    
    // doGet関数のテスト用パラメータを作成
    const mockEvent = {
      parameter: {
        action: 'updateMeterReadings',
        propertyId: 'P000001',
        roomId: 'R000001',
        readings: JSON.stringify([
          {
            date: '2025-01-16',
            currentReading: '1250'
          }
        ])
      }
    };
    
    console.log('[testWebAppAPI] モックイベント:', JSON.stringify(mockEvent, null, 2));
    
    // doGet関数を実行
    const result = doGet(mockEvent);
    
    console.log('[testWebAppAPI] ========= Web APP APIテスト完了 =========');
    console.log('[testWebAppAPI] 結果タイプ:', typeof result);
    
    if (result && typeof result.getContent === 'function') {
      const content = result.getContent();
      console.log('[testWebAppAPI] レスポンス内容:', content);
      
      try {
        const jsonResult = JSON.parse(content);
        console.log('[testWebAppAPI] パースされたJSON:', jsonResult);
      } catch (parseError) {
        console.log('[testWebAppAPI] JSON解析失敗 - HTMLレスポンス?');
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('[testWebAppAPI] エラー:', error);
    console.error('[testWebAppAPI] エラースタック:', error.stack);
    throw error;
  }
}
