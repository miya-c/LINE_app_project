// Google Apps Script テスト用コード
// このコードをGoogle Apps Scriptエディタで実行して、現在の状態を確認してください

function testDeploymentStatus() {
  console.log('=== Google Apps Script デプロイメント状態確認 ===');
  
  try {
    // 1. 基本的な関数の存在確認
    console.log('1. 関数の存在確認:');
    console.log('   - createCorsResponse:', typeof createCorsResponse);
    console.log('   - doGet:', typeof doGet);
    console.log('   - doPost:', typeof doPost);
    console.log('   - doOptions:', typeof doOptions);
    console.log('   - getGasVersion:', typeof getGasVersion);
    console.log('   - handleUpdateMeterReadings:', typeof handleUpdateMeterReadings);
    
    // 2. getGasVersion関数のテスト
    console.log('\n2. getGasVersion関数テスト:');
    const versionResult = getGasVersion();
    console.log('   - 戻り値:', versionResult);
    console.log('   - 戻り値の型:', typeof versionResult);
    
    // 3. createCorsResponse関数のテスト
    console.log('\n3. createCorsResponse関数テスト:');
    
    // 正常なデータでテスト
    const testResponse1 = createCorsResponse({ test: 'success', timestamp: new Date().toISOString() });
    console.log('   - 正常データテスト完了');
    
    // undefinedでテスト
    const testResponse2 = createCorsResponse(undefined);
    console.log('   - undefinedテスト完了');
    
    // nullでテスト
    const testResponse3 = createCorsResponse(null);
    console.log('   - nullテスト完了');
    
    // 4. doPost関数の簡単なテスト
    console.log('\n4. doPost関数テスト:');
    const mockEvent = {
      postData: {
        contents: JSON.stringify({
          action: 'getVersion'
        })
      }
    };
    
    try {
      const postResult = doPost(mockEvent);
      console.log('   - doPost実行完了');
    } catch (postError) {
      console.error('   - doPostエラー:', postError.message);
    }
    
    return {
      status: 'テスト完了',
      timestamp: new Date().toISOString(),
      allFunctionsExist: typeof createCorsResponse === 'function' && 
                        typeof doGet === 'function' && 
                        typeof doPost === 'function',
      message: 'デプロイメント状態確認が完了しました。ログを確認してください。'
    };
    
  } catch (error) {
    console.error('テスト実行中にエラー:', error.message);
    console.error('スタックトレース:', error.stack);
    return {
      status: 'エラー',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

function testUpdateMeterReadings() {
  console.log('=== handleUpdateMeterReadings 関数テスト ===');
  
  try {
    // テスト用のパラメータ
    const testParams = {
      action: 'updateMeterReadings',
      propertyId: 'TEST_PROP_001',
      roomId: 'TEST_ROOM_001',
      readings: [
        {
          date: '2025-06-06',
          currentReading: '1234',
          photoData: null
        }
      ]
    };
    
    console.log('テストパラメータ:', testParams);
    
    const result = handleUpdateMeterReadings(testParams);
    console.log('handleUpdateMeterReadings実行結果:', result);
    console.log('結果の型:', typeof result);
    
    if (result) {
      console.log('✅ handleUpdateMeterReadings は正常に値を返しました');
    } else {
      console.error('❌ handleUpdateMeterReadings が undefined/null を返しました');
    }
    
    return result;
    
  } catch (error) {
    console.error('handleUpdateMeterReadings テストエラー:', error.message);
    console.error('スタックトレース:', error.stack);
    return null;
  }
}

// 実行用
function runAllTests() {
  console.log('Google Apps Script 総合テスト開始...\n');
  
  const deploymentTest = testDeploymentStatus();
  console.log('\n--- デプロイメントテスト結果 ---');
  console.log(deploymentTest);
  
  const updateTest = testUpdateMeterReadings();
  console.log('\n--- handleUpdateMeterReadings テスト結果 ---');
  console.log(updateTest);
  
  console.log('\n=== テスト完了 ===');
  console.log('上記のログを確認して、エラーの原因を特定してください。');
}
