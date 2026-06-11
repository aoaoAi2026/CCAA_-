import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ren-tong-ji-secret-key-change-in-prod';

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'app.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// ============ 建表 ============
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  nickname TEXT,
  study_hours INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_active_date TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS wrong_notebook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  chapter_id INTEGER NOT NULL,
  chapter_name TEXT,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  user_answer INTEGER NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  consecutive_correct INTEGER DEFAULT 0,
  added_at TEXT DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learning_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  chapter_id INTEGER NOT NULL,
  topic_id INTEGER NOT NULL,
  topic_name TEXT,
  completed INTEGER DEFAULT 1,
  completed_at TEXT DEFAULT (datetime('now','localtime')),
  UNIQUE(user_id, chapter_id, topic_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TEXT DEFAULT (datetime('now','localtime')),
  UNIQUE(user_id, badge_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_date TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  topics_completed INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  UNIQUE(user_id, session_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_plan_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  day INTEGER NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now','localtime')),
  UNIQUE(user_id, day),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// 演示账号（幂等）
const demo = db.prepare('SELECT id FROM users WHERE username = ?').get('demo');
if (!demo) {
  db.prepare('INSERT INTO users (username, email, password_hash, nickname) VALUES (?, ?, ?, ?)').run(
    'demo', 'demo@example.com', bcrypt.hashSync('123456', 10), '演示用户'
  );
}

// ============ 工具 ============
function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username, nickname: user.nickname }, JWT_SECRET, {
    expiresIn: '30d'
  });
}
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ code: 401, message: '请先登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
}
function ok(res, data, message) {
  return res.json({ code: 0, message: message || 'ok', data });
}

// ============ 认证 ============

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, nickname } = req.body || {};
  if (!username || !password) return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
  if (username.length < 3 || password.length < 6) return res.status(400).json({ code: 400, message: '用户名至少3位，密码至少6位' });
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username))
    return res.status(409).json({ code: 409, message: '该用户名已被使用' });
  if (email && db.prepare('SELECT id FROM users WHERE email = ?').get(email))
    return res.status(409).json({ code: 409, message: '该邮箱已被注册' });
  const info = db.prepare('INSERT INTO users (username, email, password_hash, nickname) VALUES (?, ?, ?, ?)')
    .run(username, email || null, bcrypt.hashSync(password, 10), nickname || username);
  const user = db.prepare('SELECT id, username, email, nickname, study_hours, streak_days, total_points, level FROM users WHERE id = ?').get(info.lastInsertRowid);
  ok(res, { token: signToken(user), user });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ code: 400, message: '请输入用户名和密码' });
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row) return res.status(404).json({ code: 404, message: '用户不存在' });
  if (!bcrypt.compareSync(password, row.password_hash)) return res.status(401).json({ code: 401, message: '密码错误' });
  const user = {
    id: row.id, username: row.username, email: row.email, nickname: row.nickname,
    study_hours: row.study_hours, streak_days: row.streak_days, total_points: row.total_points, level: row.level
  };
  ok(res, { token: signToken(user), user });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare(
    'SELECT id, username, email, nickname, study_hours, streak_days, total_points, level, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  ok(res, { user });
});

app.put('/api/auth/profile', auth, (req, res) => {
  const { nickname, email } = req.body || {};
  db.prepare('UPDATE users SET nickname = ?, email = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?').run(
    nickname || null, email || null, req.user.id
  );
  ok(res, null, '资料已更新');
});

app.put('/api/auth/password', auth, (req, res) => {
  const { old_password, new_password } = req.body || {};
  if (!old_password || !new_password || new_password.length < 6)
    return res.status(400).json({ code: 400, message: '新密码至少6位' });
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(old_password, row.password_hash))
    return res.status(401).json({ code: 401, message: '原密码不正确' });
  db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?').run(
    bcrypt.hashSync(new_password, 10), req.user.id
  );
  ok(res, null, '密码已修改');
});

// ============ 学习进度 / 章节进度 ============
app.post('/api/progress/complete', auth, (req, res) => {
  const { chapter_id, topic_id, topic_name } = req.body || {};
  if (!chapter_id || !topic_id) return res.status(400).json({ code: 400, message: '缺少章节或主题' });
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO learning_progress (user_id, chapter_id, topic_id, topic_name) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(req.user.id, chapter_id, topic_id, topic_name || '');
  // 更新 study_sessions（当天累计）
  const today = new Date().toISOString().slice(0, 10);
  const existing = db.prepare('SELECT id FROM study_sessions WHERE user_id = ? AND session_date = ?').get(req.user.id, today);
  if (existing) {
    db.prepare('UPDATE study_sessions SET topics_completed = topics_completed + 1 WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO study_sessions (user_id, session_date, topics_completed) VALUES (?, ?, 1)').run(req.user.id, today);
  }
  // 更新用户积分 + 等级
  db.prepare('UPDATE users SET total_points = total_points + 10, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?').run(req.user.id);
  const user = db.prepare('SELECT total_points, level FROM users WHERE id = ?').get(req.user.id);
  const newLevel = Math.floor(user.total_points / 100) + 1;
  if (newLevel !== user.level) {
    db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel, req.user.id);
    db.prepare('INSERT OR IGNORE INTO achievements (user_id, badge_key, badge_name, description, icon) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'level_' + newLevel, `达到等级 ${newLevel}`, `累计积分 ${user.total_points}`, 'trophy');
  }
  // 若有新插入，返回新增了一条
  ok(res, { inserted: info.changes > 0, total_points: user.total_points, level: newLevel }, '已标记完成 +10积分');
});

