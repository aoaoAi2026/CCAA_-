<template>
  <Transition name="toast">
    <div
      v-if="toast.visible"
      class="fixed top-4 left-1/2 z-[9999] -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg font-medium text-sm"
      :class="{
        'bg-green-600 text-white': toast.type === 'success',
        'bg-red-600 text-white': toast.type === 'error',
        'bg-blue-600 text-white': toast.type === 'info',
        'bg-yellow-500 text-white': toast.type === 'warning'
      }"
    >
      {{ toast.message }}
    </div>
  </Transition>
</template>

<script setup>
import { useToastStore } from '../stores/index.js'
const toast = useToastStore()
</script>

<style scoped>
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translate(-50%, -12px); }
.toast-enter-active,
.toast-leave-active { transition: all 0.25s ease; }
</style>
