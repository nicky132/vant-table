<template>
  <div
    :class="[
      'vant-table-radio',
      {
        'vant-table-radio--checked': modelValue,
        'vant-table-radio--disabled': disabled
      }
    ]"
    @click="handleClick">
    <input
      type="radio"
      class="vant-table-radio__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange" />
    <span class="vant-table-radio__icon">
      <span v-if="modelValue" class="vant-table-radio__dot"></span>
    </span>
  </div>
</template>

<script setup>
defineOptions({
  name: 'VTableRadio'
})

const props = defineProps({
  modelValue: Boolean,
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
    emit('update:modelValue', true)
  }
}
</script>