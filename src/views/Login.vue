<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
        <router-link to="/" class="inline-flex items-center gap-2 mx-auto mb-4">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">认</div>
        </router-link>
        <h1 class="text-2xl font-bold">欢迎回来</h1>
        <p class="mt-2 text-blue-100">登录后查看你的学习进度</p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            v-model.trim="form.username"
            type="text"
            required
            autocomplete="username"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="w-full px-4 py-3 pr-20 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="button"
              @click="showPwd = !showPwd"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
            >
              {{ showPwd ? '隐藏' : '显示' }}
            </button>
          </div>
        </div>

        <button
          :disabled="auth.loading"
          class="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center"
        >
          <Loader2 v-if="auth.loading" class="w-5 h-5 mr-2 animate-spin" />
          {{ auth.loading ? '登录中...' : '登录' }}
        </button>

        <div class="text-sm text-gray-600 text-center">
          还没有账号？
          <router-link to="/register" class="text-blue-600 hover:text-blue-800 font-medium">立即注册</router-link>
        </div>

        <div class="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
          演示账号：<span class="font-semibold">demo</span> / 密码：<span class="font-semibold">123456</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { useAuthStore, useToastStore } from '../stores/index.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()

const form = reactive({ username: '', password: '' })
const showPwd = ref(false)

async function handleSubmit() {
  try {
    await auth.login({ username: form.username, password: form.password })
    toast.show('登录成功', 'success')
    const redirect = route.query.redirect || '/'
    router.replace(redirect)
  } catch (e) {
    toast.show(e.message || '登录失败', 'error')
  }
}
</script>
