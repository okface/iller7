<script setup>
import { computed } from 'vue'

const props = defineProps({
  index: Number,
  option: Object,
  selected: Boolean,
  answered: Boolean,
  showResult: Boolean,
  previewed: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const letters = ['A', 'B', 'C', 'D', 'E', 'F']

const classes = computed(() => {
  if (!props.answered) {
    return 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-indigo-300 dark:hover:border-indigo-600 active:scale-[0.98]'
  }
  if (props.option.correct) {
    return 'bg-emerald-50 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-600'
  }
  if (props.selected && !props.option.correct) {
    return 'bg-rose-50 dark:bg-rose-950 border-rose-400 dark:border-rose-600 animate-shake'
  }
  if (props.previewed) {
    return 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-600 cursor-pointer'
  }
  return 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 opacity-50 cursor-pointer hover:opacity-80'
})

const letterClasses = computed(() => {
  if (!props.answered) return 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
  if (props.option.correct) return 'bg-emerald-500 text-white'
  if (props.selected) return 'bg-rose-500 text-white'
  if (props.previewed) return 'bg-indigo-500 text-white'
  return 'bg-stone-100 dark:bg-stone-700 text-stone-400'
})

const showFeedback = computed(() => props.answered && (props.selected || props.option.correct || props.previewed))
</script>

<template>
  <button
    @click="emit('select', index)"
    class="w-full flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left"
    :class="classes"
    :aria-label="`Alternativ ${letters[index]}: ${option.text}`"
  >
    <span
      class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
      :class="letterClasses"
    >
      {{ letters[index] }}
    </span>
    <div class="flex-1 pt-0.5">
      <span class="text-base leading-snug">{{ option.text }}</span>
      <p
        v-if="showFeedback"
        class="text-sm mt-1 animate-fadeIn"
        :class="option.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'"
      >
        {{ option.feedback }}
      </p>
    </div>
  </button>
</template>
