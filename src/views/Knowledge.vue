<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 py-2 sm:py-6 lg:py-8">
    <div class="px-0 sm:px-2 lg:px-4">
      <div class="flex items-center justify-between mb-3 sm:mb-6 px-2 sm:px-0">
        <button 
          @click="$router.back()"
          class="flex items-center text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          返回
        </button>
        <div class="flex items-center space-x-4">
          <span class="px-3 py-1 bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
            {{ currentChapter?.name }}
          </span>
          <span class="text-gray-500 dark:text-slate-400">|</span>
          <span class="text-gray-600 dark:text-slate-300">进度: {{ progressPercent }}%</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 sm:rounded-xl shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 lg:p-8 text-white">
          <h1 class="text-xl sm:text-2xl font-bold mb-2">{{ currentChapter?.name }}</h1>
          <p class="text-blue-100 dark:text-blue-300 text-sm sm:text-base">{{ currentChapter?.summary }}</p>
        </div>

        <div class="p-2 sm:p-4 lg:p-5">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-slate-100">章节知识点</h2>
            <div class="w-64 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full progress-bar"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
          </div>

          <div class="space-y-2 sm:space-y-4">
            <div 
              v-for="topic in currentChapter?.topics" 
              :key="topic.id"
              :id="'topic-' + topic.id"
              class="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all hover:shadow-md"
              :class="{ 'border-blue-400': activeTopic?.id === topic.id }"
            >
              <button 
                @click="toggleTopic(topic)"
                class="w-full flex items-center justify-between p-3 sm:p-4 text-left"
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
                    <h3 class="font-medium text-gray-800 dark:text-slate-100">{{ topic.name }}</h3>
                    <p class="text-sm text-gray-500 dark:text-slate-400 flex items-center">
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

              <div v-if="activeTopic?.id === topic.id" class="px-0 pb-2 sm:px-2 sm:pb-4">
                  <div class="bg-gray-50 dark:bg-slate-900 rounded-lg p-2 sm:p-4">
                    <h4 class="font-semibold text-gray-800 dark:text-slate-100 mb-4">核心要点</h4>
                  <ul class="space-y-3">
                    <li 
                      v-for="(point, idx) in topic.keyPoints" 
                      :key="idx"
                      class="flex items-start cursor-pointer group"
                      @click="showPointDetail(topic, point)"
                    >
                      <div class="w-6 h-6 bg-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-blue-500 transition-colors">
                        <ChevronRight class="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                      </div>
                      <span class="text-gray-700 dark:text-slate-200 group-hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1">{{ point }}</span>
                      <ChevronRight class="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0" />
                    </li>
                  </ul>

                  <div v-if="selectedPoint" ref="contentPanelRef" class="mt-3 p-2 sm:p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-700">
                    <button 
                      @click="selectedPoint = null"
                      class="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 mb-2"
                    >
                      <X class="w-5 h-5" />
                    </button>
                    <div v-html="renderPointContent(selectedTopic, selectedPoint)" class="max-w-none leading-relaxed text-sm sm:text-base"></div>
                  </div>

                  <div class="mt-3 p-2 sm:p-4 bg-blue-50 dark:bg-slate-700 rounded-lg">
                    <h4 class="font-semibold text-blue-800 dark:text-blue-400 mb-2 flex items-center text-sm sm:text-base">
                      <Lightbulb class="w-5 h-5 mr-2" />
                      学习提示
                    </h4>
                    <p class="text-blue-700 text-xs sm:text-sm">{{ getTopicTip(topic) }}</p>
                  </div>
                </div>

                <div v-if="knowledgeError && activeTopic?.id === topic.id" class="mt-3 p-2 sm:p-4 bg-red-50 dark:bg-slate-700 border border-red-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-red-700">
                  ⚠️ {{ knowledgeError }}
                </div>

                <div class="flex justify-end mt-3">
                  <button 
                    @click="markTopicComplete(topic)"
                    :disabled="markingComplete"
                    class="px-3 sm:px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    <CheckCircle v-if="!markingComplete" class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span v-if="markingComplete" class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ markingComplete ? '检查中...' : '标记已学习' }}
                  </button>
                  <router-link 
                    :to="`/practice/${chapterId}`"
                    class="ml-2 sm:ml-4 px-3 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center text-xs sm:text-sm"
                  >
                    <FileQuestion class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    章节练习
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 sm:mt-6 bg-white dark:bg-slate-800 sm:rounded-xl shadow-lg p-3 sm:p-5">
        <h3 class="font-semibold text-gray-800 dark:text-slate-100 mb-3 flex items-center text-sm sm:text-base">
          <BookMarked class="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          本章小结
        </h3>
        <p class="text-gray-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">{{ currentChapter?.summary }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <span 
            v-for="topic in currentChapter?.topics" 
            :key="topic.id"
            class="px-3 py-1 rounded-full text-sm"
            :class="completedTopics.includes(topic.id) ? 'bg-green-100 dark:bg-slate-700 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'"
          >
            {{ topic.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
const contentPanelRef = ref(null)
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

// 路由参数变化时重置所有状态并重新加载数据
watch(chapterId, async (newId, oldId) => {
  if (newId !== oldId) {
    activeTopic.value = null
    selectedPoint.value = null
    selectedTopic.value = null
    loadCompleted()
    if (isLogin.value) {
      try {
        const rows = await progressApi.chapterDetail(newId)
        const ids = (rows || []).map((r) => Number(r.topic_id)).filter((n) => !Number.isNaN(n))
        const merged = new Set([...completedTopics.value, ...ids])
        completedTopics.value = [...merged]
        saveCompleted()
      } catch (e) {
        console.warn('拉取章节进度失败:', e.message)
      }
    }
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

function scrollToContent(el) {
  nextTick(() => {
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // 补偿顶部导航/标题的偏移
      window.scrollBy(0, -20)
    }
  })
}

const toggleTopic = (topic) => {
  if (activeTopic.value?.id === topic.id) {
    activeTopic.value = null
    selectedPoint.value = null
  } else {
    activeTopic.value = topic
    selectedPoint.value = null
    // 展开后自动滚动到该知识点区域
    scrollToContent(document.getElementById('topic-' + topic.id))
  }
}

const showPointDetail = async (topic, point) => {
  selectedTopic.value = topic
  selectedPoint.value = point
  // 内容渲染后自动滚动到内容面板
  scrollToContent(contentPanelRef.value)
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
    return `<p class="text-gray-500 dark:text-slate-400">暂未找到本章详细内容（chapter${chapterId.value}）</p>`
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
        resultHtml += `<h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-slate-100 mt-3 sm:mt-4 mb-2">${line.replace('## ', '')}</h3>`
      } else if (line.startsWith('### ')) {
        resultHtml += `<h4 class="text-sm sm:text-base font-semibold text-gray-700 dark:text-slate-200 mt-2 sm:mt-3 mb-1 sm:mb-2">${line.replace('### ', '')}</h4>`
      } else if (line.startsWith('#### ')) {
        resultHtml += `<h5 class="text-sm font-medium text-gray-600 dark:text-slate-300 mt-2 mb-1">${line.replace('#### ', '')}</h5>`
      } else if (/^\d+\.\s*\*\*/.test(line)) {
        resultHtml += `<p class="ml-4 mb-1 text-gray-700 dark:text-slate-200 text-sm sm:text-base">${line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-600 dark:text-blue-400">$1</strong>')}</p>`
      } else if (line.startsWith('- ')) {
        resultHtml += `<li class="ml-4 mb-1 text-gray-700 dark:text-slate-200 text-sm sm:text-base">${line.replace('- ', '')}</li>`
      } else if (line.trim()) {
        const trimmed = line.trim()
        resultHtml += renderRichLine(trimmed)
      }
    })
    
    return resultHtml || `<p class="text-gray-500 dark:text-slate-400">内容正在整理中...</p>`
  }
  
  return `<p class="text-gray-500 dark:text-slate-400">暂无详细内容，请返回每日计划页面查看完整学习内容。</p>`
}

// 渲染带视觉标记的文本行
function renderRichLine(line) {
  // 高频考点 - 橙色醒目标记
  if (/^\*\*高频考点\*\*/.test(line)) {
    const content = line.replace(/^\*\*高频考点\*\*[:：]?\s*/, '')
    return `<div class="mb-2 sm:mb-3 p-2 sm:p-3 bg-orange-50 dark:bg-slate-700 border-l-4 border-orange-400 dark:border-slate-600 rounded-r-lg">
      <span class="inline-block px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded mr-2">高频考点</span>
      <span class="text-orange-800 dark:text-slate-200 font-medium text-sm sm:text-base">${content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-orange-700 dark:text-blue-400 underline">$1</strong>')}</span>
    </div>`
  }
  
  // 记忆口诀 - 紫色醒目标记
  if (/^\*\*记忆口诀\*\*/.test(line)) {
    const content = line.replace(/^\*\*记忆口诀\*\*[:：]?\s*/, '')
    return `<div class="mb-2 sm:mb-3 p-2 sm:p-3 bg-purple-50 dark:bg-slate-700 border-l-4 border-purple-400 dark:border-slate-600 rounded-r-lg">
      <span class="inline-block px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded mr-2">记忆口诀</span>
      <span class="text-purple-800 dark:text-slate-200 text-sm sm:text-base">${content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-purple-700 dark:text-purple-400 underline">$1</strong>')}</span>
    </div>`
  }
  
  // 核心要点/核心要素/要点 - 绿色醒目标记
  if (/^\*\*核心[要要素点]\*\*/.test(line) || /^\*\*要点\*\*/.test(line)) {
    const label = line.match(/^\*\*(.*?)\*\*/)[1]
    const content = line.replace(/^\*\*.*?\*\*[:：]?\s*/, '')
    return `<div class="mb-2 sm:mb-3 p-2 sm:p-3 bg-green-50 dark:bg-slate-700 border-l-4 border-green-400 dark:border-slate-600 rounded-r-lg">
      <span class="inline-block px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded mr-2">${label}</span>
      <span class="text-green-800 dark:text-slate-200 text-sm sm:text-base">${content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-green-700 dark:text-green-400 underline">$1</strong>')}</span>
    </div>`
  }
  
  // 注意事项 - 红色醒目标记
  if (/^\*\*注意事项\*\*/.test(line) || /^\*\*考点提示\*\*/.test(line)) {
    const label = line.match(/^\*\*(.*?)\*\*/)[1]
    const content = line.replace(/^\*\*.*?\*\*[:：]?\s*/, '')
    return `<div class="mb-2 sm:mb-3 p-2 sm:p-3 bg-red-50 dark:bg-slate-700 border-l-4 border-red-400 dark:border-slate-600 rounded-r-lg">
      <span class="inline-block px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded mr-2">${label}</span>
      <span class="text-red-800 dark:text-slate-200 text-sm sm:text-base">${content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-red-700 dark:text-green-400 underline">$1</strong>')}</span>
    </div>`
  }
  
  // 特别提示/学习提示 - 蓝色醒目标记
  if (/^\*\*特别提示\*\*/.test(line) || /^\*\*学习提示\*\*/.test(line)) {
    const label = line.match(/^\*\*(.*?)\*\*/)[1]
    const content = line.replace(/^\*\*.*?\*\*[:：]?\s*/, '')
    return `<div class="mb-2 sm:mb-3 p-2 sm:p-3 bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-400 dark:border-slate-600 rounded-r-lg">
      <span class="inline-block px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded mr-2">${label}</span>
      <span class="text-blue-800 dark:text-slate-200 text-sm sm:text-base">${content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-700 dark:text-blue-400 underline">$1</strong>')}</span>
    </div>`
  }
  
  // 术语定义行: **术语名称**：描述内容
  if (/^\*\*[^。，：:]*\*\*[:：]/.test(line)) {
    const parts = line.split(/^\*\*([^*]+)\*\*[:：]/)
    if (parts.length >= 3) {
      const term = parts[1]
      const desc = parts[2]
      return `<p class="mb-2 text-gray-700 dark:text-slate-200 text-sm sm:text-base"><strong class="text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-slate-700 px-1.5 py-0.5 rounded font-semibold">${term}</strong>：${desc.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-600 dark:text-blue-400">$1</strong>')}</p>`
    }
    // fallback
    return `<p class="mb-2 text-gray-700 dark:text-slate-200 text-sm sm:text-base">${line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-600 dark:text-blue-400">$1</strong>')}</p>`
  }
  
  // 普通行 - 蓝色加粗
  return `<p class="mb-2 text-gray-700 dark:text-slate-200 text-sm sm:text-base">${line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-600 dark:text-blue-400">$1</strong>')}</p>`
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
