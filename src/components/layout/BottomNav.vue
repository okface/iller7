<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { STORAGE_KEYS } from '@/utils/constants.js'
import {
  HomeIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
} from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()
const selectedSubject = useStorage(STORAGE_KEYS.SUBJECT, null)

const tabs = [
  { name: 'Studera', route: 'dashboard', icon: HomeIcon, iconActive: HomeIconSolid, param: true },
  { name: 'Statistik', route: 'stats', icon: ChartBarIcon, iconActive: ChartBarIconSolid },
  { name: 'Sök', route: 'search', icon: MagnifyingGlassIcon, iconActive: MagnifyingGlassIconSolid },
]

function isActive(tab) {
  if (tab.route === 'dashboard') return ['dashboard', 'home'].includes(route.name)
  return route.name === tab.route
}

function navigate(tab) {
  if (tab.route === 'dashboard' && selectedSubject.value) {
    router.push({ name: 'dashboard', params: { subject: selectedSubject.value } })
  } else if (tab.route === 'dashboard') {
    router.push({ name: 'home' })
  } else {
    router.push({ name: tab.route })
  }
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 safe-bottom">
    <div class="max-w-lg mx-auto flex justify-around items-center h-16">
      <button
        v-for="tab in tabs"
        :key="tab.route"
        @click="navigate(tab)"
        class="flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors"
        :class="isActive(tab) ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-stone-500'"
        :aria-label="tab.name"
        :aria-current="isActive(tab) ? 'page' : undefined"
      >
        <component :is="isActive(tab) ? tab.iconActive : tab.icon" class="w-6 h-6" />
        <span class="text-xs font-medium">{{ tab.name }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
