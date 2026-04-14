<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz.js'
import { useContentStore } from '@/stores/content.js'
import { useProgressStore } from '@/stores/progress.js'
import { useKeyboard } from '@/composables/useKeyboard.js'
import { useSwipe } from '@/composables/useSwipe.js'
import TopBar from '@/components/layout/TopBar.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import QuestionCard from '@/components/quiz/QuestionCard.vue'
import OptionButton from '@/components/quiz/OptionButton.vue'
import ExplanationPanel from '@/components/quiz/ExplanationPanel.vue'
import { BookmarkIcon as BookmarkOutline } from '@heroicons/vue/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/vue/24/solid'

const router = useRouter()
const quiz = useQuizStore()
const content = useContentStore()
const progressStore = useProgressStore()
const showQuitModal = ref(false)
const quizContainer = ref(null)
const selectedIdx = ref(null)
const previewedIndices = ref(new Set())
const explanationRef = ref(null)

onMounted(async () => {
  if (!content.questions.length) await content.loadContent()
  if (!quiz.active) {
    router.replace({ name: 'home' })
    return
  }
})

const progress = computed(() => quiz.session.length > 0 ? (quiz.currentIndex + 1) / quiz.session.length : 0)
const progressLabel = computed(() => `${quiz.currentIndex + 1} / ${quiz.session.length}`)

const q = computed(() => quiz.currentQuestion)
const answered = computed(() => quiz.answeredCurrent)

function selectOption(index) {
  if (!q.value) return
  if (answered.value) {
    // After answering, toggle preview of this option's explanation
    if (previewedIndices.value.has(index)) {
      previewedIndices.value.delete(index)
    } else {
      previewedIndices.value.add(index)
    }
    return
  }
  selectedIdx.value = index
  const option = q.value.options[index]
  quiz.answerQuestion(q.value.id, index, option.correct)
  // Scroll down to show explanation
  nextTick(() => {
    if (explanationRef.value) {
      explanationRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  })
}

function goNext() {
  if (!answered.value) return
  selectedIdx.value = null
  previewedIndices.value.clear()
  if (quiz.isLastQuestion) {
    quiz.endSession()
    router.replace({ name: 'review' })
  } else {
    quiz.nextQuestion()
  }
}

function confirmQuit() {
  quiz.endSession()
  router.replace({ name: 'review' })
}

// Keyboard shortcuts
useKeyboard({
  'a': () => selectOption(0),
  'b': () => selectOption(1),
  'c': () => selectOption(2),
  'd': () => selectOption(3),
  '1': () => selectOption(0),
  '2': () => selectOption(1),
  '3': () => selectOption(2),
  '4': () => selectOption(3),
  'enter': () => goNext(),
  ' ': () => goNext(),
  'Escape': () => { if (answered.value || quiz.currentIndex > 0) showQuitModal.value = true },
})

// Swipe
useSwipe(quizContainer, {
  onSwipeLeft: () => { if (answered.value) goNext() },
})

// Scroll to top on new question
watch(() => quiz.currentIndex, () => {
  nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
})
</script>

<template>
  <div ref="quizContainer" class="min-h-screen pb-24">
    <TopBar
      :title="progressLabel"
      :progress="progress"
      show-progress
      @close="showQuitModal = true"
    />

    <div v-if="q" class="max-w-2xl mx-auto px-4 pt-4">
      <div class="flex items-start gap-2">
        <div class="flex-1">
          <QuestionCard :question="q" />
        </div>
        <button
          @click="progressStore.toggleBookmark(q.id)"
          class="flex-shrink-0 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors mt-1"
          :aria-label="progressStore.isBookmarked(q.id) ? 'Ta bort bokmärke' : 'Spara fråga'"
        >
          <BookmarkSolid v-if="progressStore.isBookmarked(q.id)" class="w-5 h-5 text-amber-500" />
          <BookmarkOutline v-else class="w-5 h-5 text-stone-400" />
        </button>
      </div>

      <div class="mt-4 space-y-3">
        <OptionButton
          v-for="(opt, i) in q.options"
          :key="i"
          :index="i"
          :option="opt"
          :selected="selectedIdx === i"
          :answered="answered"
          :show-result="answered"
          :previewed="previewedIndices.has(i)"
          @select="selectOption(i)"
        />
      </div>

      <div ref="explanationRef">
        <ExplanationPanel v-if="answered" :question="q" :selected-index="selectedIdx" class="mt-4" />
      </div>

      <!-- Next / Finish button -->
      <div v-if="answered" class="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-stone-950/90 backdrop-blur-sm border-t border-stone-200 dark:border-stone-800">
        <button
          @click="goNext"
          class="w-full max-w-2xl mx-auto block py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all"
        >
          {{ quiz.isLastQuestion ? 'Se resultat' : 'Nästa fråga' }}
        </button>
      </div>
    </div>

    <ConfirmModal
      :show="showQuitModal"
      title="Avsluta quiz?"
      message="Din framsteg i denna session sparas."
      confirm-text="Avsluta"
      cancel-text="Fortsätt"
      danger
      @confirm="confirmQuit"
      @cancel="showQuitModal = false"
    />
  </div>
</template>
