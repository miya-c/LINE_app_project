// テスト用のデータ検証スクリプト
// 修正した重複データクリーンアップ機能の安全性をテストする

function testDataDetectionLogic() {
  Logger.log('=== データ検出ロジックのテスト開始 ===');
  
  // テストデータの作成
  const testCases = [
    {
      name: "処理済みデータ（削除対象外）",
      rowData: {
        recordId: "test-001",
        propertyId: "P000001", 
        roomId: "R000001",
        inspectionDate: "2025/05/31",
        currentReading: "1208",
        previousReading: "1186",
        usage: "22"
      },
      shouldDelete: false
    },
    {
      name: "未処理データ（削除対象外）",
      rowData: {
        recordId: "test-002",
        propertyId: "P000001",
        roomId: "R000002", 
        inspectionDate: "",
        currentReading: "",
        previousReading: "",
        usage: ""
      },
      shouldDelete: false
    },
    {
      name: "完全に空のデータ（削除対象）",
      rowData: {
        recordId: "",
        propertyId: "",
        roomId: "",
        inspectionDate: "",
        currentReading: "",
        previousReading: "",
        usage: ""
      },
      shouldDelete: true
    },
    {
      name: "記録IDのみ存在（削除対象外）",
      rowData: {
        recordId: "test-003",
        propertyId: "",
        roomId: "",
        inspectionDate: "",
        currentReading: "",
        previousReading: "",
        usage: ""
      },
      shouldDelete: false
    }
  ];
  
  // 修正された検出ロジックをテスト
  testCases.forEach(testCase => {
    const rowData = testCase.rowData;
    
    // 修正されたロジック（optimizedCleanupDuplicateInspectionData関数から抜粋）
    const hasEssentialData = rowData.recordId && rowData.propertyId && rowData.roomId;
    const hasOptionalData = rowData.inspectionDate || 
                          rowData.currentReading || 
                          rowData.previousReading ||
                          rowData.usage;
    
    // 必須項目も任意項目も空の場合のみ削除対象とする
    const shouldDelete = !hasEssentialData && !hasOptionalData;
    
    const result = shouldDelete === testCase.shouldDelete ? "✅ PASS" : "❌ FAIL";
    
    Logger.log(`${result} - ${testCase.name}`);
    Logger.log(`  期待値: ${testCase.shouldDelete ? "削除対象" : "保護対象"}`);
    Logger.log(`  実際値: ${shouldDelete ? "削除対象" : "保護対象"}`);
    Logger.log(`  必須データ有無: ${hasEssentialData}`);
    Logger.log(`  任意データ有無: ${hasOptionalData}`);
    Logger.log('');
  });
  
  Logger.log('=== データ検出ロジックのテスト完了 ===');
}

function testCSVDataStructure() {
  Logger.log('=== CSVデータ構造のテスト開始 ===');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inspectionDataSheet = ss.getSheetByName('inspection_data');
  
  if (!inspectionDataSheet) {
    Logger.log('❌ inspection_dataシートが見つかりません');
    return;
  }
  
  const data = inspectionDataSheet.getDataRange().getValues();
  if (data.length <= 1) {
    Logger.log('❌ データが存在しません');
    return;
  }
  
  const headers = data[0];
  Logger.log('📋 ヘッダー情報:');
  headers.forEach((header, index) => {
    Logger.log(`  ${index}: ${header}`);
  });
  
  // 必要なカラムの存在確認
  const requiredColumns = [
    '記録ID', '物件ID', '部屋ID', '物件名', '部屋名',
    '検針日時', '今回の指示数', '前回指示数', '今回使用量'
  ];
  
  Logger.log('\n📊 必要カラムの存在確認:');
  requiredColumns.forEach(column => {
    const index = headers.indexOf(column);
    const status = index !== -1 ? '✅ 存在' : '❌ 不在';
    Logger.log(`  ${column}: ${status} (index: ${index})`);
  });
  
  // データサンプルの確認
  Logger.log('\n🔍 データサンプル（最初の3行）:');
  for (let i = 1; i <= Math.min(3, data.length - 1); i++) {
    const row = data[i];
    Logger.log(`  行${i + 1}:`);
    Logger.log(`    記録ID: "${row[headers.indexOf('記録ID')] || ''}"`);
    Logger.log(`    物件ID: "${row[headers.indexOf('物件ID')] || ''}"`);
    Logger.log(`    部屋ID: "${row[headers.indexOf('部屋ID')] || ''}"`);
    Logger.log(`    検針日時: "${row[headers.indexOf('検針日時')] || ''}"`);
    Logger.log(`    今回の指示数: "${row[headers.indexOf('今回の指示数')] || ''}"`);
  }
  
  // 未処理データの統計
  let processedCount = 0;
  let unprocessedCount = 0;
  let emptyCount = 0;
  
  const inspectionDateIndex = headers.indexOf('検針日時');
  const currentReadingIndex = headers.indexOf('今回の指示数');
  const recordIdIndex = headers.indexOf('記録ID');
  const propertyIdIndex = headers.indexOf('物件ID');
  const roomIdIndex = headers.indexOf('部屋ID');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const recordId = String(row[recordIdIndex] || '').trim();
    const propertyId = String(row[propertyIdIndex] || '').trim();
    const roomId = String(row[roomIdIndex] || '').trim();
    const inspectionDate = String(row[inspectionDateIndex] || '').trim();
    const currentReading = String(row[currentReadingIndex] || '').trim();
    
    const hasEssentialData = recordId && propertyId && roomId;
    const hasInspectionData = inspectionDate || currentReading;
    
    if (!hasEssentialData && !hasInspectionData) {
      emptyCount++;
    } else if (hasEssentialData && !hasInspectionData) {
      unprocessedCount++;
    } else if (hasEssentialData && hasInspectionData) {
      processedCount++;
    }
  }
  
  Logger.log('\n📈 データ統計:');
  Logger.log(`  総レコード数: ${data.length - 1}`);
  Logger.log(`  処理済み: ${processedCount}件`);
  Logger.log(`  未処理: ${unprocessedCount}件`);
  Logger.log(`  完全に空: ${emptyCount}件`);
  
  Logger.log('=== CSVデータ構造のテスト完了 ===');
}

