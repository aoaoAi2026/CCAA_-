<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <button 
          @click="$router.back()"
          class="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          返回
        </button>
        <div class="flex items-center space-x-4">
          <span class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
            {{ currentChapter?.name }}
          </span>
          <span class="text-gray-500">|</span>
          <span class="text-gray-600">第 {{ currentIndex + 1 }} / {{ totalQuestions }} 题</span>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-2">
            <div 
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="difficultyClass"
            >
              {{ difficultyText }}
            </div>
            <span v-if="isEssayQuestion" class="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
              简答题
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <Timer class="w-5 h-5 text-gray-500" />
            <span class="text-gray-500">{{ formatTime(timeSpent) }}</span>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            <span class="text-blue-600 mr-2">{{ currentIndex + 1 }}.</span>
            {{ currentQuestion?.question }}
            <span v-if="isEssayQuestion && currentQuestion?.score" class="text-sm text-gray-500">（{{ currentQuestion.score }}分）</span>
          </h2>
        </div>

        <!-- 选择题选项 -->
        <div v-if="!isEssayQuestion" class="space-y-3">
          <button 
            v-for="(option, index) in currentQuestion?.options" 
            :key="index"
            @click="selectOption(index)"
            :disabled="showResult"
            class="option-btn w-full p-4 rounded-xl border-2 text-left transition-all"
            :class="getOptionClass(index)"
          >
            <div class="flex items-center">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center mr-4 font-semibold"
                :class="getOptionBadgeClass(index)"
              >
                {{ optionLabels[index] }}
              </div>
              <span>{{ option }}</span>
            </div>
          </button>
        </div>

        <!-- 简答题答题区 -->
        <div v-else class="space-y-3">
          <textarea
            v-model="essayAnswer"
            :disabled="showResult"
            placeholder="请在此输入您的答案..."
            class="w-full h-48 p-4 border-2 rounded-xl resize-none focus:outline-none focus:border-blue-500"
            :class="showResult ? 'border-gray-200 bg-gray-50' : 'border-gray-200'"
          ></textarea>
          <div v-if="practiceError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠️ {{ practiceError }}
          </div>
          <button
            v-if="!showResult"
            @click="submitEssayAnswer"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <CheckCircle class="w-5 h-5 mr-2" />
            提交答案
          </button>
        </div>

        <!-- 答案解析 -->
        <div v-if="showResult" class="mt-6 p-6 rounded-xl" :class="isCorrect ? 'bg-green-50' : 'bg-red-50'">
          <div class="flex items-center mb-4">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              :class="isCorrect ? 'bg-green-500' : 'bg-red-500'"
            >
              <CheckCircle v-if="isCorrect" class="w-6 h-6 text-white" />
              <XCircle v-else class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="font-semibold" :class="isCorrect ? 'text-green-800' : 'text-red-800'">
                {{ isCorrect ? '回答正确！' : '回答错误' }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ isCorrect ? '继续保持，加油！' : `正确答案是：${optionLabels[currentQuestion?.answer]}` }}
              </p>
            </div>
          </div>
          <div class="p-4 bg-white rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-2 flex items-center">
              <BookOpen class="w-5 h-5 mr-2 text-blue-600" />
              解析
            </h4>
            <!-- 选择题解析 -->
            <template v-if="!isEssayQuestion">
              <p class="text-gray-600">{{ currentQuestion?.explanation }}</p>
            </template>
            <!-- 简答题解析 -->
            <template v-else>
              <div class="mb-3">
                <span class="font-medium text-gray-800">参考答案：</span>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg mb-3">
                <pre class="whitespace-pre-wrap text-gray-700 text-sm">{{ currentQuestion?.answer }}</pre>
              </div>
              <p class="text-gray-600"><strong>解析：</strong>{{ currentQuestion?.explanation }}</p>
              <div v-if="currentQuestion?.keyPoints" class="mt-3">
                <span class="font-medium text-gray-800">要点总结：</span>
                <ul class="mt-1">
                  <li v-for="(point, i) in currentQuestion.keyPoints" :key="i" class="text-gray-600 text-sm">• {{ point }}</li>
                </ul>
              </div>
            </template>
          </div>
        </div>

        <div class="flex justify-end mt-6 space-x-4">
          <button 
            v-if="showResult && !isCorrect"
            @click="addToWrongNotebook"
            class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center"
          >
            <BookmarkPlus class="w-5 h-5 mr-2" />
            添加到错题本
          </button>
          <button 
            v-if="currentIndex < totalQuestions - 1"
            @click="nextQuestion"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            下一题
            <ChevronRight class="w-5 h-5 ml-2" />
          </button>
          <button 
            v-else
            @click="showResults"
            class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            <CheckCircle class="w-5 h-5 mr-2" />
            查看成绩
          </button>
        </div>
      </div>

      <div class="mt-6 flex justify-center">
        <div class="flex items-center space-x-2">
          <div 
            v-for="(_, index) in chapterQuestions" 
            :key="index"
            class="w-3 h-3 rounded-full cursor-pointer transition-all"
            :class="getQuestionDotClass(index)"
            @click="goToQuestion(index)"
          ></div>
        </div>
      </div>

      <div v-if="showFinalResults" class="mt-8 bg-white rounded-xl shadow-lg p-8 text-center">
        <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy class="w-12 h-12 text-white" />
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">练习完成！</h2>
        <p class="text-gray-600 mb-6">本章练习已完成，看看你的成绩如何</p>
        
        <div class="grid grid-cols-3 gap-6 mb-8">
          <div class="bg-blue-50 rounded-xl p-4">
            <div class="text-3xl font-bold text-blue-600">{{ correctCount }}</div>
            <div class="text-gray-600 text-sm">正确题数</div>
          </div>
          <div class="bg-red-50 rounded-xl p-4">
            <div class="text-3xl font-bold text-red-600">{{ wrongCount }}</div>
            <div class="text-gray-600 text-sm">错误题数</div>
          </div>
          <div class="bg-green-50 rounded-xl p-4">
            <div class="text-3xl font-bold text-green-600">{{ accuracyPercent }}%</div>
            <div class="text-gray-600 text-sm">正确率</div>
          </div>
        </div>

        <!-- 成绩达标提示 -->
        <div v-if="accuracyPercent >= 70" class="mb-6 p-4 bg-green-100 rounded-lg">
          <div class="flex items-center justify-center text-green-700">
            <CheckCircle class="w-5 h-5 mr-2" />
            <span class="font-medium">恭喜！成绩达到70分以上，可以标记该章节为已学习</span>
          </div>
        </div>

        <div class="flex justify-center space-x-4">
          <button 
            @click="restartPractice"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <RotateCcw class="w-5 h-5 mr-2" />
            重新练习
          </button>
          <router-link 
            to="/wrong-notebook"
            v-if="wrongCount > 0"
            class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
          >
            <AlertCircle class="w-5 h-5 mr-2" />
            查看错题本
          </router-link>
          <router-link 
            to="/learning-path"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <Home class="w-5 h-5 mr-2" />
            返回学习路线
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ChevronRight,
  Timer,
  CheckCircle,
  XCircle,
  BookOpen,
  BookmarkPlus,
  Trophy,
  RotateCcw,
  AlertCircle,
  Home
} from 'lucide-vue-next'
import { courseData } from '../data/courseData'
import { questions } from '../data/questions'
import { wrongApi, sessionApi, practiceApi } from '../utils/request.js'

