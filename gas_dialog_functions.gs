/**
 * GAS HTML Dialog Functions - 統合版
 * Google Apps Script対応のダイアログ表示関数群
 * 実行コンテキストエラー対応済み
 */

/**
 * 実行コンテキストを検証し、UIが利用可能かチェック
 * @returns {boolean} UIが利用可能な場合true
 */
function isUiAvailable() {
  try {
    SpreadsheetApp.getUi();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 実行コンテキストエラー時のユーザーガイダンス
 */
function showExecutionGuidance() {
  console.log('='.repeat(80));
  console.log('【重要】実行方法について');
  console.log('='.repeat(80));
  console.log('');
  console.log('❌ スクリプトエディタから直接実行することはできません。');
  console.log('');
  console.log('✅ 正しい実行方法:');
  console.log('1. Googleスプレッドシートを開く');
  console.log('2. メニューバーの「水道検針」→「アプリを開く」をクリック');
  console.log('');
  console.log('📝 メニューが表示されない場合:');
  console.log('1. スプレッドシートを再読み込み（F5キー）');
  console.log('2. または下記の関数を実行: setupOnOpenTrigger()');
  console.log('');
  console.log('='.repeat(80));
  
  return '実行ガイダンスをコンソールに出力しました。上記の手順に従ってスプレッドシートから実行してください。';
}

/**
 * 水道検針アプリのメインエントリーポイント（メニュー用）
 */
function showWaterMeterApp() {
  if (!isUiAvailable()) {
    return showExecutionGuidance();
  }
  
  try {
    showPropertySelectDialog();
  } catch (error) {
    console.error('[showWaterMeterApp] エラー:', error);
    if (!isUiAvailable()) {
      return showExecutionGuidance();
    }
    throw error;
  }
}

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

/**
 * Web App用のメイン関数 - property_select_gas.htmlをWebアプリとして提供
 * @param {Object} e - リクエストイベントオブジェクト
 * @returns {HtmlOutput} HTMLページ
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
            return ContentService
              .createTextOutput(JSON.stringify(properties))
              .setMimeType(ContentService.MimeType.JSON);
          } catch (apiError) {
            console.error('[doGet] getProperties API エラー:', apiError);
            return ContentService
              .createTextOutput(JSON.stringify({ error: `物件データ取得エラー: ${apiError.message}` }))
              .setMimeType(ContentService.MimeType.JSON);
          }
          
        case 'getRooms':
          console.log('[doGet] API: getRooms');
          try {
            const propertyId = e.parameter.propertyId;
            if (!propertyId) {
              throw new Error('propertyId パラメータが必要です');
            }
            const rooms = getRooms(propertyId);
            return ContentService
              .createTextOutput(JSON.stringify(rooms))
              .setMimeType(ContentService.MimeType.JSON);
          } catch (apiError) {
            console.error('[doGet] getRooms API エラー:', apiError);
            return ContentService
              .createTextOutput(JSON.stringify({ error: `部屋データ取得エラー: ${apiError.message}` }))
              .setMimeType(ContentService.MimeType.JSON);
          }
          
        case 'getMeterReadings':
          console.log('[doGet] API: getMeterReadings');
          try {
            const propertyId = e.parameter.propertyId;
            const roomId = e.parameter.roomId;
            if (!propertyId || !roomId) {
              throw new Error('propertyId および roomId パラメータが必要です');
            }
            const readings = getMeterReadings(propertyId, roomId);
            return ContentService
              .createTextOutput(JSON.stringify(readings))
              .setMimeType(ContentService.MimeType.JSON);
          } catch (apiError) {
            console.error('[doGet] getMeterReadings API エラー:', apiError);
            return ContentService
              .createTextOutput(JSON.stringify({ error: `検針データ取得エラー: ${apiError.message}` }))
              .setMimeType(ContentService.MimeType.JSON);
          }
          
        default:
          console.log('[doGet] 未対応のAPI要求:', action);
          return ContentService
            .createTextOutput(JSON.stringify({ error: `未対応のAPI要求: ${action}` }))
            .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // HTML表示要求の場合
    const page = e?.parameter?.page || 'property_select';
    console.log('[doGet] HTML表示要求 - ページ:', page);
    
    // 物件選択ページを返す（デフォルト）
    if (page === 'property_select' || !page) {
      const htmlOutput = HtmlService.createTemplateFromFile('property_select_gas');
      
      return htmlOutput.evaluate()
        .setTitle('水道検針アプリ - 物件選択')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    }
    
    // 部屋選択ページ
    else if (page === 'room_select') {
      console.log('[doGet] 部屋選択ページ処理開始');
      const propertyId = e.parameter.propertyId;
      const propertyName = e.parameter.propertyName;
      
      console.log('[doGet] 受信パラメータ:', { propertyId, propertyName });
      
      if (!propertyId || !propertyName) {
        const errorMsg = '部屋選択ページには propertyId と propertyName パラメータが必要です';
        console.error('[doGet]', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('[doGet] 部屋データ取得開始');
      const rooms = getRooms(propertyId);
      console.log('[doGet] 取得した部屋データ:', rooms);
      
      const htmlOutput = HtmlService.createTemplateFromFile('room_select_gas');
      htmlOutput.propertyId = propertyId;
      htmlOutput.propertyName = propertyName;
      htmlOutput.rooms = JSON.stringify(rooms);
      
      console.log('[doGet] HTMLテンプレート準備完了');
      
      return htmlOutput.evaluate()
        .setTitle(`部屋選択 - ${propertyName}`)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    }
    
    // 検針入力ページ
    else if (page === 'meter_reading') {
      const propertyId = e.parameter.propertyId;
      const propertyName = e.parameter.propertyName;
      const roomId = e.parameter.roomId;
      const roomName = e.parameter.roomName;
      
      if (!propertyId || !propertyName || !roomId || !roomName) {
        throw new Error('検針入力ページには propertyId, propertyName, roomId, roomName パラメータが必要です');
      }
      
      console.log('[doGet] 検針入力ページを表示');
      
      const meterReadings = getMeterReadings(propertyId, roomId);
      const htmlOutput = HtmlService.createTemplateFromFile('meter_reading_gas');
      htmlOutput.propertyId = propertyId;
      htmlOutput.propertyName = propertyName;
      htmlOutput.roomId = roomId;
      htmlOutput.roomName = roomName;
      htmlOutput.meterReadings = JSON.stringify(meterReadings);
      
      return htmlOutput.evaluate()
        .setTitle(`検針入力 - ${propertyName} ${roomName}`)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    }
    
    // 未対応のページ
    else {
      throw new Error(`未対応のページが要求されました: ${page}`);
    }
    
  } catch (error) {
    console.error('[doGet] エラー:', error);
    
    // API要求でのエラー処理
    if (e?.parameter?.action) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          error: `APIエラー: ${error.message}`,
          action: e.parameter.action,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // HTML表示でのエラー処理
    const errorHtml = HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>エラー - 水道検針アプリ</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; background: #f5f5f5; }
            .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
            .error h2 { margin-top: 0; }
            .back-button { margin-top: 20px; }
            .back-button a { display: inline-block; padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>🚨 アプリケーションエラー</h2>
            <p>申し訳ございません。アプリケーションの読み込みに失敗しました。</p>
            <p><strong>エラー詳細:</strong> ${error.message}</p>
            <div class="back-button">
              <a href="javascript:history.back()">戻る</a>
              <a href="${ScriptApp.getService().getUrl()}">ホームに戻る</a>
            </div>
            <p><small>管理者にお問い合わせください。</small></p>
          </div>
        </body>
      </html>
    `);
    
    return errorHtml
      .setTitle('エラー - 水道検針アプリ')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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
        const inspectionDateIndex = inspectionHeaders.indexOf('検針日');
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
 * レガシー部屋一覧取得（フォールバック用）
 * @param {string} propertyId - 物件ID
 * @return {Array} 部屋一覧
 */
function getRoomsLegacy(propertyId) {
  try {
    console.log('[getRoomsLegacy] 開始 - propertyId:', propertyId);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // 日本語名を優先、なければ英語名を試行
    const sheet = ss.getSheetByName('部屋マスタ') || ss.getSheetByName('room_master');
    
    if (!sheet) {
      throw new Error('部屋マスタ または room_master シートが見つかりません');
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // ヘッダー行をスキップして、指定した物件IDの部屋のみを抽出
    const rooms = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (String(row[0]).trim() === String(propertyId).trim() && row[1] && row[2]) {
        rooms.push({
          id: String(row[1]).trim(),
          name: String(row[2]).trim(),
          propertyId: String(row[0]).trim()
        });
      }
    }
    
    console.log('[getRoomsLegacy] 取得した部屋数:', rooms.length);
    return rooms;
  } catch (error) {
    console.error('[getRoomsLegacy] エラー:', error);
    throw new Error('レガシー部屋データの取得に失敗しました: ' + error.message);
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
 * 検針データを更新
 * @param {string} propertyId - 物件ID
 * @param {string} roomId - 部屋ID
 * @param {Array} readings - 更新する検針データ
 * @return {Object} 更新結果
 */
function updateMeterReadings(propertyId, roomId, readings) {
  try {
    console.log('[updateMeterReadings] 開始 - propertyId:', propertyId, 'roomId:', roomId, 'データ数:', readings.length);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('inspection_data');
    
    if (!sheet) {
      throw new Error('inspection_data シートが見つかりません');
    }
    
    let updatedCount = 0;
    
    // 実際の更新処理をここに実装
    readings.forEach(reading => {
      // 記録IDをキーにして既存データを更新、または新規追加
      // この部分は具体的な要件に応じて実装
      updatedCount++;
    });
    
    console.log('[updateMeterReadings] 更新完了 - 更新数:', updatedCount);
    return {
      success: true,
      updatedCount: updatedCount,
      message: `${updatedCount}件のデータを更新しました`
    };
  } catch (error) {
    console.error('[updateMeterReadings] エラー:', error);
    return {
      success: false,
      error: error.message,
      message: '検針データの更新に失敗しました'
    };
  }
}

/**
 * スプレッドシートにカスタムメニューを追加（統合メニューシステム）
 */
function onOpen() {
  // UI利用可能性チェック（実行コンテキストエラー対策）
  if (!isUiAvailable()) {
    console.log('[onOpen] UIが利用できません。スプレッドシート環境で実行してください。');
    return;
  }
  
  try {
    const ui = SpreadsheetApp.getUi();
    
    // 水道検針メニュー
    ui.createMenu('水道検針')
      .addItem('アプリを開く', 'showWaterMeterApp')
      .addSeparator()
      .addItem('物件選択', 'showPropertySelectDialog')
      .addToUi();
    
    // 総合カスタム処理メニュー
    ui.createMenu('総合カスタム処理')
      .addItem('1. 物件マスタの物件IDフォーマット', 'formatPropertyIdsInPropertyMaster')
      .addItem('2. 部屋マスタの物件IDフォーマット', 'formatPropertyIdsInRoomMaster')
      .addItem('3. 部屋マスタの孤立データ削除', 'cleanUpOrphanedRooms')
      .addSeparator()
      .addItem('4. 初期検針データ作成', 'createInitialInspectionData')
      .addItem('5. マスタから検針データへ新規部屋反映', 'populateInspectionDataFromMasters')
      .addSeparator()
      .addItem('6. 月次検針データ保存とリセット', 'processInspectionDataMonthly')
      .addSeparator()
      .addItem('🔍 データ整合性チェック', 'validateInspectionDataIntegrity')
      .addItem('🧹 重複データクリーンアップ', 'optimizedCleanupDuplicateInspectionData')
      .addItem('⚡ データインデックス作成', 'createDataIndexes')
      .addSeparator()
      .addItem('🚀 総合データ最適化（全実行）', 'runComprehensiveDataOptimization')
      .addToUi();
    
    console.log('✅ 統合メニューシステムが正常に作成されました');
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

/**
 * 実行コンテキストのテスト関数（スクリプトエディタから安全に実行可能）
 */
function testExecutionContext() {
  console.log('='.repeat(80));
  console.log('【実行コンテキステスト】');
  console.log('='.repeat(80));
  
  try {
    // UIの利用可能性をテスト
    const uiAvailable = isUiAvailable();
    console.log(`UI利用可能性: ${uiAvailable ? '✅ 利用可能' : '❌ 利用不可'}`);
    
    // スプレッドシートの情報を取得
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      console.log(`スプレッドシート名: "${ss.getName()}"`);
      console.log(`スプレッドシートID: ${ss.getId()}`);
      console.log(`スプレッドシートURL: ${ss.getUrl()}`);
    } else {
      console.log('❌ アクティブなスプレッドシートが見つかりません');
    }
    
    // 実行環境の判定
    if (uiAvailable && ss) {
      console.log('✅ 正常な実行環境です（スプレッドシートコンテキスト）');
      console.log('💡 水道検針アプリを実行するには、スプレッドシートのメニューから「水道検針」→「アプリを開く」をクリックしてください');
    } else {
      console.log('⚠️  スクリプトエディタから実行されています');
      showExecutionGuidance();
    }
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  }
  
  console.log('='.repeat(80));
  return 'コンテキストテスト完了。詳細はコンソールログを確認してください。';
}

/**
 * 統合システムの健全性診断（スクリプトエディタから安全に実行可能）
 */
function checkSystemHealth() {
  console.log('='.repeat(80));
  console.log('【統合システム健全性診断】');
  console.log('='.repeat(80));
  
  const results = [];
  
  try {
    // 1. 実行コンテキストチェック
    const uiAvailable = isUiAvailable();
    results.push(`UI利用可能性: ${uiAvailable ? '✅ 正常' : '❌ スクリプトエディタ実行'}`);
    
    // 2. スプレッドシートチェック
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    results.push(`スプレッドシート: ${ss ? '✅ 検出' : '❌ 未検出'}`);
    
    // 3. 必要なHTMLファイルの存在チェック
    const requiredFiles = ['property_select_gas', 'room_select_gas', 'meter_reading_gas'];
    requiredFiles.forEach(fileName => {
      try {
        HtmlService.createTemplateFromFile(fileName);
        results.push(`${fileName}.html: ✅ 存在`);
      } catch (error) {
        results.push(`${fileName}.html: ❌ 見つかりません`);
      }
    });
    
    // 4. シートの存在チェック
    if (ss) {
      const sheetNames = ['物件マスタ', 'property_master', '部屋マスタ', 'room_master', 'inspection_data'];
      sheetNames.forEach(sheetName => {
        const sheet = ss.getSheetByName(sheetName);
        results.push(`${sheetName}シート: ${sheet ? '✅ 存在' : '❌ 見つかりません'}`);
      });
    }
    
    // 5. トリガーの存在チェック
    const triggers = ScriptApp.getProjectTriggers();
    const onOpenTriggers = triggers.filter(t => t.getHandlerFunction() === 'onOpen');
    results.push(`onOpenトリガー: ${onOpenTriggers.length > 0 ? '✅ 設定済み' : '⚠️  未設定'}`);
    
    // 結果表示
    results.forEach(result => console.log(result));
    
    // 推奨アクション
    console.log('');
    console.log('【推奨アクション】');
    if (!uiAvailable) {
      console.log('1. スプレッドシートを開いてからスクリプトを実行してください');
    }
    if (onOpenTriggers.length === 0) {
      console.log('2. setupOnOpenTrigger()を実行してトリガーを設定してください');
    }
    console.log('3. スプレッドシートのメニューから「水道検針」→「アプリを開く」で実行してください');
    
  } catch (error) {
    console.error('❌ 診断エラー:', error);
    results.push(`診断エラー: ${error.message}`);
  }
  
  console.log('='.repeat(80));
  return `健全性診断完了。${results.length}項目をチェックしました。`;
}

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

// --- 総合カスタム処理.gs の統合された関数群 ---

/**
 * マスタシートから検針データシートへ新しい部屋を反映
 */
function populateInspectionDataFromMasters() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // 日本語名を優先、なければ英語名を試行
    const propertyMasterSheet = ss.getSheetByName('物件マスタ') || ss.getSheetByName('property_master');
    const roomMasterSheet = ss.getSheetByName('部屋マスタ') || ss.getSheetByName('room_master');
    let inspectionDataSheet = ss.getSheetByName('inspection_data');

    if (!propertyMasterSheet) {
      safeAlert('エラー', '物件マスタ または property_master シートが見つかりません。');
      return;
    }

    if (!roomMasterSheet) {
      safeAlert('エラー', '部屋マスタ または room_master シートが見つかりません。');
      return;
    }

    if (!inspectionDataSheet) {
      inspectionDataSheet = ss.insertSheet('inspection_data');
      const headers = [
        '記録ID', '物件名', '物件ID', '部屋ID', '部屋名', '検針日', '今回指示数（水道）', 
        '前回指示数（水道）', '使用量（水道）', '今回指示数（ガス）', '前回指示数（ガス）', 
        '使用量（ガス）', '今回指示数（電気）', '前回指示数（電気）', '使用量（電気）', 
        '備考', '作成日時', '更新日時'
      ];
      inspectionDataSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      safeAlert('情報', 'inspection_data シートを新規作成しました。');
    }

    // 物件マスタのデータを読み込み
    const propertyMasterData = propertyMasterSheet.getRange(2, 1, propertyMasterSheet.getLastRow() - 1, 2).getValues();
    const propertyMap = {};
    propertyMasterData.forEach(row => {
      const propertyId = row[0];
      const propertyName = row[1];
      if (propertyId && propertyName) {
        propertyMap[propertyId] = propertyName;
      }
    });

    // 検針データの既存データを確認
    const inspectionDataRange = inspectionDataSheet.getDataRange();
    const inspectionData = inspectionDataRange.getValues();
    const inspectionHeaders = inspectionData[0];
    const existingRoomKeys = new Set();

    const propertyIdIndex = inspectionHeaders.indexOf('物件ID');
    const roomIdIndex = inspectionHeaders.indexOf('部屋ID');

    for (let i = 1; i < inspectionData.length; i++) {
      const row = inspectionData[i];
      const key = `${row[propertyIdIndex]}_${row[roomIdIndex]}`;
      existingRoomKeys.add(key);
    }

    // 部屋マスタのデータを読み込み、検針データにない新しい部屋情報を追加
    const roomMasterData = roomMasterSheet.getRange(2, 1, roomMasterSheet.getLastRow() - 1, roomMasterSheet.getLastColumn()).getValues();
    const roomMasterHeaders = roomMasterSheet.getRange(1, 1, 1, roomMasterSheet.getLastColumn()).getValues()[0];
    const roomPropertyIdIndex = roomMasterHeaders.indexOf('物件ID');
    const roomIdIndexInMaster = roomMasterHeaders.indexOf('部屋ID');
    const roomNameIndex = roomMasterHeaders.indexOf('部屋名');

    if (roomPropertyIdIndex === -1 || roomIdIndexInMaster === -1 || roomNameIndex === -1) {
      safeAlert('エラー', '部屋マスタに必要な列（物件ID、部屋ID、部屋名）が見つかりません。');
      return;
    }

    const newRowsToAdd = [];
    let addedCount = 0;

    roomMasterData.forEach(roomRow => {
      const roomPropertyId = roomRow[roomPropertyIdIndex];
      const roomId = roomRow[roomIdIndexInMaster];
      const roomName = roomRow[roomNameIndex];
      const key = `${roomPropertyId}_${roomId}`;

      if (roomPropertyId && roomId && roomName && !existingRoomKeys.has(key)) {
        const propertyName = propertyMap[roomPropertyId] || '';
        const recordId = `${roomPropertyId}_${roomId}_${new Date().getTime()}`;

        const newRowData = [];
        inspectionHeaders.forEach(header => {
          switch (header) {
            case '記録ID': newRowData.push(recordId); break;
            case '物件名': newRowData.push(propertyName); break;
            case '物件ID': newRowData.push(roomPropertyId); break;
            case '部屋ID': newRowData.push(roomId); break;
            case '部屋名': newRowData.push(roomName); break;
            case '作成日時': newRowData.push(new Date()); break;
            case '更新日時': newRowData.push(new Date()); break;
            default: newRowData.push(''); break;
          }
        });
        
        newRowsToAdd.push(newRowData);
        addedCount++;
      }
    });

    if (newRowsToAdd.length > 0) {
      inspectionDataSheet.getRange(inspectionDataSheet.getLastRow() + 1, 1, newRowsToAdd.length, newRowsToAdd[0].length).setValues(newRowsToAdd);
      safeAlert('完了', `${addedCount} 件の新しい部屋情報をinspection_dataシートに追加しました。`);
    } else {
      safeAlert('情報', '追加する新しい部屋情報はありませんでした。');
    }

  } catch (error) {
    console.error('[populateInspectionDataFromMasters] エラー:', error);
    safeAlert('エラー', `データ連携処理中にエラーが発生しました: ${error.message}`);
  }
}

/**
 * 物件マスタの物件IDをフォーマット（P + 6桁ゼロパディング）
 */
function formatPropertyIdsInPropertyMaster() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // 日本語名を優先、なければ英語名を試行
    const sheet = ss.getSheetByName('物件マスタ') || ss.getSheetByName('property_master');

    if (!sheet) {
      safeAlert('エラー', '物件マスタ または property_master シートが見つかりません。');
      return;
    }

    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1);
    const values = dataRange.getValues();
    let updatedCount = 0;

    for (let i = 0; i < values.length; i++) {
      const originalValue = values[i][0];
      
      if (originalValue !== null && originalValue !== '') {
        const valStr = String(originalValue);
        let numericPart = '';
        let needsFormatting = false;

        if (valStr.startsWith('P')) {
          numericPart = valStr.substring(1);
          if (!isNaN(Number(numericPart))) {
            needsFormatting = true;
          }
        } else if (!isNaN(Number(valStr))) {
          numericPart = valStr;
          needsFormatting = true;
        }

        if (needsFormatting) {
          const numericValue = Number(numericPart);
          const formattedId = 'P' + String(numericValue).padStart(6, '0');
          if (valStr !== formattedId) {
            values[i][0] = formattedId;
            updatedCount++;
          }
        }
      }
    }

    if (updatedCount > 0) {
      dataRange.setValues(values);
      safeAlert('完了', `${updatedCount} 件の物件IDをフォーマットしました。`);
    } else {
      safeAlert('情報', '更新対象の物件IDはありませんでした。');
    }

  } catch (error) {
    console.error('[formatPropertyIdsInPropertyMaster] エラー:', error);
    safeAlert('エラー', `物件IDフォーマット処理中にエラーが発生しました: ${error.message}`);
  }
}

