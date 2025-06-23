// JavaScript Syntax Test for web_app_api.gs
// この構文がGoogle Apps Scriptで有効かテストします

function testSwitchSyntax() {
  const action = 'test';
  const e = { parameter: { action: 'test' } };
  
  switch (action) {
    case 'test':
      console.log('test case');
      return 'test result';
      
    case 'getProperties':
      console.log('getProperties case');
      return 'getProperties result';
      
    case 'getRooms':
      console.log('getRooms case');
      return 'getRooms result';
      
    case 'getMeterReadings':
      console.log('getMeterReadings case');
      return 'getMeterReadings result';
      
    case 'updateMeterReadings':
      console.log('updateMeterReadings case');
      return 'updateMeterReadings result';
      
    case 'completeInspection':
    case 'completePropertyInspection':
      console.log('completeInspection case');
      return 'completeInspection result';
      
    default:
      console.log('default case');
      return 'default result';
  }
}

console.log('Switch構文テスト:', testSwitchSyntax());
