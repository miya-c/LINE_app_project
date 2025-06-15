// Google Apps Script - 水道メーター読み取りアプリ API
// 物件データ、部屋データ、検針データの管理

/**
 * CORSヘッダーを付与したJSONレスポンスを作成する関数
 * @param {Object} data - レスポンスデータ
 * @returns {TextOutput} CORSヘッダー付きJSONレスポンス
 */
function createCorsJsonResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // CORSヘッダーを設定
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    .setHeader('Access-Control-Max-Age', '3600');
}

/**
 * CORSプリフライトリクエスト（OPTIONS）に対応するdoPost関数
 * @param {Object} e - リクエストイベントオブジェクト
 * @returns {TextOutput} CORSヘッダー付きレスポンス
 */
function doPost(e) {
  console.log('[doPost] リクエスト受信 - メソッド: POST');
  console.log('[doPost] パラメータ:', e?.parameter);
  
  // OPTIONSリクエスト（プリフライト）の場合
  return createCorsJsonResponse({ message: 'CORS preflight handled' });
}

/**
 * Web App用のメイン関数 - API要求とHTML表示を処理
 * @param {Object} e - リクエストイベントオブジェクト
 * @returns {HtmlOutput|TextOutput} HTMLページまたはJSONレスポンス
 */
function doGet(e) {
  try {
    console.log('[doGet] Web App アクセス開始');
    console.log('[doGet] パラメータ:', e?.parameter);
    
    // API要求の場合（actionパラメータが存在）
    if (e?.parameter?.action) {
      const action = e.parameter.action;
      console.log('[doGet] API要求 - アクション:', action);
      
      switch (action) {
        case 'getProperties':
          console.log('[doGet] API: getProperties');
          try {
            const properties = getProperties();
            console.log('[doGet] 物件データ取得完了 - 件数:', Array.isArray(properties) ? properties.length : 'not array');
              const response = {
              success: true,
              data: Array.isArray(properties) ? properties : [],
              count: Array.isArray(properties) ? properties.length : 0,
              timestamp: new Date().toISOString(),
              debugInfo: {
                functionCalled: 'getProperties',
                propertiesType: typeof properties,
                isArray: Array.isArray(properties)
              }
            };
            
            return createCorsJsonResponse(response);
          } catch (apiError) {
            console.error('[doGet] getProperties API エラー:', apiError);
              const errorResponse = {
              success: false,
              error: `物件データ取得エラー: ${apiError.message}`,
              data: [],
              count: 0,
              timestamp: new Date().toISOString(),
              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack
              }
            };
            
            return createCorsJsonResponse(errorResponse);
          }
          
        case 'getRooms':
          console.log('[doGet] API: getRooms');
          try {
            const propertyId = e.parameter.propertyId;
            if (!propertyId) {
              throw new Error('propertyId パラメータが必要です');
            }
            
            console.log('[doGet] 部屋データ取得開始 - propertyId:', propertyId);
            const rooms = getRooms(propertyId);
            console.log('[doGet] 部屋データ取得完了 - 件数:', Array.isArray(rooms) ? rooms.length : 'not array');
              const response = {
              success: true,
              data: Array.isArray(rooms) ? rooms : [],
              count: Array.isArray(rooms) ? rooms.length : 0,
              timestamp: new Date().toISOString(),
              propertyId: propertyId,
              debugInfo: {
                functionCalled: 'getRooms',
                roomsType: typeof rooms,
                isArray: Array.isArray(rooms)
              }
            };
            
            return createCorsJsonResponse(response);
              
          } catch (apiError) {
            console.error('[doGet] getRooms API エラー:', apiError);
              const errorResponse = {
              success: false,
              error: `部屋データ取得エラー: ${apiError.message}`,
              data: [],
              count: 0,
              timestamp: new Date().toISOString(),
              propertyId: e.parameter.propertyId || 'unknown',
              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack
              }
            };
            
            return createCorsJsonResponse(errorResponse);
          }
          
        case 'getMeterReadings':
          console.log('[doGet] API: getMeterReadings');
          try {
            const propertyId = e.parameter.propertyId;
            const roomId = e.parameter.roomId;
            if (!propertyId || !roomId) {
              throw new Error('propertyId および roomId パラメータが必要です');
            }
            
            console.log('[doGet] 検針データ取得開始 - propertyId:', propertyId, 'roomId:', roomId);
            const readings = getMeterReadings(propertyId, roomId);
            console.log('[doGet] 検針データ取得完了 - 件数:', Array.isArray(readings) ? readings.length : 'not array');
              // 統一されたレスポンス形式で返す
            const response = {
              success: true,
              data: Array.isArray(readings) ? readings : [],
              count: Array.isArray(readings) ? readings.length : 0,
              timestamp: new Date().toISOString(),
              propertyId: propertyId,
              roomId: roomId,
              debugInfo: {
                functionCalled: 'getMeterReadings',
                readingsType: typeof readings,
                isArray: Array.isArray(readings)
              }
            };
            
            return createCorsJsonResponse(response);
          } catch (apiError) {
            console.error('[doGet] getMeterReadings API エラー:', apiError);
              const errorResponse = {
              success: false,
              error: `検針データ取得エラー: ${apiError.message}`,
              data: [],
              count: 0,
              timestamp: new Date().toISOString(),
              propertyId: e.parameter.propertyId || 'unknown',
              roomId: e.parameter.roomId || 'unknown',
              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack
              }
            };
            
            return createCorsJsonResponse(errorResponse);
          }
          
        case 'updateMeterReadings':
          console.log('[doGet] API: updateMeterReadings');
          try {
            const propertyId = e.parameter.propertyId;
            const roomId = e.parameter.roomId;
            const readingsParam = e.parameter.readings;
            
            if (!propertyId || !roomId || !readingsParam) {
              throw new Error('propertyId, roomId, および readings パラメータが必要です');
            }
            
            console.log('[doGet] 検針データ更新開始 - propertyId:', propertyId, 'roomId:', roomId);
            console.log('[doGet] readings param:', readingsParam);
            
            // JSON文字列をパース
            const readings = JSON.parse(readingsParam);
              const result = updateMeterReadings(propertyId, roomId, readings);
            console.log('[doGet] 検針データ更新完了:', result);
            
            return createCorsJsonResponse(result);
          } catch (apiError) {
            console.error('[doGet] updateMeterReadings API エラー:', apiError);
              const errorResponse = {
              success: false,
              error: `検針データ更新エラー: ${apiError.message}`,
              timestamp: new Date().toISOString(),
              propertyId: e.parameter.propertyId || 'unknown',
              roomId: e.parameter.roomId || 'unknown',
              debugInfo: {
                errorType: apiError.name,
                errorMessage: apiError.message,
                errorStack: apiError.stack
              }
            };
            
            return createCorsJsonResponse(errorResponse);
          }
            default:
          console.log('[doGet] 未対応のAPI要求:', action);
          return createCorsJsonResponse({ error: `未対応のAPI要求: ${action}` });
      }
    }
      // HTMLページ要求の場合
    return createCorsJsonResponse({ error: 'HTML表示はサポートされていません' });
      
  } catch (error) {
    console.error('[doGet] 予期しないエラー:', error);
    return createCorsJsonResponse({ error: `サーバーエラー: ${error.message}` });
  }
}

