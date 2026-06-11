import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'app.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ========== 表结构 ==========
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  nickname TEXT,
  study_hours INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
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
  added_at TEXT DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learning_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  chapter_id INTEGER NOT NULL,
  topic_id INTEGER NOT NULL,
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
`);

// ========== 插入演示用户（可选） ==========
const demoUser = db.prepare('SELECT id FROM users WHERE username = ?').get('demo');
if (!demoUser) {
  const hash = bcrypt.hashSync('123456', 10);
  const info = db
    .prepare(
      'INSERT INTO users (username, email, password_hash, nickname, study_hours, streak_days, total_points, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run('demo', 'demo@example.com', hash, '演示用户', 12, 3, 1280, 2);
  console.log('已创建演示用户：demo / 123456（id=' + info.lastInsertRowid + '）');
}

console.log('数据库初始化完成：' + dbPath);
db.close();
