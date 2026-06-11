<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
      <BarChart3 class="w-5 h-5 mr-2 text-blue-600" />
      学习统计
    </h3>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ stats.totalDays }}</div>
        <div class="text-sm text-gray-600">学习天数</div>
      </div>
      <div class="bg-green-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ stats.totalHours }}</div>
        <div class="text-sm text-gray-600">学习时长(h)</div>
      </div>
      <div class="bg-purple-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-purple-600">{{ stats.totalQuestions }}</div>
        <div class="text-sm text-gray-600">答题数量</div>
      </div>
      <div class="bg-orange-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-orange-600">{{ stats.accuracyRate }}%</div>
        <div class="text-sm text-gray-600">正确率</div>
      </div>
    </div>

    <div class="mb-6">
      <h4 class="font-semibold text-gray-700 mb-3">章节完成进度</h4>
      <div class="space-y-3">
        <div v-for="(chapter, index) in chapterProgress" :key="index" class="flex items-center">
          <span class="w-32 text-sm text-gray-600 truncate">{{ chapter.name }}</span>
          <div class="flex-1 mx-3 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              :style="{ width: chapter.progress + '%' }"
            ></div>
          </div>
          <span class="w-12 text-sm text-gray-600 text-right">{{ chapter.progress }}%</span>
        </div>
      </div>
    </div>

    <div>
      <h4 class="font-semibold text-gray-700 mb-3">最近7天学习记录</h4>
      <div class="flex items-end justify-between h-32 bg-gray-50 rounded-lg p-4">
        <div 
          v-for="(day, index) in weeklyStats" 
          :key="index"
          class="flex-1 flex flex-col items-center"
        >
          <div 
            class="w-8 rounded-t-md transition-all hover:opacity-80"
            :class="day.hours > 0 ? 'bg-blue-500' : 'bg-gray-200'"
            :style="{ height: (day.hours / maxDailyHours * 100) + '%', minHeight: day.hours > 0 ? '8px' : '4px' }"
          ></div>
          <span class="text-xs text-gray-500 mt-2">{{ day.day }}</span>
          <span class="text-xs text-gray-400">{{ day.hours }}h</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BarChart3 } from 'lucide-vue-next'

const stats = ref({
  totalDays: 0,
  totalHours: 0,
  totalQuestions: 0,
  accuracyRate: 0
})

const chapterProgress = ref([
  { name: '第一章', progress: 0 },
  { name: '第二章', progress: 0 },
  { name: '第三章', progress: 0 },
  { name: '第四章', progress: 0 }
])

const weeklyStats = ref([
  { day: '周一', hours: 0 },
  { day: '周二', hours: 0 },
  { day: '周三', hours: 0 },
  { day: '周四', hours: 0 },
  { day: '周五', hours: 0 },
  { day: '周六', hours: 0 },
  { day: '周日', hours: 0 }
])

const maxDailyHours = computed(() => {
  return Math.max(...weeklyStats.value.map(d => d.hours), 1)
})

onMounted(() => {
  loadStats()
})

const loadStats = () => {
  // 从localStorage加载统计数据
  const savedStats = localStorage.getItem('learning_stats')
  if (savedStats) {
    stats.value = JSON.parse(savedStats)
  }
  
  // 计算章节进度
  for (let i = 1; i <= 4; i++) {
    const chapterKey = `completed_topics_chapter${i}`
    const completedTopics = localStorage.getItem(chapterKey)
    if (completedTopics) {
      const completed = JSON.parse(completedTopics).length
      const totalTopics = [8, 5, 12, 3][i - 1]
      chapterProgress.value[i - 1].progress = Math.round((completed / totalTopics) * 100)
    }
  }
  
  // 加载最近7天学习记录
  const weeklyData = localStorage.getItem('weekly_learning')
  if (weeklyData) {
    const data = JSON.parse(weeklyData)
    weeklyStats.value = data
  }
}
</script>
