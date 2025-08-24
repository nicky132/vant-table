<template>
  <div class="vant-table-load-more" :class="loadMoreClass">
    <!-- 加载中状态 -->
    <div v-if="loading" class="vant-table-load-more__loading">
      <VanLoading size="16px" />
      <span class="vant-table-load-more__text">{{ loadingText }}</span>
    </div>

    <!-- 错误状态 -->
    <div 
      v-else-if="error" 
      class="vant-table-load-more__error"
      @click="handleErrorClick">
      <i class="van-icon van-icon-warning-o vant-table-load-more__error-icon"></i>
      <span class="vant-table-load-more__text">{{ errorText }}</span>
    </div>

    <!-- 完成状态 -->
    <div v-else-if="finished" class="vant-table-load-more__finished">
      <span class="vant-table-load-more__text">{{ finishedText }}</span>
    </div>

    <!-- 默认状态（准备加载） -->
    <div v-else class="vant-table-load-more__ready">
      <span class="vant-table-load-more__text">上拉加载更多</span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { Loading as VanLoading } from 'vant'

export default {
  name: 'VantTableLoadMore',
  components: {
    VanLoading
  },
  props: {
    loading: Boolean,
    error: Boolean,
    finished: Boolean,
    loadingText: {
      type: String,
      default: '加载中...'
    },
    errorText: {
      type: String,
      default: '加载失败，点击重试'
    },
    finishedText: {
      type: String,
      default: '没有更多了'
    }
  },
  emits: ['click-error'],
  setup(props, { emit }) {
    const loadMoreClass = computed(() => ({
      'vant-table-load-more--loading': props.loading,
      'vant-table-load-more--error': props.error,
      'vant-table-load-more--finished': props.finished
    }))

    const handleErrorClick = () => {
      emit('click-error')
    }

    return {
      loadMoreClass,
      handleErrorClick
    }
  }
}
</script>

<style scoped>
.vant-table-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background-color: #fff;
  border-top: 1px solid var(--van-border-color);
  color: var(--van-gray-6);
  font-size: 14px;
}

.vant-table-load-more__loading,
.vant-table-load-more__error,
.vant-table-load-more__finished,
.vant-table-load-more__ready {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vant-table-load-more__error {
  cursor: pointer;
  color: var(--van-danger-color);
}

.vant-table-load-more__error:hover {
  opacity: 0.8;
}

.vant-table-load-more__error-icon {
  font-size: 16px;
}

.vant-table-load-more__text {
  line-height: 1;
}

.vant-table-load-more--loading {
  color: var(--van-primary-color);
}

.vant-table-load-more--error {
  color: var(--van-danger-color);
}

.vant-table-load-more--finished {
  color: var(--van-gray-6);
}
</style>