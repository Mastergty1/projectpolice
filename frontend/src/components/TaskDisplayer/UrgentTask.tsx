"use client";

import { useState, useEffect } from "react";
import TaskDisplayer from "./TaskDisplayer";
import styles from "./TaskDisplayer.module.css";
import PersonMultiSelect from "./PersonMultiSelect";

type TaskStatus = "following" | "problem" | "completed";

export default function UrgentTask() {
    // 💡 เพิ่มข้อมูลสีจำลองและวันที่สร้าง กรณีที่หลังบ้าน (Database) โหลดไม่ติด
    const initialTaskData = [
        { 
            id: "0", 
            name: "ชื่องานด่วนมาก", 
            personInCharge: "ผู้ดูแลระบบ", 
            date: "2026-05-21", 
            status: "following",
            createdAt: new Date().toISOString(), // 💡 เพิ่ม createdAt
            assigneesData: [{ name: "ผู้ดูแลระบบ", color: "#fca5a5" }] // 💡 เพิ่มข้อมูลสี
        },
    ];

    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("all");
    
    const [personFilter, setPersonFilter] = useState<string[]>([]); 

    useEffect(() => {
        const fetchUrgentTasks = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
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
            const response = await fetch(`${backendUrl}/api/v1/tasks/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error("Failed to update status in database");

            setTasks((prevTasks) =>
                prevTasks.map((task) => task.id === id ? { ...task, status: newStatus } : task)
            );
        } catch (error) {
            console.error("Failed to update task", error);
            alert("เกิดข้อผิดพลาด ไม่สามารถอัปเดตสถานะได้");
        }
    };

    const allPersons = tasks.flatMap(t => {
        if (!t.personInCharge) return [];
        return t.personInCharge.split(',').map((s: string) => s.trim()).filter(Boolean);
    });
    const uniquePersons = Array.from(new Set(allPersons));

    const filteredTasks = tasks.filter((task) => {
        if (task.status === "completed") return false; // กรองงานที่ completed ออกก่อน
        const matchStatus = statusFilter === "all" || task.status === statusFilter;
        
        const taskPersons = task.personInCharge 
            ? task.personInCharge.split(',').map((s: string) => s.trim()) 
            : [];

        const matchPerson =
            personFilter.length === 0 || // ไม่เลือกใครเลย = แสดงทั้งหมด
            taskPersons.includes("ทุกหน่วยงาน") ||
            taskPersons.some((p: string) => personFilter.includes(p)); // ตรงกับคนใดคนหนึ่งที่เลือก

        return matchStatus && matchPerson;
    }).sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        
        const parseTaskDate = (dateStr: string) => {
            if (!dateStr) return 0;
            const parts = dateStr.split('-');
            let year = parseInt(parts[0], 10);
            
            if (year > 2400) {
                year = year - 543;
            }
            
            const normalizedDateStr = `${year}-${parts[1]}-${parts[2]}`;
            const time = new Date(normalizedDateStr).getTime();
            return isNaN(time) ? 0 : time;
        };

        const dateA = parseTaskDate(a.date);
        const dateB = parseTaskDate(b.date);
        return dateA - dateB;
    });

    return (
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <h1 className={styles.Header}>งานติดตามเร่งด่วน</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        <div className={styles.FilterGroup}>
                            <strong>สถานะ:</strong>
                            <select 
                                className={styles.Dropdown}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label="ตัวกรองสถานะงาน"
                                style={{ minHeight: '44px' }}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="following">กำลังติดตาม</option>
                                <option value="problem">เกิดปัญหา</option>
                                <option value="completed">เสร็จสิ้น</option>
                            </select>
                        </div>

                        <PersonMultiSelect 
                            uniquePersons={uniquePersons}
                            personFilter={personFilter}
                            setPersonFilter={setPersonFilter}
                        />
                    
                    </div>
                    <hr className={styles.Line}></hr>
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center w-full text-gray-500 font-bold" style={{ minHeight: '500px' }}>
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : (
                        <TaskDisplayer tasks={filteredTasks} onStatusChange={handleStatusChange} />
                    )}
                </div>
            </div>
        </div>
    );
}