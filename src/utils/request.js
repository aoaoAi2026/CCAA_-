// 纯前端单机版：所有数据保存在浏览器 localStorage
// 多账号支持：数据按 userId 隔离，不同账号数据互不影响
// 保留 Promise 调用接口，页面无需大改

const STORAGE_KEYS = {
  USERS: 'app_users',
  CURRENT_USER: 'app_current_user',
  PROGRESS_PREFIX: 'app_progress_',
  DAILY_PLAN_PREFIX: 'app_daily_',
  WRONG_PREFIX: 'app_wrong_',
  ACHIEVEMENTS_PREFIX: 'app_ach_',
  SESSIONS_PREFIX: 'app_sess_',
  PRACTICE_PREFIX: 'app_practice_',
  USER_STATS_PREFIX: 'app_stats_'
}

// ------- 工具方法 -------
function read(key, def) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : def
  } catch (e) {
    return def
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    return false
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return h.toString(36)
}

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 获取当前登录用户ID
function userKey() {
  // 优先读取 Pinia store 的认证状态
  const authState = read('auth_state_v1', null)
  if (authState && authState.user && authState.user.id) {
    return authState.user.id
  }
  // 兼容旧版存储
  const u = read(STORAGE_KEYS.CURRENT_USER, null)
  return u ? u.id : 'guest'
}

// 获取/更新当前用户统计
function getUserStats() {
  const key = STORAGE_KEYS.USER_STATS_PREFIX + userKey()
  return read(key, { total_points: 0, level: 1, study_hours: 0 })
}

function saveUserStats(stats) {
  const key = STORAGE_KEYS.USER_STATS_PREFIX + userKey()
  write(key, stats)
  // 同步到 CURRENT_USER 和 USERS 列表
  const u = read(STORAGE_KEYS.CURRENT_USER, null)
  if (u) {
    u.total_points = stats.total_points
    u.level = stats.level
    u.study_hours = stats.study_hours
    write(STORAGE_KEYS.CURRENT_USER, u)
    const users = read(STORAGE_KEYS.USERS, [])
    const idx = users.findIndex((x) => x.id === u.id)
    if (idx >= 0) {
      users[idx] = { ...users[idx], total_points: stats.total_points, level: stats.level, study_hours: stats.study_hours }
      write(STORAGE_KEYS.USERS, users)
    }
  }
}

// 添加积分
function addPoints(pts) {
  const stats = getUserStats()
  stats.total_points = (stats.total_points || 0) + pts
  stats.level = Math.floor(stats.total_points / 100) + 1
  saveUserStats(stats)
  return stats
}

// ------- 用户认证 -------
// 注册/登录只检查密码，数据按 username 隔离，多账号互不影响
export const authApi = {
  async register(d) {
    await delay()
    const users = read(STORAGE_KEYS.USERS, [])
    if (users.find((u) => u.username === d.username)) {
      throw new Error('用户名已存在')
    }
    const newUser = {
      id: uid(),
      username: d.username,
      nickname: d.nickname || d.username,
      password: simpleHash(d.password),
      email: d.email || '',
      total_points: 0,
      level: 1,
      study_hours: 0,
      createdAt: Date.now()
    }
    users.push(newUser)
    write(STORAGE_KEYS.USERS, users)
    write(STORAGE_KEYS.CURRENT_USER, newUser)
    // 初始化用户统计
    saveUserStats({ total_points: 0, level: 1, study_hours: 0 })
    return { token: 'local_' + newUser.id, user: newUser }
  },

  async login(d) {
    await delay()
    const users = read(STORAGE_KEYS.USERS, [])
    const u = users.find((x) => x.username === d.username)
    if (!u) throw new Error('用户不存在')
    if (u.password !== simpleHash(d.password)) throw new Error('密码错误')
    // 确保 user 对象有最新统计
    const stats = read(STORAGE_KEYS.USER_STATS_PREFIX + u.id, { total_points: 0, level: 1, study_hours: 0 })
    const fullUser = { ...u, total_points: stats.total_points, level: stats.level, study_hours: stats.study_hours }
    write(STORAGE_KEYS.CURRENT_USER, fullUser)
    return { token: 'local_' + u.id, user: fullUser }
  },

  async me() {
    await delay()
    const u = read(STORAGE_KEYS.CURRENT_USER, null)
    if (!u) throw new Error('未登录')
    const stats = getUserStats()
    const fullUser = { ...u, total_points: stats.total_points, level: stats.level, study_hours: stats.study_hours }
    write(STORAGE_KEYS.CURRENT_USER, fullUser)
    return { user: fullUser }
  },

  async updateProfile(d) {
    await delay()
    const u = read(STORAGE_KEYS.CURRENT_USER, null)
    if (!u) throw new Error('未登录')
    const users = read(STORAGE_KEYS.USERS, [])
    const idx = users.findIndex((x) => x.id === u.id)
    if (idx >= 0) {
      const updated = { ...users[idx], ...d, id: u.id, password: users[idx].password }
      users[idx] = updated
      write(STORAGE_KEYS.USERS, users)
      write(STORAGE_KEYS.CURRENT_USER, updated)
      return updated
    }
    throw new Error('用户不存在')
  },

  async changePassword(d) {
    await delay()
    const u = read(STORAGE_KEYS.CURRENT_USER, null)
    if (!u) throw new Error('未登录')
    // 兼容 oldPassword/old_password 两种参数名
    const oldPwd = d.oldPassword || d.old_password || ''
    const newPwd = d.newPassword || d.new_password || ''
    if (simpleHash(oldPwd) !== u.password) throw new Error('原密码错误')
    if (!newPwd || newPwd.length < 6) throw new Error('新密码至少 6 位')
    const users = read(STORAGE_KEYS.USERS, [])
    const idx = users.findIndex((x) => x.id === u.id)
    if (idx < 0) throw new Error('用户不存在')
    users[idx].password = simpleHash(newPwd)
    write(STORAGE_KEYS.USERS, users)
    write(STORAGE_KEYS.CURRENT_USER, users[idx])
    return { message: '密码已更新' }
  }
}