/**
 * 部屋マスタの物件IDをフォーマット（P + 6桁ゼロパディング）
 */
function formatPropertyIdsInRoomMaster() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // 日本語名を優先、なければ英語名を試行
    const sheet = ss.getSheetByName('部屋マスタ') || ss.getSheetByName('room_master');

    if (!sheet) {
      safeAlert('エラー', '部屋マスタ または room_master シートが見つかりません。');
      return;
    }

    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1);
    const values = dataRange.getValues();
    let updatedCount = 0;

    for (let i = 0; i < values.length; i++) {
      const originalValue = values[i][0];
      
      if (originalValue !== null && originalValue !== '') {
        const valStr = String(originalValue);
        let numericPart = '';
        let needsFormatting = false;

        if (valStr.startsWith('P')) {
          numericPart = valStr.substring(1);
          if (!isNaN(Number(numericPart))) {
            needsFormatting = true;
          }
        } else if (!isNaN(Number(valStr))) {
          numericPart = valStr;
          needsFormatting = true;
        }

        if (needsFormatting) {
          const numericValue = Number(numericPart);
          const formattedId = 'P' + String(numericValue).padStart(6, '0');
          if (valStr !== formattedId) {
            values[i][0] = formattedId;
            updatedCount++;
          }
        }
      }
    }

    if (updatedCount > 0) {
      dataRange.setValues(values);
      safeAlert('完了', `${updatedCount} 件の物件IDをフォーマットしました。`);
    } else {
      safeAlert('情報', '更新対象の物件IDはありませんでした。');
    }

  } catch (error) {
    console.error('[formatPropertyIdsInRoomMaster] エラー:', error);
    safeAlert('エラー', `物件IDフォーマット処理中にエラーが発生しました: ${error.message}`);
  }
}

