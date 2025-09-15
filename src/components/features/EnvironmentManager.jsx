import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Globe,
  Folder
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEnvironmentStore, useApiStore } from '@/store'
import { cn } from '@/lib/utils'
import { VariableTable } from './VariableTable'

/**
 * 环境变量管理器主组件
 */
export function EnvironmentManager() {
  const { t } = useTranslation()
  const {
    environmentData,
    selectedEnvironmentId,
    setSelectedEnvironment,
    createEnvironment,
    deleteEnvironment,
    renameEnvironment
  } = useEnvironmentStore()

  const { openEnvironmentTab, createNewEnvironmentTab } = useApiStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newEnvName, setNewEnvName] = useState('')
  const [editingEnvId, setEditingEnvId] = useState(null)
  const [editingName, setEditingName] = useState('')

  // 过滤并排序环境列表
  const filteredEnvironments = environmentData.environments
    .filter(env => env.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)) // 按字典序排序

  // 处理创建新环境 - 打开新环境标签页
  const handleCreateNewEnvironment = () => {
    createNewEnvironmentTab()
  }

  // 处理重命名环境
  const handleRenameEnvironment = (envId) => {
    if (editingName.trim()) {
      renameEnvironment(envId, editingName.trim())
    }
    setEditingEnvId(null)
    setEditingName('')
  }

  // 开始编辑环境名称
  const startEditing = (env) => {
    setEditingEnvId(env.id)
    setEditingName(env.name)
  }

  // 取消编辑
  const cancelEditing = () => {
    setEditingEnvId(null)
    setEditingName('')
  }

  // 处理环境选择
  const handleEnvironmentSelect = (envId, envName) => {
    setSelectedEnvironment(envId)
    openEnvironmentTab(envId, envName)
  }

  // 获取当前选中的环境数据
  const selectedEnvironment = selectedEnvironmentId === 'globals' 
    ? environmentData.globals 
    : environmentData.environments.find(env => env.id === selectedEnvironmentId)

  return (
    <div className="h-full flex bg-background">
      {/* 左侧环境列表 */}
      <div className="w-80 border-r flex flex-col">
        {/* 工具栏 - 创建按钮和搜索在同一行 */}
        <div className="h-12 border-b flex items-center px-3 space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCreateNewEnvironment}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder={t('environment.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-7 text-xs"
            />
          </div>
        </div>

        {/* 环境列表 */}
        <ScrollArea className="flex-1">
          <div className="p-1 space-y-0.5">
            {/* Globals 环境 - 紧凑布局，无图标 */}
            <div
              className={cn(
                "flex items-center justify-between px-3 py-1.5 rounded cursor-pointer transition-colors text-xs",
                selectedEnvironmentId === 'globals'
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
              onClick={() => handleEnvironmentSelect('globals', 'Globals')}
            >
              <span className="font-medium">{t('environment.globals')}</span>
            </div>

            {/* 分隔符 */}
            <div className="h-px bg-border my-1" />



            {/* 用户环境列表 - 紧凑布局，无图标 */}
            {filteredEnvironments.map((env) => (
              <div
                key={env.id}
                className={cn(
                  "flex items-center justify-between px-3 py-1.5 rounded cursor-pointer transition-colors group text-xs",
                  selectedEnvironmentId === env.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => handleEnvironmentSelect(env.id, env.name)}
              >
                <div className="flex items-center flex-1">
                  {editingEnvId === env.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameEnvironment(env.id)
                        if (e.key === 'Escape') cancelEditing()
                      }}
                      onBlur={() => handleRenameEnvironment(env.id)}
                      autoFocus
                      className="h-6 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="font-medium truncate">{env.name}</span>
                  )}
                </div>
                
                {editingEnvId !== env.id && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditing(env)
                      }}
                      className="h-5 w-5"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteEnvironment(env.id)
                      }}
                      className="h-5 w-5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧变量表格 */}
      <div className="flex-1 flex flex-col">
        {selectedEnvironment ? (
          <VariableTable
            environment={selectedEnvironment}
            environmentId={selectedEnvironmentId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select an environment to manage variables</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