const route = useRoute()
const router = useRouter()
const currentIndex = ref(0)
const selectedOption = ref(null)
const essayAnswer = ref('')
const showResult = ref(false)
const showFinalResults = ref(false)
const answers = ref([])
const essayAnswers = ref({})
const timeSpent = ref(0)
const practiceError = ref('')
let timer = null

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

// 备用题目库（当某章节没有题目时使用）
const fallbackQuestions = [
  {
    id: 101,
    question: '合格评定的主要对象不包括以下哪一项？',
    options: ['产品', '过程', '人员', '政府机构'],
    answer: 3,
    explanation: '合格评定主要针对产品、过程、服务、管理体系、人员和机构等，不包括政府机构。',
    difficulty: 'easy'
  },
  {
    id: 102,
    question: '认证和认可的主要区别是？',
    options: ['认证由政府机构执行，认可是自愿的', '认证针对产品/服务/体系，认可针对机构/人员', '认证不需要认证机构，认可需要', '没有实质区别'],
    answer: 1,
    explanation: '认证是由第三方机构证明产品/服务/体系符合标准；认可是对认证机构/检验机构等的能力证明。',
    difficulty: 'medium'
  },
  {
    id: 103,
    question: '以下哪项是合格评定的基本原则之一？',
    options: ['保密性', '经济性', '快速性', '灵活性'],
    answer: 0,
    explanation: '合格评定的基本原则包括：公正性、独立性、科学性、保密性等。',
    difficulty: 'easy'
  }
]