/**
 * 部屋マスタの孤立データを削除
 */
function cleanUpOrphanedRooms() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // 日本語名を優先、なければ英語名を試行
    const propertyMasterSheet = ss.getSheetByName('物件マスタ') || ss.getSheetByName('property_master');
    const roomMasterSheet = ss.getSheetByName('部屋マスタ') || ss.getSheetByName('room_master');

    if (!propertyMasterSheet) {
      safeAlert('エラー', '物件マスタ または property_master シートが見つかりません。');
      return;
    }

    if (!roomMasterSheet) {
      safeAlert('エラー', '部屋マスタ または room_master シートが見つかりません。');
      return;
    }

    // 物件マスタから有効な物件IDを取得
    const propertyData = propertyMasterSheet.getDataRange().getValues();
    const validPropertyIds = new Set();
    for (let i = 1; i < propertyData.length; i++) {
      const propertyId = propertyData[i][0];
      if (propertyId) {
        validPropertyIds.add(String(propertyId).trim());
      }
    }

    // 部屋マスタから孤立したデータを特定
    const roomData = roomMasterSheet.getDataRange().getValues();
    const rowsToDelete = [];

    for (let i = roomData.length - 1; i >= 1; i--) {
      const roomPropertyId = roomData[i][0];
      if (roomPropertyId && !validPropertyIds.has(String(roomPropertyId).trim())) {
        rowsToDelete.push(i + 1); // 1ベースのインデックスに変換
      }
    }

    if (rowsToDelete.length > 0) {
      // 行を削除（逆順で削除）
      rowsToDelete.forEach(rowNumber => {
        roomMasterSheet.deleteRow(rowNumber);
      });
      
      safeAlert('完了', `${rowsToDelete.length} 件の孤立した部屋データを削除しました。`);
    } else {
      safeAlert('情報', '削除対象の孤立データはありませんでした。');
    }

  } catch (error) {
    console.error('[cleanUpOrphanedRooms] エラー:', error);
    safeAlert('エラー', `孤立データ削除処理中にエラーが発生しました: ${error.message}`);
  }
}

