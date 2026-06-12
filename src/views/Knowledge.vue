<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <button 
          @click="$router.back()"
          class="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          返回
        </button>
        <div class="flex items-center space-x-4">
          <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
            {{ currentChapter?.name }}
          </span>
          <span class="text-gray-500">|</span>
          <span class="text-gray-600">进度: {{ progressPercent }}%</span>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h1 class="text-2xl font-bold mb-2">{{ currentChapter?.name }}</h1>
          <p class="text-blue-100">{{ currentChapter?.summary }}</p>
        </div>

        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800">章节知识点</h2>
            <div class="w-64 bg-gray-200 rounded-full h-2">
              <div 
                class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full progress-bar"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
          </div>

          <div class="space-y-4">
            <div 
              v-for="topic in currentChapter?.topics" 
              :key="topic.id"
              class="border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md"
              :class="{ 'border-blue-400': activeTopic?.id === topic.id }"
            >
              <button 
                @click="toggleTopic(topic)"
                class="w-full flex items-center justify-between p-4 text-left"
              >
                <div class="flex items-center">
                  <div 
                    class="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                    :class="{ 'bg-blue-100': activeTopic?.id !== topic.id, 'bg-blue-500': activeTopic?.id === topic.id }"
                  >
                    <component 
                      :is="activeTopic?.id === topic.id ? ChevronDown : ChevronRight" 
                      class="w-5 h-5"
                      :class="{ 'text-blue-600': activeTopic?.id !== topic.id, 'text-white': activeTopic?.id === topic.id }"
                    />
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-800">{{ topic.name }}</h3>
                    <p class="text-sm text-gray-500 flex items-center">
                      <Clock class="w-4 h-4 mr-1" />
                      {{ topic.duration }}分钟
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <div 
                    v-for="(point, idx) in topic.keyPoints.slice(0, 3)" 
                    :key="idx"
                    class="w-2 h-2 rounded-full"
                    :class="completedTopics.includes(topic.id) ? 'bg-green-500' : 'bg-gray-300'"
                  ></div>
                </div>
              </button>

              <div v-if="activeTopic?.id === topic.id" class="px-4 pb-4">
                <div class="bg-gray-50 rounded-lg p-6">
                  <h4 class="font-semibold text-gray-800 mb-4">核心要点</h4>
                  <ul class="space-y-3">
                    <li 
                      v-for="(point, idx) in topic.keyPoints" 
                      :key="idx"
                      class="flex items-start cursor-pointer group"
                      @click="showPointDetail(topic, point)"
                    >
                      <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-blue-500 transition-colors">
                        <ChevronRight class="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <span class="text-gray-700 group-hover:text-blue-600 transition-colors flex-1">{{ point }}</span>
                      <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    </li>
                  </ul>

                  <div v-if="selectedPoint" class="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                    <button 
                      @click="selectedPoint = null"
                      class="text-gray-400 hover:text-gray-600 mb-3"
                    >
                      <X class="w-5 h-5" />
                    </button>
                    <div v-html="renderPointContent(selectedTopic, selectedPoint)"></div>
                  </div>

                  <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-2 flex items-center">
                      <Lightbulb class="w-5 h-5 mr-2" />
                      学习提示
                    </h4>
                    <p class="text-blue-700 text-sm">{{ getTopicTip(topic) }}</p>
                  </div>
                </div>

                <div v-if="knowledgeError && activeTopic?.id === topic.id" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ⚠️ {{ knowledgeError }}
                </div>

                <div class="flex justify-end mt-4">
                  <button 
                    @click="markTopicComplete(topic)"
                    :disabled="markingComplete"
                    class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle v-if="!markingComplete" class="w-5 h-5 mr-2" />
                    <span v-if="markingComplete" class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ markingComplete ? '检查中...' : '标记已学习' }}
                  </button>
                  <router-link 
                    :to="`/practice/${chapterId}`"
                    class="ml-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <FileQuestion class="w-5 h-5 mr-2" />
                    章节练习
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
          <BookMarked class="w-5 h-5 mr-2 text-blue-600" />
          本章小结
        </h3>
        <p class="text-gray-600 leading-relaxed">{{ currentChapter?.summary }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <span 
            v-for="topic in currentChapter?.topics" 
            :key="topic.id"
            class="px-3 py-1 rounded-full text-sm"
            :class="completedTopics.includes(topic.id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'"
          >
            {{ topic.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  CheckCircle,
  FileQuestion,
  Lightbulb,
  BookMarked,
  X
} from 'lucide-vue-next'
import { courseData } from '../data/courseData'
import { detailedContent } from '../data/detailedContent'
import { progressApi, practiceApi } from '../utils/request.js'
import { useAuthStore } from '../stores/index.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isLogin = computed(() => auth.isLogin)

const chapterId = computed(() => Number(route.params.chapterId) || 1)

const activeTopic = ref(null)
const completedTopics = ref([])
const selectedPoint = ref(null)
const selectedTopic = ref(null)
const markingComplete = ref(false)
const knowledgeError = ref('')

function loadCompleted() {
  // 多用户隔离：按用户ID存储
  const uid = auth.user?.id || 'guest'
  const key = 'completed_topics_chapter' + chapterId.value + '_' + uid
  const local = JSON.parse(localStorage.getItem(key) || '[]')
  completedTopics.value = Array.isArray(local) ? local : []
}

onMounted(async () => {
  console.log('Knowledge 页面已加载，章节:', chapterId.value, '路由参数:', route.params)
  loadCompleted()
  if (isLogin.value) {
    try {
      const rows = await progressApi.chapterDetail(chapterId.value)
      const ids = (rows || []).map((r) => Number(r.topic_id)).filter((n) => !Number.isNaN(n))
      const merged = new Set([...completedTopics.value, ...ids])
      completedTopics.value = [...merged]
      // 同步回 localStorage
      saveCompleted()
    } catch (e) {
      console.warn('拉取章节进度失败:', e.message)
    }
  }
})

function saveCompleted() {
  const uid = auth.user?.id || 'guest'
  const key = 'completed_topics_chapter' + chapterId.value + '_' + uid
  localStorage.setItem(key, JSON.stringify(completedTopics.value))
}

// 路由参数变化时重置所有状态
watch(chapterId, (newId, oldId) => {
  if (newId !== oldId) {
    activeTopic.value = null
    selectedPoint.value = null
    selectedTopic.value = null
  }
})

const currentChapter = computed(() => {
  const ch = courseData.chapters.find(c => c.id === chapterId.value)
  if (ch) return ch
  // 如果 courseData 中找不到，尝试从 detailedContent 中构造
  const dcChapter = detailedContent[`chapter${chapterId.value}`]
  if (dcChapter) {
    return {
      id: dcChapter.id,
      name: dcChapter.name,
      summary: dcChapter.summary || '章节内容',
      topics: (dcChapter.dailyPlans || []).map((p, idx) => ({
        id: idx + 1,
        name: p.title,
        duration: p.duration || 120,
        keyPoints: [],
        tips: '',
        content: p.content
      }))
    }
  }
  return courseData.chapters[0]
})

const progressPercent = computed(() => {
  if (!currentChapter.value) return 0
  const totalTopics = currentChapter.value.topics.length
  const completed = completedTopics.value.length
  return Math.round((completed / totalTopics) * 100)
})

const toggleTopic = (topic) => {
  if (activeTopic.value?.id === topic.id) {
    activeTopic.value = null
    selectedPoint.value = null
  } else {
    activeTopic.value = topic
    selectedPoint.value = null
  }
}

const showPointDetail = (topic, point) => {
  selectedTopic.value = topic
  selectedPoint.value = point
}

const getTopicTip = (topic) => {
  const tips = {
    1: '这部分内容是本章的重点，建议结合实际案例理解记忆。可以尝试用自己的话复述关键概念，加深理解。',
    2: '管理体系标准内容较多，建议制作思维导图帮助记忆。重点理解各大标准的核心思想和适用场景。',
    3: '审核概论是理解审核工作的基础，建议结合实际审核流程学习，注意区分不同类型审核的特点。',
    4: '审核实施是实践性很强的内容，建议多做模拟练习，熟悉审核流程和技巧。',
    5: '认证过程涉及多个环节，注意各环节的时间要求和文件要求，建立完整的流程概念。',
    6: '法律法规是审核员的行为准则，必须牢记。建议制作法规要点卡片，随时复习。',
    7: '风险管理贯穿审核全过程，掌握风险识别和控制方法对实际工作非常有帮助。',
    8: '案例分析是检验学习效果的最佳方式，建议独立分析后再对照参考答案，找出差距。'
  }
  return tips[chapterId.value] || '建议结合实际案例理解记忆。'
}

const renderPointContent = (topic, point) => {
  const chapterContent = detailedContent[`chapter${chapterId.value}`]
  if (!chapterContent) {
    return `<p class="text-gray-500">暂未找到本章详细内容（chapter${chapterId.value}）</p>`
  }
  
  let matchedPlan = null
  
  // 首先尝试按 topic.name 匹配 dayPlan.title
  for (const dayPlan of chapterContent.dailyPlans || []) {
    if (!dayPlan.content) continue
    if (dayPlan.title.includes(topic.name.split('.').slice(0, 2).join('.'))) {
      matchedPlan = dayPlan
      break
    }
  }
  
  // 如果没有匹配到，尝试按 topic 的序号匹配
  if (!matchedPlan) {
    const topicNum = topic.name.match(/^(\d+\.\d+)/)
    if (topicNum) {
      for (const dayPlan of chapterContent.dailyPlans || []) {
        if (!dayPlan.content) continue
        if (dayPlan.title.startsWith(topicNum[1])) {
          matchedPlan = dayPlan
          break
        }
      }
    }
  }
  
  // 如果没有匹配，按 day 序号匹配 topic 编号
  if (!matchedPlan) {
    const dayNum = topic?.id || 1
    for (const dayPlan of chapterContent.dailyPlans || []) {
      if (!dayPlan.content) continue
      if (dayPlan.day === dayNum) {
        matchedPlan = dayPlan
        break
      }
    }
  }
  
  // 最终回退：显示本章第一个有内容的学习计划
  if (!matchedPlan) {
    for (const dayPlan of chapterContent.dailyPlans || []) {
      if (dayPlan.content) {
        matchedPlan = dayPlan
        break
      }
    }
  }
  
  if (matchedPlan && matchedPlan.content) {
    const content = matchedPlan.content
    const lines = content.split('\n')
    let resultHtml = ''
    
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        resultHtml += `<h3 class="text-lg font-bold text-gray-800 mt-4 mb-2">${line.replace('## ', '')}</h3>`
      } else if (line.startsWith('### ')) {
        resultHtml += `<h4 class="text-base font-semibold text-gray-700 mt-3 mb-2">${line.replace('### ', '')}</h4>`
      } else if (line.startsWith('#### ')) {
        resultHtml += `<h5 class="font-medium text-gray-600 mt-2 mb-1">${line.replace('#### ', '')}</h5>`
      } else if (/^\d+\.\s*\*\*/.test(line)) {
        resultHtml += `<p class="ml-4 mb-1 text-gray-700">${line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-600">$1</strong>')}</p>`
      } else if (line.startsWith('- ')) {
        resultHtml += `<li class="ml-4 mb-1 text-gray-700">${line.replace('- ', '')}</li>`
      } else if (line.trim()) {
        resultHtml += `<p class="mb-2 text-gray-700">${line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-600">$1</strong>')}</p>`
      }
    })
    
    return resultHtml || `<p class="text-gray-500">内容正在整理中...</p>`
  }
  
  return `<p class="text-gray-500">暂无详细内容，请返回每日计划页面查看完整学习内容。</p>`
}

const markTopicComplete = async (topic) => {
  knowledgeError.value = ''
  markingComplete.value = true
  
  try {
    // 获取该章节的最新练习成绩
    let score = 0
    try {
      const result = await practiceApi.getScore(chapterId.value)
      score = result?.score || 0
    } catch (e) {
      console.warn('获取章节成绩失败：', e.message)
    }
    
    if (score < 70) {
      knowledgeError.value = `请先完成章节练习并达到70分以上，才能标记为已学习！当前章节成绩：${score}分`
      return
    }
    
    if (!completedTopics.value.includes(topic.id)) {
      completedTopics.value = [...completedTopics.value, topic.id]
      saveCompleted()
    }
    if (isLogin.value) {
      try {
        await progressApi.markComplete({
          chapter_id: chapterId.value,
          topic_id: topic.id,
          topic_name: topic.name
        })
        // 更新用户积分显示
        await auth.refreshProfile()
      } catch (e) {
        console.warn('记录进度失败:', e.message)
      }
    }
  } finally {
    markingComplete.value = false
  }
}
</script>