function testModifiedCleanupSafety() {
  Logger.log('=== 修正されたクリーンアップ機能の安全性テスト開始 ===');
  
  // 実際のデータで安全性確認（削除は実行しない）
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inspectionDataSheet = ss.getSheetByName('inspection_data');
  
  if (!inspectionDataSheet) {
    Logger.log('❌ inspection_dataシートが見つかりません');
    return;
  }
  
  // データインデックスを作成
  Logger.log('🔍 データインデックスを作成中...');
  const indexes = createDataIndexes();
  if (!indexes) {
    Logger.log('❌ データインデックスの作成に失敗しました');
    return;
  }
  
  // 修正されたロジックで削除対象を検出
  const deletionCandidates = [];
  const protectedData = [];
  
  indexes.byRecordId.forEach((rowData, recordId) => {
    const hasEssentialData = rowData.recordId && rowData.propertyId && rowData.roomId;
    const hasOptionalData = rowData.inspectionDate || 
                          rowData.currentReading || 
                          rowData.previousReading ||
                          rowData.usage;
    
    if (!hasEssentialData && !hasOptionalData) {
      deletionCandidates.push({
        recordId,
        rowIndex: rowData.rowIndex,
        reason: '完全に空のデータ'
      });
    } else if (hasEssentialData && !hasOptionalData) {
      protectedData.push({
        recordId,
        rowIndex: rowData.rowIndex,
        reason: '未処理のメーター読み取りデータ（仕様上必要）'
      });
    }
  });
  
  Logger.log('\n🛡️ 安全性検証結果:');
  Logger.log(`  削除対象: ${deletionCandidates.length}件`);
  Logger.log(`  保護対象（未処理データ）: ${protectedData.length}件`);
  
  if (deletionCandidates.length > 0) {
    Logger.log('\n🗑️ 削除対象の詳細:');
    deletionCandidates.slice(0, 5).forEach(candidate => {
      Logger.log(`    行${candidate.rowIndex + 1}: ${candidate.reason}`);
    });
  }
  
  if (protectedData.length > 0) {
    Logger.log('\n🛡️ 保護されるデータの詳細（最初の5件）:');
    protectedData.slice(0, 5).forEach(item => {
      Logger.log(`    行${item.rowIndex + 1}: ${item.reason} (ID: ${item.recordId})`);
    });
  }
  
  // 重要な確認: 301件の未処理データが保護されているか
  const expectedUnprocessedCount = 301;
  if (protectedData.length >= expectedUnprocessedCount * 0.9) { // 90%以上なら安全とみなす
    Logger.log(`\n✅ 安全性確認: ${protectedData.length}件の未処理データが適切に保護されています`);
  } else {
    Logger.log(`\n⚠️ 警告: 保護されるデータ数（${protectedData.length}件）が期待値（約${expectedUnprocessedCount}件）より少ない可能性があります`);
  }
  
  Logger.log('=== 修正されたクリーンアップ機能の安全性テスト完了 ===');
}

// 全テストを実行する関数
function runAllValidationTests() {
  Logger.log('🧪 データ検証テストスイートを開始します...\n');
  
  testDataDetectionLogic();
  Logger.log('\n' + '='.repeat(50) + '\n');
  
  testCSVDataStructure();
  Logger.log('\n' + '='.repeat(50) + '\n');
  
  testModifiedCleanupSafety();
  
  Logger.log('\n🎉 全テスト完了');
}
