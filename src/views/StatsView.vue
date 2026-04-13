<script setup>
import { computed, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useProgressStore } from '@/stores/progress.js'
import { useContentStore } from '@/stores/content.js'
import { STORAGE_KEYS, ACHIEVEMENTS, SRS_BUCKETS } from '@/utils/constants.js'
import { getTopicDisplayName } from '@/utils/displayNames.js'
import StreakCalendar from '@/components/stats/StreakCalendar.vue'
import CategoryBreakdown from '@/components/stats/CategoryBreakdown.vue'

const progress = useProgressStore()
const content = useContentStore()
const selectedSubject = useStorage(STORAGE_KEYS.SUBJECT, null)
const darkMode = useStorage(STORAGE_KEYS.DARK_MODE, false)

onMounted(() => content.loadContent())

const total = computed(() => progress.totalStats)

// Achievements
const earned = computed(() => {
  return ACHIEVEMENTS.filter(a => progress.history.achievements?.includes(a.id))
})

// Bucket distribution
const bucketDist = computed(() => {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, unseen: 0 }
  const allQ = selectedSubject.value ? content.questionsForSubject(selectedSubject.value) : content.questions
  for (const q of allQ) {
    const p = progress.progress[q.id]
    if (!p || !p.totalSeen) dist.unseen++
    else dist[p.bucket] = (dist[p.bucket] || 0) + 1
  }
  return dist
})

// Category stats
const categoryStats = computed(() => {
  const subject = selectedSubject.value
  if (!subject) return []
  return content.topicsForSubject(subject).map(t => {
    const source = `${subject}/${t}`
    const qs = content.questionsForSources([source])
    let seen = 0, correct = 0
    for (const q of qs) {
      const p = progress.progress[q.id]
      if (p) { seen += p.totalSeen || 0; correct += p.totalCorrect || 0 }
    }
    return {
      name: getTopicDisplayName(t),
      total: qs.length,
      seen,
      accuracy: seen > 0 ? correct / seen : 0,
    }
  }).sort((a, b) => b.accuracy - a.accuracy)
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 pt-4 pb-4">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-extrabold">Statistik</h1>
      <button
        @click="darkMode = !darkMode"
        class="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-sm"
        aria-label="Växla mörkt läge"
      >
        {{ darkMode ? '☀️' : '🌙' }}
      </button>
    </div>

    <!-- Overview cards -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
        <div class="text-2xl font-bold">{{ total.seen }}</div>
        <div class="text-xs text-stone-500">Totalt svar</div>
      </div>
      <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
        <div class="text-2xl font-bold">{{ Math.round(total.accuracy * 100) }}%</div>
        <div class="text-xs text-stone-500">Träffsäkerhet</div>
      </div>
      <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
        <div class="text-2xl font-bold text-amber-600">{{ progress.currentStreak }}</div>
        <div class="text-xs text-stone-500">Nuvarande svit</div>
      </div>
      <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
        <div class="text-2xl font-bold text-amber-600">{{ progress.history?.streak?.longest || 0 }}</div>
        <div class="text-xs text-stone-500">Längsta svit</div>
      </div>
    </div>

    <!-- Streak calendar -->
    <h2 class="text-base font-bold mb-2">Aktivitet (30 dagar)</h2>
    <StreakCalendar :days="progress.history?.days || {}" class="mb-6" />

    <!-- Bucket distribution -->
    <h2 class="text-base font-bold mb-2">Kunskapsnivå</h2>
    <div class="flex gap-1 h-8 rounded-lg overflow-hidden mb-6">
      <div class="bg-rose-400" :style="{ flex: bucketDist[1] }" :title="`Ny/Fel: ${bucketDist[1]}`"></div>
      <div class="bg-amber-400" :style="{ flex: bucketDist[2] }" :title="`Lärande: ${bucketDist[2]}`"></div>
      <div class="bg-sky-400" :style="{ flex: bucketDist[3] }" :title="`Repetition: ${bucketDist[3]}`"></div>
      <div class="bg-indigo-400" :style="{ flex: bucketDist[4] }" :title="`Bekant: ${bucketDist[4]}`"></div>
      <div class="bg-emerald-400" :style="{ flex: bucketDist[5] }" :title="`Bemästrad: ${bucketDist[5]}`"></div>
      <div class="bg-stone-200 dark:bg-stone-700" :style="{ flex: bucketDist.unseen }" :title="`Osedd: ${bucketDist.unseen}`"></div>
    </div>
    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 mb-6">
      <span><span class="inline-block w-2.5 h-2.5 rounded-sm bg-rose-400 mr-1"></span>Ny/Fel ({{ bucketDist[1] }})</span>
      <span><span class="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400 mr-1"></span>Lärande ({{ bucketDist[2] }})</span>
      <span><span class="inline-block w-2.5 h-2.5 rounded-sm bg-sky-400 mr-1"></span>Repetition ({{ bucketDist[3] }})</span>
      <span><span class="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-400 mr-1"></span>Bekant ({{ bucketDist[4] }})</span>
      <span><span class="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400 mr-1"></span>Bemästrad ({{ bucketDist[5] }})</span>
      <span><span class="inline-block w-2.5 h-2.5 rounded-sm bg-stone-200 dark:bg-stone-700 mr-1"></span>Osedd ({{ bucketDist.unseen }})</span>
    </div>

    <!-- Category breakdown -->
    <h2 class="text-base font-bold mb-2">Per ämne</h2>
    <CategoryBreakdown :categories="categoryStats" class="mb-6" />

    <!-- Achievements -->
    <h2 class="text-base font-bold mb-2">Prestationer</h2>
    <div v-if="earned.length > 0" class="grid grid-cols-2 gap-2 mb-4">
      <div v-for="a in earned" :key="a.id" class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
        <div class="text-sm font-semibold">🏆 {{ a.label }}</div>
        <div class="text-xs text-stone-500">{{ a.desc }}</div>
      </div>
    </div>
    <p v-else class="text-sm text-stone-400 mb-4">Inga prestationer upplåsta ännu. Fortsätt studera!</p>
  </div>
</template>
