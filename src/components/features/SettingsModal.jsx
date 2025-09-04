import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Palette,
  Keyboard,
  Database,
  Puzzle,
  Shield,
  Globe,
  Info,
  ChevronRight
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/**
 * 设置模态框组件
 * 包含多个设置分类和选项
 */
export function SettingsModal({ open, onOpenChange }) {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('general')

  // 设置分类列表
  const settingSections = [
    {
      id: 'general',
      icon: Settings,
      label: t('settings.general')
    },
    {
      id: 'themes',
      icon: Palette,
      label: t('settings.themes')
    },
    {
      id: 'shortcuts',
      icon: Keyboard,
      label: t('settings.shortcuts')
    },
    {
      id: 'data',
      icon: Database,
      label: t('settings.data')
    },
    {
      id: 'addons',
      icon: Puzzle,
      label: t('settings.addons')
    },
    {
      id: 'certificates',
      icon: Shield,
      label: t('settings.certificates')
    },
    {
      id: 'proxy',
      icon: Globe,
      label: t('settings.proxy')
    },
    {
      id: 'update',
      icon: ChevronRight,
      label: t('settings.update')
    },
    {
      id: 'about',
      icon: Info,
      label: t('settings.about')
    }
  ]

  const activeConfig = settingSections.find(s => s.id === activeSection)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <div className="flex h-full">
          {/* 左侧导航 */}
          <div className="w-64 border-r bg-muted/30">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-base">{t('settings.title')}</h2>
            </div>
            <ScrollArea className="h-full">
              <div className="p-2">
                {settingSections.map((section) => {
                  const Icon = section.icon
                  const isActive = section.id === activeSection
                  
                  return (
                    <Button
                      key={section.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start mb-1 h-10 transition-all duration-200",
                        isActive && "bg-selection text-selection-foreground shadow-sm border-l-2 border-l-primary/20"
                      )}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <span className="text-sm">{section.label}</span>
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b">
              <h1 className="text-xl font-semibold">{activeConfig?.label}</h1>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-6">
                <SettingsContent section={activeSection} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * 设置内容组件
 */
function SettingsContent({ section }) {
  switch (section) {
    case 'general':
      return <GeneralSettings />
    case 'themes':
      return <ThemeSettings />
    case 'shortcuts':
      return <ShortcutSettings />
    case 'proxy':
      return <ProxySettings />
    default:
      return (
        <div className="text-center text-muted-foreground py-8">
          <div className="text-4xl mb-4">🚧</div>
          <p className="text-xs">{t('settings.underDevelopment')}</p>
        </div>
      )
  }
}

/**
 * 通用设置
 */
function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Request</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">HTTP version</label>
              <p className="text-xs text-muted-foreground">Select the HTTP version to use for sending the request.</p>
            </div>
            <Select defaultValue="http1.1">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http1.1">HTTP/1.1</SelectItem>
                <SelectItem value="http2">HTTP/2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Request timeout</label>
              <p className="text-xs text-muted-foreground">Set how long a request should wait for a response before timing out.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Input type="number" defaultValue="0" className="w-20" />
              <span className="text-sm text-muted-foreground">ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 主题设置
 */
function ThemeSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Appearance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Theme</label>
              <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
            </div>
            <Select defaultValue="system">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 快捷键设置
 */
function ShortcutSettings() {
  const shortcuts = [
    { action: 'Open New Tab', keys: ['⌘', 'T'] },
    { action: 'Close Tab', keys: ['⌘', 'W'] },
    { action: 'Send Request', keys: ['⌘', 'Enter'] },
    { action: 'Search', keys: ['⌘', 'F'] },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm">{shortcut.action}</span>
              <div className="flex items-center space-x-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd key={keyIndex} className="px-2 py-1 text-xs bg-muted rounded border">
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 代理设置
 */
function ProxySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Proxy Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Use system proxy</label>
              <p className="text-xs text-muted-foreground">Use the system's proxy configuration</p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
