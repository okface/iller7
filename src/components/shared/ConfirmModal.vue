<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: 'Bekräfta' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Ja' },
  cancelText: { type: String, default: 'Avbryt' },
  danger: { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('cancel')"></div>
        <div class="relative bg-white dark:bg-stone-800 rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fadeIn">
          <h3 class="text-lg font-bold mb-2">{{ title }}</h3>
          <p class="text-stone-600 dark:text-stone-400 mb-6">{{ message }}</p>
          <div class="flex gap-3">
            <button
              @click="$emit('cancel')"
              class="flex-1 px-4 py-2.5 rounded-xl font-medium bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              @click="$emit('confirm')"
              class="flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition-colors"
              :class="danger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
