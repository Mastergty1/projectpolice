const fs = require('fs').promises; 
const path = require('path'); // เพิ่ม module path
const { extractDataWithGemini } = require('../services/ocrService'); 

// หมายเหตุ: ไม่ต้องใช้ pool (Database) และ uploadToDrive ที่นี่แล้ว 
// เพราะย้ายไปบันทึกตอนผู้ใช้กดยืนยันใน taskController (confirmTasks) แทน

exports.processDocuments = async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded.' });
  const results = [];
  
  // ดึง ID และ ชื่อ จาก req.user ที่ได้จาก protect middleware
  const userId = req.user ? req.user.id : null;
  const userName = req.user ? req.user.name : "Unknown"; 

  for (const file of files) {
    let safePath;
    try {
      // 🔒 ป้องกัน Path Traversal: สร้าง absolute path ที่ปลอดภัย
      safePath = path.resolve(file.path);

      // 1. ให้ AI สกัดข้อมูลและอ่านข้อความออกมาอย่างเดียว
      const geminiResult = await extractDataWithGemini(safePath, file.mimetype);
      const { text, extractedData } = geminiResult;

      // 2. ตั้งค่า default ชื่อคนรับผิดชอบให้เป็นชื่อคนอัพโหลด
      let dataWithDefaultUser = extractedData || {};
      dataWithDefaultUser.assignee = userName; 

      // 3. เตรียมข้อมูลส่งกลับให้ Frontend 
      results.push({
        filename: file.originalname,
        status: 'success',
        extractedData: dataWithDefaultUser,
        fileInfo: {
            path: safePath, // ส่ง safePath กลับไปใช้
            originalname: file.originalname,
            mimetype: file.mimetype,
            text: text
        }
      });

    } catch (err) {
      // หากเกิด Error ในขั้นตอนการสกัดข้อมูลให้ลบไฟล์ทิ้งอย่างปลอดภัย
      try { 
        if (safePath) await fs.unlink(safePath); 
        else await fs.unlink(path.resolve(file.path)); 
      } catch (e) {}
      results.push({ filename: file.originalname, status: 'error', error: err.message });
    }
  }
  
  res.json({ total: files.length, results });
};