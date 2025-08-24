import { watch, nextTick } from 'vue'

/**
 * 加载更多功能逻辑
 */
export function useLoadMore(
  props, 
  bodyRef, 
  leftBodyWrapperRef, 
  rightBodyWrapperRef, 
  scrollTop, 
  scrollLeft,
  filteredAndSortedData,
  measureAndSyncHeaderHeight,
  measureAndSyncRowHeights,
  isDevelopment,
  isLoadingMore,
  savedScrollPosition,
  savedDataLength,
  savedScrollHeight,
  lastScrollTop,
  intoRunScroll
) {
  
  // 监听 loadMoreLoading 变化 - VXE Table风格的完整状态管理
  watch(
    () => props.loadMoreLoading,
    (newLoading, oldLoading) => {
      if (newLoading && !oldLoading) {
        // 开始加载：如果位置还没有保存，才保存
        if (!isLoadingMore.value) {
          isLoadingMore.value = true
          // 重要修复：不要覆盖已经保存的正确位置
          if (savedScrollPosition.value <= 0) {
            savedScrollPosition.value = bodyRef.value?.scrollTop || 0
          }
        }
        lastScrollTop.value = savedScrollPosition.value
        
        if (isDevelopment.value) {
          console.log('🔧【Watch监听器】加载开始，位置保护:', {
            当前bodyScrollTop: bodyRef.value?.scrollTop || 0,
            保存的位置: savedScrollPosition.value,
            isLoadingMore: isLoadingMore.value,
            是否覆盖: savedScrollPosition.value <= 0 ? '是' : '否(保护已有位置)',
            预估保存行数: savedScrollPosition.value > 0 ? Math.floor(savedScrollPosition.value / 44) + 1 : 0
          })
        }
        
        // 保存触发加载时的数据长度，用于计算新增内容高度
        const beforeDataLength = filteredAndSortedData.value.length
        
        // 保存当前滚动容器的scrollHeight，用于计算新增内容高度
        const beforeScrollHeight = bodyRef.value?.scrollHeight || 0
        
        if (isDevelopment.value) {
          console.log('监听器 - 加载更多开始:', {
            已保存位置: savedScrollPosition.value,
            数据长度: beforeDataLength,
            scrollHeight: beforeScrollHeight,
            isLoadingMore: isLoadingMore.value
          })
        }
        
        // 将这些值保存到组件实例上，供加载完成后使用
        savedDataLength.value = beforeDataLength
        savedScrollHeight.value = beforeScrollHeight
      }
      
      // 加载完成后恢复滚动位置并清理状态
      if (oldLoading && !newLoading && isLoadingMore.value) {
        // 立即同步高度，让新数据渲染
        // 注意：不重新计算表头高度，保持初始高度一致性
        // measureAndSyncHeaderHeight(false) // 🔒 已禁用：保持表头高度一致性
        measureAndSyncRowHeights()
        
        // 使用 nextTick 确保 DOM 更新完成后立即恢复位置
        nextTick(() => {
          // iPhone设备检测和特殊处理
          const isIPhone = /iPhone/i.test(navigator.userAgent)
          
          // 记录当前各容器的位置
          const mainScrollTop = bodyRef.value?.scrollTop || 0
          const leftScrollTop = leftBodyWrapperRef.value?.scrollTop || 0
          const rightScrollTop = rightBodyWrapperRef.value?.scrollTop || 0
          
          if (isDevelopment.value) {
            console.log('【调试】加载更多完成后的自然位置:', {
              保存的位置: savedScrollPosition.value,
              主表格当前位置: mainScrollTop,
              左固定列当前位置: leftScrollTop,
              右固定列当前位置: rightScrollTop,
              主表格差异: mainScrollTop - savedScrollPosition.value,
              左固定列差异: leftScrollTop - savedScrollPosition.value
            })
          }
          
          // iPhone特殊处理：减少延迟次数，只保留最关键的时机
          if (isIPhone && bodyRef.value) {
            const targetPosition = savedScrollPosition.value
            
            if (isDevelopment.value) {
              console.log('【iPhone优化恢复】开始处理:', {
                保存位置: targetPosition,
                当前主表格位置: mainScrollTop,
                当前左固定列位置: leftScrollTop,
                当前scrollHeight: bodyRef.value.scrollHeight
              })
            }
            
            // 强制设置位置的函数
            const forcePosition = (position) => {
              if (bodyRef.value) {
                bodyRef.value.scrollTop = position
                scrollTop.value = position
              }
              if (leftBodyWrapperRef.value) {
                leftBodyWrapperRef.value.scrollTop = position
              }
              if (rightBodyWrapperRef.value) {
                rightBodyWrapperRef.value.scrollTop = position
              }
            }
            
            // 立即设置一次
            forcePosition(targetPosition)
            
            // 只在关键时机设置，减少抖动
            setTimeout(() => {
              forcePosition(targetPosition)
              if (isDevelopment.value) {
                console.log('【iPhone优化恢复】关键时机设置:', {
                  目标: targetPosition,
                  实际: bodyRef.value?.scrollTop || 0
                })
              }
            }, 0) // 只保留一次延迟设置
            
            if (isDevelopment.value) {
              console.log('【iPhone优化恢复】初始设置完成:', {
                目标位置: targetPosition,
                立即读取位置: bodyRef.value.scrollTop
              })
            }
          } else {
            // 非iPhone设备：使用原有逻辑
            const targetPosition = savedScrollPosition.value
            const leftColumnAccurate = Math.abs(leftScrollTop - targetPosition) <= 2
            const mainTableInaccurate = Math.abs(mainScrollTop - targetPosition) > 5
            
            if (leftColumnAccurate && mainTableInaccurate && bodyRef.value) {
              if (isDevelopment.value) {
                console.log('【PC端修正】主表格位置:', {
                  从: mainScrollTop,
                  到: targetPosition,
                  修正差距: Math.abs(mainScrollTop - targetPosition)
                })
              }
              
              // 使用全局边界约束来设置位置，确保不超出边界
              const getGlobalMaxScrollTop = () => {
                if (!bodyRef.value) return 0
                
                const mainMaxScrollTop = bodyRef.value.scrollHeight - bodyRef.value.clientHeight
                let globalMaxScrollTop = mainMaxScrollTop
                
                if (leftBodyWrapperRef.value) {
                  const leftMaxScrollTop = leftBodyWrapperRef.value.scrollHeight - leftBodyWrapperRef.value.clientHeight
                  globalMaxScrollTop = Math.min(globalMaxScrollTop, leftMaxScrollTop)
                }
                
                if (rightBodyWrapperRef.value) {
                  const rightMaxScrollTop = rightBodyWrapperRef.value.scrollHeight - rightBodyWrapperRef.value.clientHeight
                  globalMaxScrollTop = Math.min(globalMaxScrollTop, rightMaxScrollTop)
                }
                
                return Math.max(0, globalMaxScrollTop)
              }
              
              const globalMaxScrollTop = getGlobalMaxScrollTop()
              const safeTargetPosition = Math.max(0, Math.min(globalMaxScrollTop, targetPosition))
              
              // 强制设置主表格滚动位置为安全的目标位置
              bodyRef.value.scrollTop = safeTargetPosition
              scrollTop.value = safeTargetPosition
              
              // 立即同步到所有滚动容器，确保一致性
              if (leftBodyWrapperRef.value) {
                leftBodyWrapperRef.value.scrollTop = safeTargetPosition
              }
              if (rightBodyWrapperRef.value) {
                rightBodyWrapperRef.value.scrollTop = safeTargetPosition
              }
              
              // 立即验证修正结果
              const newMainScrollTop = bodyRef.value?.scrollTop || 0
              if (isDevelopment.value) {
                console.log('【PC端修正】位置修正结果:', {
                  原始目标位置: targetPosition,
                  安全目标位置: safeTargetPosition,
                  修正后主表格位置: newMainScrollTop,
                  是否成功: Math.abs(newMainScrollTop - safeTargetPosition) <= 2
                })
              }
            }
          }
          
          // 清理状态
          isLoadingMore.value = false
          intoRunScroll.value = false
          savedDataLength.value = 0
          savedScrollHeight.value = 0
        })
      }
    },
    { immediate: false }
  )
}