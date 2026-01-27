-- Fail Frenzy Engine - D1 Database Schema
-- Production-ready schema for leaderboards, progression, and analytics

-- Users table for player profiles
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  total_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_fails INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT -- JSON field for extra data
);

-- Game sessions for analytics
CREATE TABLE IF NOT EXISTS game_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  game_mode TEXT NOT NULL,
  score INTEGER NOT NULL,
  fail_count INTEGER NOT NULL,
  max_streak INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  seed TEXT, -- For replayable runs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON field for detailed stats
  FOREIGN KEY (player_id) REFERENCES users(player_id)
);

-- Leaderboards - global rankings
CREATE TABLE IF NOT EXISTS leaderboards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  game_mode TEXT NOT NULL,
  score INTEGER NOT NULL,
  fail_count INTEGER NOT NULL,
  max_streak INTEGER NOT NULL,
  rank INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES users(player_id),
  UNIQUE(player_id, game_mode)
);

-- Achievements for gamification
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  achievement_key TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON for achievement details
  FOREIGN KEY (player_id) REFERENCES users(player_id),
  UNIQUE(player_id, achievement_key)
);

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  challenge_date DATE UNIQUE NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player challenge progress
CREATE TABLE IF NOT EXISTS player_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  challenge_id INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME,
  FOREIGN KEY (player_id) REFERENCES users(player_id),
  FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id),
  UNIQUE(player_id, challenge_id)
);

-- Cosmetics inventory
CREATE TABLE IF NOT EXISTS cosmetics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  cosmetic_id TEXT NOT NULL,
  cosmetic_type TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  equipped BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (player_id) REFERENCES users(player_id),
  UNIQUE(player_id, cosmetic_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_player_id ON users(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_game_mode ON leaderboards(game_mode, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_player_id ON leaderboards(player_id);
CREATE INDEX IF NOT EXISTS idx_achievements_player_id ON achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_player_challenges_player_id ON player_challenges(player_id);
CREATE INDEX IF NOT EXISTS idx_cosmetics_player_id ON cosmetics(player_id);
