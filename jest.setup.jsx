/**
 * YYC³ AI小语智能成长守护系统 - Jest 测试环境设置
 * 第六阶段：高级特性与生产准备
 */

import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js internationalization
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'zh',
}))

// Mock Next.js image optimization
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}))

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Mock Vercel Analytics
jest.mock('@vercel/analytics/next', () => ({
  Analytics: () => null,
}))

jest.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => null,
}))

// Mock Service Worker
Object.defineProperty(window, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn(() => Promise.resolve()),
    ready: Promise.resolve({
      addEventListener: jest.fn(),
      showNotification: jest.fn(),
    }),
  },
})

// Mock PushManager
Object.defineProperty(window, 'PushManager', {
  writable: true,
  value: {
    prototype: {
      permissionState: 'granted',
      subscribe: jest.fn(() => Promise.resolve()),
      getSubscription: jest.fn(() => Promise.resolve(null)),
    },
  },
})

// Mock Notification
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: {
    requestPermission: jest.fn(() => Promise.resolve('granted')),
    permission: 'granted',
  },
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock window.fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
)

// Mock console methods in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalConsoleError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps has been renamed')
    ) {
      return
    }
    originalConsoleWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Mock Intl APIs
global.Intl = {
  ...global.Intl,
  DateTimeFormat: jest.fn(() => ({
    format: jest.fn(() => '2024-01-01'),
  })),
  NumberFormat: jest.fn(() => ({
    format: jest.fn(() => '1,000'),
  })),
  Collator: jest.fn(),
  PluralRules: jest.fn(),
}

// Add custom matchers
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received && document.body.contains(received)
    return {
      message: () =>
        `expected ${received} to be in the document`,
      pass,
    }
  },
  toHaveClass: (received, className) => {
    const pass = received && received.classList && received.classList.contains(className)
    return {
      message: () =>
        `expected element ${pass ? 'not' : ''} to have class ${className}`,
      pass,
    }
  },
})

// Setup and teardown hooks
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()

  // Reset localStorage
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()

  // Reset sessionStorage
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()

  // Reset fetch
  global.fetch.mockClear?.()

  // Clear DOM
  document.body.innerHTML = ''
})