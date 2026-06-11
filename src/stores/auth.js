import { ref, computed } from 'vue';
import { authApi } from '../utils/request.js';

const AUTH_KEY = 'app_current_user';
const TOKEN_KEY = 'auth_token';

function loadLocal() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveLocal(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  if (user && user.id) {
    localStorage.setItem(TOKEN_KEY, 'local_' + user.id);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function clearUserData() {
  // 清除此用户所有学习相关数据（key 按 userId 隔离的前缀）
  const user = loadLocal();
  const uid = user?.id;
  if (uid) {
    const prefixes = ['app_progress_', 'app_daily_', 'app_wrong_', 'app_ach_', 'app_sess_', 'app_practice_'];
    for (const key of prefixes) {
      localStorage.removeItem(key + uid);
    }
  }
  // 通用清理
  localStorage.removeItem('learning_notes');
  localStorage.removeItem('learning_stats');
  localStorage.removeItem('weekly_learning');
  localStorage.removeItem('completed_topics_chapter1');
  localStorage.removeItem('completed_topics_chapter2');
  localStorage.removeItem('completed_topics_chapter3');
  localStorage.removeItem('completed_topics_chapter4');
  localStorage.removeItem('practice_score_chapter1');
  localStorage.removeItem('practice_score_chapter2');
  localStorage.removeItem('practice_score_chapter3');
  localStorage.removeItem('practice_score_chapter4');
  localStorage.removeItem('wrongNotebook');
  localStorage.removeItem('wrong_notebook_local');
}

const cachedUser = loadLocal();
const token = ref(cachedUser ? 'local_' + cachedUser.id : '');
const user = ref(cachedUser);
const isLogin = computed(() => !!token.value && !!user.value);

async function login(username, password) {
  clearUserData();
  const result = await authApi.login({ username, password });
  token.value = result.token;
  user.value = result.user;
  saveLocal(result.user);
  return result.user;
}

async function register(data) {
  clearUserData();
  const result = await authApi.register(data);
  token.value = result.token;
  user.value = result.user;
  saveLocal(result.user);
  return result.user;
}

async function refreshProfile() {
  if (!token.value) return null;
  try {
    const u = await authApi.me();
    user.value = u;
    saveLocal(u);
    return u;
  } catch (e) {
    return null;
  }
}

function logout() {
  clearUserData();
  token.value = '';
  user.value = null;
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

window.addEventListener('auth:logout', logout);

export const useAuthStore = () => ({
  token,
  user,
  isLogin,
  login,
  register,
  logout,
  refreshProfile,
  updateProfile: authApi.updateProfile,
  changePassword: authApi.changePassword
});