/**
 * 物件一覧を取得
 * @return {Array} 物件一覧
 */
function getProperties() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // 日本語名を優先、なければ英語名を試行
    const sheet = ss.getSheetByName('物件マスタ') || ss.getSheetByName('property_master');
    
    if (!sheet) {
      throw new Error('物件マスタ または property_master シートが見つかりません');
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // ヘッダー行をスキップ
    const properties = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] && row[1]) { // 物件IDと物件名が存在する場合のみ
        properties.push({
          id: String(row[0]).trim(),
          name: String(row[1]).trim()
        });
      }
    }
    
    console.log('[getProperties] 取得した物件数:', properties.length);
    return properties;
  } catch (error) {
    console.error('[getProperties] エラー:', error);
    throw new Error('物件データの取得に失敗しました: ' + error.message);
  }
}

/**
 * 指定した物件の部屋一覧を取得（検針状況付き）
 * @param {string} propertyId - 物件ID
 * @return {Array} 部屋一覧
 */
function getRooms(propertyId) {
  try {
    console.log('[getRooms] 開始 - propertyId:', propertyId);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const roomSheet = ss.getSheetByName('部屋マスタ') || ss.getSheetByName('room_master');
    const inspectionSheet = ss.getSheetByName('inspection_data');
    
    if (!roomSheet) {
      throw new Error('部屋マスタ または room_master シートが見つかりません');
    }
    
    // 部屋マスタからデータを取得
    const roomRange = roomSheet.getDataRange();
    const roomValues = roomRange.getValues();
    
    if (roomValues.length <= 1) {
      console.log('[getRooms] 部屋データが存在しません');
      return [];
    }
    
    const roomHeaders = roomValues[0];
    const propertyIdIndex = roomHeaders.indexOf('物件ID');
    const roomIdIndex = roomHeaders.indexOf('部屋ID');
    const roomNameIndex = roomHeaders.indexOf('部屋名');
    
    if (propertyIdIndex === -1 || roomIdIndex === -1 || roomNameIndex === -1) {
      throw new Error('部屋マスタに必要な列（物件ID、部屋ID、部屋名）が見つかりません');
    }
    
    // 検針データを取得（検針状況確認用）
    let inspectionData = [];
    if (inspectionSheet) {
      const inspectionRange = inspectionSheet.getDataRange();
      const inspectionValues = inspectionRange.getValues();
      
      if (inspectionValues.length > 1) {
        const inspectionHeaders = inspectionValues[0];
        const inspPropertyIdIndex = inspectionHeaders.indexOf('物件ID');
        const inspRoomIdIndex = inspectionHeaders.indexOf('部屋ID');
        const inspectionDateIndex = inspectionHeaders.indexOf('検針日時');
        const currentReadingIndex = inspectionHeaders.indexOf('今回指示数（水道）');
        
        for (let i = 1; i < inspectionValues.length; i++) {
          const row = inspectionValues[i];
          if (String(row[inspPropertyIdIndex]).trim() === String(propertyId).trim()) {
            inspectionData.push({
              propertyId: row[inspPropertyIdIndex],
              roomId: row[inspRoomIdIndex],
              inspectionDate: row[inspectionDateIndex],
              currentReading: row[currentReadingIndex],
              hasActualReading: row[currentReadingIndex] !== null && 
                               row[currentReadingIndex] !== undefined && 
                               String(row[currentReadingIndex]).trim() !== ''
            });
          }
        }
      }
    }
    
    // 部屋データを処理
    const rooms = [];
    for (let i = 1; i < roomValues.length; i++) {
      const row = roomValues[i];
      if (String(row[propertyIdIndex]).trim() === String(propertyId).trim() && 
          row[roomIdIndex] && row[roomNameIndex]) {
        
        const roomId = String(row[roomIdIndex]).trim();
        
        // この部屋の検針データを検索
        const roomInspection = inspectionData.find(insp => 
          String(insp.roomId).trim() === roomId
        );
        
        const room = {
          id: roomId,
          name: String(row[roomNameIndex]).trim(),
          propertyId: String(row[propertyIdIndex]).trim(),
          rawInspectionDate: roomInspection ? roomInspection.inspectionDate : null,
          hasActualReading: roomInspection ? roomInspection.hasActualReading : false
        };
        
        rooms.push(room);
      }
    }
    
    console.log('[getRooms] 取得した部屋数:', rooms.length);
    console.log('[getRooms] 最初の部屋データ:', rooms[0] || 'なし');
    
    return rooms;
    
  } catch (error) {
    console.error('[getRooms] エラー:', error);
    throw new Error('部屋データの取得に失敗しました: ' + error.message);
  }
}

