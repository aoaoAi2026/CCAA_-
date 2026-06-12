import { defineStore } from 'pinia';
import { authApi, progressApi, sessionApi } from '../utils/request.js';

const AUTH_KEY = 'auth_state_v1';

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || { token: '', user: null };
  } catch (e) {
    return { token: '', user: null };
  }
}

function saveLocal(token, user) {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ token: token || '', user: user || null })
  );
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const { token, user } = loadLocal();
    return {
      token,
      user,
      loading: false,
      errorMsg: ''
    };
  },
  getters: {
    isLogin: (s) => !!s.token && !!s.user,
    avatarChar: (s) =>
      (s.user?.nickname || s.user?.username || 'U').slice(0, 1).toUpperCase(),
    displayName: (s) => s.user?.nickname || s.user?.username || '未登录'
  },
  actions: {
    async register(payload) {
      this.loading = true;
      this.errorMsg = '';
      try {
        const { token, user } = await authApi.register(payload);
        this.token = token;
        this.user = user;
        saveLocal(token, user);
        return user;
      } catch (e) {
        this.errorMsg = e.message;
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async login(payload) {
      this.loading = true;
      this.errorMsg = '';
      try {
        // 登录前先清除旧账号的本地缓存
        this.clearUserData();
        const { token, user } = await authApi.login(payload);
        this.token = token;
        this.user = user;
        saveLocal(token, user);
        return user;
      } catch (e) {
        this.errorMsg = e.message;
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async refreshProfile() {
      if (!this.isLogin) return null;
      try {
        const { user } = await authApi.me();
        this.user = user;
        saveLocal(this.token, user);
        return user;
      } catch (e) {
        return null;
      }
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem(AUTH_KEY);
      // 清除所有用户相关的本地缓存
      this.clearUserData();
    },
    clearUserData() {
      // 清除旧版错题本本地缓存
      localStorage.removeItem('wrongNotebook');
      localStorage.removeItem('wrong_notebook_local');
      // 清除学习笔记
      localStorage.removeItem('learning_notes');
      // 清除章节练习成绩和已完成知识点（按用户隔离的key）
      const uid = this.user?.id
      if (uid) {
        for (let i = 1; i <= 4; i++) {
          localStorage.removeItem('practice_score_chapter' + i);
          localStorage.removeItem('completed_topics_chapter' + i);
          localStorage.removeItem('completed_topics_chapter' + i + '_' + uid);
        }
        // 清除 request.js 中的用户数据
        localStorage.removeItem('app_progress_' + uid);
        localStorage.removeItem('app_daily_' + uid);
        localStorage.removeItem('app_wrong_' + uid);
        localStorage.removeItem('app_ach_' + uid);
        localStorage.removeItem('app_sess_' + uid);
        localStorage.removeItem('app_practice_' + uid);
        localStorage.removeItem('app_stats_' + uid);
      }
      // 清除学习统计
      localStorage.removeItem('learning_stats');
      localStorage.removeItem('weekly_learning');
      // 重置 progress store
      this.$reset?.();
    }
  }
});

// 学习进度 store
export const useProgressStore = defineStore('progress', {
  state: () => ({
    summary: null,
    chapterStats: [],
    loading: false
  }),
  actions: {
    async loadSummary() {
      const auth = useAuthStore();
      if (!auth.isLogin) return null;
      this.loading = true;
      try {
        const data = await progressApi.summary();
        this.summary = data;
        return data;
      } finally {
        this.loading = false;
      }
    },
    async loadChapters() {
      const auth = useAuthStore();
      if (!auth.isLogin) return [];
      try {
        const rows = await progressApi.chapterList();
        this.chapterStats = rows;
        return rows;
      } catch (e) {
        return [];
      }
    },
    async markComplete(chapterId, topicId, topicName) {
      const auth = useAuthStore();
      if (!auth.isLogin) return null;
      try {
        return await progressApi.markComplete({ chapter_id: chapterId, topic_id: topicId, topic_name: topicName });
      } catch (e) {
        return null;
      }
    },
    async logSession(durationMin, topicName) {
      const auth = useAuthStore();
      if (!auth.isLogin) return;
      try {
        await sessionApi.log({
          duration_minutes: durationMin || 1,
          topics_completed: 0,
          notes: topicName || ''
        });
      } catch (e) {}
    }
  }
});

// 全局 UI store（toast）
export const useToastStore = defineStore('toast', {
  state: () => ({ message: '', type: 'info', visible: false, timer: null }),
  actions: {
    show(message, type = 'info', duration = 2500) {
      if (this.timer) clearTimeout(this.timer);
      this.message = message;
      this.type = type;
      this.visible = true;
      this.timer = setTimeout(() => {
        this.visible = false;
      }, duration);
    }
  }
});
