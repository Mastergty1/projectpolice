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

-- 1. เก็บไฟล์ต้นฉบับ
CREATE TABLE documents (
  id            SERIAL PRIMARY KEY,
  filename      VARCHAR(255),
  content_raw   TEXT,          -- text ดิบจาก OCR ทั้งหมด
  content_hash  VARCHAR(64) UNIQUE,
  status        VARCHAR(20) DEFAULT 'pending', -- pending/processed/error
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 2. ผลการวิเคราะห์แต่ละเอกสาร
CREATE TABLE document_analysis (
  id             SERIAL PRIMARY KEY,
  document_id    INT REFERENCES documents(id),
  has_report     BOOLEAN DEFAULT FALSE,  -- มีคำว่า "ส่งรายงาน" มั้ย
  keywords_found JSONB,                  -- { "ส่งรายงาน": 2 }
  dates_raw      JSONB,   -- เก็บ raw ที่จับได้ก่อน เช่น ["25/12/67", "ภายใน 25 ธ.ค."]
  dates_parsed   JSONB,   -- หลัง parse แล้ว ["2024-12-25"]
  analyzed_at    TIMESTAMP DEFAULT NOW()
);

-- 3. deadlineที่แยกออกมาชัดเจน
CREATE TABLE document_deadlines (
  id           SERIAL PRIMARY KEY,
  document_id  INT REFERENCES documents(id),
  deadline_date DATE,
  date_raw      VARCHAR(100),  -- text ต้นฉบับที่จับได้ เช่น "25 ธันวาคม 2567"
  context       TEXT,          -- ประโยคแวดล้อม เช่น "ให้ส่งรายงานภายใน 25 ธ.ค."
  confidence    FLOAT,         -- ความมั่นใจ 0-1 ว่า parse ถูก
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 4. keywords ที่ใช้ตรวจจับ (ยังไม่แน่นอน เพิ่มได้เรื่อยๆ)
CREATE TABLE keywords (
  id          SERIAL PRIMARY KEY,
  word        VARCHAR(100) UNIQUE,
  category    VARCHAR(50),   -- เช่น "report", "deadline", "urgent"
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);