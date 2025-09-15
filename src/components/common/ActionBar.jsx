import React, { useState } from 'react'
import { Plus, Import } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { NewItemDialog } from './NewItemDialog'

/**
 * 通用操作栏组件
 * 包含New和Import按钮，可根据不同的视图类型执行不同的操作
 */
export function ActionBar({ activeView, onNewClick, onImportClick }) {
  const { t } = useTranslation()
  const [showNewDialog, setShowNewDialog] = useState(false)

  const handleNewButtonClick = () => {
    setShowNewDialog(true)
  }

  const handleItemSelect = (itemType) => {
    onNewClick(itemType)
  }

  return (
    <>
      <div className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="flex items-center space-x-1 h-8"
            onClick={handleNewButtonClick}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{t('buttons.new')}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-1 h-8"
            onClick={onImportClick}
          >
            <Import className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{t('buttons.import')}</span>
          </Button>
        </div>
      </div>

      <NewItemDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onItemSelect={handleItemSelect}
      />
    </>
  )
}
