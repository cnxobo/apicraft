import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react'
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
import { cn } from '@/lib/utils'

/**
 * 环境变量编辑器组件 - 用于标签页中的环境变量管理
 */
export function EnvironmentEditor({ environmentId }) {
  const { t } = useTranslation()
  const {
    environmentData,
    addVariable,
    updateVariable,
    deleteVariable
  } = useEnvironmentStore()

  const [editingVarId, setEditingVarId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'regular',
    value: ''
  })

  // 获取环境数据
  const environment = environmentId === 'globals' 
    ? environmentData.globals 
    : environmentData.environments.find(env => env.id === environmentId)

  if (!environment) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Environment not found</p>
        </div>
      </div>
    )
  }

  // 处理添加新变量
  const handleAddVariable = async () => {
    if (newVariable.name.trim()) {
      try {
        await addVariable(environmentId, newVariable)
        setNewVariable({
          name: '',
          type: 'regular',
          value: ''
        })
        setIsAdding(false)
      } catch (error) {
        console.error('Failed to add variable:', error)
      }
    }
  }

  // 处理更新变量
  const handleUpdateVariable = async (varId, updates) => {
    try {
      await updateVariable(environmentId, varId, updates)
      setEditingVarId(null)
    } catch (error) {
      console.error('Failed to update variable:', error)
    }
  }

  // 处理删除变量
  const handleDeleteVariable = async (varId) => {
    try {
      await deleteVariable(environmentId, varId)
    } catch (error) {
      console.error('Failed to delete variable:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 头部 - 简化布局，移除图标和统计 */}
      <div className="h-14 border-b flex items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold">{environment.name}</h2>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-1"
        >
          <Plus className="h-3 w-3" />
          <span>Add Variable</span>
        </Button>
      </div>

      {/* 变量表格 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <div className="border rounded-lg overflow-hidden">
              {/* 表格头 - 简化为单一值字段，紧凑布局 */}
              <div className="grid grid-cols-12 gap-3 p-3 bg-muted/50 border-b font-medium text-xs">
                <div className="col-span-4">{t('environment.variableName')}</div>
                <div className="col-span-2">{t('environment.variableType')}</div>
                <div className="col-span-5">{t('environment.variableValue')}</div>
                <div className="col-span-1">{t('common.actions')}</div>
              </div>

              {/* 添加新变量行 */}
              <AnimatePresence>
                {isAdding && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-12 gap-3 p-3 border-b bg-accent/20"
                  >
                    <div className="col-span-4">
                      <Input
                        placeholder="Variable name"
                        value={newVariable.name}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                        autoFocus
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <TypeSelector
                        value={newVariable.type}
                        onChange={(type) => setNewVariable(prev => ({ ...prev, type }))}
                      />
                    </div>
                    <div className="col-span-5">
                      <ValueInput
                        type={newVariable.type}
                        value={newVariable.value}
                        onChange={(value) => setNewVariable(prev => ({ ...prev, value }))}
                        placeholder="Value"
                      />
                    </div>
                    <div className="col-span-1 flex space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleAddVariable}
                        className="h-6 w-6"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setIsAdding(false)
                          setNewVariable({
                            name: '',
                            type: 'regular',
                            value: ''
                          })
                        }}
                        className="h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 变量列表 */}
              {environment.variables.map((variable, index) => (
                <VariableRow
                  key={variable.id}
                  variable={variable}
                  environmentId={environmentId}
                  isEditing={editingVarId === variable.id}
                  onEdit={() => setEditingVarId(variable.id)}
                  onSave={(updates) => handleUpdateVariable(variable.id, updates)}
                  onCancel={() => setEditingVarId(null)}
                  onDelete={() => handleDeleteVariable(variable.id)}

                  isEven={index % 2 === 0}
                />
              ))}

              {/* 空状态 */}
              {environment.variables.length === 0 && !isAdding && (
                <div className="p-12 text-center text-muted-foreground">
                  <div className="space-y-2">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No variables defined</p>
                    <p className="text-sm">Click "Add Variable" to create your first variable</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

/**
 * 变量类型选择器
 */
function TypeSelector({ value, onChange, disabled = false }) {
  const types = [
    { value: 'regular', label: 'Regular' },
    { value: 'encrypted', label: 'Encrypted' }
  ]

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {types.map(type => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * 变量值输入器
 */
function ValueInput({ type, value, onChange, placeholder, disabled = false }) {
  const [showSecret, setShowSecret] = useState(false)

  if (type === 'encrypted') {
    return (
      <div className="relative">
        <Input
          type={showSecret ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-8 h-8 text-xs"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowSecret(!showSecret)}
          className="absolute right-0 top-0 h-8 w-8 hover:bg-transparent"
        >
          {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
      </div>
    )
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-8 text-xs"
    />
  )
}

/**
 * 变量行组件
 */
function VariableRow({
  variable,
  environmentId,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  isEven
}) {
  const [editData, setEditData] = useState({
    name: variable.name,
    type: variable.type,
    value: variable.value
  })

  const handleSave = () => {
    onSave(editData)
  }

  const handleCancel = () => {
    setEditData({
      name: variable.name,
      type: variable.type,
      value: variable.value
    })
    onCancel()
  }

  return (
    <motion.div
      layout
      className={cn(
        "grid grid-cols-12 gap-3 p-2 border-b group hover:bg-muted/30 transition-colors",
        isEven && "bg-muted/10"
      )}
    >
      <div className="col-span-4">
        {isEditing ? (
          <Input
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            className="h-8 text-xs"
          />
        ) : (
          <span className="font-medium text-xs">{variable.name}</span>
        )}
      </div>

      <div className="col-span-2">
        {isEditing ? (
          <TypeSelector
            value={editData.type}
            onChange={(type) => setEditData(prev => ({ ...prev, type }))}
          />
        ) : (
          <span className="text-xs px-2 py-1 bg-secondary rounded capitalize">
            {variable.type}
          </span>
        )}
      </div>

      <div className="col-span-5">
        {isEditing ? (
          <ValueInput
            type={editData.type}
            value={editData.value}
            onChange={(value) => setEditData(prev => ({ ...prev, value }))}
          />
        ) : (
          <span className="text-xs break-all">
            {variable.type === 'encrypted' ? '••••••••' : variable.value}
          </span>
        )}
      </div>
      

      
      <div className="col-span-1">
        {isEditing ? (
          <div className="flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              className="h-6 w-6"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={onEdit}
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
