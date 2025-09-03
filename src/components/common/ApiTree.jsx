import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApiStore } from '@/store'
import { cn, HTTP_METHOD_COLORS } from '@/lib/utils'

/**
 * API集合树组件
 * 支持多层级展开/折叠，拖拽排序等功能
 */
export function ApiTree({ collections }) {
  const { openTab, selectedApiId } = useApiStore()
  const [expandedCollections, setExpandedCollections] = useState(
    new Set(collections.filter(col => col.expanded).map(col => col.id))
  )

  // 切换集合展开/折叠状态
  const toggleCollection = (collectionId) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId)
      } else {
        newSet.add(collectionId)
      }
      return newSet
    })
  }

  // 处理API点击
  const handleApiClick = (api) => {
    openTab(api)
  }

  return (
    <div className="space-y-1">
      {collections.map((collection) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          isExpanded={expandedCollections.has(collection.id)}
          onToggle={() => toggleCollection(collection.id)}
          onApiClick={handleApiClick}
          selectedApiId={selectedApiId}
        />
      ))}
    </div>
  )
}

/**
 * 集合项组件
 */
function CollectionItem({ collection, isExpanded, onToggle, onApiClick, selectedApiId }) {
  return (
    <div className="space-y-1">
      {/* 集合标题 */}
      <motion.div
        whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
        className="flex items-center space-x-1 px-2 py-1.5 rounded-md cursor-pointer group"
        onClick={onToggle}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </motion.div>
        
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 text-blue-500" />
        )}
        
        <span className="text-sm font-medium flex-1">{collection.name}</span>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            // 处理更多操作
          }}
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </motion.div>

      {/* API列表 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-4 space-y-1">
              {collection.apis?.map((api) => (
                <ApiItem
                  key={api.id}
                  api={api}
                  isSelected={selectedApiId === api.id}
                  onClick={() => onApiClick(api)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * API项组件
 */
function ApiItem({ api, isSelected, onClick }) {
  const methodColors = HTTP_METHOD_COLORS[api.method] || 'text-gray-600 bg-gray-50'

  return (
    <motion.div
      whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center space-x-2 px-2 py-1.5 rounded-md cursor-pointer group",
        isSelected && "bg-accent"
      )}
      onClick={onClick}
    >
      {/* HTTP方法标签 */}
      <div className={cn(
        "px-1.5 py-0.5 rounded text-xs font-medium",
        methodColors
      )}>
        {api.method}
      </div>
      
      {/* API名称 */}
      <span className="text-sm flex-1 truncate">{api.name}</span>
      
      {/* 更多操作按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation()
          // 处理更多操作
        }}
      >
        <MoreHorizontal className="h-3 w-3" />
      </Button>
    </motion.div>
  )
}
