import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Save, Copy, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApiStore } from '@/store'
import { ResponseViewer } from './ResponseViewer'
import { QueryParamsTable } from '@/components/common/QueryParamsTable'
import { BreadcrumbWithActions } from '@/components/common/Breadcrumb'
import { cn, HTTP_METHOD_COLORS } from '@/lib/utils'

/**
 * 请求编辑器组件
 * 包含URL输入、参数配置、请求体编辑等功能
 */
export function RequestEditor({ tabId }) {
  const { t } = useTranslation()
  const { tabs, updateTab, addRequestHistory } = useApiStore()
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState(null)

  // 获取当前标签数据
  const tab = tabs.find(t => t.id === tabId)
  if (!tab) return null

  const { data: api } = tab

  // HTTP方法选项
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

  // 更新API数据
  const updateApi = (updates) => {
    updateTab(tabId, updates)
  }

  // 发送请求
  const sendRequest = async () => {
    setIsLoading(true)
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟响应数据
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '1234',
        },
        data: {
          message: 'Success',
          timestamp: new Date().toISOString(),
          data: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ]
        },
        time: Math.floor(Math.random() * 1000) + 100,
        size: '1.2 KB',
      }

      setResponse(mockResponse)
      
      // 添加到请求历史
      addRequestHistory({
        ...api,
        response: mockResponse,
      })
    } catch (error) {
      setResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: error.message,
        time: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 获取面包屑数据
  const getBreadcrumbData = () => {
    // 从API store中获取集合信息
    const { collections } = useApiStore.getState()
    let collection = null
    let folder = null

    // 查找当前API所属的集合
    for (const col of collections) {
      const foundApi = col.apis?.find(a => a.id === api.id)
      if (foundApi) {
        collection = col
        break
      }
    }

    return { collection, folder, requestName: api.name }
  }

  const { collection, folder, requestName } = getBreadcrumbData()

  return (
    <div className="flex flex-col h-full">

      {/* 面包屑导航 */}
      <BreadcrumbWithActions
        collection={collection}
        folder={folder}
        requestName={requestName}
        onSave={() => updateApi({ saved: true })}
        isSaving={false}
      />

      {/* URL输入区域 */}
      <div className="border-b bg-background p-3">
        <div className="flex items-center space-x-2">
          {/* HTTP方法选择 */}
          <select
            value={api.method}
            onChange={(e) => updateApi({ method: e.target.value })}
            className={cn(
              "px-2 py-1.5 rounded-md border text-xs font-medium min-w-16 h-8",
              HTTP_METHOD_COLORS[api.method]
            )}
          >
            {httpMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          {/* URL输入框 */}
          <Input
            value={api.url}
            onChange={(e) => updateApi({ url: e.target.value })}
            placeholder={t('request.urlPlaceholder')}
            className="flex-1 h-8 text-xs"
          />

          {/* 发送按钮 */}
          <Button
            onClick={sendRequest}
            disabled={isLoading || !api.url}
            className="min-w-16 h-8 text-xs"
            variant="default"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Send className="h-3.5 w-3.5" />
              </motion.div>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1" />
                {t('request.send')}
              </>
            )}
          </Button>

          {/* 更多操作 */}
          <Button variant="outline" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 配置区域和响应区域 - 上下布局 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 上半部分：请求配置 */}
        <div className="h-1/2 border-b">
          <RequestDetails api={api} onUpdate={updateApi} />
        </div>

        {/* 下半部分：响应内容 */}
        <div className="h-1/2">
          <ResponseViewer response={response} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

/**
 * 请求详情组件
 */
function RequestDetails({ api, onUpdate }) {
  const { t } = useTranslation()

  // 检查各个部分是否有修改
  const hasParamsModified = api.params && (Array.isArray(api.params) ? api.params.length > 0 : Object.keys(api.params).length > 0)
  const hasHeadersModified = api.headers && Object.keys(api.headers).length > 0
  const hasBodyModified = api.body && api.body.trim().length > 0

  return (
    <Tabs defaultValue="params" className="h-full flex flex-col">
      <TabsList variant="underline" className="w-full mx-2 mt-2">
        <TabsTrigger variant="underline" value="params" modified={hasParamsModified}>
          {t('request.params')}
        </TabsTrigger>
        <TabsTrigger variant="underline" value="headers" modified={hasHeadersModified}>
          {t('request.headers')}
        </TabsTrigger>
        <TabsTrigger variant="underline" value="body" modified={hasBodyModified}>
          {t('request.body')}
        </TabsTrigger>
        <TabsTrigger variant="underline" value="auth">
          {t('request.auth')}
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="params" className="h-full m-0">
          <QueryParamsTable
            params={api.params || []}
            onUpdate={(params) => onUpdate({ params })}
            showDescription={true}
          />
        </TabsContent>

        <TabsContent value="headers" className="h-full m-0">
          <HeadersEditor headers={api.headers || {}} onUpdate={(headers) => onUpdate({ headers })} />
        </TabsContent>

        <TabsContent value="body" className="h-full m-0">
          <BodyEditor body={api.body || ''} onUpdate={(body) => onUpdate({ body })} />
        </TabsContent>

        <TabsContent value="auth" className="h-full m-0">
          <div className="p-4 text-center text-muted-foreground text-xs">
            {t('request.authConfigDev')}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}



/**
 * 请求头编辑器
 */
function HeadersEditor({ headers, onUpdate }) {
  const headerEntries = Object.entries(headers)

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {headerEntries.map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <Input
              value={key}
              placeholder="请求头名称"
              className="flex-1"
              readOnly
            />
            <Input
              value={value}
              placeholder="请求头值"
              className="flex-1"
              readOnly
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

/**
 * 请求体编辑器
 */
function BodyEditor({ body, onUpdate }) {
  return (
    <div className="h-full p-4">
      <textarea
        value={body}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="请求体内容..."
        className="w-full h-full resize-none border rounded-md p-3 text-sm font-mono bg-background"
      />
    </div>
  )
}
