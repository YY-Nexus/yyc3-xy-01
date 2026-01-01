/**
 * @file EnhancedButton.tsx
 * @description YYC³ AI小语智能成长守护系统UI增强按钮组件，提供多样化按钮样式功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'back' | 'colored';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function EnhancedButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: EnhancedButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500',
    secondary: 'bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-500',
    back: 'bg-white text-red-600 hover:bg-red-50 focus:ring-red-500',
    colored: 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 focus:ring-purple-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const shadowClasses = {
    primary: 'shadow-lg hover:shadow-xl',
    secondary: 'shadow-md hover:shadow-lg',
    back: 'btn-back-no-arrow',
    colored: 'btn-colored-shadow'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        shadowClasses[variant],
        'colored-shadow-border',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}