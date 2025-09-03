import React from 'react'
import { motion } from 'framer-motion'
import { Search, Settings, User, Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useThemeStore } from '@/store'

/**
 * 顶部工具栏组件
 * 包含全局搜索、用户信息、设置按钮、主题切换等功能
 */
export function Header() {
  const { theme, setTheme } = useThemeStore()

  // 主题图标映射
  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }

  // 切换主题
  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const ThemeIcon = themeIcons[theme]

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
    >
      <div className="flex h-full items-center justify-between px-4">
        {/* 左侧：Logo和搜索 */}
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AC</span>
            </div>
            <span className="font-semibold text-lg">APICraft</span>
          </motion.div>

          {/* 全局搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索API、集合..."
              className="w-64 pl-10"
            />
          </div>
        </div>

        {/* 右侧：工具按钮 */}
        <div className="flex items-center space-x-2">
          {/* 工作区切换 */}
          <Button variant="ghost" size="sm">
            <span className="text-sm">我的工作区</span>
          </Button>

          {/* 主题切换 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ThemeIcon className="h-4 w-4" />
            </motion.div>
          </Button>

          {/* 设置按钮 */}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          {/* 用户信息 */}
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.header>
  )
}
