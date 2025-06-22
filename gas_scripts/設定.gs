// ======================================================================
// スプレッドシート設定ファイル（503エラー対策強化版）
// 全プロジェクトで使用されるスプレッドシートIDを集中管理
// ======================================================================

// スプレッドシートIDの設定
// 本番環境のスプレッドシートID
const CONFIG_SPREADSHEET_ID = '1FLXQSL-kH_wEACzk2OO28eouGp-JFRg7QEUNz5t2fg0';

// ======================================================================
// 🔧 503エラー対策・パフォーマンス設定
// ======================================================================

// API設定
const API_CONFIG = {
  VERSION: 'v3.0.0-error-resilient',
  LAST_UPDATED: '2025-06-22 JST',
  
  // タイムアウト設定
  TIMEOUT_MS: 25000,          // 25秒（GASの30秒制限より短く）
  AUTH_TIMEOUT_MS: 15000,     // 認証処理のタイムアウト
  SHEET_ACCESS_TIMEOUT_MS: 10000, // シートアクセスのタイムアウト
  
  // リトライ設定
  MAX_RETRIES: 5,             // 最大リトライ回数
  RETRY_BASE_DELAY_MS: 1000,  // ベース遅延時間
  RETRY_MAX_DELAY_MS: 8000,   // 最大遅延時間
  
  // データ処理設定
  BATCH_SIZE: 100,            // バッチ処理のサイズ
  MAX_RESPONSE_SIZE: 50000,   // 最大レスポンスサイズ（文字数）
  MAX_PROCESSING_ROWS: 1000,  // 一度に処理する最大行数
  
  // ログレベル
  LOG_LEVEL: 'INFO',          // DEBUG, INFO, WARN, ERROR
  ENABLE_PERFORMANCE_LOG: true, // パフォーマンスログ有効化
};

// エラーメッセージ設定
const ERROR_MESSAGES = {
  TIMEOUT: 'リクエスト処理がタイムアウトしました',
  AUTH_FAILED: '認証に失敗しました',
  SHEET_NOT_FOUND: 'シートが見つかりません',
  PERMISSION_DENIED: 'アクセス権限がありません',
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  SERVER_OVERLOAD: 'サーバーが一時的に過負荷状態です',
  INVALID_PARAMETER: '無効なパラメータが指定されました',
  DATA_TOO_LARGE: 'データサイズが大きすぎます',
  UNKNOWN_ERROR: '予期しないエラーが発生しました'
};

// サポートされているアクション一覧
const SUPPORTED_ACTIONS = [
  'test',
  'authenticate', 
  'getProperties',
  'getRooms',
  'getMeterReadings',
  'updateMeterReadings',
  'completeInspection',
  'saveInspectionData'
];

/**
 * API設定を取得する関数
 * @return {Object} API設定オブジェクト
 */
function getApiConfig() {
  return API_CONFIG;
}

/**
 * エラーメッセージを取得する関数
 * @param {string} errorType - エラータイプ
 * @return {string} エラーメッセージ
 */
function getErrorMessage(errorType) {
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * サポートされているアクション一覧を取得
 * @return {Array} サポートアクション配列
 */
function getSupportedActions() {
  return SUPPORTED_ACTIONS;
}

/**
 * パフォーマンス監視設定
 * @param {string} operation - 操作名
 * @param {number} startTime - 開始時間
 * @param {number} endTime - 終了時間
 */
function logPerformance(operation, startTime, endTime = null) {
  if (!API_CONFIG.ENABLE_PERFORMANCE_LOG) return;
  
  const actualEndTime = endTime || Date.now();
  const duration = actualEndTime - startTime;
  
  const logLevel = duration > API_CONFIG.TIMEOUT_MS ? 'WARN' : 'INFO';
  const message = `[Performance] ${operation}: ${duration}ms`;
  
  if (logLevel === 'WARN') {
    console.warn(message);
  } else {
    console.log(message);
  }
  
  // 超過警告
  if (duration > API_CONFIG.TIMEOUT_MS) {
    console.warn(`[Performance] ${operation} がタイムアウト設定(${API_CONFIG.TIMEOUT_MS}ms)を超過しました`);
  }
}

/**
 * リトライ遅延時間を計算（指数バックオフ + ジッター）
 * @param {number} retryCount - リトライ回数
 * @return {number} 遅延時間（ミリ秒）
 */
function calculateRetryDelay(retryCount) {
  const baseDelay = API_CONFIG.RETRY_BASE_DELAY_MS;
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);
  const jitter = Math.random() * 1000; // 0-1秒のランダム遅延
  
  return Math.min(exponentialDelay + jitter, API_CONFIG.RETRY_MAX_DELAY_MS);
}

// ======================================================================
// 🏠 既存の設定関数
// ======================================================================

/**
 * 設定されたスプレッドシートIDを取得する関数
 * 他のスクリプトファイルから呼び出される共通関数
 * 
 * @return {string} スプレッドシートID
 */
function getConfigSpreadsheetId() {
  return CONFIG_SPREADSHEET_ID;
}

/**
 * アクティブなスプレッドシートIDを安全に取得する関数
 * 実行時環境でのスプレッドシートIDを動的に取得
 * 
 * @return {string|null} スプレッドシートID、取得できない場合はnull
 */
function getActiveSpreadsheetId() {
  try {
    const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSpreadsheet) {
      return activeSpreadsheet.getId();
    } else {
      Logger.log('警告: アクティブなスプレッドシートが見つかりません');
      return null;
    }
  } catch (e) {
    Logger.log(`スプレッドシートID取得エラー: ${e.message}`);
    return null;
  }
}

/**
 * 設定ファイルの状態を確認する診断関数
 * スクリプトエディタから安全に実行可能
 */
function checkConfigStatus() {
  try {
    Logger.log('=== スプレッドシート設定確認 ===');
    Logger.log(`設定済みスプレッドシートID: ${CONFIG_SPREADSHEET_ID}`);
    
    const activeId = getActiveSpreadsheetId();
    Logger.log(`アクティブスプレッドシートID: ${activeId || '取得できませんでした'}`);
    
    if (activeId && activeId === CONFIG_SPREADSHEET_ID) {
      Logger.log('✅ 設定とアクティブスプレッドシートが一致しています');
    } else if (activeId) {
      Logger.log('⚠️ 設定とアクティブスプレッドシートが異なります');
    } else {
      Logger.log('❌ アクティブスプレッドシートを取得できませんでした');
    }
    
    return 'Config check completed';
  } catch (e) {
    Logger.log(`設定確認エラー: ${e.message}`);
    return `エラー: ${e.message}`;
  }
}

/**
 * 現在の設定を更新する関数（開発・管理用）
 * 新しいスプレッドシートIDに変更する際に使用
 * 
 * @param {string} newSpreadsheetId 新しいスプレッドシートID
 * @return {boolean} 更新成功フラグ
 */
function updateSpreadsheetConfig(newSpreadsheetId) {
  try {
    // 注意: この関数は実行時にはCONFIG_SPREADSHEET_IDを動的に変更できません
    // 実際の更新は手動でコードを編集する必要があります
    Logger.log('⚠️ スプレッドシートID設定を更新するには、');
    Logger.log('CONFIG_SPREADSHEET_ID の値を手動で編集してください');
    Logger.log(`現在の設定: ${CONFIG_SPREADSHEET_ID}`);
    Logger.log(`新しい値: ${newSpreadsheetId}`);
    
    return false;
  } catch (e) {
    Logger.log(`設定更新エラー: ${e.message}`);
    return false;
  }
}
