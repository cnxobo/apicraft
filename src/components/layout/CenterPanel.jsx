import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useApiStore } from '@/store'
import { RequestEditor } from '@/components/features/RequestEditor'
import { EnvironmentEditor } from '@/components/features/EnvironmentEditor'
import { EnvironmentSwitcher } from '@/components/common/EnvironmentSwitcher'
import { cn, HTTP_METHOD_COLORS } from '@/lib/utils'

/**
 * 中间面板组件
 * 包含标签头和主工作区
 */
export function CenterPanel() {
  const { t } = useTranslation()
  const { tabs, activeTabId, closeTab, setActiveTab, createNewTab } = useApiStore()

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 标签头 */}
      <div className="h-12 border-b bg-muted/30 flex items-center relative">
        <TabManager
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={setActiveTab}
          onTabClose={closeTab}
          onNewTab={createNewTab}
        />
        {/* 环境切换器 - 独立放置在最右侧 */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
          <EnvironmentSwitcher />
        </div>
      </div>

      {/* 主工作区 */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTabId ? (
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <TabContent tabId={activeTabId} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center text-muted-foreground"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-base font-medium mb-2">{t('welcome.title')}</h3>
                <p className="text-xs text-muted-foreground">{t('welcome.subtitle')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * 标签页内容组件
 */
function TabContent({ tabId }) {
  const { tabs } = useApiStore()
  const tab = tabs.find(t => t.id === tabId)

  if (!tab) return null

  // 根据标签页类型渲染不同的内容
  switch (tab.type) {
    case 'environment':
      return <EnvironmentEditor environmentId={tab.data.environmentId} />
    case 'request':
    default:
      return <RequestEditor tabId={tabId} />
  }
}

/**
 * 标签管理器组件
 */
function TabManager({ tabs, activeTabId, onTabClick, onTabClose, onNewTab }) {
  return (
    <div className="flex items-center h-full overflow-x-auto custom-scrollbar pr-32">
      {/* 标签列表 */}
      <div className="flex items-center">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onClick={() => onTabClick(tab.id)}
            onClose={() => onTabClose(tab.id)}
          />
        ))}
      </div>

      {/* 新建标签按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 ml-2 flex-shrink-0"
        onClick={onNewTab}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

/**
 * 单个标签组件
 */
function Tab({ tab, isActive, onClick, onClose }) {
  const methodColors = HTTP_METHOD_COLORS[tab.data?.method] || 'text-gray-600 bg-gray-50'

  return (
    <motion.div
      whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
      className={cn(
        "flex items-center space-x-2 px-3 py-2 border-r cursor-pointer group relative",
        isActive && "bg-background border-b-2 border-b-primary"
      )}
      onClick={onClick}
    >
      {/* 标签页类型图标 */}
      {tab.type === 'environment' ? (
        <Settings className="h-3 w-3 text-muted-foreground" />
      ) : tab.data?.method && (
        <div className={cn(
          "px-1 py-0.5 rounded text-xs font-medium",
          methodColors
        )}>
          {tab.data.method}
        </div>
      )}

      {/* 标签标题 */}
      <span className="text-sm max-w-32 truncate">
        {tab.title}
      </span>

      {/* 修改指示器 */}
      {tab.modified && (
        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
      )}

      {/* 关闭按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* 活动标签底部指示线 */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  )
}
