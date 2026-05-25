const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// ดึง API Key จาก .env
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Warning: GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// ฟังก์ชันแปลงไฟล์เป็นรูปแบบที่ Gemini รองรับ (Inline Data)
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

// ฟังก์ชันหลักที่ใช้ประมวลผลด้วย Gemini
exports.extractDataWithGemini = async (filePath, mimeType) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" }); 

    const prompt = `
    คุณเป็นผู้ช่วยผู้เชี่ยวชาญในการอ่านและสกัดข้อมูลจากเอกสารราชการไทย (Thai Official Documents) โดยเฉพาะบันทึกข้อความ (Memo)
    กรุณาอ่านเอกสารที่แนบมานี้อย่างละเอียด (รองรับทั้งตัวพิมพ์และลายมือภาษาไทย)

    ให้สกัดข้อมูลออกมาเป็นรูปแบบ JSON (Valid JSON) อย่างเคร่งครัดตามโครงสร้างดังต่อไปนี้:
    {
      "full_text": "ข้อความดั้งเดิมทั้งหมดที่อ่านได้จากเอกสาร (นำมาต่อกันให้อ่านรู้เรื่อง)",
      "memo_header": {
        "ที่": "ระบุที่ของเอกสาร (ถ้าไม่มีให้ใส่ null)",
        "วันที่": "ระบุวันที่ (ถ้าไม่มีให้ใส่ null)",
        "เวลา": "ระบุเวลา (ถ้าไม่มีให้ใส่ null)",
        "เรื่อง": "ระบุเรื่อง (ถ้าไม่มีให้ใส่ null)",
        "เรียน": "ระบุผู้ที่เอกสารส่งถึง (ถ้าไม่มีให้ใส่ null)"
      },
      "extracted_content": {
        "main_text": "ข้อความอธิบายโดยรวมทั้งหมดที่อยู่หลังคำว่า 'เรียน' (แต่ไม่ใช่ส่วนการมอบหมายงาน)",
        "assignments": [
          {
            "responsible_person": "ระบุตัวย่อหรือชื่อยศของผู้รับผิดชอบ เช่น ฝอ.๑, สว.ฝอ.๔, ผกก.",
            "topics": [
              "หัวข้อหรือรายละเอียดที่ต้องรับผิดชอบ 1 (สังเกตจากเครื่องหมาย - หรือหัวข้อย่อย)",
              "หัวข้อที่ 2..."
            ]
          }
        ]
      }
    }

    **กฎเกณฑ์สำคัญในการสกัดข้อมูล:**
    1. **header**: สกัดข้อมูล บันทึกข้อความ พื้นฐาน (ส่วนราชการ, ที่, วันที่, เรื่อง, เรียน)
    2. **extracted_content**: ทุกอย่างที่อยู่ **หลังเส้น "เรียน"** จะต้องอยู่ในหมวดนี้
    3. **หลักการมอบหมายงาน (Assignments)**:
        * สังเกตโครงสร้างรายการหลังจาก "เรียน"
        * **"คนที่รับผิดชอบ" (responsible_person)** คือตัวย่อของตำแหน่งหรือยศที่ปรากฏชัดเจน (เช่น 'ฝอ.๑', 'ผกก.ฝอ.๑')
        * **"หัวข้อที่ต้องรับผิดชอบ" (topics)** คือรายการเนื้อหาที่ตามหลังตัวย่อเหล่านั้น มักจะเริ่มต้นด้วยเครื่องหมายยัติภังค์ '-' หรือเครื่องหมายหัวข้ออื่นๆ

    ข้อควรระวัง: 
    1. คืนค่าผลลัพธ์เป็น JSON เท่านั้น ห้ามมีคำอธิบายเพิ่มเติม ห้ามใช้ Markdown block (เช่น \`\`\`json)
    2. หากในเอกสารไม่มีข้อมูลส่วนไหน ให้ใส่ null ในฟิลด์นั้น
    3. หากพบเนื้อหาหลัง "เรียน" แต่ไม่มีการมอบหมายงานชัดเจน ให้ใส่ค่าใน 'extracted_content.main_text' และปล่อย 'assignments' เป็น Array ว่าง
    `;

    const filePart = fileToGenerativePart(filePath, mimeType);

    console.log("กำลังส่งไฟล์ให้ Gemini ประมวลผลและสกัดข้อมูลความรับผิดชอบ...");
    const result = await model.generateContent([prompt, filePart]);
    const responseText = result.response.text();

    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanJsonString);

    return {
      text: parsedData.full_text || "",
      extractedData: {
        ...parsedData.memo_header,
        ...parsedData.extracted_content,
      }
    };

  } catch (error) {
    console.error("Gemini OCR Error:", error.message);
    throw new Error(`Gemini Processing Failed: ${error.message}`);
  }
};