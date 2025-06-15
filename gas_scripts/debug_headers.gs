/**
 * スプレッドシートのヘッダー情報をデバッグするための関数
 */
function debugSpreadsheetHeaders() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inspectionSheet = ss.getSheetByName('inspection_data');
    
    if (!inspectionSheet) {
      console.log('❌ inspection_data シートが見つかりません');
      return;
    }
    
    const range = inspectionSheet.getDataRange();
    const values = range.getValues();
    
    if (values.length === 0) {
      console.log('❌ inspection_data シートにデータがありません');
      return;
    }
    
    const headers = values[0];
    console.log('='.repeat(50));
    console.log('📊 inspection_data シートのヘッダー情報');
    console.log('='.repeat(50));
    console.log('ヘッダー数:', headers.length);
    console.log('ヘッダー一覧:');
    headers.forEach((header, index) => {
      console.log(`${index + 1}: "${header}"`);
    });
    
    console.log('\n🔍 特定の列の検索結果:');
    console.log('「検針日時」列のインデックス:', headers.indexOf('検針日時'));
    console.log('「今回の指示数」列のインデックス:', headers.indexOf('今回の指示数'));
    console.log('「今回指示数（水道）」列のインデックス:', headers.indexOf('今回指示数（水道）'));
    
    console.log('\n✅ 「検針日時」列が存在する:', headers.includes('検針日時'));
    
    return {
      headers: headers,
      hasInspectionDateTime: headers.includes('検針日時'),
      inspectionDateTimeIndex: headers.indexOf('検針日時')
    };
    
  } catch (error) {
    console.error('デバッグ関数でエラー:', error);
    throw error;
  }
}

/**
 * updateMeterReadings関数をテストするためのデバッグ関数
 */
function debugUpdateMeterReadings() {
  try {
    console.log('='.repeat(50));
    console.log('🧪 updateMeterReadings関数のテスト');
    console.log('='.repeat(50));
    
    // テストデータ
    const testPropertyId = 'P000001';
    const testRoomId = 'R000001';
    const testReadings = [
      {
        '記録ID': 'test-record-id',
        '今回の指示数': 1250,
        '検針日時': new Date().toISOString()
      }
    ];
    
    console.log('テスト用パラメータ:');
    console.log('物件ID:', testPropertyId);
    console.log('部屋ID:', testRoomId);
    console.log('検針データ:', JSON.stringify(testReadings, null, 2));
    
    // 実際の関数を呼び出してエラーを再現
    const result = updateMeterReadings(testPropertyId, testRoomId, testReadings);
    console.log('✅ updateMeterReadings実行成功:', result);
    
  } catch (error) {
    console.error('❌ updateMeterReadings実行エラー:', error.message);
    console.error('エラースタック:', error.stack);
    throw error;
  }
}
