-- สร้างตาราง Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  reset_password_token VARCHAR(255),
  reset_password_expire TIMESTAMP,
  color VARCHAR(7) DEFAULT '#3B82F6'
);

-- 1. เก็บไฟล์ต้นฉบับ
CREATE TABLE documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename            VARCHAR(255),
  content             TEXT,
  content_hash        VARCHAR(64) UNIQUE,
  keywords_found      JSONB,
  drive_file_id       VARCHAR(255),
  drive_web_view_link TEXT,
  status              VARCHAR(20) DEFAULT 'pending',
  created_at          TIMESTAMP DEFAULT NOW(),
  created_by          UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 2. ผลการวิเคราะห์แต่ละเอกสาร
CREATE TABLE document_analysis (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id    UUID REFERENCES documents(id) ON DELETE CASCADE,
  has_report     BOOLEAN DEFAULT FALSE,
  keywords_found JSONB,                  
  dates_raw      JSONB,   
  dates_parsed   JSONB,   
  analyzed_at    TIMESTAMP DEFAULT NOW()
);

-- 3. deadlineที่แยกออกมาชัดเจน
CREATE TABLE document_deadlines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID REFERENCES documents(id) ON DELETE CASCADE,
  deadline_date DATE,
  date_raw      VARCHAR(100),  
  context       TEXT,          
  confidence    FLOAT,         
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 4. keywords ที่ใช้ตรวจจับ
CREATE TABLE keywords (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word        VARCHAR(100) UNIQUE,
  category    VARCHAR(50),   
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 5. ตารางเก็บงานติดตาม (Tasks) -- [ส่วนที่เพิ่มใหม่]
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  title VARCHAR(255),       -- ชื่อเรื่อง
  memo_no VARCHAR(100),     -- เลขที่เอกสาร
  memo_date VARCHAR(100),   -- วันที่บนเอกสาร
  main_text TEXT,           -- เนื้อหารวมของงาน
  status VARCHAR(50) DEFAULT 'following',
  notes TEXT, 
  is_urgent BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 2. ตาราง "ผู้รับผิดชอบ" (เชื่อมกับ Users)
CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- เชื่อมโยงดึงข้อมูลมาจากตารางผู้ใช้งาน
  role_or_name VARCHAR(100), -- เก็บชื่อดิบที่แสกนได้ (เผื่อกรณีระบบหาตัว User ในตารางไม่เจอ)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. ตาราง "รายละเอียดย่อย" (งานที่ผู้รับผิดชอบต้องทำ)
CREATE TABLE task_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES task_assignments(id) ON DELETE CASCADE,
  detail TEXT NOT NULL,     -- ข้อความงานย่อย
  status VARCHAR(50) DEFAULT 'pending',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ลอง Insert ข้อมูลจำลองลงไปใน Database (เพื่อทดสอบ API) 
-- (แก้ไขโครงสร้างคอลัมน์จำลองให้ตรงกับ Table เพื่อไม่ให้เกิด Error)
INSERT INTO tasks (title, main_text, due_date, status, is_urgent) 
VALUES 
('ชื่องานติดตาม 1', 'ข้อความชั่วคราว 1', '2026-05-22', 'following', false),
('งานใหม่ที่ต้องแก้', 'ข้อความชั่วคราว 2', '2026-05-25', 'problem', false),
('งานด่วนมาก', 'ข้อความชั่วคราว 3', '2026-05-21', 'following', true);