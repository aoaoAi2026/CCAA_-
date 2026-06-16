<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
      <h1 class="text-3xl font-bold mb-2">模拟考试</h1>
      <p class="text-blue-100">全真模拟测试，检验学习成果</p>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 考试选择 -->
      <div v-if="examState === 'select'" class="bg-white rounded-xl shadow-lg p-8">
        <h2 class="text-xl font-bold text-gray-800 mb-6">选择模拟考试</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="(exam, index) in mockExams" 
            :key="index"
            class="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer"
            @click="startExam(exam)"
          >
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-purple-600">{{ index + 1 }}</span>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">{{ exam.name }}</h3>
            <p class="text-gray-500 text-sm mb-4">{{ exam.questions }}题 | {{ exam.duration }}分钟</p>
            <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              开始考试
            </button>
          </div>
        </div>
      </div>

      <!-- 考试进行中 -->
      <div v-else-if="examState === 'testing'" class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- 考试信息栏 -->
        <div class="bg-gray-50 border-b p-4 flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <span class="font-medium text-gray-800">{{ currentExam?.name }}</span>
            <span class="text-gray-600">第 {{ currentQuestionIndex + 1 }} / {{ examQuestions.length }} 题</span>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <Clock class="w-5 h-5 text-gray-600 mr-2" />
              <span :class="remainingTime < 300 ? 'text-red-600 font-bold' : 'text-gray-600'">
                {{ formatTime(remainingTime) }}
              </span>
            </div>
            <button 
              @click="showConfirmEnd = true"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              交卷
            </button>
          </div>
        </div>

        <!-- 题目列表 -->
        <div class="p-6">
          <div class="flex justify-between mb-6">
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="(q, idx) in examQuestions" 
                :key="q.id"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all"
                :class="getQuestionClass(idx)"
                @click="goToQuestion(idx)"
              >
                {{ idx + 1 }}
              </div>
            </div>
          </div>

          <!-- 当前题目 -->
          <div class="border border-gray-200 rounded-lg p-6 mb-6">
            <div class="flex items-start mb-4">
              <span class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                {{ currentQuestionIndex + 1 }}
              </span>
              <div class="flex-1">
                <span class="text-gray-500 text-sm mb-2 block">
                  {{ getQuestionType(currentQuestion.type) }}
                  <span v-if="currentQuestion.score" class="ml-2 text-xs text-gray-400">（{{ currentQuestion.score }}分）</span>
                </span>
                <p class="text-lg text-gray-800">{{ currentQuestion.question }}</p>
              </div>
            </div>

            <!-- 单选题/判断题选项 (点击即答) -->
            <div v-if="currentQuestion.options && currentQuestion.type !== 'multiple'" class="space-y-3 mt-4">
              <div 
                v-for="(option, idx) in currentQuestion.options" 
                :key="idx"
                class="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all"
                :class="getOptionClass(idx)"
                @click="selectAnswer(idx)"
              >
                <span class="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4"
                  :class="getOptionBadgeClass(idx)">
                  {{ optionLabels[idx] }}
                </span>
                <span class="flex-1">{{ option }}</span>
                <CheckCircle v-if="showResults && isCorrectAnswer(idx)" class="w-5 h-5 text-green-500" />
                <XCircle v-else-if="showResults && !isMultiAnswer && userAnswers[currentQuestionIndex] === idx && !isCorrectAnswer(idx)" class="w-5 h-5 text-red-500" />
              </div>
            </div>

            <!-- 多选题选项 (可多选, 需提交) -->
            <div v-else-if="currentQuestion.type === 'multiple'" class="space-y-3 mt-4">
              <div 
                v-for="(option, idx) in currentQuestion.options" 
                :key="idx"
                class="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all"
                :class="getMultiOptionClass(idx)"
                @click="toggleMultiAnswer(idx)"
              >
                <span class="w-8 h-8 rounded flex items-center justify-center mr-4 border-2"
                  :class="getMultiBadgeClass(idx)">
                  <Check v-if="!showResults && currentMultiSelection.has(idx)" class="w-5 h-5" />
                  <span v-else-if="!showResults">{{ optionLabels[idx] }}</span>
                  <Check v-else-if="isCorrectAnswer(idx)" class="w-5 h-5" />
                  <X v-else-if="currentMultiSelection.has(idx) && !isCorrectAnswer(idx)" class="w-5 h-5" />
                  <span v-else class="text-gray-400">{{ optionLabels[idx] }}</span>
                </span>
                <span class="flex-1">{{ option }}</span>
              </div>
              <!-- 多选题提交按钮 -->
              <button
                v-if="!showResults"
                @click="submitMultiAnswer"
                :disabled="currentMultiSelection.size === 0"
                class="w-full mt-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <CheckCircle class="w-5 h-5 mr-2" />
                提交答案（已选 {{ currentMultiSelection.size }} 项）
              </button>
            </div>

            <!-- 简答题答题区 -->
            <div v-else-if="currentQuestion.type === 'essay'" class="mt-4">
              <textarea
                v-model="userEssayAnswers[currentQuestionIndex]"
                :disabled="showResults"
                placeholder="请在此输入您的答案..."
                class="w-full h-48 p-4 border-2 rounded-lg resize-none focus:outline-none focus:border-blue-500"
                :class="showResults ? 'border-gray-200 bg-gray-50' : 'border-gray-200 hover:border-blue-300'"
              ></textarea>
            </div>

            <!-- 答案解析 -->
            <div v-if="showResults" class="mt-6 p-4 bg-green-50 rounded-lg">
              <div class="flex items-center mb-2">
                <Lightbulb class="w-5 h-5 text-green-600 mr-2" />
                <span class="font-semibold text-green-800">答案解析</span>
              </div>
              
              <!-- 选择题答案 -->
              <template v-if="currentQuestion.options">
                <p class="text-green-700">
                  <span class="font-medium">正确答案：</span>
                  <template v-if="currentQuestion.type === 'multiple' && Array.isArray(currentQuestion.answer)">
                    {{ currentQuestion.answer.map(i => optionLabels[i]).join('、') }}
                  </template>
                  <template v-else>
                    {{ optionLabels[currentQuestion.answer] }}
                  </template>
                </p>
                <p class="text-green-700 mt-2">{{ currentQuestion.explanation }}</p>
              </template>
              
              <!-- 简答题答案 -->
              <template v-else>
                <div class="mb-3">
                  <span class="font-medium text-green-800">参考答案：</span>
                </div>
                <div class="bg-white p-4 rounded-lg border border-green-200">
                  <pre class="whitespace-pre-wrap text-green-700 text-sm">{{ currentQuestion.answer }}</pre>
                </div>
                <p class="text-green-700 mt-3"><strong>解析：</strong>{{ currentQuestion.explanation }}</p>
                <!-- 简答题自我评价 -->
                <div v-if="showResults && essaySelfEval[currentQuestionIndex] === undefined" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p class="text-yellow-800 text-sm font-medium mb-3">请对照参考答案，评价你的答案：</p>
                  <div class="flex space-x-3">
                    <button @click="essaySelfEval = {...essaySelfEval, [currentQuestionIndex]: true}" class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center">
                      <CheckCircle class="w-4 h-4 mr-1" />答对了
                    </button>
                    <button @click="essaySelfEval = {...essaySelfEval, [currentQuestionIndex]: false}" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center">
                      <XCircle class="w-4 h-4 mr-1" />答错了
                    </button>
                  </div>
                </div>
              </template>
              
              <div v-if="currentQuestion.keyPoints" class="mt-3">
                <span class="font-medium text-green-800">要点总结：</span>
                <ul class="mt-1">
                  <li v-for="(point, i) in currentQuestion.keyPoints" :key="i" class="text-green-700 text-sm">• {{ point }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 导航按钮 -->
          <div class="flex justify-between">
            <button 
              @click="prevQuestion"
              :disabled="currentQuestionIndex === 0"
              class="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft class="w-5 h-5 mr-2" />
              上一题
            </button>
            <button 
              @click="nextQuestion"
              :disabled="currentQuestionIndex === examQuestions.length - 1 && !showResults"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {{ currentQuestionIndex === examQuestions.length - 1 ? '查看结果' : '下一题' }}
              <ChevronRight class="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>

      <!-- 考试结果 -->
      <div v-else-if="examState === 'result'" class="bg-white rounded-xl shadow-lg p-8">
        <div class="text-center mb-8">
          <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy class="w-12 h-12 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">考试完成！</h2>
          <p class="text-gray-500">{{ currentExam?.name }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-blue-50 rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-blue-600">{{ score }}</div>
            <div class="text-gray-600 text-sm">得分</div>
          </div>
          <div class="bg-green-50 rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-green-600">{{ correctCount }}</div>
            <div class="text-gray-600 text-sm">选择题正确</div>
          </div>
          <div class="bg-red-50 rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-red-600">{{ wrongCount }}</div>
            <div class="text-gray-600 text-sm">选择题错误</div>
          </div>
          <div class="bg-purple-50 rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-purple-600">{{ essayCount }}</div>
            <div class="text-gray-600 text-sm">简答题数量</div>
          </div>
        </div>

        <div class="mb-6">
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all"
              :style="{ width: accuracy + '%' }"
            ></div>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <button 
            @click="reviewExam"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            查看解析
          </button>
          <router-link
            v-if="wrongNotebookAddedCount > 0"
            to="/wrong-notebook"
            class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            查看错题本
          </router-link>
          <button 
            @click="backToSelect"
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>

    <!-- 确认交卷弹窗 -->
    <div v-if="showConfirmEnd" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold text-gray-800 mb-4">确认交卷</h3>
        <p class="text-gray-600 mb-6">
          您还有 {{ examQuestions.length - answeredCount }} 题未作答，确定要交卷吗？
        </p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showConfirmEnd = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            继续答题
          </button>
          <button 
            @click="endExam"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            确认交卷
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Clock, CheckCircle, XCircle, Lightbulb, ChevronLeft, ChevronRight, Trophy, Check, X } from 'lucide-vue-next'
import { questions } from '../data/questions'
import { courseData } from '../data/courseData'
import { wrongApi } from '../utils/request.js'
import { useToastStore } from '../stores/index.js'

const examState = ref('select') // select, testing, result
const currentExam = ref(null)
const examQuestions = ref([])
const currentQuestionIndex = ref(0)
const userAnswers = ref({})          // 单选/判断答案
const userMultiAnswers = ref({})     // 多选题答案 { index: [sorted array] }
const userEssayAnswers = ref({})
const essaySelfEval = ref({}) // 简答题自我评价 { [index]: true/false }
const currentMultiSelection = ref(new Set()) // 当前多选题的选中状态
const remainingTime = ref(0)
const showResults = ref(false)
const showConfirmEnd = ref(false)
const wrongNotebookAddedCount = ref(0)
const wrongNotebookSynced = ref(false)
const endingExam = ref(false)
const toast = useToastStore()
let timer = null

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const mockExams = [
  { name: '基础模拟测试', questions: 50, duration: 60, chapters: [1, 2, 3, 4], essayCount: 2 },
  { name: '综合模拟测试', questions: 100, duration: 120, chapters: [1, 2, 3, 4], essayCount: 4 },
  { name: '冲刺模拟测试', questions: 60, duration: 90, chapters: [1, 2, 3, 4], essayCount: 2 }
]

const currentQuestion = computed(() => examQuestions.value[currentQuestionIndex.value] || {})
const isMultiAnswer = computed(() => currentQuestion.value.type === 'multiple')

// 判断某个选项是否正确答案
function isCorrectAnswer(idx) {
  const q = currentQuestion.value
  if (!q) return false
  if (q.type === 'multiple' && Array.isArray(q.answer)) {
    return q.answer.includes(idx)
  }
  return q.answer === idx
}

const score = computed(() => {
  let correct = 0
  let totalEssayScore = 0
  const choiceQs = examQuestions.value.filter(q => q.type !== 'essay')
  
  examQuestions.value.forEach((q, idx) => {
    if (q.type === 'essay') {
      if (essaySelfEval.value[idx] === true) {
        totalEssayScore += q.score || 10
      }
      return
    }
    const isMulti = q.type === 'multiple' && Array.isArray(q.answer)
    const userAns = isMulti ? userMultiAnswers.value[idx] : userAnswers.value[idx]
    if (userAns === undefined) return // 未作答
    
    if (isMulti) {
      if (JSON.stringify([...userAns].sort()) === JSON.stringify([...q.answer].sort())) correct++
    } else if (userAns === q.answer) {
      correct++
    }
  })
  
  const choiceScore = choiceQs.length > 0 ? Math.round((correct / choiceQs.length) * 60) : 0
  return Math.min(choiceScore + totalEssayScore, 100)
})

const correctCount = computed(() => {
  let count = 0
  examQuestions.value.forEach((q, idx) => {
    if (q.type === 'essay') return
    const isMulti = q.type === 'multiple' && Array.isArray(q.answer)
    const userAns = isMulti ? userMultiAnswers.value[idx] : userAnswers.value[idx]
    if (userAns === undefined) return
    if (isMulti) {
      if (JSON.stringify([...userAns].sort()) === JSON.stringify([...q.answer].sort())) count++
    } else if (userAns === q.answer) {
      count++
    }
  })
  return count
})

const wrongCount = computed(() => examQuestions.value.filter(q => q.type !== 'essay').length - correctCount.value)

const essayCount = computed(() => examQuestions.value.filter(q => q.type === 'essay').length)

const accuracy = computed(() => {
  const choiceQuestions = examQuestions.value.filter(q => q.type !== 'essay')
  if (choiceQuestions.length === 0) return 0
  return Math.round((correctCount.value / choiceQuestions.length) * 100)
})

const answeredCount = computed(() => {
  let count = Object.keys(userAnswers.value).length + Object.keys(userMultiAnswers.value).length
  Object.keys(userEssayAnswers.value).forEach(key => {
    if (userEssayAnswers.value[key] && userEssayAnswers.value[key].trim()) count++
  })
  return count
})

const getChapterName = (chapterId) => {
  return courseData.chapters.find((c) => c.id === chapterId)?.name || `第${chapterId}章`
}

function buildWrongPayload(question, idx) {
  const isMulti = question.type === 'multiple' && Array.isArray(question.answer)
  const userAns = isMulti ? userMultiAnswers.value[idx] : userAnswers.value[idx]
  return {
    source: 'mock-exam',
    source_name: currentExam.value?.name || '模拟考试',
    chapter_id: question.chapter_id,
    chapter_name: question.chapter_name || '',
    question_id: question.id,
    question_type: question.type || 'single',
    question: question.question,
    options: question.options || [],
    user_answer: isMulti ? JSON.stringify(userAns || []) : userAns,
    correct_answer: isMulti ? JSON.stringify(question.answer) : question.answer,
    explanation: question.explanation
  }
}

const syncWrongQuestionsToNotebook = async () => {
  if (wrongNotebookSynced.value) return
  const wrongItems = []
  for (let idx = 0; idx < examQuestions.value.length; idx++) {
    const q = examQuestions.value[idx]
    if (!q || q.type === 'essay') continue
    const isMulti = q.type === 'multiple' && Array.isArray(q.answer)
    const userAns = isMulti ? userMultiAnswers.value[idx] : userAnswers.value[idx]
    if (userAns === undefined) continue
    const isCorrect = isMulti
      ? JSON.stringify([...userAns].sort()) === JSON.stringify([...q.answer].sort())
      : userAns === q.answer
    if (isCorrect) continue
    wrongItems.push(buildWrongPayload(q, idx))
  }
  if (wrongItems.length > 0) {
    await wrongApi.batchAdd(wrongItems)
  }
  wrongNotebookAddedCount.value = wrongItems.length
  wrongNotebookSynced.value = true
  if (wrongItems.length > 0) toast.show(`已自动加入错题本 ${wrongItems.length} 题`, 'info')
}

const startExam = (exam) => {
  currentExam.value = exam
  remainingTime.value = exam.duration * 60
  userAnswers.value = {}
  userMultiAnswers.value = {}
  userEssayAnswers.value = {}
  essaySelfEval.value = {}
  currentMultiSelection.value = new Set()
  currentQuestionIndex.value = 0
  showResults.value = false
  wrongNotebookAddedCount.value = 0
  wrongNotebookSynced.value = false
  endingExam.value = false
  
  const allChoiceQuestions = []
  exam.chapters.forEach(chapter => {
    // 单选题
    const singles = (questions[`chapter${chapter}`] || []).map(q => ({
      ...q, chapter_id: chapter, chapter_name: getChapterName(chapter), question_type: q.type || 'single'
    }))
    allChoiceQuestions.push(...singles)
    // 多选题
    const multis = (questions.multipleChoice || []).filter(q => q.chapter === chapter).map(q => ({
      ...q, chapter_id: chapter, chapter_name: getChapterName(chapter), question_type: 'multiple'
    }))
    allChoiceQuestions.push(...multis)
    // 判断题
    const judges = (questions.trueFalse || []).filter(q => q.chapter === chapter).map(q => ({
      ...q, chapter_id: chapter, chapter_name: getChapterName(chapter), question_type: 'judge'
    }))
    allChoiceQuestions.push(...judges)
  })
  
  const shuffledChoice = allChoiceQuestions.sort(() => Math.random() - 0.5)
  const totalMC = exam.questions - exam.essayCount
  const selectedChoice = shuffledChoice.slice(0, Math.min(totalMC, shuffledChoice.length))
  
  // 随机抽取简答题（含essayExtra）
  const allEssayQuestions = [...(questions.essay || []), ...(questions.essayExtra || [])]
  const shuffledEssay = allEssayQuestions.sort(() => Math.random() - 0.5)
  const selectedEssay = shuffledEssay.slice(0, exam.essayCount).map(q => ({
    ...q, chapter_id: null, chapter_name: '简答题', question_type: q.type || 'essay'
  }))
  
  examQuestions.value = [...selectedChoice, ...selectedEssay].sort(() => Math.random() - 0.5)
  examState.value = 'testing'
  
  timer = setInterval(() => {
    if (remainingTime.value > 0) remainingTime.value--
    else endExam()
  }, 1000)
}

const endExam = async () => {
  if (endingExam.value) return
  endingExam.value = true
  if (timer) { clearInterval(timer); timer = null }
  showConfirmEnd.value = false
  showResults.value = true
  try {
    await syncWrongQuestionsToNotebook()
  } catch (e) {
    toast.show('同步错题本失败：' + e.message, 'error')
  } finally {
    examState.value = 'result'
    endingExam.value = false
  }
}

const reviewExam = () => {
  showResults.value = true
  examState.value = 'testing'
  currentQuestionIndex.value = 0
}

const backToSelect = () => {
  examState.value = 'select'
  currentExam.value = null
  examQuestions.value = []
}

// 单选题/判断题选择
const selectAnswer = (idx) => {
  if (showResults.value || isMultiAnswer.value) return
  userAnswers.value[currentQuestionIndex.value] = idx
}

// 多选题切换选项
const toggleMultiAnswer = (idx) => {
  if (showResults.value) return
  const newSet = new Set(currentMultiSelection.value)
  if (newSet.has(idx)) newSet.delete(idx)
  else newSet.add(idx)
  currentMultiSelection.value = newSet
}

// 多选题提交答案
const submitMultiAnswer = () => {
  if (showResults.value || currentMultiSelection.value.size === 0) return
  const sorted = [...currentMultiSelection.value].sort()
  userMultiAnswers.value[currentQuestionIndex.value] = sorted
}

const goToQuestion = (idx) => {
  currentQuestionIndex.value = idx
  // 恢复当前题目的多选状态
  const saved = userMultiAnswers.value[idx]
  currentMultiSelection.value = saved ? new Set(saved) : new Set()
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    const saved = userMultiAnswers.value[currentQuestionIndex.value]
    currentMultiSelection.value = saved ? new Set(saved) : new Set()
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < examQuestions.value.length - 1) {
    currentQuestionIndex.value++
    const saved = userMultiAnswers.value[currentQuestionIndex.value]
    currentMultiSelection.value = saved ? new Set(saved) : new Set()
  } else {
    endExam()
  }
}

