"use client";

import { useState, useEffect } from "react";
import TaskDisplayer from "./TaskDisplayer";
import styles from "./TaskDisplayer.module.css";

type TaskStatus = "following" | "problem" | "completed";

export default function UrgentTask() {
    const initialTaskData = [
        { id: "1", name: "ชื่องานด่วนมาก", personInCharge: "ไม่มีข้อมูล", date: "2026-05-21", status: "following" },
    ];

    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State สำหรับ Dropdown Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [personFilter, setPersonFilter] = useState("all");

    // ดึงข้อมูลงานด่วนจาก Database
    useEffect(() => {
        const fetchUrgentTasks = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
                // 💡 จุดสำคัญ: ดึงจากเส้นทาง /urgent
                const response = await fetch(`${backendUrl}/api/v1/tasks/urgent`);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) setTasks(data);
                    else setTasks(initialTaskData);
                } else {
                    setTasks(initialTaskData);
                }
            } catch (error) {
                setTasks(initialTaskData);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUrgentTasks();
    }, []);

    const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
            
            // 1. ยิง API ของจริงไปอัปเดตที่ Database
            const response = await fetch(`${backendUrl}/api/v1/tasks/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Failed to update status in database");
            }

            // 2. อัปเดตหน้า UI หลังจาก Database ยืนยันว่าบันทึกสำเร็จ
            if (newStatus === "completed") {
                setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
                return;
            }
            
            setTasks((prevTasks) =>
                prevTasks.map((task) => task.id === id ? { ...task, status: newStatus } : task)
            );
        } catch (error) {
            console.error("Failed to update task", error);
            alert("เกิดข้อผิดพลาด ไม่สามารถอัปเดตสถานะได้");
        }
    };

    // รายชื่อคนทั้งหมดสำหรับ Dropdown (กรองชื่อซ้ำออก)
    const uniquePersons = Array.from(new Set(tasks.map(t => t.personInCharge).filter(Boolean)));

    // กรองข้อมูลตามที่เลือกก่อนส่งไปแสดงผล
    const filteredTasks = tasks.filter((task) => {
        const matchStatus = statusFilter === "all" || task.status === statusFilter;
        // ใช้ includes เผื่อกรณีที่มีชื่อคนรับผิดชอบหลายคนต่อกันด้วยลูกน้ำ
        const matchPerson = personFilter === "all" || (task.personInCharge && task.personInCharge.includes(personFilter));
        return matchStatus && matchPerson;
    });

    return (
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <h1 className={styles.Header}>งานติดตามเร่งด่วน</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        
                            <strong>สถานะ:</strong>
                            <select 
                                className={styles.Dropdown}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="following">กำลังติดตาม</option>
                                <option value="problem">เกิดปัญหา</option>
                            </select>

                            <strong>สำหรับ:</strong>
                            <select 
                                className={styles.Dropdown}
                                value={personFilter}
                                onChange={(e) => setPersonFilter(e.target.value)}
                            >
                                <option value="all">ทุกคน</option>
                                {uniquePersons.map((person: any, idx) => (
                                    <option key={idx} value={person}>{person}</option>
                                ))}
                            </select>
                    </div>
                    <hr className={styles.Line}></hr>
                    
                    {isLoading ? (
                        <div className="text-center p-4 text-gray-500">กำลังโหลดข้อมูล...</div>
                    ) : (
                        <TaskDisplayer tasks={filteredTasks} onStatusChange={handleStatusChange} />
                    )}
                </div>
            </div>
        </div>
    );
}