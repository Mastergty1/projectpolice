-- สร้างตาราง Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  years_of_experience INT CHECK (years_of_experience >= 0 AND years_of_experience <= 100),
  area_of_expertise VARCHAR(50),
  reset_password_token VARCHAR(255),
  reset_password_expire TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1. เก็บไฟล์ต้นฉบับ (แก้ไขให้ตรงกับ Backend แล้ว)
CREATE TABLE documents (
  id                  SERIAL PRIMARY KEY,
  filename            VARCHAR(255),
  content             TEXT,          -- เปลี่ยนจาก content_raw เป็น content
  content_hash        VARCHAR(64) UNIQUE,
  keywords_found      JSONB,         -- เพิ่มคอลัมน์นี้เพื่อให้ตรงกับคำสั่ง INSERT
  drive_file_id       VARCHAR(255),  -- เพิ่มคอลัมน์เก็บ ID ไฟล์จาก Google Drive
  drive_web_view_link TEXT,          -- เพิ่มคอลัมน์เก็บ Link สำหรับเปิดดูไฟล์จาก Drive
  status              VARCHAR(20) DEFAULT 'pending',
  created_at          TIMESTAMP DEFAULT NOW()
);

-- 2. ผลการวิเคราะห์แต่ละเอกสาร
CREATE TABLE document_analysis (
  id             SERIAL PRIMARY KEY,
  document_id    INT REFERENCES documents(id) ON DELETE CASCADE, -- เพิ่ม ON DELETE CASCADE ไว้เผื่อลบเอกสารหลัก จะได้ลบอันนี้ด้วย
  has_report     BOOLEAN DEFAULT FALSE,
  keywords_found JSONB,                  
  dates_raw      JSONB,   
  dates_parsed   JSONB,   
  analyzed_at    TIMESTAMP DEFAULT NOW()
);

-- 3. deadlineที่แยกออกมาชัดเจน
CREATE TABLE document_deadlines (
  id           SERIAL PRIMARY KEY,
  document_id  INT REFERENCES documents(id) ON DELETE CASCADE, -- เพิ่ม ON DELETE CASCADE เช่นกัน
  deadline_date DATE,
  date_raw      VARCHAR(100),  
  context       TEXT,          
  confidence    FLOAT,         
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 4. keywords ที่ใช้ตรวจจับ
CREATE TABLE keywords (
  id          SERIAL PRIMARY KEY,
  word        VARCHAR(100) UNIQUE,
  category    VARCHAR(50),   
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);