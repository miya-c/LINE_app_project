/**
 * CSS読み込み検証スクリプト
 * ブラウザの開発者ツールのConsoleで実行して、CSS読み込み状況を確認
 */

console.log('🧪 CSS読み込み検証スクリプト開始');

// 1. CSS ファイルの読み込み状況を確認
function checkCSSFiles() {
  console.group('📋 CSSファイル読み込み状況');
  
  const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
  console.log(`発見されたCSSファイル数: ${cssLinks.length}`);
  
  cssLinks.forEach((link, index) => {
    const href = link.href;
    const loaded = link.sheet !== null;
    const rules = loaded ? link.sheet.cssRules?.length || 0 : 0;
    
    console.log(`${index + 1}. ${href}`);
    console.log(`   ✅ 読み込み: ${loaded ? '成功' : '失敗'}`);
    console.log(`   📝 CSSルール数: ${rules}`);
  });
  
  console.groupEnd();
}

// 2. クリティカルCSSの効果を確認
function checkCriticalCSS() {
  console.group('🎨 クリティカルCSS効果確認');
  
  // テスト要素を作成してスタイルをチェック
  const testElements = [
    { class: 'mantine-button', property: 'backgroundColor' },
    { class: 'mantine-card', property: 'backgroundColor' },
    { class: 'loading-spinner', property: 'animation' },
    { class: 'styles-loading', property: 'opacity' },
    { class: 'styles-loaded', property: 'opacity' }
  ];
  
  testElements.forEach(({ class: className, property }) => {
    const element = document.createElement('div');
    element.className = className;
    element.style.position = 'absolute';
    element.style.visibility = 'hidden';
    document.body.appendChild(element);
    
    const computedStyle = window.getComputedStyle(element);
    const value = computedStyle[property];
    
    console.log(`${className} の ${property}: ${value}`);
    
    document.body.removeChild(element);
  });
  
  console.groupEnd();
}

// 3. パフォーマンス指標を確認
function checkPerformanceMetrics() {
  console.group('📊 パフォーマンス指標');
  
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const metrics = {
      'DOM読み込み開始': timing.domLoading - timing.navigationStart,
      'DOM対話可能': timing.domInteractive - timing.navigationStart,
      'DOMContentLoaded': timing.domContentLoadedEventEnd - timing.navigationStart,
      'ページ完全読み込み': timing.loadEventEnd - timing.navigationStart
    };
    
    Object.entries(metrics).forEach(([name, value]) => {
      const status = value < 1000 ? '🟢 高速' : value < 3000 ? '🟡 普通' : '🔴 低速';
      console.log(`${name}: ${value}ms ${status}`);
    });
  }
  
  // First Paint等の測定
  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach(entry => {
    console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
  });
  
  console.groupEnd();
}

// 4. FOUC（Flash of Unstyled Content）検出
function detectFOUC() {
  console.group('⚡ FOUC検出テスト');
  
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const hasStylesLoading = rootElement.classList.contains('styles-loading');
    const hasStylesLoaded = rootElement.classList.contains('styles-loaded');
    const opacity = window.getComputedStyle(rootElement).opacity;
    
    console.log(`Root要素の状態:`);
    console.log(`  styles-loading: ${hasStylesLoading}`);
    console.log(`  styles-loaded: ${hasStylesLoaded}`);
    console.log(`  現在の透明度: ${opacity}`);
    
    if (hasStylesLoaded && opacity === '1') {
      console.log('✅ FOUC対策が正常に機能しています');
    } else if (hasStylesLoading) {
      console.log('⏳ スタイル読み込み中...');
    } else {
      console.log('⚠️ FOUC対策が適用されていない可能性があります');
    }
  }
  
  console.groupEnd();
}

// 5. React アプリの初期化タイミングをチェック
function checkReactInitialization() {
  console.group('⚛️ React初期化タイミング');
  
  const reactLoaded = typeof React !== 'undefined';
  const reactDOMLoaded = typeof ReactDOM !== 'undefined';
  
  console.log(`React読み込み: ${reactLoaded ? '✅' : '❌'}`);
  console.log(`ReactDOM読み込み: ${reactDOMLoaded ? '✅' : '❌'}`);
  
  // アプリがマウントされているかチェック
  const rootElement = document.getElementById('root');
  const hasReactContent = rootElement && rootElement.children.length > 0;
  
  console.log(`Reactアプリマウント: ${hasReactContent ? '✅' : '❌'}`);
  
  console.groupEnd();
}

// 全てのテストを実行
function runAllTests() {
  console.clear();
  console.log('🚀 CSS読み込み修正の効果検証を開始');
  console.log(`ページURL: ${window.location.href}`);
  console.log(`現在時刻: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
  
  checkCSSFiles();
  checkCriticalCSS();
  checkPerformanceMetrics();
  detectFOUC();
  checkReactInitialization();
  
  console.log('='.repeat(50));
  console.log('✅ 検証完了');
}

// CSS読み込み完了を待ってからテストを実行
function waitForCSSAndTest() {
  let attempts = 0;
  const maxAttempts = 100;
  
  function checkAndRun() {
    attempts++;
    
    const testElement = document.createElement('div');
    testElement.className = 'mantine-button';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const hasButtonStyles = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                           computedStyle.backgroundColor !== 'transparent';
    
    document.body.removeChild(testElement);
    
    if (hasButtonStyles || attempts >= maxAttempts) {
      console.log(`CSS読み込み確認完了 (${attempts}回目, ${hasButtonStyles ? '成功' : 'タイムアウト'})`);
      runAllTests();
    } else {
      setTimeout(checkAndRun, 10);
    }
  }
  
  checkAndRun();
}

// 自動実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForCSSAndTest);
} else {
  waitForCSSAndTest();
}

// 手動実行用の関数をグローバルに公開
window.cssValidation = {
  runAllTests,
  checkCSSFiles,
  checkCriticalCSS,
  checkPerformanceMetrics,
  detectFOUC,
  checkReactInitialization
};

console.log('💡 手動でテストを実行する場合: cssValidation.runAllTests()');
