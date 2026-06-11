<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-3xl mx-auto px-4">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white flex items-center gap-6">
          <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-4xl font-bold text-blue-600 shadow-inner">
            {{ avatarChar }}
          </div>
          <div>
            <div class="text-2xl font-bold">{{ user?.nickname || user?.username || '未登录' }}</div>
            <div class="text-sm opacity-90">@{{ user?.username }}</div>
            <div class="mt-2 flex gap-3 text-sm">
              <span class="px-3 py-1 bg-white/20 rounded-full">等级 Lv.{{ user?.level || 1 }}</span>
              <span class="px-3 py-1 bg-white/20 rounded-full">积分 {{ user?.total_points || 0 }}</span>
              <span class="px-3 py-1 bg-white/20 rounded-full">学习 {{ user?.study_hours || 0 }} 小时</span>
            </div>
          </div>
        </div>

        <div class="p-8 space-y-6">
          <section>
            <h2 class="text-lg font-semibold text-gray-800 mb-3">账号信息</h2>
            <form @submit.prevent="updateProfile" class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-600 mb-1">昵称</label>
                <input v-model="form.nickname" type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">邮箱</label>
                <input v-model="form.email" type="email"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
              </div>
              <div class="sm:col-span-2">
                <button type="submit" :disabled="saving"
                  class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                  保存资料
                </button>
              </div>
            </form>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-gray-800 mb-3">修改密码</h2>
            <form @submit.prevent="updatePassword" class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-600 mb-1">原密码</label>
                <input v-model="pwdForm.old" type="password"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">新密码（至少 6 位）</label>
                <input v-model="pwdForm.new" type="password" minlength="6"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
              </div>
              <div class="sm:col-span-2">
                <button type="submit" :disabled="pwdSaving"
                  class="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition">
                  更新密码
                </button>
              </div>
            </form>
          </section>

          <section class="pt-4 border-t">
            <button @click="logout"
              class="px-5 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
              退出登录
            </button>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useToastStore } from '../stores/index.js'
import { authApi } from '../utils/request.js'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const user = computed(() => auth.user)
const avatarChar = computed(() =>
  (user.value?.nickname || user.value?.username || 'U').slice(0, 1).toUpperCase()
)

const form = reactive({ nickname: '', email: '' })
const pwdForm = reactive({ old: '', new: '' })
const saving = ref(false)
const pwdSaving = ref(false)

onMounted(async () => {
  if (!auth.isLogin) return router.replace('/login')
  if (user.value) {
    form.nickname = user.value.nickname || ''
    form.email = user.value.email || ''
  }
})

async function updateProfile() {
  saving.value = true
  try {
    await authApi.updateProfile(form)
    await auth.refreshProfile()
    toast.show('资料已更新', 'success')
  } catch (e) {
    toast.show(e.message || '更新失败', 'error')
  } finally {
    saving.value = false
  }
}

async function updatePassword() {
  if (!pwdForm.new || pwdForm.new.length < 6) return toast.show('新密码至少 6 位', 'warning')
  pwdSaving.value = true
  try {
    await authApi.changePassword({ old_password: pwdForm.old, new_password: pwdForm.new })
    pwdForm.old = ''
    pwdForm.new = ''
    toast.show('密码已更新', 'success')
  } catch (e) {
    toast.show(e.message || '更新失败', 'error')
  } finally {
    pwdSaving.value = false
  }
}

function logout() {
  if (!confirm('确定退出登录吗？')) return
  auth.logout()
  toast.show('已退出登录', 'info')
  router.push('/')
}
</script>
