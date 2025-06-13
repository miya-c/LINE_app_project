// PWA Utilities - Progressive Web App support functions
// 水道メーター読み取りアプリのPWA機能

class PWAUtils {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.init();
  }

  // PWAの初期化
  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupOnlineOfflineHandlers();
    this.setupBeforeInstallPrompt();
    this.checkInstallStatus();
  }

  // Service Workerの登録
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('[PWA] Service Worker registered successfully:', registration.scope);
        
        // Service Worker更新の監視
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });

        return registration;
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    } else {
      console.log('[PWA] Service Worker not supported');
    }
  }

  // アプリ更新通知
  showUpdateNotification() {
    if (confirm('アプリの新しいバージョンが利用可能です。更新しますか？')) {
      window.location.reload();
    }
  }

  // インストールプロンプトの設定
  setupBeforeInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
  }

  // インストールボタンの表示
  showInstallButton() {
    // インストールボタンが存在する場合のみ表示
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => this.promptInstall());
    } else {
      // ボタンが存在しない場合は動的に作成
      this.createInstallButton();
    }
  }

  // インストールボタンの動的作成
  createInstallButton() {
    const button = document.createElement('button');
    button.id = 'pwa-install-button';
    button.className = 'btn btn-primary btn-sm position-fixed';
    button.style.cssText = `
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      border-radius: 25px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    button.innerHTML = '📱 アプリをインストール';
    button.addEventListener('click', () => this.promptInstall());
    
    document.body.appendChild(button);
  }

  // インストールプロンプトの表示
  async promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log('[PWA] User response to install prompt:', outcome);
      this.deferredPrompt = null;
      
      // インストールボタンを非表示
      const installButton = document.getElementById('pwa-install-button');
      if (installButton) {
        installButton.style.display = 'none';
      }
    }
  }

  // インストール状態の確認
  checkInstallStatus() {
    // PWAとしてインストールされているかチェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] App is running in standalone mode');
      this.isInstalled = true;
      this.hideInstallButton();
    }

    // iOS Safari のスタンドアロンモードチェック
    if (window.navigator.standalone === true) {
      console.log('[PWA] App is running in iOS standalone mode');
      this.isInstalled = true;
      this.hideInstallButton();
    }
  }

  // インストールボタンを非表示
  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  // インストールプロンプトの設定（アプリ固有）
  setupInstallPrompt() {
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstallSuccessMessage();
    });
  }

  // インストール成功メッセージ
  showInstallSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'alert alert-success position-fixed';
    message.style.cssText = `
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1001;
      min-width: 300px;
      text-align: center;
    `;
    message.innerHTML = `
      <strong>✅ インストール完了！</strong><br>
      アプリがホーム画面に追加されました。
    `;
    
    document.body.appendChild(message);
    
    // 3秒後に自動削除
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 3000);
  }

  // オンライン・オフライン状態の管理
  setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      console.log('[PWA] Back online');
      this.isOnline = true;
      this.showNetworkStatus('オンライン', 'success');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Gone offline');
      this.isOnline = false;
      this.showNetworkStatus('オフライン', 'warning');
    });
  }

  // ネットワーク状態の表示
  showNetworkStatus(status, type) {
    // 既存の通知を削除
    const existingNotification = document.getElementById('network-status');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'network-status';
    notification.className = `alert alert-${type} position-fixed`;
    notification.style.cssText = `
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1002;
      min-width: 200px;
      text-align: center;
    `;
    notification.innerHTML = `🌐 ${status}`;
    
    document.body.appendChild(notification);
    
    // 2秒後に自動削除（オフライン通知は除く）
    if (type !== 'warning') {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 2000);
    }
  }

  // オフラインデータの同期
  async syncOfflineData() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
        console.log('[PWA] Background sync registered');
      } catch (error) {
        console.error('[PWA] Background sync registration failed:', error);
      }
    }
  }

  // キャッシュ管理
  async clearCache() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('[PWA] All caches cleared');
        return true;
      } catch (error) {
        console.error('[PWA] Failed to clear caches:', error);
        return false;
      }
    }
  }

  // アプリ情報の取得
  getAppInfo() {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushNotifications: 'PushManager' in window,
      hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  }

  // デバッグ情報の表示
  showDebugInfo() {
    const info = this.getAppInfo();
    console.table(info);
    
    // デバッグ情報をアラートで表示
    const debugText = Object.entries(info)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    alert(`PWA デバッグ情報:\n\n${debugText}`);
  }
}

// PWAUtilsのグローバルインスタンス
window.pwaUtils = new PWAUtils();

// DOMContentLoaded後の追加設定
document.addEventListener('DOMContentLoaded', () => {
  console.log('[PWA] PWA utilities initialized');
  
  // ページロード時にネットワーク状態を確認
  if (!navigator.onLine) {
    window.pwaUtils.showNetworkStatus('オフライン', 'warning');
  }
});

// エクスポート（モジュールとして使用する場合）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAUtils;
}
