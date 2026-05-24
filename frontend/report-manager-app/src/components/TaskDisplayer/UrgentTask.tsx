"use client"

import AllTaskItem from "../TaskContent/AllTaskItem";
import TaskDisplayer from "./TaskDisplayer";
import styles from "./TaskDisplayer.module.css"
import { useState } from "react";



type TaskStatus = "following" | "problem" | "completed";

export default function UrgenTask(){

    const initialTaskData = [
        {
            id: "1",
            name: "ชื่องานติดตาม",
            personInCharge: "ชื่อชั่วคราว",
            date: "2026-05-23",
            status: "กำลังติดตาม",
        },
        {
            id: "2",
            name: "งานใหม่",
            personInCharge: "สมชาย",
            date: "2026-05-25",
            status: "เสร็จสิ้น",
        },
        {
            id: "3",
            name: "ชื่องานติดตาม",
            personInCharge: "ชื่อชั่วคราว",
            date: "2026-05-21",
            status: "กำลังติดตาม",
        },
        {
            id: "4",
            name: "ชื่องานติดตาม",
            personInCharge: "ชื่อชั่วคราว",
            date: "2026-05-24",
            status: "กำลังติดตาม",
        },
    ];

        const [tasks, setTasks] =
            useState(initialTaskData);
    
        const handleStatusChange = async (
            id: string,
            newStatus: TaskStatus
        ) => {
    
            try {
    
                console.log(
                    "Updating task:",
                    id,
                    newStatus
                );
    
                // API delay
                await new Promise((resolve) =>
                    setTimeout(resolve, 500)
                );
    
                // remove completed task
                if (newStatus === "completed") {
    
                    setTasks((prevTasks) =>
                        prevTasks.filter(
                            (task) => task.id !== id
                        )
                    );
    
                    return;
                }
    
                // update status
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === id
                            ? {
                                  ...task,
                                  status: newStatus,
                              }
                            : task
                    )
                );
    
            } catch (error) {
    
                console.error(
                    "Failed to update task",
                    error
                );
            }
        };

    return(
        <div className="flex flex-col w-full h-full gap-[1.5rem] min-h-[300px]">
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
                    <TaskDisplayer tasks={tasks} onStatusChange={handleStatusChange} />
                </div>
            </div>
        </div>
    );
}