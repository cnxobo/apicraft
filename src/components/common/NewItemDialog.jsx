import React, { useState } from 'react'
import { Globe, Folder, FileText, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

/**
 * 新建项目对话框组件
 * 显示不同创建选项的图标和描述
 */
export function NewItemDialog({ open, onOpenChange, onItemSelect }) {
  const { t } = useTranslation()
  const [hoveredItem, setHoveredItem] = useState(null)

  const creationOptions = [
    {
      id: 'http',
      icon: Globe,
      title: t('creation.http.title'),
      description: t('creation.http.description'),
      color: 'text-blue-500 bg-blue-50 hover:bg-blue-100',
      darkColor: 'dark:text-blue-400 dark:bg-blue-950 dark:hover:bg-blue-900'
    },
    {
      id: 'collection',
      icon: Folder,
      title: t('creation.collection.title'),
      description: t('creation.collection.description'),
      color: 'text-orange-500 bg-orange-50 hover:bg-orange-100',
      darkColor: 'dark:text-orange-400 dark:bg-orange-950 dark:hover:bg-orange-900'
    },
    {
      id: 'environment',
      icon: FileText,
      title: t('creation.environment.title'),
      description: t('creation.environment.description'),
      color: 'text-green-500 bg-green-50 hover:bg-green-100',
      darkColor: 'dark:text-green-400 dark:bg-green-950 dark:hover:bg-green-900'
    },
    {
      id: 'workspace',
      icon: Users,
      title: t('creation.workspace.title'),
      description: t('creation.workspace.description'),
      color: 'text-purple-500 bg-purple-50 hover:bg-purple-100',
      darkColor: 'dark:text-purple-400 dark:bg-purple-950 dark:hover:bg-purple-900'
    }
  ]

  const handleItemClick = (itemId) => {
    onItemSelect(itemId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('creation.title')}</DialogTitle>
          <DialogDescription>
            {t('creation.description')}
          </DialogDescription>
        </DialogHeader>

        {/* 创建选项网格 */}
        <div className="grid grid-cols-2 gap-3 py-4">
          {creationOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                onClick={() => handleItemClick(option.id)}
                onMouseEnter={() => setHoveredItem(option)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-lg border-2 border-transparent transition-all duration-200",
                  "hover:border-border hover:shadow-sm",
                  option.color,
                  option.darkColor
                )}
              >
                <Icon className="h-8 w-8 mb-3" />
                <span className="text-sm font-medium text-center">
                  {option.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* 底部描述区域 */}
        <div className="border-t pt-4 min-h-[3rem] flex items-center">
          {hoveredItem ? (
            <p className="text-sm text-muted-foreground">
              {hoveredItem.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('creation.description')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
