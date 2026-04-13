<script setup>
import { computed } from 'vue'
import { daysAgoStr } from '@/utils/dates.js'

const props = defineProps({ days: Object })

const cells = computed(() => {
  const result = []
  for (let i = 29; i >= 0; i--) {
    const date = daysAgoStr(i)
    const day = props.days[date]
    const seen = day?.seen || 0
    let level = 0
    if (seen > 0) level = 1
    if (seen >= 5) level = 2
    if (seen >= 15) level = 3
    if (seen >= 30) level = 4
    result.push({ date, seen, level })
  }
  return result
})

const colors = [
  'bg-stone-100 dark:bg-stone-800',
  'bg-emerald-200 dark:bg-emerald-900',
  'bg-emerald-400 dark:bg-emerald-700',
  'bg-emerald-500 dark:bg-emerald-600',
  'bg-emerald-700 dark:bg-emerald-500',
]
</script>

<template>
  <div class="flex flex-wrap gap-1">
    <div
      v-for="cell in cells"
      :key="cell.date"
      class="w-6 h-6 rounded-sm transition-colors"
      :class="colors[cell.level]"
      :title="`${cell.date}: ${cell.seen} frågor`"
    ></div>
  </div>
</template>
