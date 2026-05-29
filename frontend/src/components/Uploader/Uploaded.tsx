"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./fileUploader.module.css";

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

interface FileResult {
    filename: string;
    status: string;
    documentId: number;
    viewLink?: string;
    extractedData: MemoData[];
    error?: string;
}

interface FileData {
    filename: string;
    documentId: number;
    deadline: string;
    selectedAssignees: string[]; // เก็บ user_id หลายคนแบบ Checklist
    memos: MemoData[];
}

interface UploadedProps {
    extractedData: FileResult[] | null; 
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

    return monthIndex === -1 ? null : new Date(year, monthIndex, day);
};

export default function Uploaded({ extractedData }: UploadedProps) {
    const router = useRouter();

    const [users, setUsers] = useState<any[]>([]);
    const [filesData, setFilesData] = useState<FileData[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);

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
        // ดึง user_id ของคนที่ login จาก localStorage ถ้ามี
        const loggedInUserId = typeof window !== 'undefined' ? localStorage.getItem("user_id") || localStorage.getItem("userId") || "" : "";
        
        if (extractedData && Array.isArray(extractedData)) {
            const initialized = extractedData
                .filter(file => file.status === "success")
                .map(file => {
                    const strictFilteredMemos = (file.extractedData || []).filter(memo => {
                        return memo.ที่?.trim() && memo.วันที่?.trim() && memo.เรื่อง?.trim() && memo.เรียน?.trim();
                    });

                    return {
                        filename: file.filename,
                        documentId: file.documentId,
                        deadline: "14", // ค่าเริ่มต้นที่ 14 วัน
                        selectedAssignees: loggedInUserId ? [loggedInUserId] : [], // ค่าเริ่มต้นคือคนที่ login
                        memos: strictFilteredMemos.map(memo => ({
                            ...memo,
                            isUrgent: memo.isUrgent || false,
                            assignments: [] // ล้าง assignments เดิมออก เพื่อใช้แบบ checklist ใหม่
                        }))
                    };
                });
            setFilesData(initialized);
        }
    }, [extractedData]);

    const handleFileSettingChange = (fileIndex: number, field: keyof FileData, value: any) => {
        setFilesData(prev => prev.map((file, fIdx) => fIdx === fileIndex ? { ...file, [field]: value } : file));
    };

    const handleMemoChange = (fileIndex: number, memoIndex: number, field: keyof MemoData, value: string | boolean) => {
        setFilesData(prev => prev.map((file, fIdx) => {
            if (fIdx !== fileIndex) return file;
            return {
                ...file,
                memos: file.memos.map((memo, mIdx) => mIdx === memoIndex ? { ...memo, [field]: value } : memo)
            };
        }));
    };

    // จัดการหัวข้อย่อย (topics) อ้างอิงตาม userId
    const handleAddTopic = (fileIndex: number, memoIndex: number, userId: string) => {
        setFilesData(prev => prev.map((file, fIdx) => fIdx === fileIndex ? {
            ...file,
            memos: file.memos.map((memo, mIdx) => {
                if (mIdx !== memoIndex) return memo;
                const assignments = [...(memo.assignments || [])];
                const existingIdx = assignments.findIndex(a => a.user_id === userId);
                if (existingIdx !== -1) {
                    assignments[existingIdx].topics = [...assignments[existingIdx].topics, ""];
                } else {
                    assignments.push({ responsible_person: "", user_id: userId, topics: [""] });
                }
                return { ...memo, assignments };
            })
        } : file));
    };

    const handleTopicChange = (fileIndex: number, memoIndex: number, userId: string, topicIndex: number, value: string) => {
        setFilesData(prev => prev.map((file, fIdx) => fIdx === fileIndex ? {
            ...file,
            memos: file.memos.map((memo, mIdx) => {
                if (mIdx !== memoIndex) return memo;
                const assignments = [...(memo.assignments || [])];
                const existingIdx = assignments.findIndex(a => a.user_id === userId);
                if (existingIdx !== -1) {
                    assignments[existingIdx].topics = assignments[existingIdx].topics.map((t, tIdx) => tIdx === topicIndex ? value : t);
                }
                return { ...memo, assignments };
            })
        } : file));
    };

    const handleRemoveTopic = (fileIndex: number, memoIndex: number, userId: string, topicIndex: number) => {
        setFilesData(prev => prev.map((file, fIdx) => fIdx === fileIndex ? {
            ...file,
            memos: file.memos.map((memo, mIdx) => {
                if (mIdx !== memoIndex) return memo;
                const assignments = [...(memo.assignments || [])];
                const existingIdx = assignments.findIndex(a => a.user_id === userId);
                if (existingIdx !== -1) {
                    assignments[existingIdx].topics = assignments[existingIdx].topics.filter((_, tIdx) => tIdx !== topicIndex);
                }
                return { ...memo, assignments };
            })
        } : file));
    };

    const handleConfirm = async () => {
        const validFiles = filesData.filter(file => file.memos.length > 0);
        if (validFiles.length === 0) return alert("ไม่พบข้อมูลเอกสารที่สามารถบันทึกได้");

        const isAllSet = validFiles.every(f => f.deadline && f.selectedAssignees.length > 0);
        if (!isAllSet) return alert("⚠️ กรุณาเลือกระยะเวลาที่ต้องติดตามงาน และ ผู้รับผิดชอบ ให้ครบก่อนทำการบันทึกครับ");

        setIsSaving(true);
        try {
            for (const file of validFiles) {
                const memosWithDueDate = file.memos.map(memo => {
                    let baseDate = parseThaiDate(memo.วันที่);
                    if (!baseDate || isNaN(baseDate.getTime())) baseDate = new Date();
                    baseDate.setDate(baseDate.getDate() + parseInt(file.deadline));
                    
                    let finalAssignments = [];
                    if (file.selectedAssignees.includes("all")) {
                        finalAssignments = users.map(u => ({
                            responsible_person: "ทุกหน่วยงาน (ทุกคน)",
                            user_id: String(u.id || u._id),
                            topics: memo.assignments?.find(a => a.user_id === "all")?.topics || []
                        }));
                    } else {
                        finalAssignments = file.selectedAssignees.map(uid => {
                            const u = users.find(x => String(x.id || x._id) === uid);
                            return {
                                responsible_person: u?.name || "Unknown",
                                user_id: uid,
                                topics: memo.assignments?.find(a => a.user_id === uid)?.topics || []
                            };
                        });
                    }

                    return { ...memo, assignments: finalAssignments, due_date: baseDate.toISOString().split('T')[0] };
                });

                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003"}/api/v1/tasks/confirm`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentId: file.documentId, memos: memosWithDueDate })
                });
                
                if (!res.ok) throw new Error(`เกิดข้อผิดพลาดในการบันทึกข้อมูลไฟล์: ${file.filename}`);
            }

            alert("เพิ่มงานติดตามเข้าสู่ระบบเรียบร้อยแล้ว!");
            router.push("/"); 
        } catch (err: any) {
            alert(err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        } finally {
            setIsSaving(false);
        }
    };

    return(
        <div className="flex flex-col w-full h-full gap-4 flex-1 overflow-hidden pb-4 min-h-0">
            <h1 className={styles.Header} style={{ flexShrink: 0 }}>งานติดตามที่ตรวจอ่านได้</h1>
            <div className="flex-1 w-full overflow-y-auto pr-2 pb-4 flex flex-col gap-8 min-h-0">
                {filesData.length > 0 ? (
                    filesData.map((file, fileIdx) => (
                        <div key={fileIdx} className={`${styles.ContentWrapper} flex flex-col shrink-0 overflow-hidden shadow-md`} style={{ minHeight: 'auto' }}>
                            <div className="bg-(--container) shrink-0 border-b border-gray-400 z-10 w-full rounded-t-sm relative">
                                <div className="p-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="text-base font-bold text-(--header) flex items-center gap-2">
                                        <span className="text-xl">📁</span>
                                        <span>สแกนจากไฟล์: <span className="text-blue-700 underline font-extrabold">{file.filename}</span></span>
                                    </div>
                                    
                                    {file.memos.length > 0 && (
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-wrap shrink-0">
                                            <div className="flex items-center gap-3">
                                                <strong className="shrink-0 whitespace-nowrap">ต้องติดตามใน</strong>
                                                <select 
                                                    className={`${styles.Dropdown} min-w-30`} 
                                                    value={file.deadline}
                                                    onChange={(e) => handleFileSettingChange(fileIdx, "deadline", e.target.value)}
                                                >
                                                    <option value="" disabled>เลือกระยะเวลา</option>
                                                    <option value="1">1 วัน</option>
                                                    <option value="3">3 วัน</option>
                                                    <option value="7">7 วัน</option>
                                                    <option value="14">14 วัน</option>
                                                </select>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <strong className="shrink-0 whitespace-nowrap">สำหรับ</strong>
                                                <div className="relative">
                                                    <div 
                                                        className={`${styles.Dropdown} min-w-37.5 cursor-pointer flex justify-between items-center bg-(--button) border border-gray-300 rounded p-2`}
                                                        onClick={() => setOpenDropdownIdx(openDropdownIdx === fileIdx ? null : fileIdx)}
                                                    >
                                                        <span className="truncate max-w-37.5 text-sm text-foreground">
                                                            {file.selectedAssignees.includes("all") ? "ทุกหน่วยงาน" : file.selectedAssignees.length > 0 ? `เลือกแล้ว ${file.selectedAssignees.length} คน` : "เลือกผู้รับผิดชอบ"}
                                                        </span>
                                                        <span className="text-xs ml-2">▼</span>
                                                    </div>
                                                    
                                                    {openDropdownIdx === fileIdx && (
                                                        <div className="absolute top-full right-0 lg:left-0 mt-1 w-64 bg-(--container) border border-gray-300 shadow-xl rounded-md z-50 max-h-60 overflow-y-auto flex flex-col p-2">
                                                            <label className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded font-bold text-blue-600">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={file.selectedAssignees.includes("all")}
                                                                    onChange={(e) => handleFileSettingChange(fileIdx, "selectedAssignees", e.target.checked ? ["all"] : [])}
                                                                />
                                                                ทุกหน่วยงาน (ทุกคน)
                                                            </label>
                                                            <hr className="my-1 border-gray-200" />
                                                            {users.map(u => {
                                                                const uid = String(u.id || u._id);
                                                                return (
                                                                    <label key={uid} className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded text-sm text-foreground">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={file.selectedAssignees.includes(uid)}
                                                                            onChange={(e) => {
                                                                                const isChecked = e.target.checked;
                                                                                let newAssigns = [...file.selectedAssignees].filter(id => id !== "all");
                                                                                if (isChecked) newAssigns.push(uid);
                                                                                else newAssigns = newAssigns.filter(id => id !== uid);
                                                                                handleFileSettingChange(fileIdx, "selectedAssignees", newAssigns);
                                                                            }}
                                                                        />
                                                                        {u.name} {u.role ? `(${u.role})` : ''}
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 w-full bg-(--wrapper) overflow-y-auto rounded-b-sm" style={{ maxHeight: '60vh' }}>
                                {file.memos.length > 0 ? (
                                    <div className="flex flex-col gap-8">
                                        {file.memos.map((memo, index) => (
                                            <div key={index} className="text-sm flex flex-col gap-4 border-b border-gray-400 pb-6 last:border-b-0 shrink-0">
                                                <h3 className="text-md font-bold" style={{ color: "var(--header)" }}>📄 เอกสารหน้าที่/ฉบับที่ {index + 1}</h3>
                                                <div className="flex flex-col gap-2 p-4 rounded-lg border bg-(--container) border-(--shadow) shrink-0 text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <strong className="w-12 shrink-0">ที่:</strong>
                                                        <input type="text" className="border border-gray-300 p-1.5 rounded flex-1 focus:ring-2 focus:ring-blue-400 outline-none bg-(--button)" value={memo.ที่ || ''} onChange={(e) => handleMemoChange(fileIdx, index, "ที่", e.target.value)} />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <strong className="w-12 shrink-0">วันที่:</strong>
                                                        <input type="text" className="border border-(--wrapper) p-1.5 rounded flex-1 font-bold text-(--blueText) focus:ring-2 focus:ring-blue-400 outline-none bg-(--button)" value={memo.วันที่ || ''} onChange={(e) => handleMemoChange(fileIdx, index, "วันที่", e.target.value)} />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <strong className="w-12 shrink-0">เวลา:</strong>
                                                        <input type="text" className="border border-(--wrapper) p-1.5 rounded flex-1 focus:ring-2 focus:ring-blue-400 outline-none bg-(--button)" value={memo.เวลา || ''} onChange={(e) => handleMemoChange(fileIdx, index, "เวลา", e.target.value)} />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <strong className="w-12 shrink-0">เรื่อง:</strong>
                                                        <input type="text" className="border border-(--wrapper) p-1.5 rounded flex-1 focus:ring-2 focus:ring-(--blueText) outline-none bg-(--button)" value={memo.เรื่อง || ''} onChange={(e) => handleMemoChange(fileIdx, index, "เรื่อง", e.target.value)} />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <strong className="w-12 shrink-0">เรียน:</strong>
                                                        <input type="text" className="border border-(--wrapper) p-1.5 rounded flex-1 focus:ring-2 focus:ring-(--blueText) outline-none bg-(--button)" value={memo.เรียน || ''} onChange={(e) => handleMemoChange(fileIdx, index, "เรียน", e.target.value)} />
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                                                        <input type="checkbox" id={`urgent-${fileIdx}-${index}`} checked={memo.isUrgent || false} onChange={(e) => handleMemoChange(fileIdx, index, "isUrgent", e.target.checked)} className="w-4 h-4 cursor-pointer" style={{ accentColor: 'var(--redText)' }} />
                                                        <label htmlFor={`urgent-${fileIdx}-${index}`} className="cursor-pointer font-bold text-red-600">🔥 กำหนดให้เอกสารนี้เป็นงานเร่งด่วน</label>
                                                    </div>
                                                </div>

                                                <div className="p-2 shrink-0 text-foreground">
                                                    <strong style={{ color: "var(--header)" }}>เนื้อหา:</strong>
                                                    <textarea 
                                                        className="mt-2 w-full border rounded p-3 text-(--foreground) focus:ring-2 focus:ring-(--blueText) outline-none bg-(--button) border-(--wrapper)" 
                                                        rows={5} 
                                                        value={memo.main_text || ''} 
                                                        onChange={(e) => handleMemoChange(fileIdx, index, "main_text", e.target.value)} 
                                                    />
                                                </div>
                                                
                                                {file.assigneeMode === 'all' ? (
                                                    <div className="mt-4 shrink-0 p-5 bg-blue-50 border border-blue-200 rounded-lg text-center shadow-sm">
                                                        <span className="text-(--blueText) font-bold text-lg">📢 มอบหมายให้ทุกหน่วยงาน (ทุกคน)</span>
                                                        <p className="text-sm text-(--blueText) mt-2">
                                                            เมื่อกดยืนยัน ระบบจะทำการมอบหมายงานนี้ให้กับทุกคนในระบบโดยอัตโนมัติ 
                                                            <br/>(คุณสามารถเข้าไปเพิ่มรายละเอียดงานย่อย/หัวข้อในหน้าแก้ไขได้ภายหลัง)
                                                        </p>
                                                    </div>
                                                ) : file.assigneeMode === 'specific' ? (
                                                    memo.assignments && memo.assignments.length > 0 ? (
                                                        <div className="mt-2 shrink-0">
                                                            <strong className="text-base" style={{ color: "var(--header)" }}>การมอบหมายงาน/ความรับผิดชอบ:</strong>
                                                            <div className="flex flex-col gap-4 mt-3">
                                                                {memo.assignments.map((assignment: ResponsibilityAssignment, idx: number) => (
                                                                    <div key={idx} className=" p-4 rounded-lg border shrink-0 text-foreground bg-(--container) border-(--shadow)">
                                                                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                                                                            <p className="font-bold text-base text-green-700">
                                                                                สกัดจากเอกสาร: {assignment.responsible_person || 'ไม่ระบุ'}
                                                                            </p>
                                                                            
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs font-bold text-(--blueText) shrink-0">มอบหมายให้:</span>
                                                                                <select 
                                                                                    className="p-2 border border-(--blueText) rounded text-sm bg-(--button) focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto min-h-10 shrink-0 text-black"
                                                                                    value={assignment.user_id || ""}
                                                                                    onChange={(e) => handleUserSelect(fileIdx, index, idx, e.target.value)}
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
                                                                                <button type="button" onClick={() => handleAddTopic(fileIdx, index, userId)} className="text-xs bg-blue-500 text-white px-2 py-1.5 rounded hover:bg-blue-600 font-medium">+ เพิ่มงานที่ต้องทำ</button>
                                                                            </div>
                                                                            <ul className="list-none pl-1 mt-2 text-gray-700 flex flex-col gap-2">
                                                                                {assignment.topics && assignment.topics.length > 0 ? assignment.topics.map((topic: string, topicIdx: number) => (
                                                                                    <li key={topicIdx} className="flex gap-2 items-center">
                                                                                        <span className="text-gray-500 text-lg font-bold w-4">•</span>
                                                                                        <input type="text" className="border border-gray-300 p-2 rounded flex-1 text-sm outline-none bg-(--button) focus:ring-1 focus:ring-blue-400 w-full" placeholder="ระบุสิ่งที่ต้องดำเนินการ..." value={topic} onChange={(e) => handleTopicChange(fileIdx, index, userId, topicIdx, e.target.value)} />
                                                                                        <button type="button" onClick={() => handleRemoveTopic(fileIdx, index, userId, topicIdx)} className="text-red-500 hover:bg-red-50 p-2 rounded text-lg font-bold shrink-0">✕</button>
                                                                                    </li>
                                                                                )) : <li className="text-gray-400 text-sm">- ยังไม่มีสิ่งที่ต้องดำเนินการ -</li>}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-center py-8">เอกสารมีข้อมูลไม่ครบถ้วน จึงถูกคัดกรองออก</div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-400 text-center flex items-center justify-center h-full py-10 bg-(--container) rounded-lg border border-(--shadow)">ยังไม่มีข้อมูล กรุณาอัพโหลดเอกสารเพื่อสแกน</div>
                )}
            </div>
            
            <div className="flex flex-col md:flex-row md:justify-end gap-4 shrink-0">
                <button className={styles.Button} style={{ background: "var(--wrapper)", borderColor: "var(--shadow)" }} onClick={() => router.push('/')}>กลับหน้าหลัก</button>
                <button className={styles.Button} onClick={handleConfirm} disabled={isSaving || filesData.length === 0} style={{ opacity: isSaving || filesData.length === 0 ? 0.6 : 1 }}>{isSaving ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันเพิ่มงานติดตาม'}</button>
            </div>
        </div>
    );
}