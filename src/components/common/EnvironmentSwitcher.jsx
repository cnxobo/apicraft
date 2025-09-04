import React, { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEnvironmentStore } from '@/store'
import { cn } from '@/lib/utils'

/**
 * 环境切换器组件
 * 用于在标签栏中切换当前环境
 */
export function EnvironmentSwitcher() {
  const { t } = useTranslation()
  const { environmentData, selectedEnvironmentId, setSelectedEnvironment } = useEnvironmentStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // 获取当前选中的环境名称
  const getCurrentEnvironmentName = () => {
    if (!selectedEnvironmentId) return t('environment.noEnvironment')
    if (selectedEnvironmentId === 'globals') return environmentData.globals.name
    
    const env = environmentData.environments.find(e => e.id === selectedEnvironmentId)
    return env?.name || t('environment.noEnvironment')
  }

  // 过滤环境列表
  const filteredEnvironments = environmentData.environments.filter(env =>
    env.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEnvironmentSelect = (envId) => {
    setSelectedEnvironment(envId)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-8 px-3 text-xs font-medium border border-input bg-background",
          "hover:bg-selection hover:text-selection-foreground",
          "flex items-center space-x-2 min-w-32 justify-between"
        )}
      >
        <span className="truncate">{getCurrentEnvironmentName()}</span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />

          {/* 下拉菜单 */}
          <div className="absolute top-full right-0 mt-1 w-64 bg-popover border rounded-md shadow-lg z-[101]">
            {/* 搜索框 */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-7 text-xs"
                />
              </div>
            </div>

            {/* 环境列表 */}
            <ScrollArea className="max-h-64">
              <div className="p-1">
                {/* No Environment 选项 */}
                <button
                  onClick={() => handleEnvironmentSelect(null)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 text-xs rounded-sm transition-colors",
                    "hover:bg-selection hover:text-selection-foreground",
                    !selectedEnvironmentId && "bg-selection text-selection-foreground",
                    "text-muted-foreground"
                  )}
                >
                  {t('environment.noEnvironment')}
                </button>

                {/* Globals 环境 */}
                <button
                  onClick={() => handleEnvironmentSelect('globals')}
                  className={cn(
                    "w-full text-left px-2 py-1.5 text-xs rounded-sm transition-colors",
                    "hover:bg-selection hover:text-selection-foreground",
                    selectedEnvironmentId === 'globals' && "bg-selection text-selection-foreground"
                  )}
                >
                  {environmentData.globals.name}
                </button>

                {/* 用户定义的环境 */}
                {filteredEnvironments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => handleEnvironmentSelect(env.id)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-xs rounded-sm transition-colors",
                      "hover:bg-selection hover:text-selection-foreground",
                      selectedEnvironmentId === env.id && "bg-selection text-selection-foreground"
                    )}
                  >
                    {env.name}
                  </button>
                ))}

                {/* 无搜索结果 */}
                {searchTerm && filteredEnvironments.length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                    {t('common.noResults')}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  )
}
