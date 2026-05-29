"use client";

import { useState, useEffect, useRef } from "react";
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

    const [statusFilter, setStatusFilter] = useState("all");
    
    // 💡 เปลี่ยนมาเก็บเป็น Array สำหรับรองรับ Multi-select
    const [personFilter, setPersonFilter] = useState<string[]>([]); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // 💡 ปิด Dropdown อัตโนมัติเมื่อคลิกข้างนอกพื้นที่
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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

    // 💡 จัดการคลิกเลือก/เอาออก รายชื่อคนรับผิดชอบ
    const handlePersonToggle = (person: string) => {
        setPersonFilter((prev) =>
            prev.includes(person)
                ? prev.filter((p) => p !== person) // เอาออกถ้าติ๊กซ้ำ
                : [...prev, person] // เพิ่มเข้าถ้ายังไม่มี
        );
    };

    const filteredTasks = tasks
    .filter((task) => {
        const matchStatus = statusFilter === "all" || task.status === statusFilter;

        // 💡 ปรับปรุงการ Filter: ค้นหาว่าในงานชิ้นนี้มีรายชื่อตรงกับคนที่เราเลือกไว้บ้างไหม
        const taskPersons = task.personInCharge 
            ? task.personInCharge.split(',').map((s: string) => s.trim()) 
            : [];

        const matchPerson =
            personFilter.length === 0 || // ถ้าไม่ได้เลือกใครเลย = แสดงทั้งหมด (เหมือนตอนเป็น "all")
            taskPersons.includes("ทุกหน่วยงาน") ||
            taskPersons.some((p:string) => personFilter.includes(p)); // ถ้ามีคนรับผิดชอบตรงกับที่สุ่มเลือกแม้แต่คนเดียวให้แสดงผล

        return matchStatus && matchPerson;
    })
    .sort((a, b) => {
        const isACompleted = a.status === "completed" || a.status === "เสร็จสิ้น";
        const isBCompleted = b.status === "completed" || b.status === "เสร็จสิ้น";

        if (isACompleted !== isBCompleted) {
            return isACompleted ? 1 : -1;
        }

        const parseTaskDate = (dateStr: string) => {
            if (!dateStr) return 0;
            const parts = dateStr.split('-');
            let year = parseInt(parts[0], 10);
            if (year > 2400) year = year - 543;
            
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
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h1 className={styles.Header}>งานติดตามทั้งหมด</h1>
                <Link 
                    href={'/addFile'} 
                    aria-label="ไปหน้าเพิ่มงานติดตามใหม่" 
                    className={styles.Button} 
                    style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: '48px', 
                        padding: '0 24px',
                        margin: '4px 0', 
                        textDecoration: 'none'
                    }}
                >
                    + เพิ่มงานติดตาม
                </Link>
            </div>

            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        {/* Group 1: สถานะ */}
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

                        {/* 💡 Group 2: สำหรับ (ปรับใช้ Class จาก CSS Module แทน Inline Style) */}
                        <div className={styles.FilterGroup} ref={dropdownRef}>
                            <strong>สำหรับ:</strong>
                            <div className={styles.MultiSelectContainer}>
                                <div 
                                    className={styles.MultiSelectTrigger} 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className={styles.TriggerText}>
                                        {personFilter.length === 0 
                                            ? "ทุกคน" 
                                            : `เลือกแล้ว (${personFilter.length} คน): ${personFilter.join(', ')}`}
                                    </span>
                                    <span className={styles.ArrowIcon} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                                        ▼
                                    </span>
                                </div>

                                {/* หน้าต่างรายการชื่อที่จะโผล่ขึ้นมาตอนกดเลือก */}
                                {isDropdownOpen && (
                                    <div className={styles.MultiSelectMenu}>
                                        {/* ตัวเลือก ล้างการเลือกทั้งหมด */}
                                        {personFilter.length > 0 && (
                                            <div 
                                                onClick={() => setPersonFilter([])}
                                                className={styles.ClearAllButton}
                                            >
                                                ✕ ล้างทั้งหมด (เลือกทุกคน)
                                            </div>
                                        )}
                                        {/* วนลูปรายชื่อพร้อมช่องติ๊กถูก */}
                                        {uniquePersons.map((person, idx) => {
                                            const isChecked = personFilter.includes(person);
                                            return (
                                                <label 
                                                    key={idx} 
                                                    className={styles.CheckboxOption}
                                                    style={{ backgroundColor: isChecked ? 'var(--greenBG)' : 'transparent' }} // ไฮไลท์สีฟ้าอ่อนเมื่อถูกติ๊ก
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isChecked}
                                                        onChange={() => handlePersonToggle(person)}
                                                        className={styles.CheckboxInput}
                                                    />
                                                    <span>{person}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <hr className={styles.Line} />
                    
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