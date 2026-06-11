<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">每日学习计划</h1>
        <p class="text-gray-600">
          {{ isLogin ? '科学规划每一天的学习任务，稳步迈向考试目标' : '登录后可跟踪你的专属学习进度' }}
        </p>
        <router-link v-if="!isLogin" to="/login" class="mt-3 inline-block text-sm text-blue-600 hover:underline">
          点击登录
        </router-link>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800">完整学习计划（共{{ allDailyPlans.length }}天）</h2>
          <div class="text-sm text-gray-600">
            已完成 <span class="font-bold text-green-600">{{ completedCount }}</span> / {{ allDailyPlans.length }}
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="plan in allDailyPlans"
            :key="'plan-' + plan.day"
            class="p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
            :class="getDayClass(plan)"
            @click="selectDayPlan(plan)"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-1 rounded text-xs font-medium" :class="getChapterBadge(plan.chapter)">
                第{{ plan.chapter }}章
              </span>
              <span class="text-sm text-gray-500">{{ plan.duration }}分钟</span>
            </div>
            <h3 class="font-medium text-gray-800 mb-1">{{ plan.title }}</h3>
            <div class="flex items-center justify-between mt-2">
              <span class="text-sm text-gray-500">第{{ plan.day }}天</span>
              <Check v-if="isDayCompleted(plan.day)" class="w-5 h-5 text-green-500" />
              <span v-else class="text-xs text-gray-400">待学习</span>
            </div>
          </div>
        </div>
      </div>

      <div id="day-plan-detail" v-if="selectedDayPlan" class="bg-white rounded-xl shadow-lg p-8 mt-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <span class="px-3 py-1 rounded text-xs font-medium" :class="getChapterBadge(selectedDayPlan.chapter)">
              第{{ selectedDayPlan.chapter }}章
            </span>
            <h2 class="text-xl font-bold text-gray-800 mt-2">{{ selectedDayPlan.title }}</h2>
            <p class="text-gray-500 mt-1">建议学习时长：{{ selectedDayPlan.duration }}分钟</p>
          </div>
          <button @click="selectedDayPlan = null" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X class="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div class="mb-4">
          <button
            @click="toggleDayCompleted(selectedDayPlan)"
            :disabled="checkingScore"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            :class="isDayCompleted(selectedDayPlan.day)
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'"
          >
            <CheckCircle v-if="!checkingScore" class="w-4 h-4 mr-2" />
            <span v-if="checkingScore" class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ checkingScore ? '正在检查成绩...' : (isDayCompleted(selectedDayPlan.day) ? '已完成（点击取消）' : '标记为已完成') }}
          </button>
        </div>

        <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ⚠️ {{ errorMessage }}
        </div>

        <div class="prose max-w-none">
          <div v-html="formatContent(selectedDayPlan.content)" class="text-gray-700 leading-relaxed"></div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            @click="goToKnowledge(selectedDayPlan.chapter)"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <BookOpen class="w-5 h-5 mr-2" />
            查看章节知识点
          </button>
          <button
            @click="goToPractice(selectedDayPlan.chapter)"
            class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            <FileQuestion class="w-5 h-5 mr-2" />
            章节练习
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Check,
  CheckCircle,
  BookOpen,
  FileQuestion,
  X
} from 'lucide-vue-next';
import { detailedContent } from '../data/detailedContent';
import { courseData } from '../data/courseData';
import { dailyPlanApi, progressApi, practiceApi } from '../utils/request.js';
import { useAuthStore } from '../stores/index.js';

const router = useRouter();
const auth = useAuthStore();
const isLogin = computed(() => auth.isLogin);

const selectedDayPlan = ref(null);
const completedDays = ref([]);
const loadedSummary = ref(null);
const checkingScore = ref(false);
const errorMessage = ref('');

const allDailyPlans = computed(() => {
  const plans = [];
  const keys = Object.keys(detailedContent).sort();
  keys.forEach((key) => {
    const chapter = detailedContent[key];
    if (chapter && chapter.dailyPlans) {
      chapter.dailyPlans.forEach((plan) => {
        plans.push({ ...plan, chapter: chapter.id });
      });
    }
  });
  return plans.sort((a, b) => a.day - b.day);
});