// ------- 学习进度 -------
function buildWrongQuestionIdentity(d = {}) {
  const stableId = [
    d.chapter_id || '',
    d.question_id || '',
    d.question || '',
    JSON.stringify(d.options || []),
    d.correct_answer ?? ''
  ].join('::')
  return simpleHash(stableId)
}

function buildWrongQuestionKey(d = {}) {
  return d.question_key || buildWrongQuestionIdentity(d)
}

function normalizeWrongItem(d = {}) {
  return {
    id: d.id || uid(),
    question_key: buildWrongQuestionKey(d),
    question_id: d.question_id ?? null,
    question_type: d.question_type || 'single',
    source: d.source || 'practice',
    source_name: d.source_name || '',
    chapter_id: d.chapter_id,
    chapter_name: d.chapter_name || '',
    question: d.question,
    options: Array.isArray(d.options) ? d.options : [],
    user_answer: d.user_answer,
    correct_answer: d.correct_answer,
    explanation: d.explanation || '',
    consecutive_correct: d.consecutive_correct || 0,
    added_at: d.added_at || Date.now()
  }
}

export const progressApi = {
  async summary() {
    await delay()
    const data = read(STORAGE_KEYS.PROGRESS_PREFIX + userKey(), [])
    const wrongData = read(STORAGE_KEYS.WRONG_PREFIX + userKey(), [])
    const stats = getUserStats()
    return {
      user_id: userKey(),
      total_topics: data.length,
      completed_topics: data.filter((x) => x.completed).length,
      completedTopics: data.filter((x) => x.completed).length,
      wrongCount: wrongData.length,
      badges: read(STORAGE_KEYS.ACHIEVEMENTS_PREFIX + userKey(), []).length,
      total_points: stats.total_points || 0
    }
  },

  async chapterList() {
    await delay()
    const data = read(STORAGE_KEYS.PROGRESS_PREFIX + userKey(), [])
    const map = {}
    data.forEach((x) => {
      const k = x.chapter_id
      if (!map[k]) map[k] = { chapter_id: k, topic_count: 0, completed: 0 }
      map[k].topic_count++
      if (x.completed) map[k].completed++
    })
    return Object.values(map)
  },

  async chapterDetail(id) {
    await delay()
    const data = read(STORAGE_KEYS.PROGRESS_PREFIX + userKey(), [])
    return data.filter((x) => Number(x.chapter_id) === Number(id))
  },

  async markComplete(d) {
    await delay()
    const data = read(STORAGE_KEYS.PROGRESS_PREFIX + userKey(), [])
    const exist = data.find((x) => Number(x.chapter_id) === Number(d.chapter_id) && x.topic_id === d.topic_id)
    if (exist) {
      exist.completed = 1
      exist.completed_at = Date.now()
    } else {
      data.push({
        id: uid(),
        chapter_id: d.chapter_id,
        topic_id: d.topic_id,
        topic_name: d.topic_name || '',
        completed: 1,
        completed_at: Date.now()
      })
    }
    write(STORAGE_KEYS.PROGRESS_PREFIX + userKey(), data)
    // 标记知识点完成 +10 积分
    addPoints(10)
    autoCheckAchievements()
    return { message: '已保存' }
  }
}

