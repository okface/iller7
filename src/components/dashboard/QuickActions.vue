<script setup>
defineProps({ questionCount: Number })
defineEmits(['quick5', 'quick10', 'focus'])
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <button
      @click="$emit('quick5')"
      :disabled="questionCount < 5"
      class="py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.96] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      5Q
    </button>
    <button
      @click="$emit('quick10')"
      :disabled="questionCount < 10"
      class="py-4 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.96] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      10Q
    </button>
    <button
      @click="$emit('focus')"
      :disabled="questionCount < 5"
      class="py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.96] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Focus
    </button>
  </div>
</template>
