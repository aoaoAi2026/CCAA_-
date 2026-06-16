<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
    <header class="bg-white dark:bg-slate-800 dark:border-b dark:border-slate-700 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              认
            </div>
            <span class="text-lg font-semibold text-gray-800 dark:text-slate-100 hidden sm:inline">认证通用基础 · 学习平台</span>
          </router-link>

          <nav class="hidden md:flex items-center gap-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="matchNav(item.path) ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-700' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'"
            >
              <component :is="item.icon" class="inline-block w-4 h-4 mr-1" />
              {{ item.name }}
            </router-link>
          </nav>

          <div class="flex items-center gap-1 sm:gap-2">
            <!-- 搜索按钮 -->
            <button
              @click="showSearch = true"
              class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="搜索"
            >
              <Search class="w-5 h-5" />
            </button>
            <button
              @click="theme.toggle()"
              class="w-9 h-9 hidden sm:flex items-center justify-center rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              :title="theme.isDark ? '切换到浅色' : '切换到深色'"
            >
              <Sun v-if="theme.isDark" class="w-5 h-5" />
              <Moon v-else class="w-5 h-5" />
            </button>
            <template v-if="isLoggedIn">
              <router-link
                to="/profile"
                class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 text-sm hover:bg-blue-100 dark:hover:bg-slate-600 transition"
              >
                <div class="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ avatarChar }}
                </div>
                <span class="hidden sm:inline dark:text-slate-100">{{ displayName }}</span>
              </router-link>
              <button
                @click="handleLogout"
                class="hidden sm:inline-block px-3 py-1.5 text-sm text-gray-600 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                退出
              </button>
              <!-- 移动端菜单按钮 -->
              <button
                @click="showMobileMenu = !showMobileMenu"
                class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                :title="showMobileMenu ? '关闭菜单' : '打开菜单'"
              >
                <Menu v-if="!showMobileMenu" class="w-5 h-5" />
                <X v-else class="w-5 h-5" />
              </button>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="px-3 py-1.5 text-sm rounded-lg text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >登录</router-link>
              <router-link
                to="/register"
                class="px-3 py-1.5 text-sm rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 transition"
              >注册</router-link>
              <!-- 移动端菜单（未登录也显示） -->
              <button
                @click="showMobileMenu = !showMobileMenu"
                class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Menu v-if="!showMobileMenu" class="w-5 h-5" />
                <X v-else class="w-5 h-5" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 text-gray-800 dark:text-slate-200">
      <router-view :key="$route.fullPath" />
    </main>

    <footer class="bg-white dark:bg-slate-800 dark:border-t dark:border-slate-700 border-t mt-12 py-8 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">关于平台</h3>
            <p class="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
              为审核员考试量身打造的「认证通用基础」学习平台，提供系统化的知识点、章节练习和每日学习计划。
            </p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">快捷入口</h3>
            <ul class="space-y-2 text-sm">
              <li><router-link to="/daily-plan" class="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">每日学习计划</router-link></li>
              <li><router-link to="/practice/1" class="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">章节练习</router-link></li>
              <li><router-link to="/game" class="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">趣味闯关</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">学习数据</h3>
            <p class="text-sm text-gray-600 dark:text-slate-400">所有个人学习数据保存在本地数据库中，隐私可由你掌控。</p>
          </div>
        </div>
        <div class="text-center text-xs text-gray-500 dark:text-slate-500 mt-8 border-t pt-4 dark:border-slate-700">
          © 2026 认证通用基础学习平台 · 仅供学习参考
        </div>
      </div>
    </footer>

    <!-- 搜索遮罩 -->
    <Teleport to="body">
      <div v-if="showSearch" class="fixed inset-0 z-[60]" @click.self="showSearch = false">
        <div class="absolute inset-0 bg-black/50" @click="showSearch = false"></div>
        <div class="absolute top-0 left-0 right-0 bg-white dark:bg-slate-800 shadow-2xl">
          <div class="max-w-3xl mx-auto px-4 py-4">
            <div class="flex items-center gap-3">
              <Search class="w-5 h-5 text-gray-400 shrink-0" />
              <input
                v-model="searchQuery"
                ref="searchInputRef"
                type="text"
                placeholder="搜索题目、知识点、法规名称..."
                class="flex-1 text-lg outline-none bg-transparent text-gray-800 dark:text-slate-100 placeholder-gray-400"
                @keydown.escape="closeSearch"
              />
              <button @click="closeSearch" class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                <X class="w-5 h-5" />
              </button>
            </div>
            <div v-if="searchQuery.trim().length > 0" class="mt-4 max-h-[60vh] overflow-y-auto space-y-2">
              <div v-if="searchResults.length === 0" class="text-center py-8 text-gray-400">无匹配结果</div>
              <div
                v-for="(r, i) in searchResults"
                :key="i"
                class="p-3 rounded-lg cursor-pointer transition-colors"
                :class="r.url ? 'hover:bg-blue-50 dark:hover:bg-slate-700' : ''"
                @click="r.url && navigateSearch(r)"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    :class="r.badgeClass || 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'"
                  >{{ r.type }}</span>
                  <span class="text-xs text-gray-400" v-if="r.chapter">{{ r.chapter }}</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-slate-200" v-html="r.text"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 移动端侧边菜单 -->
    <Teleport to="body">
      <div v-if="showMobileMenu" class="fixed inset-0 z-[60] md:hidden">
        <div class="absolute inset-0 bg-black/50" @click="showMobileMenu = false"></div>
        <div class="absolute top-0 right-0 w-72 h-full bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto">
          <div class="flex items-center justify-between p-4 border-b dark:border-slate-700">
            <span class="font-semibold text-gray-800 dark:text-slate-100">菜单</span>
            <button @click="showMobileMenu = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
              <X class="w-5 h-5" />
            </button>
          </div>
          <nav class="p-2 space-y-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              @click="showMobileMenu = false"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              :class="matchNav(item.path) ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-700' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'"
            >
              <component :is="item.icon" class="w-5 h-5" />
              {{ item.name }}
            </router-link>
          </nav>
          <div class="border-t dark:border-slate-700 p-4 space-y-3">
            <button
              @click="theme.toggle(); showMobileMenu = false"
              class="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Sun v-if="theme.isDark" class="w-5 h-5" />
              <Moon v-else class="w-5 h-5" />
              {{ theme.isDark ? '浅色模式' : '深色模式' }}
            </button>
            <template v-if="isLoggedIn">
              <router-link
                to="/profile"
                @click="showMobileMenu = false"
                class="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <User class="w-5 h-5" />
                个人中心
              </router-link>
              <button
                @click="handleLogout"
                class="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut class="w-5 h-5" />
                退出登录
              </button>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

    <AppToast />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Sun as HomeIcon, BookOpen, Play, Target, AlertCircle, Gamepad2, TrendingUp, FolderOpen,
  User, Moon, Sun, Search, Menu, X, LogOut
} from 'lucide-vue-next'
import { useAuthStore, useToastStore, useThemeStore } from './stores/index.js'
import AppToast from './components/AppToast.vue'
import { questions } from './data/questions.js'
import { detailedContent } from './data/detailedContent.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const theme = useThemeStore()

