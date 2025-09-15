import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Import,
  Folder,
  Settings,
  GitBranch,
  Database,
  History,
  FileText,
  Activity
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLayoutStore, useApiStore } from '@/store'
import { useResize } from '@/hooks/useResize'
import { ApiTree } from '@/components/common/ApiTree'
import { EnvironmentManager } from '@/components/features/EnvironmentManager'
import { ActionBar } from '@/components/common/ActionBar'
import { cn } from '@/lib/utils'

/**
 * 左侧面板组件
 * 包含图标导航和内容区域
 */
export function LeftPanel() {
  const { t } = useTranslation()
  const {
    leftPanelWidth,
    leftPanelCollapsed,
    leftPanelActiveView,
    setLeftPanelWidth,
    setLeftPanelActiveView
  } = useLayoutStore()
  const { collections, createNewTab, createNewEnvironmentTab } = useApiStore()

  // 拖拽调整大小
  const { width, startResize, isResizing } = useResize(
    leftPanelWidth,
    200,
    600,
    setLeftPanelWidth
  )

  // 导航项配置
  const navigationItems = [
    {
      id: 'collections',
      icon: Folder,
      label: t('sidebar.collections'),
      view: 'collections',
      active: leftPanelActiveView === 'collections'
    },
    {
      id: 'environments',
      icon: Settings,
      label: t('sidebar.environments'),
      view: 'environments',
      active: leftPanelActiveView === 'environments'
    },
    {
      id: 'flows',
      icon: GitBranch,
      label: t('sidebar.flows'),
      view: 'flows',
      active: leftPanelActiveView === 'flows'
    },
    {
      id: 'apis',
      icon: Database,
      label: t('sidebar.apis'),
      view: 'apis',
      active: leftPanelActiveView === 'apis'
    },
    {
      id: 'history',
      icon: History,
      label: t('sidebar.history'),
      view: 'history',
      active: leftPanelActiveView === 'history'
    },
    {
      id: 'docs',
      icon: FileText,
      label: t('sidebar.docs'),
      view: 'docs',
      active: leftPanelActiveView === 'docs'
    },
    {
      id: 'logs',
      icon: Activity,
      label: t('sidebar.logs'),
      view: 'logs',
      active: leftPanelActiveView === 'logs'
    }
  ]

  // 处理新建按钮点击
  const handleNewClick = (itemType) => {
    switch (itemType) {
      case 'http':
        createNewTab()
        break
      case 'environment':
        createNewEnvironmentTab()
        break
      case 'collection':
        // TODO: 实现创建集合功能
        console.log('Create collection')
        break
      case 'workspace':
        // TODO: 实现创建工作区功能
        console.log('Create workspace')
        break
      default:
        createNewTab()
        break
    }
  }

  // 处理导入按钮点击
  const handleImportClick = (activeView) => {
    // TODO: 实现导入功能
    console.log('Import clicked for view:', activeView)
  }

  return (
    <div className="flex h-full border-r bg-background">
      {/* 左侧图标导航栏 */}
      <div className="w-20 border-r bg-muted/20 flex flex-col py-3">
        <ScrollArea className="flex-1">
          <div className="space-y-1 px-2">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                onClick={() => setLeftPanelActiveView(item.view)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧内容区域 */}
      <AnimatePresence mode="wait">
        {!leftPanelCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: width - 80, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col overflow-hidden"
          >
            <ContentArea
              activeView={leftPanelActiveView}
              collections={collections}
              onNewClick={() => handleNewClick(leftPanelActiveView)}
              onImportClick={() => handleImportClick(leftPanelActiveView)}
            />
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

/**
 * 导航项组件
 */
function NavigationItem({ item, onClick }) {
  const Icon = item.icon

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
          "w-16 h-16 flex flex-col items-center justify-center gap-1 p-1 transition-all duration-200 rounded-lg mx-auto",
          "hover:bg-selection hover:text-selection-foreground",
          item.active && "bg-selection text-selection-foreground shadow-sm border border-selection/20"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="text-[8px] font-medium leading-none text-center max-w-full truncate px-0.5">
          {item.label}
        </span>
      </Button>
    </motion.div>
  )
}

/**
 * 内容区域组件
 */
function ContentArea({ activeView, collections, onNewClick, onImportClick }) {
  const { t } = useTranslation()

  switch (activeView) {
    case 'collections':
      return (
        <>
          <ActionBar
            activeView={activeView}
            onNewClick={onNewClick}
            onImportClick={onImportClick}
          />
          {/* API集合树 */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2">
                <ApiTree collections={collections} />
              </div>
            </ScrollArea>
          </div>
        </>
      )

    case 'environments':
      return (
        <>
          <ActionBar
            activeView={activeView}
            onNewClick={onNewClick}
            onImportClick={onImportClick}
          />
          <div className="flex-1 overflow-hidden">
            <EnvironmentManager />
          </div>
        </>
      )

    default:
      return (
        <>
          <ActionBar
            activeView={activeView}
            onNewClick={onNewClick}
            onImportClick={onImportClick}
          />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground max-w-sm">
              <div className="text-5xl mb-6">🚧</div>
              <h3 className="text-base font-medium mb-3 capitalize">{activeView}</h3>
              <p className="text-xs leading-relaxed">{t('settings.underDevelopment')}</p>
            </div>
          </div>
        </>
      )
  }
}
