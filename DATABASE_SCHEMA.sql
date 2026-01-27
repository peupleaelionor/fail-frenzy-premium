-- ============================================================================
-- FAIL FRENZY: THE LOOP - DATABASE SCHEMA
-- PostgreSQL/MySQL Compatible
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    platform ENUM('iOS', 'Android', 'Web') NOT NULL,
    os_version VARCHAR(50),
    device_model VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    last_activity_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason VARCHAR(500),
    INDEX idx_email (email),
    INDEX idx_device_id (device_id),
    INDEX idx_created_at (created_at)
);

-- ============================================================================
-- 2. PLAYER PROFILES TABLE
-- ============================================================================

CREATE TABLE player_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    display_name VARCHAR(255),
    avatar_url VARCHAR(500),
    bio VARCHAR(500),
    current_fail_streak INT DEFAULT 0,
    max_fail_streak INT DEFAULT 0,
    total_loops INT DEFAULT 0,
    total_score BIGINT DEFAULT 0,
    total_playtime_seconds BIGINT DEFAULT 0,
    total_sessions INT DEFAULT 0,
    average_session_length_seconds FLOAT DEFAULT 0,
    level INT DEFAULT 1,
    experience_points INT DEFAULT 0,
    country VARCHAR(2),
    language VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_max_fail_streak (max_fail_streak),
    INDEX idx_total_score (total_score),
    INDEX idx_level (level)
);

-- ============================================================================
-- 3. GAME SESSIONS TABLE
-- ============================================================================

CREATE TABLE game_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    duration_seconds INT,
    loops_played INT DEFAULT 0,
    final_fail_streak INT DEFAULT 0,
    final_score INT DEFAULT 0,
    average_difficulty FLOAT DEFAULT 0.5,
    was_completed BOOLEAN DEFAULT FALSE,
    crash_occurred BOOLEAN DEFAULT FALSE,
    crash_log TEXT,
    device_memory_mb INT,
    device_battery_percent INT,
    network_type VARCHAR(20),
    session_quality_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_start (session_start),
    INDEX idx_final_score (final_score)
);

-- ============================================================================
-- 4. COSMETICS TABLE
-- ============================================================================

CREATE TABLE cosmetics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cosmetic_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('effect', 'character_skin', 'badge', 'ui_theme', 'bundle') NOT NULL,
    description TEXT,
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL,
    unlock_threshold INT DEFAULT 0,
    base_price_usd DECIMAL(10, 2) DEFAULT 0,
    premium_price_usd DECIMAL(10, 2),
    icon_url VARCHAR(500),
    preview_url VARCHAR(500),
    color_hex VARCHAR(7),
    animation_speed FLOAT DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rarity (rarity),
    INDEX idx_type (type)
);

-- ============================================================================
-- 5. USER COSMETICS TABLE
-- ============================================================================

CREATE TABLE user_cosmetics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    cosmetic_id BIGINT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_equipped BOOLEAN DEFAULT FALSE,
    purchase_price_usd DECIMAL(10, 2),
    was_purchased BOOLEAN DEFAULT FALSE,
    was_earned BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cosmetic_id) REFERENCES cosmetics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_cosmetic (user_id, cosmetic_id),
    INDEX idx_user_id (user_id),
    INDEX idx_unlocked_at (unlocked_at)
);

-- ============================================================================
-- 6. LEADERBOARD TABLE
-- ============================================================================

CREATE TABLE leaderboard (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    rank INT,
    fail_streak INT NOT NULL,
    total_score BIGINT NOT NULL,
    total_loops INT NOT NULL,
    average_difficulty FLOAT,
    playtime_hours FLOAT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT TRUE,
    region VARCHAR(50),
    platform VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_rank (rank),
    INDEX idx_fail_streak (fail_streak),
    INDEX idx_region (region)
);

-- ============================================================================
-- 7. ACHIEVEMENTS TABLE
-- ============================================================================

