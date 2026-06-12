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
            <span v-else-if="isMultipleQuestion" class="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
              多选题 ({{ selectedOptions.size }}/{{ currentQuestion?.options?.length }})
            </span>
            <span v-else-if="isJudgeQuestion" class="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium">
              判断题
            </span>
            <span v-else class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              单选题
            </span>
          </div>
          <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <Timer class="w-5 h-5 text-gray-500" />
            <span class="text-gray-500">{{ formatTime(timeSpent) }}</span>
          </div>
          <button
            v-if="showResult && currentIndex < totalQuestions - 1"
            @click="nextQuestion"
            class="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
          >
            下一题
            <ChevronRight class="w-4 h-4 ml-1" />
          </button>
          <button
            v-else-if="showResult"
            @click="showResults"
            class="px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm"
          >
            <CheckCircle class="w-4 h-4 mr-1" />
            查看成绩
          </button>
        </div>
        </div>

        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            <span class="text-blue-600 mr-2">{{ currentIndex + 1 }}.</span>
            {{ currentQuestion?.question }}
            <span v-if="isEssayQuestion && currentQuestion?.score" class="text-sm text-gray-500">（{{ currentQuestion.score }}分）</span>
          </h2>
        </div>

        <!-- 判断题选项 (简化显示: 正确/错误) -->
        <div v-if="isJudgeQuestion && !isEssayQuestion" class="space-y-3">
          <button 
            v-for="(option, index) in currentQuestion?.options" 
            :key="'judge-' + index"
            @click="selectOption(index)"
            :disabled="showResult"
            class="w-full p-4 rounded-xl border-2 text-center transition-all text-lg"
            :class="getOptionClass(index)"
          >
            <div class="flex items-center justify-center">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold"
                :class="getOptionBadgeClass(index)"
              >
                {{ option === '正确' ? '✓' : '✗' }}
              </div>
              <span class="font-medium">{{ option }}</span>
            </div>
          </button>
        </div>

        <!-- 多选题选项 (可多选, 需提交) -->
        <div v-else-if="isMultipleQuestion && !isEssayQuestion" class="space-y-3">
          <button 
            v-for="(option, index) in currentQuestion?.options" 
            :key="'multi-' + index"
            @click="toggleOption(index)"
            :disabled="showResult"
            class="w-full p-4 rounded-xl border-2 text-left transition-all"
            :class="getMultiOptionClass(index)"
          >
            <div class="flex items-center">
              <div 
                class="w-8 h-8 rounded flex items-center justify-center mr-4 font-semibold border-2"
                :class="getMultiBadgeClass(index)"
              >
                <Check v-if="!showResult && selectedOptions.has(index)" class="w-5 h-5" />
                <span v-else-if="!showResult">{{ optionLabels[index] }}</span>
                <Check v-else-if="isCorrectAnswer(index)" class="w-5 h-5" />
                <X v-else-if="selectedOptions.has(index) && !isCorrectAnswer(index)" class="w-5 h-5" />
                <span v-else class="text-gray-400">{{ optionLabels[index] }}</span>
              </div>
              <span class="flex-1">{{ option }}</span>
            </div>
          </button>
          <button
            v-if="!showResult"
            @click="submitMultiAnswer"
            :disabled="selectedOptions.size === 0"
            class="w-full mt-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <CheckCircle class="w-5 h-5 mr-2" />
            提交答案（已选 {{ selectedOptions.size }} 项）
          </button>
        </div>

        <!-- 单选题选项 (点击即答) -->
        <div v-else-if="!isEssayQuestion" class="space-y-3">
          <button 
            v-for="(option, index) in currentQuestion?.options" 
            :key="'single-' + index"
            @click="selectOption(index)"
            :disabled="showResult"
            class="w-full p-4 rounded-xl border-2 text-left transition-all"
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
              <CheckCircle v-if="isCorrect && !autoAdvancing" class="w-6 h-6 text-white" />
              <XCircle v-else-if="!isCorrect" class="w-6 h-6 text-white" />
              <span v-else class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </div>
            <div>
              <h3 class="font-semibold" :class="isCorrect ? 'text-green-800' : 'text-red-800'">
                {{ isCorrect ? (autoAdvancing ? '回答正确！' : '回答正确！') : '回答错误' }}
              </h3>
              <p class="text-sm text-gray-600">
                <template v-if="isCorrect && !autoAdvancing">自动跳转下一题...</template>
                <template v-else-if="isCorrect && autoAdvancing">✅ 已自动跳转</template>
                <template v-else>正确答案是：{{ formatCorrectAnswer(currentQuestion) }}</template>
              </p>
            </div>
          </div>
          <!-- 回答正确：显示简要解析 + 自动跳转倒计时 -->
          <div v-if="isCorrect && !isLastQuestion" class="p-3 bg-white rounded-lg">
            <p class="text-gray-600 text-sm">{{ currentQuestion?.explanation }}</p>
            <div class="mt-2 text-xs text-green-600 font-medium">
              {{ autoAdvanceCountdown }} 秒后自动跳转下一题...
            </div>
          </div>
          <!-- 回答错误或最后一条：显示完整解析 -->
          <div v-else-if="!isCorrect || isLastQuestion" class="p-3 bg-white rounded-lg">
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
          <router-link
            v-if="showResult && !isCorrect"
            to="/wrong-notebook"
            class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center"
          >
            <AlertCircle class="w-5 h-5 mr-2" />
            已自动加入错题本
          </router-link>
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
import { useRoute } from 'vue-router'
import {
  ArrowLeft,
  ChevronRight,
  Timer,
  CheckCircle,
  XCircle,
  BookOpen,
  Trophy,
  RotateCcw,
  AlertCircle,
  Home,
  Check,
  X
} from 'lucide-vue-next'
import { courseData } from '../data/courseData'
import { questions } from '../data/questions'
import { wrongApi, sessionApi, practiceApi } from '../utils/request.js'
import { useToastStore } from '../stores/index.js'

