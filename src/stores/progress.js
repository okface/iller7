import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { STORAGE_KEYS, ACHIEVEMENTS, SRS_BUCKETS, MASTERY_LEVELS } from '@/utils/constants.js'
import { todayStr } from '@/utils/dates.js'
import { newProgressEntry, recordAnswer as srsRecordAnswer, applyDecay } from '@/composables/useSRS.js'

export const useProgressStore = defineStore('progress', () => {
  // Reactive localStorage
  const progress = useStorage(STORAGE_KEYS.PROGRESS, {})
  const bookmarks = useStorage(STORAGE_KEYS.BOOKMARKS, [])
  const history = useStorage(STORAGE_KEYS.HISTORY, {
    days: {},
    streak: { current: 0, longest: 0, lastActiveDate: null },
    achievements: [],
    sessions: [],
  })

  // --- Progress ---
  function getProgress(questionId) {
    return progress.value[questionId] || newProgressEntry()
  }

  function recordAnswer(questionId, isCorrect) {
    const entry = getProgress(questionId)
    progress.value[questionId] = srsRecordAnswer(entry, isCorrect)

    // Update daily stats
    const today = todayStr()
    if (!history.value.days[today]) {
      history.value.days[today] = { seen: 0, correct: 0, sessions: 0 }
    }
    history.value.days[today].seen++
    if (isCorrect) history.value.days[today].correct++

    // Prune old days (keep 90)
    const dayKeys = Object.keys(history.value.days).sort()
    while (dayKeys.length > 90) {
      delete history.value.days[dayKeys.shift()]
    }
  }

  function runDecay() {
    applyDecay(progress.value)
  }

  // --- Streaks ---
  function updateStreak() {
    const today = todayStr()
    const s = history.value.streak
    if (s.lastActiveDate === today) return // already counted today

    // Check if yesterday was active
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    if (s.lastActiveDate === yesterdayStr) {
      s.current++
    } else if (s.lastActiveDate !== today) {
      s.current = 1  // streak broken, start fresh
    }

    s.lastActiveDate = today
    if (s.current > s.longest) s.longest = s.current

    // Check streak achievements
    checkAchievements()
  }

  const currentStreak = computed(() => {
    const s = history.value.streak
    if (s.lastActiveDate === todayStr()) return s.current
    // Check if yesterday — streak still alive but not yet counted today
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (s.lastActiveDate === yesterday.toISOString().slice(0, 10)) return s.current
    return 0
  })

  // --- Daily stats ---
  const todayStats = computed(() => {
    return history.value.days[todayStr()] || { seen: 0, correct: 0, sessions: 0 }
  })

  // --- Sessions ---
  function saveSession(session) {
    history.value.sessions.unshift(session)
    if (history.value.sessions.length > 20) history.value.sessions.pop()

    const today = todayStr()
    if (history.value.days[today]) {
      history.value.days[today].sessions++
    }

    updateStreak()
    checkAchievements()
  }

  // --- Achievements ---
  function checkAchievements() {
    const earned = new Set(history.value.achievements)
    const newAchievements = []

    // First session
    if (!earned.has('first_session') && history.value.sessions.length > 0) {
      newAchievements.push('first_session')
    }

    // Perfect 10
    if (!earned.has('perfect_10') && history.value.sessions.some(s => s.total >= 10 && s.correct === s.total)) {
      newAchievements.push('perfect_10')
    }

    // Streak achievements
    const streak = history.value.streak.current
    for (const days of [3, 7, 14, 30, 100]) {
      const id = `streak_${days}`
      if (!earned.has(id) && streak >= days) newAchievements.push(id)
    }

    // Total seen
    const totalSeen = Object.values(progress.value).reduce((s, p) => s + (p.totalSeen || 0), 0)
    for (const n of [100, 500]) {
      const id = `seen_${n}`
      if (!earned.has(id) && totalSeen >= n) newAchievements.push(id)
    }

    // Mastered count
    const mastered = Object.values(progress.value).filter(p => p.bucket === SRS_BUCKETS.MASTERED).length
    for (const n of [10, 50, 100]) {
      const id = `mastered_${n}`
      if (!earned.has(id) && mastered >= n) newAchievements.push(id)
    }

    if (newAchievements.length > 0) {
      history.value.achievements.push(...newAchievements)
    }

    return newAchievements
  }

  // --- Bookmarks ---
  function toggleBookmark(questionId) {
    const idx = bookmarks.value.indexOf(questionId)
    if (idx >= 0) bookmarks.value.splice(idx, 1)
    else bookmarks.value.push(questionId)
  }

  function isBookmarked(questionId) {
    return bookmarks.value.includes(questionId)
  }

  // --- Mastery ---
  function categoryMastery(questions) {
    if (questions.length === 0) return MASTERY_LEVELS[0]
    const advanced = questions.filter(q => {
      const p = progress.value[q.id]
      return p && p.bucket >= SRS_BUCKETS.REVIEWING
    }).length
    const ratio = advanced / questions.length
    return [...MASTERY_LEVELS].reverse().find(l => ratio >= l.min) || MASTERY_LEVELS[0]
  }

  // --- Stats ---
  const totalStats = computed(() => {
    let seen = 0, correct = 0, wrong = 0
    for (const p of Object.values(progress.value)) {
      seen += p.totalSeen || 0
      correct += p.totalCorrect || 0
      wrong += p.totalWrong || 0
    }
    return { seen, correct, wrong, accuracy: seen > 0 ? correct / seen : 0 }
  })

  return {
    progress, bookmarks, history,
    getProgress, recordAnswer, runDecay,
    updateStreak, currentStreak,
    todayStats, saveSession,
    checkAchievements, toggleBookmark, isBookmarked,
    categoryMastery, totalStats,
  }
})
