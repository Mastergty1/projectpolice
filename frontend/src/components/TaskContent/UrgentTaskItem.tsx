"use client"

import TaskDisplayer from "../TaskDisplayer/TaskDisplayer"; // (ตรวจสอบ Path import ตรงนี้ให้ดีด้วยครับ)
import styles from "./TaskDisplayer.module.css"
import { useState, useEffect } from "react";

type TaskStatus = "following" | "problem" | "completed";

export default function UrgenTask(){
    const initialTaskData = [
        { id: "1", name: "ชื่องานด่วนมาก", personInCharge: "ชื่อชั่วคราว", date: "2026-05-21", status: "following" },
    ];

    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
            await new Promise((resolve) => setTimeout(resolve, 500));
            if (newStatus === "completed") {
                setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
                return;
            }
            setTasks((prevTasks) =>
                prevTasks.map((task) => task.id === id ? { ...task, status: newStatus } : task)
            );
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    return(
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <h1 className={styles.Header}>งานติดตามเร่งด่วน</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <strong>สำหรับ</strong>
                            <button className={styles.Dropdown}>dropdown placeholder</button>
                        </div>
                    </div>
                    <hr className={styles.Line}></hr>
                    
                    {isLoading ? (
                        <div className="text-center p-4 text-gray-500">กำลังโหลดข้อมูล...</div>
                    ) : (
                        <TaskDisplayer tasks={tasks} onStatusChange={handleStatusChange} />
                    )}
                </div>
            </div>
        </div>
    );
}