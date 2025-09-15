import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { useEnvironmentStore, useApiStore } from '@/store'
import { cn } from '@/lib/utils'

/**
 * 新环境标签页组件
 * 用于创建新环境的界面
 */
export function NewEnvironmentTab({ tabData, tabId }) {
  const { t } = useTranslation()
  const { createEnvironment, addVariable } = useEnvironmentStore()
  const { updateTab, closeTab } = useApiStore()
  
  const [environmentName, setEnvironmentName] = useState(tabData?.name || '')
  const [variables, setVariables] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const nameInputRef = useRef(null)

  // 自动聚焦到名称输入框
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  // 处理环境名称失焦 - 创建环境并刷新左侧面板
  const handleNameBlur = async () => {
    if (environmentName.trim() && !tabData?.id) {
      setIsCreating(true)
      try {
        const newEnvId = await createEnvironment(environmentName.trim())
        
        // 更新标签页数据
        updateTab(tabId, {
          id: newEnvId,
          name: environmentName.trim(),
          isNew: false
        })
        
        // 添加初始变量（如果有的话）
        for (const variable of variables) {
          if (variable.name.trim()) {
            await addVariable(newEnvId, {
              name: variable.name,
              type: variable.type,
              value: variable.value
            })
          }
        }
        
        setVariables([]) // 清空临时变量
      } catch (error) {
        console.error('Failed to create environment:', error)
      } finally {
        setIsCreating(false)
      }
    }
  }

  // 添加新变量
  const addNewVariable = () => {
    setVariables(prev => [...prev, {
      id: `temp_${Date.now()}`,
      name: '',
      type: 'regular',
      value: '',
      showValue: true
    }])
  }

  // 更新变量
  const updateVariable = (id, field, value) => {
    setVariables(prev => prev.map(variable =>
      variable.id === id ? { ...variable, [field]: value } : variable
    ))
  }

  // 删除变量
  const deleteVariable = (id) => {
    setVariables(prev => prev.filter(variable => variable.id !== id))
  }

  // 切换变量值显示
  const toggleVariableVisibility = (id) => {
    setVariables(prev => prev.map(variable =>
      variable.id === id ? { ...variable, showValue: !variable.showValue } : variable
    ))
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 头部 - 环境名称输入 */}
      <div className="h-14 border-b flex items-center px-6">
        <div className="flex items-center space-x-3">
          <Input
            ref={nameInputRef}
            value={environmentName}
            onChange={(e) => setEnvironmentName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder={t('environment.environmentName')}
            className="h-8 text-sm font-medium border-none shadow-none p-0 focus-visible:ring-0"
            disabled={isCreating}
          />
          {isCreating && (
            <span className="text-xs text-muted-foreground">{t('environment.creating')}</span>
          )}
        </div>
      </div>

      {/* 变量管理区域 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            {/* 添加变量按钮 */}
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">{t('environment.variables')}</h3>
              <Button
                size="sm"
                onClick={addNewVariable}
                className="h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                {t('environment.addVariable')}
              </Button>
            </div>

            {/* 变量列表 */}
            {variables.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No variables yet. Click "Add Variable" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {variables.map((variable) => (
                  <div
                    key={variable.id}
                    className="grid grid-cols-12 gap-3 items-center p-3 border rounded-lg"
                  >
                    {/* 变量名 */}
                    <div className="col-span-3">
                      <Input
                        placeholder="Variable Name"
                        value={variable.name}
                        onChange={(e) => updateVariable(variable.id, 'name', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* 变量类型 */}
                    <div className="col-span-2">
                      <Select
                        value={variable.type}
                        onValueChange={(value) => updateVariable(variable.id, 'type', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="encrypted">Encrypted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 变量值 */}
                    <div className="col-span-6 relative">
                      <Input
                        placeholder="Value"
                        type={variable.type === 'encrypted' && !variable.showValue ? 'password' : 'text'}
                        value={variable.value}
                        onChange={(e) => updateVariable(variable.id, 'value', e.target.value)}
                        className="h-8 text-xs pr-8"
                      />
                      {variable.type === 'encrypted' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleVariableVisibility(variable.id)}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        >
                          {variable.showValue ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>

                    {/* 删除按钮 */}
                    <div className="col-span-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteVariable(variable.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
