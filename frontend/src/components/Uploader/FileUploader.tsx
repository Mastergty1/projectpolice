"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import styles from "./fileUploader.module.css";
import axios from "axios"; // นำเข้า axios

// กำหนด Type ของ Props ที่รับมาจาก page.tsx
interface FileUploaderProps {
    setExtractedData: (data: any) => void;
    progress: number;
    setProgress: (progress: number) => void;
}

export default function FileUploader({ setExtractedData, progress, setProgress }: FileUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files as FileList)]);
        }
    };

    const handleClick = () => { fileInputRef.current?.click(); };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage({ text: "กรุณาเลือกไฟล์ก่อนทำการอัพโหลด", type: "error" });
            return;
        }

        setIsUploading(true);
        setMessage(null);
        setProgress(0); // รีเซ็ตหลอด
        setExtractedData(null); // รีเซ็ตข้อมูลเดิม

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file); 
        });

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
            
            // ใช้ axios แทน fetch เพื่อทำ Progress bar
            const response = await axios.post(`${backendUrl}/api/v1/documents/process`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                        
                        if (percentCompleted === 100) {
                            setMessage({ text: "กำลังให้ AI ประมวลผลและสกัดข้อมูล...", type: "success" });
                        }
                    }
                }
            });

            if (response.status === 200) {
                setMessage({ text: "อัพโหลดไฟล์และประมวลผลสำเร็จ!", type: "success" });
                setFiles([]); 
                
                // โยนข้อมูลที่สแกนได้ ส่งไปให้ page.tsx
                const resultData = response.data.results[0];
                if (resultData && resultData.extractedData) {
                    setExtractedData(resultData.extractedData);
                }
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            setMessage({ text: `เกิดข้อผิดพลาด: ${error.response?.data?.message || "ไม่สามารถเชื่อมต่อได้"}`, type: "error" });
        } finally {
            setIsUploading(false);
            setProgress(0); // สแกนจบ ซ่อนหลอดโหลด
        }
    };

    return (
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <h1 className={styles.Header}>อัพโหลดไฟล์เอกสาร</h1>
            
            <div 
                className={styles.ContentWrapper}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
                style={{ cursor: "pointer" }}
            >
                <div className={styles.ContentContainer}>
                    {files.length === 0 ? (
                        <div>อัพโหลดหรือลากไฟล์เอกสารมาที่นี่</div>
                    ) : (
                        <ul className="flex flex-col gap-2 w-full max-w-sm px-4 text-sm text-gray-700">
                            {files.map((file, index) => (
                                <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                    <span className="truncate pr-4">{file.name}</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                        className="text-red-500 font-bold hover:text-red-700"
                                    >✕</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" style={{ display: 'none' }} />

            {/* แสดงข้อความสถานะ */}
            {message && (
                <div className={`text-sm text-center ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {message.text}
                </div>
            )}

            {/* แสดงหลอด Progress Bar */}
            {progress > 0 && progress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <button 
                    className={styles.Button} 
                    onClick={handleUpload}
                    disabled={isUploading}
                    style={{ opacity: isUploading ? 0.7 : 1, cursor: isUploading ? "not-allowed" : "pointer" }}
                >
                    {isUploading ? "กำลังประมวลผล..." : "อัพโหลดไฟล์"}
                </button>
                <button className={styles.Button}>เพิ่มงานติดตามด้วยตนเอง</button>
            </div>
        </div>
    );
}