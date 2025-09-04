import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff
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
 * 变量类型选择器
 */
function TypeSelector({ value, onChange, disabled = false }) {
  const types = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'datetime', label: 'DateTime' },
    { value: 'secret', label: 'Secret' }
  ]

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8">
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

  if (type === 'secret') {
    return (
      <div className="relative">
        <Input
          type={showSecret ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-8"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowSecret(!showSecret)}
          className="absolute right-0 top-0 h-full w-8 hover:bg-transparent"
        >
          {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
      </div>
    )
  }

  if (type === 'boolean') {
    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">true</SelectItem>
          <SelectItem value="false">false</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <Input
      type={type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}

/**
 * 变量表格组件
 */
export function VariableTable({ environment, environmentId }) {
  const {
    addVariable,
    updateVariable,
    deleteVariable
  } = useEnvironmentStore()

  const [editingVarId, setEditingVarId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'string',
    initialValue: '',
    currentValue: ''
  })

  // 处理添加新变量
  const handleAddVariable = () => {
    if (newVariable.name.trim()) {
      addVariable(environmentId, {
        ...newVariable,
        currentValue: newVariable.currentValue || newVariable.initialValue
      })
      setNewVariable({
        name: '',
        type: 'string',
        initialValue: '',
        currentValue: ''
      })
      setIsAdding(false)
    }
  }

  // 处理更新变量
  const handleUpdateVariable = (varId, updates) => {
    updateVariable(environmentId, varId, updates)
    setEditingVarId(null)
  }

  // 处理删除变量
  const handleDeleteVariable = (varId) => {
    deleteVariable(environmentId, varId)
  }

  // 重置当前值到初始值
  const resetToInitialValue = (variable) => {
    updateVariable(environmentId, variable.id, {
      currentValue: variable.initialValue
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* 表格头部 */}
      <div className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">{environment.name}</h2>
          <span className="text-sm text-muted-foreground">
            ({environment.variables.length} variables)
          </span>
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

      {/* 表格内容 */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="border rounded-lg overflow-hidden">
            {/* 表格头 */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
              <div className="col-span-3">Variable</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Initial Value</div>
              <div className="col-span-3">Current Value</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* 添加新变量行 */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-12 gap-4 p-4 border-b bg-accent/20"
                >
                  <div className="col-span-3">
                    <Input
                      placeholder="Variable name"
                      value={newVariable.name}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  <div className="col-span-2">
                    <TypeSelector
                      value={newVariable.type}
                      onChange={(type) => setNewVariable(prev => ({ ...prev, type }))}
                    />
                  </div>
                  <div className="col-span-3">
                    <ValueInput
                      type={newVariable.type}
                      value={newVariable.initialValue}
                      onChange={(value) => setNewVariable(prev => ({ 
                        ...prev, 
                        initialValue: value,
                        currentValue: prev.currentValue || value
                      }))}
                      placeholder="Initial value"
                    />
                  </div>
                  <div className="col-span-3">
                    <ValueInput
                      type={newVariable.type}
                      value={newVariable.currentValue}
                      onChange={(value) => setNewVariable(prev => ({ ...prev, currentValue: value }))}
                      placeholder="Current value"
                    />
                  </div>
                  <div className="col-span-1 flex space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleAddVariable}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsAdding(false)
                        setNewVariable({
                          name: '',
                          type: 'string',
                          initialValue: '',
                          currentValue: ''
                        })
                      }}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
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
                onReset={() => resetToInitialValue(variable)}
                isEven={index % 2 === 0}
              />
            ))}

            {/* 空状态 */}
            {environment.variables.length === 0 && !isAdding && (
              <div className="p-12 text-center text-muted-foreground">
                <div className="space-y-2">
                  <p>No variables defined</p>
                  <p className="text-sm">Click "Add Variable" to create your first variable</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
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
  onReset,
  isEven 
}) {
  const [editData, setEditData] = useState({
    name: variable.name,
    type: variable.type,
    initialValue: variable.initialValue,
    currentValue: variable.currentValue
  })

  const handleSave = () => {
    onSave(editData)
  }

  const handleCancel = () => {
    setEditData({
      name: variable.name,
      type: variable.type,
      initialValue: variable.initialValue,
      currentValue: variable.currentValue
    })
    onCancel()
  }

  const hasChanged = variable.currentValue !== variable.initialValue

  return (
    <motion.div
      layout
      className={cn(
        "grid grid-cols-12 gap-4 p-4 border-b group hover:bg-muted/30 transition-colors",
        isEven && "bg-muted/10"
      )}
    >
      <div className="col-span-3">
        {isEditing ? (
          <Input
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
          />
        ) : (
          <span className="font-medium">{variable.name}</span>
        )}
      </div>
      
      <div className="col-span-2">
        {isEditing ? (
          <TypeSelector
            value={editData.type}
            onChange={(type) => setEditData(prev => ({ ...prev, type }))}
          />
        ) : (
          <span className="text-sm px-2 py-1 bg-secondary rounded capitalize">
            {variable.type}
          </span>
        )}
      </div>
      
      <div className="col-span-3">
        {isEditing ? (
          <ValueInput
            type={editData.type}
            value={editData.initialValue}
            onChange={(value) => setEditData(prev => ({ ...prev, initialValue: value }))}
          />
        ) : (
          <span className="text-sm text-muted-foreground break-all">
            {variable.type === 'secret' ? '••••••••' : variable.initialValue}
          </span>
        )}
      </div>
      
      <div className="col-span-3">
        {isEditing ? (
          <ValueInput
            type={editData.type}
            value={editData.currentValue}
            onChange={(value) => setEditData(prev => ({ ...prev, currentValue: value }))}
          />
        ) : (
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-sm break-all",
              hasChanged && "text-orange-600 dark:text-orange-400"
            )}>
              {variable.type === 'secret' ? '••••••••' : variable.currentValue}
            </span>
            {hasChanged && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onReset}
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                title="Reset to initial value"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="col-span-1">
        {isEditing ? (
          <div className="flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              className="h-8 w-8"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={onEdit}
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
