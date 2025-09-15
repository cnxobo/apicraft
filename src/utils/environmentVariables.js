/**
 * 环境变量工具函数
 * 用于在 API 请求中解析和替换环境变量
 */

import React from 'react'
import { useEnvironmentStore } from '@/store'

/**
 * 解析字符串中的环境变量引用
 * 支持格式：{{variableName}} 或 ${variableName}
 * 
 * @param {string} text - 包含变量引用的文本
 * @param {string} environmentId - 环境ID，默认为当前选中环境
 * @returns {string} 解析后的文本
 */
export function resolveEnvironmentVariables(text, environmentId = null) {
  if (!text || typeof text !== 'string') {
    return text
  }

  const store = useEnvironmentStore.getState()
  const { environmentData, selectedEnvironmentId } = store
  
  const envId = environmentId || selectedEnvironmentId
  let environment = null
  
  // 获取环境数据
  if (envId === 'globals') {
    environment = environmentData.globals
  } else {
    environment = environmentData.environments.find(env => env.id === envId)
  }
  
  if (!environment) {
    return text
  }

  // 创建变量映射
  const variableMap = new Map()
  
  // 添加当前环境的变量
  environment.variables.forEach(variable => {
    variableMap.set(variable.name, variable.value)
  })

  // 如果不是 globals 环境，也添加 globals 变量作为后备
  if (envId !== 'globals') {
    environmentData.globals.variables.forEach(variable => {
      if (!variableMap.has(variable.name)) {
        variableMap.set(variable.name, variable.value)
      }
    })
  }

  // 替换变量引用
  let resolvedText = text
  
  // 支持 {{variableName}} 格式
  resolvedText = resolvedText.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim()
    return variableMap.has(trimmedName) ? variableMap.get(trimmedName) : match
  })
  
  // 支持 ${variableName} 格式
  resolvedText = resolvedText.replace(/\$\{([^}]+)\}/g, (match, variableName) => {
    const trimmedName = variableName.trim()
    return variableMap.has(trimmedName) ? variableMap.get(trimmedName) : match
  })

  return resolvedText
}

/**
 * 解析对象中的所有环境变量引用
 * 递归处理对象的所有字符串属性
 * 
 * @param {any} obj - 要解析的对象
 * @param {string} environmentId - 环境ID
 * @returns {any} 解析后的对象
 */
export function resolveObjectVariables(obj, environmentId = null) {
  if (typeof obj === 'string') {
    return resolveEnvironmentVariables(obj, environmentId)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => resolveObjectVariables(item, environmentId))
  }
  
  if (obj && typeof obj === 'object') {
    const resolved = {}
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveObjectVariables(value, environmentId)
    }
    return resolved
  }
  
  return obj
}

/**
 * 获取指定环境的所有变量
 * 
 * @param {string} environmentId - 环境ID
 * @returns {Object} 变量键值对对象
 */
export function getEnvironmentVariables(environmentId = null) {
  const store = useEnvironmentStore.getState()
  const { environmentData, selectedEnvironmentId } = store
  
  const envId = environmentId || selectedEnvironmentId
  const variables = {}
  
  // 先添加 globals 变量
  environmentData.globals.variables.forEach(variable => {
    variables[variable.name] = variable.value
  })

  // 如果不是 globals 环境，添加当前环境变量（会覆盖同名的 globals 变量）
  if (envId !== 'globals') {
    const environment = environmentData.environments.find(env => env.id === envId)
    if (environment) {
      environment.variables.forEach(variable => {
        variables[variable.name] = variable.value
      })
    }
  }
  
  return variables
}

/**
 * 检查文本中是否包含环境变量引用
 * 
 * @param {string} text - 要检查的文本
 * @returns {boolean} 是否包含变量引用
 */
export function hasEnvironmentVariables(text) {
  if (!text || typeof text !== 'string') {
    return false
  }
  
  return /\{\{[^}]+\}\}|\$\{[^}]+\}/.test(text)
}

/**
 * 提取文本中的所有环境变量名称
 * 
 * @param {string} text - 要分析的文本
 * @returns {string[]} 变量名称数组
 */
export function extractVariableNames(text) {
  if (!text || typeof text !== 'string') {
    return []
  }
  
  const variables = new Set()
  
  // 提取 {{variableName}} 格式的变量
  const doublebraceMatches = text.match(/\{\{([^}]+)\}\}/g)
  if (doublebraceMatches) {
    doublebraceMatches.forEach(match => {
      const variableName = match.replace(/\{\{|\}\}/g, '').trim()
      variables.add(variableName)
    })
  }
  
  // 提取 ${variableName} 格式的变量
  const dollarMatches = text.match(/\$\{([^}]+)\}/g)
  if (dollarMatches) {
    dollarMatches.forEach(match => {
      const variableName = match.replace(/\$\{|\}/g, '').trim()
      variables.add(variableName)
    })
  }
  
  return Array.from(variables)
}

/**
 * 验证环境变量引用是否都能被解析
 * 
 * @param {string} text - 要验证的文本
 * @param {string} environmentId - 环境ID
 * @returns {Object} 验证结果 { isValid: boolean, missingVariables: string[] }
 */
export function validateVariableReferences(text, environmentId = null) {
  const variableNames = extractVariableNames(text)
  const availableVariables = getEnvironmentVariables(environmentId)
  
  const missingVariables = variableNames.filter(name => 
    !availableVariables.hasOwnProperty(name)
  )
  
  return {
    isValid: missingVariables.length === 0,
    missingVariables
  }
}

/**
 * React Hook：获取环境变量解析函数
 * 
 * @returns {Function} 解析函数
 */
export function useEnvironmentResolver() {
  const { selectedEnvironmentId } = useEnvironmentStore()
  
  return React.useCallback((text) => {
    return resolveEnvironmentVariables(text, selectedEnvironmentId)
  }, [selectedEnvironmentId])
}

// 使用示例：
/*
// 在 API 请求中使用
const apiRequest = {
  url: "{{host}}/api/users",
  headers: {
    "Authorization": "Bearer {{token}}",
    "Content-Type": "application/json"
  },
  body: {
    "environment": "{{env_name}}"
  }
}

// 解析变量
const resolvedRequest = resolveObjectVariables(apiRequest)

// 或者在组件中使用
function ApiRequestComponent() {
  const resolver = useEnvironmentResolver()
  
  const handleSendRequest = () => {
    const url = resolver("{{host}}/api/users")
    // 发送请求...
  }
}
*/
