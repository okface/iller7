<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },  // 0-1
  size: { type: Number, default: 80 },
  strokeWidth: { type: Number, default: 6 },
  color: { type: String, default: '#4F46E5' },
  bgColor: { type: String, default: '#E7E5E4' },
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - Math.min(1, Math.max(0, props.value))))
</script>

<template>
  <svg :width="size" :height="size" class="transform -rotate-90">
    <circle
      :cx="size / 2" :cy="size / 2" :r="radius"
      fill="none" :stroke="bgColor" :stroke-width="strokeWidth"
    />
    <circle
      :cx="size / 2" :cy="size / 2" :r="radius"
      fill="none" :stroke="color" :stroke-width="strokeWidth"
      stroke-linecap="round"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="dashOffset"
      class="transition-all duration-700 ease-out"
    />
  </svg>
</template>
