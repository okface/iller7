<script setup>
import { computed, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useStorage } from '@vueuse/core'
import BottomNav from '@/components/layout/BottomNav.vue'
import { STORAGE_KEYS } from '@/utils/constants.js'

const route = useRoute()
const darkMode = useStorage(STORAGE_KEYS.DARK_MODE, false)

// Apply dark class to html element
watchEffect(() => {
  document.documentElement.classList.toggle('dark', darkMode.value)
})

const hideNav = computed(() => ['quiz', 'exam', 'review'].includes(route.name))
</script>

<template>
  <div class="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <BottomNav v-if="!hideNav" />
    <!-- Spacer for bottom nav -->
    <div v-if="!hideNav" class="h-18"></div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
