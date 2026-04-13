import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useContentStore } from './content.js'
import { useProgressStore } from './progress.js'
import { selectSRS, selectFocus } from '@/composables/useSRS.js'
import { shuffle } from '@/utils/random.js'

export const useQuizStore = defineStore('quiz', () => {
  const content = useContentStore()
  const progressStore = useProgressStore()

  const session = ref([])       // array of question objects
  const currentIndex = ref(0)
  const answers = ref({})       // { questionId: { selectedIndex, isCorrect } }
  const mode = ref(null)        // 'quick5', 'quick10', 'focus', 'category', 'multi', 'exam'
  const active = ref(false)
  const sessionSubject = ref(null)

  const currentQuestion = computed(() => session.value[currentIndex.value] || null)
  const isLastQuestion = computed(() => currentIndex.value >= session.value.length - 1)
  const answeredCurrent = computed(() => {
    const q = currentQuestion.value
    return q ? q.id in answers.value : false
  })
  const sessionScore = computed(() => {
    const correct = Object.values(answers.value).filter(a => a.isCorrect).length
    return { correct, total: Object.keys(answers.value).length }
  })

  function startSession(opts) {
    // opts: { mode, subject, sources?, count?, questions? }
    mode.value = opts.mode
    sessionSubject.value = opts.subject
    answers.value = {}
    currentIndex.value = 0

    let candidates
    if (opts.questions) {
      candidates = opts.questions
    } else if (opts.sources && opts.sources.length > 0) {
      candidates = content.questionsForSources(opts.sources)
    } else {
      candidates = content.questionsForSubject(opts.subject)
    }

    const count = opts.count || (opts.mode === 'quick5' ? 5 : 10)

    if (opts.mode === 'focus') {
      session.value = selectFocus(candidates, progressStore.progress, count)
    } else {
      session.value = selectSRS(candidates, progressStore.progress, count)
    }

    // Shuffle options for each question
    session.value = session.value.map(q => ({
      ...q,
      options: shuffle(q.options),
    }))

    active.value = true
  }

  function answerQuestion(questionId, selectedIndex, isCorrect) {
    answers.value[questionId] = { selectedIndex, isCorrect }
    progressStore.recordAnswer(questionId, isCorrect)
  }

  function nextQuestion() {
    if (currentIndex.value < session.value.length - 1) {
      currentIndex.value++
    }
  }

  function endSession() {
    const result = {
      date: Date.now(),
      subject: sessionSubject.value,
      mode: mode.value,
      total: session.value.length,
      correct: sessionScore.value.correct,
      answers: { ...answers.value },
      questionIds: session.value.map(q => q.id),
    }
    progressStore.saveSession(result)
    active.value = false
    return result
  }

  function resetSession() {
    session.value = []
    currentIndex.value = 0
    answers.value = {}
    mode.value = null
    active.value = false
  }

  return {
    session, currentIndex, answers, mode, active, sessionSubject,
    currentQuestion, isLastQuestion, answeredCurrent, sessionScore,
    startSession, answerQuestion, nextQuestion, endSession, resetSession,
  }
})
