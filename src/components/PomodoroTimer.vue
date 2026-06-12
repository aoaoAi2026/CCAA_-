<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 flex items-center">
        <Timer class="w-5 h-5 mr-2 text-blue-600" />
        番茄钟专注学习
      </h3>
      <div class="flex space-x-1">
        <button 
          v-for="m in [25, 15, 5]" :key="m"
          @click="setDuration(m)"
          class="px-2 py-1 text-xs rounded transition"
          :class="duration === m ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >{{ m }}分</button>
      </div>
    </div>

    <div class="text-center py-4">
      <div class="text-5xl font-bold font-mono mb-4" :class="remaining <= 60 ? 'text-red-500 animate-pulse' : 'text-gray-800'">
        {{ formatTime(remaining) }}
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          class="h-2 rounded-full transition-all duration-1000"
          :class="isRunning ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300'"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <div class="flex justify-center space-x-3">
        <button 
          @click="toggleTimer"
          class="px-6 py-2 rounded-lg font-medium transition"
          :class="isRunning ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-blue-500 text-white hover:bg-blue-600'"
        >
          {{ isRunning ? '⏸ 暂停' : '▶ 开始' }}
        </button>
        <button 
          @click="resetTimer"
          class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
        >
          ↺ 重置
        </button>
      </div>
      <div v-if="sessionCount > 0" class="mt-3 text-xs text-gray-500">
        已完成 {{ sessionCount }} 个番茄钟 🍅
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Timer } from 'lucide-vue-next'

const duration = ref(25)
const remaining = ref(25 * 60)
const isRunning = ref(false)
const sessionCount = ref(parseInt(localStorage.getItem('pomodoro_count') || '0'))
let timer = null

const progress = computed(() => {
  const total = duration.value * 60
  return ((total - remaining.value) / total) * 100
})

function setDuration(m) {
  if (isRunning.value) return
  duration.value = m
  remaining.value = m * 60
}

function toggleTimer() {
  if (isRunning.value) {
    clearInterval(timer)
    timer = null
    isRunning.value = false
  } else {
    if (remaining.value <= 0) {
      remaining.value = duration.value * 60
    }
    isRunning.value = true
    timer = setInterval(() => {
      if (remaining.value > 0) {
        remaining.value--
      } else {
        clearInterval(timer)
        timer = null
        isRunning.value = false
        sessionCount.value++
        localStorage.setItem('pomodoro_count', String(sessionCount.value))
        // 播放提示 用 vibrate
        try { navigator.vibrate?.(200) } catch(e) {}
      }
    }, 1000)
  }
}

function resetTimer() {
  clearInterval(timer)
  timer = null
  isRunning.value = false
  remaining.value = duration.value * 60
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
