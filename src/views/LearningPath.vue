<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-4">学习路线</h1>
        <p class="text-gray-600 dark:text-slate-300">按照科学的学习路径，循序渐进掌握认通基知识</p>
      </div>

      <div class="relative">
        <div class="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700 hidden md:block"></div>

        <div class="space-y-8">
          <div 
            v-for="(phase, index) in courseData.studyPlan.phases" 
            :key="phase.id"
            class="relative"
          >
            <div class="flex items-center mb-4">
              <div class="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <component :is="getIcon(phase.icon)" class="w-8 h-8 text-white" />
                <span class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ index + 1 }}
                </span>
              </div>
              <div class="ml-6 flex-1">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-bold text-gray-800">{{ phase.name }}</h2>
                  <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {{ phase.duration }}
                  </span>
                </div>
                <p class="text-gray-600 mt-1">{{ phase.description }}</p>
              </div>
            </div>

            <div class="ml-24 bg-white rounded-xl p-6 shadow-md">
              <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen class="w-5 h-5 mr-2 text-blue-600" />
                本阶段学习内容
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="chapter in getPhaseChapters(index)" 
                  :key="chapter.id"
                  class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  @click="$router.push(`/knowledge/${chapter.id}`)"
                >
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <component :is="getIcon(chapter.icon)" class="w-5 h-5 text-blue-600" />
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-800">{{ chapter.name }}</h4>
                    <p class="text-gray-500 text-sm">{{ chapter.hours }}小时 · {{ chapter.topics.length }}个知识点</p>
                  </div>
                  <ChevronRight class="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-16 bg-white rounded-xl p-8 shadow-lg">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">学习建议</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">设定目标</h3>
            <p class="text-gray-600 text-sm">明确每天的学习目标，保持学习节奏</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw class="w-8 h-8 text-green-600" />
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">温故知新</h3>
            <p class="text-gray-600 text-sm">定期回顾已学内容，巩固记忆</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">多做练习</h3>
            <p class="text-gray-600 text-sm">通过练习题检验学习效果，查漏补缺</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  BookOpen, 
  GraduationCap, 
  Rocket, 
  Trophy,
  ChevronRight,
  Target,
  RefreshCw,
  Brain,
  Globe,
  FileText,
  ClipboardList,
  CheckSquare,
  Award,
  Scale,
  Shield
} from 'lucide-vue-next'
import { courseData } from '../data/courseData'

const iconMap = {
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'rocket': Rocket,
  'trophy': Trophy,
  'globe': Globe,
  'file-text': FileText,
  'clipboard-list': ClipboardList,
  'check-square': CheckSquare,
  'award': Award,
  'scale': Scale,
  'shield': Shield
}

const getIcon = (iconName) => {
  return iconMap[iconName] || BookOpen
}

const getPhaseChapters = (phaseIndex) => {
  // 4个阶段对应4个章节：第1阶段→第1章，第2阶段→第2章，以此类推
  const chapterRanges = [
    [0, 0],  // 第一阶段：第1章
    [1, 1],  // 第二阶段：第2章
    [2, 2],  // 第三阶段：第3章
    [3, 3]   // 第四阶段：第4章
  ]
  const range = chapterRanges[phaseIndex] || [0, courseData.chapters.length - 1]
  return courseData.chapters.slice(range[0], range[1] + 1)
}
</script>
