import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Save, Copy, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApiStore } from '@/store'
import { ResponseViewer } from './ResponseViewer'
import { cn, HTTP_METHOD_COLORS } from '@/lib/utils'

/**
 * 请求编辑器组件
 * 包含URL输入、参数配置、请求体编辑等功能
 */
export function RequestEditor({ tabId }) {
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

  return (
    <div className="flex flex-col h-full">
      {/* 请求配置区域 */}
      <div className="border-b bg-background p-4 space-y-4">
        {/* URL输入行 */}
        <div className="flex items-center space-x-2">
          {/* HTTP方法选择 */}
          <select
            value={api.method}
            onChange={(e) => updateApi({ method: e.target.value })}
            className={cn(
              "px-3 py-2 rounded-md border text-sm font-medium min-w-20",
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
            placeholder="输入请求URL..."
            className="flex-1"
          />

          {/* 发送按钮 */}
          <Button
            onClick={sendRequest}
            disabled={isLoading || !api.url}
            className="min-w-20"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Send className="h-4 w-4" />
              </motion.div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                发送
              </>
            )}
          </Button>

          {/* 更多操作 */}
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* 快捷操作按钮 */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Save className="h-3 w-3 mr-1" />
            保存
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-3 w-3 mr-1" />
            复制
          </Button>
        </div>
      </div>

      {/* 请求详情和响应区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：请求详情 */}
        <div className="w-1/2 border-r">
          <RequestDetails api={api} onUpdate={updateApi} />
        </div>

        {/* 右侧：响应内容 */}
        <div className="w-1/2">
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
  return (
    <Tabs defaultValue="params" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-4 m-2">
        <TabsTrigger value="params">参数</TabsTrigger>
        <TabsTrigger value="headers">请求头</TabsTrigger>
        <TabsTrigger value="body">请求体</TabsTrigger>
        <TabsTrigger value="auth">认证</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="params" className="h-full m-0">
          <ParamsEditor params={api.params || {}} onUpdate={(params) => onUpdate({ params })} />
        </TabsContent>

        <TabsContent value="headers" className="h-full m-0">
          <HeadersEditor headers={api.headers || {}} onUpdate={(headers) => onUpdate({ headers })} />
        </TabsContent>

        <TabsContent value="body" className="h-full m-0">
          <BodyEditor body={api.body || ''} onUpdate={(body) => onUpdate({ body })} />
        </TabsContent>

        <TabsContent value="auth" className="h-full m-0">
          <div className="p-4 text-center text-muted-foreground">
            认证配置功能开发中...
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}

/**
 * 参数编辑器
 */
function ParamsEditor({ params, onUpdate }) {
  const paramEntries = Object.entries(params)

  const updateParam = (key, value) => {
    onUpdate({ ...params, [key]: value })
  }

  const removeParam = (key) => {
    const newParams = { ...params }
    delete newParams[key]
    onUpdate(newParams)
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {paramEntries.map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <Input
              value={key}
              placeholder="参数名"
              className="flex-1"
              readOnly
            />
            <Input
              value={value}
              onChange={(e) => updateParam(key, e.target.value)}
              placeholder="参数值"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeParam(key)}
            >
              删除
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full">
          添加参数
        </Button>
      </div>
    </ScrollArea>
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
