<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress.js'

const progress = useProgressStore()
const today = computed(() => progress.todayStats)
const accuracy = computed(() => today.value.seen > 0 ? Math.round(today.value.correct / today.value.seen * 100) : 0)
const total = computed(() => progress.totalStats)
const totalAccuracy = computed(() => Math.round(total.value.accuracy * 100))
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
      <div class="text-2xl font-bold text-stone-600 dark:text-stone-300">{{ totalAccuracy }}%</div>
      <div class="text-xs text-stone-500 dark:text-stone-400">Totalt rätt</div>
    </div>
  </div>
</template>
