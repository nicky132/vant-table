<template>
  <VanPopup
    v-model:show="visible"
    position="bottom"
    :style="{ width: '100%', maxWidth: '400px' }"
    @open="handleOpen"
    @close="handleClose">
    <div class="vant-table-filter">
      <div class="vant-table-filter__header">
        <span class="vant-table-filter__title">{{ title }}</span>
        <VanButton
          type="primary"
          size="mini" 
          @click="handleReset">
          重置
        </VanButton>
      </div>

      <div class="vant-table-filter__content">
        <!-- 文本过滤 -->
        <template v-if="filterType === 'text'">
          <VanField
            v-model="textFilter"
            placeholder="请输入关键词"
            clearable
            @input="handleTextInput" />
        </template>

        <!-- 多选过滤 -->
        <template v-else-if="filterType === 'multiSelect'">
          <div class="vant-table-filter__options">
            <VCheckbox
              :modelValue="isAllOptionsSelected"
              :indeterminate="isIndeterminate"
              @update:modelValue="handleSelectAllOptions">
              全选
            </VCheckbox>
            <VCheckbox
              v-for="option in options"
              :key="option.value"
              :modelValue="selectedValues.includes(option.value)"
              @update:modelValue="checked => handleOptionChange(option.value, checked)">
              {{ option.label }} ({{ option.count }})
            </VCheckbox>
          </div>
        </template>

        <!-- 日期范围过滤 -->
        <template v-else-if="filterType === 'dateRange'">
          <div class="vant-table-filter__date-range">
            <VanField
              v-model="dateFilter.start"
              type="date"
              placeholder="开始日期"
              @input="handleDateChange" />
            <VanField
              v-model="dateFilter.end"
              type="date"
              placeholder="结束日期"
              @input="handleDateChange" />
          </div>
        </template>

        <!-- 数值范围过滤 -->
        <template v-else-if="filterType === 'numberRange'">
          <div class="vant-table-filter__number-range">
            <VanField
              v-model.number="numberFilter.min"
              type="number"
              placeholder="最小值"
              @input="handleNumberChange" />
            <VanField
              v-model.number="numberFilter.max"
              type="number"
              placeholder="最大值"
              @input="handleNumberChange" />
          </div>
        </template>
      </div>

      <div class="vant-table-filter__footer">
        <VanButton @click="handleCancel">取消</VanButton>
        <VanButton type="primary" @click="handleConfirm">确定</VanButton>
      </div>
    </div>
  </VanPopup>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { Popup as VanPopup, Field as VanField, Button as VanButton } from 'vant'

export default {
  name: 'VantTableFilter',
  components: {
    VanPopup,
    VanField,
    VanButton
  },
  props: {
    show: Boolean,
    title: String,
    filterType: {
      type: String,
      default: 'text'
    },
    options: Array,
    value: null,
    column: Object
  },
  emits: ['update:show', 'confirm', 'reset'],
  setup(props, { emit }) {
    const visible = computed({
      get: () => props.show,
      set: (value) => emit('update:show', value)
    })

    // 文本过滤
    const textFilter = ref('')

    // 多选过滤
    const selectedValues = ref([])
    const isAllOptionsSelected = computed(() => 
      props.options && selectedValues.value.length === props.options.length
    )
    const isIndeterminate = computed(() => 
      selectedValues.value.length > 0 && selectedValues.value.length < (props.options?.length || 0)
    )

    // 日期范围过滤
    const dateFilter = ref({
      start: '',
      end: ''
    })

    // 数值范围过滤
    const numberFilter = ref({
      min: null,
      max: null
    })

    // 监听值变化
    watch(() => props.value, (newValue) => {
      if (!newValue) return
      
      switch (props.filterType) {
        case 'text':
          textFilter.value = newValue.value || ''
          break
        case 'multiSelect':
          selectedValues.value = newValue.values || []
          break
        case 'dateRange':
          dateFilter.value = { ...newValue }
          break
        case 'numberRange':
          numberFilter.value = { ...newValue }
          break
      }
    }, { immediate: true })

    const handleOpen = () => {
      // 弹窗打开时的逻辑
    }

    const handleClose = () => {
      visible.value = false
    }

    const handleTextInput = () => {
      // 文本输入处理
    }

    const handleSelectAllOptions = (checked) => {
      if (checked) {
        selectedValues.value = props.options.map(option => option.value)
      } else {
        selectedValues.value = []
      }
    }

    const handleOptionChange = (value, checked) => {
      if (checked) {
        selectedValues.value.push(value)
      } else {
        const index = selectedValues.value.indexOf(value)
        if (index > -1) {
          selectedValues.value.splice(index, 1)
        }
      }
    }

    const handleDateChange = () => {
      // 日期变化处理
    }

    const handleNumberChange = () => {
      // 数值变化处理
    }

    const handleReset = () => {
      textFilter.value = ''
      selectedValues.value = []
      dateFilter.value = { start: '', end: '' }
      numberFilter.value = { min: null, max: null }
      emit('reset', props.column)
    }

    const handleCancel = () => {
      visible.value = false
    }

    const handleConfirm = () => {
      let filterValue = null
      
      switch (props.filterType) {
        case 'text':
          if (textFilter.value.trim()) {
            filterValue = {
              type: 'text',
              value: textFilter.value.trim()
            }
          }
          break
        case 'multiSelect':
          if (selectedValues.value.length > 0) {
            filterValue = {
              type: 'multiSelect',
              values: [...selectedValues.value]
            }
          }
          break
        case 'dateRange':
          if (dateFilter.value.start || dateFilter.value.end) {
            filterValue = {
              type: 'dateRange',
              start: dateFilter.value.start,
              end: dateFilter.value.end
            }
          }
          break
        case 'numberRange':
          if (numberFilter.value.min !== null || numberFilter.value.max !== null) {
            filterValue = {
              type: 'numberRange',
              min: numberFilter.value.min,
              max: numberFilter.value.max
            }
          }
          break
      }

      emit('confirm', {
        column: props.column,
        filter: filterValue
      })
      
      visible.value = false
    }

    return {
      visible,
      textFilter,
      selectedValues,
      isAllOptionsSelected,
      isIndeterminate,
      dateFilter,
      numberFilter,
      handleOpen,
      handleClose,
      handleTextInput,
      handleSelectAllOptions,
      handleOptionChange,
      handleDateChange,
      handleNumberChange,
      handleReset,
      handleCancel,
      handleConfirm
    }
  }
}
</script>

<style scoped>
.vant-table-filter {
  padding: 16px;
}

.vant-table-filter__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.vant-table-filter__title {
  font-size: 16px;
  font-weight: 500;
}

.vant-table-filter__options {
  max-height: 300px;
  overflow-y: auto;
}

.vant-table-filter__options .van-checkbox {
  display: block;
  margin-bottom: 8px;
}

.vant-table-filter__date-range,
.vant-table-filter__number-range {
  display: flex;
  gap: 8px;
}

.vant-table-filter__footer {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.vant-table-filter__footer .van-button {
  flex: 1;
}
</style>