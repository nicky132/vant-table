<template>
  <div
    :class="[
      'vant-table-checkbox',
      {
        'vant-table-checkbox--checked': modelValue,
        'vant-table-checkbox--indeterminate': indeterminate,
        'vant-table-checkbox--disabled': disabled
      }
    ]"
    @click="handleClick">
    <input
      type="checkbox"
      class="vant-table-checkbox__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange" />
  </div>
</template>

<script setup>
defineOptions({
  name: 'VTableCheckbox'
})

const props = defineProps({
  modelValue: Boolean,
  indeterminate: Boolean,
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (event) => {
  if (props.disabled) return
  emit('update:modelValue', event.target.checked)
}

const handleClick = (e) => {
  e.stopPropagation()
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>