/**
 * 调试日志工具
 * 统一管理项目中的调试输出
 */
import { debugConfig } from '../configs/tableConfig.js'

/**
 * 调试日志输出控制器
 */
export class DebugLogger {
  constructor() {
    this.isDev = debugConfig.isDevelopment()
  }

  /**
   * 通用日志输出
   * @param {string} message - 日志消息
   * @param {any} data - 日志数据
   * @param {boolean} force - 是否强制输出
   */
  log(message, data = null, force = false) {
    if (!this.isDev || (!debugConfig.enableConsoleLog && !force)) return
    
    if (data !== null) {
      console.log(message, data)
    } else {
      console.log(message)
    }
  }

  /**
   * 滚动相关日志
   */
  scrollLog(message, data = null) {
    if (!this.isDev || !debugConfig.enableScrollLog) return
    console.log(`📜 ${message}`, data)
  }

  /**
   * 样式相关日志
   */
  styleLog(message, data = null) {
    if (!this.isDev || !debugConfig.enableStyleLog) return
    console.log(`🎨 ${message}`, data)
  }

  /**
   * 事件处理日志
   */
  handlerLog(message, data = null) {
    if (!this.isDev || !debugConfig.enableHandlerLog) return
    console.log(`🎯 ${message}`, data)
  }

  /**
   * 性能相关日志
   */
  performanceLog(message, data = null) {
    if (!this.isDev || !debugConfig.enablePerformanceLog) return
    console.log(`⚡ ${message}`, data)
  }

  /**
   * 状态相关日志
   */
  stateLog(message, data = null) {
    if (!this.isDev || !debugConfig.enableStateLog) return
    console.log(`🔄 ${message}`, data)
  }

  /**
   * 错误日志（总是输出）
   */
  error(message, data = null) {
    console.error(`❌ ${message}`, data)
  }

  /**
   * 警告日志（总是输出）
   */
  warn(message, data = null) {
    console.warn(`⚠️ ${message}`, data)
  }

  /**
   * 临时启用所有调试日志
   */
  enableAllLogs() {
    debugConfig.enableConsoleLog = true
    debugConfig.enableScrollLog = true
    debugConfig.enableStyleLog = true
    debugConfig.enableHandlerLog = true
    debugConfig.enablePerformanceLog = true
    debugConfig.enableStateLog = true
    console.log('🔧 所有调试日志已启用')
  }

  /**
   * 禁用所有调试日志
   */
  disableAllLogs() {
    debugConfig.enableConsoleLog = false
    debugConfig.enableScrollLog = false
    debugConfig.enableStyleLog = false
    debugConfig.enableHandlerLog = false
    debugConfig.enablePerformanceLog = false
    debugConfig.enableStateLog = false
    console.log('🔇 所有调试日志已禁用')
  }
}

// 导出单例实例
export const logger = new DebugLogger()

// 导出简化的函数接口
export const debugLog = (message, data, force) => logger.log(message, data, force)
export const scrollLog = (message, data) => logger.scrollLog(message, data)
export const styleLog = (message, data) => logger.styleLog(message, data)
export const handlerLog = (message, data) => logger.handlerLog(message, data)
export const performanceLog = (message, data) => logger.performanceLog(message, data)
export const stateLog = (message, data) => logger.stateLog(message, data)

// 全局调试控制函数
if (typeof window !== 'undefined') {
  window.enableTableDebug = () => logger.enableAllLogs()
  window.disableTableDebug = () => logger.disableAllLogs()
}

export default logger