<template>
  <div v-if="active" class="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    <div
      v-for="n in 30"
      :key="n"
      class="confetti-piece absolute"
      :style="{
        left: Math.random() * 100 + '%',
        top: -10 + 'px',
        width: randSize + 'px',
        height: randSize * 0.6 + 'px',
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDuration: (Math.random() * 2 + 1.5) + 's',
        animationDelay: (Math.random() * 0.5) + 's',
        transform: 'rotate(' + (Math.random() * 360) + 'deg)',
        borderRadius: Math.random() > 0.5 ? '50%' : '2px'
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ active: Boolean })
const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b9d', '#c44dff', '#ff9f43']

const randSize = Math.floor(Math.random() * 8) + 6

const emit = defineEmits(['done'])
watch(() => props.active, (val) => {
  if (val) {
    setTimeout(() => emit('done'), 3500)
  }
})
</script>

<style scoped>
.confetti-piece {
  animation: confetti-fall linear forwards;
}
@keyframes confetti-fall {
  0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
  100% { opacity: 0; transform: translateY(100vh) rotate(720deg) scale(0.5); }
}
</style>
