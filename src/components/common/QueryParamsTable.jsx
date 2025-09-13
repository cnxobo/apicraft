import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Trash2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'


// 可聚焦即编辑的内联文本输入组件
const InlineEditableText = React.forwardRef(function InlineEditableText(
  {
    value = '',
    onChange,
    placeholder,
    ariaLabel,
    className,
  },
  forwardedRef
) {
  const [editing, setEditing] = useState(false)
  const internalRef = React.useRef(null)
  const inputRef = forwardedRef || internalRef

  React.useEffect(() => {
    if (editing) {
      // 等待切换为输入框后再聚焦，并把光标移到文本末尾
      const id = setTimeout(() => {
        if (inputRef?.current) {
          const el = inputRef.current
          el.focus()
          const len = el.value?.length ?? 0
          try { el.setSelectionRange(len, len) } catch {}
        }
      }, 0)
      return () => clearTimeout(id)
    }
  }, [editing, inputRef])

  const hasValue = (value ?? '').trim() !== ''

  return (
    <div className={cn("w-full", className)}>
      {!editing ? (
        <div
          tabIndex={0}
          role="textbox"
          aria-readonly="true"
          aria-label={ariaLabel || placeholder}
          onFocus={() => setEditing(true)}
          className={cn(
            "h-6 text-xs px-2 flex items-center rounded border border-transparent bg-transparent",
            "transition-all duration-150 ease-out",
            hasValue ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {hasValue ? value : (placeholder || '')}
        </div>
      ) : (
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={() => setEditing(false)}
          placeholder={placeholder}
          aria-label={ariaLabel || placeholder}
          className={cn("h-6 text-xs transition-all duration-150 ease-out", className)}
        />
      )}
    </div>
  )
})

/**
 * 可重用的参数表格组件
 *
 * 标准命名约定：
 * - 主组件名称：QueryParamsTable
 * - 在其他页面复用时建议使用别名：
 *   - HeadersTable (用于请求头)
 *   - ParameterTable (通用参数表格)
 *   - FormDataTable (用于表单数据)
 *
 * 功能特性：
 * - 拖拽排序、批量编辑、启用/禁用
 * - 自动新行插入，焦点保持
 * - 完整的国际化支持
 * - 响应式设计和动画效果
 *
 * 使用示例：
 * <QueryParamsTable
 *   params={params}
 *   onUpdate={handleUpdate}
 *   showDescription={true}
 * />
 */
export function QueryParamsTable({
  params = [],
  onUpdate,
  className,
  showDescription = true
}) {
  const { t } = useTranslation()
  const [isBulkEdit, setIsBulkEdit] = useState(false)
  const [bulkEditText, setBulkEditText] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [newRowData, setNewRowData] = useState({ key: '', value: '', description: '' })
  const [isNewRowActive, setIsNewRowActive] = useState(false)

  // 转换参数格式为内部使用的格式
  const normalizedParams = React.useMemo(() => {
    let paramsArray = []

    if (Array.isArray(params)) {
      // 如果已经是数组格式，直接使用
      paramsArray = params
    } else if (params && typeof params === 'object') {
      // 如果是对象格式，转换为数组格式
      paramsArray = Object.entries(params).map(([key, value], index) => ({
        id: `param-${index}`,
        key,
        value: String(value),
        description: '',
        enabled: true
      }))
    }

    return paramsArray.map((param, index) => ({
      id: param.id || `param-${index}`,
      key: param.key || '',
      value: param.value || '',
      description: param.description || '',
      enabled: param.enabled !== false, // 默认启用
      ...param
    }))
  }, [params])

  // 处理参数更新
  const handleParamUpdate = useCallback((index, updates) => {
    const newParams = [...normalizedParams]
    newParams[index] = { ...newParams[index], ...updates }
    onUpdate?.(newParams)
  }, [normalizedParams, onUpdate])

  // 添加新参数
  const handleAddParam = useCallback(() => {
    const newParam = {
      id: `param-${Date.now()}`,
      key: '',
      value: '',
      description: '',
      enabled: true
    }
    onUpdate?.([...normalizedParams, newParam])
  }, [normalizedParams, onUpdate])

  // 删除参数
  const handleDeleteParam = useCallback((index) => {
    const newParams = normalizedParams.filter((_, i) => i !== index)
    onUpdate?.(newParams)
  }, [normalizedParams, onUpdate])

  // 全选/取消全选
  const handleSelectAll = useCallback((checked) => {
    const newParams = normalizedParams.map(param => ({ ...param, enabled: checked }))
    onUpdate?.(newParams)
  }, [normalizedParams, onUpdate])

  // 切换批量编辑模式
  const toggleBulkEdit = useCallback(() => {
    if (isBulkEdit) {
      // 从文本模式切换回表格模式，解析文本
      const lines = bulkEditText.split('\n').filter(line => line.trim())
      const newParams = lines.map((line, index) => {
        const isDisabled = line.trim().startsWith('//')
        const cleanLine = isDisabled ? line.replace(/^\/\/\s*/, '') : line
        const [key = '', value = ''] = cleanLine.split(':').map(s => s.trim())

        return {
          id: `param-${Date.now()}-${index}`,
          key,
          value,
          description: '',
          enabled: !isDisabled
        }
      })
      onUpdate?.(newParams)
    } else {
      // 从表格模式切换到文本模式，生成文本
      const text = normalizedParams.map(param => {
        const prefix = param.enabled ? '' : '// '
        return `${prefix}${param.key}:${param.value}`
      }).join('\n')
      setBulkEditText(text)
    }
    setIsBulkEdit(!isBulkEdit)
  }, [isBulkEdit, bulkEditText, normalizedParams, onUpdate])

  // 拖拽处理
  const handleDragStart = useCallback((index) => {
    setDraggedIndex(index)
  }, [])

  const handleDragOver = useCallback((e, targetIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const newParams = [...normalizedParams]
    const draggedItem = newParams[draggedIndex]
    newParams.splice(draggedIndex, 1)
    newParams.splice(targetIndex, 0, draggedItem)

    setDraggedIndex(targetIndex)
    onUpdate?.(newParams)
  }, [draggedIndex, normalizedParams, onUpdate])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
  }, [])

  // 处理新行输入 - 保持焦点和光标位置
  const handleNewRowChange = useCallback((field, value, inputRef) => {
    // 保存当前光标位置
    const cursorPosition = inputRef?.current?.selectionStart || 0

    const newData = { ...newRowData, [field]: value }
    setNewRowData(newData)

    // 检查是否有任何字段有值
    const hasValue = newData.key.trim() || newData.value.trim() || newData.description.trim()

    if (hasValue && !isNewRowActive) {
      // 第一次输入，激活新行并添加到参数列表
      setIsNewRowActive(true)
      const newParam = {
        id: `param-${Date.now()}`,
        key: newData.key,
        value: newData.value,
        description: newData.description,
        enabled: true
      }
      onUpdate?.([...normalizedParams, newParam])

      // 使用 setTimeout 确保 DOM 更新后恢复焦点和光标位置
      setTimeout(() => {
        if (inputRef?.current) {
          inputRef.current.focus()
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
        }
        // 重置新行数据，准备下一个输入
        setNewRowData({ key: '', value: '', description: '' })
        setIsNewRowActive(false)
      }, 0)
    }
  }, [newRowData, isNewRowActive, normalizedParams, onUpdate])

  // 检查是否全选
  const allEnabled = normalizedParams.length > 0 && normalizedParams.every(param => param.enabled)
  const someEnabled = normalizedParams.some(param => param.enabled)

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 表格标题和操作区 */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
        <h3 className="text-sm font-medium">{t('queryParams.title')}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleBulkEdit}
          className="text-xs h-6 px-2"
        >
          {isBulkEdit ? t('queryParams.keyValueEdit') : t('queryParams.bulkEdit')}
        </Button>
      </div>

      {/* 表格头部：在非批量编辑模式下显示 */}
      {!isBulkEdit && (
        <div className="border-b bg-muted/10">
          <div className="grid grid-cols-12 gap-2 px-3 py-1 text-xs font-medium text-muted-foreground">
            <div className="col-span-1 flex items-center justify-center">
              <span className="text-xs opacity-50">#</span>
            </div>
            <div className="col-span-1 flex items-center">
              <Checkbox
                checked={allEnabled}
                onCheckedChange={handleSelectAll}
                className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                {...(someEnabled && !allEnabled ? { 'data-state': 'indeterminate' } : {})}
              />
            </div>
            <div className="col-span-3 flex items-center">{t('queryParams.key')}</div>
            <div className="col-span-3 flex items-center">{t('queryParams.value')}</div>
            {showDescription && <div className="col-span-3 flex items-center">{t('queryParams.description')}</div>}
            <div className="col-span-1 flex items-center justify-center"></div> {/* 删除按钮 */}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {isBulkEdit ? (
          // 批量编辑模式
          <div className="h-full p-3">
            <textarea
              value={bulkEditText}
              onChange={(e) => setBulkEditText(e.target.value)}
              placeholder={t('queryParams.bulkEditPlaceholder')}
              className="w-full h-full resize-none border rounded-md p-3 text-xs font-mono bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ) : (
          // 表格模式
          <ScrollArea className="h-full">
            <div className="p-3 space-y-0">
              {/* 参数行 */}
              <AnimatePresence>
                {normalizedParams.map((param, index) => (
                  <ParamRow
                    key={param.id}
                    param={param}
                    index={index}
                    showDescription={showDescription}
                    onUpdate={(updates) => handleParamUpdate(index, updates)}
                    onDelete={() => handleDeleteParam(index)}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedIndex === index}
                  />
                ))}
              </AnimatePresence>

              {/* 新参数输入行 */}
              <NewParamRow
                newRowData={newRowData}
                showDescription={showDescription}
                showCheckbox={isNewRowActive}
                onUpdate={handleNewRowChange}
              />

              {/* 空状态 */}
              {normalizedParams.length === 0 && !isNewRowActive && (
                <div className="py-3 text-center text-muted-foreground">
                  <div className="space-y-1">
                    <p className="text-xs">{t('queryParams.noParams')}</p>
                    <p className="text-xs">{t('queryParams.startTyping')}</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}

/**
 * 新参数输入行组件
 */
function NewParamRow({ newRowData, showDescription, showCheckbox, onUpdate }) {
  const { t } = useTranslation()
  const keyInputRef = React.useRef(null)
  const valueInputRef = React.useRef(null)
  const descriptionInputRef = React.useRef(null)

  return (
    <div className="grid grid-cols-12 gap-2 px-3 py-1.5 rounded-md border border-dashed border-muted-foreground/30 bg-muted/10">
      {/* 拖拽手柄占位 */}
      <div className="col-span-1 flex items-center justify-center"></div>

      {/* 启用复选框 */}
      <div className="col-span-1 flex items-center">
        {showCheckbox && (
          <Checkbox checked={true} disabled />
        )}
      </div>

      {/* 键 */}
      <div className="col-span-3">
        <InlineEditableText
          ref={keyInputRef}
          value={newRowData.key}
          onChange={(val) => onUpdate('key', val, keyInputRef)}
          placeholder={t('queryParams.keyPlaceholder')}
          ariaLabel={t('queryParams.key')}
          className="h-6 text-xs"
        />
      </div>

      {/* 值 */}
      <div className="col-span-3">
        <InlineEditableText
          ref={valueInputRef}
          value={newRowData.value}
          onChange={(val) => onUpdate('value', val, valueInputRef)}
          placeholder={t('queryParams.valuePlaceholder')}
          ariaLabel={t('queryParams.value')}
          className="h-6 text-xs"
        />
      </div>

      {/* 描述 */}
      {showDescription && (
        <div className="col-span-3">
          <InlineEditableText
            ref={descriptionInputRef}
            value={newRowData.description}
            onChange={(val) => onUpdate('description', val, descriptionInputRef)}
            placeholder={t('queryParams.descriptionPlaceholder')}
            ariaLabel={t('queryParams.description')}
            className="h-6 text-xs"
          />
        </div>
      )}

      {/* 删除按钮占位 */}
      <div className="col-span-1 flex items-center justify-center"></div>
    </div>
  )
}

/**
 * 参数行组件
 */
function ParamRow({
  param,
  index,
  showDescription,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging
}) {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "grid grid-cols-12 gap-2 px-3 py-1 rounded-md border transition-colors group",
        isDragging && "opacity-50",
        !param.enabled && "opacity-60"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {/* 拖拽手柄 */}
      <div className="col-span-1 flex items-center justify-center">
        <div
          className={cn(
            "cursor-grab active:cursor-grabbing transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          title={t('queryParams.dragToReorder')}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* 启用复选框 */}
      <div className="col-span-1 flex items-center">
        <Checkbox
          checked={param.enabled}
          onCheckedChange={(checked) => onUpdate({ enabled: checked })}
        />
      </div>

      {/* 键 */}
      <div className="col-span-3">
        <InlineEditableText
          value={param.key}
          onChange={(val) => onUpdate({ key: val })}
          placeholder={t('queryParams.keyPlaceholder')}
          ariaLabel={t('queryParams.key')}
          className="h-6 text-xs"
        />
      </div>

      {/* 值 */}
      <div className="col-span-3">
        <InlineEditableText
          value={param.value}
          onChange={(val) => onUpdate({ value: val })}
          placeholder={t('queryParams.valuePlaceholder')}
          ariaLabel={t('queryParams.value')}
          className="h-6 text-xs"
        />
      </div>

      {/* 描述 */}
      {showDescription && (
        <div className="col-span-3">
          <InlineEditableText
            value={param.description}
            onChange={(val) => onUpdate({ description: val })}
            placeholder={t('queryParams.descriptionPlaceholder')}
            ariaLabel={t('queryParams.description')}
            className="h-6 text-xs"
          />
        </div>
      )}

      {/* 删除按钮 */}
      <div className="col-span-1 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className={cn(
            "h-6 w-6 text-destructive hover:text-destructive transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          title={t('queryParams.deleteParam')}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  )
}
