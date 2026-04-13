<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { useContentStore } from '@/stores/content.js'
import { useProgressStore } from '@/stores/progress.js'
import { useQuizStore } from '@/stores/quiz.js'
import { STORAGE_KEYS } from '@/utils/constants.js'
import { getSubjectDisplayName, getTopicDisplayName } from '@/utils/displayNames.js'
import StreakBadge from '@/components/dashboard/StreakBadge.vue'
import DailyStats from '@/components/dashboard/DailyStats.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import MasteryGrid from '@/components/dashboard/MasteryGrid.vue'
import CategoryPicker from '@/components/dashboard/CategoryPicker.vue'

const route = useRoute()
const router = useRouter()
const content = useContentStore()
const progress = useProgressStore()
const quiz = useQuizStore()
const selectedSubject = useStorage(STORAGE_KEYS.SUBJECT, null)
const showCategoryPicker = ref(false)

onMounted(async () => {
  await content.loadContent()
  progress.runDecay()
})

const subject = computed(() => route.params.subject || selectedSubject.value)

watch(subject, (val) => {
  if (val) selectedSubject.value = val
}, { immediate: true })

const subjectName = computed(() => getSubjectDisplayName(subject.value))
const multiSubject = computed(() => content.subjectList.length > 1)

const topics = computed(() => {
  return content.topicsForSubject(subject.value).map(t => {
    const source = `${subject.value}/${t}`
    const questions = content.questionsForSources([source])
    const mastery = progress.categoryMastery(questions)
    return { id: t, source, name: getTopicDisplayName(t), count: questions.length, mastery }
  })
})

const subjectQuestions = computed(() => content.questionsForSubject(subject.value))

function startQuick(count) {
  quiz.startSession({ mode: count === 5 ? 'quick5' : 'quick10', subject: subject.value, count })
  router.push({ name: 'quiz' })
}

function startFocus() {
  quiz.startSession({ mode: 'focus', subject: subject.value, count: 10 })
  router.push({ name: 'quiz' })
}

function startCategory(source) {
  quiz.startSession({ mode: 'category', subject: subject.value, sources: [source], count: 10 })
  router.push({ name: 'quiz' })
}

function startMulti(sources, count) {
  quiz.startSession({ mode: 'multi', subject: subject.value, sources, count })
  router.push({ name: 'quiz' })
}

function startExam() {
  router.push({ name: 'exam' })
}

function switchSubject() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 pt-4 pb-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-extrabold">{{ subjectName }}</h1>
        <button v-if="multiSubject" @click="switchSubject" class="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          Byt inriktning
        </button>
      </div>
      <StreakBadge />
    </div>

    <!-- Daily stats -->
    <DailyStats class="mb-5" />

    <!-- Quick actions -->
    <QuickActions
      :question-count="subjectQuestions.length"
      @quick5="startQuick(5)"
      @quick10="startQuick(10)"
      @focus="startFocus"
      class="mb-5"
    />

    <!-- Exam button -->
    <button
      @click="startExam"
      class="w-full py-3 rounded-xl font-semibold border-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors mb-6 active:scale-[0.98]"
    >
      Provläge
    </button>

    <!-- Category mastery -->
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-base font-bold">Ämnen</h2>
      <button @click="showCategoryPicker = true" class="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
        Välj flera
      </button>
    </div>
    <MasteryGrid :topics="topics" @select="startCategory" />

    <!-- Category picker modal -->
    <CategoryPicker
      v-if="showCategoryPicker"
      :topics="topics"
      :subject="subject"
      @close="showCategoryPicker = false"
      @start="startMulti"
    />
  </div>
</template>