const route = useRoute()
const toast = useToastStore()
const currentIndex = ref(0)
const selectedOption = ref(null)     // 单选/判断题选中
const selectedOptions = ref(new Set()) // 多选题选中集合
const essayAnswer = ref('')
const showResult = ref(false)
const showFinalResults = ref(false)
const answers = ref([])              // 存储单选/判断答案（数值）
const multiAnswers = ref([])        // 存储多选题答案（数组）
const essayAnswers = ref({})
const timeSpent = ref(0)
const practiceError = ref('')
const wrongRecordedIndices = ref({})
const autoAdvancing = ref(false)
const autoAdvanceCountdown = ref(0)
let timer = null
let autoAdvanceTimer = null

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

// 备用题目库
const fallbackQuestions = [
  { id: 101, question: '合格评定的主要对象不包括以下哪一项？', options: ['产品', '过程', '人员', '政府机构'], answer: 3, explanation: '合格评定主要针对产品、过程、服务、管理体系、人员和机构等，不包括政府机构。', difficulty: 'easy' },
  { id: 102, question: '认证和认可的主要区别是？', options: ['认证由政府机构执行，认可是自愿的', '认证针对产品/服务/体系，认可针对机构/人员', '认证不需要认证机构，认可需要', '没有实质区别'], answer: 1, explanation: '认证由第三方机构证明符合标准；认可是对认证机构等的能力证明。', difficulty: 'medium' },
  { id: 103, question: '以下哪项是合格评定的基本原则之一？', options: ['保密性', '经济性', '快速性', '灵活性'], answer: 0, explanation: '合格评定的基本原则包括：公正性、独立性、科学性、保密性等。', difficulty: 'easy' }
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
    resetState()
  }
})

function cancelAutoAdvance() {
  if (autoAdvanceTimer) {
    clearInterval(autoAdvanceTimer)
    autoAdvanceTimer = null
  }
  autoAdvancing.value = false
  autoAdvanceCountdown.value = 0
}

