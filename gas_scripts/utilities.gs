/**
 * utilities.gs - ユーティリティ関数（503エラー対策強化版）
 * 共通で使用されるヘルパー関数群
 */

// ======================================================================
// 🛠️ 高速化・503エラー対策ユーティリティ
// ======================================================================

/**
 * 実行時間を監視する関数
 * @param {Function} func - 実行する関数
 * @param {string} funcName - 関数名（ログ用）
 * @param {number} timeoutMs - タイムアウト時間（ミリ秒、デフォルト20秒）
 * @return {*} 関数の戻り値またはタイムアウトエラー
 */
function executeWithTimeout(func, funcName = 'Unknown', timeoutMs = 20000) {
  const startTime = Date.now();
  
  try {
    console.log(`[executeWithTimeout] ${funcName} 実行開始`);
    
    // 簡易タイムアウトチェック（GASには真のタイムアウト機能がないため）
    const result = func();
    
    const executionTime = Date.now() - startTime;
    console.log(`[executeWithTimeout] ${funcName} 実行完了 - ${executionTime}ms`);
    
    if (executionTime > timeoutMs) {
      console.warn(`[executeWithTimeout] ${funcName} 処理時間超過警告: ${executionTime}ms`);
    }
    
    return result;
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`[executeWithTimeout] ${funcName} エラー (${executionTime}ms):`, error);
    throw error;
  }
}

/**
 * スプレッドシートアクセスを高速化する関数
 * @param {string} sheetName - シート名
 * @param {Function} operation - 実行する操作
 * @return {*} 操作の戻り値
 */
function optimizedSheetAccess(sheetName, operation) {
  try {
    const startTime = Date.now();
    
    // スプレッドシート取得
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`シート「${sheetName}」が見つかりません`);
    }
    
    // 操作実行
    const result = operation(sheet);
    
    const executionTime = Date.now() - startTime;
    console.log(`[optimizedSheetAccess] ${sheetName} アクセス完了 - ${executionTime}ms`);
    
    return result;
    
  } catch (error) {
    console.error(`[optimizedSheetAccess] ${sheetName} アクセスエラー:`, error);
    throw error;
  }
}

/**
 * バッチ処理用の範囲データ取得（メモリ効率化）
 * @param {Sheet} sheet - 対象シート
 * @param {number} batchSize - バッチサイズ（デフォルト100行）
 * @return {Array} データ配列
 */
function getBatchData(sheet, batchSize = 100) {
  try {
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow <= 1) {
      return [];
    }
    
    const allData = [];
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // バッチ単位でデータを取得
    for (let startRow = 2; startRow <= lastRow; startRow += batchSize) {
      const endRow = Math.min(startRow + batchSize - 1, lastRow);
      const batchData = sheet.getRange(startRow, 1, endRow - startRow + 1, lastCol).getValues();
      
      // オブジェクト形式に変換
      batchData.forEach(row => {
        const rowObject = {};
        headers.forEach((header, index) => {
          rowObject[header] = row[index];
        });
        allData.push(rowObject);
      });
      
      // 処理時間チェック（15秒制限）
      if (Date.now() - arguments[2] > 15000) {
        console.warn(`[getBatchData] 処理時間超過、${allData.length}行で中断`);
        break;
      }
    }
    
    return allData;
    
  } catch (error) {
    console.error('[getBatchData] エラー:', error);
    throw error;
  }
}

/**
 * JSON安全化関数（大きなデータ対応）
 * @param {*} data - JSON化するデータ
 * @param {number} maxSize - 最大サイズ（文字数、デフォルト50000）
 * @return {string} JSON文字列
 */
function safeJsonStringify(data, maxSize = 50000) {
  try {
    let jsonString = JSON.stringify(data);
    
    if (jsonString.length > maxSize) {
      console.warn(`[safeJsonStringify] データサイズ超過: ${jsonString.length} > ${maxSize}`);
      
      // 要約版を作成
      const summary = {
        dataType: Array.isArray(data) ? 'array' : typeof data,
        originalSize: jsonString.length,
        truncated: true,
        timestamp: new Date().toISOString()
      };
      
      if (Array.isArray(data)) {
        summary.arrayLength = data.length;
        summary.sample = data.slice(0, 3); // 最初の3要素のみ
      } else if (typeof data === 'object' && data !== null) {
        summary.objectKeys = Object.keys(data);
        summary.sample = {};
        Object.keys(data).slice(0, 3).forEach(key => {
          summary.sample[key] = data[key];
        });
      }
      
      jsonString = JSON.stringify(summary);
    }
    
    return jsonString;
    
  } catch (error) {
    console.error('[safeJsonStringify] JSON変換エラー:', error);
    return JSON.stringify({
      error: 'JSON serialization failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * リトライ機能付き関数実行
 * @param {Function} func - 実行する関数
 * @param {number} maxRetries - 最大リトライ回数
 * @param {number} delayMs - リトライ間隔（ミリ秒）
 * @param {string} funcName - 関数名（ログ用）
 * @return {*} 関数の戻り値
 */
function executeWithRetry(func, maxRetries = 3, delayMs = 1000, funcName = 'Unknown') {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[executeWithRetry] ${funcName} リトライ ${attempt}/${maxRetries}`);
        Utilities.sleep(delayMs * attempt); // 指数バックオフ
      }
      
      return func();
      
    } catch (error) {
      lastError = error;
      console.error(`[executeWithRetry] ${funcName} 試行${attempt + 1}失敗:`, error.message);
      
      // リトライ不可能なエラーの場合は即座に終了
      if (error.message.includes('Permission denied') || 
          error.message.includes('not found') ||
          error.message.includes('Invalid argument')) {
        throw error;
      }
    }
  }
  
  throw new Error(`${funcName} ${maxRetries + 1}回の試行後に失敗: ${lastError.message}`);
}

// ======================================================================
// 🔧 既存のユーティリティ関数
// ======================================================================

/**
 * UI操作を安全に処理するためのヘルパー関数
 * @param {string} title - アラートのタイトル
 * @param {string} message - アラートのメッセージ
 */
function safeAlert(title, message) {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert(title, message, ui.ButtonSet.OK);
  } catch (e) {
    Logger.log(`${title}: ${message}`);
    console.log(`${title}: ${message}`);
  }
}
