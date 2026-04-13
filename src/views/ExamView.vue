<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { useContentStore } from '@/stores/content.js'
import { useProgressStore } from '@/stores/progress.js'
import { selectSRS } from '@/composables/useSRS.js'
import { shuffle } from '@/utils/random.js'
import { STORAGE_KEYS } from '@/utils/constants.js'
import { useKeyboard } from '@/composables/useKeyboard.js'
import { useConfetti } from '@/composables/useConfetti.js'
import TopBar from '@/components/layout/TopBar.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import ProgressRing from '@/components/shared/ProgressRing.vue'

const router = useRouter()
const content = useContentStore()
const progress = useProgressStore()
const selectedSubject = useStorage(STORAGE_KEYS.SUBJECT, null)
const { celebrate } = useConfetti()

// Config state
const phase = ref('config') // config | exam | results
const questionCount = ref(20)
const timerEnabled = ref(false)
const timerMinutes = ref(30)
const passThreshold = ref(70)

// Exam state
const questions = ref([])
const currentIndex = ref(0)
const answers = ref({}) // { qId: selectedIndex }
const timeLeft = ref(0)
let timerInterval = null

const showQuitModal = ref(false)

onMounted(() => content.loadContent())

const currentQ = computed(() => questions.value[currentIndex.value])
const examProgress = computed(() => questions.value.length > 0 ? (currentIndex.value + 1) / questions.value.length : 0)

// Results
const score = computed(() => {
  let correct = 0
  for (const [qId, idx] of Object.entries(answers.value)) {
    const q = questions.value.find(x => x.id === qId)
    if (q && q.options[idx]?.correct) correct++
  }
  return correct
})
const percentage = computed(() => questions.value.length > 0 ? Math.round(score.value / questions.value.length * 100) : 0)
const passed = computed(() => percentage.value >= passThreshold.value)

function startExam() {
  const candidates = content.questionsForSubject(selectedSubject.value)
  if (candidates.length < questionCount.value) {
    questionCount.value = candidates.length
  }
  const selected = selectSRS(candidates, progress.progress, questionCount.value)
  questions.value = selected.map(q => ({ ...q, options: shuffle(q.options) }))
  answers.value = {}
  currentIndex.value = 0
  phase.value = 'exam'

  if (timerEnabled.value) {
    timeLeft.value = timerMinutes.value * 60
    timerInterval = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) finishExam()
    }, 1000)
  }
}

function selectOption(idx) {
  if (!currentQ.value) return
  answers.value[currentQ.value.id] = idx
}

function nextQuestion() {
  if (currentQ.value && !(currentQ.value.id in answers.value)) return // must answer
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  } else {
    finishExam()
  }
}

function finishExam() {
  if (timerInterval) clearInterval(timerInterval)

  // Record all answers to progress
  for (const [qId, idx] of Object.entries(answers.value)) {
    const q = questions.value.find(x => x.id === qId)
    if (q) {
      progress.recordAnswer(qId, q.options[idx]?.correct || false)
    }
  }

  // Save session
  const sessionAnswers = {}
  for (const [qId, idx] of Object.entries(answers.value)) {
    const q = questions.value.find(x => x.id === qId)
    sessionAnswers[qId] = { selectedIndex: idx, isCorrect: q?.options[idx]?.correct || false }
  }
  progress.saveSession({
    date: Date.now(),
    subject: selectedSubject.value,
    mode: 'exam',
    total: questions.value.length,
    correct: score.value,
    answers: sessionAnswers,
    questionIds: questions.value.map(q => q.id),
  })

  // Check exam achievement
  if (passed.value && !progress.history.achievements?.includes('exam_pass')) {
    progress.history.achievements.push('exam_pass')
  }

  phase.value = 'results'
  if (passed.value) celebrate()
}

function goBack() {
  if (timerInterval) clearInterval(timerInterval)
  const subject = selectedSubject.value
  if (subject) router.push({ name: 'dashboard', params: { subject } })
  else router.push({ name: 'home' })
}

const timerDisplay = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

useKeyboard({
  'a': () => selectOption(0),
  'b': () => selectOption(1),
  'c': () => selectOption(2),
  'd': () => selectOption(3),
  '1': () => selectOption(0),
  '2': () => selectOption(1),
  '3': () => selectOption(2),
  '4': () => selectOption(3),
  'enter': () => nextQuestion(),
  ' ': () => nextQuestion(),
})

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })
</script>