/**
 * 指定した物件・部屋の検針データを取得
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @return {Array} 検針データ
 */
function getMeterReadings(propertyId, roomId) {
  try {
    console.log('[getMeterReadings] 開始 - propertyId:', propertyId, 'roomId:', roomId);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('inspection_data');
    
    if (!sheet) {
      throw new Error('inspection_data シートが見つかりません');
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length === 0) {
      return [];
    }
    
    const headers = values[0];
    const propertyIdIndex = headers.indexOf('物件ID');
    const roomIdIndex = headers.indexOf('部屋ID');
    
    if (propertyIdIndex === -1 || roomIdIndex === -1) {
      throw new Error('inspection_data シートに必要な列（物件ID、部屋ID）が見つかりません');
    }
    
    // 指定した物件・部屋の検針データを抽出
    const meterReadings = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (String(row[propertyIdIndex]).trim() === String(propertyId).trim() &&
          String(row[roomIdIndex]).trim() === String(roomId).trim()) {
        
        const reading = {};
        headers.forEach((header, index) => {
          reading[header] = row[index];
        });
        meterReadings.push(reading);
      }
    }
    
    console.log('[getMeterReadings] 取得した検針データ数:', meterReadings.length);
    return meterReadings;
  } catch (error) {
    console.error('[getMeterReadings] エラー:', error);
    throw new Error('検針データの取得に失敗しました: ' + error.message);
  }
}

/**
 * 物件IDから物件名を取得するヘルパー関数
 * @param {string} propertyId - 物件ID
 * @return {string} 物件名
 */
function getPropertyName(propertyId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('物件マスタ') || ss.getSheetByName('property_master');
    
    if (!sheet) {
      console.log('[getPropertyName] 物件マスタシートが見つかりません');
      return 'Unknown Property';
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // ヘッダー行をスキップして検索
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (String(row[0]).trim() === String(propertyId).trim()) {
        return String(row[1]).trim() || 'Unknown Property';
      }
    }
    
    console.log('[getPropertyName] 物件IDが見つかりません:', propertyId);
    return 'Unknown Property';
  } catch (error) {
    console.error('[getPropertyName] エラー:', error);
    return 'Unknown Property';
  }
}

/**
 * 物件IDと部屋IDから部屋名を取得するヘルパー関数
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @return {string} 部屋名
 */
