<template>
  <div style="display: none;">{{ console.log('🔍 FilterPopup template rendering, filterableHeaders:', filterableHeaders.length) }}</div>
  <template v-for="header in filterableHeaders" :key="`filter-${header.key}`">
    <Teleport to="body">
      <VanPopup
        v-if="filterStates[header.key]?.show || false"
        v-model:show="filterStates[header.key].show"
        position="center"
        :style="{ zIndex: 99999 }"
        :lazy-render="true"
        :destroy-on-close="true"
        closeable
        @click-overlay="onClickOverlay"
        round
        class="vant-filter-modal-popup vant-filter-modal-popup--teleport van-overlay">
      <div class="vant-filter-modal">
        <div class="vant-filter-modal__header">
          <span class="vant-filter-modal__title">过滤 {{ header.label }}</span>
          <VanIcon
            name="cross"
            class="vant-filter-modal__close"
            @click="handleFilterClose(header.key)" />
        </div>

        <div class="vant-filter-modal__content">
          <!-- VTable风格：搜索框 -->
          <div class="vant-filter-search">
            <VanField
              v-model="filterStates[header.key].value"
              placeholder="搜索..."
              size="small"
              clearable />
          </div>
          
          <!-- VTable风格：选项列表 -->
          <div class="vant-filter-v-options">
            <!-- 全部选项 -->
            <div class="vant-filter-v-option">
              <VanCheckbox
                :model-value="!filterStates[header.key]?.selectedValues?.length"
                @update:model-value="selectAllFilterOptions(header.key)">
                <span class="vant-filter-v-option__text">全部</span>
              </VanCheckbox>
            </div>
            
            <!-- 可选项列表 -->
            <div
              v-for="option in getFilteredOptions(header.key)"
              :key="option"
              class="vant-filter-v-option">
              <VanCheckbox
                :model-value="isOptionSelected(header.key, option)"
                @update:model-value="toggleFilterOption(header.key, option)">
                <span class="vant-filter-v-option__text">{{ option }}</span>
              </VanCheckbox>
            </div>
          </div>
        </div>

        <!-- VTable风格操作按钮 -->
        <div class="vant-filter-modal__actions">
          <VanButton block @click="resetFilter(header.key)">重置</VanButton>
          <VanButton block type="primary" @click="applyFilter(header.key)">确定</VanButton>
        </div>
      </div>
      </VanPopup>
    </Teleport>
  </template>
</template>

<script setup>
import { Teleport, computed, onMounted } from 'vue'
import { 
  Checkbox as VanCheckbox, 
  Field as VanField, 
  Button as VanButton, 
  Popup as VanPopup, 
  Icon as VanIcon 
} from 'vant'

const props = defineProps({
  headers: Array,
  filterStates: Object,
  filters: Object,
  toggleFilter: Function,
  applyFilter: Function,
  clearFilters: Function
})

onMounted(() => {
  console.log('🔍 FilterPopup component mounted with props:', {
    headers: props.headers?.length,
    filterStates: props.filterStates,
    filters: props.filters
  })
})

// Compute filterable headers from headers prop
const filterableHeaders = computed(() => {
  const headers = (props.headers || []).filter(header => header.filterable)
  console.log('🔍 FilterPopup filterableHeaders:', headers)
  console.log('🔍 FilterPopup filterStates:', props.filterStates)
  console.log('🔍 FilterPopup should show popups for:', 
    Object.fromEntries(
      Object.entries(props.filterStates || {}).map(([k, v]) => [k, v?.show])
    )
  )
  return headers
})

// Handle filter close
const handleFilterClose = (key) => {
  props.toggleFilter(key)
}

// Handle overlay click
const onClickOverlay = () => {
  // Close all open filters
  Object.keys(props.filterStates || {}).forEach(key => {
    if (props.filterStates[key]?.show) {
      props.toggleFilter(key)
    }
  })
}

// Get filtered options for a column
const getFilteredOptions = (key) => {
  const filter = props.filters?.[key]
  if (!filter) return []
  
  const searchValue = props.filterStates?.[key]?.value || ''
  if (!searchValue) return filter.options || []
  
  return (filter.options || []).filter(option => 
    String(option).toLowerCase().includes(searchValue.toLowerCase())
  )
}

// Check if option is selected
const isOptionSelected = (key, option) => {
  return props.filterStates?.[key]?.selectedValues?.includes(option) || false
}

// Toggle filter option
const toggleFilterOption = (key, option) => {
  if (!props.filterStates?.[key]) return
  
  const selectedValues = props.filterStates[key].selectedValues || []
  const index = selectedValues.indexOf(option)
  
  if (index > -1) {
    selectedValues.splice(index, 1)
  } else {
    selectedValues.push(option)
  }
}

// Select all filter options
const selectAllFilterOptions = (key) => {
  if (!props.filterStates?.[key]) return
  
  const allSelected = !props.filterStates[key].selectedValues?.length
  if (allSelected) {
    // Select all options
    props.filterStates[key].selectedValues = [...(props.filters?.[key]?.options || [])]
  } else {
    // Deselect all
    props.filterStates[key].selectedValues = []
  }
}

// Reset filter
const resetFilter = (key) => {
  if (props.filterStates?.[key]) {
    props.filterStates[key].value = ''
    props.filterStates[key].selectedValues = []
  }
}
</script>