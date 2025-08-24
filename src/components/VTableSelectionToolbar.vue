<template>
  <div v-if="selectable && selectedRows.length > 0" class="vant-table-selection-toolbar">
    <div class="vant-table-selection-toolbar__content">
      <div class="vant-table-selection-toolbar__info">
        <span class="vant-table-selection-toolbar__count">
          已选择 {{ selectedRows.length }} 项
          <span v-if="selectableRows.length > 0" class="vant-table-selection-toolbar__total">
            / 共 {{ selectableRows.length }} 项
          </span>
        </span>
        <VanButton
          type="default"
          size="mini"
          @click="handleClearSelection"
          class="vant-table-selection-toolbar__clear">
          取消选择
        </VanButton>
      </div>
      <div class="vant-table-selection-toolbar__actions">
        <slot
          name="selection-actions"
          :selectedRows="selectedRows"
          :selectedRowKeys="selectedRowKeys"
          :selectableRows="selectableRows">
          <VanButton
            type="danger"
            size="mini"
            @click="handleBatchDelete"
            :disabled="!selectedRows.length">
            批量删除 ({{ selectedRows.length }})
          </VanButton>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Button as VanButton } from 'vant'

defineOptions({
  name: 'VTableSelectionToolbar'
})

const props = defineProps({
  selectable: Boolean,
  selectedRows: Array,
  selectedRowKeys: Array,
  selectableRows: Array
})

const emit = defineEmits(['clear-selection', 'batch-delete'])

const handleClearSelection = () => {
  emit('clear-selection')
}

const handleBatchDelete = () => {
  emit('batch-delete')
}
</script>

<style scoped>
/* ========== 选择操作工具栏样式 ========== */
.vant-table-selection-toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--van-white);
  border-top: 1px solid var(--van-border-color);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

.vant-table-selection-toolbar__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}

.vant-table-selection-toolbar__info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.vant-table-selection-toolbar__count {
  font-size: 14px;
  color: var(--van-text-color);
  font-weight: 500;
}

.vant-table-selection-toolbar__total {
  color: var(--van-text-color-2);
  font-weight: normal;
}

.vant-table-selection-toolbar__clear {
  flex-shrink: 0;
}

.vant-table-selection-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>