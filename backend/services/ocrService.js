const Tesseract = require('tesseract.js');

//img to text
exports.extractText = async (filePath) => {
  const { data: { text } } = await Tesseract.recognize(filePath, 'tha+eng', {
    logger: m => console.log(m)
  });
  return text.trim();
};

//find keywords in text
exports.findKeywords = (text, keywords) => {
  const found = {};
  for (const kw of keywords) {
    const regex = new RegExp(kw, 'gi');
    found[kw] = (text.match(regex) || []).length; 
  }
  return found;
};