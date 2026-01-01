/**
 * @file validation.ts
 * @description YYC³ AI小语智能成长守护系统验证工具函数
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * 验证是否为有效的邮箱地址
 * @param email - 邮箱地址
 * @returns 是否为有效邮箱
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证是否为有效的手机号（中国大陆）
 * @param phone - 手机号
 * @returns 是否为有效手机号
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证是否为有效的URL
 * @param url - URL地址
 * @returns 是否为有效URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证密码强度
 * @param password - 密码
 * @returns 密码强度等级（0-弱，1-中，2-强）
 */
export function validatePasswordStrength(password: string): number {
  if (password.length < 6) return 0;
  
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return Math.min(strength, 2);
}

/**
 * 验证是否为空值
 * @param value - 要验证的值
 * @returns 是否为空
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
