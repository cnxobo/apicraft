import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Copy, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEnvironmentStore } from '@/store'
import { 
  resolveEnvironmentVariables,
  resolveObjectVariables,
  hasEnvironmentVariables,
  extractVariableNames,
  validateVariableReferences
} from '@/utils/environmentVariables'
import { cn } from '@/lib/utils'

/**
 * 环境变量演示组件
 * 展示如何在实际场景中使用环境变量
 */
export function EnvironmentVariableDemo() {
  const { 
    environmentData, 
    selectedEnvironmentId, 
    setSelectedEnvironment 
  } = useEnvironmentStore()

  const [testInput, setTestInput] = useState('{{host}}/api/users?token={{token}}')
  const [resolvedOutput, setResolvedOutput] = useState('')
  const [copied, setCopied] = useState(false)

  // 获取所有环境选项
  const environmentOptions = [
    { id: 'globals', name: 'Globals' },
    ...environmentData.environments.map(env => ({ id: env.id, name: env.name }))
  ]

  // 解析测试输入
  const handleResolve = () => {
    const resolved = resolveEnvironmentVariables(testInput, selectedEnvironmentId)
    setResolvedOutput(resolved)
  }

  // 复制到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resolvedOutput)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // 验证变量引用
  const validation = validateVariableReferences(testInput, selectedEnvironmentId)
  const variableNames = extractVariableNames(testInput)

  // 预设示例
  const examples = [
    {
      name: 'API URL',
      value: '{{host}}/api/v1/users'
    },
    {
      name: 'Authorization Header',
      value: 'Bearer {{token}}'
    },
    {
      name: 'Database Connection',
      value: 'mongodb://{{db_user}}:{{db_password}}@{{db_host}}:{{db_port}}/{{db_name}}'
    },
    {
      name: 'API Request Body',
      value: JSON.stringify({
        environment: '{{env_name}}',
        timestamp: '{{currentTime}}',
        host: '{{host}}'
      }, null, 2)
    }
  ]

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 头部 */}
      <div className="h-14 border-b flex items-center justify-between px-6">
        <h2 className="text-lg font-semibold">Environment Variables Demo</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Environment:</span>
          <Select value={selectedEnvironmentId} onValueChange={setSelectedEnvironment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {environmentOptions.map(env => (
                <SelectItem key={env.id} value={env.id}>
                  {env.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：输入和示例 */}
        <div className="w-1/2 border-r flex flex-col">
          {/* 输入区域 */}
          <div className="p-6 border-b">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Test Input (use {{`{variableName}`}} format)
                </label>
                <div className="space-y-2">
                  <Input
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter text with variables..."
                    className="font-mono"
                  />
                  <div className="flex items-center justify-between">
                    <Button onClick={handleResolve} size="sm" className="flex items-center space-x-1">
                      <Play className="h-3 w-3" />
                      <span>Resolve Variables</span>
                    </Button>
                    
                    {/* 验证状态 */}
                    <div className="flex items-center space-x-2">
                      {hasEnvironmentVariables(testInput) && (
                        <div className={cn(
                          "flex items-center space-x-1 text-xs",
                          validation.isValid ? "text-green-600" : "text-red-600"
                        )}>
                          <AlertCircle className="h-3 w-3" />
                          <span>
                            {validation.isValid 
                              ? `${variableNames.length} variables found` 
                              : `${validation.missingVariables.length} missing variables`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 变量信息 */}
              {variableNames.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Variables Found:</label>
                  <div className="flex flex-wrap gap-1">
                    {variableNames.map(name => (
                      <span
                        key={name}
                        className={cn(
                          "px-2 py-1 text-xs rounded",
                          validation.missingVariables.includes(name)
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        )}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 示例区域 */}
          <div className="flex-1 overflow-hidden">
            <div className="p-6">
              <h3 className="text-sm font-medium mb-4">Examples</h3>
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {examples.map((example, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setTestInput(example.value)}
                    >
                      <div className="font-medium text-sm mb-1">{example.name}</div>
                      <div className="text-xs text-muted-foreground font-mono break-all">
                        {example.value}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* 右侧：输出和当前环境变量 */}
        <div className="w-1/2 flex flex-col">
          {/* 输出区域 */}
          <div className="p-6 border-b">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Resolved Output</label>
                {resolvedOutput && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center space-x-1"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                )}
              </div>
              <div className="min-h-[100px] p-3 border rounded-lg bg-muted/30 font-mono text-sm whitespace-pre-wrap">
                {resolvedOutput || 'Click "Resolve Variables" to see the output...'}
              </div>
            </div>
          </div>

          {/* 当前环境变量 */}
          <div className="flex-1 overflow-hidden">
            <div className="p-6">
              <h3 className="text-sm font-medium mb-4">
                Current Environment Variables
                <span className="ml-2 text-xs text-muted-foreground">
                  ({selectedEnvironmentId === 'globals' ? 'Globals' : 
                    environmentData.environments.find(e => e.id === selectedEnvironmentId)?.name})
                </span>
              </h3>
              <ScrollArea className="h-full">
                <VariableList environmentId={selectedEnvironmentId} />
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 变量列表组件
 */
function VariableList({ environmentId }) {
  const { environmentData } = useEnvironmentStore()
  
  // 获取当前环境的变量
  let variables = []
  
  // 总是包含 globals 变量
  variables = [...environmentData.globals.variables]
  
  // 如果不是 globals 环境，添加当前环境的变量
  if (environmentId !== 'globals') {
    const currentEnv = environmentData.environments.find(env => env.id === environmentId)
    if (currentEnv) {
      variables = [...variables, ...currentEnv.variables]
    }
  }

  if (variables.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No variables defined in this environment</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {variables.map((variable, index) => (
        <div
          key={`${variable.id}-${index}`}
          className="p-3 border rounded-lg bg-card"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm">{variable.name}</span>
            <span className="text-xs px-2 py-1 bg-secondary rounded capitalize">
              {variable.type}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-mono break-all">
            {variable.type === 'secret' ? '••••••••' : variable.currentValue}
          </div>
        </div>
      ))}
    </div>
  )
}
