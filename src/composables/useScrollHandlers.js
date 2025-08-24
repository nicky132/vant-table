import { ref, nextTick } from 'vue'

/**
 * 表格滚动处理逻辑
 */
export function useScrollHandlers(props, emit, bodyRef, leftBodyWrapperRef, rightBodyWrapperRef, headerContentRef, scrollTop, scrollLeft, isDevelopment, layoutWrapperRef, updateShadowState, updateShadowScrollPosition) {
  // 滚动相关状态
  const isLoadingMore = ref(false)
  const savedScrollPosition = ref(0)
  const savedDataLength = ref(0)
  const savedScrollHeight = ref(0)
  const intoRunScroll = ref(false)
  const lastScrollTop = ref(0)
  
  // 🔑 新增：hover状态跟踪，用于优化滚动体验
  const hoveredArea = ref(null) // 'main', 'left', 'right', null
  const isHovering = ref(false)
  
  // 🔑 新增：VXE-table风格的同步锁，防止无限循环
  const isSyncing = ref(false)
  
  // 🔑 添加全局测试函数，用于验证hover滚动同步
  if (typeof window !== 'undefined') {
    window.testHoverScrollSync = () => {
      console.log('🧪 测试hover滚动同步功能')
      console.log('当前hover状态:', {
        hoveredArea: hoveredArea.value,
        isHovering: isHovering.value
      })
      
      console.log('🔍 所有ref状态:', {
        bodyRef: !!bodyRef?.value,
        leftBodyWrapperRef: !!leftBodyWrapperRef?.value,
        rightBodyWrapperRef: !!rightBodyWrapperRef?.value,
        headerContentRef: !!headerContentRef?.value
      })
      
      if (bodyRef?.value) {
        console.log('主表格滚动位置:', {
          scrollTop: bodyRef.value.scrollTop,
          scrollLeft: bodyRef.value.scrollLeft
        })
      } else {
        console.warn('⚠️ bodyRef不存在或为null')
      }
      
      if (leftBodyWrapperRef?.value) {
        console.log('左固定列滚动位置:', {
          scrollTop: leftBodyWrapperRef.value.scrollTop
        })
      } else {
        console.warn('⚠️ leftBodyWrapperRef不存在或为null')
      }
      
      if (rightBodyWrapperRef?.value) {
        console.log('右固定列滚动位置:', {
          scrollTop: rightBodyWrapperRef.value.scrollTop
        })
      } else {
        console.warn('⚠️ rightBodyWrapperRef不存在或为null')
      }
    }
    
    // 🔑 添加ref状态检查函数
    window.checkScrollHandlerRefs = () => {
      console.log('🔍 检查useScrollHandlers中的ref状态:', {
        bodyRef: {
          exists: !!bodyRef,
          value: !!bodyRef?.value,
          type: typeof bodyRef,
          isRef: bodyRef && bodyRef.__v_isRef
        },
        leftBodyWrapperRef: {
          exists: !!leftBodyWrapperRef,
          value: !!leftBodyWrapperRef?.value,
          type: typeof leftBodyWrapperRef,
          isRef: leftBodyWrapperRef && leftBodyWrapperRef.__v_isRef
        },
        rightBodyWrapperRef: {
          exists: !!rightBodyWrapperRef,
          value: !!rightBodyWrapperRef?.value,
          type: typeof rightBodyWrapperRef,
          isRef: rightBodyWrapperRef && rightBodyWrapperRef.__v_isRef
        },
        headerContentRef: {
          exists: !!headerContentRef,
          value: !!headerContentRef?.value,
          type: typeof headerContentRef,
          isRef: headerContentRef && headerContentRef.__v_isRef
        }
      })
    }
    
    // 🔑 添加强制同步测试函数
    window.testForcedSync = (scrollTop = 100) => {
      console.log(`🧪 强制同步测试 - scrollTop: ${scrollTop}`)
      vxeStyleAbsoluteSync(scrollTop, 0, null)
    }
    
    // 🔑 添加主表格DOM查询测试函数
    window.testMainTableDOMQuery = () => {
      console.log('🧪 测试主表格DOM查询')
      const mainBodyElements = document.querySelectorAll('.vant-table-body')
      console.log('🔍 找到的.vant-table-body元素:', mainBodyElements.length)
      
      mainBodyElements.forEach((element, index) => {
        const isInFixed = !!element.closest('.vant-table-fixed')
        console.log(`元素${index + 1}:`, {
          element,
          className: element.className,
          isInFixed,
          scrollTop: element.scrollTop,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          canScroll: element.scrollHeight > element.clientHeight
        })
      })
      
      // 找到主表格
      let mainTableElement = null
      for (let element of mainBodyElements) {
        if (!element.closest('.vant-table-fixed')) {
          mainTableElement = element
          break
        }
      }
      
      if (mainTableElement) {
        console.log('✅ 成功找到主表格元素:', {
          element: mainTableElement,
          scrollTop: mainTableElement.scrollTop,
          可以设置scrollTop: true
        })
        
        // 测试设置scrollTop
        const originalScrollTop = mainTableElement.scrollTop
        mainTableElement.scrollTop = 50
        setTimeout(() => {
          console.log('📊 设置scrollTop测试结果:', {
            原始scrollTop: originalScrollTop,
            设置的scrollTop: 50,
            当前scrollTop: mainTableElement.scrollTop,
            设置成功: mainTableElement.scrollTop === 50
          })
          // 恢复原位置
          mainTableElement.scrollTop = originalScrollTop
        }, 100)
      } else {
        console.warn('⚠️ 未找到主表格元素')
      }
    }
  }

  // VXE-table风格的绝对同步机制
  const vxeStyleAbsoluteSync = (targetScrollTop, targetScrollLeft, skipSource = null) => {
    console.log('🚀 vxeStyleAbsoluteSync 被调用了！', {
      targetScrollTop,
      targetScrollLeft,
      skipSource,
      intoRunScroll: intoRunScroll.value,
      isSyncing: isSyncing.value,
      refsStatus: {
        bodyRef: !!bodyRef?.value,
        leftBodyWrapperRef: !!leftBodyWrapperRef?.value,
        rightBodyWrapperRef: !!rightBodyWrapperRef?.value,
        headerContentRef: !!headerContentRef?.value
      }
    })
    
    // 🔑 VXE-table风格的同步锁，防止无限递归
    if (isSyncing.value) {
      console.log('⏭️ 跳过同步 - 正在同步中，防止无限循环')
      return
    }
    
    // 只在程序化滚动期间跳过同步，加载更多期间必须保持同步以确保表格一体性
    if (intoRunScroll.value) {
      if (isDevelopment.value) {
        console.log('⏭️ 跳过 VXE 同步 - 程序化滚动中', {
          intoRunScroll: intoRunScroll.value
        })
      }
      return
    }
    
    // 🔑 设置同步锁
    isSyncing.value = true
    
    // 加载更多期间也需要同步，确保表格视觉一致性
    if (isLoadingMore.value && isDevelopment.value) {
      console.log('VXE 同步 - 加载更多期间保持表格同步', {
        isLoadingMore: isLoadingMore.value,
        targetScrollTop,
        targetScrollLeft
      })
    }
    
    // 使用全局边界约束，确保所有容器都遵循相同的边界逻辑
    const getGlobalMaxScrollTop = () => {
      if (!bodyRef.value) return 0
      
      const mainScrollHeight = bodyRef.value.scrollHeight
      const mainClientHeight = bodyRef.value.clientHeight
      const mainMaxScrollTop = Math.max(0, mainScrollHeight - mainClientHeight)
      
      let globalMaxScrollTop = mainMaxScrollTop
      
      if (leftBodyWrapperRef.value) {
        const leftScrollHeight = leftBodyWrapperRef.value.scrollHeight
        const leftClientHeight = leftBodyWrapperRef.value.clientHeight
        const leftMaxScrollTop = Math.max(0, leftScrollHeight - leftClientHeight)
        globalMaxScrollTop = Math.min(globalMaxScrollTop, leftMaxScrollTop)
      }
      
      if (rightBodyWrapperRef.value) {
        const rightScrollHeight = rightBodyWrapperRef.value.scrollHeight
        const rightClientHeight = rightBodyWrapperRef.value.clientHeight
        const rightMaxScrollTop = Math.max(0, rightScrollHeight - rightClientHeight)
        globalMaxScrollTop = Math.min(globalMaxScrollTop, rightMaxScrollTop)
      }
      
      return globalMaxScrollTop
    }
    
    const globalMaxScrollTop = getGlobalMaxScrollTop()
    
    // 🔑 修复：从props中正确获取滚动边界值
    const totalWidth = props.columnsInfo?.totalWidth || props.columnsInfo?.value?.totalWidth || 0
    const containerWidth = props.containerWidth?.value || props.containerWidth || 0
    const maxScrollLeft = Math.max(0, totalWidth - containerWidth)
    
    console.log('🔍 滚动边界计算调试:', {
      totalWidth,
      containerWidth,
      maxScrollLeft,
      targetScrollLeft,
      globalMaxScrollTop,
      propsKeys: Object.keys(props || {}),
      columnsInfo: props.columnsInfo,
      propsType: typeof props,
      isReactiveProps: !!props.columnsInfo?.value
    })
    
    const constrainedScrollTop = Math.max(0, Math.min(globalMaxScrollTop, targetScrollTop || 0))
    const constrainedScrollLeft = Math.max(0, Math.min(maxScrollLeft, targetScrollLeft || 0))
    
    if (isDevelopment.value) {
      console.log('VXE风格绝对同步:', { 
        原始ScrollTop: targetScrollTop, 
        约束后ScrollTop: constrainedScrollTop,
        原始ScrollLeft: targetScrollLeft,
        约束后ScrollLeft: constrainedScrollLeft
      })
    }
    
    // 立即同步，避免 requestAnimationFrame 带来的延迟
    // 🔑 VXE-table风格：通过同步锁控制，同步所有容器
    console.log('🔍 同步控制调试:', {
      skipSource,
      目标scrollTop: constrainedScrollTop,
      目标scrollLeft: constrainedScrollLeft,
      同步锁状态: isSyncing.value
    })
    
    // 同步主表格 - 🔑 关键修复：添加DOM查询fallback
    let mainTableElement = bodyRef?.value
    
    // 如果bodyRef.value为null，尝试通过DOM查询获取主表格元素
    if (!mainTableElement) {
      const mainBodyElements = document.querySelectorAll('.vant-table-body')
      if (mainBodyElements.length > 0) {
        // 找到主表格（不是固定列的）
        for (let element of mainBodyElements) {
          if (!element.closest('.vant-table-fixed')) {
            mainTableElement = element
            // 🔑 新增：将DOM查询结果保存到bodyRef中，避免后续重复查询
            if (bodyRef && !bodyRef.value) {
              bodyRef.value = element
              console.log('✅ 通过DOM查询获取主表格元素并更新bodyRef')
            }
            break
          }
        }
        if (mainTableElement && !bodyRef?.value) {
          console.log('✅ 通过DOM查询获取主表格元素成功')
        }
      }
    }
    
    if (mainTableElement) {
      const oldScrollTop = mainTableElement.scrollTop
      const oldScrollLeft = mainTableElement.scrollLeft
      mainTableElement.scrollTop = constrainedScrollTop
      mainTableElement.scrollLeft = constrainedScrollLeft
      console.log('✅ 同步主表格成功:', {
        oldScrollTop,
        newScrollTop: constrainedScrollTop,
        实际ScrollTop: mainTableElement.scrollTop,
        oldScrollLeft, 
        newScrollLeft: constrainedScrollLeft,
        实际ScrollLeft: mainTableElement.scrollLeft,
        同步成功: mainTableElement.scrollTop === constrainedScrollTop,
        使用的方法: bodyRef?.value ? 'bodyRef.value' : 'DOM查询'
      })
    } else {
      console.log('❌ 跳过主表格同步 (bodyRef和DOM查询都失败)', {
        bodyRefExists: !!bodyRef,
        bodyRefValue: !!bodyRef?.value,
        bodyRefType: typeof bodyRef,
        DOMQueryResult: document.querySelectorAll('.vant-table-body').length
      })
    }
    
    // 同步表头水平滚动
    if (headerContentRef?.value) {
      headerContentRef.value.scrollLeft = constrainedScrollLeft
      console.log('✅ 表头滚动同步成功:', {
        constrainedScrollLeft,
        headerContentRefExists: !!headerContentRef.value,
        headerScrollLeft: headerContentRef.value.scrollLeft,
        headerElement: headerContentRef.value,
        headerClassName: headerContentRef.value.className
      })
    } else {
      console.warn('⚠️ 表头滚动同步失败 - headerContentRef不存在', {
        headerContentRef: headerContentRef,
        headerContentRefType: typeof headerContentRef,
        headerContentRefValue: headerContentRef.value,
        headerContentRefValueType: typeof headerContentRef.value
      })
      
      // 🔧 临时修复：如果headerContentRef不存在，尝试直接查找DOM元素
      const headerElement = document.querySelector('.vant-table-header__content')
      if (headerElement) {
        // 🧪 临时测试：直接使用targetScrollLeft看看能否滚动
        const testScrollLeft = targetScrollLeft || 0
        
        // 强制设置overflow以确保可以滚动
        const originalOverflow = headerElement.style.overflowX
        headerElement.style.overflowX = 'auto'
        
        // 设置scrollLeft
        headerElement.scrollLeft = testScrollLeft
        
        // 立即检查是否生效
        const actualScrollLeft = headerElement.scrollLeft
        
        console.log('🔄 通过querySelector同步表头(使用原始scrollLeft):', {
          targetScrollLeft: testScrollLeft,
          constrainedScrollLeft,
          headerElement,
          原始overflow: originalOverflow,
          设置后的scrollLeft: actualScrollLeft,
          headerScrollWidth: headerElement.scrollWidth,
          headerClientWidth: headerElement.clientWidth,
          canScroll: headerElement.scrollWidth > headerElement.clientWidth,
          scrollLeftWorked: actualScrollLeft === testScrollLeft
        })
        
        // 恢复原始overflow设置（如果有的话）
        if (originalOverflow) {
          headerElement.style.overflowX = originalOverflow
        }
      } else {
        console.warn('⚠️ 连通过querySelector也找不到表头元素')
      }
    }
    
    // 同步左固定列 - 🔑 添加DOM查询fallback
    let leftFixedElement = leftBodyWrapperRef?.value
    
    // 如果leftBodyWrapperRef.value为null，尝试通过DOM查询获取
    if (!leftFixedElement) {
      const leftFixedElements = document.querySelectorAll('.vant-table-fixed--left .vant-table-fixed__body')
      if (leftFixedElements.length > 0) {
        leftFixedElement = leftFixedElements[0]
        // 🔑 新增：将DOM查询结果保存到leftBodyWrapperRef中
        if (leftBodyWrapperRef && !leftBodyWrapperRef.value) {
          leftBodyWrapperRef.value = leftFixedElement
          console.log('✅ 通过DOM查询获取左固定列元素并更新leftBodyWrapperRef')
        }
      }
    }
    
    if (leftFixedElement) {
      const oldScrollTop = leftFixedElement.scrollTop
      leftFixedElement.scrollTop = constrainedScrollTop
      console.log('✅ 同步左固定列成功:', {
        oldScrollTop,
        newScrollTop: constrainedScrollTop,
        实际ScrollTop: leftFixedElement.scrollTop,
        同步成功: leftFixedElement.scrollTop === constrainedScrollTop,
        使用的方法: leftBodyWrapperRef?.value ? 'leftBodyWrapperRef.value' : 'DOM查询'
      })
    } else {
      console.log('❌ 跳过左固定列同步 (leftBodyWrapperRef不存在)', {
        leftBodyWrapperRefExists: !!leftBodyWrapperRef,
        leftBodyWrapperRefValue: !!leftBodyWrapperRef?.value,
        leftBodyWrapperRefType: typeof leftBodyWrapperRef
      })
    }
    
    // 同步右固定列 - 🔑 添加DOM查询fallback
    let rightFixedElement = rightBodyWrapperRef?.value
    
    // 如果rightBodyWrapperRef.value为null，尝试通过DOM查询获取
    if (!rightFixedElement) {
      const rightFixedElements = document.querySelectorAll('.vant-table-fixed--right .vant-table-fixed__body')
      if (rightFixedElements.length > 0) {
        rightFixedElement = rightFixedElements[0]
        // 🔑 新增：将DOM查询结果保存到rightBodyWrapperRef中
        if (rightBodyWrapperRef && !rightBodyWrapperRef.value) {
          rightBodyWrapperRef.value = rightFixedElement
          console.log('✅ 通过DOM查询获取右固定列元素并更新rightBodyWrapperRef')
        }
      }
    }
    
    if (rightFixedElement) {
      const oldScrollTop = rightFixedElement.scrollTop
      rightFixedElement.scrollTop = constrainedScrollTop
      console.log('✅ 同步右固定列成功:', {
        oldScrollTop,
        newScrollTop: constrainedScrollTop,
        实际ScrollTop: rightFixedElement.scrollTop,
        同步成功: rightFixedElement.scrollTop === constrainedScrollTop,
        使用的方法: rightBodyWrapperRef?.value ? 'rightBodyWrapperRef.value' : 'DOM查询'
      })
    } else {
      console.log('❌ 跳过右固定列同步 (rightBodyWrapperRef和DOM查询都失败)', {
        rightBodyWrapperRefExists: !!rightBodyWrapperRef,
        rightBodyWrapperRefValue: !!rightBodyWrapperRef?.value,
        rightBodyWrapperRefType: typeof rightBodyWrapperRef,
        DOMQueryResult: document.querySelectorAll('.vant-table-fixed--right .vant-table-fixed__body').length
      })
    }
    
    // 更新响应式变量
    if (scrollTop && typeof scrollTop.value !== 'undefined') {
      scrollTop.value = constrainedScrollTop
    }
    if (scrollLeft && typeof scrollLeft.value !== 'undefined') {
      scrollLeft.value = constrainedScrollLeft
    }
    
    // 🔑 释放同步锁
    isSyncing.value = false
    
    console.log('✅ vxeStyleAbsoluteSync 完成，同步锁已释放')
  }

  // 主表格滚轮事件处理
  const handleMainTableWheel = (event) => {
    console.log('🚀 主表格 handleMainTableWheel 被调用了！', {
      deltaY: event.deltaY,
      deltaX: event.deltaX,
      currentScrollTop: bodyRef.value?.scrollTop,
      eventType: '主表格滚轮'
    })
    
    if (!bodyRef.value) return

    // 🔑 关键修复：阻止默认行为，手动控制所有容器的滚动
    event.preventDefault()
    
    // 计算新的滚动位置
    const currentScrollTop = bodyRef.value.scrollTop
    const currentScrollLeft = bodyRef.value.scrollLeft
    const deltaY = event.deltaY
    const deltaX = event.deltaX
    
    // 🔑 优化：使用更精确的滚动增量计算
    const scrollSensitivity = 1.0 // 可以调整滚动敏感度
    const newScrollTop = Math.max(0, currentScrollTop + (deltaY * scrollSensitivity))
    const newScrollLeft = Math.max(0, currentScrollLeft + (deltaX * scrollSensitivity))
    
    console.log('🔄 主表格滚轮同步所有容器:', {
      currentScrollTop,
      newScrollTop,
      deltaY,
      deltaX,
      scrollSensitivity
    })
    
    // 🔑 使用统一的同步机制，让所有容器都滚动到相同位置
    // 主表格hover时，同步到所有容器（包括自己）
    vxeStyleAbsoluteSync(newScrollTop, newScrollLeft, null) // 不跳过任何容器
    
    // 加载更多的检查
    if (props.enableLoadMore && deltaY > 0 && !isLoadingMore.value && !props.loadMoreLoading && !props.loadMoreFinished && !props.loadMoreError) {
      const { scrollHeight, clientHeight } = bodyRef.value
      const distanceFromBottom = scrollHeight - newScrollTop - clientHeight
      
      if (distanceFromBottom < props.loadMoreOffset) {
        isLoadingMore.value = true
        savedScrollPosition.value = newScrollTop
        
        if (isDevelopment.value) {
          console.log('🎯【主表格滚轮】触发加载更多，保存位置:', {
            保存的scrollTop: newScrollTop,
            预估行数: Math.floor(newScrollTop / 44) + 1
          })
        }
        
        emit('load-more')
      }
    }
  }

  // 固定列滚动事件处理（用于滚动条拖拽）
  const handleFixedColumnScroll = (event) => {
    console.log('🚀 固定列 handleFixedColumnScroll 被调用了！', {
      event: event,
      target: event.target,
      scrollTop: event.target.scrollTop,
      scrollLeft: event.target.scrollLeft,
      targetClass: event.target.className,
      eventType: '固定列滚动'
    })

    if (bodyRef.value) {
      const currentScrollTop = event.target.scrollTop
      const currentScrollLeft = bodyRef.value.scrollLeft || 0
      
      // 判断是来自左侧还是右侧固定列
      const isLeftFixed = event.target.closest('.vant-table-fixed--left')
      const isRightFixed = event.target.closest('.vant-table-fixed--right')
      const skipSource = isLeftFixed ? 'left' : (isRightFixed ? 'right' : null)
      
      console.log('🔄 固定列滚动事件:', {
        scrollTop: currentScrollTop,
        scrollLeft: currentScrollLeft,
        事件源: event.target.className,
        skipSource,
        isLeftFixed,
        isRightFixed,
        即将同步到主表格: true
      })
      
      // 🔑 关键修复：固定列滚动时，必须同步所有容器（主表格和其他固定列）
      // 使用VXE风格同步机制，通过同步锁防止无限循环，不需要skipSource
      vxeStyleAbsoluteSync(currentScrollTop, currentScrollLeft, null)
      
      // 检查是否触发加载更多（仅在向下滚动时）
      if (props.enableLoadMore && currentScrollTop > (bodyRef.value.scrollTop || 0) && !isLoadingMore.value && !props.loadMoreLoading && !props.loadMoreFinished && !props.loadMoreError) {
        const { scrollHeight, clientHeight } = bodyRef.value
        const distanceFromBottom = scrollHeight - currentScrollTop - clientHeight
        
        if (distanceFromBottom < props.loadMoreOffset) {
          isLoadingMore.value = true
          savedScrollPosition.value = currentScrollTop
          
          if (isDevelopment.value) {
            console.log('🎯【固定列滚动】触发加载更多，保存位置:', {
              保存的scrollTop: currentScrollTop,
              当前bodyScrollTop: bodyRef.value.scrollTop,
              预估行数: Math.floor(currentScrollTop / 44) + 1
            })
          }
          
          emit('load-more')
        }
      }
    }
  }

  // 固定列滚轮事件处理
  const handleFixedColumnWheel = (event) => {
    console.log('🚀 固定列 handleFixedColumnWheel 被调用了！', {
      deltaY: event.deltaY,
      deltaX: event.deltaX,
      currentScrollTop: bodyRef.value?.scrollTop,
      eventType: '固定列滚轮'
    })
    
    if (!bodyRef.value) return
    
    // 🔑 关键修复：阻止默认行为，手动控制所有容器的滚动
    event.preventDefault()
    
    // 🔑 优化：检测是从哪个固定列触发的滚动
    const isLeftFixed = event.target.closest('.vant-table-fixed--left')
    const isRightFixed = event.target.closest('.vant-table-fixed--right')
    const sourceInfo = isLeftFixed ? '左固定列' : (isRightFixed ? '右固定列' : '未知固定列')
    
    // 计算新的滚动位置（以主表格的滚动位置为基准）
    const currentScrollTop = bodyRef.value.scrollTop
    const currentScrollLeft = bodyRef.value.scrollLeft
    const deltaY = event.deltaY
    const deltaX = event.deltaX
    
    // 🔑 优化：使用更精确的滚动增量计算
    const scrollSensitivity = 1.0 // 可以调整滚动敏感度
    const newScrollTop = Math.max(0, currentScrollTop + (deltaY * scrollSensitivity))
    const newScrollLeft = Math.max(0, currentScrollLeft + (deltaX * scrollSensitivity))
    
    console.log('🔄 固定列滚轮同步所有容器:', {
      currentScrollTop,
      newScrollTop,
      deltaY,
      deltaX,
      scrollSensitivity,
      sourceInfo
    })
    
    // 🔑 使用统一的同步机制，让所有容器都滚动到相同位置
    // 固定列hover时，同步到所有容器（包括主表格和其他固定列）
    vxeStyleAbsoluteSync(newScrollTop, newScrollLeft, null) // 不跳过任何容器
    
    // 加载更多的检查
    if (props.enableLoadMore && deltaY > 0 && !isLoadingMore.value && !props.loadMoreLoading && !props.loadMoreFinished && !props.loadMoreError) {
      const { scrollHeight, clientHeight } = bodyRef.value
      const distanceFromBottom = scrollHeight - newScrollTop - clientHeight
      
      if (distanceFromBottom < props.loadMoreOffset) {
        isLoadingMore.value = true
        savedScrollPosition.value = newScrollTop
        
        if (isDevelopment.value) {
          console.log('🎯【固定列滚轮】触发加载更多，保存位置:', {
            保存的scrollTop: newScrollTop,
            预估行数: Math.floor(newScrollTop / 44) + 1
          })
        }
        
        emit('load-more')
      }
    }
  }

  // 主表格滚动事件处理 - 处理水平和垂直滚动
  const handleScroll = (event) => {
    console.log('🚀 主表格 handleScroll 被调用了！', {
      event: event,
      target: event.target,
      scrollTop: event.target.scrollTop,
      scrollLeft: event.target.scrollLeft,
      targetClass: event.target.className,
      eventType: '主表格滚动'
    })
    
    // 🔧 临时修复：如果bodyRef.value为null，直接使用event.target
    // 因为我们知道scroll事件来自正确的DOM元素
    const actualBodyElement = bodyRef.value || event.target
    
    if (!actualBodyElement) {
      console.warn('⚠️ 既没有bodyRef.value也没有event.target')
      return
    }
    
    const currentScrollTop = actualBodyElement.scrollTop
    const currentScrollLeft = actualBodyElement.scrollLeft
    
    console.log('🔄 主表格滚动事件:', {
      scrollTop: currentScrollTop,
      scrollLeft: currentScrollLeft,
      headerContentRef: !!headerContentRef.value,
      使用的元素: bodyRef.value ? 'bodyRef.value' : 'event.target'
    })
    
    // 🔑 关键调试：比较scrollLeft引用
    console.log('🔍 scrollLeft引用调试（handleScroll中）:', {
      scrollLeft引用: scrollLeft,
      scrollLeft类型: typeof scrollLeft,
      scrollLeft当前值: scrollLeft?.value,
      scrollLeft是否为RefImpl: scrollLeft && scrollLeft.__v_isRef,
      参数个数: arguments.length
    })
    
    // 🔑 关键修复：直接更新响应式 scrollLeft 和 scrollTop
    // 绕过 vxeStyleAbsoluteSync 中的约束问题
    if (scrollLeft && typeof scrollLeft.value !== 'undefined') {
      const oldScrollLeft = scrollLeft.value
      scrollLeft.value = currentScrollLeft
      console.log('✅ 直接更新 scrollLeft.value:', {
        旧值: oldScrollLeft,
        新值: currentScrollLeft,
        滚动差值: currentScrollLeft - oldScrollLeft
      })
    }
    if (scrollTop && typeof scrollTop.value !== 'undefined') {
      const oldScrollTop = scrollTop.value
      scrollTop.value = currentScrollTop
      console.log('✅ 直接更新 scrollTop.value:', {
        旧值: oldScrollTop,
        新值: currentScrollTop,
        滚动差值: currentScrollTop - oldScrollTop
      })
    }
    
    // 🔑 强制触发阴影状态更新 - 通过修改DOM元素的dataset属性
    // 这会强制Vue重新计算相关的computed属性
    if (typeof document !== 'undefined') {
      const tableWrapper = document.querySelector('.vant-table-wrapper')
      if (tableWrapper) {
        tableWrapper.dataset.scrollLeft = currentScrollLeft.toString()
        console.log('✅ 强制更新DOM scrollLeft dataset:', currentScrollLeft)
      }
      
      // 🔑 直接计算并设置滚动条手柄位置 - 参考vxe-table实现
      const scrollbarHandle = document.querySelector('.vant-table-scroll-x-handle')
      const scrollbarWrapper = document.querySelector('.vant-table-scroll-x-wrapper')
      if (scrollbarHandle && scrollbarWrapper) {
        // 获取必要的尺寸信息
        const wrapperWidth = scrollbarWrapper.clientWidth
        const handleWidth = scrollbarHandle.offsetWidth
        
        // 从DOM获取表格信息（如果Vue computed还没更新）
        const tableBody = document.querySelector('.vant-table-body')
        if (tableBody) {
          const maxScrollLeft = Math.max(0, tableBody.scrollWidth - tableBody.clientWidth)
          if (maxScrollLeft > 0) {
            // 计算滚动条手柄位置（参考vxe-table算法）
            const scrollProgress = currentScrollLeft / maxScrollLeft
            const maxHandleLeft = wrapperWidth - handleWidth
            const handleLeft = scrollProgress * maxHandleLeft
            
            // 直接设置DOM样式
            scrollbarHandle.style.left = `${handleLeft}px`
            console.log('✅ 直接设置滚动条手柄位置:', {
              currentScrollLeft,
              maxScrollLeft,
              scrollProgress,
              handleLeft,
              wrapperWidth,
              handleWidth
            })
          }
        }
      }
    }
    
    console.log('🔥 即将调用 vxeStyleAbsoluteSync')
    // 🔑 在VXE约束之前更新独立的阴影滚动跟踪
    if (updateShadowScrollPosition) {
      updateShadowScrollPosition(currentScrollLeft)
      console.log('✅ 调用了updateShadowScrollPosition函数，滚动位置:', currentScrollLeft)
    }
    
    // 使用VXE风格同步机制同步所有容器，指定跳过主表格避免循环
    vxeStyleAbsoluteSync(currentScrollTop, currentScrollLeft, 'main')
    
    // 🔑 调用阴影状态更新函数（参考VantTable copy 15.vue）
    if (updateShadowState && layoutWrapperRef) {
      updateShadowState(layoutWrapperRef)
      console.log('✅ 调用了updateShadowState函数')
    }
    
    // 检查是否触发加载更多
    if (props.enableLoadMore && !isLoadingMore.value && !props.loadMoreLoading && !props.loadMoreFinished && !props.loadMoreError) {
      const { scrollHeight, clientHeight } = actualBodyElement
      const distanceFromBottom = scrollHeight - currentScrollTop - clientHeight
      
      if (distanceFromBottom < props.loadMoreOffset) {
        isLoadingMore.value = true
        savedScrollPosition.value = currentScrollTop
        
        if (isDevelopment.value) {
          console.log('🎯【主表格滚动】触发加载更多，保存位置:', {
            保存的scrollTop: currentScrollTop,
            预估行数: Math.floor(currentScrollTop / 44) + 1
          })
        }
        
        emit('load-more')
      }
    }
    
    // 🔑 新增：滚动边界事件检测（四个方向）
    const { scrollHeight, clientHeight, scrollWidth, clientWidth } = actualBodyElement
    const tolerance = 5 // 容错像素
    
    // 检测纵向滚动到顶部
    if (currentScrollTop <= tolerance) {
      emit('scroll-to-top', {
        scrollTop: currentScrollTop,
        scrollLeft: currentScrollLeft,
        scrollHeight,
        clientHeight,
        scrollWidth,
        clientWidth,
        element: actualBodyElement
      })
    }
    
    // 检测纵向滚动到底部
    if (scrollHeight - currentScrollTop - clientHeight <= tolerance) {
      emit('scroll-to-bottom', {
        scrollTop: currentScrollTop,
        scrollLeft: currentScrollLeft,
        scrollHeight,
        clientHeight,
        scrollWidth,
        clientWidth,
        element: actualBodyElement
      })
    }
    
    // 检测横向滚动到左边界
    if (currentScrollLeft <= tolerance) {
      emit('scroll-to-left', {
        scrollTop: currentScrollTop,
        scrollLeft: currentScrollLeft,
        scrollHeight,
        clientHeight,
        scrollWidth,
        clientWidth,
        element: actualBodyElement
      })
    }
    
    // 检测横向滚动到右边界
    if (scrollWidth - currentScrollLeft - clientWidth <= tolerance) {
      emit('scroll-to-right', {
        scrollTop: currentScrollTop,
        scrollLeft: currentScrollLeft,
        scrollHeight,
        clientHeight,
        scrollWidth,
        clientWidth,
        element: actualBodyElement
      })
    }
    
    // 发出通用滚动事件
    emit('scroll', {
      scrollTop: currentScrollTop,
      scrollLeft: currentScrollLeft,
      scrollHeight,
      clientHeight,
      scrollWidth,
      clientWidth,
      element: actualBodyElement
    })
  }

  // 固定列触摸事件处理（暂时使用简单的处理方式）
  const handleFixedColumnTouchStart = (event) => {
    // 简单的触摸开始处理
    if (isDevelopment.value) {
      console.log('🔄 固定列触摸开始')
    }
  }

  const handleFixedColumnTouchMove = (event) => {
    // 简单的触摸移动处理
    if (isDevelopment.value) {
      console.log('🔄 固定列触摸移动')
    }
  }

  const handleFixedColumnTouchEnd = (event) => {
    // 简单的触摸结束处理
    if (isDevelopment.value) {
      console.log('🔄 固定列触摸结束')
    }
  }

  // 🔑 新增：hover状态管理函数
  const handleAreaMouseEnter = (area) => {
    hoveredArea.value = area
    isHovering.value = true
    if (isDevelopment.value) {
      console.log(`🎯 鼠标进入${area === 'main' ? '主表格' : (area === 'left' ? '左固定列' : '右固定列')}区域`)
    }
  }

  const handleAreaMouseLeave = (area) => {
    if (hoveredArea.value === area) {
      hoveredArea.value = null
      isHovering.value = false
      if (isDevelopment.value) {
        console.log(`🎯 鼠标离开${area === 'main' ? '主表格' : (area === 'left' ? '左固定列' : '右固定列')}区域`)
      }
    }
  }

  // 主表格触摸事件处理（暂时使用简单的处理方式）
  const handleMainTableTouchStart = (event) => {
    if (isDevelopment.value) {
      console.log('🔄 主表格触摸开始')
    }
  }

  const handleMainTableTouchMove = (event) => {
    if (isDevelopment.value) {
      console.log('🔄 主表格触摸移动')
    }
  }

  const handleMainTableTouchEnd = (event) => {
    if (isDevelopment.value) {
      console.log('🔄 主表格触摸结束')
    }
  }

  return {
    // 状态
    isLoadingMore,
    savedScrollPosition,
    savedDataLength,
    savedScrollHeight,
    intoRunScroll,
    lastScrollTop,
    hoveredArea,
    isHovering,
    isSyncing,
    
    // 方法
    vxeStyleAbsoluteSync,
    handleScroll,
    handleMainTableWheel,
    handleMainTableTouchStart,
    handleMainTableTouchMove,
    handleMainTableTouchEnd,
    handleFixedColumnScroll,
    handleFixedColumnWheel,
    handleFixedColumnTouchStart,
    handleFixedColumnTouchMove,
    handleFixedColumnTouchEnd,
    handleAreaMouseEnter,
    handleAreaMouseLeave
  }
}