const chapterColors = {
  1: 'bg-blue-100 text-blue-600',
  2: 'bg-green-100 text-green-600',
  3: 'bg-purple-100 text-purple-600',
  4: 'bg-orange-100 text-orange-600',
  5: 'bg-pink-100 text-pink-600',
  6: 'bg-indigo-100 text-indigo-600',
  7: 'bg-teal-100 text-teal-600',
  8: 'bg-rose-100 text-rose-600'
};

function getChapterBadge(chapter) {
  return chapterColors[chapter] || 'bg-gray-100 text-gray-600';
}

function isDayCompleted(day) {
  return completedDays.value.includes(Number(day));
}

const completedCount = computed(() => completedDays.value.length);

function getDayClass(plan) {
  const done = isDayCompleted(plan.day);
  return [
    done ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white',
    'hover:border-blue-400'
  ].join(' ');
}

function selectDayPlan(plan) {
  selectedDayPlan.value = plan;
}

function formatContent(content) {
  if (!content) return '<p class="text-gray-500">暂无详细内容，请稍后查看...</p>';
  let html = content;
  html = html.replace(
    /^## (.*)$/gm,
    '</p><h2 class="text-xl font-bold text-gray-800 mt-6 mb-3">$1</h2><p class="mb-3">'
  );
  html = html.replace(
    /^### (.*)$/gm,
    '</p><h3 class="text-lg font-semibold text-gray-700 mt-4 mb-2">$1</h3><p class="mb-3">'
  );
  html = html.replace(
    /^#### (.*)$/gm,
    '</p><h4 class="text-base font-medium text-gray-600 mt-3 mb-2">$1</h4><p class="mb-3">'
  );
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-600">$1</strong>');
  html = html.replace(
    /^\d+\.\s*\*\*(.*?)\*\*(.*)$/gm,
    '</p><p class="mb-2 ml-2"><span class="font-semibold text-blue-700">$1</span>$2</p><p class="mb-3">'
  );
  html = html.replace(/^- (.*)$/gm, '</p><li class="ml-4 mb-1 text-gray-700">$1</li><p class="mb-3">');
  html = html.replace(/\n\n/g, '</p><p class="mb-3">');
  html = html.replace(/\n/g, '<br>');
  return '<p class="mb-3">' + html + '</p>';
}

async function loadUserProgress() {
  if (!isLogin.value) return;
  try {
    const rows = await dailyPlanApi.getProgress();
    const arr = [];
    (rows || []).forEach((r) => {
      if (r.completed) arr.push(Number(r.day));
    });
    completedDays.value = arr;
    const summary = await progressApi.summary();
    loadedSummary.value = summary;
  } catch (e) {
    console.warn('加载学习进度失败:', e.message);
  }
}

async function toggleDayCompleted(plan) {
  errorMessage.value = '';
  
  if (!isLogin.value) {
    router.push('/login');
    return;
  }
  
  const day = Number(plan.day);
  const wasCompleted = completedDays.value.includes(day);
  
  // 如果是标记为已完成，需要检查对应章节练习成绩
  if (!wasCompleted) {
    checkingScore.value = true;
    const chapterId = plan.chapter;
    let score = 0;
    try {
      const result = await practiceApi.getScore(chapterId);
      score = result?.score || 0;
    } catch (e) {
      console.warn('获取章节成绩失败：', e.message);
    } finally {
      checkingScore.value = false;
    }
    
    if (score < 70) {
      errorMessage.value = `请先完成第${chapterId}章的章节练习并达到70分以上，才能标记为已完成！当前成绩：${score}分`;
      return;
    }
  }
  
  const nextVal = wasCompleted ? 0 : 1;
  try {
    await dailyPlanApi.toggleDay({ day, title: plan.title, completed: nextVal });
    if (nextVal === 1) {
      completedDays.value = [...completedDays.value, day];
    } else {
      completedDays.value = completedDays.value.filter((d) => d !== day);
    }
    errorMessage.value = '';
  } catch (e) {
    errorMessage.value = '更新失败: ' + e.message;
  }
}

function goToKnowledge(chId) {
  router.push({ name: 'Knowledge', params: { chapterId: chId } });
}

function goToPractice(chId) {
  router.push({ name: 'Practice', params: { chapterId: chId } });
}

onMounted(loadUserProgress);
</script>

<style scoped>
.prose {
  line-height: 1.8;
}
</style>