function startAutoAdvance() {
  if (isLastQuestion.value) return // 最后一题不自动跳转
  autoAdvancing.value = true
  autoAdvanceCountdown.value = 3
  autoAdvanceTimer = setInterval(() => {
    autoAdvanceCountdown.value--
    if (autoAdvanceCountdown.value <= 0) {
      cancelAutoAdvance()
      nextQuestion()
    }
  }, 1000)
}

function resetState() {
  cancelAutoAdvance()
  currentIndex.value = 0
  selectedOption.value = null
  selectedOptions.value = new Set()
  essayAnswer.value = ''
  showResult.value = false
  showFinalResults.value = false
  answers.value = []
  multiAnswers.value = []
  essayAnswers.value = {}
  timeSpent.value = 0
  wrongRecordedIndices.value = {}
}

onMounted(() => {
  timer = setInterval(() => { timeSpent.value++ }, 1000)
})

const currentChapter = computed(() => {
  return courseData.chapters.find(c => c.id === chapterId.value) || courseData.chapters[0]
})

const chapterQuestions = computed(() => {
  const key = `chapter${chapterId.value}`
  const qs = questions[key] || []
  // 添加本章的多选题和判断题
  const multiQs = (questions.multipleChoice || []).filter(q => q.chapter === chapterId.value)
  const judgeQs = (questions.trueFalse || []).filter(q => q.chapter === chapterId.value)
  // 随机添加1-2道简答题
  const essayQs = (questions.essay || []).sort(() => Math.random() - 0.5).slice(0, Math.min(2, (questions.essay || []).length))
  
  let allQuestions = [...qs, ...multiQs, ...judgeQs, ...essayQs]
  if (allQuestions.length === 0) {
    allQuestions = [...fallbackQuestions]
  }
  return allQuestions.sort(() => Math.random() - 0.5)
})

const totalQuestions = computed(() => chapterQuestions.value.length)
const currentQuestion = computed(() => chapterQuestions.value[currentIndex.value])

const isEssayQuestion = computed(() => currentQuestion.value?.type === 'essay')
const isMultipleQuestion = computed(() => currentQuestion.value?.type === 'multiple')
const isJudgeQuestion = computed(() => currentQuestion.value?.type === 'judge')
const isLastQuestion = computed(() => currentIndex.value >= totalQuestions.value - 1)

const getSelectedCount = computed(() => selectedOptions.value.size)

const difficultyText = computed(() => {
  const d = currentQuestion.value?.difficulty
  if (d === 'easy') return '简单'
  if (d === 'medium') return '中等'
  return '困难'
})

const difficultyClass = computed(() => {
  const d = currentQuestion.value?.difficulty
  if (d === 'easy') return 'bg-green-100 text-green-600'
  if (d === 'medium') return 'bg-yellow-100 text-yellow-600'
  return 'bg-red-100 text-red-600'
})

const isCorrect = computed(() => {
  if (isEssayQuestion.value) return true
  if (isMultipleQuestion.value) {
    const userAns = multiAnswers.value[currentIndex.value]
    if (!userAns || !Array.isArray(userAns)) return false
    const correct = currentQuestion.value?.answer || []
    return JSON.stringify([...userAns].sort()) === JSON.stringify([...correct].sort())
  }
  return selectedOption.value === currentQuestion.value?.answer
})

