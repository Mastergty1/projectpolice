"use client";

import { useState, useEffect } from "react";
import TaskDisplayer from "./TaskDisplayer";
import styles from "./TaskDisplayer.module.css";
import Link from "next/link";

type TaskStatus = "following" | "problem" | "completed";

export default function AllTask() {
    const initialTaskData = [
        { id: "1", name: "ชื่องานติดตาม", personInCharge: "ชื่อชั่วคราว", date: "2026-05-22", status: "following" },
        { id: "2", name: "งานใหม่", personInCharge: "สมชาย", date: "2026-05-25", status: "problem" },
    ];

    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State สำหรับ Dropdown Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [personFilter, setPersonFilter] = useState("all");

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
                const response = await fetch(`${backendUrl}/api/v1/tasks`);
                
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
        fetchTasks();
    }, []);

    const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
            
            const response = await fetch(`${backendUrl}/api/v1/tasks/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Failed to update status in database");
            }

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

    // 💡 แก้ไขข้อ 3: แยกชื่อที่ติดกันด้วยคอมม่า (,) ออกเป็นแต่ละคนแบบไม่ซ้ำ
    const allPersons = tasks.flatMap(t => {
        if (!t.personInCharge) return [];
        return t.personInCharge.split(',').map((s: string) => s.trim()).filter(Boolean);
    });
    const uniquePersons = Array.from(new Set(allPersons));

    const filteredTasks = tasks.filter((task) => {
        if (task.status === "completed") {
            return false;
        }

        const matchStatus =
            statusFilter === "all" || task.status === statusFilter;

        // 💡 แก้ไขให้ค้นหาชื่อแบบแยกทีละคนเวลากรอง
        const matchPerson =
            personFilter === "all" ||
            (task.personInCharge &&
                task.personInCharge.split(',').map((s: string) => s.trim()).includes(personFilter));

        return matchStatus && matchPerson;
    });

    return (
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h1 className={styles.Header}>งานติดตามทั้งหมด</h1>
                <Link href={'/addFile'}>
                    <button className={styles.Button}>+ เพิ่มงานติดตาม</button>
                </Link>
            </div>

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
                    <hr className={styles.Line} />
                    
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