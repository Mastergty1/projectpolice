"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./fileUploader.module.css";

// กำหนด Interface สำหรับ structure ข้อมูลใหม่
interface ResponsibilityAssignment {
    responsible_person: string;
    user_id?: string; 
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
    due_date?: string; 
}

interface ExtractedPayload {
    documentId: number;
    memos: MemoData[];
}

interface UploadedProps {
    extractedData: ExtractedPayload | null; 
}

const parseThaiDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    
    const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const thaiMonthsAbbr = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    
    const regex = /(\d{1,2})\s*(.+?)\s*(\d{4})/;
    const match = dateStr.match(regex);
    if (!match) return null; 

    const day = parseInt(match[1]);
    const monthStr = match[2].trim();
    let year = parseInt(match[3]);

    if (year > 2400) year -= 543;

    let monthIndex = thaiMonths.findIndex(m => m === monthStr);
    if (monthIndex === -1) monthIndex = thaiMonthsAbbr.findIndex(m => m === monthStr);
    if (monthIndex === -1) monthIndex = thaiMonths.findIndex(m => monthStr.includes(m)); 

    if (monthIndex === -1) return null;

    return new Date(year, monthIndex, day);
};

export default function Uploaded({ extractedData }: UploadedProps) {
    const router = useRouter();

    const [deadline, setDeadline] = useState("");
    const [assignee, setAssignee] = useState("");

    const [users, setUsers] = useState<any[]>([]);
    const [memosData, setMemosData] = useState<MemoData[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003"}/api/v1/users`);
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.data || []);
                }
            } catch (err) {
                console.error("Fetch users failed", err);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (extractedData && extractedData.memos) {
            setMemosData(extractedData.memos);
        }
    }, [extractedData]);

    const handleUserSelect = (memoIndex: number, assignIndex: number, userId: string) => {
        const newMemos = [...memosData];
        if (newMemos[memoIndex].assignments) {
            newMemos[memoIndex].assignments![assignIndex].user_id = userId;
        }
        setMemosData(newMemos);
    };

    const handleConfirm = async () => {
        if (!extractedData?.documentId) {
            alert("ไม่พบข้อมูลเอกสารอ้างอิง");
            return;
        }

        if (!deadline) {
            alert("⚠️ กรุณาเลือกระยะเวลาที่ต้องติดตามงาน (เช่น 1 วัน, 3 วัน) ด้านบนสุดก่อนครับ");
            return;
        }

        setIsSaving(true);
        try {
            const memosWithDueDate = memosData.map(memo => {
                let baseDate = parseThaiDate(memo.วันที่);
                
                if (!baseDate || isNaN(baseDate.getTime())) {
                    baseDate = new Date();
                }

                baseDate.setDate(baseDate.getDate() + parseInt(deadline));
                
                return {
                    ...memo,
                    due_date: baseDate.toISOString().split('T')[0] 
                };
            });

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003"}/api/v1/tasks/confirm`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    documentId: extractedData.documentId,
                    memos: memosWithDueDate 
                })
            });
            
            if (res.ok) {
                alert("เพิ่มงานติดตามเข้าสู่ระบบเรียบร้อยแล้ว!");
                router.push("/"); 
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึก");
            }
        } catch (err) {
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        } finally {
            setIsSaving(false);
        }
    };

    return(
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <h1 className={styles.Header}>งานติดตามที่ตรวจอ่านได้</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        {/* 💡 เพิ่ม flex-wrap และ shrink-0 ป้องกันช่อง Select หดและบีบกันเอง */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap shrink-0 py-2">
                            <strong className="shrink-0">ต้องติดตามใน</strong>
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
                            
                            <strong className="shrink-0">สำหรับ</strong>
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

                {/* 💡 เพิ่ม shrink-0 ป้องกันลิสต์โดนบีบ */}
                <div className="p-4 w-full h-full max-h-150 overflow-y-auto shrink-0">
                    {memosData.length > 0 ? (
                        <div className="flex flex-col gap-8">
                            {memosData.map((memo, index) => (
                                <div key={index} className="text-sm flex flex-col gap-4 border-b pb-6 last:border-b-0 shrink-0">
                                    {memosData.length > 1 && (
                                        <h3 className="text-lg font-bold text-blue-800 border-b pb-2">
                                            เอกสารหน้าที่/ฉบับที่ {index + 1}
                                        </h3>
                                    )}
                                    
                                    <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100 shrink-0">
                                        <p><strong>ที่:</strong> {memo.ที่ || '-'}</p>
                                        <p><strong>วันที่:</strong> <span className="text-blue-600 font-bold">{memo.วันที่ || '-'}</span></p>
                                        {memo.เวลา && <p><strong>เวลา:</strong> {memo.เวลา}</p>}
                                        <p><strong>เรื่อง:</strong> {memo.เรื่อง || '-'}</p>
                                        <p><strong>เรียน:</strong> {memo.เรียน || '-'}</p>
                                    </div>

                                    {memo.main_text && (
                                        <div className="p-2 shrink-0">
                                            <strong>เนื้อหา:</strong>
                                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{memo.main_text}</p>
                                        </div>
                                    )}
                                    
                                    {memo.assignments && memo.assignments.length > 0 ? (
                                        <div className="mt-2 shrink-0">
                                            <strong className="text-base text-blue-800">การมอบหมายงาน/ความรับผิดชอบ:</strong>
                                            <div className="flex flex-col gap-4 mt-3">
                                                {memo.assignments.map((assignment: ResponsibilityAssignment, idx: number) => (
                                                    <div key={idx} className="bg-white p-4 rounded-lg shadow-inner border border-gray-100 shrink-0">
                                                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                                                            <p className="font-bold text-base text-green-700">
                                                                สกัดจากเอกสาร: {assignment.responsible_person || 'ไม่ระบุ'}
                                                            </p>
                                                            
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-blue-600 shrink-0">มอบหมายให้:</span>
                                                                <select 
                                                                    className="p-2 border border-blue-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto min-h-10 shrink-0"
                                                                    onChange={(e) => handleUserSelect(index, idx, e.target.value)}
                                                                >
                                                                    <option value="">-- เลือกระบุบุคคล --</option>
                                                                    {users.map(u => (
                                                                        <option key={u.id || u._id} value={u.id || u._id}>
                                                                            {u.name} {u.role ? `(${u.role})` : ''}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="pl-4 border-l-2 border-gray-200">
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
                                            <div className="text-gray-400 text-center py-5 shrink-0">
                                                ไม่พบข้อมูลการมอบหมายงานในเอกสารนี้
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center py-10 shrink-0">
                            ยังไม่มีข้อมูล กรุณาอัพโหลดเอกสารเพื่อสแกน
                        </div>
                    )}
                </div>

            </div>
            {/* 💡 เพิ่ม flex-wrap ที่ปุ่มด้านล่าง */}
            <div className="flex flex-col md:flex-row md:justify-end gap-4 mt-6 flex-wrap shrink-0">
                <button className={styles.ButtonVariant} onClick={() => router.push('/')}>
                    กลับหน้าหลัก
                </button>
                <button 
                    className={styles.Button} 
                    onClick={handleConfirm}
                    disabled={isSaving || memosData.length === 0}
                    style={{ opacity: (isSaving || memosData.length === 0) ? 0.6 : 1 }}
                >
                    {isSaving ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันเพิ่มงานติดตาม'}
                </button>
            </div>
        </div>
    )
}