<template>
  <div class="min-h-screen">
    <!-- CONFIG -->
    <div v-if="phase === 'config'" class="max-w-md mx-auto px-4 pt-12 pb-8">
      <h1 class="text-2xl font-extrabold mb-2 text-center">Provläge</h1>
      <p class="text-sm text-stone-500 dark:text-stone-400 text-center mb-8">Simulera ett prov — ingen feedback under tiden</p>

      <div class="space-y-6">
        <div>
          <label class="text-sm font-medium mb-2 block">Antal frågor</label>
          <div class="flex gap-2">
            <button v-for="n in [20, 40, 60]" :key="n" @click="questionCount = n"
              class="flex-1 py-3 rounded-xl font-semibold transition-colors"
              :class="questionCount === n ? 'bg-indigo-600 text-white' : 'bg-stone-100 dark:bg-stone-800'"
            >{{ n }}</button>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="timerEnabled" class="w-5 h-5 rounded accent-indigo-600" />
            <span class="text-sm font-medium">Tidsbegränsning</span>
          </label>
          <div v-if="timerEnabled" class="mt-2 flex items-center gap-2">
            <input v-model.number="timerMinutes" type="number" min="5" max="120" class="w-20 px-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-sm text-center" />
            <span class="text-sm text-stone-500">minuter</span>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium mb-1 block">Godkäntgräns: {{ passThreshold }}%</label>
          <input v-model.number="passThreshold" type="range" min="50" max="90" step="5" class="w-full accent-indigo-600" />
        </div>

        <button @click="startExam" class="w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all">
          Starta prov
        </button>
        <button @click="goBack" class="w-full py-3 rounded-xl font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
          Tillbaka
        </button>
      </div>
    </div>

    <!-- EXAM -->
    <div v-else-if="phase === 'exam'" class="pb-24">
      <TopBar
        :title="timerEnabled ? timerDisplay : `${currentIndex + 1} / ${questions.length}`"
        :progress="examProgress"
        show-progress
        @close="showQuitModal = true"
      />

      <div v-if="currentQ" class="max-w-2xl mx-auto px-4 pt-4">
        <h2 class="text-lg font-semibold leading-snug mb-4">{{ currentQ.question }}</h2>

        <div class="space-y-3">
          <button
            v-for="(opt, i) in currentQ.options" :key="i"
            @click="selectOption(i)"
            class="w-full flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all text-left"
            :class="answers[currentQ.id] === i
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
              : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-indigo-300'"
          >
            <span class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              :class="answers[currentQ.id] === i ? 'bg-indigo-500 text-white' : 'bg-stone-100 dark:bg-stone-700'">
              {{ ['A','B','C','D','E','F'][i] }}
            </span>
            <span class="pt-0.5">{{ opt.text }}</span>
          </button>
        </div>

        <div class="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-stone-950/90 backdrop-blur-sm border-t border-stone-200 dark:border-stone-800">
          <button @click="nextQuestion"
            :disabled="!(currentQ.id in answers)"
            class="w-full max-w-2xl mx-auto block py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-all">
            {{ currentIndex >= questions.length - 1 ? 'Avsluta prov' : 'Nästa' }}
          </button>
        </div>
      </div>

      <ConfirmModal
        :show="showQuitModal"
        title="Avbryt prov?"
        message="Alla svar sparas och provet avslutas."
        confirm-text="Avsluta"
        cancel-text="Fortsätt"
        danger
        @confirm="() => { finishExam(); showQuitModal = false }"
        @cancel="showQuitModal = false"
      />
    </div>

    <!-- RESULTS -->
    <div v-else-if="phase === 'results'" class="max-w-2xl mx-auto px-4 pt-8 pb-8">
      <div class="flex flex-col items-center mb-8">
        <ProgressRing :value="percentage / 100" :size="120" :stroke-width="8" :color="passed ? '#10B981' : '#F43F5E'" />
        <div class="mt-4 text-center">
          <div class="text-3xl font-extrabold">{{ score }} / {{ questions.length }}</div>
          <div class="text-lg font-bold mt-1" :class="passed ? 'text-emerald-600' : 'text-rose-600'">
            {{ passed ? 'Godkänd!' : 'Ej godkänd' }}
          </div>
          <div class="text-sm text-stone-500 mt-1">{{ percentage }}% (gräns: {{ passThreshold }}%)</div>
        </div>
      </div>

      <button @click="goBack" class="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all">
        Tillbaka
      </button>
    </div>
  </div>
</template>
