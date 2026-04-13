<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { useProgressStore } from '@/stores/progress.js'
import { useContentStore } from '@/stores/content.js'
import { useQuizStore } from '@/stores/quiz.js'
import { useConfetti } from '@/composables/useConfetti.js'
import { STORAGE_KEYS } from '@/utils/constants.js'
import ProgressRing from '@/components/shared/ProgressRing.vue'
import AnswerList from '@/components/review/AnswerList.vue'

const router = useRouter()
const progress = useProgressStore()
const content = useContentStore()
const quiz = useQuizStore()
const { celebrate, bigCelebration } = useConfetti()
const selectedSubject = useStorage(STORAGE_KEYS.SUBJECT, null)

// Get last session from history
const lastSession = computed(() => {
  const sessions = progress.history?.sessions
  return sessions && sessions.length > 0 ? sessions[0] : null
})

const score = computed(() => lastSession.value ? lastSession.value.correct : 0)
const total = computed(() => lastSession.value ? lastSession.value.total : 0)
const percentage = computed(() => total.value > 0 ? score.value / total.value : 0)
const isPerfect = computed(() => score.value === total.value && total.value > 0)

// Get the questions and answers for review
const reviewItems = computed(() => {
  if (!lastSession.value) return []
  return (lastSession.value.questionIds || []).map(qId => {
    const question = content.questionById(qId)
    const answer = lastSession.value.answers?.[qId]
    return { question, answer }
  }).filter(item => item.question)
})

const mistakes = computed(() => reviewItems.value.filter(item => item.answer && !item.answer.isCorrect))

onMounted(async () => {
  await content.loadContent()
  if (isPerfect.value) bigCelebration()
  else if (percentage.value >= 0.8) celebrate()
})

function retryMistakes() {
  if (mistakes.value.length === 0) return
  quiz.startSession({
    mode: 'multi',
    subject: lastSession.value?.subject || selectedSubject.value,
    questions: mistakes.value.map(m => m.question),
    count: mistakes.value.length,
  })
  router.push({ name: 'quiz' })
}

function backToDashboard() {
  const subject = lastSession.value?.subject || selectedSubject.value
  if (subject) {
    router.push({ name: 'dashboard', params: { subject } })
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 pt-8 pb-8">
    <!-- Score -->
    <div class="flex flex-col items-center mb-8">
      <ProgressRing
        :value="percentage"
        :size="120"
        :stroke-width="8"
        :color="isPerfect ? '#10B981' : percentage >= 0.7 ? '#4F46E5' : '#F43F5E'"
      />
      <div class="mt-4 text-center">
        <div class="text-3xl font-extrabold">{{ score }} / {{ total }}</div>
        <div class="text-sm text-stone-500 dark:text-stone-400 mt-1">
          {{ Math.round(percentage * 100) }}% rätt
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-3 mb-8">
      <button
        v-if="mistakes.length > 0"
        @click="retryMistakes"
        class="flex-1 py-3 rounded-xl font-semibold text-white bg-rose-500 hover:bg-rose-600 active:scale-[0.98] transition-all"
      >
        Träna fel ({{ mistakes.length }})
      </button>
      <button
        @click="backToDashboard"
        class="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
        :class="mistakes.length > 0 ? 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
      >
        Tillbaka
      </button>
    </div>

    <!-- Answer list -->
    <h2 class="text-base font-bold mb-3">Dina svar</h2>
    <AnswerList :items="reviewItems" />
  </div>
</template>
