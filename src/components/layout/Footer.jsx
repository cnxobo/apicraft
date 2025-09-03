import React from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Activity, Clock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApiStore } from '@/store'

/**
 * 底部状态栏组件
 * 显示当前环境、网络状态、接口执行状态、实时日志等信息
 */
export function Footer() {
  const { activeEnvironment, environments } = useApiStore()
  const [networkStatus, setNetworkStatus] = React.useState('online')
  const [requestCount, setRequestCount] = React.useState(0)
  const [lastRequestTime, setLastRequestTime] = React.useState(null)

  // 获取当前环境信息
  const currentEnv = environments.find(env => env.id === activeEnvironment)

  // 模拟网络状态检测
  React.useEffect(() => {
    const checkNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline')
    }

    window.addEventListener('online', checkNetworkStatus)
    window.addEventListener('offline', checkNetworkStatus)
    checkNetworkStatus()

    return () => {
      window.removeEventListener('online', checkNetworkStatus)
      window.removeEventListener('offline', checkNetworkStatus)
    }
  }, [])

  return (
    <motion.footer
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-8 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-full items-center justify-between px-4 text-xs text-muted-foreground">
        {/* 左侧：环境和网络状态 */}
        <div className="flex items-center space-x-4">
          {/* 当前环境 */}
          <div className="flex items-center space-x-1">
            <Globe className="h-3 w-3" />
            <span>环境:</span>
            <span className="text-foreground font-medium">
              {currentEnv?.name || 'Development'}
            </span>
          </div>

          {/* 网络状态 */}
          <div className="flex items-center space-x-1">
            {networkStatus === 'online' ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
            <span className={networkStatus === 'online' ? 'text-green-600' : 'text-red-600'}>
              {networkStatus === 'online' ? '在线' : '离线'}
            </span>
          </div>

          {/* 请求统计 */}
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>请求: {requestCount}</span>
          </div>
        </div>

        {/* 右侧：执行状态和日志 */}
        <div className="flex items-center space-x-4">
          {/* 最后请求时间 */}
          {lastRequestTime && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>最后请求: {lastRequestTime}</span>
            </div>
          )}

          {/* 实时日志入口 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
          >
            查看日志
          </Button>

          {/* 状态指示器 */}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>就绪</span>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
