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
        -file type filter
    
    routes/documents.js
        -post file

    services/ocrservice.js
        -img to text
        -keyword find
    
    utils/duplicatechecker.js
        -hash file 
        -compare already have hash and new hash 


เพิ่ม
FE
app/addFile/**self-add**
เพิ่ม components/**self-add**
เพิ่มpush port->addField/selfadd ใน**components/Uploader/FileUploader.tsx**


BE
เพิ่ม**CreateTask**ในtask controller,route
