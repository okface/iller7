<script setup>
import { ref, computed, onMounted } from 'vue'
import { useContentStore } from '@/stores/content.js'
import { useProgressStore } from '@/stores/progress.js'
import { useStorage } from '@vueuse/core'
import { STORAGE_KEYS, SRS_BUCKETS } from '@/utils/constants.js'
import TagBadge from '@/components/shared/TagBadge.vue'
import { BookmarkIcon as BookmarkOutline } from '@heroicons/vue/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/vue/24/solid'

const content = useContentStore()
const progress = useProgressStore()
const selectedSubject = useStorage(STORAGE_KEYS.SUBJECT, null)

const search = ref('')
const filter = ref('all') // all, unseen, wrong, mastered, bookmarked
const expandedId = ref(null)

onMounted(() => content.loadContent())

const questions = computed(() => {
  let qs = selectedSubject.value
    ? content.questionsForSubject(selectedSubject.value)
    : content.questions

  // Filter
  if (filter.value === 'unseen') {
    qs = qs.filter(q => !progress.progress[q.id]?.totalSeen)
  } else if (filter.value === 'wrong') {
    qs = qs.filter(q => (progress.progress[q.id]?.totalWrong || 0) > 0)
  } else if (filter.value === 'mastered') {
    qs = qs.filter(q => progress.progress[q.id]?.bucket === SRS_BUCKETS.MASTERED)
  } else if (filter.value === 'bookmarked') {
    qs = qs.filter(q => progress.isBookmarked(q.id))
  }

  // Search
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    qs = qs.filter(item =>
      item.question.toLowerCase().includes(q) ||
      item.tags?.some(t => t.toLowerCase().includes(q))
    )
  }

  return qs.slice(0, 50) // Limit for performance
})

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id
}

const filters = [
  { value: 'all', label: 'Alla' },
  { value: 'unseen', label: 'Osedda' },
  { value: 'wrong', label: 'Fel' },
  { value: 'mastered', label: 'Bemästrade' },
  { value: 'bookmarked', label: 'Sparade' },
]
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 pt-4 pb-4">
    <h1 class="text-xl font-extrabold mb-4">Sök frågor</h1>

    <input
      v-model="search"
      type="text"
      placeholder="Sök i frågor och taggar..."
      class="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
    />

    <!-- Filter pills -->
    <div class="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-4 px-4">
      <button
        v-for="f in filters"
        :key="f.value"
        @click="filter = f.value"
        class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0"
        :class="filter === f.value ? 'bg-indigo-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'"
      >
        {{ f.label }}
      </button>
    </div>

    <p class="text-xs text-stone-400 mb-3">{{ questions.length }} frågor</p>

    <!-- Results -->
    <div class="space-y-2">
      <div
        v-for="q in questions"
        :key="q.id"
        class="rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden bg-white dark:bg-stone-800"
      >
        <button @click="toggle(q.id)" class="w-full p-3 text-left flex items-start gap-2">
          <div class="flex-1 min-w-0">
            <p class="text-sm leading-snug" :class="expandedId === q.id ? '' : 'line-clamp-2'">{{ q.question }}</p>
            <div class="flex gap-1 mt-1">
              <TagBadge v-for="t in q.tags?.slice(0, 2)" :key="t" :label="t" />
            </div>
          </div>
          <button
            @click.stop="progress.toggleBookmark(q.id)"
            class="p-1 flex-shrink-0"
            :aria-label="progress.isBookmarked(q.id) ? 'Ta bort bokmärke' : 'Bokmärk'"
          >
            <BookmarkSolid v-if="progress.isBookmarked(q.id)" class="w-5 h-5 text-indigo-500" />
            <BookmarkOutline v-else class="w-5 h-5 text-stone-400" />
          </button>
        </button>

        <!-- Expanded: show Q+A -->
        <div v-if="expandedId === q.id" class="px-3 pb-3 animate-fadeIn">
          <div class="space-y-1.5">
            <div
              v-for="(opt, i) in q.options"
              :key="i"
              class="p-2 rounded-lg text-sm"
              :class="opt.correct ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 font-medium' : 'bg-stone-50 dark:bg-stone-700/50'"
            >
              {{ ['A','B','C','D','E','F'][i] }}. {{ opt.text }}
            </div>
          </div>
          <div v-if="q.explanation" class="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-xs text-amber-800 dark:text-amber-200">
            {{ q.explanation }}
          </div>
        </div>
      </div>
    </div>

    <p v-if="questions.length === 0" class="text-center text-stone-400 py-8">Inga frågor hittades</p>
  </div>
</template>
