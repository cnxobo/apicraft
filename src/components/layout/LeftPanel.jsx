import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Import, Folder, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLayoutStore, useApiStore } from '@/store'
import { useResize } from '@/hooks/useResize'
import { ApiTree } from '@/components/common/ApiTree'
import { cn, HTTP_METHOD_COLORS } from '@/lib/utils'

/**
 * 左侧面板组件
 * 包含New/Import按钮和API集合树
 */
export function LeftPanel() {
  const { leftPanelWidth, leftPanelCollapsed, setLeftPanelWidth } = useLayoutStore()
  const { collections } = useApiStore()

  // 拖拽调整大小
  const { width, startResize, isResizing } = useResize(
    leftPanelWidth,
    200,
    600,
    setLeftPanelWidth
  )

  // 左侧固定图标列表
  const sidebarIcons = [
    { icon: Folder, label: '集合', active: true },
    { icon: Plus, label: '新建' },
    { icon: Import, label: '导入' },
  ]

  return (
    <div className="flex h-full border-r bg-background">
      {/* 左侧固定图标列 */}
      <div className="w-12 border-r bg-muted/30 flex flex-col items-center py-2 space-y-2">
        {sidebarIcons.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={item.active ? "default" : "ghost"}
              size="icon"
              className={cn(
                "w-8 h-8",
                item.active && "bg-primary text-primary-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* 右侧可调整宽度的内容区 */}
      <AnimatePresence mode="wait">
        {!leftPanelCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: width - 48, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col overflow-hidden"
          >
            {/* 上栏：New和Import按钮 */}
            <div className="h-14 border-b flex items-center justify-between px-4">
              <div className="flex space-x-2">
                <Button size="sm" className="flex items-center space-x-1">
                  <Plus className="h-3 w-3" />
                  <span>New</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <Import className="h-3 w-3" />
                  <span>Import</span>
                </Button>
              </div>
            </div>

            {/* 下栏：API集合树 */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full custom-scrollbar">
                <div className="p-2">
                  <ApiTree collections={collections} />
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 拖拽调整大小的手柄 */}
      {!leftPanelCollapsed && (
        <div
          className={cn(
            "w-1 bg-transparent hover:bg-primary/20 cursor-col-resize transition-colors relative",
            isResizing && "bg-primary/30"
          )}
          onMouseDown={startResize}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>
      )}
    </div>
  )
}
