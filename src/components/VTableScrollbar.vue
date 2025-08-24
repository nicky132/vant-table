<template>
  <div
    v-if="show"
    class="vant-table-scroll-x-virtual"
    :style="containerStyle">
    <!-- 滚动条主体包装器 -->
    <div
      class="vant-table-scroll-x-wrapper"
      :style="wrapperStyle"
      ref="scrollbarWrapperRef"
      @click="handleAreaClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @wheel="handleWheel">
      <!-- 滚动条手柄 -->
      <div
        class="vant-table-scroll-x-handle"
        :class="{
          'vant-table-scroll-x-handle--visible': isVisible,
          'vant-table-scroll-x-handle--dragging': isDragging
        }"
        :style="handleStyle"
        ref="scrollbarHandleRef"
        @mousedown="handleMouseDown">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineOptions({
  name: 'VTableScrollbar'
})

const props = defineProps({
  show: Boolean,
  containerStyle: Object,
  wrapperStyle: Object,
  handleStyle: Object,
  isVisible: Boolean,
  isDragging: Boolean
})

const emit = defineEmits([
  'area-click',
  'mouse-enter', 
  'mouse-leave',
  'wheel',
  'mouse-down'
])

const scrollbarWrapperRef = ref(null)
const scrollbarHandleRef = ref(null)

const handleAreaClick = (event) => {
  emit('area-click', event)
}

const handleMouseEnter = () => {
  emit('mouse-enter')
}

const handleMouseLeave = () => {
  emit('mouse-leave')
}

const handleWheel = (event) => {
  emit('wheel', event)
}

const handleMouseDown = (event) => {
  emit('mouse-down', event)
}

defineExpose({
  scrollbarWrapperRef,
  scrollbarHandleRef
})
</script>