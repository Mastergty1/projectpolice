const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const os = require('os');
const { createCanvas } = require('@napi-rs/canvas');

const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'canvas') {
    // เมื่อ pdfjs-dist พยายามเรียก 'canvas' เราจะโยน '@napi-rs/canvas' ให้แทน
    return require('@napi-rs/canvas');
  }
  return originalRequire.apply(this, arguments);
};

// ใช้ legacy build เพื่อให้รันบน Node.js ได้อย่างเสถียรที่สุด (ไม่มีปัญหาเรื่องขาด DOM)
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

/**
 * สร้าง NodeCanvasFactory เพื่อให้ pdf.js ใช้สร้าง Canvas ภายในเมื่อจำเป็น
 * (เช่น การเรนเดอร์ภาพที่มี mask, pattern หรือองค์ประกอบซับซ้อน)
 */
class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

/**
 * แปลง PDF เป็นภาพโดยใช้ pdfjs-dist และ @napi-rs/canvas
 */
async function pdfToImages(filePath) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-'));
  const data = new Uint8Array(fs.readFileSync(filePath));

  // โหลดไฟล์ PDF
  const loadingTask = pdfjsLib.getDocument({
    data,
    // ระบุพาธสำหรับฟอนต์ภาษาต่างๆ เพื่อป้องกันปัญหาตัวอักษรกลายเป็นกล่องสี่เหลี่ยม
    cMapUrl: 'node_modules/pdfjs-dist/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/',
  });

  const pdfDocument = await loadingTask.promise;
  const pngFiles = [];
  const canvasFactory = new NodeCanvasFactory();

  // ปรับการเรนเดอร์ทุกหน้าใน PDF (ในโค้ดเดิมคุณอาจจะจำกัดแค่หน้าแรก)
  const numPages = pdfDocument.numPages;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    // Scale 2.0 จะให้ความละเอียดเทียบเท่ากับประมาณ 150-200 DPI ซึ่งเหมาะสมสำหรับงาน OCR
    const viewport = page.getViewport({ scale: 2.0 });

    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport: viewport,
      canvasFactory: canvasFactory,
    };

    // รอให้วาด PDF ลง Canvas เสร็จ
    await page.render(renderContext).promise;

    const imgPath = path.join(tmpDir, `page-${i.toString().padStart(2, '0')}.png`);
    // แปลง Canvas เป็น Buffer รูปภาพ PNG แล้วบันทึก
    const buffer = canvasAndContext.canvas.toBuffer('image/png');
    fs.writeFileSync(imgPath, buffer);
    pngFiles.push(imgPath);

    // คืนหน่วยความจำ
    canvasFactory.destroy(canvasAndContext);
  }

  return { images: pngFiles, tmpDir };
}

exports.extractText = async (filePath) => {
  let tmpDir = null;

  try {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.pdf') {
      let extractedText = "";
      let needsOCR = false;

      // 1. ลองอ่านข้อความตรงๆ ก่อน
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const parseFunction = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;

        if (parseFunction) {
          const data = await parseFunction(dataBuffer);
          extractedText = data.text ? data.text.trim() : "";
        }

        if (extractedText.length < 50) {
          needsOCR = true;
        }
      } catch (parseError) {
        console.log("Direct PDF read failed, switching to OCR... (" + parseError.message + ")");
        needsOCR = true;
      }

      // 2. โหมด OCR
      if (needsOCR) {
        console.log("Converting PDF to image via pdfjs-dist & @napi-rs/canvas...");

        const { images, tmpDir: td } = await pdfToImages(filePath);
        tmpDir = td;

        extractedText = "";
        for (let i = 0; i < images.length; i++) {
          console.log(`OCR Processing page ${i + 1} of ${images.length}...`);
          const { data: { text } } = await Tesseract.recognize(images[i], 'tha+eng', {
            logger: m => {
              if (m.status === 'recognizing text') {
                process.stdout.write(`\r  OCR Progress: ${Math.round(m.progress * 100)}%`);
              }
            }
          });
          console.log('');
          extractedText += text + "\n";
        }
      }

      return extractedText.trim();

    } else {
      // รูปภาพทั่วไป
      console.log("Detected image file. Starting OCR...");
      const { data: { text } } = await Tesseract.recognize(filePath, 'tha+eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`\r  OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      console.log('');
      return text.trim();
    }

  } catch (error) {
    console.error("Error extracting text:", error.message);
    throw new Error(error.message);
  } finally {
    // ลบ temp files อัตโนมัติหลังทำงานเสร็จหรือเกิด error
    if (tmpDir && fs.existsSync(tmpDir)) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  }
};
exports.findKeywords = (text, keywords) => {
  const found = {};
  
  // 1. ทำความสะอาด Text ให้เป็นมาตรฐานก่อน: 
  // ลบช่องว่างส่วนเกิน, ตัดบรรทัด, และแปลงทุกอย่างเป็นตัวพิมพ์เล็ก (ถ้ามีภาษาอังกฤษ)
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  for (const kw of keywords) {
    const trimmedKw = kw.trim();
    if (!trimmedKw) continue;

    // 2. สร้าง Regex แบบ "ใจกว้าง" (Loose matching)
    // แทนที่จะหา "ประกันสังคมสะสม" ตรงๆ เราจะแทรก [\\s\\-]* ไว้ระหว่างทุกตัวอักษร
    // และใส่ (?=...) เพื่อให้มันไม่เกี่ยงว่าจะมีช่องว่างกี่ช่อง
    const fuzzyKw = trimmedKw.split('').map(char => escapeRegex(char) + '[\\s\\-]*').join('');
    const kwRegex = new RegExp(fuzzyKw + '[\\s\\t]*[:\\-]?[\\s\\t]*', 'gi');
    
    let extractedData = [];
    let match;
    
    // 3. วนลูปหาในข้อความที่ทำความสะอาดแล้ว
    while ((match = kwRegex.exec(normalizedText)) !== null) {
      const startPos = match.index + match[0].length;
      // ดึงข้อความถัดไปมาวิเคราะห์
      const snippet = normalizedText.substring(startPos, startPos + 50);
      
      // ดึงเฉพาะตัวเลขหรือข้อความที่ต่อเนื่องกัน
      // [0-9,.]+ คือตัวเลขที่อาจมีลูกน้ำหรือจุดทศนิยม
      const valueMatch = snippet.match(/^([0-9,.]+)/) || snippet.match(/^([ก-๙a-zA-Z0-9.\s]+?)(?=\s{2,}|\n|\r|$)/);
      
      if (valueMatch && valueMatch[1]) {
        extractedData.push(valueMatch[1].trim());
      }
    }

    found[trimmedKw] = {
      count: extractedData.length,
      values: [...new Set(extractedData)]
    };
  }

  return found;
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}