function getRoomName(propertyId, roomId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('部屋マスタ') || ss.getSheetByName('room_master');
    
    if (!sheet) {
      console.log('[getRoomName] 部屋マスタシートが見つかりません');
      return 'Unknown Room';
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // ヘッダー行をスキップして検索
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (String(row[0]).trim() === String(propertyId).trim() &&
          String(row[1]).trim() === String(roomId).trim()) {
        return String(row[2]).trim() || 'Unknown Room';
      }
    }
    
    console.log('[getRoomName] 部屋IDが見つかりません:', propertyId, roomId);
    return 'Unknown Room';
  } catch (error) {
    console.error('[getRoomName] エラー:', error);
    return 'Unknown Room';
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
    console.log('[updateMeterReadings] バージョン: v2025-06-15-修正版');
    console.log('[updateMeterReadings] propertyId:', propertyId, 'roomId:', roomId, 'データ数:', readings.length);
    console.log('[updateMeterReadings] 更新データ:', JSON.stringify(readings));
    console.log('[updateMeterReadings] ============================');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('inspection_data');
    
    if (!sheet) {
      throw new Error('inspection_data シートが見つかりません');
    }
    
    // 物件名を取得
    const propertyName = getPropertyName(propertyId);
    console.log('[updateMeterReadings] 物件名:', propertyName);
    
    // 部屋名を取得
    const roomName = getRoomName(propertyId, roomId);
    console.log('[updateMeterReadings] 部屋名:', roomName);
    
    // スプレッドシートのデータを取得
    const data = sheet.getDataRange().getValues();
    if (data.length < 1) {
      throw new Error('スプレッドシートにヘッダーがありません');
    }
    
    // ヘッダーから列インデックスを動的に取得
    const headers = data[0];
    console.log('[updateMeterReadings] ========= スプレッドシート詳細情報 =========');
    console.log('[updateMeterReadings] スプレッドシート名:', sheet.getName());
    console.log('[updateMeterReadings] データ行数:', data.length);
    console.log('[updateMeterReadings] スプレッドシートのヘッダー:', headers);
    console.log('[updateMeterReadings] 検針日時列検索:', headers.indexOf('検針日時'));
    console.log('[updateMeterReadings] 今回の指示数列検索:', headers.indexOf('今回の指示数'));
    console.log('[updateMeterReadings] 今回指示数（水道）列検索:', headers.indexOf('今回指示数（水道）'));
    console.log('[updateMeterReadings] ========================================');
    
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
    
    console.log('[updateMeterReadings] データ処理開始 - 対象件数:', readings.length);
    
    // 各検針データを処理
    for (let i = 0; i < readings.length; i++) {
      const reading = readings[i];
      console.log(`[updateMeterReadings] 処理中 [${i}]:`, reading);
      
      let skip = false;
      try {
        // 検針日時の適切な処理
        let recordDate = '';
        if (reading.date && reading.date !== '') {
          if (reading.date instanceof Date) {
            const year = reading.date.getFullYear();
            const month = String(reading.date.getMonth() + 1).padStart(2, '0');
            const day = String(reading.date.getDate()).padStart(2, '0');
            recordDate = `${year}-${month}-${day}`;
          } else {
            recordDate = String(reading.date).trim();
          }
        }
        
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
          if (columnIndexes.currentReading >= 0) data[existingRowIndex][columnIndexes.currentReading] = currentReadingValue;
          if (columnIndexes.usage >= 0) data[existingRowIndex][columnIndexes.usage] = usage;
          if (columnIndexes.warningFlag >= 0) data[existingRowIndex][columnIndexes.warningFlag] = '正常';
          
        } else {
          // 新規データを追加
          const previousReading = 0;
          usage = currentReadingValue;
          
          const newRow = new Array(headers.length).fill('');
          newRow[columnIndexes.propertyId] = propertyId;
          newRow[columnIndexes.roomId] = roomId;
          if (recordDate && columnIndexes.date >= 0) newRow[columnIndexes.date] = recordDate;
          if (columnIndexes.currentReading >= 0) newRow[columnIndexes.currentReading] = currentReadingValue;
          if (columnIndexes.previousReading >= 0) newRow[columnIndexes.previousReading] = previousReading;
          if (columnIndexes.usage >= 0) newRow[columnIndexes.usage] = usage;
          if (columnIndexes.warningFlag >= 0) newRow[columnIndexes.warningFlag] = '正常';
          if (columnIndexes.recordId >= 0) newRow[columnIndexes.recordId] = Utilities.getUuid();
          
          // 物件名と部屋名の設定
          const propertyNameIndex = headers.indexOf('物件名');
          if (propertyNameIndex >= 0) newRow[propertyNameIndex] = propertyName;
          
          const roomNameIndex = headers.indexOf('部屋名');
          if (roomNameIndex >= 0) newRow[roomNameIndex] = roomName;
          
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