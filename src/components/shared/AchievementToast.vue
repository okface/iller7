<script setup>
import { ref, watch } from 'vue'
import { ACHIEVEMENTS } from '@/utils/constants.js'

const props = defineProps({
  achievementId: String,
})

const show = ref(false)
const achievement = ref(null)

watch(() => props.achievementId, (id) => {
  if (!id) return
  achievement.value = ACHIEVEMENTS.find(a => a.id === id)
  if (!achievement.value) return
  show.value = true
  setTimeout(() => { show.value = false }, 3500)
})
</script>

<template>
  <Teleport to="body">
    <transition name="toast">
      <div v-if="show && achievement" class="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-fadeIn">
        <span class="text-2xl">🏆</span>
        <div>
          <div class="font-bold text-sm">{{ achievement.label }}</div>
          <div class="text-xs text-emerald-100">{{ achievement.desc }}</div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.3s ease-in; }
.toast-enter-from { opacity: 0; transform: translate(-50%, -20px); }
.toast-leave-to { opacity: 0; transform: translate(-50%, -20px); }
</style>
