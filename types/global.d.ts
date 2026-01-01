/**
 * @file global.d.ts
 * @description YYC³ AI小语智能成长守护系统全局类型声明，解决全局类型问题和扩展现有类型定义
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// ===== 扩展全局类型 =====

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_APP_URL: string
      NEXT_PUBLIC_API_URL: string
      DATABASE_URL: string
      SUPABASE_URL: string
      SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      REDIS_URL: string
      OPENAI_API_KEY: string
      OPENAI_ORG_ID: string
      AZURE_SPEECH_KEY: string
      AZURE_SPEECH_REGION: string
      JWT_SECRET: string
      ENCRYPTION_KEY: string
      SESSION_SECRET: string
      SENTRY_DSN: string
      VERCEL_ANALYTICS_ID: string
      LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug'
      ALLOWED_ORIGINS: string
      SMTP_HOST: string
      SMTP_PORT: string
      SMTP_USER: string
      SMTP_PASS: string
      STORAGE_ENDPOINT: string
      STORAGE_ACCESS_KEY: string
      STORAGE_SECRET_KEY: string
    }
  }

  interface Window {
    // PWA 相关
    serviceWorker: ServiceWorkerContainer
    PWABuilder: Record<string, unknown>

    // AI 相关
    webkitSpeechRecognition: unknown
    SpeechRecognition: unknown

    // 开发工具
    __REDUX_DEVTOOLS_EXTENSION__: Record<string, unknown> | undefined
    __NEXT_DATA__: {
      props: Record<string, unknown>
      page: string
      query: Record<string, string | string[]>
      buildId: string
      isFallback: boolean
      gssp: boolean
      gsp: boolean
      scriptLoader: unknown[]
    }

    // 自定义全局变量
    YYC3_CONFIG: {
      apiBaseUrl: string
      wsUrl: string
      version: string
      features: string[]
    }

    // 第三方库
    gtag: Gtag.Gtag
    fbq: (event: string, ...args: unknown[]) => void
    dataLayer: Record<string, unknown>[]
  }

  var gtag: Gtag.Gtag
  var fbq: (event: string, ...args: unknown[]) => void
  var dataLayer: Record<string, unknown>[]
}

// ===== Jest 和测试相关类型 =====

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R
    toHaveClass(className: string): R
    toBeVisible(): R
    toBeDisabled(): R
    toHaveAttribute(attr: string, value?: string): R
    toHaveStyle(style: Record<string, string>): R
    toContainHTML(html: string): R
    toHaveTextContent(text: string): R
    toBeEmptyDOMElement(): R
    toHaveFocus(): R
    toBePartiallyChecked(checked?: boolean): R
    toHaveDisplayValue(value: string | string[]): R
    toHaveErrorMessage(message: string | RegExp): R
    toBeInvalid(): R
    toBeRequired(): R
    toBeValid(): R
  }

  interface Expect {
    not: Matchers<unknown>
    resolves: Matchers<Promise<unknown>>
    rejects: Matchers<Promise<unknown>>
  }

  interface InverseAsymmetricMatchers {
    any(expected: unknown): unknown
    anything(): unknown
    arrayContaining(expected: unknown[]): unknown
    objectContaining(expected: Record<string, unknown>): unknown
    stringContaining(expected: string): unknown
    stringMatching(expected: string | RegExp): unknown
  }

  interface Matchers<R> {
    toEqual(expected: unknown): R
    toStrictEqual(expected: unknown): R
    toBe(expected: unknown): R
    toBeNaN(): R
    toBeNull(): R
    toBeUndefined(): R
    toBeDefined(): R
    toBeTruthy(): R
    toBeFalsy(): R
    toBeGreaterThan(expected: number): R
    toBeGreaterThanOrEqual(expected: number): R
    toBeLessThan(expected: number): R
    toBeLessThanOrEqual(expected: number): R
    toBeInstanceOf(expected: new (...args: unknown[]) => unknown): R
    toContain(expected: unknown): R
    toContainEqual(expected: unknown): R
    toHaveLength(expected: number): R
    toHaveProperty(keyPath: string, value?: unknown): R
    toMatch(expected: string | RegExp): R
    toMatchObject(expected: Record<string, unknown>): R
    stringMatching(expected: string | RegExp): unknown
    toThrow(expected?: string | RegExp | Error): R
    toThrowError(expected?: string | RegExp | Error): R
  }
}

// ===== 模块声明 =====

declare module '*.svg' {
  import React = require('react')
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.ico' {
  const src: string
  export default src
}

declare module '*.bmp' {
  const src: string
  export default src
}

declare module '*.avif' {
  const src: string
  export default src
}

declare module '*.css' {
  const classes: { readonly [key: string]: string }
  export { classes }
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export { classes }
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export { classes }
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string }
  export { classes }
}

declare module '*.json' {
  const value: Record<string, unknown>
  export default value
}

declare module '*.txt' {
  const content: string
  export default content
}

declare module '*.md' {
  const content: string
  export default content
}

declare module '*.mdx' {
  const content: {
    default: React.ComponentType
    frontmatter: Record<string, unknown>
  }
  export default content
}

// ===== 第三方库类型扩展 =====

declare module 'framer-motion' {
  export interface MotionProps {
    whileHover?: Record<string, unknown>
    whileTap?: Record<string, unknown>
    whileFocus?: Record<string, unknown>
    whileInView?: Record<string, unknown>
    initial?: Record<string, unknown> | boolean
    animate?: Record<string, unknown> | boolean
    exit?: Record<string, unknown> | boolean
    transition?: Record<string, unknown>
    variants?: Record<string, Record<string, unknown>>
    layout?: boolean
    layoutId?: string
    layoutScroll?: boolean
    layoutGroup?: boolean
  }
}

declare module 'next-intl' {
  export function useTranslations(namespace: string): {
    (key: string, values?: Record<string, string | number>): string
    raw: (key: string) => unknown
  }
  export function useLocale(): string
  export function useRouter(): {
    push: (href: string, options?: Record<string, unknown>) => void
    replace: (href: string, options?: Record<string, unknown>) => void
    prefetch: (href: string, options?: Record<string, unknown>) => void
    back: () => void
    refresh: () => void
  }
  export function usePathname(): string
  export function getRequestConfig(config: {
    locales: string[]
    defaultLocale: string
    messages?: Record<string, Record<string, string>>
  }): {
    messages: Record<string, Record<string, string>>
  }
  export function notFound(): never
}

declare module '@vercel/analytics' {
  export function Analytics(): React.ReactElement
  export const analytics: {
    track: (eventName: string, properties?: Record<string, unknown>) => void
    identify: (userId: string, traits?: Record<string, unknown>) => void
  }
}

declare module '@vercel/speed-insights' {
  export function SpeedInsights(): React.ReactElement
  export const speedInsights: {
    trackWebVital: (metric: Record<string, unknown>) => void
  }
}

// ===== AI 相关类型声明 =====

declare namespace XiaoyuAI {
  interface AIMessage {
    id: string
    content: string
    type: 'user' | 'assistant' | 'system'
    timestamp: Date
    metadata?: Record<string, unknown>
  }

  interface AIPersona {
    id: string
    name: string
    role: string
    personality: string
    capabilities: string[]
  }

  interface MultimodalContent {
    id: string
    type: string
    content: unknown
    metadata: Record<string, unknown>
  }
}

// ===== 语音相关类型声明 =====

declare namespace SpeechRecognition {
  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number
    onresult: (event: SpeechRecognitionEvent) => void
    onerror: (event: SpeechRecognitionErrorEvent) => void
    onend: (event: Event) => void
    onstart: (event: Event) => void
    start(): void
    stop(): void
    abort(): void
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
    resultIndex: number
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string
    message?: string
  }

  interface SpeechRecognitionResultList {
    length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
  }

  interface SpeechRecognitionResult {
    isFinal: boolean
    length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
  }

  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }
}

// ===== Google Analytics 类型 =====

declare namespace Gtag {
  interface Gtag {
    (command: 'config', targetId: string, config?: GtagConfigParams): void
    (command: 'set', config: GtagCustomParams): void
    (command: 'js', config: { page_title: string; page_location: string }): void
    (command: 'event', eventName: string, eventParams?: GtagEventParams): void
    (command: 'get', targetId: string, fieldName: string, callback: (field: string) => void): void
  }

  interface GtagCustomParams {
    [key: string]: string | number | boolean | undefined
  }

  interface GtagConfigParams {
    send_page_view?: boolean
    groups?: string | string[]
    event_callback?: () => void
    event_timeout?: number
    page_title?: string
    page_location?: string
    content_group1?: string
    content_group2?: string
    content_group3?: string
    content_group4?: string
    content_group5?: string
  }

  interface GtagEventParams {
    event_category?: string
    event_label?: string
    value?: number
    link_url?: string
    link_domain?: string
    link_classes?: string
    link_id?: string
    video_title?: string
    video_url?: string
    video_duration?: number
    video_percent?: number
    video_visible?: string
    file_name?: string
    file_extension?: string
    file_size?: number
    name?: string
    description?: string
    fatal?: boolean
  }
}

// ===== 导出全局类型 =====

export {}