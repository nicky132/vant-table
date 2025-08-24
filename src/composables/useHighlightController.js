/**
 * 单行高亮控制组合函数
 * 确保除复选框外只能有一行高亮
 */
export function useHighlightController(isDevelopment) {
  // 创建单行高亮控制器
  const createSingleHighlightController = () => {
    let isCheckboxOperation = false // 标记是否为复选框操作
    let currentHighlightedRow = -1 // 当前高亮的行索引
    
    // 标记复选框操作开始
    const markCheckboxOperation = () => {
      isCheckboxOperation = true
      setTimeout(() => {
        isCheckboxOperation = false
      }, 100) // 100ms后清除标记
    }
    
    // 强制执行单行高亮规则
    const enforceSingleRowHighlight = (targetRowIndex = null) => {
      if (isCheckboxOperation) {
        // 如果是复选框操作，不干预
        return
      }
      
      // 立即检查并清理多余的高亮
      const selectedElements = document.querySelectorAll('.vant-tr--selected')
      
      if (targetRowIndex !== null) {
        // 如果指定了目标行，清除所有其他行的高亮
        selectedElements.forEach(el => {
          const rowIndex = parseInt(el.getAttribute('data-row-index'))
          if (rowIndex !== targetRowIndex) {
            el.classList.remove('vant-tr--selected')
            el.offsetHeight
          }
        })
        currentHighlightedRow = targetRowIndex
      } else {
        // 如果没有指定目标行，检查是否有多行高亮
        const uniqueRows = new Set()
        selectedElements.forEach(el => {
          const rowIndex = el.getAttribute('data-row-index')
          uniqueRows.add(rowIndex)
        })
        
        if (uniqueRows.size > 1) {
          // 如果有多行高亮，只保留最后一行
          const lastRowIndex = Math.max(...Array.from(uniqueRows).map(Number))
          selectedElements.forEach(el => {
            const rowIndex = parseInt(el.getAttribute('data-row-index'))
            if (rowIndex !== lastRowIndex) {
              el.classList.remove('vant-tr--selected')
              el.offsetHeight
            }
          })
          currentHighlightedRow = lastRowIndex
        }
      }
    }
    
    return {
      markCheckboxOperation,
      enforceSingleRowHighlight,
      getCurrentHighlightedRow: () => currentHighlightedRow
    }
  }

  // 实时监控高亮状态变化的调试函数
  const monitorHighlightState = (singleHighlightController) => {
    // 创建一个 MutationObserver 来监控 DOM 变化
    if (typeof window !== 'undefined' && window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target
            if (target.classList.contains('vant-tr--selected')) {
              const rowIndex = target.getAttribute('data-row-index')
              
              // 立即强制执行单行高亮规则
              setTimeout(() => {
                singleHighlightController.enforceSingleRowHighlight()
              }, 0)
              
              if (isDevelopment.value) {
                console.log(`🟡 高亮添加监控: 第${rowIndex}行被高亮`, target)
                
                // 检查是否有多个高亮行
                const allSelected = document.querySelectorAll('.vant-tr--selected')
                if (allSelected.length > 3) {
                  console.error(`🔴 发现异常: ${allSelected.length}个高亮元素，执行强制清理！`)
                  singleHighlightController.enforceSingleRowHighlight()
                }
              }
            }
          }
        })
      })
      
      // 监控整个表格容器
      const tableWrapper = document.querySelector('.vant-table-wrapper')
      if (tableWrapper) {
        observer.observe(tableWrapper, {
          attributes: true,
          attributeFilter: ['class'],
          subtree: true
        })
      }
      
      return observer
    }
    
    return null
  }

  return {
    createSingleHighlightController,
    monitorHighlightState
  }
}