-- YYC³ AI小语项目数据库初始化脚本
-- 创建时间: 2025-12-14
-- 描述: 创建所有必要的数据库表和初始数据

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'admin', 'moderator')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建儿童信息表
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    birth_date DATE NOT NULL,
    avatar_url TEXT,
    current_stage VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建成长记录表
CREATE TABLE IF NOT EXISTS growth_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL CHECK (category IN ('milestone', 'daily', 'achievement', 'health', 'education', 'social')),
    media_urls TEXT[], -- 存储媒体文件URL数组
    tags TEXT[], -- 存储标签数组
    location VARCHAR(255),
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建AI对话表
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    ai_role VARCHAR(20) NOT NULL CHECK (ai_role IN ('recorder', 'guardian', 'listener', 'advisor', 'cultural_mentor')),
    emotion VARCHAR(50),
    context JSONB, -- 存储对话上下文
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建AI角色表
CREATE TABLE IF NOT EXISTS ai_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    personality TEXT NOT NULL,
    capabilities TEXT[], -- 存储能力列表
    prompt_template TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('milestone', 'reminder', 'system', 'ai_insight', 'weekly_report')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- 存储额外的通知数据
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- 创建推荐表
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('activity', 'content', 'milestone', 'skill')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content_url TEXT,
    age_range JSONB NOT NULL, -- {min: number, max: number}
    categories TEXT[],
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建文件上传记录表
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    upload_type VARCHAR(50) NOT NULL, -- 'avatar', 'growth_media', etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建用户会话表（用于JWT令牌管理）
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL, -- 存储令牌哈希
    device_info JSONB, -- 存储设备信息
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 儿童表索引
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_children_is_active ON children(is_active);
CREATE INDEX IF NOT EXISTS idx_children_birth_date ON children(birth_date);

-- 成长记录表索引
CREATE INDEX IF NOT EXISTS idx_growth_records_child_id ON growth_records(child_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_category ON growth_records(category);
CREATE INDEX IF NOT EXISTS idx_growth_records_created_at ON growth_records(created_at);
CREATE INDEX IF NOT EXISTS idx_growth_records_is_public ON growth_records(is_public);

-- AI对话表索引
CREATE INDEX IF NOT EXISTS idx_ai_conversations_child_id ON ai_conversations(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_ai_role ON ai_conversations(ai_role);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);

-- 通知表索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 推荐表索引
CREATE INDEX IF NOT EXISTS idx_recommendations_child_id ON recommendations(child_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(type);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON recommendations(created_at);

-- 会话表索引
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 审计日志表索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 文件上传表索引
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_upload_type ON file_uploads(upload_type);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at);

-- 创建触发器函数：自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建updated_at触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_growth_records_updated_at BEFORE UPDATE ON growth_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_roles_updated_at BEFORE UPDATE ON ai_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入初始数据
-- 插入AI角色数据
INSERT INTO ai_roles (id, name, description, personality, capabilities, prompt_template, is_active) VALUES
('00000000-0000-0000-0000-000000000001', '记录者', '记录孩子的成长瞬间，用温暖的方式保存美好回忆', '温柔、细心、充满爱心，专注于记录和保存孩子的成长故事', ['对话', '记录管理', '时间轴创建', '照片管理'], '你是记录者小语，负责记录孩子的成长瞬间。请用温柔、亲切的语气与孩子和家长交流，帮助他们保存珍贵的回忆。', true),
('00000000-0000-0000-0000-000000000002', '守护者', '保护孩子的安全，提供安全的成长环境', '保护欲强、警觉、专业，始终把孩子的安全放在第一位', ['安全监控', '风险评估', '紧急响应', '隐私保护'], '你是守护者小语，负责保护孩子的安全。请时刻保持警惕，识别潜在风险，为孩子创造安全的成长环境。', true),
('00000000-0000-0000-0000-000000000003', '聆听者', '倾听孩子的心声，理解情感需求', '耐心、同理心强、善解人意，是孩子最忠实的倾听者', ['情感识别', '心理疏导', '情绪支持', '对话交流'], '你是聆听者小语，专门倾听孩子的心声。请用耐心和同理心与孩子交流，理解他们的情感需求，提供温暖的陪伴。', true),
('00000000-0000-0000-0000-000000000004', '建议者', '根据孩子的发展阶段提供专业建议', '专业、博学、理性，基于儿童发展心理学提供指导', ['发展建议', '学习指导', '育儿建议', '能力评估'], '你是建议者小语，负责提供专业的成长建议。请基于儿童发展心理学，为孩子和家长提供科学、实用的指导建议。', true),
('00000000-0000-0000-0000-000000000005', '国粹导师', '传承中华优秀传统文化，培养文化自信', '博学、传统、有深度，深谙中华优秀传统文化', ['传统文化', '国学启蒙', '诗词歌赋', '品德教育'], '你是国粹导师小语，负责传承中华优秀传统文化。请用通俗易懂的方式，向孩子介绍国学知识，培养文化自信。', true)
ON CONFLICT DO NOTHING;

-- 插入系统配置
INSERT INTO system_configs (key, value, description) VALUES
('site_name', '"YYC³ AI小语"', '网站名称'),
('site_description', '"AI驱动的儿童成长守护平台"', '网站描述'),
('contact_email', '"contact@yyc3-ai.com"', '联系邮箱'),
('max_file_size', '10485760', '最大文件上传大小（字节）'),
('allowed_file_types', '["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm"]', '允许的文件类型'),
('ai_settings', '{"openaiApiKey": "", "defaultModel": "gpt-3.5-turbo", "maxTokens": 1000, "temperature": 0.7}', 'AI相关设置'),
('security_settings', '{"jwtSecret": "", "jwtExpiresIn": "7d", "bcryptRounds": 12, "rateLimitWindowMs": 900000, "rateLimitMaxRequests": 100}', '安全相关设置')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- 创建视图：用户统计信息
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.created_at,
    u.last_login_at,
    COALESCE(child_count.child_count, 0) as children_count,
    COALESCE(record_count.record_count, 0) as growth_records_count,
    COALESCE(conversation_count.conversation_count, 0) as ai_conversations_count,
    COALESCE(notification_count.notification_count, 0) as unread_notifications_count
FROM users u
LEFT JOIN (
    SELECT user_id, COUNT(*) as child_count
    FROM children
    WHERE is_active = true
    GROUP BY user_id
) child_count ON u.id = child_count.user_id
LEFT JOIN (
    SELECT child_id, COUNT(*) as record_count
    FROM growth_records
    GROUP BY child_id
) record_counts ON child_counts.child_id = record_counts.child_id
LEFT JOIN children c ON c.user_id = u.id AND c.id = record_counts.child_id
LEFT JOIN (
    SELECT child_id, COUNT(*) as conversation_count
    FROM ai_conversations
    GROUP BY child_id
) conversation_counts ON c.id = conversation_counts.child_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as notification_count
    FROM notifications
    WHERE is_read = false
    GROUP BY user_id
) notification_count ON u.id = notification_count.user_id;

