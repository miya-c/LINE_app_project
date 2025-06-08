// ===================================================
// 日付デバッグ専用GSファイル - date_debug.gs
// スプレッドシートの検針日時を取得してコンソールで詳細表示
// 1日ずれ問題の原因調査用
// ===================================================

// スプレッドシートIDを設定ファイルから取得
function getSpreadsheetId() {
  try {
    const configId = getConfigSpreadsheetId();
    if (!configId) {
      throw new Error('設定ファイルにスプレッドシートIDが設定されていません');
    }
    console.log(`✅ 設定ファイルからスプレッドシートID取得成功: ${configId}`);
    return configId;
  } catch (e) {
    console.log(`❌ 設定ファイルからスプレッドシートID取得エラー: ${e.message}`);
    console.log(`🔧 対処法: spreadsheet_config.gs でスプレッドシートIDを正しく設定してください`);
    
    // フォールバックとしてアクティブスプレッドシートを試行
    try {
      const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSpreadsheet) {
        const fallbackId = activeSpreadsheet.getId();
        console.log(`🔄 アクティブスプレッドシートを使用: ${fallbackId}`);
        return fallbackId;
      }
    } catch (activeError) {
      console.log(`❌ アクティブスプレッドシート取得もエラー: ${activeError.message}`);
    }
    
    throw new Error(`スプレッドシートIDが取得できません。spreadsheet_config.gs を確認してください。`);
  }
}

// 動的にスプレッドシートインスタンスを取得する関数
function getSpreadsheetInstance() {
  const spreadsheetId = getSpreadsheetId();
  return SpreadsheetApp.openById(spreadsheetId);
}

