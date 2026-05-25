import styles from "./Details.module.css"
import { useState } from "react";

export default function DetailsDisplayer({ task }: { task: any }) {
    // เก็บ State การตั้งค่าการติดตามของแต่ละงานที่ถูกสกัดมา
    const [trackConfigs, setTrackConfigs] = useState<any>({});

    const handleSelectChange = (assignmentId: number, field: string, value: string) => {
        setTrackConfigs((prev: any) => ({
            ...prev,
            [assignmentId]: {
                ...prev[assignmentId],
                [field]: value
            }
        }));
    };

    return (
        <div className="flex flex-col w-full h-full gap-6 min-h-120">
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeaderScrollable}>
                        
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--header)" }}>รายละเอียดจากเอกสาร (ข้อความเต็ม)</h2>
                            <div className="p-4 rounded-md" style={{ backgroundColor: "var(--wrapper)", color: "var(--header)", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                                {task?.main_text || "ไม่พบข้อความเนื้อหาในเอกสาร"}
                            </div>
                        </div>

                        <hr className="border-gray-500 mb-6 opacity-30" />

                        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--header)" }}>งานติดตามที่ตรวจอ่านได้</h2>
                        
                        <div className="flex flex-col gap-6">
                            {task?.assignments?.length > 0 ? task.assignments.map((assign: any, index: number) => (
                                <div key={index} className="flex flex-col gap-4 p-5 rounded-lg border-2 shadow-sm" style={{ backgroundColor: "var(--button)", borderColor: "var(--wrapper)" }}>
                                    
                                    <div className="flex flex-col gap-2">
                                        <h3 className="font-semibold text-lg" style={{ color: "var(--header)" }}>สิ่งที่ต้องดำเนินการ:</h3>
                                        <ul className="list-disc list-inside ml-2" style={{ color: "var(--header)" }}>
                                            {assign.topics?.length > 0 ? assign.topics.map((topic: string, i: number) => (
                                                <li key={i}>{topic}</li>
                                            )) : <li>ไม่มีรายละเอียดเฉพาะ</li>}
                                        </ul>
                                    </div>

                                    {/* กล่องตั้งค่าการติดตาม */}
                                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                        <div className="flex flex-col flex-1 gap-2">
                                            <label className="font-semibold" style={{ color: "var(--header)" }}>ต้องติดตามใน (ระยะเวลา)</label>
                                            <select 
                                                className={styles.CustomSelect}
                                                value={trackConfigs[assign.assignment_id]?.duration || "3"}
                                                onChange={(e) => handleSelectChange(assign.assignment_id, "duration", e.target.value)}
                                            >
                                                <option value="1">1 วัน</option>
                                                <option value="3">3 วัน</option>
                                                <option value="7">7 วัน</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col flex-1 gap-2">
                                            <label className="font-semibold" style={{ color: "var(--header)" }}>สำหรับ (ผู้รับผิดชอบ)</label>
                                            <select 
                                                className={styles.CustomSelect}
                                                value={trackConfigs[assign.assignment_id]?.responsible || "all"}
                                                onChange={(e) => handleSelectChange(assign.assignment_id, "responsible", e.target.value)}
                                            >
                                                <option value="all">ทุกหน่วยงาน</option>
                                                {assign.personInCharge && assign.personInCharge !== "ไม่ระบุ" && (
                                                    <option value={assign.personInCharge}>{assign.personInCharge}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                </div>
                            )) : (
                                <p style={{ color: "var(--header)" }}>ไม่มีข้อมูลงานที่ตรวจพบ</p>
                            )}
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}