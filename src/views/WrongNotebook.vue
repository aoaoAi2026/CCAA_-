<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-5xl mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">错题本</h1>
          <p class="text-gray-600">收藏每一个知识点盲区，连续答对3次即可从错题本中移除</p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="items.length"
            @click="togglePracticeMode"
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {{ practiceMode ? '退出练习' : '开始练习' }}
          </button>
          <button
            v-if="items.length && !practiceMode"
            @click="clearAll"
            class="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
          >清空错题本</button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>
      <div v-else-if="items.length === 0" class="bg-white rounded-2xl shadow p-12 text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">太棒了！</h2>
        <p class="text-gray-600 mb-6">目前没有错题，继续保持，在练习题和趣味闯关中若答错会自动记录。</p>
        <div class="flex justify-center gap-3">
          <router-link to="/daily-plan" class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">去每日计划</router-link>
          <router-link to="/game" class="px-5 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 transition">趣味闯关</router-link>
        </div>
      </div>

      <!-- 练习模式 -->
      <div v-else-if="practiceMode" class="space-y-4">
        <div
          v-for="(item, idx) in practiceList"
          :key="item.id || idx"
          class="bg-white rounded-2xl shadow p-6"
        >
          <!-- 题目信息 -->
          <div class="flex items-start justify-between mb-4">
            <div class="text-sm text-gray-500">
              <span v-if="item.chapter_name" class="font-medium text-blue-600">{{ item.chapter_name }}</span>
              <span class="mx-2">·</span>
              <span>第 {{ idx + 1 }} / {{ practiceList.length }} 题</span>
              <span v-if="item.consecutive_correct" class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                已连续答对 {{ item.consecutive_correct }} 次
              </span>
            </div>
            <div v-if="item.consecutive_correct >= 3" class="text-green-600 text-sm font-medium">
              ✅ 已从错题本移除
            </div>
          </div>

          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ item.question }}</h3>

          <!-- 选项 -->
          <div class="space-y-2 mb-4">
            <div
              v-for="(opt, optIdx) in item.options"
              :key="optIdx"
              @click="selectAnswer(item, optIdx)"
              class="p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition hover:border-blue-400"
              :class="getPracticeOptionClass(item, optIdx)"
            >
              <div class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
                :class="getPracticeBadgeClass(item, optIdx)"
              >{{ labels[optIdx] }}</div>
              <span class="text-gray-800">{{ opt }}</span>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div v-if="!item.practiceSubmitted" class="flex justify-end">
            <button
              @click="submitPracticeAnswer(item)"
              :disabled="item.practiceSelected === undefined"
              class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交答案
            </button>
          </div>

          <!-- 答题结果 -->
          <div v-if="item.practiceSubmitted" class="mt-4 p-4 rounded-lg" :class="item.practiceIsCorrect ? 'bg-green-50' : 'bg-red-50'">
            <div class="flex items-center mb-2">
              <span v-if="item.practiceIsCorrect" class="text-green-700 font-medium">
                ✅ 答对了！{{ item.practiceMessage }}
              </span>
              <span v-else class="text-red-700 font-medium">
                ❌ 答错了，{{ item.practiceMessage }}
              </span>
            </div>
            <div v-if="item.explanation" class="text-sm text-gray-600 mt-2">
              💡 <span class="font-semibold">解析：</span>{{ item.explanation }}
            </div>
            <div v-if="item.practiceIsCorrect && !item.practiceRemoved" class="text-sm text-blue-600 mt-2">
              📌 {{ item.practiceMessage }}
            </div>
          </div>
        </div>

        <!-- 练习完成 -->
        <div v-if="allPracticeSubmitted" class="bg-white rounded-2xl shadow p-8 text-center mt-6">
          <div class="text-4xl mb-4">🎓</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">练习完成！</h2>
          <p class="text-gray-600 mb-4">
            本轮共答对 <span class="text-green-600 font-bold">{{ practiceCorrectCount }}</span> 题
            <span v-if="practiceRemovedCount > 0">
              ，有 <span class="text-blue-600 font-bold">{{ practiceRemovedCount }}</span> 题已从错题本中移除
            </span>
          </p>
          <button
            @click="togglePracticeMode"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            返回错题列表
          </button>
        </div>
      </div>

      <!-- 列表模式 -->
      <div v-else class="space-y-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="text-sm text-gray-500">
              <span v-if="item.chapter_name" class="font-medium text-blue-600">{{ item.chapter_name }}</span>
              <span class="mx-2">·</span>
              <span>{{ item.added_at || '刚刚' }}</span>
              <span v-if="item.consecutive_correct" class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                连续答对 {{ item.consecutive_correct }}/3 次
              </span>
            </div>
            <button
              @click="removeItem(item.id)"
              class="text-sm text-gray-400 hover:text-red-600 transition"
            >移除</button>
          </div>

          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ item.question }}</h3>

          <div class="space-y-2">
            <div
              v-for="(opt, optIdx) in item.options"
              :key="optIdx"
              class="p-3 rounded-lg border flex items-start gap-3"
              :class="[
                optIdx === item.correct_answer ? 'border-green-400 bg-green-50' :
                optIdx === item.user_answer && optIdx !== item.correct_answer ? 'border-red-400 bg-red-50' :
                'border-gray-200 bg-white'
              ]"
            >
              <div class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
                :class="[
                  optIdx === item.correct_answer ? 'bg-green-500 text-white' :
                  optIdx === item.user_answer ? 'bg-red-500 text-white' :
                  'bg-gray-200 text-gray-700'
                ]"
              >{{ labels[optIdx] }}</div>
              <span class="text-gray-800">{{ opt }}</span>
            </div>
          </div>

          <div v-if="item.explanation" class="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            💡 <span class="font-semibold">解析：</span>{{ item.explanation }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { wrongApi } from '../utils/request.js'