const getQuestionClass = (idx) => {
  const q = examQuestions.value[idx]
  if (!q) return 'bg-gray-100 text-gray-600'
  if (q.type === 'essay') {
    return userEssayAnswers.value[idx]?.trim() ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
  }
  const isMulti = q.type === 'multiple' && Array.isArray(q.answer)
  const hasAnswer = isMulti
    ? userMultiAnswers.value[idx] !== undefined
    : userAnswers.value[idx] !== undefined
  if (hasAnswer) return 'bg-green-100 text-green-700'
  if (idx === currentQuestionIndex.value) return 'bg-blue-500 text-white'
  return 'bg-gray-100 text-gray-600'
}

const getOptionClass = (idx) => {
  if (showResults.value) {
    if (isCorrectAnswer(idx)) return 'border-green-500 bg-green-50'
    if (userAnswers.value[currentQuestionIndex.value] === idx) return 'border-red-500 bg-red-50'
    return 'border-gray-200 bg-gray-50'
  }
  if (userAnswers.value[currentQuestionIndex.value] === idx) return 'border-blue-500 bg-blue-50'
  return 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
}

const getOptionBadgeClass = (idx) => {
  if (showResults.value) {
    if (isCorrectAnswer(idx)) return 'border-green-500 bg-green-500 text-white'
    if (userAnswers.value[currentQuestionIndex.value] === idx) return 'border-red-500 bg-red-500 text-white'
    return 'border-gray-300 text-gray-600'
  }
  if (userAnswers.value[currentQuestionIndex.value] === idx) return 'border-blue-500 bg-blue-500 text-white'
  return 'border-gray-300 text-gray-600'
}

// 多选题选项样式
const getMultiOptionClass = (idx) => {
  if (showResults.value) {
    if (isCorrectAnswer(idx)) return 'border-green-500 bg-green-50'
    if (currentMultiSelection.value.has(idx)) return 'border-red-500 bg-red-50'
    return 'border-gray-200 bg-gray-50 opacity-70'
  }
  return currentMultiSelection.value.has(idx)
    ? 'border-blue-500 bg-blue-50'
    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
}

const getMultiBadgeClass = (idx) => {
  if (showResults.value) {
    if (isCorrectAnswer(idx)) return 'border-green-500 bg-green-500 text-white'
    if (currentMultiSelection.value.has(idx)) return 'border-red-500 bg-red-500 text-white'
    return 'border-gray-300 text-gray-600'
  }
  return currentMultiSelection.value.has(idx)
    ? 'border-blue-500 bg-blue-500 text-white'
    : 'border-gray-300 text-gray-600'
}

const getQuestionType = (type) => {
  const types = { essay: '简答题', single: '单选题', multiple: '多选题', judge: '判断题' }
  return types[type] || '单选题'
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
