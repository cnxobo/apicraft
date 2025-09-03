import { useState, useCallback, useEffect, useRef } from 'react'
import { throttle } from '@/lib/utils'

/**
 * 拖拽调整大小的Hook
 * @param {number} initialWidth - 初始宽度
 * @param {number} minWidth - 最小宽度
 * @param {number} maxWidth - 最大宽度
 * @param {function} onResize - 调整大小回调
 */
export function useResize(initialWidth = 300, minWidth = 200, maxWidth = 600, onResize) {
  const [width, setWidth] = useState(initialWidth)
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(initialWidth)

  // 节流的调整大小处理函数
  const throttledResize = useCallback(
    throttle((newWidth) => {
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(clampedWidth)
      onResize?.(clampedWidth)
    }, 16), // 60fps
    [minWidth, maxWidth, onResize]
  )

  // 开始拖拽
  const startResize = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
    
    // 添加全局事件监听器
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [width])

  // 处理鼠标移动
  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return
    
    const deltaX = e.clientX - startXRef.current
    const newWidth = startWidthRef.current + deltaX
    throttledResize(newWidth)
  }, [isResizing, throttledResize])

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [handleMouseMove])

  // 清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [handleMouseMove, handleMouseUp])

  return {
    width,
    isResizing,
    startResize,
    setWidth: (newWidth) => {
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(clampedWidth)
      onResize?.(clampedWidth)
    },
  }
}

/**
 * 垂直拖拽调整大小的Hook
 * @param {number} initialHeight - 初始高度
 * @param {number} minHeight - 最小高度
 * @param {number} maxHeight - 最大高度
 * @param {function} onResize - 调整大小回调
 */
export function useVerticalResize(initialHeight = 300, minHeight = 100, maxHeight = 600, onResize) {
  const [height, setHeight] = useState(initialHeight)
  const [isResizing, setIsResizing] = useState(false)
  const startYRef = useRef(0)
  const startHeightRef = useRef(initialHeight)

  // 节流的调整大小处理函数
  const throttledResize = useCallback(
    throttle((newHeight) => {
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))
      setHeight(clampedHeight)
      onResize?.(clampedHeight)
    }, 16), // 60fps
    [minHeight, maxHeight, onResize]
  )

  // 开始拖拽
  const startResize = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
    startYRef.current = e.clientY
    startHeightRef.current = height
    
    // 添加全局事件监听器
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [height])

  // 处理鼠标移动
  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return
    
    const deltaY = e.clientY - startYRef.current
    const newHeight = startHeightRef.current + deltaY
    throttledResize(newHeight)
  }, [isResizing, throttledResize])

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [handleMouseMove])

  // 清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [handleMouseMove, handleMouseUp])

  return {
    height,
    isResizing,
    startResize,
    setHeight: (newHeight) => {
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))
      setHeight(clampedHeight)
      onResize?.(clampedHeight)
    },
  }
}