import { useAuthStore, useToastStore } from '../stores/index.js'

const labels = ['A', 'B', 'C', 'D']
const auth = useAuthStore()
const toast = useToastStore()

const items = ref([])
const loading = ref(true)
const practiceMode = ref(false)
const practiceList = ref([])

async function load() {
  loading.value = true
  try {
    if (auth.isLogin) {
      items.value = await wrongApi.list()
    } else {
      const local = JSON.parse(localStorage.getItem('wrong_notebook_local') || '[]')
      items.value = local
    }
  } catch (e) {
    toast.show('加载错题失败：' + e.message, 'error')
    items.value = []
  } finally {
    loading.value = false
  }
}

function togglePracticeMode() {
  if (practiceMode.value) {
    practiceMode.value = false
    practiceList.value = []
  } else {
    // 进入练习模式，复制错题数据
    practiceMode.value = true
    practiceList.value = items.value.map((item) => ({
      ...item,
      practiceSelected: undefined,
      practiceSubmitted: false,
      practiceIsCorrect: false,
      practiceMessage: '',
      practiceRemoved: false
    }))
  }
}

function selectAnswer(item, optIdx) {
  if (item.practiceSubmitted) return
  item.practiceSelected = optIdx
}

function getPracticeOptionClass(item, optIdx) {
  if (!item.practiceSubmitted) {
    return item.practiceSelected === optIdx ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
  }
  if (optIdx === item.correct_answer) return 'border-green-500 bg-green-50'
  if (optIdx === item.practiceSelected && optIdx !== item.correct_answer) return 'border-red-500 bg-red-50'
  return 'border-gray-200 opacity-50'
}

function getPracticeBadgeClass(item, optIdx) {
  if (!item.practiceSubmitted) {
    return item.practiceSelected === optIdx ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
  }
  if (optIdx === item.correct_answer) return 'bg-green-500 text-white'
  if (optIdx === item.practiceSelected && optIdx !== item.correct_answer) return 'bg-red-500 text-white'
  return 'bg-gray-200 text-gray-700'
}

async function submitPracticeAnswer(item) {
  if (item.practiceSelected === undefined) return
  
  const isCorrect = item.practiceSelected === item.correct_answer
  item.practiceIsCorrect = isCorrect
  
  if (auth.isLogin && item.id) {
    try {
      const result = await wrongApi.answer(item.id, { is_correct: isCorrect })
      if (result.removed) {
        item.practiceRemoved = true
        item.practiceMessage = result.message
        // 从错题列表中移除
        items.value = items.value.filter((x) => x.id !== item.id)
        toast.show('🎉 连续答对3次，已从错题本中移除！', 'success')
      } else {
        item.practiceMessage = result.message
        if (isCorrect) {
          item.consecutive_correct = result.consecutive_correct
        } else {
          item.consecutive_correct = 0
        }
      }
    } catch (e) {
      item.practiceMessage = '网络错误：' + e.message
    }
  } else {
    // 未登录用户，本地记录
    if (isCorrect) {
      const newCount = (item.consecutive_correct || 0) + 1
      if (newCount >= 3) {
        item.practiceRemoved = true
        item.consecutive_correct = newCount
        item.practiceMessage = '已连续3次答对，从错题本中移除！'
        // 从本地存储中移除
        const local = JSON.parse(localStorage.getItem('wrong_notebook_local') || '[]')
        const idx = local.findIndex((x, i) => (x.id === item.id) || (x.question === item.question))
        if (idx >= 0) {
          local.splice(idx, 1)
          localStorage.setItem('wrong_notebook_local', JSON.stringify(local))
        }
        items.value = items.value.filter((x, i) => !(x.id === item.id) && !(x.question === item.question))
      } else {
        item.consecutive_correct = newCount
        item.practiceMessage = `已连续答对${newCount}次，还需${3 - newCount}次即可移除`
      }
    } else {
      item.consecutive_correct = 0
      item.practiceMessage = '回答错误，已重置连续正确次数'
    }
  }
  
  item.practiceSubmitted = true
}

const allPracticeSubmitted = computed(() => {
  return practiceList.value.length > 0 && practiceList.value.every((item) => item.practiceSubmitted)
})

const practiceCorrectCount = computed(() => {
  return practiceList.value.filter((item) => item.practiceIsCorrect).length
})

const practiceRemovedCount = computed(() => {
  return practiceList.value.filter((item) => item.practiceRemoved).length
})

async function removeItem(id) {
  if (auth.isLogin) {
    try { await wrongApi.remove(id) } catch (e) { return toast.show('删除失败', 'error') }
    items.value = items.value.filter((x) => x.id !== id)
  } else {
    items.value = items.value.filter((x, idx) => idx !== id)
    localStorage.setItem('wrong_notebook_local', JSON.stringify(items.value))
  }
  toast.show('已移除', 'success')
}

async function clearAll() {
  if (!confirm('确定要清空所有错题吗？')) return
  if (auth.isLogin) {
    try {
      await Promise.all(items.value.map((x) => wrongApi.remove(x.id)))
    } catch (e) {
      return toast.show('清空失败', 'error')
    }
  }
  items.value = []
  localStorage.setItem('wrong_notebook_local', '[]')
  toast.show('已清空错题本', 'success')
}

onMounted(load)
</script>