const isLoggedIn = computed(() => auth.isLogin)
const avatarChar = computed(() => auth.avatarChar)
const displayName = computed(() => auth.displayName)

const showMobileMenu = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)

const chapterNames = { 1: '第1章', 2: '第2章', 3: '第3章', 4: '第4章' }

function matchNav(path) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path)
}

const navItems = [
  { path: '/', name: '首页', icon: HomeIcon },
  { path: '/daily-plan', name: '每日计划', icon: Play },
  { path: '/practice/1', name: '章节练习', icon: BookOpen },
  { path: '/wrong-notebook', name: '错题本', icon: AlertCircle },
  { path: '/game', name: '趣味闯关', icon: Gamepad2 },
  { path: '/progress', name: '学习进度', icon: TrendingUp },
  { path: '/resources', name: '资源', icon: FolderOpen }
]

function handleLogout() {
  if (!confirm('确定退出登录吗？')) return
  auth.logout()
  toast.show('已退出登录', 'info')
  showMobileMenu.value = false
}

function closeSearch() {
  showSearch.value = false
  searchQuery.value = ''
}

function navigateSearch(r) {
  closeSearch()
  router.push(r.url)
}

// 搜索逻辑
const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q || q.length < 1) return []
  const results = []

  // 搜索题目
  const allQTypes = ['chapter1','chapter2','chapter3','chapter4']
  allQTypes.forEach((key, idx) => {
    const arr = questions[key] || []
    arr.forEach(qItem => {
      if (qItem.question && qItem.question.toLowerCase().includes(q)) {
        results.push({
          type: '题目',
          chapter: chapterNames[idx + 1],
          text: qItem.question,
          url: `/practice/${idx + 1}`,
          badgeClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
        })
      }
    })
  })

  // 搜索知识点内容
  const chKeys = ['chapter1','chapter2','chapter3','chapter4']
  chKeys.forEach((key, idx) => {
    const ch = detailedContent[key]
    if (!ch || !ch.dailyPlans) return
    ch.dailyPlans.forEach(plan => {
      const titleMatch = plan.title && plan.title.toLowerCase().includes(q)
      const contentMatch = plan.content && plan.content.toLowerCase().includes(q)
      if (titleMatch || contentMatch) {
        const snippet = plan.content
          ? plan.content.substring(0, 120).replace(/\n/g, ' ').replace(/#/g, '')
          : ''
        results.push({
          type: '知识点',
          chapter: chapterNames[idx + 1],
          text: titleMatch ? `📘 ${plan.title}` : `📘 ${plan.title}: ${snippet}${snippet.length >= 120 ? '...' : ''}`,
          url: `/knowledge/${idx + 1}`,
          badgeClass: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
        })
      }
    })
  })

  // 搜索多选题
  ;(questions.multipleChoice || []).forEach(qItem => {
    if (qItem.question && qItem.question.toLowerCase().includes(q)) {
      results.push({
        type: '题目',
        chapter: chapterNames[qItem.chapter] || '',
        text: qItem.question,
        url: `/practice/${qItem.chapter}`,
        badgeClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
      })
    }
  })

  // 搜索判断题
  ;(questions.trueFalse || []).forEach(qItem => {
    if (qItem.question && qItem.question.toLowerCase().includes(q)) {
      results.push({
        type: '题目',
        chapter: chapterNames[qItem.chapter] || '',
        text: qItem.question,
        url: `/practice/${qItem.chapter}`,
        badgeClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
      })
    }
  })

  return results.slice(0, 30)
})

watch(showSearch, (val) => {
  if (val) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  } else {
    searchQuery.value = ''
  }
})

onMounted(() => {
  theme.init()
})

// 路由变化时关闭移动菜单
watch(() => route.path, () => {
  showMobileMenu.value = false
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
