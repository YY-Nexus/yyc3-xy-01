/**
 * @file ui.ts
 * @description YYC³ AI小语智能成长守护系统UI组件类型定义
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * 尺寸类型
 */
export type Size = 'sm' | 'md' | 'lg' | 'xl';

/**
 * 变体类型
 */
export type Variant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';

/**
 * 加载状态
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 对齐方式
 */
export type Alignment = 'left' | 'center' | 'right';

/**
 * 表格列定义
 */
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  width?: number;
  align?: Alignment;
  render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * 弹窗配置
 */
export interface ModalConfig {
  title?: string;
  visible: boolean;
  width?: number | string;
  footer?: React.ReactNode;
  onClose?: () => void;
}

/**
 * 通知配置
 */
export interface ToastConfig {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

/**
 * 选择项
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}
