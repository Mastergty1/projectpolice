"use client";

import { useState } from "react";

import TaskDisplayer from "./TaskDisplayer";
import styles from "./TaskDisplayer.module.css";
import Link from "next/link";

type TaskStatus =
    | "following"
    | "problem"
    | "completed";

export default function AllTask() {

    const initialTaskData = [
        {
            id: "1",
            name: "ชื่องานติดตาม",
            personInCharge: "ชื่อชั่วคราว",
            date: "2026-05-22",
            status: "following",
        },
        {
            id: "2",
            name: "งานใหม่",
            personInCharge: "สมชาย",
            date: "2026-05-25",
            status: "problem",
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

            // fake API delay
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

    return (
        <div className="flex flex-col w-full h-full gap-[1.5rem] min-h-[300px]">

            <div className="flex flex-col sm:flex-row justify-between gap-4">

                <h1 className={styles.Header}>
                    งานติดตามทั้งหมด
                </h1>
                <Link href={'/addFile'}>
                <button className={styles.Button} >
                    + เพิ่มงานติดตาม
                </button>
                </Link>

            </div>

            <div className={styles.ContentWrapper}>

                <div className={styles.ContentContainer}>

                    <div className={styles.ContentHeader}>

                        <div className="flex flex-col sm:flex-row sm:items-center">

                            <strong>
                                ต้องติดตามใน
                            </strong>

                            <button className={styles.Dropdown}>
                                dropdown placeholder
                            </button>

                            <strong>
                                สำหรับ
                            </strong>

                            <button className={styles.Dropdown}>
                                dropdown placeholder
                            </button>

                        </div>

                    </div>

                    <hr className={styles.Line} />

                    <TaskDisplayer
                        tasks={tasks}
                        onStatusChange={
                            handleStatusChange
                        }
                    />

                </div>

            </div>

        </div>
    );
}