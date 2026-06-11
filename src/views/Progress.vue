<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">我的学习进度</h1>
        <p class="text-gray-600">查看学习数据、完成情况和个人徽章</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
          <div class="text-sm opacity-80">等级</div>
          <div class="text-4xl font-bold mt-2">Lv.{{ user?.level || 1 }}</div>
          <div class="text-xs opacity-80 mt-2">{{ nextLevelPct }}% 距离下一级</div>
        </div>
        <div class="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
          <div class="text-sm opacity-80">总积分</div>
          <div class="text-4xl font-bold mt-2">{{ user?.total_points || 0 }}</div>
          <div class="text-xs opacity-80 mt-2">完成知识点与答题获得</div>
        </div>
        <div class="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg">
          <div class="text-sm opacity-80">已完成知识点</div>
          <div class="text-4xl font-bold mt-2">{{ summary?.completedTopics || 0 }}</div>
          <div class="text-xs opacity-80 mt-2">总计 {{ totalTopics }} 个知识点</div>
        </div>
        <div class="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg">
          <div class="text-sm opacity-80">错题本</div>
          <div class="text-4xl font-bold mt-2">{{ summary?.wrongCount || 0 }}</div>
          <router-link to="/wrong-notebook" class="mt-2 inline-block text-xs underline opacity-90">去查看 →</router-link>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">章节完成情况</h2>
        <div class="space-y-4">
          <div
            v-for="chapter in courseData.chapters"
            :key="chapter.id"
            class="border rounded-xl p-4 hover:shadow-sm transition"
          >
            <div class="flex items-center justify-between mb-2">
              <div>
                <div class="font-medium text-gray-800">{{ chapter.name }}</div>
                <div class="text-xs text-gray-500">{{ chapter.topics?.length || 10 }} 个知识点</div>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm font-semibold text-blue-600">
                  {{ getChapterCompleted(chapter.id) }} / {{ chapter.topics?.length || 10 }}
                </span>
                <button
                  @click="router.push(`/knowledge/${chapter.id}`)"
                  class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >继续学习</button>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                :style="{ width: getChapterPct(chapter.id) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl shadow p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">获得的徽章</h2>
          <div v-if="!achievements.length" class="text-sm text-gray-500 py-8 text-center">
            暂无徽章，继续学习解锁成就吧！
          </div>
          <div v-else class="grid grid-cols-3 gap-3">
            <div
              v-for="badge in achievements"
              :key="badge.badge_key || badge.id"
              class="p-4 border-2 rounded-xl text-center bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200"
            >
              <div class="text-3xl mb-2">🏆</div>
              <div class="text-sm font-medium text-gray-800">{{ badge.badge_name }}</div>
              <div v-if="badge.description" class="text-xs text-gray-500 mt-1">{{ badge.description }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">最近学习会话</h2>
          <div v-if="!sessions.length" class="text-sm text-gray-500 py-8 text-center">
            还没有学习记录，开始你的第一次学习吧！
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="s in sessions"
              :key="s.session_date"
              class="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div class="text-sm text-gray-700">{{ s.session_date }}</div>
              <div class="text-sm text-blue-600">{{ s.duration_minutes }} 分钟</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mt-6">
        <LearningStats />
        <LearningNotes />
      </div>

      <div class="mt-8 text-center">
        <button
          @click="refresh"
          :disabled="loading"
          class="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
        >
          <RefreshCw v-if="loading" class="inline w-4 h-4 mr-2 animate-spin" />
          <span v-else>刷新数据</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshCw } from 'lucide-vue-next'
import { useAuthStore, useProgressStore } from '../stores/index.js'
import { courseData } from '../data/courseData'
import { achievementApi, sessionApi } from '../utils/request.js'
import LearningStats from '../components/LearningStats.vue'
import LearningNotes from '../components/LearningNotes.vue'

const router = useRouter()
const auth = useAuthStore()
const progressStore = useProgressStore()

const summary = ref({ completedTopics: 0, wrongCount: 0, badges: 0, total_points: 0 })
const chapterStatsMap = ref({})
const achievements = ref([])
const sessions = ref([])
const loading = ref(false)

const user = computed(() => auth.user)
const totalTopics = computed(() =>
  courseData.chapters.reduce((sum, c) => sum + (c.topics?.length || 10), 0)
)
const nextLevelPct = computed(() => {
  const points = user.value?.total_points || 0
  const currentLv = user.value?.level || 1
  const nextLvStart = currentLv * 100
  const thisLvStart = (currentLv - 1) * 100
  return Math.min(100, Math.round(((points - thisLvStart) / (nextLvStart - thisLvStart)) * 100))
})

function getChapterCompleted(chapterId) {
  return (
    chapterStatsMap.value[chapterId] ||
    JSON.parse(localStorage.getItem('completed_topics_' + chapterId) || '[]').length
  )
}

function getChapterPct(chapterId) {
  const chapter = courseData.chapters.find((c) => c.id === chapterId)
  const total = chapter?.topics?.length || 10
  const completed = getChapterCompleted(chapterId)
  return Math.round((completed / total) * 100)
}

async function refresh() {
  loading.value = true
  try {
    await auth.refreshProfile()
    const s = await progressStore.loadSummary()
    if (s) summary.value = s
    const rows = await progressStore.loadChapters()
    const map = {}
    ;(rows || []).forEach((r) => {
      map[r.chapter_id] = r.topic_count || 0
    })
    chapterStatsMap.value = map
    try {
      achievements.value = await achievementApi.list()
    } catch (e) { achievements.value = [] }
    try {
      sessions.value = await sessionApi.list()
    } catch (e) { sessions.value = [] }
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>
