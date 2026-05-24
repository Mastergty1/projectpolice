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
    return require('@napi-rs/canvas');
  }
  return originalRequire.apply(this, arguments);
};

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

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

async function pdfToImages(filePath) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-'));
  const data = new Uint8Array(fs.readFileSync(filePath));

  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapUrl: 'node_modules/pdfjs-dist/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/',
  });

  const pdfDocument = await loadingTask.promise;
  const pngFiles = [];
  const canvasFactory = new NodeCanvasFactory();

  const numPages = pdfDocument.numPages;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport: viewport,
      canvasFactory: canvasFactory,
    };

    await page.render(renderContext).promise;

    const imgPath = path.join(tmpDir, `page-${i.toString().padStart(2, '0')}.png`);
    const buffer = canvasAndContext.canvas.toBuffer('image/png');
    fs.writeFileSync(imgPath, buffer);
    pngFiles.push(imgPath);

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
    if (tmpDir && fs.existsSync(tmpDir)) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  }
};

// ฟังก์ชันสกัดข้อมูลเจาะจง รองรับคำที่ OCR มักอ่านเพี้ยน
exports.extractDocumentData = (text) => {
  const normalizedText = text.replace(/\r\n/g, '\n');
  const extracted = { ที่: null, เรียน: null, เลขรับ: null, วันที่: null, เวลา: null, เนื้อหา: [] };

  const tiMatch = normalizedText.match(/(?:^|\n|\s)(?:ที่|ที|ทึ่|ทิ่)\s+([^\n]+)/);
  if (tiMatch) extracted.ที่ = tiMatch[1].trim();

  const rianMatch = normalizedText.match(/(?:^|\n|\s)(?:เรียน|เรืยน)\s+([^\n]+)/);
  if (rianMatch) extracted.เรียน = rianMatch[1].trim();

  const lekRubMatch = normalizedText.match(/(?:^|\n|\s)(?:เลขรับ|เลขร้บ)\s*[:\-]?\s*([^\n]+)/);
  if (lekRubMatch) extracted.เลขรับ = lekRubMatch[1].trim();

  const dateMatch = normalizedText.match(/(?:^|\n|\s)(?:วันที่|วันที|วันทึ่)\s+([^\n]+?)(?=\s*(?:เวลา|เธลา)|\n|$)/);
  if (dateMatch) extracted.วันที่ = dateMatch[1].trim();

  const timeMatch = normalizedText.match(/(?:^|\n|\s)(?:เวลา|เธลา)\s+([^\n]+)/);
  if (timeMatch) extracted.เวลา = timeMatch[1].trim();

  const contentRegex = /(?:^|\n)[ \t]*[\-\–\—]\s*([^\n]+)/g;
  let match;
  while ((match = contentRegex.exec(normalizedText)) !== null) {
    if (match[1].trim() && match[1].trim().length > 2) {
      extracted.เนื้อหา.push(match[1].trim());
    }
  }

  return extracted;
};