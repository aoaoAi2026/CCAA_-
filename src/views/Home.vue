<template>
  <div class="min-h-screen">
    <section class="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="isLogin && user" class="mb-6 p-4 bg-white/10 rounded-xl flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">{{ avatarChar }}</div>
            <div>
              <div class="font-semibold">欢迎，{{ user.nickname || user.username }}</div>
              <div class="text-xs text-blue-100">Lv.{{ user.level || 1 }} · 积分 {{ user.total_points || 0 }} · 学习 {{ user.study_hours || 0 }}小时</div>
            </div>
          </div>
          <div class="flex gap-2 text-sm">
            <router-link to="/profile" class="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30">个人中心</router-link>
            <router-link to="/daily-plan" class="px-3 py-1.5 bg-white text-purple-700 rounded-lg hover:bg-blue-50">继续学习</router-link>
          </div>
        </div>
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="flex-1 text-center md:text-left">
            <div class="inline-flex items-center px-4 py-2 bg-white/20 rounded-full mb-6">
              <Sparkles class="w-5 h-5 mr-2" />
              <span class="text-sm font-medium">审核员考试专用学习平台</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
              认识通用基础
            </h1>
            <p class="text-xl text-blue-100 mb-8">
              系统化学习审核员考试必备知识，助您顺利通过考试
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <router-link 
                v-if="isLogin"
                to="/knowledge/1"
                class="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <Play class="w-5 h-5 mr-2" />
                开始学习
              </router-link>
              <router-link 
                v-else
                to="/login?redirect=/knowledge/1"
                class="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <Play class="w-5 h-5 mr-2" />
                登录后开始学习
              </router-link>
              <router-link 
                v-if="isLogin"
                to="/daily-plan"
                class="px-8 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <Calendar class="w-5 h-5 mr-2" />
                每日计划
              </router-link>
              <router-link 
                v-else
                to="/login?redirect=/daily-plan"
                class="px-8 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <Calendar class="w-5 h-5 mr-2" />
                每日计划
              </router-link>
            </div>
          </div>
          <div class="flex-1 mt-10 md:mt-0">
            <div class="relative">
              <div class="w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-full flex items-center justify-center animate-pulse-slow">
                <div class="w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full flex items-center justify-center">
                  <div class="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <BookOpen class="w-16 h-16 md:w-24 md:h-24 text-white" />
                  </div>
                </div>
              </div>
              <div class="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full animate-float">
                <CheckCircle class="w-6 h-6" />
              </div>
              <div class="absolute -bottom-4 -left-4 bg-blue-400 text-white p-3 rounded-full animate-float" style="animation-delay: 1s">
                <Target class="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">学习数据概览</h2>
          <p class="text-gray-600">追踪您的学习进度，见证成长历程</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white card-hover">
            <div class="flex items-center justify-between mb-4">
              <BookOpen class="w-8 h-8" />
              <span class="text-blue-200 text-sm">已学章节</span>
            </div>
            <div class="text-3xl font-bold">{{ learningStats.chaptersCompleted }}</div>
            <div class="text-blue-200 text-sm mt-1">共 {{ learningStats.totalChapters }} 章</div>
          </div>
          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white card-hover">
            <div class="flex items-center justify-between mb-4">
              <Clock class="w-8 h-8" />
              <span class="text-green-200 text-sm">学习时长</span>
            </div>
            <div class="text-3xl font-bold">{{ learningStats.studyHours }}</div>
            <div class="text-green-200 text-sm mt-1">小时</div>
          </div>
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white card-hover">
            <div class="flex items-center justify-between mb-4">
              <CheckCircle class="w-8 h-8" />
              <span class="text-purple-200 text-sm">答题正确</span>
            </div>
            <div class="text-3xl font-bold">{{ learningStats.correctAnswers }}</div>
            <div class="text-purple-200 text-sm mt-1">正确率 {{ learningStats.accuracy }}%</div>
          </div>
          <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white card-hover">
            <div class="flex items-center justify-between mb-4">
              <Trophy class="w-8 h-8" />
              <span class="text-orange-200 text-sm">获得成就</span>
            </div>
            <div class="text-3xl font-bold">{{ learningStats.achievements }}</div>
            <div class="text-orange-200 text-sm mt-1">个徽章</div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">学习路线</h2>
          <p class="text-gray-600">循序渐进，系统掌握认通基知识</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="phase in courseData.learningPhases" 
            :key="phase.id"
            class="bg-white rounded-xl p-6 shadow-md card-hover cursor-pointer"
            @click="$router.push('/learning-path')"
          >
            <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <component :is="getIcon(phase.icon)" class="w-7 h-7 text-white" />
            </div>
            <h3 class="font-semibold text-lg text-gray-800 mb-2">{{ phase.name }}</h3>
            <div class="flex items-center text-blue-600 text-sm mb-2">
              <Clock class="w-4 h-4 mr-1" />
              {{ phase.duration }}
            </div>
            <p class="text-gray-600 text-sm">{{ phase.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">章节内容</h2>
          <p class="text-gray-600">覆盖认通基全部核心知识点</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="chapter in courseData.chapters" 
            :key="chapter.id"
            class="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <component :is="getIcon(chapter.icon)" class="w-6 h-6 text-blue-600" />
              </div>
              <span class="text-gray-400 text-sm flex items-center">
                <Clock class="w-4 h-4 mr-1" />
                {{ chapter.hours }}h
              </span>
            </div>
            <h3 class="font-semibold text-gray-800 mb-3 line-clamp-2">{{ chapter.name }}</h3>
            <p class="text-gray-500 text-sm mb-4 line-clamp-2">{{ chapter.summary }}</p>
            <div class="flex justify-between items-center">
              <span class="text-gray-400 text-sm">{{ chapter.topics.length }} 个知识点</span>
              <router-link 
                :to="`/knowledge/${chapter.id}`"
                class="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center"
              >
                开始学习
                <ArrowRight class="w-4 h-4 ml-1" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-gradient-to-br from-blue-600 to-purple-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center text-white">
          <h2 class="text-3xl font-bold mb-4">准备好开始学习了吗？</h2>
          <p class="text-blue-100 mb-8">加入数千名学员，一起备考审核员考试</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/knowledge/1"
              class="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              立即开始学习
            </router-link>
            <router-link 
              to="/game"
              class="px-8 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors"
            >
              趣味闯关
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/index.js'

const auth = useAuthStore()

const user = computed(() => auth.user)
const isLogin = computed(() => auth.isLogin)

const avatarChar = computed(() =>
  (user.value?.nickname || user.value?.username || 'U').slice(0, 1).toUpperCase()
)

onMounted(async () => {
  if (isLogin.value) await auth.refreshProfile()
})
import { 
  Sparkles, 
  Play, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  Target,
  Clock,
  Trophy,
  ArrowRight,
  GraduationCap,
  Rocket,
  Globe,
  FileText,
  ClipboardList,
  CheckSquare,
  Award,
  Scale,
  Shield
} from 'lucide-vue-next'
import { courseData } from '../data/courseData'

const learningStats = ref({
  chaptersCompleted: 2,
  totalChapters: 8,
  studyHours: 12,
  correctAnswers: 85,
  accuracy: 89,
  achievements: 5
})

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
</script>
