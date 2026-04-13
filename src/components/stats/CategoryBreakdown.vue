<script setup>
defineProps({ categories: Array })
</script>

<template>
  <div class="space-y-2">
    <div v-for="cat in categories" :key="cat.name">
      <div class="flex items-center justify-between text-sm mb-0.5">
        <span class="truncate mr-2">{{ cat.name }}</span>
        <span class="text-xs text-stone-500 flex-shrink-0">{{ Math.round(cat.accuracy * 100) }}%</span>
      </div>
      <div class="h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="cat.accuracy >= 0.7 ? 'bg-emerald-500' : cat.accuracy >= 0.4 ? 'bg-amber-500' : 'bg-rose-500'"
          :style="{ width: `${Math.round(cat.accuracy * 100)}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>
