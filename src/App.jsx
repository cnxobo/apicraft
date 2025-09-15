import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { LeftPanel } from '@/components/layout/LeftPanel'
import { CenterPanel } from '@/components/layout/CenterPanel'
import { RightPanel } from '@/components/layout/RightPanel'
import { Footer } from '@/components/layout/Footer'
import { useThemeStore, useApiStore, useLayoutStore, useEnvironmentStore } from '@/store'
import { mockCollections, mockEnvironments } from '@/data/mockData'

/**
 * 主应用组件
 * 整体布局：顶部工具栏 + 中间三列布局 + 底部状态栏
 */
function App() {
  const { theme, setTheme } = useThemeStore()
  const { collections, initializeCollections, isInitialized: collectionsInitialized } = useApiStore()
  const { initializeData, isInitialized: environmentsInitialized } = useEnvironmentStore()
  const { leftPanelCollapsed, rightPanelCollapsed } = useLayoutStore()

  // 初始化主题
  useEffect(() => {
    // 应用保存的主题设置
    setTheme(theme)
  }, [])

  // 初始化数据从 IndexedDB
  useEffect(() => {
    const initializeStores = async () => {
      try {
        await Promise.all([
          initializeData(),
          initializeCollections()
        ])
      } catch (error) {
        console.error('Failed to initialize stores:', error)
      }
    }

    initializeStores()
  }, [])

  // 监听系统主题变化
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => setTheme('system')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, setTheme])

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* 顶部工具栏 */}
      <Header />

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 */}
        <motion.div
          animate={{ 
            width: leftPanelCollapsed ? 48 : 'auto'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <LeftPanel />
        </motion.div>

        {/* 中间主工作区 */}
        <div className="flex-1 overflow-hidden">
          <CenterPanel />
        </div>

        {/* 右侧面板 */}
        <motion.div
          animate={{ 
            width: rightPanelCollapsed ? 48 : 'auto'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <RightPanel />
        </motion.div>
      </div>

      {/* 底部状态栏 */}
      <Footer />

      {/* 全局加载指示器 */}
      <LoadingIndicator />
    </div>
  )
}

/**
 * 全局加载指示器组件
 */
function LoadingIndicator() {
  const [isLoading, setIsLoading] = React.useState(false)

  // 这里可以监听全局的加载状态
  // 比如API请求、文件导入等操作

  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-14 left-0 right-0 z-50"
    >
      <div className="loading-bar" />
    </motion.div>
  )
}

export default App
