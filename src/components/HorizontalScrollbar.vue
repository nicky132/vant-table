<template>
  <!-- 横向滚动条（与table布局容器平级，参考vtable，覆盖整个宽度） -->
  <div
    v-if="showHorizontalScrollbar"
    class="vant-table-scroll-x-virtual"
    :style="horizontalScrollbarContainerStyle">
    
    <!-- 左侧固定列对应的滚动条区域 -->
    <div class="vant-table-scrollbar-left" :style="scrollbarLeftCornerStyle" @click="handleScrollToLeft"></div>
    
    <!-- 主表格对应的滚动条区域 -->
    <div class="vant-table-scrollbar-middle">
      <!-- 滚动条主体包装器 - 只覆盖主表格区域 -->
      <div
        class="vant-table-scroll-x-wrapper"
        :style="scrollbarWrapperStyle"
        ref="scrollbarWrapperRef"
        @click="handleScrollbarTrackClick">
        <!-- 滚动条手柄 -->
        <div
          class="vant-table-scroll-x-handle"
          :class="{
            'vant-table-scroll-x-handle--visible': isScrollbarVisible,
            'vant-table-scroll-x-handle--dragging': isDragging
          }"
          :style="scrollbarHandleStyle"
          ref="scrollbarHandleRef"
          @mousedown="handleScrollbarMouseDown"
          @mouseenter="handleScrollbarMouseEnter"
          @mouseleave="handleScrollbarMouseLeave">
          <!-- 滚动条内部空间 -->
          <div class="vant-table-scroll-x-space" :style="scrollbarSpaceStyle"></div>
        </div>
      </div>
    </div>
    
    <!-- 右侧固定列对应的滚动条区域 -->
    <div class="vant-table-scrollbar-right" :style="scrollbarRightCornerStyle" @click="handleScrollToRight"></div>
  </div>
</template>

<script setup>
defineProps({
  showHorizontalScrollbar: Boolean,
  horizontalScrollbarContainerStyle: Object,
  scrollbarWrapperStyle: Object,
  isScrollbarVisible: Boolean,
  isDragging: Boolean,
  scrollbarHandleStyle: Object,
  scrollbarSpaceStyle: Object,
  scrollbarLeftCornerStyle: Object,
  scrollbarRightCornerStyle: Object,
  
  // Functions
  handleScrollbarTrackClick: Function,
  handleScrollbarMouseDown: Function,
  handleScrollbarMouseEnter: Function,
  handleScrollbarMouseLeave: Function,
  handleScrollToLeft: Function,
  handleScrollToRight: Function
})

defineExpose({
  scrollbarWrapperRef: null,
  scrollbarHandleRef: null
})
</script>