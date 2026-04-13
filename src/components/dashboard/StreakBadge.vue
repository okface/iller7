<script setup>
import { useProgressStore } from '@/stores/progress.js'
import { FireIcon } from '@heroicons/vue/24/solid'

const progress = useProgressStore()
</script>

<template>
  <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
    <FireIcon class="w-5 h-5 text-amber-500" />
    <span class="text-sm font-bold text-amber-700 dark:text-amber-300">{{ progress.currentStreak }}</span>
  </div>
</template>
