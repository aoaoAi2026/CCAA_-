<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div class="bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-8 text-center">
        <router-link to="/" class="inline-flex items-center gap-2 mx-auto mb-4">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">认</div>
        </router-link>
        <h1 class="text-2xl font-bold">创建新账号</h1>
        <p class="mt-2 text-blue-100">免费注册，立即开始学习</p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-8 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名 <span class="text-red-500">*</span></label>
          <input v-model.trim="form.username" type="text" required minlength="3"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
          <input v-model.trim="form.nickname" type="text"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input v-model.trim="form.email" type="email"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码 <span class="text-red-500">*</span></label>
          <input v-model="form.password" type="password" required minlength="6"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
          <p class="mt-1 text-xs text-gray-500">至少 6 位，建议字母+数字组合</p>
        </div>

        <button :disabled="auth.loading"
          class="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center">
          <Loader2 v-if="auth.loading" class="w-5 h-5 mr-2 animate-spin" />
          {{ auth.loading ? '注册中...' : '注册并登录' }}
        </button>

        <div class="text-sm text-gray-600 text-center">
          已有账号？
          <router-link to="/login" class="text-blue-600 hover:text-blue-800 font-medium">返回登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { useAuthStore, useToastStore } from '../stores/index.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()

const form = reactive({ username: '', nickname: '', email: '', password: '' })

async function handleSubmit() {
  try {
    await auth.register({ ...form })
    toast.show('注册成功，欢迎加入！', 'success')
    router.replace(route.query.redirect || '/')
  } catch (e) {
    toast.show(e.message || '注册失败', 'error')
  }
}
</script>
