import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, EyeOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEnvironmentStore } from '@/store'
import { cn } from '@/lib/utils'

/**
 * 环境变量面板组件
 * 管理不同环境的变量配置
 */
export function EnvironmentPanel() {
  const { environmentData, selectedEnvironmentId, setSelectedEnvironment } = useEnvironmentStore()
  const [editingVar, setEditingVar] = useState(null)
  const [showValues, setShowValues] = useState({})

  // 切换环境
  const handleEnvironmentChange = (envId) => {
    setSelectedEnvironment(envId)
  }

  // 切换变量值显示/隐藏
  const toggleValueVisibility = (envId, varKey) => {
    setShowValues(prev => ({
      ...prev,
      [`${envId}-${varKey}`]: !prev[`${envId}-${varKey}`]
    }))
  }

  // 开始编辑变量
  const startEditingVar = (envId, varKey, varValue) => {
    setEditingVar({ envId, varKey, varValue, newValue: varValue })
  }

  // 保存变量编辑
  const saveVarEdit = () => {
    // 这里应该调用store的更新方法
    console.log('保存变量编辑:', editingVar)
    setEditingVar(null)
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingVar(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* 环境选择器 */}
      <div className="p-4 border-b">
        <div className="space-y-2">
          <label className="text-sm font-medium">当前环境</label>
          <select
            value={selectedEnvironmentId}
            onChange={(e) => handleEnvironmentChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option key="globals" value="globals">
              {environmentData.globals.name}
            </option>
            {environmentData.environments.map(env => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 环境变量列表 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <EnvironmentSection
              key="globals"
              environment={environmentData.globals}
              isActive={selectedEnvironmentId === "globals"}
              showValues={showValues}
              editingVar={editingVar}
              onToggleVisibility={toggleValueVisibility}
              onStartEdit={startEditingVar}
              onSaveEdit={saveVarEdit}
              onCancelEdit={cancelEdit}
              setEditingVar={setEditingVar}
            />
            {environmentData.environments.map(env => (
              <EnvironmentSection
                key={env.id}
                environment={env}
                isActive={env.id === selectedEnvironmentId}
                showValues={showValues}
                editingVar={editingVar}
                onToggleVisibility={toggleValueVisibility}
                onStartEdit={startEditingVar}
                onSaveEdit={saveVarEdit}
                onCancelEdit={cancelEdit}
                setEditingVar={setEditingVar}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 添加新环境按钮 */}
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          添加环境
        </Button>
      </div>
    </div>
  )
}

/**
 * 环境配置区域组件
 */
function EnvironmentSection({
  environment,
  isActive,
  showValues,
  editingVar,
  onToggleVisibility,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  setEditingVar
}) {
  const variables = environment.variables || {}
  const variableEntries = Object.entries(variables)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border rounded-lg p-3 space-y-3",
        isActive && "border-primary bg-primary/5"
      )}
    >
      {/* 环境标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">{environment.name}</h3>
          {isActive && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        <Button variant="ghost" size="sm">
          <Edit className="h-3 w-3" />
        </Button>
      </div>

      {/* 变量列表 */}
      <div className="space-y-2">
        {variableEntries.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            暂无环境变量
          </div>
        ) : (
          variableEntries.map(([key, value]) => (
            <VariableItem
              key={key}
              envId={environment.id}
              varKey={key}
              varValue={value}
              isVisible={showValues[`${environment.id}-${key}`]}
              isEditing={editingVar?.envId === environment.id && editingVar?.varKey === key}
              editingVar={editingVar}
              onToggleVisibility={() => onToggleVisibility(environment.id, key)}
              onStartEdit={() => onStartEdit(environment.id, key, value)}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              setEditingVar={setEditingVar}
            />
          ))
        )}
      </div>

      {/* 添加变量按钮 */}
      <Button variant="ghost" size="sm" className="w-full">
        <Plus className="h-3 w-3 mr-1" />
        添加变量
      </Button>
    </motion.div>
  )
}

/**
 * 变量项组件
 */
function VariableItem({
  envId,
  varKey,
  varValue,
  isVisible,
  isEditing,
  editingVar,
  onToggleVisibility,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  setEditingVar
}) {
  const displayValue = isVisible ? varValue : '•'.repeat(Math.min(varValue.length, 8))

  return (
    <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
      {/* 变量名 */}
      <span className="text-sm font-medium min-w-20 truncate">{varKey}</span>

      {/* 变量值 */}
      <div className="flex-1 flex items-center space-x-1">
        {isEditing ? (
          <Input
            value={editingVar.newValue}
            onChange={(e) => setEditingVar({ ...editingVar, newValue: e.target.value })}
            className="h-7 text-xs"
            autoFocus
          />
        ) : (
          <span className="text-xs text-muted-foreground font-mono truncate">
            {displayValue}
          </span>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center space-x-1">
        {isEditing ? (
          <>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onSaveEdit}>
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancelEdit}>
              <Trash2 className="h-3 w-3 text-red-600" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onToggleVisibility}
            >
              {isVisible ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onStartEdit}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
