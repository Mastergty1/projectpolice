const supabase = require('../config/supabaseClient');
const fs = require('fs');

const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'DOCUMENT';

/**
 * อัพโหลดไฟล์ขึ้น Supabase Storage ใน Bucket ที่กำหนด
 * และจำกัดสิทธิ์ความปลอดภัยไว้
 * @param {Object} fileObject - ออบเจกต์ไฟล์ที่ได้รับมาจาก Multer (req.file)
 */
const uploadToDrive = async (fileObject) => {
  try {
    const fileContent = fileObject.buffer;
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกันเพื่อป้องกันการเขียนทับ
    const uniqueFilename = `${Date.now()}_${fileObject.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `uploads/${uniqueFilename}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileContent, {
        contentType: fileObject.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // เราจะเก็บ path (data.path) ไว้ใน DB แทน webViewLink แบบ public
    // เพื่อนำไป Gen Signed URL ในภายหลัง (เพื่อความปลอดภัย)
    return {
      id: data.path, // ใช้ path เป็น id
      webViewLink: null // จะสร้าง Signed URL ตอนดึงข้อมูลเท่านั้น
    };
  } catch (error) {
    console.error('[Supabase Storage Error]:', error.message);
    throw error;
  }
};

/**
 * สร้าง Signed URL สำหรับการเข้าถึงไฟล์ชั่วคราว (เช่น 1 ชั่วโมง)
 * @param {String} filePath - Path ของไฟล์ใน Supabase Storage
 * @param {Number} expiresIn - เวลาหมดอายุของลิงก์ (วินาที)
 */
const getSignedUrl = async (filePath, expiresIn = 3600) => {
  if (!filePath) return null;
  
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('[Supabase Signed URL Error]:', error.message);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('[Supabase Signed URL Error]:', error.message);
    return null;
  }
};

/**
 * ดาวน์โหลดไฟล์จาก Supabase Storage (ส่งกลับเป็น Buffer)
 * @param {String} filePath - Path ของไฟล์
 */
const downloadFile = async (filePath) => {
  if (!filePath) return null;
  
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      console.error('[Supabase Download Error]:', error.message);
      return null;
    }

    // แปลง Blob/File data ที่ได้กลับมาเป็น Buffer ของ Node.js
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('[Supabase Download Error]:', error.message);
    return null;
  }
};

module.exports = { uploadToDrive, getSignedUrl, downloadFile };
