/**
 * @file EnhancedCard.tsx
 * @description YYC³ AI小语智能成长守护系统UI增强卡片组件，提供多样化卡片样式功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'colored' | 'q-style';
  gender?: 'male' | 'female' | 'neutral';
  className?: string;
}

export function EnhancedCard({
  variant = 'default',
  gender = 'neutral',
  className,
  children,
  ...props
}: EnhancedCardProps) {
  const baseClasses = 'relative rounded-xl overflow-hidden transition-all duration-300';

  const variantClasses = {
    default: 'bg-white/95 backdrop-blur-sm border border-white/20',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20',
    colored: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/30',
    'q-style': gender === 'male' ? 'q-style-male' : gender === 'female' ? 'q-style-female' : 'bg-white/95 backdrop-blur-sm'
  };

  const genderClasses = {
    male: 'theme-male',
    female: 'theme-female',
    neutral: ''
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        genderClasses[gender],
        'card-colored-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}