"use client"

import styles from "./Details.module.css"
import Select from "react-select";
import { useState, useEffect } from "react";
import Link from "next/link";

type TaskStatus = "following" | "problem" | "completed";

type TaskItemProps = {
  taskData: any;
  setTaskData: any;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onUpdateTask: () => void;
  onDeleteTask: () => void;
};

type StatusOption = {
  value: TaskStatus;
  label: string;
};

export default function DetailsPanel({
    taskData,
    setTaskData,
    isEditing,
    setIsEditing,
    onStatusChange,
    onUpdateTask,
    onDeleteTask
}: TaskItemProps) {
    const [taskStatus, setStatus] = useState<TaskStatus>((taskData?.status as TaskStatus) || "following");
    
    useEffect(() => {
        if (taskData?.status) setStatus(taskData.status as TaskStatus);
    }, [taskData?.status]);

    const parsedDate = new Date(taskData?.date || "");
    const isValidDate = !isNaN(parsedDate.getTime());

    const day = isValidDate ? parsedDate.getDate() : "-";
    const monthYear = isValidDate ? parsedDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" }) : "ไม่ระบุ";
    const timeText = isValidDate ? parsedDate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "";

    const now = new Date();
    const diffTime = isValidDate ? parsedDate.getTime() - now.getTime() : 0;
    const diffTotalMinutes = Math.floor(diffTime / (1000 * 60));
    const diffTotalHours = Math.floor(diffTotalMinutes / 60);
    const diffDays = Math.floor(diffTotalHours / 24);

    let theme = styles.DateGreen;
    if (!isValidDate) theme = styles.DateGrey;
    else if (diffTotalMinutes < 0) theme = styles.DateGrey;
    else if (diffDays === 0) theme = styles.DateRed;
    else if (diffDays <= 2) theme = styles.DateOrange;
    else if (diffDays <= 7) theme = styles.DateYellow;

    let timeRemainingDisplay = "";
    if (!isValidDate) {
        timeRemainingDisplay = "ไม่ระบุกำหนดการ";
    } else if (diffTotalMinutes < 0) {
        const absMinutes = Math.abs(diffTotalMinutes);
        const absHours = Math.floor(absMinutes / 60);
        const rDays = Math.floor(absHours / 24);
        if (rDays > 0) timeRemainingDisplay = `เกินกำหนด ${rDays} วัน`;
        else timeRemainingDisplay = `เกินกำหนด ${absHours} ชม. ${absMinutes % 60} นาที`;
    } else {
        if (diffDays >= 1) timeRemainingDisplay = `เหลืออีก ${diffDays} วัน`;
        else timeRemainingDisplay = `เหลืออีก ${diffTotalHours} ชม. ${diffTotalMinutes % 60} นาที`;
    }

    const formatForInput = (dateStr: string) => {
        if (!dateStr) return "";
        if (typeof dateStr === 'string' && dateStr.length === 16 && dateStr.includes("T")) {
            return dateStr; 
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

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

    const themeStyle = selectThemeMap[taskStatus] || selectThemeMap["following"];

    return (
        <div className="flex flex-col w-full h-full gap-6 justify-between min-h-140 max-w-full box-border">
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        <div className={styles.InfoContainer}>
                            <div className={`${styles.DateDisplayer} ${theme}`}>
                                <span>กำหนดติดตาม</span>
                                <span className={styles.DateNumber}>{day}</span>
                                <span className={styles.DateMonth}>{monthYear}</span>
                            </div>
                            <div className={styles.Content}>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className={styles.CustomSelect}
                                        style={{ marginBottom: '0.5rem', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' }}
                                        value={taskData?.name || ""} 
                                        onChange={(e) => setTaskData({ ...taskData, name: e.target.value })} 
                                    />
                                ) : (
                                    <h1 className={styles.Header}>{taskData?.name}</h1>
                                )}
                                <div className={styles.DetailContainer}>
                                    <div className={styles.DetailedContainer}>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2">
                                            <strong>ผู้รับผิดชอบรวม: &nbsp; </strong> 
                                            <span className={styles.TextArea} style={{ padding: '0.2rem 0.6rem', fontWeight: 'bold', display: 'inline-block' }}>
                                                {taskData?.personInCharge || "ไม่ระบุ"}
                                            </span>
                                        </div>
                                        
                                        {isEditing ? (
                                            <div className="flex flex-col gap-2 mt-2 max-w-full">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <strong>เปลี่ยนกำหนดส่ง: </strong>
                                                    <input 
                                                        type="datetime-local" 
                                                        className={styles.CustomSelect}
                                                        style={{ width: '100%', maxWidth: '300px', padding: '0.4rem 0.8rem', boxSizing: 'border-box' }}
                                                        value={taskData?.date ? formatForInput(taskData.date) : ""} 
                                                        onChange={(e) => {
                                                            setTaskData({ ...taskData, date: e.target.value });
                                                        }} 
                                                    />
                                                </div>
                                                <div className="flex flex-row items-center gap-2 mt-1">
                                                    <input 
                                                        type="checkbox" 
                                                        id="isUrgent"
                                                        checked={taskData?.isUrgent || false}
                                                        onChange={(e) => setTaskData({ ...taskData, isUrgent: e.target.checked })}
                                                        style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: 'var(--redText)' }}
                                                    />
                                                    <label htmlFor="isUrgent" style={{ cursor: 'pointer' }}><strong>กำหนดเป็นงานเร่งด่วน</strong></label>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1 mt-3">
                                                <p className="flex flex-wrap wrap-break-word">
                                                    <strong>กำหนดส่ง: &nbsp; </strong> 
                                                    {isValidDate ? `${day} ${monthYear} เวลา ${timeText} น.` : "ไม่ระบุ"}
                                                </p>
                                                <p className="flex flex-wrap text-sm wrap-break-word" style={{ color: "var(--header)" }}>
                                                    <strong>สถานะเวลา: &nbsp; </strong>  
                                                    <span style={{ fontWeight: 'bold', color: diffTotalMinutes < 0 ? 'var(--redText)' : 'var(--blueText)' }}>
                                                        {timeRemainingDisplay}
                                                    </span>
                                                </p>
                                                {taskData?.isUrgent && (
                                                    <p className="flex flex-row text-sm mt-1">
                                                        <span style={{ fontWeight: 'bold', color: 'var(--redText)', backgroundColor: 'var(--redBG)', padding: '0.2rem 0.6rem', borderRadius: '0.4rem' }}>
                                                            🔥 งานเร่งด่วน
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-6 pt-6 max-w-full box-border" style={{ borderTop: '1px solid var(--wrapper)' }}>
                            {/* 💡 บังคับให้เป็น flex-row (แนวนอน) เสมอ เพื่อให้คำว่า "สถานะ :" กับ Dropdown อยู่บรรทัดเดียวกัน */}
                            <div className="flex flex-row items-center gap-3 w-full box-border">
                                <label className="whitespace-nowrap shrink-0"><strong>สถานะ : </strong></label>
                                <div className="flex-1 min-w-0">
                                    <Select
                                        instanceId={`task-status-${taskData?.id}`}
                                        options={statusOption}
                                        value={statusOption.find((option) => option.value === taskStatus)}
                                        isClearable={false}
                                        onChange={(selectedOption) => {
                                            const newStatus = selectedOption!.value;
                                            setStatus(newStatus);
                                            onStatusChange(taskData?.id?.toString(), newStatus);
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
                                            width: "100%"
                                            }),
                                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                            singleValue: (base) => ({ ...base, textAlign: "center", color: themeStyle.color }),
                                            dropdownIndicator: (base) => ({ ...base, color: themeStyle.color }),
                                            indicatorSeparator: (base) => ({ ...base, display: "none" }),
                                            option: (base, state) => {
                                                const theme = selectThemeMap[state.data.value as keyof typeof selectThemeMap];
                                                return {
                                                ...base,
                                                backgroundColor: state.isFocused ? theme.bg : "var(--button)",
                                                color: theme.color,
                                                cursor: "pointer",
                                                ":active": { backgroundColor: theme.bg },
                                                };
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-2 w-full box-border">
                                <label><strong>บันทึกเพิ่มเติม : </strong></label>
                                <textarea 
                                    className={`${styles.TextArea} w-full box-border`}
                                    style={{ padding: '0.6rem', color: 'var(--header)', outline: 'none', maxWidth: '100%' }}
                                    rows={4} 
                                    value={taskData?.notes || ""} 
                                    onChange={(e) => setTaskData({ ...taskData, notes: e.target.value })}
                                ></textarea>
                                <button className={`${styles.Clickable} w-full sm:w-auto box-border`} onClick={onUpdateTask}>บันทึกข้อมูลและบันทึกเพิ่มเติม</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2 box-border">
                <Link href={'/'} className="w-full sm:w-1/3 flex">
                    <button className={`${styles.ButtonBack} w-full min-h-11`}>กลับหน้าหลัก</button>
                </Link>
                
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full min-w-0 box-border">
                    {isEditing ? (
                        <button 
                            className={`${styles.Clickable} ${styles.Green} w-full flex-1 min-h-11`} 
                            onClick={onUpdateTask}
                        >
                            ตกลง (บันทึกข้อมูล)
                        </button>
                    ) : (
                        <button 
                            className={`${styles.Clickable} ${styles.Yellow} w-full flex-1 min-h-11`} 
                            onClick={() => setIsEditing(true)}
                        >
                            แก้ไขข้อมูล
                        </button>
                    )}
                    <button 
                        className={`${styles.Clickable} ${styles.Red} w-full flex-1 min-h-11`} 
                        onClick={onDeleteTask}
                    >
                        ลบงานติดตามนี้
                    </button>
                </div>
            </div>
        </div>
    );
}