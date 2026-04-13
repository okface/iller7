<script setup>
defineProps({
  label: String,
})
</script>

<template>
  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
    {{ label }}
  </span>
</template>
