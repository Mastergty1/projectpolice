"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./TaskDisplayer.module.css"; 

type PersonMultiSelectProps = {
    uniquePersons: string[];
    personFilter: string[];
    setPersonFilter: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function PersonMultiSelect({
    uniquePersons,
    personFilter,
    setPersonFilter
}: PersonMultiSelectProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // 💡 FIX: เพิ่ม State เก็บรายชื่อคนจาก Database ทั้งหมด
    const [dbUsers, setDbUsers] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ดึง User ทั้งหมดจาก Database เพื่อโชว์ใน Dropdown
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : "";
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
                const res = await fetch(`${backendUrl}/api/v1/users`, {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { "Authorization": `Bearer ${token}` } : {})
                    }
                });
                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data) {
                        setDbUsers(result.data.map((u: any) => u.name));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch all users for dropdown", err);
            }
        };
        fetchAllUsers();
    }, []);

    // ดักจับการคลิกนอกพื้นที่เพื่อปิด Dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePersonToggle = (person: string) => {
        setPersonFilter((prev) =>
            prev.includes(person)
                ? prev.filter((p) => p !== person)
                : [...prev, person]
        );
    };

    // 💡 FIX: รวมรายชื่อทั้งจาก Task (uniquePersons) และจาก Database เข้าด้วยกัน โดยตัดตัวซ้ำออก
    const allDisplayPersons = Array.from(new Set([...uniquePersons, ...dbUsers, 'ไม่ระบุ']));

    return (
        <div className={styles.FilterGroup} ref={dropdownRef}>
            <strong>แสดงสำหรับ:</strong>
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

                {isDropdownOpen && (
                    <div className={styles.MultiSelectMenu}>
                        {personFilter.length > 0 && (
                            <div 
                                onClick={() => setPersonFilter([])}
                                className={styles.ClearAllButton}
                            >
                                ✕ ล้างทั้งหมด (เลือกทุกคน)
                            </div>
                        )}
                        {allDisplayPersons.map((person, idx) => {
                            const isChecked = personFilter.includes(person);
                            return (
                                <label 
                                    key={idx} 
                                    className={styles.CheckboxOption}
                                    style={{ backgroundColor: isChecked ? 'var(--greenBG, #e6f7ff)' : 'transparent' }}
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
    );
}