"use client"; // เพิ่มบรรทัดนี้

import { useState } from "react";
import FileUploader from "@/components/Uploader/FileUploader";
import Uploaded from "@/components/Uploader/Uploaded";

export default function AddFilePage() {
    // สร้าง State สำหรับเก็บข้อมูลที่สแกนได้ และ % การอัพโหลด
    const [extractedData, setExtractedData] = useState<any>(null);
    const [progress, setProgress] = useState<number>(0);

    return (
        <div className="flex flex-col md:flex-row justify-between w-full md:h-full p-16 pt-8 gap-12">
            <div className="flex flex-1">
                {/* ส่งฟังก์ชันไปให้ Uploader เพื่อรับข้อมูลกลับมา */}
                <FileUploader 
                    setExtractedData={setExtractedData} 
                    progress={progress}
                    setProgress={setProgress}
                />
            </div>
            <div className="flex flex-2">
                {/* ส่งข้อมูลที่ได้ ไปให้ Uploaded แสดงผลทางขวา */}
                <Uploaded extractedData={extractedData} /> 
            </div>
        </div>
    );
}