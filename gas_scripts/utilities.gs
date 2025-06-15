/**
 * utilities.gs - ユーティリティ関数
 * 共通で使用されるヘルパー関数群
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