// ------- 每日计划 -------
export const dailyPlanApi = {
  async getProgress() {
    await delay()
    return read(STORAGE_KEYS.DAILY_PLAN_PREFIX + userKey(), [])
  },

  async toggleDay(d) {
    await delay()
    const data = read(STORAGE_KEYS.DAILY_PLAN_PREFIX + userKey(), [])
    const exist = data.find((x) => Number(x.day) === Number(d.day))
    if (exist) {
      exist.completed = d.completed
    } else {
      data.push({ day: d.day, title: d.title || '', completed: d.completed, updated_at: Date.now() })
    }
    write(STORAGE_KEYS.DAILY_PLAN_PREFIX + userKey(), data)
    return { day: d.day, title: d.title, completed: d.completed }
  }
}

// ------- 错题本 -------
export const wrongApi = {
  async list() {
    await delay()
    return read(STORAGE_KEYS.WRONG_PREFIX + userKey(), [])
  },

  async add(d) {
    await delay()
    const list = read(STORAGE_KEYS.WRONG_PREFIX + userKey(), [])
    const questionKey = buildWrongQuestionIdentity(d)
    const existingIndex = list.findIndex((x) => {
      return x.question_key === questionKey || buildWrongQuestionIdentity(x) === questionKey
    })

    const item = normalizeWrongItem({
      ...d,
      question_key: questionKey,
      consecutive_correct: 0,
      added_at: Date.now()
    })

    if (existingIndex >= 0) {
      const existing = list.splice(existingIndex, 1)[0]
      list.unshift(
        normalizeWrongItem({
          ...existing,
          ...item,
          id: existing.id || item.id
        })
      )
    } else {
      list.unshift(item)
    }

    write(STORAGE_KEYS.WRONG_PREFIX + userKey(), list.slice(0, 200))
    return item
  },

  async remove(id) {
    await delay()
    const list = read(STORAGE_KEYS.WRONG_PREFIX + userKey(), [])
    const next = list.filter((x) => x.id !== id)
    write(STORAGE_KEYS.WRONG_PREFIX + userKey(), next)
    return { message: '已移除' }
  },

  // 批量添加错题（一次读写，避免并发写覆盖）
  async batchAdd(items) {
    if (!items.length) return []
    const list = read(STORAGE_KEYS.WRONG_PREFIX + userKey(), [])
    const added = []
    for (const d of items) {
      const questionKey = buildWrongQuestionIdentity(d)
      const existingIndex = list.findIndex((x) => x.question_key === questionKey || buildWrongQuestionIdentity(x) === questionKey)
      const item = normalizeWrongItem({ ...d, question_key: questionKey, consecutive_correct: 0, added_at: Date.now() })
      if (existingIndex >= 0) {
        const existing = list.splice(existingIndex, 1)[0]
        list.unshift(normalizeWrongItem({ ...existing, ...item, id: existing.id || item.id }))
      } else {
        list.unshift(item)
      }
      added.push(item)
    }
    write(STORAGE_KEYS.WRONG_PREFIX + userKey(), list.slice(0, 200))
    return added
  },

  // 清空所有错题
  async clearAll() {
    write(STORAGE_KEYS.WRONG_PREFIX + userKey(), [])
    return { message: '已清空' }
  },

  async answer(id, d) {
    await delay()
    const list = read(STORAGE_KEYS.WRONG_PREFIX + userKey(), [])
    const item = list.find((x) => x.id === id)
    if (!item) throw new Error('错题不存在')
    if (d.is_correct) {
      const nextCount = (item.consecutive_correct || 0) + 1
      if (nextCount >= 3) {
        const filtered = list.filter((x) => x.id !== id)
        write(STORAGE_KEYS.WRONG_PREFIX + userKey(), filtered)
        return { removed: true, consecutive_correct: nextCount, message: '连续答对3次，已从错题本移除' }
      }
      item.consecutive_correct = nextCount
      write(STORAGE_KEYS.WRONG_PREFIX + userKey(), list)
      return { removed: false, consecutive_correct: nextCount, need_more: 3 - nextCount, message: `已连续答对${nextCount}次，还需${3 - nextCount}次` }
    } else {
      item.consecutive_correct = 0
      write(STORAGE_KEYS.WRONG_PREFIX + userKey(), list)
      return { removed: false, consecutive_correct: 0, message: '答错，已重置' }
    }
  }
}

// ------- 成就/徽章 -------
export const achievementApi = {
  async list() {
    await delay()
    return read(STORAGE_KEYS.ACHIEVEMENTS_PREFIX + userKey(), [])
  },

  async unlock(d) {
    await delay()
    const list = read(STORAGE_KEYS.ACHIEVEMENTS_PREFIX + userKey(), [])
    const exist = list.find((x) => x.name === d.name)
    if (exist) return exist
    list.push({ id: uid(), name: d.name, description: d.description || '', unlocked_at: Date.now() })
    write(STORAGE_KEYS.ACHIEVEMENTS_PREFIX + userKey(), list)
    return list[list.length - 1]
  }
}

