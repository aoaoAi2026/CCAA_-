<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              认
            </div>
            <span class="text-lg font-semibold text-gray-800 hidden sm:inline">认证通用基础 · 学习平台</span>
          </router-link>

          <nav class="hidden md:flex items-center gap-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="matchNav(item.path) ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'"
            >
              <component :is="item.icon" class="inline-block w-4 h-4 mr-1" />
              {{ item.name }}
            </router-link>
          </nav>

          <div class="flex items-center gap-2">
            <template v-if="isLoggedIn">
              <router-link
                to="/profile"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm hover:bg-blue-100 transition"
              >
                <div class="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ avatarChar }}
                </div>
                <span class="hidden sm:inline">{{ displayName }}</span>
              </router-link>
              <button
                @click="handleLogout"
                class="px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                退出
              </button>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="px-3 py-1.5 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >登录</router-link>
              <router-link
                to="/register"
                class="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >注册</router-link>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <router-view />
    </main>

    <footer class="bg-white border-t mt-12 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-sm font-semibold text-gray-800 mb-3">关于平台</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              为审核员考试量身打造的「认证通用基础」学习平台，提供系统化的知识点、章节练习和每日学习计划。
            </p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-800 mb-3">快捷入口</h3>
            <ul class="space-y-2 text-sm">
              <li><router-link to="/daily-plan" class="text-gray-600 hover:text-blue-600">每日学习计划</router-link></li>
              <li><router-link to="/practice/1" class="text-gray-600 hover:text-blue-600">章节练习</router-link></li>
              <li><router-link to="/game" class="text-gray-600 hover:text-blue-600">趣味闯关</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-800 mb-3">学习数据</h3>
            <p class="text-sm text-gray-600">所有个人学习数据保存在本地数据库中，隐私可由你掌控。</p>
          </div>
        </div>
        <div class="text-center text-xs text-gray-500 mt-8 border-t pt-4">
          © 2026 认证通用基础学习平台 · 仅供学习参考
        </div>
      </div>
    </footer>

    <AppToast />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Home as HomeIcon, BookOpen, Play, Target, AlertCircle, Gamepad2, TrendingUp, FolderOpen, User
} from 'lucide-vue-next'
import { useAuthStore, useToastStore } from './stores/index.js'
import AppToast from './components/AppToast.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const isLoggedIn = computed(() => auth.isLogin)
const avatarChar = computed(() => auth.avatarChar)
const displayName = computed(() => auth.displayName)

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
  router.push('/')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