app.get('/api/progress/summary', auth, (req, res) => {
  const completedTopics = db.prepare('SELECT COUNT(*) AS n FROM learning_progress WHERE user_id = ?').get(req.user.id).n;
  const wrongCount = db.prepare('SELECT COUNT(*) AS n FROM wrong_notebook WHERE user_id = ?').get(req.user.id).n;
  const badges = db.prepare('SELECT COUNT(*) AS n FROM achievements WHERE user_id = ?').get(req.user.id).n;
  const user = db.prepare('SELECT study_hours, total_points, level FROM users WHERE id = ?').get(req.user.id);
  ok(res, {
    completedTopics, wrongCount, badges,
    study_hours: user.study_hours, total_points: user.total_points, level: user.level
  });
});

app.get('/api/progress/chapters', auth, (req, res) => {
  const rows = db.prepare(
    'SELECT chapter_id, COUNT(*) AS topic_count FROM learning_progress WHERE user_id = ? GROUP BY chapter_id'
  ).all(req.user.id);
  ok(res, rows);
});

app.get('/api/progress/chapter/:id', auth, (req, res) => {
  const rows = db.prepare(
    'SELECT chapter_id, topic_id, topic_name, completed_at FROM learning_progress WHERE user_id = ? AND chapter_id = ?'
  ).all(req.user.id, req.params.id);
  ok(res, rows);
});

// ============ 每日计划进度 ============
app.get('/api/daily-plan/progress', auth, (req, res) => {
  const rows = db.prepare(
    'SELECT day, title, completed, updated_at FROM daily_plan_progress WHERE user_id = ?'
  ).all(req.user.id);
  ok(res, rows);
});

app.post('/api/daily-plan/toggle', auth, (req, res) => {
  const { day, title, completed } = req.body || {};
  if (!day || !title) return res.status(400).json({ code: 400, message: '参数错误' });
  const existing = db.prepare('SELECT id FROM daily_plan_progress WHERE user_id = ? AND day = ?').get(req.user.id, day);
  const nextVal = typeof completed === 'number' ? completed : 1;
  if (existing) {
    db.prepare('UPDATE daily_plan_progress SET completed = ?, title = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?')
      .run(nextVal, title, existing.id);
  } else {
    db.prepare('INSERT INTO daily_plan_progress (user_id, day, title, completed) VALUES (?, ?, ?, ?)')
      .run(req.user.id, day, title, nextVal);
  }
  ok(res, { day, title, completed: nextVal });
});

// ============ 章节练习成绩 ============
app.post('/api/practice/score', auth, (req, res) => {
  const { chapter_id, score } = req.body || {};
  if (!chapter_id || typeof score !== 'number') return res.status(400).json({ code: 400, message: '参数错误' });
  // 存到 study_sessions 的 notes 字段里，特殊前缀标识
  const today = new Date().toISOString().slice(0, 10);
  const existing = db.prepare('SELECT id FROM study_sessions WHERE user_id = ? AND session_date = ?').get(req.user.id, today);
  const scoreNote = `[章节练习] chapter=${chapter_id}, score=${score}`;
  if (existing) {
    db.prepare('UPDATE study_sessions SET notes = notes || ? WHERE id = ?').run('\n' + scoreNote, existing.id);
  } else {
    db.prepare('INSERT INTO study_sessions (user_id, session_date, notes) VALUES (?, ?, ?)')
      .run(req.user.id, today, scoreNote);
  }
  ok(res, null, '成绩已保存');
});

app.get('/api/practice/score/:chapterId', auth, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const rows = db.prepare(
    "SELECT notes FROM study_sessions WHERE user_id = ? AND session_date = ?"
  ).all(req.user.id, today);
  // 解析本次会话中该章节最高成绩
  let bestScore = 0;
  const targetTag = `chapter=${req.params.chapterId}, score=`;
  rows.forEach(r => {
    const matches = r.notes.match(/chapter=(\d+), score=(\d+)/g) || [];
    matches.forEach(m => {
      const m2 = m.match(/chapter=(\d+), score=(\d+)/);
      if (m2 && m2[1] === req.params.chapterId) {
        const s = parseInt(m2[2]);
        if (s > bestScore) bestScore = s;
      }
    });
  });
  ok(res, { chapter_id: parseInt(req.params.chapterId), score: bestScore });
});

