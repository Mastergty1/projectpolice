import { useState } from "react";
import styles from "./fileUploader.module.css";

// กำหนด Interface สำหรับ structure ข้อมูลใหม่
interface ResponsibilityAssignment {
    responsible_person: string;
    topics: string[];
}

interface MemoData {
    ที่?: string;
    วันที่?: string;
    เวลา?: string;
    เรื่อง?: string;
    เรียน?: string;
    main_text?: string;
    assignments?: ResponsibilityAssignment[];
}

interface UploadedProps {
    extractedData: MemoData[] | null; // รองรับ Array ของเอกสารหลายหน้า
}

export default function Uploaded({ extractedData }: UploadedProps) {
    // เพิ่ม State สำหรับจัดการ Dropdown ให้กดใช้งานได้จริง
    const [deadline, setDeadline] = useState("");
    const [assignee, setAssignee] = useState("");

    // แปลงข้อมูลให้เป็น Array เสมอ เพื่อให้ใช้ .map() วนลูปได้
    const memos = Array.isArray(extractedData) ? extractedData : (extractedData ? [extractedData] : []);

    return(
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <h1 className={styles.Header}>งานติดตามที่ตรวจอ่านได้</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <strong>ต้องติดตามใน</strong>
                            {/* เปลี่ยนจาก <button> เป็น <select> โดยใช้ className เดิม เพื่อให้ UI เหมือนเดิมแต่ใช้งานได้ */}
                            <select 
                                className={styles.Dropdown} 
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            >
                                <option value="" disabled>เลือกระยะเวลา</option>
                                <option value="1">1 วัน</option>
                                <option value="3">3 วัน</option>
                                <option value="7">7 วัน</option>
                            </select>
                            
                            <strong>สำหรับ</strong>
                            <select 
                                className={styles.Dropdown}
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                            >
                                <option value="" disabled>เลือกผู้รับผิดชอบ</option>
                                <option value="all">ทุกหน่วยงาน</option>
                                <option value="specific">เฉพาะบุคคล</option>
                            </select>
                        </div>
                    </div>
                </div>
                <hr className={styles.Line} />

                {/* ส่วนแสดงผลข้อมูลที่สแกนได้ */}
                <div className="p-4 w-full max-h-150 overflow-y-auto">
                    {memos.length > 0 ? (
                        <div className="flex flex-col gap-8">
                            {memos.map((memo, index) => (
                                <div key={index} className="text-sm flex flex-col gap-4 border-b pb-6 last:border-b-0">
                                    {/* แสดงหัวข้อแยกเอกสาร หากมีหลายฉบับ */}
                                    {memos.length > 1 && (
                                        <h3 className="text-lg font-bold text-blue-800 border-b pb-2">
                                            เอกสารหน้าที่/ฉบับที่ {index + 1}
                                        </h3>
                                    )}
                                    
                                    {/* ข้อมูลหัวบันทึก */}
                                    <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p><strong>ที่:</strong> {memo.ที่ || '-'}</p>
                                        <p><strong>วันที่:</strong> {memo.วันที่ || '-'}</p>
                                        {memo.เวลา && <p><strong>เวลา:</strong> {memo.เวลา}</p>}
                                        <p><strong>เรื่อง:</strong> {memo.เรื่อง || '-'}</p>
                                        <p><strong>เรียน:</strong> {memo.เรียน || '-'}</p>
                                    </div>

                                    {/* ข้อความโดยรวมหลังเรียน (ถ้ามี) */}
                                    {memo.main_text && (
                                        <div className="p-2">
                                            <strong>เนื้อหา:</strong>
                                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{memo.main_text}</p>
                                        </div>
                                    )}
                                    
                                    {/* แสดงการมอบหมายงานความรับผิดชอบ */}
                                    {memo.assignments && memo.assignments.length > 0 ? (
                                        <div className="mt-2">
                                            <strong className="text-base text-blue-800">การมอบหมายงาน/ความรับผิดชอบ:</strong>
                                            <div className="flex flex-col gap-4 mt-3">
                                                {memo.assignments.map((assignment: ResponsibilityAssignment, idx: number) => (
                                                    <div key={idx} className="bg-white p-4 rounded-lg shadow-inner border border-gray-100">
                                                        <p className="font-bold text-base text-green-700">
                                                            ผู้รับผิดชอบ: {assignment.responsible_person || 'ไม่ระบุผู้รับผิดชอบ'}
                                                        </p>
                                                        
                                                        <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                                            <strong>หัวข้อที่ต้องรับผิดชอบ:</strong>
                                                            <ul className="list-disc pl-5 mt-2 text-gray-700 flex flex-col gap-1">
                                                                {assignment.topics && assignment.topics.length > 0 ? (
                                                                    assignment.topics.map((topic: string, topicIdx: number) => (
                                                                        <li key={topicIdx}>{topic}</li>
                                                                    ))
                                                                ) : (
                                                                    <li>- ไม่พบหัวข้อความรับผิดชอบ -</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        !memo.main_text && (
                                            <div className="text-gray-400 text-center py-5">
                                                ไม่พบข้อมูลการมอบหมายงานในเอกสารนี้
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center py-10">
                            ยังไม่มีข้อมูล กรุณาอัพโหลดเอกสารเพื่อสแกน
                        </div>
                    )}
                </div>

            </div>
            <div className="flex flex-col md:flex-row md:justify-end gap-4 mt-6">
                {/* เพิ่ม onClick ให้ปุ่มตอบสนองได้ */}
                <button className={styles.ButtonVariant} onClick={() => window.location.href = '/'}>
                    กลับหน้าหลัก
                </button>
                <button className={styles.Button} onClick={() => alert('กำลังบันทึกงานติดตามเข้าสู่ระบบ SQL...')}>
                    ยืนยันเพิ่มงานติดตาม
                </button>
            </div>
        </div>
    )
}