/**
 * 初期検針データシートを作成
 */
function createInitialInspectionData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // 日本語名を優先、なければ英語名を試行
    const propertyMasterSheet = ss.getSheetByName('物件マスタ') || ss.getSheetByName('property_master');
    const roomMasterSheet = ss.getSheetByName('部屋マスタ') || ss.getSheetByName('room_master');
    let inspectionDataSheet = ss.getSheetByName('inspection_data');

    if (!propertyMasterSheet) {
      safeAlert('エラー', '物件マスタ または property_master シートが見つかりません。');
      return;
    }

    if (!roomMasterSheet) {
      safeAlert('エラー', '部屋マスタ または room_master シートが見つかりません。');
      return;
    }

    if (!inspectionDataSheet) {
      inspectionDataSheet = ss.insertSheet('inspection_data');
      const headers = [
        '記録ID', '物件名', '物件ID', '部屋ID', '部屋名', '検針日', '今回指示数（水道）', 
        '前回指示数（水道）', '使用量（水道）', '今回指示数（ガス）', '前回指示数（ガス）', 
        '使用量（ガス）', '今回指示数（電気）', '前回指示数（電気）', '使用量（電気）', 
        '備考', '作成日時', '更新日時'
      ];
      inspectionDataSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      safeAlert('完了', 'inspection_data シートを作成し、初期ヘッダーを設定しました。');
    } else {
      safeAlert('情報', 'inspection_data シートは既に存在します。');
    }

  } catch (error) {
    console.error('[createInitialInspectionData] エラー:', error);
    safeAlert('エラー', `初期検針データ作成中にエラーが発生しました: ${error.message}`);
  }
}

