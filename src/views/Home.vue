<template>
  <div class="min-h-screen">
    <section class="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="isLogin && user" class="mb-6 p-4 bg-white/10 rounded-xl flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mr-3">{{ avatarChar }}</div>
            <div>
              <div class="font-semibold">欢迎，{{ user.nickname || user.username }}</div>
              <div class="text-xs text-blue-100">Lv.{{ user.level || 1 }} · 积分 {{ user.total_points || 0 }} · 学习 {{ user.study_hours || 0 }}小时</div>
            </div>
          </div>
          <div class="flex gap-2 text-sm">
            <router-link to="/profile" class="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30">个人中心</router-link>
            <router-link to="/daily-plan" class="px-3 py-1.5 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700">继续学习</router-link>
          </div>
        </div>
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="flex-1 text-center md:text-left">
            <div class="inline-flex items-center px-4 py-2 bg-white/20 rounded-full mb-6">
              <Sparkles class="w-5 h-5 mr-2" />
              <span class="text-sm font-medium">审核员考试专用学习平台</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
              认证通用基础
            </h1>
            <p class="text-xl text-blue-100 mb-8">
              系统化学习审核员考试必备知识，助您顺利通过考试
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <router-link 
                v-if="isLogin"
                to="/knowledge/1"
                class="px-8 py-3 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
              >
                <Play class="w-5 h-5 mr-2" />
                开始学习
              </router-link>
              <router-link 
                v-else
                to="/login?redirect=/knowledge/1"
                class="px-8 py-3 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
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

    <!-- 考试倒计时 -->
    <section class="bg-gradient-to-r from-red-500 to-orange-500 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center">
            <Calendar class="w-5 h-5 mr-2" />
            <span class="text-sm font-medium">距{{ nextExamDate }}考试还有</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="bg-white/20 rounded-lg px-3 py-1 text-center">
              <div class="text-xl font-bold leading-tight">{{ countdown.days }}</div>
              <div class="text-xs opacity-80">天</div>
            </div>
            <span class="text-xl font-bold">:</span>
            <div class="bg-white/20 rounded-lg px-3 py-1 text-center">
              <div class="text-xl font-bold leading-tight">{{ countdown.hours }}</div>
              <div class="text-xs opacity-80">时</div>
            </div>
            <span class="text-xl font-bold">:</span>
            <div class="bg-white/20 rounded-lg px-3 py-1 text-center">
              <div class="text-xl font-bold leading-tight">{{ countdown.minutes }}</div>
              <div class="text-xs opacity-80">分</div>
            </div>
            <span class="text-xl font-bold">:</span>
            <div class="bg-white/20 rounded-lg px-3 py-1 text-center">
              <div class="text-xl font-bold leading-tight">{{ countdown.seconds }}</div>
              <div class="text-xs opacity-80">秒</div>
            </div>
          </div>
          <router-link to="/mock-exam" class="text-sm underline hover:no-underline opacity-90">
            模拟测试 →
          </router-link>
        </div>
      </div>
    </section>

    <!-- 今日学习目标 -->
    <section class="py-6 bg-white dark:bg-slate-900 border-b dark:border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:bg-slate-800 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
              <Target class="w-6 h-6 text-white" />
            </div>
            <div>
              <div class="text-sm text-gray-500 dark:text-slate-400">今日学习进度</div>
              <div class="text-lg font-bold text-gray-800 dark:text-slate-100">{{ dailyStats.completed }} / {{ dailyStats.goal }} 个知识点</div>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="w-40 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                   :style="{ width: dailyStats.percent + '%' }"></div>
            </div>
            <span class="text-sm font-bold text-blue-600 dark:text-blue-400 w-10">{{ dailyStats.percent }}%</span>
            <router-link to="/daily-plan" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
              去学习
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 激励语录 + 连续打卡 -->
    <section class="py-4 bg-white dark:bg-slate-900 border-b dark:border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ randomEmoji }}</span>
            <p class="text-gray-600 dark:text-slate-300 italic text-sm max-w-md">「{{ currentQuote }}」</p>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500 dark:text-slate-400">学习连续</span>
            <span class="inline-flex items-center px-3 py-1 bg-orange-100 dark:bg-slate-700 text-orange-600 dark:text-orange-400 rounded-full text-sm font-bold">
              🔥 {{ studyStreak }} 天
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-white dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-4">学习数据概览</h2>
          <p class="text-gray-600 dark:text-slate-300">追踪您的学习进度，见证成长历程</p>
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

    <!-- 番茄钟 + 趣味知识 -->
    <section class="py-8 bg-white dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-6">
          <div class="md:col-span-2">
            <PomodoroTimer />
          </div>
          <div class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:bg-slate-800 rounded-2xl p-6 border border-yellow-100 dark:border-slate-700">
            <div class="flex items-center mb-3">
              <Lightbulb class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <h3 class="font-semibold text-gray-800 dark:text-slate-100">每日一学</h3>
            </div>
            <p class="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">{{ dailyTip }}</p>
            <button @click="refreshTip" class="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
              <RefreshCw class="w-3 h-3 mr-1" /> 换一条
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 快捷功能入口 -->
    <section class="py-6 bg-gray-50 dark:bg-slate-900 border-b dark:border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl font-bold text-gray-800 dark:text-slate-100 mb-5 flex items-center">
          <Rocket class="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          快捷功能
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <router-link to="/game" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-500 transition-all group">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Gamepad2 class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-slate-100 text-sm">趣味闯关</h3>
            <p class="text-xs text-gray-400 dark:text-slate-400 mt-0.5">章节大挑战</p>
          </router-link>

          <router-link to="/practice/1" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 hover:border-green-300 dark:hover:border-slate-500 transition-all group">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileQuestion class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-slate-100 text-sm">章节练习</h3>
            <p class="text-xs text-gray-400 dark:text-slate-400 mt-0.5">多题型巩固</p>
          </router-link>

          <router-link to="/wrong-notebook" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 hover:border-red-300 dark:hover:border-slate-500 transition-all group">
            <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <AlertCircle class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-slate-100 text-sm">错题本</h3>
            <p class="text-xs text-gray-400 dark:text-slate-400 mt-0.5">消灭盲区</p>
          </router-link>

          <router-link to="/mock-exam" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 hover:border-orange-300 dark:hover:border-slate-500 transition-all group">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ScrollText class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-slate-100 text-sm">模拟考试</h3>
            <p class="text-xs text-gray-400 dark:text-slate-400 mt-0.5">全真测试</p>
          </router-link>

          <router-link to="/resources" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500 transition-all group">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FolderOpen class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-slate-100 text-sm">资源库</h3>
            <p class="text-xs text-gray-400 dark:text-slate-400 mt-0.5">大纲/真题</p>
          </router-link>

          <router-link to="/progress" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 hover:border-teal-300 dark:hover:border-slate-500 transition-all group">
            <div class="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-slate-100 text-sm">学习进度</h3>
            <p class="text-xs text-gray-400 dark:text-slate-400 mt-0.5">追踪成长</p>
          </router-link>

          <router-link to="/daily-plan" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 hover:border-violet-300 dark:hover:border-slate-500 transition-all group">
            <div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CalendarDays class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-slate-100 text-sm">每日计划</h3>
            <p class="text-xs text-gray-400 dark:text-slate-400 mt-0.5">40天攻略</p>
          </router-link>

          <router-link to="/learning-path" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 hover:border-sky-300 dark:hover:border-slate-500 transition-all group">
            <div class="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <MapPin class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-slate-100 text-sm">学习路线</h3>
            <p class="text-xs text-gray-400 dark:text-slate-400 mt-0.5">四阶段</p>
          </router-link>
        </div>
      </div>
    </section>

    <section class="py-16 bg-gray-50 dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-4">学习路线</h2>
          <p class="text-gray-600 dark:text-slate-300">循序渐进，系统掌握认通基知识</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="phase in courseData.studyPlan.phases" 
            :key="phase.id"
            class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md card-hover cursor-pointer dark:border-slate-700"
            @click="$router.push('/learning-path')"
          >
            <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <component :is="getIcon(phase.icon)" class="w-7 h-7 text-white" />
            </div>
            <h3 class="font-semibold text-lg text-gray-800 dark:text-slate-100 mb-2">{{ phase.name }}</h3>
            <div class="flex items-center text-blue-600 dark:text-blue-400 text-sm mb-2">
              <Clock class="w-4 h-4 mr-1" />
              {{ phase.duration }}
            </div>
            <p class="text-gray-600 dark:text-slate-300 text-sm">{{ phase.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-white dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-4">章节内容</h2>
          <p class="text-gray-600 dark:text-slate-300">覆盖认通基全部核心知识点</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="chapter in courseData.chapters" 
            :key="chapter.id"
            class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:border-blue-400 dark:hover:border-slate-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <component :is="getIcon(chapter.icon)" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span class="text-gray-400 dark:text-slate-400 text-sm flex items-center">
                <Clock class="w-4 h-4 mr-1" />
                {{ chapter.hours }}h
              </span>
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-slate-100 mb-3 line-clamp-2">{{ chapter.name }}</h3>
            <p class="text-gray-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{{ chapter.summary }}</p>
            <div class="flex justify-between items-center">
              <span class="text-gray-400 dark:text-slate-400 text-sm">{{ chapter.topics.length }} 个知识点</span>
              <router-link 
                :to="`/knowledge/${chapter.id}`"
                class="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-400 flex items-center"
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
              class="px-8 py-3 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/index.js'
import { progressApi, sessionApi, achievementApi, dailyPlanApi } from '../utils/request.js'
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
  Shield,
  Lightbulb,
  RefreshCw,
  Gamepad2,
  FileQuestion,
  AlertCircle,
  ScrollText,
  FolderOpen,
  TrendingUp,
  CalendarDays,
  MapPin
} from 'lucide-vue-next'
import { courseData } from '../data/courseData'
import { motivationalQuotes } from '../data/quotes.js'
import PomodoroTimer from '../components/PomodoroTimer.vue'

const auth = useAuthStore()

const user = computed(() => auth.user)
const isLogin = computed(() => auth.isLogin)

const avatarChar = computed(() =>
  (user.value?.nickname || user.value?.username || 'U').slice(0, 1).toUpperCase()
)

// ===== 考试倒计时 =====
function getNextExamDate() {
  const now = new Date()
  const year = now.getFullYear()
  const examMonths = [3, 6, 9, 12] // 3月/6月/9月/12月
  let nextMonth = examMonths.find(m => m > (now.getMonth() + 1))
  let nextYear = year
  if (!nextMonth) {
    nextMonth = 3
    nextYear = year + 1
  }
  return new Date(nextYear, nextMonth - 1, 20, 9, 0, 0)
}

const nextExamDate = ref('')
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let countdownTimer = null

function updateCountdown() {
  const target = getNextExamDate()
  const now = new Date()
  const diff = Math.max(0, Math.floor((target - now) / 1000))
  countdown.value = {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60
  }
  const monthMap = { 2: '3月', 5: '6月', 8: '9月', 11: '12月' }
  nextExamDate.value = monthMap[target.getMonth()] || '下一次'
}

// ===== 今日学习目标 =====
const dailyStats = ref({ completed: 0, goal: 3, percent: 0 })

async function loadDailyStats() {
  if (!isLogin.value) return
  try {
    const rows = await dailyPlanApi.getProgress()
    const startDate = new Date(2026, 0, 1)
    const today = new Date()
    const dayDiff = Math.floor((today - startDate) / 86400000) + 1
    const todayDay = Math.min(Math.max(dayDiff, 1), courseData.studyPlan.totalDays) || 1
    const completed = (rows || []).filter(r => r.completed && Number(r.day) <= todayDay).length
    dailyStats.value = {
      completed,
      goal: todayDay,
      percent: Math.min(100, Math.round((completed / todayDay) * 100))
    }
  } catch (e) {
    dailyStats.value = { completed: 0, goal: 3, percent: 0 }
  }
}

// ===== 激励语录 =====
const quoteIndex = ref(Math.floor(Math.random() * motivationalQuotes.length))
const currentQuote = computed(() => motivationalQuotes[quoteIndex.value].text)
const randomEmoji = computed(() => {
  const emojis = ['🎯', '💪', '🌟', '🔥', '📚', '✨', '🏆', '🚀', '🎉', '⭐']
  return emojis[Math.floor(Math.random() * emojis.length)]
})

// ===== 每日一学小贴士 =====
const studyTips = [
  '合格评定功能法四环节：选取→确定→复核与证明→监督，顺序不能调！',
  'NQI三要素：计量（基准）、标准（依据）、合格评定（手段）',
  '审核七项原则：诚实正直、公正表达、职业素养、保密性、独立性、基于证据、基于风险',
  '认证是证明"符合性"，认可是证明"能力"，两者不同！',
  '管理体系认证证书有效期3年，监督审核每年一次。',
  '产品认证（如CCC）关注产品符合性，管理体系认证关注组织管理能力。',
  'GB/T 27000系列：27000基本、27021/25/65技术、27030通用',
  '审核流程：启动→准备→实施→报告→后续活动',
  '强制性标准=必须执行，推荐性标准=鼓励采用',
  'CCAA负责审核员注册，CNAS负责认可，CNCA负责监管。',
  'PDCA循环：Plan（计划）→Do（实施）→Check（检查）→Act（处置）',
  '标准五级：国标、行标、地标、团标、企标',
]
const tipIndex = ref(Math.floor(Math.random() * studyTips.length))
const dailyTip = ref(studyTips[tipIndex.value])
function refreshTip() {
  tipIndex.value = (tipIndex.value + 1) % studyTips.length
  dailyTip.value = studyTips[tipIndex.value]
}

// ===== 学习连续打卡天数 =====
const studyStreak = ref(0)
function calcStudyStreak() {
  if (!isLogin.value) { studyStreak.value = 0; return }
  const sessions = JSON.parse(localStorage.getItem('app_sess_' + (auth.user?.id || 'guest')) || '[]')
  if (!sessions.length) { studyStreak.value = 0; return }
  const dates = sessions.map(s => s.session_date).sort().reverse()
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    if (dates.includes(dateStr)) streak++
    else if (i > 0) break
    else if (i === 0 && !dates.includes(dateStr)) { streak = 0; break }
  }
  studyStreak.value = streak
}

