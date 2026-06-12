<template>
  <div class="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50 py-10">
    <div class="max-w-5xl mx-auto px-4">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow text-sm text-gray-700 mb-4">
          <Rocket class="w-4 h-4" /> 趣味闯关 · 章节知识大挑战
        </div>
        <h1 class="text-4xl font-bold text-gray-800 mb-2">学习闯关</h1>
        <p class="text-gray-600">选择一个章节，挑战「合格评定」知识关卡，每答对 +5 积分！</p>
      </div>

      <div v-if="!stage" class="grid md:grid-cols-2 gap-4">
        <div
          v-for="chapter in courseData.chapters"
          :key="chapter.id"
          class="bg-white rounded-2xl p-6 shadow hover:shadow-xl transition cursor-pointer"
          @click="selectChapter(chapter)"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="text-xs font-semibold text-blue-600 mb-1">第 {{ chapter.id }} 章</div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ chapter.name }}</h3>
              <p class="text-sm text-gray-500">{{ chapter.topics?.length || 10 }} 个知识点 · 建议用时 10 分钟</p>
            </div>
            <div class="text-5xl">{{ ['📘','📗','📙','📕'][chapter.id - 1] || '📚' }}</div>
          </div>
          <div class="mt-4 flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ stageStats[chapter.id]?.score || 0 }} 分</span>
            <span class="text-blue-600 font-medium hover:underline">开始挑战 →</span>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-xl p-8">
        <div class="flex items-center justify-between mb-6">
          <button @click="exitStage" class="text-gray-600 hover:text-gray-900 text-sm flex items-center">
            <ArrowLeft class="w-4 h-4 mr-1" /> 返回章节列表
          </button>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-700">
              第 {{ stage.id }} 章 · 第 {{ questionIndex + 1 }} 题 / 共 {{ stageQuestions.length }} 题
            </span>
            <span v-if="comboCount >= 2" class="inline-flex items-center px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold animate-bounce-in">
              🔥 {{ comboCount }}连击！
            </span>
          </div>
        </div>

        <div class="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div
            class="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            :style="{ width: ((questionIndex + 1) / stageQuestions.length) * 100 + '%' }"
          ></div>
        </div>

        <div v-if="!showResult" class="mb-6">
          <div class="flex items-center space-x-2 mb-3">
            <span class="px-2 py-0.5 text-xs rounded-full"
              :class="currentQuestion?.difficulty === 'easy' ? 'bg-green-100 text-green-600' : 
                      currentQuestion?.difficulty === 'hard' ? 'bg-red-100 text-red-600' : 
                      'bg-yellow-100 text-yellow-600'">
              {{ currentQuestion?.difficulty === 'easy' ? '简单' : currentQuestion?.difficulty === 'hard' ? '困难' : '中等' }}
            </span>
            <span v-if="currentQuestion?.type === 'multiple'" class="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">多选题</span>
            <span v-else-if="currentQuestion?.type === 'judge'" class="px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full text-xs">判断题</span>
          </div>
          <h2 class="text-xl font-semibold text-gray-800 mb-4 leading-relaxed">{{ currentQuestion?.question }}</h2>
          <div class="space-y-3">
            <button
              v-for="(opt, idx) in currentQuestion?.options"
              :key="idx"
              @click="answer(idx)"
              class="w-full text-left p-4 rounded-xl border-2 transition flex items-start gap-3"
              :class="[
                selected === idx && showResultFeedback
                  ? (idx === currentQuestion.answer ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                  : selected === idx
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              ]"
              :disabled="showResultFeedback"
            >
              <div class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
                :class="selected === idx && showResultFeedback
                  ? (idx === currentQuestion.answer ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                  : 'bg-gray-100 text-gray-700'"
              >
                {{ labels[idx] }}
              </div>
              <span class="text-gray-700">{{ opt }}</span>
            </button>
          </div>

          <div v-if="showResultFeedback" class="mt-4 p-4 rounded-xl"
            :class="isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
            <div class="font-semibold mb-1 flex items-center">
              <span v-if="isCorrect" class="text-lg">🎉 回答正确！{{ comboCount >= 2 ? `🔥 ${comboCount}连击！` : '+5积分' }}</span>
              <span v-else class="text-lg">😅 答错了</span>
            </div>
            <div class="text-sm leading-relaxed mt-1">{{ currentQuestion.explanation }}</div>
            <button @click="next" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              下一题 →
            </button>
          </div>
        </div>

      <div v-else class="text-center py-6">
          <ConfettiEffect :active="showConfetti" @done="showConfetti = false" />
          <div class="text-6xl mb-4">{{ resultEmoji }}</div>
          <div class="flex justify-center mb-4">
            <span v-for="s in stars" :key="s" class="text-4xl mx-1 animate-bounce-in" :style="{ animationDelay: s * 0.2 + 's' }">⭐</span>
            <span v-for="s in (3 - stars)" :key="'e' + s" class="text-4xl mx-1 text-gray-300">☆</span>
          </div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">挑战完成！</h2>
          <p class="text-gray-600 mb-6">
            共 {{ stageQuestions.length }} 题，答对 <span class="text-green-600 font-bold">{{ correctCount }}</span> 题
            ，<span class="text-gray-500">正确率 {{ accuracyPercent }}%</span>
            ，得 <span class="text-blue-600 font-bold">{{ score }}</span> 积分
            <span v-if="maxCombo >= 2">，最高 <span class="text-orange-600 font-bold">{{ maxCombo }}</span> 连击</span>
          </p>
          <div class="flex justify-center gap-3">
            <button @click="exitStage" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">返回列表</button>
            <button @click="startStage(stage.id)" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">再挑战一次</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Rocket, ArrowLeft } from 'lucide-vue-next'
import { courseData } from '../data/courseData'
import { questions } from '../data/questions'
import { useAuthStore, useToastStore } from '../stores/index.js'
import { progressApi, wrongApi, sessionApi } from '../utils/request.js'
import ConfettiEffect from '../components/ConfettiEffect.vue'

const auth = useAuthStore()
const toast = useToastStore()
const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const stage = ref(null)
const stageQuestions = ref([])
const questionIndex = ref(0)
const selected = ref(null)
const showResultFeedback = ref(false)
const showResult = ref(false)
const correctCount = ref(0)
const comboCount = ref(0)
const maxCombo = ref(0)
const stageStats = ref({})
const showConfetti = ref(false)

// 完成挑战时触发庆祝
watch(showResult, (val) => {
  if (val && stars.value >= 3) {
    showConfetti.value = true
  }
})

const fallbackPool = [
  { question: '合格评定的主要对象不包括？', options: ['产品', '过程', '政府机构', '人员'], answer: 2, explanation: '合格评定不针对政府机构。' },
  { question: 'ISO/IEC 17025 是什么标准？', options: ['检测和校准实验室能力认可', '质量管理体系', '环境管理体系', '人员认证'], answer: 0, explanation: 'ISO/IEC 17025 是检测和校准实验室能力认可的国际标准。' },
  { question: '认证和认可的区别是？', options: ['无区别', '认证针对产品/体系，认可针对机构', '认证=政府，认可=民间', '认证=培训'], answer: 1, explanation: '认证是第三方证明符合性，认可是权威机构对认证机构的能力证明。' },
  { question: '合格评定的基本原则是？', options: ['公正性与独立性', '速度', '低成本', '严格保密信息'], answer: 0, explanation: '公正性、独立性是合格评定的核心原则。' },
  { question: '以下哪个属于合格评定工具箱？', options: ['ISO 9001', '认证、检测、校准、认可', '员工手册', '财务报表'], answer: 1, explanation: '合格评定工具箱包括认证、检测、检查、校准、认可等。' }
]

const accuracyPercent = computed(() => {
  if (stageQuestions.value.length === 0) return 0
  return Math.round((correctCount.value / stageQuestions.value.length) * 100)
})

// 星级评价：>=90%三颗星，>=70%两颗星，其余一颗星
const stars = computed(() => {
  const pct = accuracyPercent.value
  if (pct >= 90) return 3
  if (pct >= 70) return 2
  return 1
})

const resultEmoji = computed(() => {
  if (stars.value >= 3) return '🏆'
  if (stars.value >= 2) return '🎉'
  return '🌱'
})

function selectChapter(chapter) {
  stage.value = chapter
  startStage(chapter.id)
}

function startStage(chapterId) {
  // 收集本章所有题目（单选+多选+判断）
  const singlePool = questions['chapter' + chapterId] || []
  const multiPool = (questions.multipleChoice || []).filter(q => q.chapter === chapterId)
  const judgePool = (questions.trueFalse || []).filter(q => q.chapter === chapterId)
  const pool = singlePool.length > 0 ? [...singlePool, ...multiPool, ...judgePool] : fallbackPool
  stageQuestions.value = shuffle(pool.slice()).slice(0, 6) // 增加为6题
  questionIndex.value = 0
  selected.value = null
  showResultFeedback.value = false
  showResult.value = false
  correctCount.value = 0
  comboCount.value = 0
  maxCombo.value = 0
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const currentQuestion = computed(() => stageQuestions.value[questionIndex.value])
const isCorrect = computed(() => selected.value === currentQuestion.value?.answer)

const score = computed(() => correctCount.value * 5)

async function answer(idx) {
  selected.value = idx
  showResultFeedback.value = true
  if (isCorrect.value) {
    correctCount.value++
    comboCount.value++
    if (comboCount.value > maxCombo.value) maxCombo.value = comboCount.value
  } else {
    comboCount.value = 0
    try {
      if (auth.isLogin) {
        await wrongApi.add({
          chapter_id: stage.value.id,
          question: currentQuestion.value.question,
          options: currentQuestion.value.options,
          user_answer: idx,
          correct_answer: currentQuestion.value.answer,
          explanation: currentQuestion.value.explanation
        })
      }
    } catch (e) {}
  }
}

async function next() {
  if (questionIndex.value + 1 < stageQuestions.value.length) {
    questionIndex.value++
    selected.value = null
    showResultFeedback.value = false
    return
  }
  // 完成
  showResult.value = true
  if (auth.isLogin) {
    try {
      const add = score.value
      await sessionApi.log({
        session_date: new Date().toISOString().slice(0, 10),
        duration_minutes: 5,
        topics_completed: correctCount.value,
        notes: '趣味闯关：' + stage.value.name + ' ' + correctCount.value + '/' + stageQuestions.value.length
      })
      toast.show(`闯关完成！获得 ${add} 积分${maxCombo.value >= 3 ? `，最高${maxCombo.value}连击🔥` : ''}`, 'success')
    } catch (e) {}
    try {
      if (accuracyPercent.value >= 70) {
        await progressApi.markComplete({
          chapter_id: stage.value.id,
          topic_id: 999,
          topic_name: '趣味闯关'
        })
      }
    } catch (e) {}
  }
  stageStats.value[stage.value.id] = { score: score.value }
}

function exitStage() {
  stage.value = null
}
</script>
