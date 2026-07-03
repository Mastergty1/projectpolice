const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();

// ตรวจสอบประเภทไฟล์ และแปลงชื่อไฟล์ดั้งเดิม
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // 💡 แปลงชื่อไฟล์ภาษาไทยตรงนี้ แค่ "รอบเดียว" (ป้องกันปัญหาแปลงซ้อนจนอักขระพัง)
    // ชื่อนี้ (file.originalname) จะถูกส่งไปให้ Controller ใช้เซฟลง Database 
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
    const allowed = ['.png', '.jpg', '.jpeg', '.pdf', '.tiff'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์ .png, .jpg, .jpeg, .pdf, .tiff เท่านั้น'), false);
    }
  }
});

module.exports = { upload };