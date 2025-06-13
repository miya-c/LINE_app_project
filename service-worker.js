// Water Meter Reading App - Service Worker
// PWA対応のためのService Worker

const CACHE_NAME = 'water-meter-app-v1';
const urlsToCache = [
  '/',
  '/property_select.html',
  '/room_select.html',
  '/meter_reading.html',
  '/property_select_gas.html',
  '/room_select_gas.html',
  '/meter_reading_gas.html',
  '/manifest.json'
];

// CDN依存関係（オフライン時のフォールバック用）
const CDN_FALLBACKS = {
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css': '/assets/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js': '/assets/bootstrap.bundle.min.js',
  'https://unpkg.com/react@18/umd/react.production.min.js': '/assets/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js': '/assets/react-dom.production.min.js'
};

// Service Workerのインストール
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache.filter(url => url !== '/'));
      })
      .catch(error => {
        console.error('[ServiceWorker] Cache installation failed:', error);
      })
  );
  // 新しいService Workerを即座にアクティブにする
  self.skipWaiting();
});

// Service Workerのアクティベーション
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 既存のクライアントをすぐに制御下に置く
  return self.clients.claim();
});

// ネットワークリクエストの処理
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Google Apps Script APIへのリクエストは常にネットワークを試行
  if (url.hostname.includes('script.google.com') || url.hostname.includes('googleapis.com')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // APIレスポンスをキャッシュ（短時間）
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(`${CACHE_NAME}-api`).then(cache => {
              cache.put(request, responseClone);
              // 5分後にAPIキャッシュを削除
              setTimeout(() => {
                cache.delete(request);
              }, 5 * 60 * 1000);
            });
          }
          return response;
        })
        .catch(() => {
          // オフライン時はキャッシュからAPIレスポンスを返す
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              console.log('[ServiceWorker] Serving cached API response for:', request.url);
              return cachedResponse;
            }
            // キャッシュにない場合はオフライン用のJSONレスポンスを返す
            return new Response(JSON.stringify({
              error: true,
              message: 'オフライン中です。ネットワーク接続を確認してください。',
              offline: true
            }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            });
          });
        })
    );
    return;
  }

  // CDNリソースの処理
  if (CDN_FALLBACKS[request.url]) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          console.log('[ServiceWorker] CDN failed, trying fallback for:', request.url);
          return caches.match(CDN_FALLBACKS[request.url]) || 
                 caches.match(request);
        })
    );
    return;
  }

  // その他のリクエスト（HTML、CSS、JS）の処理
  event.respondWith(
    caches.match(request)
      .then(response => {
        // キャッシュがある場合はそれを返す
        if (response) {
          console.log('[ServiceWorker] Serving from cache:', request.url);
          return response;
        }

        // キャッシュにない場合はネットワークから取得
        return fetch(request)
          .then(response => {
            // 有効なレスポンスでない場合はそのまま返す
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // ネットワークエラーの場合、HTMLリクエストには基本ページを返す
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/property_select.html') || 
                     new Response(`
                       <!DOCTYPE html>
                       <html>
                       <head>
                         <title>オフライン - 水道メーター読み取りアプリ</title>
                         <meta charset="UTF-8">
                         <meta name="viewport" content="width=device-width, initial-scale=1.0">
                         <style>
                           body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                           .offline-message { color: #666; }
                         </style>
                       </head>
                       <body>
                         <h1>オフライン中</h1>
                         <p class="offline-message">
                           インターネット接続を確認して、再度お試しください。
                         </p>
                         <button onclick="location.reload()">再読み込み</button>
                       </body>
                       </html>
                     `, {
                       headers: { 'Content-Type': 'text/html' }
                     });
            }
            return new Response('オフライン中です', { status: 503 });
          });
      })
  );
});

// バックグラウンド同期（将来的な機能拡張用）
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[ServiceWorker] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// プッシュ通知（将来的な機能拡張用）
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push received');
  const title = '水道メーター読み取りアプリ';
  const options = {
    body: event.data ? event.data.text() : 'データが更新されました',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// バックグラウンド同期の実装
async function doBackgroundSync() {
  try {
    // オフライン中に蓄積されたデータを同期
    console.log('[ServiceWorker] Performing background sync');
    // 実装は後日追加
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error);
  }
}

// Service Worker更新の通知
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[ServiceWorker] Service Worker loaded');
