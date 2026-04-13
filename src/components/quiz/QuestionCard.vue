<script setup>
import TagBadge from '@/components/shared/TagBadge.vue'
import { getTopicDisplayName, getSubjectDisplayName } from '@/utils/displayNames.js'
import { computed } from 'vue'

const props = defineProps({
  question: Object,
})

const subjectName = computed(() => {
  if (!props.question?.source) return ''
  const parts = props.question.source.split('/')
  return getSubjectDisplayName(parts[0])
})

const topicName = computed(() => {
  if (!props.question?.source) return ''
  const parts = props.question.source.split('/')
  return parts[1] ? getTopicDisplayName(parts[1]) : ''
})

const basePath = import.meta.env.BASE_URL || '/iller7/'

const imageUrl = computed(() => {
  if (!props.question?.image) return null
  return `${basePath}assets/${props.question.image}`
})
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-2 text-xs text-stone-500 dark:text-stone-400">
      <span class="font-medium">{{ subjectName }}</span>
      <span v-if="topicName">·</span>
      <span>{{ topicName }}</span>
    </div>

    <h2 class="text-lg font-semibold leading-snug mb-3">{{ question.question }}</h2>

    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="question.question"
      class="w-full max-h-64 object-contain rounded-xl bg-stone-100 dark:bg-stone-800 mb-3"
    />

    <div v-if="question.tags?.length" class="flex flex-wrap gap-1.5 mb-1">
      <TagBadge v-for="tag in question.tags" :key="tag" :label="tag" />
    </div>
  </div>
</template>
