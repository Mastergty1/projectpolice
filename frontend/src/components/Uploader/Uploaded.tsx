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
    isUrgent?: boolean;
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
            const filteredMemos = extractedData.memos.filter(memo => {
                const hasAt = memo.ที่ && memo.ที่.trim() !== "" && memo.ที่.trim() !== "-";
                const hasDate = memo.วันที่ && memo.วันที่.trim() !== "" && memo.วันที่.trim() !== "-";
                const hasSubject = memo.เรื่อง && memo.เรื่อง.trim() !== "" && memo.เรื่อง.trim() !== "-";
                const hasTo = memo.เรียน && memo.เรียน.trim() !== "" && memo.เรียน.trim() !== "-";
                
                return hasAt && hasDate && hasSubject && hasTo;
            });
            setMemosData(filteredMemos);
        }
    }, [extractedData]);

    const handleUserSelect = (memoIndex: number, assignIndex: number, userId: string) => {
        setMemosData(prevMemos => prevMemos.map((memo, mIdx) => {
            if (mIdx !== memoIndex) return memo;
            return {
                ...memo,
                assignments: memo.assignments?.map((assign, aIdx) => {
                    if (aIdx !== assignIndex) return assign;
                    return { ...assign, user_id: userId };
                })
            };
        }));
    };

    const handleMemoChange = (index: number, field: keyof MemoData, value: string | boolean) => {
        setMemosData(prevMemos => prevMemos.map((memo, mIdx) => {
            if (mIdx !== index) return memo;
            return { ...memo, [field]: value };
        }));
    };

    const handleAddTopic = (memoIndex: number, assignIndex: number) => {
        setMemosData(prevMemos => prevMemos.map((memo, mIdx) => {
            if (mIdx !== memoIndex) return memo;
            return {
                ...memo,
                assignments: memo.assignments?.map((assign, aIdx) => {
                    if (aIdx !== assignIndex) return assign;
                    return {
                        ...assign,
                        topics: [...(assign.topics || []), ""]
                    };
                })
            };
        }));
    };

    const handleTopicChange = (memoIndex: number, assignIndex: number, topicIndex: number, value: string) => {
        setMemosData(prevMemos => prevMemos.map((memo, mIdx) => {
            if (mIdx !== memoIndex) return memo;
            return {
                ...memo,
                assignments: memo.assignments?.map((assign, aIdx) => {
                    if (aIdx !== assignIndex) return assign;
                    return {
                        ...assign,
                        topics: (assign.topics || []).map((topic, tIdx) => tIdx === topicIndex ? value : topic)
                    };
                })
            };
        }));
    };

    const handleRemoveTopic = (memoIndex: number, assignIndex: number, topicIndex: number) => {
        setMemosData(prevMemos => prevMemos.map((memo, mIdx) => {
            if (mIdx !== memoIndex) return memo;
            return {
                ...memo,
                assignments: memo.assignments?.map((assign, aIdx) => {
                    if (aIdx !== assignIndex) return assign;
                    return {
                        ...assign,
                        topics: (assign.topics || []).filter((_, tIdx) => tIdx !== topicIndex)
                    };
                })
            };
        }));
    };

    const handleConfirm = async () => {
        if (!extractedData?.documentId) {
            alert("ไม่พบข้อมูลเอกสารอ้างอิง");
            return;
        }

        if (!deadline || !assignee) {
            alert("⚠️ กรุณาเลือกระยะเวลาที่ต้องติดตามงาน และ รูปแบบผู้รับผิดชอบ ด้านบนสุดก่อนครับ");
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
                
                // 💡 ถ้าระบุว่า "ทุกหน่วยงาน" ให้มอบหมายงานให้กับ User ทุกคนในระบบแทน
                let finalAssignments = memo.assignments || [];
                if (assignee === "all") {
                    finalAssignments = users.map(u => ({
                        responsible_person: "ทุกหน่วยงาน (ทุกคน)",
                        user_id: String(u.id || u._id),
                        topics: [] // ว่างไว้เพื่อไปกรอกรายละเอียดภายหลัง
                    }));
                }

                return {
                    ...memo,
                    assignments: finalAssignments,
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
        <div className="flex flex-col w-full h-full gap-6 min-h-75 flex-1">
            <h1 className={styles.Header}>งานติดตามที่ตรวจอ่านได้</h1>
            
            <div className={`${styles.ContentWrapper} flex flex-col flex-1 min-h-0 overflow-hidden`}>
                
                <div className="bg-(--container) shrink-0 border-b border-gray-400 z-10 w-full" style={{ borderRadius: '0.2rem 0.2rem 0 0' }}>
                    <div className="p-4 sm:px-6 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-wrap shrink-0">
                            <div className="flex items-center gap-3">
                                <strong className="shrink-0 whitespace-nowrap">ต้องติดตามใน</strong>
                                <select 
                                    className={`${styles.Dropdown} min-w-30`} 
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                >
                                    <option value="" disabled>เลือกระยะเวลา</option>
                                    <option value="1">1 วัน</option>
                                    <option value="3">3 วัน</option>
                                    <option value="7">7 วัน</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <strong className="shrink-0 whitespace-nowrap">สำหรับ</strong>
                                <select 
                                    className={`${styles.Dropdown} min-w-37.5`}
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
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 w-full min-h-0 bg-(--wrapper)" style={{ borderRadius: '0 0 0.2rem 0.2rem' }}>
                    {memosData.length > 0 ? (
                        <div className="flex flex-col gap-8">
                            {memosData.map((memo, index) => (
                                <div key={index} className="text-sm flex flex-col gap-4 border-b border-gray-400 pb-6 last:border-b-0 shrink-0">
                                    {memosData.length > 1 && (
                                        <h3 className="text-lg font-bold border-b border-gray-400 pb-2" style={{ color: "var(--header)" }}>
                                            เอกสารหน้าที่/ฉบับที่ {index + 1}
                                        </h3>
                                    )}
                                    
                                    <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200 shrink-0 text-black">
                                        <div className="flex items-center gap-2">
                                            <strong className="w-12 shrink-0">ที่:</strong>
                                            <input type="text" className="border border-gray-300 p-1.5 rounded flex-1 focus:ring-2 focus:ring-blue-400 outline-none bg-white" value={memo.ที่ || ''} onChange={(e) => handleMemoChange(index, "ที่", e.target.value)} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <strong className="w-12 shrink-0">วันที่:</strong>
                                            <input type="text" className="border border-gray-300 p-1.5 rounded flex-1 font-bold text-blue-700 focus:ring-2 focus:ring-blue-400 outline-none bg-white" value={memo.วันที่ || ''} onChange={(e) => handleMemoChange(index, "วันที่", e.target.value)} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <strong className="w-12 shrink-0">เวลา:</strong>
                                            <input type="text" className="border border-gray-300 p-1.5 rounded flex-1 focus:ring-2 focus:ring-blue-400 outline-none bg-white" value={memo.เวลา || ''} onChange={(e) => handleMemoChange(index, "เวลา", e.target.value)} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <strong className="w-12 shrink-0">เรื่อง:</strong>
                                            <input type="text" className="border border-gray-300 p-1.5 rounded flex-1 focus:ring-2 focus:ring-blue-400 outline-none bg-white" value={memo.เรื่อง || ''} onChange={(e) => handleMemoChange(index, "เรื่อง", e.target.value)} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <strong className="w-12 shrink-0">เรียน:</strong>
                                            <input type="text" className="border border-gray-300 p-1.5 rounded flex-1 focus:ring-2 focus:ring-blue-400 outline-none bg-white" value={memo.เรียน || ''} onChange={(e) => handleMemoChange(index, "เรียน", e.target.value)} />
                                        </div>
                                        
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                                            <input 
                                                type="checkbox" 
                                                id={`urgent-${index}`}
                                                checked={memo.isUrgent || false} 
                                                onChange={(e) => handleMemoChange(index, "isUrgent", e.target.checked)}
                                                className="w-4 h-4 cursor-pointer"
                                                style={{ accentColor: 'var(--redText)' }}
                                            />
                                            <label htmlFor={`urgent-${index}`} className="cursor-pointer font-bold text-red-600">
                                                🔥 กำหนดให้เอกสารนี้เป็นงานเร่งด่วน
                                            </label>
                                        </div>
                                    </div>

                                    <div className="p-2 shrink-0 text-black">
                                        <strong style={{ color: "var(--header)" }}>เนื้อหา:</strong>
                                        <textarea 
                                            className="mt-2 w-full border border-gray-300 rounded p-3 text-gray-800 bg-white focus:ring-2 focus:ring-blue-400 outline-none" 
                                            rows={5} 
                                            value={memo.main_text || ''} 
                                            onChange={(e) => handleMemoChange(index, "main_text", e.target.value)} 
                                        />
                                    </div>
                                    
                                    {/* 💡 เงื่อนไขการแสดงผล: ถ้าเลือก "ทุกหน่วยงาน" ให้ซ่อนการเพิ่มทีละคน และแสดงข้อความแทน */}
                                    {assignee === 'all' ? (
                                        <div className="mt-4 shrink-0 p-5 bg-blue-50 border border-blue-200 rounded-lg text-center shadow-sm">
                                            <span className="text-blue-700 font-bold text-lg">📢 มอบหมายให้ทุกหน่วยงาน (ทุกคน)</span>
                                            <p className="text-sm text-blue-600 mt-2">
                                                เมื่อกดยืนยัน ระบบจะทำการมอบหมายงานนี้ให้กับทุกคนในระบบโดยอัตโนมัติ 
                                                <br/>(คุณสามารถเข้าไปเพิ่มรายละเอียดงานย่อย/หัวข้อในหน้าแก้ไขได้ภายหลัง)
                                            </p>
                                        </div>
                                    ) : (
                                        memo.assignments && memo.assignments.length > 0 ? (
                                            <div className="mt-2 shrink-0">
                                                <strong className="text-base" style={{ color: "var(--header)" }}>การมอบหมายงาน/ความรับผิดชอบ:</strong>
                                                <div className="flex flex-col gap-4 mt-3">
                                                    {memo.assignments.map((assignment: ResponsibilityAssignment, idx: number) => (
                                                        <div key={idx} className="bg-white p-4 rounded-lg shadow-inner border border-gray-100 shrink-0 text-black">
                                                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                                                                <p className="font-bold text-base text-green-700">
                                                                    สกัดจากเอกสาร: {assignment.responsible_person || 'ไม่ระบุ'}
                                                                </p>
                                                                
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-blue-600 shrink-0">มอบหมายให้:</span>
                                                                    <select 
                                                                        className="p-2 border border-blue-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto min-h-10 shrink-0 text-black"
                                                                        value={assignment.user_id || ""}
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
                                                                <div className="flex flex-row items-center justify-between mt-2 mb-2">
                                                                    <strong>สิ่งที่ต้องดำเนินการ / หัวข้อที่รับผิดชอบ:</strong>
                                                                    <button type="button" onClick={() => handleAddTopic(index, idx)} className="text-xs bg-blue-500 text-white px-2 py-1.5 rounded hover:bg-blue-600 font-medium">
                                                                        + เพิ่มงานที่ต้องทำ
                                                                    </button>
                                                                </div>
                                                                <ul className="list-none pl-1 mt-2 text-gray-700 flex flex-col gap-2">
                                                                    {assignment.topics && assignment.topics.length > 0 ? (
                                                                        assignment.topics.map((topic: string, topicIdx: number) => (
                                                                            <li key={topicIdx} className="flex gap-2 items-center">
                                                                                <span className="text-gray-500 text-lg font-bold w-4">•</span>
                                                                                <input 
                                                                                    type="text"
                                                                                    className="border border-gray-300 p-2 rounded flex-1 text-sm outline-none bg-white focus:ring-1 focus:ring-blue-400 w-full"
                                                                                    placeholder="ระบุสิ่งที่ต้องดำเนินการ..."
                                                                                    value={topic}
                                                                                    onChange={(e) => handleTopicChange(index, idx, topicIdx, e.target.value)}
                                                                                />
                                                                                <button type="button" onClick={() => handleRemoveTopic(index, idx, topicIdx)} className="text-red-500 hover:bg-red-50 p-2 rounded text-lg font-bold shrink-0">✕</button>
                                                                            </li>
                                                                        ))
                                                                    ) : (
                                                                        <li className="text-gray-400 text-sm">- ยังไม่มีสิ่งที่ต้องดำเนินการ -</li>
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
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center flex flex-col items-center justify-center h-full gap-4 py-10 shrink-0">
                            {extractedData && extractedData.memos && extractedData.memos.length > 0 
                                ? (
                                    <>
                                        <span className="text-4xl">⚠️</span>
                                        <p style={{ color: "var(--header)", fontSize: "1.2rem" }}>
                                            เอกสารมีข้อมูลไม่ครบถ้วน (ขาด ที่, วันที่, เรื่อง, หรือ เรียน)<br/>
                                            ระบบจึงทำการคัดกรองออกโดยอัตโนมัติ
                                        </p>
                                    </>
                                )
                                : "ยังไม่มีข้อมูล กรุณาอัพโหลดเอกสารเพื่อสแกน"}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:justify-end gap-4 mt-2 flex-wrap shrink-0">
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
    );
}