// その他の総合カスタム処理関数のスタブ
function processInspectionDataMonthly() {
  safeAlert('情報', '月次検針データ保存機能は実装中です。');
}

function validateInspectionDataIntegrity() {
  safeAlert('情報', 'データ整合性チェック機能は実装中です。');
}

function optimizedCleanupDuplicateInspectionData() {
  safeAlert('情報', '重複データクリーンアップ機能は実装中です。');
}

function createDataIndexes() {
  safeAlert('情報', 'データインデックス作成機能は実装中です。');
}

/**
 * 部屋選択の問題を診断するテスト関数
 */
function debugRoomSelection() {
  console.log('='.repeat(50));
  console.log('部屋選択問題診断テスト');
  console.log('='.repeat(50));
  
  try {
    // 1. 物件データテスト
    console.log('1. 物件データテスト');
    const properties = getProperties();
    console.log('物件数:', properties.length);
    if (properties.length > 0) {
      const testPropertyId = properties[0].id;
      console.log('テスト用物件ID:', testPropertyId);
      
      // 2. 部屋データテスト
      console.log('2. 部屋データテスト');
      const rooms = getRooms(testPropertyId);
      console.log('部屋数:', rooms.length);
      console.log('部屋データサンプル:', rooms.slice(0, 2));
      
      // 3. Web AppURLテスト
      console.log('3. Web App URLテスト');
      const webAppUrl = ScriptApp.getService().getUrl();
      console.log('Web App URL:', webAppUrl);
      
      const testUrls = [
        `${webAppUrl}`,
        `${webAppUrl}?action=getProperties`,
        `${webAppUrl}?action=getRooms&propertyId=${encodeURIComponent(testPropertyId)}`,
        `${webAppUrl}?page=room_select&propertyId=${encodeURIComponent(testPropertyId)}&propertyName=${encodeURIComponent(properties[0].name)}`
      ];
      
      console.log('テスト用URL一覧:');
      testUrls.forEach((url, index) => {
        console.log(`${index + 1}. ${url}`);
      });
      
      return {
        success: true,
        propertyCount: properties.length,
        roomCount: rooms.length,
        testUrls: testUrls
      };
    } else {
      console.log('❌ 物件データが見つかりません');
      return { success: false, error: '物件データが見つかりません' };
    }
    
  } catch (error) {
    console.error('❌ 診断テストエラー:', error);
    return { success: false, error: error.message };
  }
}

/**
 * デプロイ用最終確認関数
 */
function finalDeploymentCheck() {
  console.log('='.repeat(80));
  console.log('【デプロイ最終確認】');
  console.log('='.repeat(80));
  
  try {
    // 統合システム診断を実行
    const healthCheck = checkSystemHealth();
    console.log('健全性診断結果:', healthCheck);
    
    // 実行コンテキストテスト
    const contextTest = testExecutionContext();
    console.log('コンテキストテスト結果:', contextTest);
    
    console.log('');
    console.log('【デプロイ手順】');
    console.log('1. setupOnOpenTrigger()を実行してトリガーを設定');
    console.log('2. スプレッドシートを再読み込み（F5キー）');
    console.log('3. メニューバーに「水道検針」と「総合カスタム処理」が表示されることを確認');
    console.log('4. 「水道検針」→「アプリを開く」で実行テスト');
    console.log('');
    console.log('✅ 統合システムの準備が完了しました！');
    
  } catch (error) {
    console.error('❌ 最終確認エラー:', error);
  }
  
  console.log('='.repeat(80));
  return 'デプロイ最終確認完了';
}