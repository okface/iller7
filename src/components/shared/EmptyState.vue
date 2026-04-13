<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, default: 'Inget här ännu' },
  message: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <span class="text-4xl mb-3">{{ icon }}</span>
    <h3 class="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-1">{{ title }}</h3>
    <p v-if="message" class="text-sm text-stone-500 dark:text-stone-400 max-w-xs">{{ message }}</p>
    <slot></slot>
  </div>
</template>