// 成就检查：根据学习数据自动解锁成就
async function autoCheckAchievements() {
  const ukey = userKey()
  const progress = read(STORAGE_KEYS.PROGRESS_PREFIX + ukey, [])
  const sessions = read(STORAGE_KEYS.SESSIONS_PREFIX + ukey, [])
  const wrongList = read(STORAGE_KEYS.WRONG_PREFIX + ukey, [])
  const practiceScores = read(STORAGE_KEYS.PRACTICE_PREFIX + ukey, [])
  const existing = read(STORAGE_KEYS.ACHIEVEMENTS_PREFIX + ukey, [])

  const has = (name) => existing.some(a => a.name === name)
  const unlock = (name, desc) => {
    if (!has(name)) {
      existing.push({ id: uid(), name, description: desc, unlocked_at: Date.now() })
    }
  }

  const completedTopics = progress.filter(x => x.completed).length
  const totalMinutes = sessions.reduce((s, x) => s + (x.duration_minutes || 0), 0)
  const totalCorrect = sessions.reduce((s, x) => s + (x.correct_count || 0), 0)

  if (completedTopics >= 1) unlock('初出茅庐', '完成第一个知识点的学习')
  if (completedTopics >= 10) unlock('学有所成', '完成10个知识点的学习')
  if (completedTopics >= 28) unlock('博学多才', '完成全部28个知识点的学习')
  if (totalMinutes >= 60) unlock('持之以恒', '累计学习1小时')
  if (totalMinutes >= 600) unlock('学无止境', '累计学习10小时')
  if (totalCorrect >= 50) unlock('百炼成钢', '累计答对50题')
  if (totalCorrect >= 200) unlock('千锤百炼', '累计答对200题')
  if (wrongList.length === 0 && completedTopics > 0) unlock('完美如初', '错题本为空')
  if (practiceScores.some(s => s.score === 100)) unlock('完美无缺', '章节练习获得满分')

  write(STORAGE_KEYS.ACHIEVEMENTS_PREFIX + ukey, existing)
}

// ------- 学习会话 -------
export const sessionApi = {
  async list() {
    await delay()
    return read(STORAGE_KEYS.SESSIONS_PREFIX + userKey(), [])
  },

  async log(d) {
    await delay()
    const list = read(STORAGE_KEYS.SESSIONS_PREFIX + userKey(), [])
    const today = new Date().toISOString().slice(0, 10)
    const exist = list.find((x) => x.session_date === today)
    if (exist) {
      exist.duration_minutes = (exist.duration_minutes || 0) + (d.duration_minutes || 0)
      exist.questions_answered = (exist.questions_answered || 0) + (d.questions_answered || 0)
      exist.correct_count = (exist.correct_count || 0) + (d.correct_count || 0)
      exist.notes = [exist.notes, d.notes].filter(Boolean).join('\n')
    } else {
      list.unshift({
        id: uid(),
        session_date: today,
        duration_minutes: d.duration_minutes || 0,
        questions_answered: d.questions_answered || 0,
        correct_count: d.correct_count || 0,
        notes: d.notes || '',
        logged_at: Date.now()
      })
    }
    write(STORAGE_KEYS.SESSIONS_PREFIX + userKey(), list.slice(0, 60))
    return { message: '已记录' }
  }
}

// ------- 章节练习成绩 -------
export const practiceApi = {
  async saveScore(d) {
    await delay()
    const data = read(STORAGE_KEYS.PRACTICE_PREFIX + userKey(), [])
    const exist = data.find((x) => Number(x.chapter_id) === Number(d.chapter_id))
    if (exist) {
      exist.score = Math.max(exist.score, d.score)
      exist.updated_at = Date.now()
    } else {
      data.push({ chapter_id: d.chapter_id, score: d.score, created_at: Date.now(), updated_at: Date.now() })
    }
    write(STORAGE_KEYS.PRACTICE_PREFIX + userKey(), data)
    autoCheckAchievements()
    return { message: '成绩已保存' }
  },

  async getScore(chapterId) {
    await delay()
    const data = read(STORAGE_KEYS.PRACTICE_PREFIX + userKey(), [])
    const item = data.find((x) => Number(x.chapter_id) === Number(chapterId))
    return { chapter_id: Number(chapterId), score: item ? item.score : 0 }
  }
}

// ------- 退出登录清理数据 -------
export function clearUserDataFor(userId) {
  if (!userId) return
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (key.endsWith('_')) {
      localStorage.removeItem(key + userId)
    }
  })
}

export default {
  post: async (path, data) => { await delay(); return { code: 0, data } },
  get: async () => { await delay(); return { code: 0, data: [] } }
}