CREATE TABLE achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    achievement_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    points INT DEFAULT 0,
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL,
    unlock_condition VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. USER ACHIEVEMENTS TABLE
-- ============================================================================

CREATE TABLE user_achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id)
);

-- ============================================================================
-- 9. ANALYTICS EVENTS TABLE
-- ============================================================================

CREATE TABLE analytics_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    event_name VARCHAR(255) NOT NULL,
    event_category VARCHAR(100),
    event_value INT,
    event_label VARCHAR(255),
    session_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_id VARCHAR(255),
    platform VARCHAR(20),
    os_version VARCHAR(50),
    app_version VARCHAR(20),
    custom_params JSON,
    INDEX idx_user_id (user_id),
    INDEX idx_event_name (event_name),
    INDEX idx_timestamp (timestamp),
    INDEX idx_session_id (session_id)
);

-- ============================================================================
-- 10. CRASH REPORTS TABLE
-- ============================================================================

CREATE TABLE crash_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    device_id VARCHAR(255),
    error_type VARCHAR(255),
    error_message TEXT,
    stack_trace TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    platform VARCHAR(20),
    os_version VARCHAR(50),
    app_version VARCHAR(20),
    memory_usage_mb INT,
    device_battery_percent INT,
    network_type VARCHAR(20),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_error_type (error_type)
);

-- ============================================================================
-- 11. TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    transaction_type ENUM('purchase', 'refund', 'reward', 'adjustment') NOT NULL,
    amount_usd DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    cosmetic_id BIGINT,
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    provider_transaction_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cosmetic_id) REFERENCES cosmetics(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- ============================================================================
-- 12. CLOUD SAVES TABLE
-- ============================================================================

CREATE TABLE cloud_saves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    save_data JSON NOT NULL,
    version INT DEFAULT 1,
    device_id VARCHAR(255),
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ============================================================================
-- 13. FRIEND RELATIONSHIPS TABLE
-- ============================================================================

CREATE TABLE friend_relationships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_id, friend_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- ============================================================================
-- 14. CHALLENGES TABLE
-- ============================================================================

CREATE TABLE challenges (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    challenger_id BIGINT NOT NULL,
    challenged_id BIGINT NOT NULL,
    challenge_type VARCHAR(50),
    target_fail_streak INT,
    target_score INT,
    duration_hours INT DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    completed_at TIMESTAMP,
    winner_id BIGINT,
    FOREIGN KEY (challenger_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenged_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_challenger_id (challenger_id),
    INDEX idx_expires_at (expires_at)
);

-- ============================================================================
-- 15. NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(100),
    title VARCHAR(255),
    message TEXT,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_player_profiles_updated_at ON player_profiles(updated_at);
CREATE INDEX idx_game_sessions_user_date ON game_sessions(user_id, session_start);
CREATE INDEX idx_leaderboard_region_rank ON leaderboard(region, rank);
CREATE INDEX idx_transactions_date ON transactions(created_at);
CREATE INDEX idx_analytics_events_date ON analytics_events(timestamp);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

CREATE VIEW top_players AS
SELECT 
    p.user_id,
    u.username,
    p.display_name,
    p.max_fail_streak,
    p.total_score,
    p.level,
    l.rank
FROM player_profiles p
JOIN users u ON p.user_id = u.id
JOIN leaderboard l ON p.user_id = l.user_id
ORDER BY l.rank ASC
LIMIT 100;

CREATE VIEW player_statistics AS
SELECT 
    p.user_id,
    u.username,
    COUNT(DISTINCT gs.id) as total_sessions,
    SUM(gs.duration_seconds) / 3600 as total_playtime_hours,
    AVG(gs.final_score) as average_score,
    MAX(gs.final_fail_streak) as max_streak,
    AVG(gs.average_difficulty) as average_difficulty
FROM player_profiles p
JOIN users u ON p.user_id = u.id
LEFT JOIN game_sessions gs ON p.user_id = gs.user_id
GROUP BY p.user_id;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
