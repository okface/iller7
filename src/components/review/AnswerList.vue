<script setup>
import { ref } from 'vue'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/solid'

defineProps({ items: Array })

const expandedIndex = ref(null)

function toggle(i) {
  expandedIndex.value = expandedIndex.value === i ? null : i
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="(item, i) in items"
      :key="i"
      class="rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden"
    >
      <button
        @click="toggle(i)"
        class="w-full flex items-center gap-3 p-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
      >
        <CheckCircleIcon v-if="item.answer?.isCorrect" class="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <XCircleIcon v-else class="w-5 h-5 text-rose-500 flex-shrink-0" />
        <span class="text-sm truncate flex-1">{{ item.question?.question }}</span>
        <span class="text-xs text-stone-400">{{ expandedIndex === i ? '\u25B2' : '\u25BC' }}</span>
      </button>

      <div v-if="expandedIndex === i" class="px-3 pb-3 animate-fadeIn">
        <div class="space-y-2 text-sm">
          <div v-for="(opt, oi) in item.question.options" :key="oi"
            class="p-2 rounded-lg"
            :class="{
              'bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700': opt.correct,
              'bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-700': item.answer?.selectedIndex === oi && !opt.correct,
              'bg-stone-50 dark:bg-stone-800': !opt.correct && item.answer?.selectedIndex !== oi,
            }"
          >
            <span class="font-medium">{{ ['A','B','C','D','E','F'][oi] }}:</span> {{ opt.text }}
            <p v-if="opt.correct || item.answer?.selectedIndex === oi" class="text-xs mt-0.5 opacity-75">{{ opt.feedback }}</p>
          </div>
        </div>
        <div v-if="item.question.explanation" class="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-xs text-amber-800 dark:text-amber-200">
          {{ item.question.explanation }}
        </div>
      </div>
    </div>
  </div>
</template>
