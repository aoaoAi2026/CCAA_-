// 离线版：所有API改由localStorage实现，数据保存在手机本地
// 保留与原API一致的Promise调用接口，页面无需大改

const STORAGE_KEYS = {
  USERS: 'app_users',
  CURRENT_USER: 'app_current_user',
  PROGRESS_PREFIX: 'app_progress_',
  DAILY_PLAN_PREFIX: 'app_daily_',
  WRONG_PREFIX: 'app_wrong_',
  ACHIEVEMENTS_PREFIX: 'app_ach_',
  SESSIONS_PREFIX: 'app_sess_',
  PRACTICE_PREFIX: 'app_practice_'
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
      password: simpleHash(d.password),
      email: d.email || '',
      createdAt: Date.now()
    }
    users.push(newUser)
    write(STORAGE_KEYS.USERS, users)
    return { token: 'local_' + newUser.id, user: newUser }
  },

  async login(d) {
    await delay()
    const users = read(STORAGE_KEYS.USERS, [])
    const u = users.find((x) => x.username === d.username)
    if (!u) throw new Error('用户不存在')
    if (u.password !== simpleHash(d.password)) throw new Error('密码错误')
    write(STORAGE_KEYS.CURRENT_USER, u)
    return { token: 'local_' + u.id, user: u }
  },

  async me() {
    await delay()
    const u = read(STORAGE_KEYS.CURRENT_USER, null)
    if (!u) throw new Error('未登录')
    return { user: u }
  },

  async updateProfile(d) {
    await delay()
    const u = read(STORAGE_KEYS.CURRENT_USER, null)
    if (!u) throw new Error('未登录')
    const users = read(STORAGE_KEYS.USERS, [])
    const idx = users.findIndex((x) => x.id === u.id)
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...d, id: u.id, password: users[idx].password }
      write(STORAGE_KEYS.USERS, users)
      write(STORAGE_KEYS.CURRENT_USER, users[idx])
      return users[idx]
    }
    throw new Error('用户不存在')
  },

  async changePassword(d) {
    await delay()
    const u = read(STORAGE_KEYS.CURRENT_USER, null)
    if (!u) throw new Error('未登录')
    if (simpleHash(d.oldPassword) !== u.password) throw new Error('原密码错误')
    const users = read(STORAGE_KEYS.USERS, [])
    const idx = users.findIndex((x) => x.id === u.id)
    users[idx].password = simpleHash(d.newPassword)
    write(STORAGE_KEYS.USERS, users)
    write(STORAGE_KEYS.CURRENT_USER, users[idx])
    return { message: '密码已更新' }
  }
}

// ------- 学习进度 -------
function userKey() {
  const u = read(STORAGE_KEYS.CURRENT_USER, null)
  return u ? u.id : 'guest'
}

export const progressApi = {
  async summary() {
    await delay()
    const data = read(STORAGE_KEYS.PROGRESS_PREFIX + userKey(), [])
    const totalTopics = data.length
    return {
      user_id: userKey(),
      total_topics: totalTopics,
      completed_topics: data.filter((x) => x.completed).length
    }
  },

  async chapterList() {
    await delay()
    const data = read(STORAGE_KEYS.PROGRESS_PREFIX + userKey(), [])
    const map = {}
    data.forEach((x) => {
      const k = x.chapter_id
      if (!map[k]) map[k] = { chapter_id: k, topics: [], completed: 0 }
      map[k].topics.push(x)
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
    const item = {
      id: uid(),
      chapter_id: d.chapter_id,
      chapter_name: d.chapter_name || '',
      question: d.question,
      options: d.options,
      user_answer: d.user_answer,
      correct_answer: d.correct_answer,
      explanation: d.explanation || '',
      consecutive_correct: 0,
      added_at: Date.now()
    }
    list.unshift(item)
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
