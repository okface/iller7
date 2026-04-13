<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress.js'

const props = defineProps({
  questions: { type: Array, default: () => [] },
})

const progress = useProgressStore()
const today = computed(() => progress.todayStats)
const accuracy = computed(() => today.value.seen > 0 ? Math.round(today.value.correct / today.value.seen * 100) : 0)

// % of available questions answered correctly at least once
const uniqueCorrectRatio = computed(() => {
  if (!props.questions.length) return 0
  const correct = props.questions.filter(q => (progress.progress[q.id]?.totalCorrect || 0) > 0).length
  return Math.round(correct / props.questions.length * 100)
})
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <div class="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
      <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ today.seen }}</div>
      <div class="text-xs text-stone-500 dark:text-stone-400">Idag</div>
    </div>
    <div class="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
      <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ accuracy }}%</div>
      <div class="text-xs text-stone-500 dark:text-stone-400">Idag rätt</div>
    </div>
    <div class="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
      <div class="text-2xl font-bold text-stone-600 dark:text-stone-300">{{ uniqueCorrectRatio }}%</div>
      <div class="text-xs text-stone-500 dark:text-stone-400">Totalt rätt</div>
    </div>
  </div>
</template>
