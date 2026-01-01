/**
 * @file yyc3-button.tsx
 * @description YYC³ AI小语智能成长守护系统标准按钮组件，提供多种样式和尺寸的按钮
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import * as React from 'react'
import { ButtonProps } from '../src/foundation/types/components'

/**
 * YYC³ 标准按钮组件
 */
export function YYC3Button({ 
  variant = 'default', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  icon, 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  // 根据变体确定颜色类
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary hover:bg-primary-dark text-white border-transparent'
      case 'secondary':
        return 'bg-secondary hover:bg-secondary-dark text-white border-transparent'
      case 'success':
        return 'bg-success hover:bg-success-dark text-white border-transparent'
      case 'warning':
        return 'bg-warning hover:bg-warning-dark text-white border-transparent'
      case 'error':
        return 'bg-error hover:bg-error-dark text-white border-transparent'
      case 'info':
        return 'bg-info hover:bg-info-dark text-white border-transparent'
      case 'outline':
        return 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300'
      case 'text':
        return 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent'
      default:
        return 'bg-primary hover:bg-primary-dark text-white border-transparent'
    }
  }

  // 根据尺寸确定大小类
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm'
      case 'md':
        return 'px-4 py-2 text-base'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-base'
    }
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-medium rounded-md transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}