onMounted(async () => {
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
  calcStudyStreak()
  if (isLogin.value) {
    await auth.refreshProfile()
    await loadRealStats()
    await loadDailyStats()
  }
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

const learningStats = ref({
  chaptersCompleted: 0,
  totalChapters: courseData.chapters.length,
  studyHours: 0,
  correctAnswers: 0,
  accuracy: 0,
  achievements: 0
})

async function loadRealStats() {
  try {
    // 加载进度摘要
    const summary = await progressApi.summary()
    // 计算已完成章节数（有完成知识点的章节）
    const chapters = await progressApi.chapterList()
    const completedChapters = (chapters || []).filter(c => c.completed > 0).length
    
    // 加载学习会话统计
    const sessions = await sessionApi.list()
    const totalMinutes = (sessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    const totalQuestions = (sessions || []).reduce((sum, s) => sum + (s.questions_answered || 0), 0)
    const totalCorrect = (sessions || []).reduce((sum, s) => sum + (s.correct_count || 0), 0)
    
    // 加载成就数量
    const achievements = await achievementApi.list()
    
    learningStats.value = {
      chaptersCompleted: completedChapters,
      totalChapters: courseData.chapters.length,
      studyHours: Math.round(totalMinutes / 60 * 10) / 10,
      correctAnswers: totalCorrect,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      achievements: (achievements || []).length
    }
  } catch (e) {
    console.warn('加载学习统计失败:', e.message)
  }
}

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
