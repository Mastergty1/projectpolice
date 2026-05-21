backend/
├── config/
│   ├── config.env
│   └── db.js
├── controllers/
│   ├── auth.js
│   ├── users.js
│   └── documentController.js  ← ใหม่
├── middleware/
│   └── upload.js               ← ใหม่ (multer)
├── models/
│   └── Document.js             ← ใหม่
├── routes/
│   └── documents.js            ← ใหม่
├── services/
│   └── ocrService.js           ← ใหม่ (tesseract)
└── utils/
    └── duplicateChecker.js     ← ใหม่

    documentController.js flowหลักrunทีเดียวไล่หมดทุกไฟล์ที่เพิ่มมา

    middlewarre/upload.js
        -createfolder
        -file type fileter
    
    routes/documents.js
        -post file

    services/ocrservice.js
        -img to text
        -keyword find
    
    utils/duplicatechecker.js
        -hash file 
        -compare already have hash and new hash 
