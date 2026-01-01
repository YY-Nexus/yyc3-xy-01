-- YYC³ AI成长守护系统 数据库Schema
-- 此脚本为数据库结构参考，待集成Supabase后执行

-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 儿童档案表
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50),
  birth_date DATE NOT NULL,
  gender VARCHAR(10),
  avatar_url TEXT,
  current_stage VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 成长记录表
CREATE TABLE growth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- milestone, observation, emotion, achievement
  title VARCHAR(200) NOT NULL,
  content TEXT,
  media_urls JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 成长评估表
CREATE TABLE growth_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL,
  dimensions JSONB NOT NULL, -- {cognitive: 85, language: 90, motor: 78, social: 88}
  overall_score INTEGER,
  ai_analysis TEXT,
  recommendations JSONB DEFAULT '[]',
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI对话记录表
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- recorder, guardian, listener, advisor, cultural
  messages JSONB NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 作业任务表
CREATE TABLE homework_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, overdue
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 课程表
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  instructor VARCHAR(100),
  schedule JSONB, -- {day: 'Monday', time: '14:00-15:30'}
  progress INTEGER DEFAULT 0,
  total_sessions INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_growth_records_child_id ON growth_records(child_id);
CREATE INDEX idx_growth_assessments_child_id ON growth_assessments(child_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_homework_tasks_child_id ON homework_tasks(child_id);
CREATE INDEX idx_courses_child_id ON courses(child_id);

-- Row Level Security (RLS) 策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own children" ON children
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view children's records" ON growth_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE children.id = growth_records.child_id AND children.user_id = auth.uid())
  );

CREATE POLICY "Users can view children's assessments" ON growth_assessments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE children.id = growth_assessments.child_id AND children.user_id = auth.uid())
  );

CREATE POLICY "Users can view own conversations" ON ai_conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage children's homework" ON homework_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE children.id = homework_tasks.child_id AND children.user_id = auth.uid())
  );

CREATE POLICY "Users can manage children's courses" ON courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE children.id = courses.child_id AND children.user_id = auth.uid())
  );
