import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// 防抖函数
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 格式化JSON
export function formatJSON(obj) {
  try {
    return JSON.stringify(obj, null, 2)
  } catch (error) {
    return obj
  }
}

// 复制到剪贴板
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch (err) {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

// 生成唯一ID
export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// HTTP方法颜色映射
export const HTTP_METHOD_COLORS = {
  GET: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  POST: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  PUT: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  DELETE: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  PATCH: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  HEAD: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
  OPTIONS: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
}
