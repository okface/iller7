<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { useContentStore } from '@/stores/content.js'
import { useProgressStore } from '@/stores/progress.js'
import { STORAGE_KEYS } from '@/utils/constants.js'
import { getSubjectDisplayName } from '@/utils/displayNames.js'

const router = useRouter()
const content = useContentStore()
const progress = useProgressStore()
const selectedSubject = useStorage(STORAGE_KEYS.SUBJECT, null)

onMounted(async () => {
  await content.loadContent()
  // Auto-redirect if only one subject
  if (content.subjectList.length === 1) {
    selectSubject(content.subjectList[0])
  }
  // If previously selected subject, go there
  if (selectedSubject.value && content.subjectList.includes(selectedSubject.value)) {
    router.replace({ name: 'dashboard', params: { subject: selectedSubject.value } })
  }
})

const subjectCards = computed(() => {
  return content.subjectList.map(s => {
    const questions = content.questionsForSubject(s)
    const topics = content.topicsForSubject(s)
    const correctOnce = questions.filter(q => (progress.progress[q.id]?.totalCorrect || 0) > 0).length
    const uniqueCorrectRatio = questions.length > 0 ? Math.round(correctOnce / questions.length * 100) : 0
    return { id: s, name: getSubjectDisplayName(s), topicCount: topics.length, questionCount: questions.length, uniqueCorrectRatio }
  })
})

function selectSubject(subject) {
  selectedSubject.value = subject
  router.push({ name: 'dashboard', params: { subject } })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6">
    <h1 class="text-2xl font-extrabold mb-2">iller7</h1>
    <p class="text-stone-500 dark:text-stone-400 mb-8">Välj studieinriktning</p>

    <div class="grid grid-cols-1 gap-4 w-full max-w-md">
      <button
        v-for="s in subjectCards"
        :key="s.id"
        @click="selectSubject(s.id)"
        class="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-left hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all active:scale-[0.98]"
      >
        <h2 class="text-lg font-bold mb-1">{{ s.name }}</h2>
        <p class="text-sm text-stone-500 dark:text-stone-400">
          {{ s.topicCount }} ämnen · {{ s.questionCount }} frågor
        </p>
        <div class="mt-3 flex items-center gap-2">
          <div class="h-2 flex-1 rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden">
            <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: `${s.uniqueCorrectRatio}%` }"></div>
          </div>
          <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">{{ s.uniqueCorrectRatio }}% rätt</span>
        </div>
      </button>
    </div>
  </div>
</template>
