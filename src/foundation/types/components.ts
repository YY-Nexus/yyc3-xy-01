/**
 * @file components.ts
 * @description YYC³ AI小语智能成长守护系统组件属性类型定义
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import React from 'react';
import { Variant, Size } from './ui';

/**
 * Button组件属性
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

/**
 * Input组件属性
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Card组件属性
 */
export interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  shadow?: boolean;
}

/**
 * Form组件属性
 */
export interface FormProps {
  children: React.ReactNode;
  onSubmit: (data: Record<string, any>) => void;
  onReset?: () => void;
  initialValues?: Record<string, any>;
  validate?: (values: Record<string, any>) => Record<string, string>;
}

/**
 * Modal组件属性
 */
export interface ModalProps {
  children: React.ReactNode;
  title?: string;
  visible: boolean;
  onClose: () => void;
  width?: number | string;
  footer?: React.ReactNode;
  centered?: boolean;
  closeOnClickOutside?: boolean;
}

/**
 * Alert组件属性
 */
export interface AlertProps {
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
  closable?: boolean;
  onClose?: () => void;
  duration?: number;
}

/**
 * Tabs组件属性
 */
export interface TabsProps {
  tabs: Array<{ key: string; label: React.ReactNode; children: React.ReactNode }>;
  activeKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card' | 'pills';
}

/**
 * Select组件属性
 */
export interface SelectProps<T = string> {
  options: Array<{ label: string; value: T; disabled?: boolean }>;
  value?: T | T[];
  onChange?: (value: T | T[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
}
