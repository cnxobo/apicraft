import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const {
    environmentData,
    selectedEnvironmentId,
    setSelectedEnvironment,
    createEnvironment,
    deleteEnvironment,
    renameEnvironment
  } = useEnvironmentStore()

  const { openEnvironmentTab } = useApiStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newEnvName, setNewEnvName] = useState('')
  const [editingEnvId, setEditingEnvId] = useState(null)
  const [editingName, setEditingName] = useState('')

  // 过滤并排序环境列表
  const filteredEnvironments = environmentData.environments
    .filter(env => env.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)) // 按字典序排序

  // 处理创建新环境
  const handleCreateEnvironment = () => {
    if (newEnvName.trim()) {
      createEnvironment(newEnvName.trim())
      setNewEnvName('')
      setIsCreating(false)
    }
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
        {/* 工具栏 */}
        <div className="h-14 border-b flex items-center justify-between px-4 space-x-2">
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="h-3 w-3" />
            <span>Create New Environment</span>
          </Button>
        </div>

        {/* 搜索框 */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search environments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* 环境列表 */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* Globals 环境 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                selectedEnvironmentId === 'globals'
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
              onClick={() => handleEnvironmentSelect('globals', 'Globals')}
            >
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">Globals</span>
              </div>
              <span className="text-xs opacity-70">
                {environmentData.globals.variables.length} vars
              </span>
            </motion.div>

            {/* 分隔符 */}
            <div className="h-px bg-border my-2" />

            {/* 创建新环境输入框 */}
            <AnimatePresence>
              {isCreating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center space-x-2 p-2"
                >
                  <Input
                    placeholder="Environment name"
                    value={newEnvName}
                    onChange={(e) => setNewEnvName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateEnvironment()
                      if (e.key === 'Escape') {
                        setIsCreating(false)
                        setNewEnvName('')
                      }
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCreateEnvironment}
                    className="h-8 w-8"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setIsCreating(false)
                      setNewEnvName('')
                    }}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 用户环境列表 */}
            {filteredEnvironments.map((env) => (
              <motion.div
                key={env.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group",
                  selectedEnvironmentId === env.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => handleEnvironmentSelect(env.id, env.name)}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <Folder className="h-4 w-4" />
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
                      className="h-6 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="font-medium truncate">{env.name}</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <span className="text-xs opacity-70">
                    {env.variables.length} vars
                  </span>
                  
                  {editingEnvId === env.id ? (
                    <div className="flex space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRenameEnvironment(env.id)
                        }}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          cancelEditing()
                        }}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditing(env)
                        }}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
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
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
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
