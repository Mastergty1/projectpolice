import styles from "./Details.module.css"
import { useState, useEffect } from "react";

export default function DetailsDisplayer({ 
    taskData, 
    setTaskData, 
    isEditing 
}: { 
    taskData: any; 
    setTaskData: any; 
    isEditing: boolean; 
}) {
    const [users, setUsers] = useState<any[]>([]);

    // 💡 ดึงข้อมูลรายชื่อผู้ใช้ทั้งหมดมารองรับ Dropdown เลือกผู้รับผิดชอบงานย่อย
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

    const handleUserSelect = (assignIndex: number, userId: string) => {
        const newAssignments = [...taskData.assignments];
        newAssignments[assignIndex].user_id = userId;
        
        // อัปเดตข้อมูลผู้ดูแลชั่วคราวเพื่อให้แสดงผลลัพธ์ได้อย่างถูกต้อง
        const selectedUser = users.find(u => String(u.id || u._id) === String(userId));
        if (selectedUser) {
            newAssignments[assignIndex].personInCharge = selectedUser.name;
        } else {
            newAssignments[assignIndex].personInCharge = "ไม่ระบุ";
        }

        setTaskData({ ...taskData, assignments: newAssignments });
    };

    const handleTopicChange = (assignIndex: number, topicIndex: number, textValue: string) => {
        const newAssignments = [...taskData.assignments];
        newAssignments[assignIndex].topics[topicIndex].detail = textValue;
        setTaskData({ ...taskData, assignments: newAssignments });
    };

    return (
        <div className="flex flex-col w-full h-full gap-6 min-h-120">
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeaderScrollable}>
                        
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2 flex items-center justify-between" style={{ color: "var(--header)" }}>
                                รายละเอียดจากเอกสาร (ข้อความเต็ม)
                            </h2>
                            {taskData?.document_link && (
                                <a 
                                    href={taskData.document_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition w-fit"
                                >
                                    📄 เปิดดูไฟล์เอกสารต้นฉบับ
                                </a>
                            )}
                            <div className="p-4 rounded-md mt-2" style={{ backgroundColor: "var(--wrapper)", color: "var(--header)", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                                {taskData?.main_text || "ไม่พบข้อความเนื้อหาในเอกสาร"}
                            </div>
                        </div>

                        <hr className="border-gray-500 mb-6 opacity-30" />

                        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--header)" }}>งานติดตามที่ตรวจอ่านได้</h2>
                        
                        <div className="flex flex-col gap-6">
                            {taskData?.assignments?.length > 0 ? taskData.assignments.map((assign: any, index: number) => (
                                <div key={index} className="flex flex-col gap-4 p-5 rounded-lg border-2 shadow-sm" style={{ backgroundColor: "var(--button)", borderColor: "var(--wrapper)" }}>
                                    
                                    <div className="flex flex-col gap-2">
                                        <h3 className="font-semibold text-lg" style={{ color: "var(--header)" }}>สิ่งที่ต้องดำเนินการ:</h3>
                                        <ul className="list-disc list-inside ml-2 flex flex-col gap-2" style={{ color: "var(--header)" }}>
                                            {assign.topics?.length > 0 ? assign.topics.map((topic: any, i: number) => (
                                                <li key={i} className="text-sm">
                                                    {/* 💡 หากอยู่ในโหมดแก้ไข จะแปลงเป็น Input ทันที */}
                                                    {isEditing ? (
                                                        <input 
                                                            type="text" 
                                                            className="p-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full mt-1 outline-none font-medium"
                                                            value={topic.detail || ""}
                                                            onChange={(e) => handleTopicChange(index, i, e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{topic.detail || "ไม่มีรายละเอียดเฉพาะ"}</span>
                                                    )}
                                                </li>
                                            )) : <li>ไม่มีรายละเอียดเฉพาะ</li>}
                                        </ul>
                                    </div>

                                    {/* 💡 ปรับปรุงเปลี่ยนจากระยะเวลาของ Mock-up เดิม เป็น Dropdown เลือกพนักงานที่ดูแลจริง */}
                                    <div className="flex flex-col gap-2 mt-2">
                                        <label className="font-semibold" style={{ color: "var(--header)" }}>สำหรับ (ผู้รับผิดชอบ)</label>
                                        {isEditing ? (
                                            <select 
                                                className="p-2 border border-blue-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto text-black font-semibold"
                                                value={assign.user_id || ""}
                                                onChange={(e) => handleUserSelect(index, e.target.value)}
                                            >
                                                <option value="">-- เลือกระบุบุคคล --</option>
                                                {users.map(u => (
                                                    <option key={u.id || u._id} value={u.id || u._id}>
                                                        {u.name} {u.role ? `(${u.role})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-gray-100 bg-(--wrapper) p-2 rounded border border-gray-600 font-medium">
                                                {assign.personInCharge || "ไม่ระบุ"}
                                            </p>
                                        )}
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