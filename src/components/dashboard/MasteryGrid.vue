<script setup>
defineProps({ topics: Array })
defineEmits(['select'])

const masteryColors = {
  stone: 'border-stone-300 dark:border-stone-600',
  amber: 'border-amber-400 dark:border-amber-600',
  slate: 'border-slate-400 dark:border-slate-500',
  yellow: 'border-yellow-400 dark:border-yellow-500',
}
</script>

<template>
  <div class="grid grid-cols-2 gap-2.5">
    <button
      v-for="t in topics"
      :key="t.id"
      @click="$emit('select', t.source)"
      class="p-3 rounded-xl bg-white dark:bg-stone-800 border-2 text-left hover:shadow-sm active:scale-[0.98] transition-all"
      :class="masteryColors[t.mastery.color] || masteryColors.stone"
    >
      <div class="text-sm font-semibold truncate">{{ t.name }}</div>
      <div class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{{ t.count }} frågor</div>
      <div class="text-xs font-medium mt-1" :class="`text-${t.mastery.color}-600 dark:text-${t.mastery.color}-400`">
        {{ t.mastery.name }}
      </div>
    </button>
  </div>
</template>
