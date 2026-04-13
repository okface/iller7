import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useContentStore = defineStore('content', () => {
  const questions = ref([])
  const subjects = ref({})
  const loading = ref(false)
  const error = ref(null)

  const basePath = import.meta.env.BASE_URL || '/iller7/'
  const buildTag = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : Date.now()

  async function loadContent() {
    if (questions.value.length > 0) return // already loaded
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${basePath}content.json?v=${buildTag}`)
      if (!res.ok) throw new Error(`Failed to load content: ${res.status}`)
      const data = await res.json()
      subjects.value = data.subjects || {}
      questions.value = data.questions || []
    } catch (e) {
      error.value = e.message
      console.error('Content load error:', e)
    } finally {
      loading.value = false
    }
  }

  const subjectList = computed(() => Object.keys(subjects.value))

  function questionsForSubject(subject) {
    return questions.value.filter(q => q.source?.startsWith(subject + '/'))
  }

  function questionsForSources(sources) {
    const set = new Set(sources)
    return questions.value.filter(q => set.has(q.source))
  }

  function topicsForSubject(subject) {
    return subjects.value[subject] || []
  }

  function questionById(id) {
    return questions.value.find(q => q.id === id)
  }

  return {
    questions, subjects, loading, error,
    loadContent, subjectList, questionsForSubject,
    questionsForSources, topicsForSubject, questionById,
  }
})
