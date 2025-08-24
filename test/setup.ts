/**
 * 测试环境设置文件
 * 为测试环境提供浏览器API的polyfill
 */

import { afterEach } from 'vitest'

// 跟踪活动的动画帧回调
const activeFrameCallbacks = new Set<NodeJS.Timeout>()

// 定义 requestAnimationFrame 和 cancelAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  const id = setTimeout(() => {
    activeFrameCallbacks.delete(id)
    try {
      callback(performance.now())
    } catch (error: any) {
      // 在测试结束后忽略错误，避免未处理的拒绝
      if (!error?.message?.includes('document')) {
        console.warn('requestAnimationFrame callback error:', error)
      }
    }
  }, 16) // ~60fps
  
  activeFrameCallbacks.add(id)
  return id as unknown as number
}

global.cancelAnimationFrame = (id: number): void => {
  const timeoutId = id as unknown as NodeJS.Timeout
  clearTimeout(timeoutId)
  activeFrameCallbacks.delete(timeoutId)
}

// 清理所有活动的动画帧回调
global.clearAllAnimationFrames = () => {
  activeFrameCallbacks.forEach(id => {
    clearTimeout(id)
  })
  activeFrameCallbacks.clear()
}

// 添加 performance.now polyfill
if (typeof global.performance === 'undefined') {
  global.performance = {
    now: () => Date.now()
  } as Performance
}

// 确保DOM相关的全局变量存在
if (typeof global.document === 'undefined') {
  // happy-dom应该已经提供了document，但以防万一
  console.warn('document is not defined in test environment')
}

// 在测试完成后清理
afterEach(() => {
  // 清理所有活动的动画帧回调
  if (global.clearAllAnimationFrames) {
    global.clearAllAnimationFrames()
  }
})