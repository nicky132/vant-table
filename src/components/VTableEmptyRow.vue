<template>
  <tr v-if="!hasData">
    <td
      :colspan="colspan"
      class="vant-td vant-td--empty">
      <div class="vant-empty-content">
        <VanEmpty :description="description" />
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { Empty as VanEmpty } from 'vant'

defineOptions({
  name: 'VTableEmptyRow'
})

const props = defineProps({
  hasData: Boolean,
  colspan: Number,
  hasActiveFilters: Boolean
})

const description = computed(() => 
  props.hasActiveFilters ? '没有符合条件的数据' : '暂无数据'
)
</script>