// ============ 错题本 ============
app.get('/api/wrong-notebook', auth, (req, res) => {
  const rows = db.prepare(
    'SELECT id, chapter_id, chapter_name, question, options, user_answer, correct_answer, explanation, consecutive_correct, added_at FROM wrong_notebook WHERE user_id = ? ORDER BY id DESC'
  ).all(req.user.id);
  ok(res, rows.map(r => ({ ...r, options: JSON.parse(r.options) })));
});

app.post('/api/wrong-notebook', auth, (req, res) => {
  const { chapter_id, chapter_name, question, options, user_answer, correct_answer, explanation } = req.body || {};
  if (!question || !options) return res.status(400).json({ code: 400, message: '参数缺失' });
  db.prepare(
    'INSERT INTO wrong_notebook (user_id, chapter_id, chapter_name, question, options, user_answer, correct_answer, explanation, consecutive_correct) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)'
  ).run(req.user.id, chapter_id || 1, chapter_name || '', question, JSON.stringify(options), user_answer, correct_answer, explanation || '');
  ok(res, null, '已加入错题本');
});

app.delete('/api/wrong-notebook/:id', auth, (req, res) => {
  db.prepare('DELETE FROM wrong_notebook WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  ok(res, null, '已移除');
});

// 错题答对后增加连续正确次数，连续3次自动移除
app.post('/api/wrong-notebook/:id/answer', auth, (req, res) => {
  const { is_correct } = req.body || {};
  const id = req.params.id;
  const wrong = db.prepare('SELECT * FROM wrong_notebook WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!wrong) return res.status(404).json({ code: 404, message: '错题不存在' });
  
  if (is_correct) {
    const newCount = (wrong.consecutive_correct || 0) + 1;
    if (newCount >= 3) {
      // 连续3次答对，从错题本中移除
      db.prepare('DELETE FROM wrong_notebook WHERE id = ?').run(id);
      ok(res, { removed: true, consecutive_correct: newCount }, '已连续3次答对，从错题本中移除！');
    } else {
      db.prepare('UPDATE wrong_notebook SET consecutive_correct = ? WHERE id = ?').run(newCount, id);
      ok(res, { removed: false, consecutive_correct: newCount, need_more: 3 - newCount }, `已连续答对${newCount}次，还需${3 - newCount}次即可移除`);
    }
  } else {
    // 答错，重置计数
    db.prepare('UPDATE wrong_notebook SET consecutive_correct = 0 WHERE id = ?').run(id);
    ok(res, { removed: false, consecutive_correct: 0 }, '回答错误，已重置连续正确次数');
  }
});

// ============ 成就 ============
app.get('/api/achievements', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC').all(req.user.id);
  ok(res, rows);
});

app.post('/api/achievements', auth, (req, res) => {
  const { badge_key, badge_name, description, icon } = req.body || {};
  if (!badge_key || !badge_name) return res.status(400).json({ code: 400, message: '参数缺失' });
  db.prepare('INSERT OR IGNORE INTO achievements (user_id, badge_key, badge_name, description, icon) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, badge_key, badge_name, description || '', icon || 'trophy');
  ok(res, null, '成就已解锁');
});

// ============ 学习会话 ============
app.get('/api/sessions', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM study_sessions WHERE user_id = ? ORDER BY session_date DESC LIMIT 60').all(req.user.id);
  ok(res, rows);
});

app.post('/api/sessions/log', auth, (req, res) => {
  const { session_date = new Date().toISOString().slice(0, 10), duration_minutes = 0, topics_completed = 0, questions_answered = 0, correct_count = 0, notes = '' } = req.body || {};
  const existing = db.prepare('SELECT id FROM study_sessions WHERE user_id = ? AND session_date = ?').get(req.user.id, session_date);
  if (existing) {
    db.prepare(
      'UPDATE study_sessions SET duration_minutes = duration_minutes + ?, topics_completed = topics_completed + ?, questions_answered = questions_answered + ?, correct_count = correct_count + ?, notes = ? WHERE id = ?'
    ).run(duration_minutes, topics_completed, questions_answered, correct_count, notes, existing.id);
  } else {
    db.prepare(
      'INSERT INTO study_sessions (user_id, session_date, duration_minutes, topics_completed, questions_answered, correct_count, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, session_date, duration_minutes, topics_completed, questions_answered, correct_count, notes);
  }
  db.prepare('UPDATE users SET study_hours = study_hours + ?, total_points = total_points + ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?').run(
    Math.floor(duration_minutes / 60), questions_answered * 2, req.user.id
  );
  ok(res, null, '学习记录已更新');
});

// ============ 健康检查 ============
app.get('/api/health', (req, res) => ok(res, { status: 'ok', time: new Date().toISOString() }));

app.listen(PORT, '0.0.0.0', () => {
  console.log('后端服务已启动: http://0.0.0.0:' + PORT);
  console.log('演示账号: demo / 123456');
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
