/**
 * YYC³ AI小语智能成长守护系统 - Service Worker
 * 第六阶段：高级特性与生产准备
 */

const CACHE_NAME = 'yyc3-ai-v1.0.0'
const RUNTIME_CACHE = 'yyc3-ai-runtime-v1.0.0'

// 需要缓存的资源
const STATIC_ASSETS = [
  '/',
  '/zh',
  '/en',
  '/icon.svg',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/apple-icon.png',
  '/q-character/xiaoyu_lan.png',
  'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css'
]

// API路由缓存策略
const API_CACHE_STRATEGIES = {
  '/api/ai/chat': 'network-first',
  '/api/error-report': 'network-first',
  '/api/homework': 'stale-while-revalidate',
  '/api/growth': 'stale-while-revalidate'
}

// 安装Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installing...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 SW: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ SW: Installation complete')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ SW: Installation failed:', error)
      })
  )
})

// 激活Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 SW: Activating...')

  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) =>
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName.startsWith('yyc3-ai-')
            )
            .map((cacheName) => {
              console.log('🗑️ SW: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // 立即控制所有页面
      self.clients.claim()
    ]).then(() => {
      console.log('✅ SW: Activation complete')
    })
  )
})

// 网络请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理同源请求
  if (url.origin !== self.location.origin) {
    return event.respondWith(fetch(request))
  }

  // 跳过非GET请求的缓存
  if (request.method !== 'GET') {
    return event.respondWith(fetch(request))
  }

  // API路由处理
  if (url.pathname.startsWith('/api/')) {
    return handleApiRequest(event, request)
  }

  // 静态资源处理
  return handleStaticRequest(event, request)
})

// 处理API请求
async function handleApiRequest(event, request) {
  const url = new URL(request.url)
  const strategy = API_CACHE_STRATEGIES[url.pathname] || 'network-first'

  if (strategy === 'network-first') {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            // 缓存成功的响应
            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // 网络失败，尝试从缓存获取
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('📡 SW: Serving API from cache:', request.url)
              return cachedResponse
            }
            // 返回离线响应
            return new Response(JSON.stringify({
              error: 'Network unavailable',
              message: '请检查网络连接后重试',
              offline: true
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            })
          })
        })
    )
  }

  if (strategy === 'stale-while-revalidate') {
    return event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // 在后台更新缓存
          const fetchPromise = fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone())
            }
            return response
          })

          // 返回缓存版本（如果存在）
          return cachedResponse || fetchPromise
        })
      })
    )
  }

  return event.respondWith(fetch(request))
}

// 处理静态资源请求
async function handleStaticRequest(event, request) {
  const url = new URL(request.url)

  // 优先从缓存获取静态资源
  return event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('📦 SW: Serving from cache:', request.url)
        return cachedResponse
      }

      // 网络获取并缓存
      return fetch(request).then((response) => {
        if (response.ok && isCacheableResource(url)) {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    })
  )
}

// 判断资源是否可缓存
function isCacheableResource(url) {
  const cacheableExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.woff', '.woff2']
  const pathname = url.pathname.toLowerCase()

  return cacheableExtensions.some(ext => pathname.endsWith(ext)) ||
         pathname.includes('/q-character/') ||
         pathname.startsWith('/_next/static/') ||
         pathname.startsWith('/images/')
}

// 消息处理
self.addEventListener('message', (event) => {
  const { type, payload } = event.data

  if (type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      payload: '1.0.0'
    })
  }

  if (type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => {
      event.ports[0].postMessage({ type: 'CACHE_CLEARED' })
    })
  }
})

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('🔄 SW: Background sync:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // 实现后台同步逻辑
  console.log('📡 SW: Performing background sync')
  // 可以在这里实现数据同步、错误报告重试等
}

// 推送通知
self.addEventListener('push', (event) => {
  console.log('📢 SW: Push received:', event)

  const options = {
    body: event.data?.text() || '您有新的消息',
    icon: '/icon.svg',
    badge: '/icon-light-32x32.png',
    tag: 'yyc3-notification',
    renotify: true,
    requireInteraction: false
  }

  event.waitUntil(
    self.registration.showNotification('YYC³ AI小语', options)
  )
})

// 通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ SW: Notification clicked')

  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // 优先聚焦已打开的窗口
      for (const client of clientList) {
        if (client.url.includes('/')) {
          client.focus()
          return client
        }
      }

      // 没有打开的窗口，则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

console.log('🚀 YYC³ AI小语 Service Worker 已加载')