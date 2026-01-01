/**
 * @file 主题化组件类型定义
 * @description 统一的类型定义和接口
 * @author YYC³ Development Team
 * @version 1.0.0
 * @created 2024-12-14
 */

// 基础类型定义
export type CharacterSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type CharacterVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'filled'
export type CharacterColorScheme = 'light' | 'dark' | 'auto'

// 尺寸配置接口
export interface SizeConfig {
  padding: string
  fontSize: string
  borderRadius: string
  iconSize: string
  height?: string
  width?: string
}

// 变体配置接口
export interface VariantConfig {
  backgroundColor?: string
  color?: string
  borderColor?: string
  borderWidth?: number
  boxShadow?: string
  hover?: {
    backgroundColor?: string
    color?: string
    transform?: string
  }
  active?: {
    backgroundColor?: string
    color?: string
    transform?: string
  }
}

// 状态配置接口
export interface StateConfig {
  idle: VariantConfig
  hover: VariantConfig
  active: VariantConfig
  disabled: VariantConfig
  loading: VariantConfig
  error: VariantConfig
  success: VariantConfig
}

// 主题配置接口
export interface CharacterThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    border: string
    glow: string
    gradient: string
  }
  sizes: Record<CharacterSize, SizeConfig>
  variants: Record<CharacterVariant, VariantConfig>
  states: StateConfig
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  shadows: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// 组件属性接口
export interface BaseComponentProps {
  size?: CharacterSize
  variant?: CharacterVariant
  colorScheme?: CharacterColorScheme
  disabled?: boolean
  loading?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

// 交互组件属性接口
export interface InteractiveComponentProps extends BaseComponentProps {
  onClick?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  tabIndex?: number
  'aria-label'?: string
  'aria-disabled'?: boolean
}

// 表单组件属性接口
export interface FormComponentProps extends InteractiveComponentProps {
  id?: string
  name?: string
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  autoComplete?: string
  autoFocus?: boolean
}

// 布局组件属性接口
export interface LayoutComponentProps extends BaseComponentProps {
  fluid?: boolean
  maxWidth?: string | number
  center?: boolean
  spacing?: CharacterSize
  direction?: 'row' | 'column'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
}

// 反馈组件属性接口
export interface FeedbackComponentProps extends BaseComponentProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  message?: string
  description?: string
  closable?: boolean
  duration?: number
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

// 动画配置接口
export interface AnimationConfig {
  duration: number
  delay: number
  easing: string
  type?: 'spring' | 'tween' | 'keyframes'
  stiffness?: number
  damping?: number
  mass?: number
}

// 响应式值类型
export type ResponsiveValue<T> = T | {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

// 事件处理器类型
export type EventHandler<T = unknown> = (event: T) => void

// 工具类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// 组件主题上下文类型
export interface ComponentThemeContext {
  theme: CharacterThemeConfig
  setTheme: (theme: Partial<CharacterThemeConfig>) => void
  updateColors: (colors: Partial<CharacterThemeConfig['colors']>) => void
  updateSizes: (sizes: Partial<Record<CharacterSize, SizeConfig>>) => void
}

// 默认主题配置
export const DEFAULT_THEME: CharacterThemeConfig = {
  name: 'default',
  colors: {
    primary: '#3b82f6',
    secondary: '#93c5fd',
    accent: '#eff6ff',
    background: '#ffffff',
    text: '#1e3a8a',
    border: '#93c5fd',
    glow: 'rgba(59, 130, 246, 0.3)',
    gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)'
  },
  sizes: {
    xs: {
      padding: '0.5rem 0.75rem',
      fontSize: '0.75rem',
      borderRadius: '0.375rem',
      iconSize: '1rem'
    },
    sm: {
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      borderRadius: '0.5rem',
      iconSize: '1.125rem'
    },
    md: {
      padding: '1rem 1.5rem',
      fontSize: '1rem',
      borderRadius: '0.75rem',
      iconSize: '1.25rem'
    },
    lg: {
      padding: '1.5rem 2rem',
      fontSize: '1.125rem',
      borderRadius: '1rem',
      iconSize: '1.5rem'
    },
    xl: {
      padding: '2rem 3rem',
      fontSize: '1.25rem',
      borderRadius: '1.25rem',
      iconSize: '1.75rem'
    },
    '2xl': {
      padding: '2.5rem 4rem',
      fontSize: '1.5rem',
      borderRadius: '1.5rem',
      iconSize: '2rem'
    }
  },
  variants: {
    default: {
      backgroundColor: '#ffffff',
      color: '#1e3a8a',
      borderColor: '#93c5fd',
      borderWidth: 1,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      hover: {
        backgroundColor: '#eff6ff',
        transform: 'translateY(-1px)'
      },
      active: {
        backgroundColor: '#dbeafe',
        transform: 'translateY(0)'
      }
    },
    primary: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      borderColor: '#3b82f6',
      borderWidth: 1,
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
      hover: {
        backgroundColor: '#2563eb',
        transform: 'translateY(-2px)'
      },
      active: {
        backgroundColor: '#1d4ed8',
        transform: 'translateY(0)'
      }
    },
    secondary: {
      backgroundColor: '#f1f5f9',
      color: '#475569',
      borderColor: '#cbd5e1',
      borderWidth: 1,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      hover: {
        backgroundColor: '#e2e8f0',
        transform: 'translateY(-1px)'
      },
      active: {
        backgroundColor: '#cbd5e1',
        transform: 'translateY(0)'
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      borderColor: '#3b82f6',
      borderWidth: 2,
      boxShadow: 'none',
      hover: {
        backgroundColor: '#eff6ff',
        transform: 'translateY(-1px)'
      },
      active: {
        backgroundColor: '#dbeafe',
        transform: 'translateY(0)'
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      borderColor: 'transparent',
      borderWidth: 0,
      boxShadow: 'none',
      hover: {
        backgroundColor: '#eff6ff',
        transform: 'translateY(-1px)'
      },
      active: {
        backgroundColor: '#dbeafe',
        transform: 'translateY(0)'
      }
    },
    filled: {
      backgroundColor: '#eff6ff',
      color: '#1e3a8a',
      borderColor: '#eff6ff',
      borderWidth: 1,
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
      hover: {
        backgroundColor: '#dbeafe',
        transform: 'translateY(-1px)'
      },
      active: {
        backgroundColor: '#bfdbfe',
        transform: 'translateY(0)'
      }
    }
  },
  states: {
    idle: {
      backgroundColor: '#ffffff',
      color: '#1e3a8a',
      borderColor: '#93c5fd'
    },
    hover: {
      backgroundColor: '#eff6ff',
      color: '#1e3a8a',
      borderColor: '#60a5fa',
      transform: 'translateY(-1px)'
    },
    active: {
      backgroundColor: '#dbeafe',
      color: '#1e3a8a',
      borderColor: '#3b82f6',
      transform: 'translateY(0)'
    },
    disabled: {
      backgroundColor: '#f8fafc',
      color: '#94a3b8',
      borderColor: '#e2e8f0'
    },
    loading: {
      backgroundColor: '#eff6ff',
      color: '#3b82f6',
      borderColor: '#93c5fd'
    },
    error: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      borderColor: '#fca5a5'
    },
    success: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      borderColor: '#86efac'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }
}