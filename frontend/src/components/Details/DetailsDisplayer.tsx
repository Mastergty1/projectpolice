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

    const handleToggleComplete = async (assignIndex: number, topicIndex: number) => {
        const newAssignments = [...taskData.assignments];
        const currentStatus = newAssignments[assignIndex].topics[topicIndex].is_completed || false;
        newAssignments[assignIndex].topics[topicIndex].is_completed = !currentStatus;
        
        setTaskData({ ...taskData, assignments: newAssignments });

        if (!isEditing && (taskData.id || taskData._id)) {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
                await fetch(`${backendUrl}/api/v1/tasks/${taskData.id || taskData._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    // 💡 ส่งข้อมูลทั้งหมดกลับไปกันโดนลบ
                    body: JSON.stringify({ 
                        name: taskData.name, 
                        date: taskData.date, 
                        notes: taskData.notes,
                        assignments: newAssignments 
                    }),
                });
            } catch (error) {
                console.error("Error auto-saving task completion:", error);
            }
        }
    };

    const handleAddTopic = (assignIndex: number) => {
        const newAssignments = [...taskData.assignments];
        if (!newAssignments[assignIndex].topics) {
            newAssignments[assignIndex].topics = [];
        }
        newAssignments[assignIndex].topics.push({ detail: "", is_completed: false });
        setTaskData({ ...taskData, assignments: newAssignments });
    };

    const handleDeleteTopic = (assignIndex: number, topicIndex: number) => {
        const newAssignments = [...taskData.assignments];
        newAssignments[assignIndex].topics.splice(topicIndex, 1);
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
                            {taskData?.assignments?.length > 0 ? taskData.assignments.map((assign: any, index: number) => {
                                const isAssignCompleted = assign.topics?.length > 0 && assign.topics.every((t: any) => t.is_completed);

                                return (
                                    <div key={index} className={`flex flex-col gap-4 p-5 rounded-lg border-2 shadow-sm transition ${isAssignCompleted ? "bg-green-50 border-green-300" : ""}`} style={!isAssignCompleted ? { backgroundColor: "var(--button)", borderColor: "var(--wrapper)" } : {}}>
                                        
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-row items-center gap-2">
                                                <h3 className="font-semibold text-lg" style={{ color: isAssignCompleted ? "#166534" : "var(--header)" }}>สิ่งที่ต้องดำเนินการ:</h3>
                                                {isAssignCompleted && (
                                                    <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded shadow-sm">
                                                        ✅ งานส่วนนี้เสร็จสิ้นแล้ว
                                                    </span>
                                                )}
                                            </div>

                                            <ul className="list-none ml-0 flex flex-col gap-3" style={{ color: isAssignCompleted ? "#166534" : "var(--header)" }}>
                                                {assign.topics?.length > 0 ? assign.topics.map((topic: any, i: number) => (
                                                    <li key={i} className="text-sm flex items-start gap-2">
                                                        
                                                        <input 
                                                            type="checkbox"
                                                            className="mt-1 w-5 h-5 cursor-pointer accent-blue-600"
                                                            checked={topic.is_completed || false}
                                                            onChange={() => handleToggleComplete(index, i)}
                                                        />

                                                        {isEditing ? (
                                                            <div className="flex w-full gap-2 items-center flex-wrap sm:flex-nowrap">
                                                                <input 
                                                                    type="text" 
                                                                    className="p-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full outline-none font-medium"
                                                                    value={topic.detail || ""}
                                                                    onChange={(e) => handleTopicChange(index, i, e.target.value)}
                                                                    placeholder="รายละเอียดงาน..."
                                                                />
                                                                <button 
                                                                    className="px-3 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600 transition min-w-max"
                                                                    onClick={() => handleDeleteTopic(index, i)}
                                                                >
                                                                    ลบ
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className={`flex-1 text-base leading-relaxed ${topic.is_completed ? "line-through opacity-60" : ""}`}>
                                                                {topic.detail || "ไม่มีรายละเอียดเฉพาะ"}
                                                            </span>
                                                        )}
                                                    </li>
                                                )) : <li className="text-gray-500">ไม่มีรายละเอียดเฉพาะ</li>}
                                            </ul>
                                            
                                            {isEditing && (
                                                <button 
                                                    className="mt-2 px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition w-fit text-sm shadow"
                                                    onClick={() => handleAddTopic(index)}
                                                >
                                                    + เพิ่มหัวข้อย่อย
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-gray-300 border-opacity-40">
                                            <label className="font-semibold" style={{ color: isAssignCompleted ? "#166534" : "var(--header)" }}>สำหรับ (ผู้รับผิดชอบ)</label>
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
                                                <p className="text-gray-100 bg-(--wrapper) p-2 rounded border border-gray-600 font-medium inline-block w-fit" style={isAssignCompleted ? { backgroundColor: "#15803d", borderColor: "#14532d", color: "#fff" } : {}}>
                                                    {assign.personInCharge || "ไม่ระบุ"}
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                );
                            }) : (
                                <p style={{ color: "var(--header)" }}>ไม่มีข้อมูลงานที่ตรวจพบ</p>
                            )}
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}