<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  question: Object,
  selectedIndex: Number,
})

const revealedOptions = ref(new Set())
const revealedRefs = ref({})

function setRevealedRef(i, el) {
  if (el) revealedRefs.value[i] = el
}

function toggleOption(i) {
  if (i === props.selectedIndex) return
  if (props.question.options[i]?.correct) return
  if (revealedOptions.value.has(i)) {
    revealedOptions.value.delete(i)
  } else {
    revealedOptions.value.add(i)
    nextTick(() => {
      const el = revealedRefs.value[i]
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }
}
</script>

<template>
  <div class="animate-fadeIn">
    <!-- General explanation -->
    <div v-if="question.explanation" class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
      <p class="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Förklaring</p>
      <p class="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">{{ question.explanation }}</p>
    </div>

    <!-- Tap other options to reveal feedback -->
    <p class="text-xs text-stone-400 dark:text-stone-500 mt-3 mb-2">Tryck på andra alternativ för att se varför:</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(opt, i) in question.options"
        :key="i"
        @click="toggleOption(i)"
        :disabled="i === selectedIndex || opt.correct"
        class="text-xs px-3 py-1.5 rounded-lg border transition-colors"
        :class="(i === selectedIndex || opt.correct)
          ? 'border-stone-200 dark:border-stone-700 text-stone-400 cursor-default'
          : revealedOptions.has(i)
            ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
            : 'border-stone-300 dark:border-stone-600 hover:border-indigo-300'"
      >
        {{ ['A','B','C','D','E','F'][i] }}
      </button>
    </div>
    <div v-for="i in revealedOptions" :key="i" :ref="(el) => setRevealedRef(i, el)" class="mt-2 p-3 rounded-lg bg-stone-50 dark:bg-stone-800 text-sm animate-fadeIn">
      <span class="font-medium">{{ ['A','B','C','D','E','F'][i] }}:</span> {{ question.options[i]?.feedback }}
    </div>
  </div>
</template>
