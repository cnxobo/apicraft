import React from 'react'
import { ChevronRight, Folder, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/**
 * 面包屑导航组件
 * 显示文件路径层级和当前请求名称
 */
export function Breadcrumb({ 
  collection, 
  folder, 
  requestName, 
  className,
  onCollectionClick,
  onFolderClick 
}) {
  const { t } = useTranslation()

  const breadcrumbItems = []

  // 添加集合
  if (collection) {
    breadcrumbItems.push({
      type: 'collection',
      name: collection.name,
      icon: Folder,
      onClick: onCollectionClick
    })
  }

  // 添加文件夹
  if (folder) {
    breadcrumbItems.push({
      type: 'folder',
      name: folder.name,
      icon: Folder,
      onClick: onFolderClick
    })
  }

  // 添加当前请求
  if (requestName) {
    breadcrumbItems.push({
      type: 'request',
      name: requestName,
      icon: FileText,
      onClick: null // 当前项不可点击
    })
  }

  if (breadcrumbItems.length === 0) {
    return null
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-xs text-muted-foreground", className)}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          )}
          
          <div
            className={cn(
              "flex items-center space-x-1 px-1.5 py-0.5 rounded-sm transition-colors",
              item.onClick && "hover:bg-muted/50 cursor-pointer",
              item.type === 'request' && "text-foreground font-medium"
            )}
            onClick={item.onClick}
          >
            <item.icon className="h-3 w-3" />
            <span className="truncate max-w-32">{item.name}</span>
          </div>
        </React.Fragment>
      ))}
    </nav>
  )
}

/**
 * 带保存按钮的面包屑导航组件
 */
export function BreadcrumbWithActions({ 
  collection, 
  folder, 
  requestName, 
  onSave,
  isSaving = false,
  className 
}) {
  const { t } = useTranslation()

  return (
    <div className={cn("flex items-center justify-between py-2 px-3 border-b bg-muted/10", className)}>
      <Breadcrumb 
        collection={collection}
        folder={folder}
        requestName={requestName}
      />
      
      <button
        onClick={onSave}
        disabled={isSaving}
        className={cn(
          "flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-md transition-colors",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isSaving ? (
          <>
            <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            <span>{t('common.saving')}</span>
          </>
        ) : (
          <span>{t('common.save')}</span>
        )}
      </button>
    </div>
  )
}
