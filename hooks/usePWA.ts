/**
 * @file usePWA.ts
 * @description PWA管理Hook，提供PWA安装和离线功能管理
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * YYC³ AI小语智能成长守护系统 - PWA管理Hook
 * 第六阶段：高级特性与生产准备
 */

import { useState, useEffect, useCallback } from 'react'

interface PWAInfo {
  isSupported: boolean
  isInstalled: boolean
  isOffline: boolean
  installPrompt: BeforeInstallPromptEvent | null
  swRegistration: ServiceWorkerRegistration | null
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [pwaInfo, setPwaInfo] = useState<PWAInfo>({
    isSupported: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    installPrompt: null,
    swRegistration: null
  })

  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)

  // 检查PWA支持
  useEffect(() => {
    const checkPWASupport = () => {
      const isSupported = 'serviceWorker' in navigator &&
                          'BeforeInstallPromptEvent' in window &&
                          'PushManager' in window

      setPwaInfo(prev => ({
        ...prev,
        isSupported
      }))
    }

    checkPWASupport()
  }, [])

  // 注册Service Worker
  useEffect(() => {
    if (!pwaInfo.isSupported) return

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        setPwaInfo(prev => ({
          ...prev,
          swRegistration: registration
        }))

        console.log('✅ Service Worker registered:', registration.scope)

        // 监听Service Worker更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwUpdateAvailable(true)
              }
            })
          }
        })

        // 检查是否已安装
        checkInstallationStatus()

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error)
      }
    }

    registerSW()
  }, [pwaInfo.isSupported])

  // 监听安装提示事件
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const beforeInstallPrompt = e as BeforeInstallPromptEvent

      setPwaInfo(prev => ({
        ...prev,
        installPrompt: beforeInstallPrompt
      }))

      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setPwaInfo(prev => ({ ...prev, isOffline: false }))
    }

    const handleOffline = () => {
      setPwaInfo(prev => ({ ...prev, isOffline: true }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 检查安装状态
  const checkInstallationStatus = useCallback(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         ('standalone' in window && (window as unknown as { standalone: boolean }).standalone) ||
                         document.referrer.includes('android-app://')

    const isInApp = window.matchMedia('(display-mode: minimal-ui)').matches

    setPwaInfo(prev => ({
      ...prev,
      isInstalled: isStandalone || isInApp
    }))
  }, [])

  // 安装PWA
  const installPWA = useCallback(async () => {
    if (!pwaInfo.installPrompt) {
      console.warn('No install prompt available')
      return
    }

    try {
      const { outcome } = await pwaInfo.installPrompt.userChoice
      console.log('PWA installation outcome:', outcome)

      if (outcome === 'accepted') {
        setPwaInfo(prev => ({
          ...prev,
          isInstalled: true,
          installPrompt: null
        }))
        setShowInstallPrompt(false)
      }
    } catch (error) {
      console.error('PWA installation failed:', error)
    }
  }, [pwaInfo.installPrompt])

  // 取消安装提示
  const dismissInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false)
  }, [])

  // 应用更新
  const applyUpdate = useCallback(() => {
    if (pwaInfo.swRegistration?.waiting) {
      pwaInfo.swRegistration.postMessage({ type: 'SKIP_WAITING' })
      setSwUpdateAvailable(false)
      window.location.reload()
    }
  }, [pwaInfo.swRegistration])

  // 清除缓存
  const clearCache = useCallback(() => {
    if (pwaInfo.swRegistration) {
      pwaInfo.swRegistration.postMessage({ type: 'CLEAR_CACHE' })
    }
  }, [pwaInfo.swRegistration])

  // 请求通知权限
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Notification permission request failed:', error)
      return false
    }
  }, [])

  // 发送推送通知
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon.svg',
        badge: '/icon-light-32x32.png',
        ...options
      })
    }
  }, [])

  // 检查更新状态
  const checkForUpdates = useCallback(() => {
    if (pwaInfo.swRegistration) {
      pwaInfo.swRegistration.update()
    }
  }, [pwaInfo.swRegistration])

  return {
    // PWA信息
    ...pwaInfo,
    showInstallPrompt,
    swUpdateAvailable,

    // 方法
    installPWA,
    dismissInstallPrompt,
    applyUpdate,
    clearCache,
    requestNotificationPermission,
    sendNotification,
    checkForUpdates,
    checkInstallationStatus
  }
}

export default usePWA