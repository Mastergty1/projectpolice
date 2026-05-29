"use client"

import styles from "./TaskItem.module.css"
import Select from "react-select";
import { useState, useEffect } from "react";
import Link from "next/link";

type AssigneeData = {
  name: string;
  color: string;
};

type TaskItemProps = {
  date: string;
  createdAt?: string; 
  name: string;
  personInCharge: string;
  assigneesData?: AssigneeData[]; 
  status: string;
  id: string;
  onStatusChange: (id: string, status: TaskStatus) => void;
};

type TaskStatus = "following" | "problem" | "completed";

type StatusOption = {
  value: TaskStatus;
  label: string;
};

export default function AllTaskItem({date, createdAt, name, personInCharge, assigneesData, status, id, onStatusChange}:TaskItemProps){
    
    const parsedDate = new Date(date);
    const day = parsedDate.getDate();
    const monthYear = parsedDate.toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric",
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDateForDiff = new Date(parsedDate);
    dueDateForDiff.setHours(0, 0, 0, 0);

    const diffTime = dueDateForDiff.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let urgency = "";
    let theme;
    let progressColor = "bg-green-500"; 

    if (diffDays < 0) {
        urgency = "late"; theme = styles.DateGrey; progressColor = "bg-gray-500";
    } else if (diffDays === 0) {
        urgency = "today"; theme = styles.DateRed; progressColor = "bg-red-500";
    } else if (diffDays === 1) {
        urgency = "tommorrow"; theme = styles.DateOrange; progressColor = "bg-orange-500";
    } else if (diffDays <= 7) {
        urgency = "this week"; theme = styles.DateYellow; progressColor = "bg-yellow-400";
    } else {
        urgency = "later"; theme = styles.DateGreen; progressColor = "bg-green-500";
    }

    // 💡 คำนวณความคืบหน้าของ Progress Bar สมเหตุสมผลด้วยเปอร์เซ็นต์
    let progressPercent = 0;
    const nowTime = new Date().getTime();
    const dueTime = parsedDate.getTime();

    if (createdAt) {
        const createdTime = new Date(createdAt).getTime();
        
        // ตรวจสอบเพื่อป้องกัน NaN
        if (!isNaN(createdTime) && !isNaN(dueTime)) {
            const totalDuration = dueTime - createdTime; // เวลาส่ง - เวลาสร้าง
            const elapsed = nowTime - createdTime;       // เวลาปัจจุบัน - เวลาสร้าง
            
            if (totalDuration > 0) {
                progressPercent = (elapsed / totalDuration) * 100;
            } else {
                progressPercent = 100; // กรณีระยะเวลาติดลบหรือ 0 (ถึงกำหนดแล้วตั้งแต่สร้าง)
            }
        }
    } else {
        // Fallback กรณีไม่มี Date สร้าง ให้ประเมินจากวันเหลือโดยประมาณการ
        progressPercent = diffDays <= 0 ? 100 : Math.max(0, 100 - (diffDays * 10));
    }

    // ป้องกันค่าแปลกๆ และบังคับให้อยู่ในช่วง 0 - 100 เสมอ
    if (isNaN(progressPercent)) progressPercent = 0;
    progressPercent = Math.max(0, Math.min(100, progressPercent));

    const [taskStatus, setStatus] = useState<TaskStatus>((status as TaskStatus) || "following");

    useEffect(() => {
        if (status) {
            setStatus(status as TaskStatus);
        }
    }, [status]);

    const statusOption: StatusOption[] = [
        { value: "following", label: "กำลังติดตาม" },
        { value: "problem", label: "เกิดปัญหา" },
        { value: "completed", label: "เสร็จสิ้น" },
    ];

    const selectThemeMap = {
        following: { color: "var(--yellowText)", bg: "var(--yellowBG)", border: "var(--yellowBorder)" },
        problem: { color: "var(--redText)", bg: "var(--redBG)", border: "var(--redBorder)" },
        completed: { color: "var(--greenText)", bg: "var(--greenBG)", border: "var(--greenBorder)" },
    } as const;

    const themeStyle = selectThemeMap[taskStatus] || selectThemeMap.following;

    const getTextColor = (bgColor: string) => {
        if (!bgColor || !bgColor.startsWith('#')) return '#1f2937'; 
        const hex = bgColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#1f2937' : '#ffffff';
    };
    
    return(
        <div className={styles.TaskWrapper}>
            <div className={styles.InnerWrapper}>
                <div className={styles.InfoContainer}>
                <div className={`${styles.DateDisplayer} ${theme}`}>
                    <span>กำหนดติดตาม</span>
                    <span className={styles.DateNumber}>{day}</span>
                    <span className={styles.DateMonth}>{monthYear}</span>
                </div>

                <div className={`${styles.Content} w-full`}>
                <h1 className={styles.Header} title={name}>{name}</h1>
                <div className={`${styles.DetailContainer} mt-2 w-full pr-4 flex flex-col`}>
                    
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                        <strong className="mt-0.5 whitespace-nowrap text-sm">ผู้รับผิดชอบ: </strong> 
                        <div className="flex flex-wrap gap-1.5">
                            {assigneesData && assigneesData.length > 0 ? (
                                assigneesData.map((assignee, idx) => (
                                    <span 
                                        key={idx} 
                                        style={{ backgroundColor: assignee.color, color: getTextColor(assignee.color) }} 
                                        className="px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-bold whitespace-nowrap shadow-sm border border-black/10"
                                    >
                                        {assignee.name}
                                    </span>
                                ))
                            ) : (
                                personInCharge.split(',').map((person, idx) => (
                                    <span key={idx} className="px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-bold whitespace-nowrap shadow-sm bg-gray-200 text-gray-700">
                                        {person.trim()}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    <p className="flex flex-col sm:flex-row mb-1 text-sm">
                        <strong>สถานะระยะเวลา: &nbsp; </strong>  
                        {diffDays < 0
                            ? `เกินกำหนด ${Math.abs(diffDays)} วัน`
                            : diffDays === 0
                            ? "ครบกำหนดวันนี้"
                            : `เหลืออีก ${diffDays} วัน`}
                    </p>

                    {/* 💡 บังคับความยาวหลอดคงที่ และกางเต็มร้อยเปอร์เซ็นของ Container */}
                    <div className="w-full shrink-0 block bg-gray-200 rounded-full h-2.5 mt-2 border border-gray-300 overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ease-in-out ${progressColor}`} 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>

                </div>
                </div>
                </div>

                <div className={styles.ButtonContainer}>
                    <div className={styles.SelectWrapper}>
                        <Select
                            instanceId={`task-status-${id}`}
                            options={statusOption}
                            aria-label={`อัปเดตสถานะงานของ ${name}`}
                            value={statusOption.find((option) => option.value === taskStatus) || statusOption[0]}
                            isClearable={false}
                            onChange={(selectedOption) => {
                                const newStatus = selectedOption!.value;
                                setStatus(newStatus);
                                onStatusChange(id, newStatus);
                            }}
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            isSearchable={false}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    padding: "0.2rem 0.5rem",
                                    boxShadow: "none", 
                                    borderRadius: "0.7rem",
                                    backgroundColor: themeStyle.bg,
                                    border: `2px solid ${themeStyle.border}`,
                                    color: themeStyle.color,
                                    minHeight: "44px", 
                                    cursor: "pointer",
                                }),
                                menuPortal: (base) => ({ ...base, zIndex: 999999 }),
                                menu: (base) => ({ ...base, zIndex: 999999 }),
                                singleValue: (base) => ({
                                    ...base,
                                    whiteSpace: "normal",
                                    overflowWrap: "break-word",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    color: themeStyle.color
                                }),
                                dropdownIndicator: (base) => ({ ...base, color: themeStyle.color }),
                                indicatorSeparator: (base) => ({ ...base, display: "none" }),
                                option: (base, state) => {
                                    const optionStatus = state.data.value as keyof typeof selectThemeMap;
                                    const optionTheme = selectThemeMap[optionStatus] || selectThemeMap.following;
                                    return {
                                        ...base,
                                        backgroundColor: state.isFocused ? optionTheme.bg : "var(--button)",
                                        color: optionTheme.color,
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        ":active": { backgroundColor: optionTheme.bg },
                                    };
                                },
                            }}
                        />
                        </div>

                    <Link href={`/tasks/${id}`} aria-label={`ดูรายละเอียดของงาน ${name} รหัส ${id}`}>
                    <button className={styles.Clickable} tabIndex={-1} style={{ minHeight: "44px" }}> 
                        รายละเอียด 
                    </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}