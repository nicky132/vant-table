<template>
  <!-- 加载更多状态 -->
  <div v-if="enableLoadMore && showLoadMoreUi" class="vant-table-load-more">
    <div v-if="loadMoreLoading" class="vant-table-load-more__loading">
      <VanLoading size="16px" />
      <span>{{ loadMoreLoadingText }}</span>
    </div>
    <div
      v-else-if="loadMoreError"
      class="vant-table-load-more__error"
      @click="$emit('load-more')">
      <span>{{ loadMoreErrorText }}</span>
    </div>
    <div v-else-if="loadMoreFinished" class="vant-table-load-more__finished">
      <span>{{ loadMoreFinishedText }}</span>
    </div>
    <div v-else class="vant-table-load-more__ready">
      <span>{{ loadMoreReadyText }}</span>
    </div>
  </div>
</template>

<script setup>
import { Loading as VanLoading } from 'vant'

defineProps({
  enableLoadMore: Boolean,
  showLoadMoreUi: Boolean,
  loadMoreLoading: Boolean,
  loadMoreError: Boolean,
  loadMoreFinished: Boolean,
  loadMoreLoadingText: String,
  loadMoreErrorText: String,
  loadMoreFinishedText: String,
  loadMoreReadyText: String
})

defineEmits(['load-more'])
</script>