const correctCount = computed(() => {
  let count = 0
  for (let i = 0; i < chapterQuestions.value.length; i++) {
    const q = chapterQuestions.value[i]
    if (!q) continue
    if (q.type === 'essay') {
      if (essayAnswers.value[i]) count++
      continue
    }
    if (q.type === 'multiple') {
      const userAns = multiAnswers.value[i]
      if (userAns && Array.isArray(userAns) && Array.isArray(q.answer)) {
        if (JSON.stringify([...userAns].sort()) === JSON.stringify([...q.answer].sort())) count++
      }
      continue
    }
    if (answers.value[i] === q.answer) count++
  }
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

// 格式化正确答案显示
function formatCorrectAnswer(q) {
  if (!q) return ''
  if (q.type === 'multiple') {
    const ans = q.answer || []
    return ans.map(i => optionLabels[i]).join('、')
  }
  if (q.type === 'judge') {
    return q.answer === 0 ? '正确' : '错误'
  }
  return optionLabels[q.answer] ?? '未知'
}

// 检查一个选项是否是正确答案（用于多选题结果显示）
function isCorrectAnswer(index) {
  const correct = currentQuestion.value?.answer || []
  return correct.includes(index)
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
  // 简答题默认正确，自动跳转
  startAutoAdvance()
}

// 单选题/判断题选择
const selectOption = async (index) => {
  if (showResult.value || isEssayQuestion.value || isMultipleQuestion.value) return
  selectedOption.value = index
  showResult.value = true
  answers.value[currentIndex.value] = index
  
  const correct = index === currentQuestion.value?.answer
  if (!correct) {
    await recordWrongQuestion(currentIndex.value, index)
  } else {
    // 答对：自动跳转下一题
    startAutoAdvance()
  }
}

// 多选题切换选项
const toggleOption = (index) => {
  if (showResult.value) return
  const newSet = new Set(selectedOptions.value)
  if (newSet.has(index)) {
    newSet.delete(index)
  } else {
    newSet.add(index)
  }
  selectedOptions.value = newSet
}

// 多选题提交答案
const submitMultiAnswer = async () => {
  if (showResult.value || selectedOptions.value.size === 0) return
  showResult.value = true
  const sorted = [...selectedOptions.value].sort()
  multiAnswers.value[currentIndex.value] = sorted
  const correct = (currentQuestion.value?.answer || []).sort()
  if (JSON.stringify(sorted) !== JSON.stringify(correct)) {
    await recordWrongQuestion(currentIndex.value, sorted)
  } else {
    // 答对：自动跳转下一题
    startAutoAdvance()
  }
}

// 获取选项样式 - 单选和判断
const getOptionClass = (index) => {
  const q = currentQuestion.value
  if (!showResult.value) {
    return selectedOption.value === index
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-200 hover:border-blue-300'
  }
  if (q?.type === 'judge') {
    if (index === q.answer) return 'border-green-500 bg-green-50'
    if (index === selectedOption.value) return 'border-red-500 bg-red-50'
    return 'border-gray-200 opacity-50'
  }
  if (index === q?.answer) return 'border-green-500 bg-green-50'
  if (index === selectedOption.value && index !== q?.answer) return 'border-red-500 bg-red-50'
  return 'border-gray-200 opacity-50'
}

// 多选题选项样式
const getMultiOptionClass = (index) => {
  const q = currentQuestion.value
  if (!showResult.value) {
    return selectedOptions.value.has(index)
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-200 hover:border-blue-300'
  }
  if (q?.answer?.includes(index)) return 'border-green-500 bg-green-50'
  if (selectedOptions.value.has(index)) return 'border-red-500 bg-red-50'
  return 'border-gray-200 opacity-50'
}

// 多选题选项角标
const getMultiBadgeClass = (index) => {
  const q = currentQuestion.value
  if (!showResult.value) {
    return selectedOptions.value.has(index)
      ? 'bg-blue-500 text-white border-blue-500'
      : 'bg-white text-gray-500 border-gray-300'
  }
  if (q?.answer?.includes(index)) return 'bg-green-500 text-white border-green-500'
  if (selectedOptions.value.has(index)) return 'bg-red-500 text-white border-red-500'
  return 'bg-gray-50 text-gray-400 border-gray-200'
}

const getOptionBadgeClass = (index) => {
  const q = currentQuestion.value
  if (!showResult.value || q?.type === 'multiple') {
    return selectedOption.value === index
      ? 'bg-blue-500 text-white'
      : 'bg-gray-100 text-gray-600'
  }
  if (q?.type === 'judge') {
    if (index === q.answer) return 'bg-green-500 text-white'
    if (index === selectedOption.value) return 'bg-red-500 text-white'
    return 'bg-gray-100 text-gray-400'
  }
  if (index === q?.answer) return 'bg-green-500 text-white'
  if (index === selectedOption.value && index !== q?.answer) return 'bg-red-500 text-white'
  return 'bg-gray-100 text-gray-400'
}

const getQuestionDotClass = (index) => {
  if (index === currentIndex.value) return 'bg-blue-500 scale-125'
  if (index < currentIndex.value) {
    const q = chapterQuestions.value[index]
    if (q?.type === 'essay') return essayAnswers.value[index] ? 'bg-green-500' : 'bg-yellow-500'
    if (q?.type === 'multiple') {
      const ans = multiAnswers.value[index]
      if (!ans) return 'bg-yellow-500'
      return JSON.stringify(ans.sort()) === JSON.stringify((q.answer || []).sort()) ? 'bg-green-500' : 'bg-red-500'
    }
    return answers.value[index] === q?.answer ? 'bg-green-500' : 'bg-red-500'
  }
  return 'bg-gray-300'
}

function buildWrongPayload(question, userAnswer) {
  return {
    source: 'practice',
    source_name: '章节练习',
    chapter_id: chapterId.value,
    chapter_name: currentChapter.value?.name,
    question_id: question?.id,
    question_type: question?.type || 'single',
    question: question?.question,
    options: question?.options || [],
    user_answer: typeof userAnswer === 'object' ? JSON.stringify(userAnswer) : userAnswer,
    correct_answer: typeof question?.answer === 'object' ? JSON.stringify(question.answer) : question?.answer,
    explanation: question?.explanation
  }
}

async function recordWrongQuestion(index, userAnswer) {
  if (wrongRecordedIndices.value[index]) return
  const question = chapterQuestions.value[index]
  if (!question || question.type === 'essay') return
  try {
    await wrongApi.add(buildWrongPayload(question, userAnswer))
    wrongRecordedIndices.value[index] = true
    toast.show('答错题目已自动加入错题本', 'info')
  } catch (e) {
    toast.show('错题保存失败：' + e.message, 'error')
  }
}

const nextQuestion = () => {
  cancelAutoAdvance()
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++
    selectedOption.value = answers.value[currentIndex.value] ?? null
    selectedOptions.value = new Set(multiAnswers.value[currentIndex.value] || [])
    essayAnswer.value = essayAnswers.value[currentIndex.value] || ''
    showResult.value = answers.value[currentIndex.value] !== undefined || 
      multiAnswers.value[currentIndex.value] !== undefined || 
      essayAnswers.value[currentIndex.value] !== undefined
  }
}

const goToQuestion = (index) => {
  currentIndex.value = index
  selectedOption.value = answers.value[index] ?? null
  selectedOptions.value = new Set(multiAnswers.value[index] || [])
  essayAnswer.value = essayAnswers.value[index] || ''
  showResult.value = answers.value[index] !== undefined || 
    multiAnswers.value[index] !== undefined || 
    essayAnswers.value[index] !== undefined
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
  const totalQ = answers.value.length + multiAnswers.value.length + Object.keys(essayAnswers.value).length
  if (timeSpent.value > 0) {
    sessionApi.log({
      duration_minutes: Math.ceil(timeSpent.value / 60),
      questions_answered: totalQ,
      correct_count: correctCount.value,
      notes: '章节练习：' + (currentChapter.value?.name || '')
    }).catch(() => {})
  }
  if (totalQ > 0) {
    practiceApi.saveScore({
      chapter_id: chapterId.value,
      score: accuracyPercent.value
    }).catch(() => {})
  }
})

const showResults = () => { showFinalResults.value = true }

const restartPractice = () => {
  currentIndex.value = 0
  selectedOption.value = null
  selectedOptions.value = new Set()
  essayAnswer.value = ''
  showResult.value = false
  showFinalResults.value = false
  answers.value = []
  multiAnswers.value = []
  essayAnswers.value = {}
  timeSpent.value = 0
  wrongRecordedIndices.value = {}
}
</script>
