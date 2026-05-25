"use client"

import styles from "./Details.module.css"
import Select from "react-select";
import { useState, useEffect } from "react";
import Link from "next/link";

type TaskStatus = "following" | "problem" | "completed";

type TaskItemProps = {
  date: string;
  name: string;
  personInCharge: string;
  status: string;
  id: string;
  note: string;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onUpdateTask: (updatedFields: { name: string; date: string; notes: string }) => void;
  onDeleteTask: () => void;
};

type StatusOption = {
  value: TaskStatus;
  label: string;
};

export default function DetailsPanel({date, name, personInCharge, status, id, note, onStatusChange, onUpdateTask, onDeleteTask}: TaskItemProps){
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(name);
    const [editDate, setEditDate] = useState(date);
    const [editNote, setEditNote] = useState(note);
    const [taskStatus, setStatus] = useState<TaskStatus>((status as TaskStatus) || "following");

    useEffect(() => {
        if (status) setStatus(status as TaskStatus);
    }, [status]);

    const parsedDate = new Date(editDate);
    const day = parsedDate.getDate();
    const monthYear = parsedDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsedDate.setHours(0, 0, 0, 0);

    const diffTime = parsedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let theme = styles.DateGreen;
    if (diffDays < 0) theme = styles.DateGrey;
    else if (diffDays === 0) theme = styles.DateRed;
    else if (diffDays === 1) theme = styles.DateOrange;
    else if (diffDays <= 7) theme = styles.DateYellow;

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

    const themeStyle = selectThemeMap[taskStatus];

    const handleSaveNoteOnly = () => {
        onUpdateTask({ name: editName, date: editDate, notes: editNote });
    };

    return (
        <div className="flex flex-col w-full h-full gap-6 justify-between min-h-140">
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        <div className={styles.InfoContainer}>
                            <div className={`${styles.DateDisplayer} ${theme}`}>
                                <span>กำหนดติดตาม</span>
                                <span className={styles.DateNumber}>{isNaN(day) ? "-" : day}</span>
                                <span className={styles.DateMonth}>{monthYear === "Invalid Date" ? "ไม่ระบุ" : monthYear}</span>
                            </div>
                            <div className={styles.Content}>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="p-1 text-black border rounded w-full text-base mb-2" 
                                        value={editName} 
                                        onChange={(e) => setEditName(e.target.value)} 
                                    />
                                ) : (
                                    <h1 className={styles.Header}>{editName}</h1>
                                )}
                                <div className={styles.DetailContainer}>
                                    <div className={styles.DetailedContainer}>
                                        <p className="flex flex-row"><strong>ผู้รับผิดชอบ: &nbsp; </strong> {personInCharge}</p>
                                        
                                        {isEditing ? (
                                            <div className="flex items-center gap-1 mt-1">
                                                <strong>เปลี่ยนวันที่: </strong>
                                                <input 
                                                    type="date" 
                                                    className="p-1 text-black text-sm border rounded" 
                                                    value={editDate} 
                                                    onChange={(e) => setEditDate(e.target.value)} 
                                                />
                                            </div>
                                        ) : (
                                            <p className="flex flex-row"><strong>กำหนดเวลา: &nbsp; </strong>  
                                            {isNaN(diffDays) ? "ไม่ระบุกำหนดการ" : diffDays < 0
                                                ? `เกินกำหนด ${Math.abs(diffDays)} วัน`
                                                : diffDays === 0
                                                ? "วันนี้"
                                                : `เหลืออีก ${diffDays} วัน`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-4">
                            <div className={styles.InteractionContainer}>
                                <label className="min-w-17.5"><strong>สถานะ : </strong></label>
                                <div className={styles.SelectWrapper}>
                                    <Select
                                        instanceId={`task-status-${id}`}
                                        options={statusOption}
                                        value={statusOption.find((option) => option.value === taskStatus)}
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
                                            color: themeStyle.color
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
                            <div className="flex flex-col gap-2">
                                <label><strong>บันทึกเพิ่มเติม : </strong></label>
                                <textarea 
                                    className={styles.TextArea} 
                                    rows={4} 
                                    value={editNote} 
                                    onChange={(e) => setEditNote(e.target.value)}
                                ></textarea>
                                <button className={styles.Clickable} onClick={handleSaveNoteOnly}>บันทึกบันทึกเพิ่มเติม</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
                <Link href={'/'} className="w-full sm:w-1/3">
                    <button className={styles.ButtonBack}>กลับหน้าหลัก</button>
                </Link>
                <div className="flex flex-row gap-4 flex-1">
                    {isEditing ? (
                        <button 
                            className={`${styles.Clickable} ${styles.Green}`} 
                            onClick={() => {
                                onUpdateTask({ name: editName, date: editDate, notes: editNote });
                                setIsEditing(false);
                            }}
                        >
                            ตกลง
                        </button>
                    ) : (
                        <button 
                            className={`${styles.Clickable} ${styles.Yellow}`} 
                            onClick={() => setIsEditing(true)}
                        >
                            แก้ไขข้อมูล
                        </button>
                    )}
                    <button className={`${styles.Clickable} ${styles.Red}`} onClick={onDeleteTask}>ลบ</button>
                </div>
            </div>
        </div>
    );
}