-- 创建视图：儿童统计信息
CREATE OR REPLACE VIEW child_stats AS
SELECT
    c.id,
    c.user_id,
    c.name,
    c.nickname,
    c.gender,
    c.birth_date,
    c.current_stage,
    c.created_at,
    AGE(CURRENT_DATE, c.birth_date) as age_in_days,
    FLOOR(AGE(CURRENT_DATE, c.birth_date) / 365.25) as age_in_years,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.birth_date)) as age_years,
    EXTRACT(MONTH FROM AGE(CURRENT_DATE, c.birth_date)) as age_months,
    COALESCE(record_count.record_count, 0) as total_records,
    COALESCE(milestone_count.milestone_count, 0) as milestone_records,
    COALESCE(conversation_count.conversation_count, 0) as total_conversations,
    COALESCE(latest_conversation.latest_at, c.created_at) as last_activity
FROM children c
LEFT JOIN (
    SELECT child_id, COUNT(*) as record_count
    FROM growth_records
    GROUP BY child_id
) record_count ON c.id = record_count.child_id
LEFT JOIN (
    SELECT child_id, COUNT(*) as milestone_count
    FROM growth_records
    WHERE category = 'milestone'
    GROUP BY child_id
) milestone_count ON c.id = milestone_count.child_id
LEFT JOIN (
    SELECT child_id, COUNT(*) as conversation_count
    FROM ai_conversations
    GROUP BY child_id
) conversation_count ON c.id = conversation_count.child_id
LEFT JOIN (
    SELECT child_id, MAX(created_at) as latest_at
    FROM ai_conversations
    GROUP BY child_id
) latest_conversation ON c.id = latest_conversation.child_id
WHERE c.is_active = true;

-- 创建视图：每日统计
CREATE OR REPLACE VIEW daily_stats AS
SELECT
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(DISTINCT child_id) as active_children,
    COUNT(*) as total_ai_conversations,
    COUNT(DISTINCT session_id) as active_sessions,
    COUNT(*) FILTER (WHERE category = 'milestone') as milestones_recorded,
    COUNT(*) FILTER (WHERE category = 'daily') as daily_records
FROM ai_conversations
GROUP BY DATE(created_at)
ORDER BY date DESC;