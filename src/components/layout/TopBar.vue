<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineProps({
  title: { type: String, default: '' },
  progress: { type: Number, default: 0 },  // 0-1
  showProgress: { type: Boolean, default: false },
  showClose: { type: Boolean, default: true },
})

defineEmits(['close'])
</script>

<template>
  <div class="sticky top-0 z-40 bg-white/90 dark:bg-stone-950/90 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
    <div class="flex items-center justify-between px-4 h-12 max-w-2xl mx-auto">
      <button
        v-if="showClose"
        @click="$emit('close')"
        class="p-1.5 -ml-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        aria-label="Stäng"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
      <span v-else class="w-8"></span>

      <span class="text-sm font-medium text-stone-600 dark:text-stone-400">{{ title }}</span>

      <span class="w-8"></span>
    </div>

    <!-- Progress bar -->
    <div v-if="showProgress" class="h-1 bg-stone-100 dark:bg-stone-800">
      <div
        class="h-full bg-indigo-500 transition-all duration-300 ease-out rounded-r-full"
        :style="{ width: `${progress * 100}%` }"
      ></div>
    </div>
  </div>
</template>
