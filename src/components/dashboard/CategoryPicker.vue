<script setup>
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  topics: Array,
  subject: String,
})

const emit = defineEmits(['close', 'start'])

const selected = ref(new Set())
const count = ref(10)
const search = ref('')

const filtered = computed(() => {
  if (!search.value) return props.topics
  const q = search.value.toLowerCase()
  return props.topics.filter(t => t.name.toLowerCase().includes(q))
})

function toggle(source) {
  if (selected.value.has(source)) selected.value.delete(source)
  else selected.value.add(source)
}

function selectAll() {
  for (const t of filtered.value) selected.value.add(t.source)
}

function deselectAll() {
  selected.value.clear()
}

function start() {
  if (selected.value.size === 0) return
  emit('start', Array.from(selected.value), count.value)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')"></div>
      <div class="relative bg-white dark:bg-stone-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <h3 class="font-bold text-lg">Välj ämnen</h3>
          <button @click="emit('close')" class="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Search -->
        <div class="px-4 pt-3">
          <input
            v-model="search"
            type="text"
            placeholder="Sök ämne..."
            class="w-full px-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-700 border-0 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <!-- Select all / deselect -->
        <div class="flex gap-2 px-4 py-2 text-xs">
          <button @click="selectAll" class="text-indigo-600 dark:text-indigo-400 font-medium">Markera alla</button>
          <span class="text-stone-300">|</span>
          <button @click="deselectAll" class="text-stone-500">Avmarkera</button>
        </div>

        <!-- Topic list -->
        <div class="flex-1 overflow-y-auto px-4 pb-2">
          <button
            v-for="t in filtered"
            :key="t.id"
            @click="toggle(t.source)"
            class="w-full flex items-center justify-between p-3 rounded-lg mb-1.5 transition-colors text-left"
            :class="selected.has(t.source) ? 'bg-indigo-50 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-700' : 'bg-stone-50 dark:bg-stone-700/50 border border-transparent'"
          >
            <span class="text-sm font-medium">{{ t.name }}</span>
            <span class="text-xs text-stone-500">{{ t.count }}</span>
          </button>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-stone-200 dark:border-stone-700">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-sm text-stone-600 dark:text-stone-400">Antal frågor:</span>
            <div class="flex gap-2">
              <button
                v-for="n in [5, 10, 20]"
                :key="n"
                @click="count = n"
                class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                :class="count === n ? 'bg-indigo-600 text-white' : 'bg-stone-100 dark:bg-stone-700'"
              >
                {{ n }}
              </button>
            </div>
          </div>
          <button
            @click="start"
            :disabled="selected.size === 0"
            class="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Starta ({{ selected.size }} ämnen)
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
