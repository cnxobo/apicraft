import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, Eye, Code, Clock, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatJSON, copyToClipboard } from '@/lib/utils'

/**
 * 响应查看器组件
 * 显示API响应结果，支持多种格式化显示
 */
export function ResponseViewer({ response, isLoading }) {
  const [activeView, setActiveView] = useState('pretty')

  // 复制响应内容
  const handleCopy = async () => {
    if (!response?.data) return
    
    const content = typeof response.data === 'string' 
      ? response.data 
      : formatJSON(response.data)
    
    const success = await copyToClipboard(content)
    if (success) {
      // 这里可以添加成功提示
      console.log('复制成功')
    }
  }

  // 下载响应内容
  const handleDownload = () => {
    if (!response?.data) return
    
    const content = typeof response.data === 'string' 
      ? response.data 
      : formatJSON(response.data)
    
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `response-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-12 border-b flex items-center justify-between px-4">
          <h3 className="font-medium">响应</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
          <span className="ml-3 text-muted-foreground">正在发送请求...</span>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-12 border-b flex items-center justify-between px-4">
          <h3 className="font-medium">响应</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-2">📡</div>
            <p>发送请求查看响应结果</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 响应头部信息 */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">响应</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-3 w-3 mr-1" />
              复制
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-3 w-3 mr-1" />
              下载
            </Button>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-muted-foreground">状态:</span>
            <span className={`font-medium ${
              response.status >= 200 && response.status < 300 
                ? 'text-green-600' 
                : response.status >= 400 
                ? 'text-red-600' 
                : 'text-orange-600'
            }`}>
              {response.status} {response.statusText}
            </span>
          </div>
          
          {response.time && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{response.time}ms</span>
            </div>
          )}
          
          {response.size && (
            <div className="flex items-center space-x-1">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span>{response.size}</span>
            </div>
          )}
        </div>
      </div>

      {/* 响应内容 */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeView} onValueChange={setActiveView} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-2">
            <TabsTrigger value="pretty" className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>格式化</span>
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center space-x-1">
              <Code className="h-3 w-3" />
              <span>原始</span>
            </TabsTrigger>
            <TabsTrigger value="headers">响应头</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="pretty" className="h-full m-0">
              <PrettyView data={response.data} />
            </TabsContent>

            <TabsContent value="raw" className="h-full m-0">
              <RawView data={response.data} />
            </TabsContent>

            <TabsContent value="headers" className="h-full m-0">
              <HeadersView headers={response.headers} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

/**
 * 格式化视图
 */
function PrettyView({ data }) {
  const formattedData = typeof data === 'string' ? data : formatJSON(data)

  return (
    <ScrollArea className="h-full">
      <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
        {formattedData}
      </pre>
    </ScrollArea>
  )
}

/**
 * 原始视图
 */
function RawView({ data }) {
  const rawData = typeof data === 'string' ? data : JSON.stringify(data)

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <textarea
          value={rawData}
          readOnly
          className="w-full h-96 resize-none border-none outline-none text-sm font-mono bg-transparent"
        />
      </div>
    </ScrollArea>
  )
}

/**
 * 响应头视图
 */
function HeadersView({ headers }) {
  if (!headers) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        无响应头信息
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} className="flex items-start space-x-2 py-1">
            <span className="font-medium text-sm min-w-32">{key}:</span>
            <span className="text-sm text-muted-foreground flex-1">{value}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
