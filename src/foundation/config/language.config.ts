// @file src/foundation/config/language.config.ts
// @description YYC³ 语言配置
// @author YYC³团队
// @version 1.0.0

import { config } from '../../../lib/config';

// 从统一配置获取国际化配置
const i18nConfig = config.getI18nConfig();

// 支持的语言列表
export const supportedLanguages = i18nConfig.supportedLanguages;

export type Language = typeof supportedLanguages[number];

// 默认语言
export const defaultLanguage: Language = i18nConfig.defaultLanguage;

// 语言名称映射
export const languageNames: Record<Language, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
};

// 语言资源配置
export interface LanguageResources {
  [key: string]: string;
}

// 基础语言资源
export const baseLanguageResources: Record<Language, LanguageResources> = {
  'zh-CN': {
    // 通用
    'common.confirm': '确认',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.add': '添加',
    'common.close': '关闭',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.reset': '重置',
    'common.loading': '加载中...',
    'common.success': '操作成功',
    'common.error': '操作失败',
    'common.warning': '警告',
    'common.info': '提示',
    
    // 表单相关
    'form.required': '此项为必填',
    'form.email.invalid': '请输入有效的邮箱地址',
    'form.phone.invalid': '请输入有效的手机号码',
    'form.password.weak': '密码强度较弱',
    'form.password.medium': '密码强度中等',
    'form.password.strong': '密码强度较强',
    'form.password.confirm': '两次输入的密码不一致',
    
    // 分页相关
    'pagination.previous': '上一页',
    'pagination.next': '下一页',
    'pagination.total': '共 {total} 条',
    'pagination.pageSize': '每页 {pageSize} 条',
  },
  'en-US': {
    // 通用
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.reset': 'Reset',
    'common.loading': 'Loading...',
    'common.success': 'Operation successful',
    'common.error': 'Operation failed',
    'common.warning': 'Warning',
    'common.info': 'Info',
    
    // 表单相关
    'form.required': 'This field is required',
    'form.email.invalid': 'Please enter a valid email address',
    'form.phone.invalid': 'Please enter a valid phone number',
    'form.password.weak': 'Weak password',
    'form.password.medium': 'Medium password',
    'form.password.strong': 'Strong password',
    'form.password.confirm': 'Passwords do not match',
    
    // 分页相关
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    'pagination.total': 'Total {total}',
    'pagination.pageSize': '{pageSize} per page',
  },
};