// 从路由获取章节ID
const chapterId = computed(() => {
  const rawId = route.params.chapterId
  if (!rawId) return 1
  const id = parseInt(rawId)
  if (!isNaN(id) && id >= 1 && id <= courseData.chapters.length) {
    return id
  }
  return 1
})

// 路由参数变化时重置所有状态
watch(chapterId, (newId, oldId) => {
  if (newId !== oldId) {
    currentIndex.value = 0
    selectedOption.value = null
    essayAnswer.value = ''
    showResult.value = false
    showFinalResults.value = false
    answers.value = []
    essayAnswers.value = {}
    timeSpent.value = 0
  }
})

onMounted(() => {
  timer = setInterval(() => {
    timeSpent.value++
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const currentChapter = computed(() => {
  return courseData.chapters.find(c => c.id === chapterId.value) || courseData.chapters[0]
})

const chapterQuestions = computed(() => {
  const key = `chapter${chapterId.value}`
  const qs = questions[key]
  if (qs && qs.length > 0) {
    // 随机添加1-2道简答题
    const essayQuestions = questions.essay || []
    const shuffledEssays = essayQuestions.sort(() => Math.random() - 0.5)
    const selectedEssays = shuffledEssays.slice(0, Math.min(2, essayQuestions.length))
    const allQuestions = [...qs, ...selectedEssays]
    return allQuestions.sort(() => Math.random() - 0.5)
  }
  return fallbackQuestions
})

const totalQuestions = computed(() => chapterQuestions.value.length)

const currentQuestion = computed(() => chapterQuestions.value[currentIndex.value])

const isEssayQuestion = computed(() => currentQuestion.value?.type === 'essay')

const difficultyText = computed(() => {
  const diff = currentQuestion.value?.difficulty
  if (diff === 'easy') return '简单'
  if (diff === 'medium') return '中等'
  return '困难'
})

const difficultyClass = computed(() => {
  const diff = currentQuestion.value?.difficulty
  if (diff === 'easy') return 'bg-green-100 text-green-600'
  if (diff === 'medium') return 'bg-yellow-100 text-yellow-600'
  return 'bg-red-100 text-red-600'
})

const isCorrect = computed(() => {
  if (isEssayQuestion.value) {
    return true
  }
  return selectedOption.value === currentQuestion.value?.answer
})

const correctCount = computed(() => {
  let count = answers.value.filter((a, i) => {
    const q = chapterQuestions.value[i]
    if (q?.type === 'essay') return true
    return a === q?.answer
  }).length
  // 简答题默认算正确
  Object.keys(essayAnswers.value).forEach(key => {
    if (essayAnswers.value[key]) count++
  })
  return count
})

const wrongCount = computed(() => totalQuestions.value - correctCount.value)

const accuracyPercent = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctCount.value / totalQuestions.value) * 100)
})

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const selectOption = (index) => {
  if (showResult.value || isEssayQuestion.value) return
  selectedOption.value = index
  showResult.value = true
  answers.value[currentIndex.value] = index
}

