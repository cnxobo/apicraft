import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Settings, User, Moon, Sun, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useThemeStore } from '@/store'
import { SettingsModal } from '@/components/features/SettingsModal'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'

/**
 * 顶部工具栏组件
 * 包含全局搜索、用户信息、设置按钮、主题切换等功能
 */
export function Header() {
  const { t } = useTranslation()
  const { theme, setTheme } = useThemeStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

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
      className="h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
    >
      <div className="flex h-full items-center justify-between px-3">
        {/* 左侧：Logo和搜索 */}
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">AC</span>
            </div>
            <span className="font-semibold text-base">{t('header.appName')}</span>
          </motion.div>

          {/* 全局搜索框 */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t('header.searchPlaceholder')}
              className="w-56 pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* 右侧：工具按钮 */}
        <div className="flex items-center space-x-1">
          {/* 工作区切换 */}
          <Button variant="ghost" size="sm" className="h-8 px-3">
            <span className="text-xs">{t('header.myWorkspace')}</span>
          </Button>

          {/* 语言切换 */}
          <LanguageSwitcher />

          {/* 主题切换 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative h-8 w-8"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ThemeIcon className="h-3.5 w-3.5" />
            </motion.div>
          </Button>

          {/* 设置按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="h-8 w-8"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>

          {/* 用户信息 */}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <User className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 设置模态框 */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </motion.header>
  )
}