// 🔍 メイン関数: 検針日時の詳細デバッグ表示
function debugInspectionDates() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 検針日時データ詳細デバッグ開始');
  console.log('='.repeat(60));
  
  try {
    const spreadsheet = getSpreadsheetInstance();
    const sheet = spreadsheet.getSheetByName('inspection_data');
    
    if (!sheet) {
      console.log("❌ 'inspection_data'シートが見つかりません");
      console.log("📋 利用可能なシート名:", spreadsheet.getSheets().map(s => s.getName()));
      return;
    }
    
    console.log("✅ 'inspection_data'シートが見つかりました");
    
    // データ範囲を取得
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    console.log('\n📊 シート基本情報:');
    console.log(`- 総行数: ${data.length}`);
    console.log(`- 総列数: ${headers.length}`);
    console.log(`- ヘッダー: [${headers.join(', ')}]`);
    
    // 検針日時の列インデックスを取得
    const dateIndex = headers.indexOf('検針日時');
    const propertyIdIndex = headers.indexOf('物件ID');
    const roomIdIndex = headers.indexOf('部屋ID');
    
    if (dateIndex === -1) {
      console.log("❌ '検針日時'列が見つかりません");
      console.log(`📋 利用可能な列名: [${headers.join(', ')}]`);
      return;
    }
    
    console.log(`\n📍 重要な列のインデックス:`);
    console.log(`- 検針日時: ${dateIndex}`);
    console.log(`- 物件ID: ${propertyIdIndex}`);
    console.log(`- 部屋ID: ${roomIdIndex}`);
    
    // 各行の検針日時データを詳細表示
    console.log('\n' + '='.repeat(50));
    console.log('📅 各行の検針日時データ詳細分析');
    console.log('='.repeat(50));
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rawDateValue = row[dateIndex];
      const propertyId = row[propertyIdIndex];
      const roomId = row[roomIdIndex];
      
      console.log(`\n🔍 行 ${i} の詳細分析:`);
      console.log(`- 物件ID: "${propertyId}"`);
      console.log(`- 部屋ID: "${roomId}"`);
      console.log(`- 検針日時（生データ）: ${rawDateValue}`);
      console.log(`- データ型: ${typeof rawDateValue}`);
      console.log(`- nullチェック: ${rawDateValue === null}`);
      console.log(`- 空文字チェック: ${rawDateValue === ''}`);
      console.log(`- undefinedチェック: ${rawDateValue === undefined}`);
      
      if (rawDateValue instanceof Date) {
        console.log(`- Date型詳細分析:`);
        console.log(`  - toString(): ${rawDateValue.toString()}`);
        console.log(`  - toISOString(): ${rawDateValue.toISOString()}`);
        console.log(`  - toLocaleDateString(): ${rawDateValue.toLocaleDateString()}`);
        console.log(`  - toLocaleDateString('ja-JP'): ${rawDateValue.toLocaleDateString('ja-JP')}`);
        console.log(`  - getFullYear(): ${rawDateValue.getFullYear()}`);
        console.log(`  - getMonth() + 1: ${rawDateValue.getMonth() + 1}`);
        console.log(`  - getDate(): ${rawDateValue.getDate()}`);
        console.log(`  - getTime(): ${rawDateValue.getTime()}`);
        console.log(`  - getTimezoneOffset(): ${rawDateValue.getTimezoneOffset()}`);
        
        // 🔧 修正用の日付文字列作成
        const year = rawDateValue.getFullYear();
        const month = String(rawDateValue.getMonth() + 1).padStart(2, '0');
        const day = String(rawDateValue.getDate()).padStart(2, '0');
        const formattedString = `${year}-${month}-${day}`;
        console.log(`  - 修正用フォーマット(YYYY-MM-DD): ${formattedString}`);
        
        // 日本語表示用フォーマット
        const japaneseFormat = `${rawDateValue.getMonth() + 1}月${rawDateValue.getDate()}日`;
        console.log(`  - 日本語表示フォーマット: ${japaneseFormat}`);
        
      } else if (typeof rawDateValue === 'string') {
        console.log(`- 文字列型詳細分析:`);
        console.log(`  - 文字列長: ${rawDateValue.length}`);
        console.log(`  - トリム後: "${rawDateValue.trim()}"`);
        console.log(`  - 文字コード: [${Array.from(rawDateValue).map(c => c.charCodeAt(0)).join(', ')}]`);
        
        // 文字列からDateオブジェクトへの変換テスト
        try {
          const parsedDate = new Date(rawDateValue);
          console.log(`  - new Date()での変換: ${parsedDate}`);
          console.log(`  - 変換後isValid: ${!isNaN(parsedDate.getTime())}`);
          if (!isNaN(parsedDate.getTime())) {
            console.log(`  - 変換後日本語: ${parsedDate.getMonth() + 1}月${parsedDate.getDate()}日`);
          }
        } catch (parseError) {
          console.log(`  - Date変換エラー: ${parseError.message}`);
        }
        
      } else {
        console.log(`- その他の型: constructor.name = ${rawDateValue?.constructor?.name || 'unknown'}`);
        console.log(`- valueOf(): ${rawDateValue?.valueOf?.() || 'N/A'}`);
      }
      
      console.log('-'.repeat(40));
      
      // 最大10行まで表示（長すぎる場合の制限）
      if (i >= 10) {
        console.log(`📝 表示制限: 最初の10行のみ表示しました（総行数: ${data.length - 1}）`);
        break;
      }
    }
    
    // 現在の日時情報も表示
    console.log('\n' + '='.repeat(50));
    console.log('🕐 現在のシステム日時情報');
    console.log('='.repeat(50));
    const now = new Date();
    console.log(`- 現在時刻: ${now}`);
    console.log(`- toString(): ${now.toString()}`);
    console.log(`- toISOString(): ${now.toISOString()}`);
    console.log(`- toLocaleDateString('ja-JP'): ${now.toLocaleDateString('ja-JP')}`);
    console.log(`- getTimezoneOffset(): ${now.getTimezoneOffset()}`);
    console.log(`- 日本時間での年月日: ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`);
    
  } catch (error) {
    console.error('❌ debugInspectionDates エラー:', error);
    console.error('スタックトレース:', error.stack);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔍 検針日時データ詳細デバッグ完了');
  console.log('='.repeat(60));
}