const submitEssayAnswer = () => {
  if (showResult.value) return
  if (!essayAnswer.value.trim()) {
    practiceError.value = '请输入答案后再提交'
    setTimeout(() => { practiceError.value = '' }, 3000)
    return
  }
  essayAnswers.value[currentIndex.value] = essayAnswer.value
  showResult.value = true
  practiceError.value = ''
}

const getOptionClass = (index) => {
  if (!showResult.value || isEssayQuestion.value) {
    return selectedOption.value === index 
      ? 'border-blue-500 bg-blue-50' 
      : 'border-gray-200 hover:border-blue-300'
  }
  
  if (index === currentQuestion.value?.answer) {
    return 'border-green-500 bg-green-50'
  }
  if (index === selectedOption.value && index !== currentQuestion.value?.answer) {
    return 'border-red-500 bg-red-50'
  }
  return 'border-gray-200 opacity-50'
}

const getOptionBadgeClass = (index) => {
  if (!showResult.value || isEssayQuestion.value) {
    return selectedOption.value === index 
      ? 'bg-blue-500 text-white' 
      : 'bg-gray-100 text-gray-600'
  }
  
  if (index === currentQuestion.value?.answer) {
    return 'bg-green-500 text-white'
  }
  if (index === selectedOption.value && index !== currentQuestion.value?.answer) {
    return 'bg-red-500 text-white'
  }
  return 'bg-gray-100 text-gray-400'
}

const getQuestionDotClass = (index) => {
  if (index === currentIndex.value) {
    return 'bg-blue-500 scale-125'
  }
  if (index < currentIndex.value) {
    const q = chapterQuestions.value[index]
    if (q?.type === 'essay') {
      return essayAnswers.value[index] ? 'bg-green-500' : 'bg-yellow-500'
    }
    return answers.value[index] === q?.answer 
      ? 'bg-green-500' 
      : 'bg-red-500'
  }
  return 'bg-gray-300'
}

const nextQuestion = () => {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++
    selectedOption.value = null
    essayAnswer.value = ''
    showResult.value = false
  }
}

const goToQuestion = (index) => {
  currentIndex.value = index
  selectedOption.value = answers.value[index]
  essayAnswer.value = essayAnswers.value[index] || ''
  showResult.value = selectedOption.value !== null || essayAnswers.value[index] !== undefined
}

const addMsg = ref('')
async function addToWrongNotebook() {
  const q = currentQuestion.value
  if (!q) return
  try {
    await wrongApi.add({
      chapter_id: chapterId.value,
      chapter_name: currentChapter.value?.name,
      question: q.question,
      options: q.options,
      user_answer: selectedOption.value,
      correct_answer: q.answer,
      explanation: q.explanation
    })
    addMsg.value = '已加入错题本'
  } catch (e) {
    addMsg.value = '加入错题本失败：' + e.message
  }
  setTimeout(() => (addMsg.value = ''), 2500)
}

onUnmounted(() => {
  // 退出时记录一次学习会话，并保存章节练习成绩
  const totalQ = answers.value.length + Object.keys(essayAnswers.value).length
  if (timeSpent.value > 0) {
    sessionApi
      .log({
        session_date: new Date().toISOString().slice(0, 10),
        duration_minutes: Math.ceil(timeSpent.value / 60),
        questions_answered: totalQ,
        correct_count: correctCount.value,
        notes: '章节练习：' + (currentChapter.value?.name || '')
      })
      .catch(() => {})
  }
  
  // 保存章节练习成绩到后端（按用户隔离）
  if (totalQ > 0) {
    practiceApi
      .saveScore({
        chapter_id: chapterId.value,
        score: accuracyPercent.value
      })
      .catch(() => {})
  }
})

const showResults = () => {
  showFinalResults.value = true
}

const restartPractice = () => {
  currentIndex.value = 0
  selectedOption.value = null
  essayAnswer.value = ''
  showResult.value = false
  showFinalResults.value = false
  answers.value = []
  essayAnswers.value = {}
  timeSpent.value = 0
}
</script>
