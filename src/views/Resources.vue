<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
      <h1 class="text-3xl font-bold mb-2">学习资源</h1>
      <p class="text-blue-100">丰富的学习资料，助您高效备考</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          class="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl"
          @click="activeResource = '大纲'"
        >
          <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <FileText class="w-8 h-8 text-blue-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">考试大纲</h3>
          <p class="text-gray-500 text-sm">掌握考试重点，明确复习方向</p>
        </div>

        <div 
          class="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl"
          @click="activeResource = '真题'"
        >
          <div class="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <BookOpen class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">历年真题</h3>
          <p class="text-gray-500 text-sm">熟悉考试题型，把握命题规律</p>
        </div>

        <router-link 
          to="/mock-exam"
          class="bg-white rounded-xl shadow-lg p-6 block transform transition-all hover:scale-105 hover:shadow-xl"
        >
          <div class="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <FileQuestion class="w-8 h-8 text-purple-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">模拟考试</h3>
          <p class="text-gray-500 text-sm">全真模拟测试，检验学习成果</p>
        </router-link>

        <div 
          class="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl"
          @click="activeResource = '技巧'"
        >
          <div class="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
            <Lightbulb class="w-8 h-8 text-yellow-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">学习技巧</h3>
          <p class="text-gray-500 text-sm">高效学习方法，事半功倍</p>
        </div>
      </div>

      <div class="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
        <div v-if="activeResource === '大纲'" class="p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FileText class="w-6 h-6 mr-3 text-blue-600" />
            考试大纲
          </h2>
          
          <!-- 考试基本信息 -->
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">认证通用基础考试信息</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-3 bg-white rounded-lg shadow-sm">
                <div class="text-2xl font-bold text-blue-600">2小时</div>
                <div class="text-gray-500 text-sm">考试时间</div>
              </div>
              <div class="text-center p-3 bg-white rounded-lg shadow-sm">
                <div class="text-2xl font-bold text-green-600">100分</div>
                <div class="text-gray-500 text-sm">满分</div>
              </div>
              <div class="text-center p-3 bg-white rounded-lg shadow-sm">
                <div class="text-2xl font-bold text-orange-600">70分</div>
                <div class="text-gray-500 text-sm">及格线</div>
              </div>
              <div class="text-center p-3 bg-white rounded-lg shadow-sm">
                <div class="text-2xl font-bold text-purple-600">每年2次</div>
                <div class="text-gray-500 text-sm">考试频次</div>
              </div>
            </div>
            <div class="mt-4 p-4 bg-white rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">题型分布</h4>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">单选题 30题×1分=30分</span>
                <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">多选题 20题×2分=40分</span>
                <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">判断题 10题×1分=10分</span>
                <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">问答题 2题×10分=20分</span>
              </div>
            </div>
            <p class="mt-3 text-sm text-gray-500">* 新版大纲自2025年6月1日起实施（CCAA-TR-101-02:2025）</p>
          </div>
          
          <div class="space-y-6">
            <div v-for="(section, index) in examOutline" :key="index" class="border-b border-gray-200 pb-6">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">{{ section.title }}</h3>
              <div class="space-y-3">
                <div v-for="(item, idx) in section.items" :key="idx" class="flex items-start">
                  <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span class="text-blue-600 text-sm">{{ idx + 1 }}</span>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-800">{{ item.name }}</h4>
                    <p class="text-gray-500 text-sm mt-1">占比: {{ item.weight }}% | 难度: {{ item.difficulty }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeResource === '真题'" class="p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <BookOpen class="w-6 h-6 mr-3 text-green-600" />
            历年真题
          </h2>
          
          <div v-if="!selectedYear" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="yearInfo in availableYears" 
              :key="yearInfo.key"
              class="border border-gray-200 rounded-lg p-4 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer"
              @click="selectYear(yearInfo)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold text-gray-800">
                    {{ yearInfo.label }}认证通用基础真题
                    <span v-if="yearInfo.isMock" class="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">模拟题</span>
                  </h3>
                  <p class="text-gray-500 text-sm">{{ yearInfo.questions }}道题 | {{ yearInfo.duration }}分钟 | 及格线: {{ yearInfo.passingScore }}分</p>
                </div>
                <ChevronRight class="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div v-else>
            <button 
              @click="selectedYear = null"
              class="flex items-center text-gray-600 hover:text-blue-600 mb-6"
            >
              <ChevronLeft class="w-5 h-5 mr-2" />
              返回真题列表
            </button>
            
            <div v-for="(section, sIndex) in pastExamsData[selectedYear.key].sections" :key="sIndex">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ section.name }}</h3>
              <div class="space-y-4">
                <div 
                  v-for="(question, qIndex) in section.questions" 
                  :key="question.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-start">
                    <span class="font-semibold text-blue-600 mr-3">{{ qIndex + 1 }}.</span>
                    <div class="flex-1">
                      <p class="text-gray-800 mb-3">{{ question.question }}</p>
                      
                      <div v-if="question.options" class="space-y-2 mb-3">
                        <div 
                          v-for="(option, oIndex) in question.options" 
                          :key="oIndex"
                          class="flex items-center"
                        >
                          <span class="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 text-sm"
                            :class="getOptionClass(question, String.fromCharCode(65 + oIndex))">
                            {{ String.fromCharCode(65 + oIndex) }}
                          </span>
                          <span :class="isCorrectOption(question, String.fromCharCode(65 + oIndex)) ? 'text-green-600 font-medium' : 'text-gray-600'">
                            {{ option }}
                          </span>
                        </div>
                      </div>
                      
                      <div v-if="typeof question.answer === 'boolean'" class="mb-3">
                        <span class="text-gray-600">答案：</span>
                        <span :class="question.answer ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                          {{ question.answer ? '正确' : '错误' }}
                        </span>
                      </div>
                      
                      <div v-if="showAnswers" class="mt-4 p-4 bg-green-50 rounded-lg">
                        <div class="flex items-center mb-2">
                          <CheckCircle class="w-5 h-5 text-green-600 mr-2" />
                          <span class="font-semibold text-green-800">解析</span>
                        </div>
                        <p class="text-green-700">{{ question.analysis }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-between items-center">
              <span class="text-gray-600">{{ pastExamsData[selectedYear.key].sections.reduce((acc, s) => acc + s.questions.length, 0) }}道题目</span>
              <button 
                @click="showAnswers = !showAnswers"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {{ showAnswers ? '隐藏答案' : '显示答案' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeResource === '模拟'" class="p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FileQuestion class="w-6 h-6 mr-3 text-purple-600" />
            模拟考试
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              v-for="(exam, index) in mockExams" 
              :key="index"
              class="bg-gray-50 rounded-xl p-6 text-center hover:bg-purple-50 transition-colors cursor-pointer"
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

        <div v-if="activeResource === '技巧'" class="p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Lightbulb class="w-6 h-6 mr-3 text-yellow-600" />
            学习技巧
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(tip, index) in studyTips" :key="index" class="bg-yellow-50 rounded-xl p-6">
              <div class="flex items-start">
                <div class="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <span class="text-yellow-700 font-bold">{{ index + 1 }}</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800 mb-2">{{ tip.title }}</h3>
                  <p class="text-gray-600">{{ tip.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FileText, BookOpen, FileQuestion, Lightbulb, Download, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-vue-next'
import { pastExamsData } from '../data/pastExams'

const activeResource = ref('大纲')
const selectedYear = ref(null)
const showAnswers = ref(false)

const availableYears = computed(() => {
  const years = []
  Object.keys(pastExamsData).forEach(key => {
    const data = pastExamsData[key]
    if (data.months) {
      // 有多个考试月份
      data.months.forEach(month => {
        years.push({
          key: `${key}-${month}`,
          label: `${key}年${month}月`,
          questions: data.questions,
          duration: data.duration,
          passingScore: data.passingScore,
          isMock: data.isMock
        })
      })
    } else {
      years.push({
        key: key,
        label: `${key}年`,
        questions: data.questions,
        duration: data.duration,
        passingScore: data.passingScore,
        isMock: data.isMock
      })
    }
  })
  return years.sort((a, b) => b.key.localeCompare(a.key))
})

const examOutline = [
  {
    title: '第一章 合格评定基础知识（约40%）',
    items: [
      { name: '合格评定基本概念与知识', weight: 8, difficulty: '★★☆' },
      { name: '合格评定术语与定义', weight: 5, difficulty: '★★☆' },
      { name: '国家质量基础设施（NQI）', weight: 8, difficulty: '★★★' },
      { name: '合格评定工具箱', weight: 6, difficulty: '★★★' },
      { name: '合格评定功能法', weight: 10, difficulty: '★★★' },
      { name: '认证制度与认证方案', weight: 5, difficulty: '★★☆' },
      { name: '认可的概念', weight: 4, difficulty: '★★☆' }
    ]
  },
  {
    title: '第二章 审核通用知识（约40%）',
    items: [
      { name: '审核的概念与原则', weight: 8, difficulty: '★★★' },
      { name: '审核方案与审核计划', weight: 8, difficulty: '★★★' },
      { name: '审核技术', weight: 8, difficulty: '★★★' },
      { name: '典型审核流程', weight: 12, difficulty: '★★★' },
      { name: '认证人员能力要求', weight: 4, difficulty: '★★☆' }
    ]
  },
  {
    title: '第三章 法律法规知识（约20%）',
    items: [
      { name: '民法典合同编', weight: 2, difficulty: '★★☆' },
      { name: '产品质量法', weight: 2, difficulty: '★★☆' },
      { name: '计量法', weight: 2, difficulty: '★★☆' },
      { name: '标准化法', weight: 2, difficulty: '★★☆' },
      { name: '劳动法', weight: 2, difficulty: '★☆☆' },
      { name: '进出口商品检验法', weight: 2, difficulty: '★★☆' },
      { name: '行政许可法及其实施条例', weight: 2, difficulty: '★★☆' },
      { name: '认证认可条例', weight: 4, difficulty: '★★★' },
      { name: '特种设备安全法', weight: 2, difficulty: '★★☆' }
    ]
  },
  {
    title: '第四章 认证认可基础知识',
    items: [
      { name: 'CCAA简介', weight: 2, difficulty: '★☆☆' },
      { name: '认证人员注册管理制度', weight: 3, difficulty: '★★☆' },
      { name: '认证证书和认证标志管理', weight: 2, difficulty: '★★☆' }
    ]
  }
]

const mockExams = [
  { name: '基础模拟测试', questions: 50, duration: 60 },
  { name: '综合模拟测试', questions: 100, duration: 120 },
  { name: '冲刺模拟测试', questions: 100, duration: 90 }
]

const studyTips = [
  {
    title: '制定学习计划',
    content: '根据考试大纲制定详细的学习计划，合理安排每天的学习时间，确保每个知识点都能得到充分复习。'
  },
  {
    title: '理解重于记忆',
    content: '认证知识重在理解，不要死记硬背。结合实际案例理解概念，这样更容易记住并且能够灵活运用。'
  },
  {
    title: '多做练习题',
    content: '通过做题可以检验学习效果，发现薄弱环节。建议每天做一定量的练习题，并认真分析错题原因。'
  },
  {
    title: '制作思维导图',
    content: '将复杂的知识点整理成思维导图，可以帮助建立知识体系，理清各知识点之间的关系。'
  },
  {
    title: '定期复习',
    content: '根据遗忘曲线，定期复习已学内容。建议每周进行一次周总结，每月进行一次月复习。'
  },
  {
    title: '模拟考试环境',
    content: '在考试前进行模拟考试，熟悉考试流程和时间管理，提高应试能力和心理素质。'
  }
]

const selectYear = (yearInfo) => {
  selectedYear.value = yearInfo
  showAnswers.value = false
}

const isCorrectOption = (question, option) => {
  if (Array.isArray(question.answer)) {
    return question.answer.includes(option)
  }
  return question.answer === option
}

const getOptionClass = (question, option) => {
  if (!showAnswers.value) {
    return 'border-gray-300 text-gray-600'
  }
  if (isCorrectOption(question, option)) {
    return 'border-green-500 text-green-600 bg-green-100'
  }
  return 'border-gray-300 text-gray-600'
}
</script>