// 🎯 特定の物件・部屋の検針日時のみをデバッグ表示
function debugSpecificRoomDate(propertyId = 'P000001', roomId = 'R000001') {
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 特定部屋の検針日時デバッグ: ${propertyId} - ${roomId}`);
  console.log('='.repeat(60));
  
  try {
    const spreadsheet = getSpreadsheetInstance();
    const sheet = spreadsheet.getSheetByName('inspection_data');
    
    if (!sheet) {
      console.log("❌ 'inspection_data'シートが見つかりません");
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const propertyIdIndex = headers.indexOf('物件ID');
    const roomIdIndex = headers.indexOf('部屋ID');
    const dateIndex = headers.indexOf('検針日時');
    
    console.log(`📍 検索条件:`);
    console.log(`- 物件ID: "${propertyId}"`);
    console.log(`- 部屋ID: "${roomId}"`);
    
    let found = false;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowPropertyId = String(row[propertyIdIndex]).trim();
      const rowRoomId = String(row[roomIdIndex]).trim();
      
      if (rowPropertyId === String(propertyId).trim() && 
          rowRoomId === String(roomId).trim()) {
        
        found = true;
        const rawDateValue = row[dateIndex];
        
        console.log(`\n✅ マッチング成功: 行 ${i}`);
        console.log(`🔍 検針日時の超詳細分析:`);
        console.log(`- 生データ: ${rawDateValue}`);
        console.log(`- データ型: ${typeof rawDateValue}`);
        console.log(`- constructor.name: ${rawDateValue?.constructor?.name || 'undefined'}`);
        console.log(`- JSON.stringify: ${JSON.stringify(rawDateValue)}`);
        
        if (rawDateValue instanceof Date) {
          console.log(`📅 Date型の全メソッド結果:`);
          console.log(`- toString(): ${rawDateValue.toString()}`);
          console.log(`- toDateString(): ${rawDateValue.toDateString()}`);
          console.log(`- toISOString(): ${rawDateValue.toISOString()}`);
          console.log(`- toLocaleDateString(): ${rawDateValue.toLocaleDateString()}`);
          console.log(`- toLocaleDateString('ja-JP'): ${rawDateValue.toLocaleDateString('ja-JP')}`);
          console.log(`- toLocaleString('ja-JP'): ${rawDateValue.toLocaleString('ja-JP')}`);
          console.log(`- valueOf(): ${rawDateValue.valueOf()}`);
          console.log(`- getTime(): ${rawDateValue.getTime()}`);
          console.log(`- getFullYear(): ${rawDateValue.getFullYear()}`);
          console.log(`- getMonth(): ${rawDateValue.getMonth()} (0ベース)`);
          console.log(`- getMonth() + 1: ${rawDateValue.getMonth() + 1} (1ベース)`);
          console.log(`- getDate(): ${rawDateValue.getDate()}`);
          console.log(`- getDay(): ${rawDateValue.getDay()} (0=日曜)`);
          console.log(`- getHours(): ${rawDateValue.getHours()}`);
          console.log(`- getMinutes(): ${rawDateValue.getMinutes()}`);
          console.log(`- getSeconds(): ${rawDateValue.getSeconds()}`);
          console.log(`- getTimezoneOffset(): ${rawDateValue.getTimezoneOffset()}分`);
          
          // 🚀 各種フォーマット方法のテスト
          console.log(`\n🚀 各種フォーマット方法のテスト:`);
          
          // 方法1: 直接取得
          const method1 = `${rawDateValue.getFullYear()}-${String(rawDateValue.getMonth() + 1).padStart(2, '0')}-${String(rawDateValue.getDate()).padStart(2, '0')}`;
          console.log(`- 方法1（直接取得）: ${method1}`);
          
          // 方法2: UTC調整
          const utcYear = rawDateValue.getUTCFullYear();
          const utcMonth = String(rawDateValue.getUTCMonth() + 1).padStart(2, '0');
          const utcDay = String(rawDateValue.getUTCDate()).padStart(2, '0');
          const method2 = `${utcYear}-${utcMonth}-${utcDay}`;
          console.log(`- 方法2（UTC調整）: ${method2}`);
          
          // 方法3: タイムゾーンオフセット考慮
          const offsetMinutes = rawDateValue.getTimezoneOffset();
          const adjustedTime = new Date(rawDateValue.getTime() - (offsetMinutes * 60000));
          const method3 = adjustedTime.toISOString().split('T')[0];
          console.log(`- 方法3（タイムゾーン考慮）: ${method3}`);
          
          // 方法4: 日本時間で強制調整
          const jstDate = new Date(rawDateValue.getTime() + (9 * 60 * 60 * 1000)); // JST = UTC+9
          const method4 = jstDate.toISOString().split('T')[0];
          console.log(`- 方法4（JST強制調整）: ${method4}`);
          
          // 日本語表示用
          const japaneseDisplay = `${rawDateValue.getMonth() + 1}月${rawDateValue.getDate()}日`;
          console.log(`- 日本語表示: ${japaneseDisplay}`);
          
        } else {
          console.log(`📝 非Date型データ:`);
          console.log(`- String表現: "${String(rawDateValue)}"`);
          console.log(`- 長さ: ${String(rawDateValue).length}`);
        }
        
        break;
      }
    }
    
    if (!found) {
      console.log(`❌ 指定された条件（${propertyId}, ${roomId}）に一致するデータが見つかりませんでした`);
      console.log('\n📋 利用可能なデータ:');
      for (let i = 1; i < Math.min(data.length, 6); i++) {
        const row = data[i];
        console.log(`- 行${i}: 物件ID="${row[propertyIdIndex]}", 部屋ID="${row[roomIdIndex]}"`);
      }
    }
    
  } catch (error) {
    console.error('❌ debugSpecificRoomDate エラー:', error);
    console.error('スタックトレース:', error.stack);
  }
}

// 🎯 実行用関数（手動実行用）
function runDateDebug() {
  console.log('\n🚀 日付デバッグスクリプト実行開始');
  
  // 全体デバッグ
  debugInspectionDates();
  
  // 特定部屋のデバッグ
  debugSpecificRoomDate('P000001', 'R000001');
  
  console.log('\n✅ 日付デバッグスクリプト実行完了');
}
