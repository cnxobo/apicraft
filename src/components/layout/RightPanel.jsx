import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Settings, Globe, FileText, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLayoutStore, useApiStore } from '@/store'
import { useResize } from '@/hooks/useResize'
import { EnvironmentPanel } from '@/components/features/EnvironmentPanel'
import { cn } from '@/lib/utils'

/**
 * 右侧面板组件
 * 包含环境变量、历史记录、日志等功能面板
 */
export function RightPanel() {
  const { rightPanelWidth, rightPanelCollapsed, setRightPanelWidth } = useLayoutStore()
  const [activePanel, setActivePanel] = React.useState('environment')

  // 拖拽调整大小
  const { width, startResize, isResizing } = useResize(
    rightPanelWidth,
    200,
    600,
    setRightPanelWidth
  )

  // 右侧面板图标列表
  const panelIcons = [
    { id: 'environment', icon: Globe, label: '环境', component: EnvironmentPanel },
    { id: 'history', icon: History, label: '历史' },
    { id: 'docs', icon: FileText, label: '文档' },
    { id: 'logs', icon: Activity, label: '日志' },
    { id: 'settings', icon: Settings, label: '设置' },
  ]

  const activePanelConfig = panelIcons.find(p => p.id === activePanel)

  return (
    <div className="flex h-full border-l bg-background">
      {/* 拖拽调整大小的手柄 */}
      {!rightPanelCollapsed && (
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

      {/* 可调整宽度的内容区 */}
      <AnimatePresence mode="wait">
        {!rightPanelCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: width - 48, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col overflow-hidden"
          >
            {/* 面板标题 */}
            <div className="h-14 border-b flex items-center px-4">
              <div className="flex items-center space-x-2">
                {activePanelConfig && (
                  <>
                    <activePanelConfig.icon className="h-4 w-4" />
                    <span className="font-medium">{activePanelConfig.label}</span>
                  </>
                )}
              </div>
            </div>

            {/* 面板内容 */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activePanelConfig?.component ? (
                    <activePanelConfig.component />
                  ) : (
                    <PanelPlaceholder panelName={activePanelConfig?.label} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 右侧固定图标列 */}
      <div className="w-12 bg-muted/30 flex flex-col items-center py-2 space-y-2">
        {panelIcons.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={item.id === activePanel && !rightPanelCollapsed ? "default" : "ghost"}
              size="icon"
              className={cn(
                "w-8 h-8",
                item.id === activePanel && !rightPanelCollapsed && "bg-primary text-primary-foreground"
              )}
              onClick={() => {
                if (rightPanelCollapsed || activePanel !== item.id) {
                  setActivePanel(item.id)
                  if (rightPanelCollapsed) {
                    // 展开面板的逻辑需要在store中实现
                  }
                }
              }}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/**
 * 面板占位符组件
 */
function PanelPlaceholder({ panelName }) {
  return (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <div className="text-4xl mb-2">🚧</div>
        <h3 className="text-lg font-medium mb-2">{panelName}面板</h3>
        <p className="text-sm">功能开发中，敬请期待...</p>
      </div>
    </div>
  )
}
