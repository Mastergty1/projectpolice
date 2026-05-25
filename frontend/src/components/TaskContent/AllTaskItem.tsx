"use client"

import styles from "./TaskItem.module.css"
import Select from "react-select";
import { useState, useEffect } from "react";
import Link from "next/link";

type TaskItemProps = {
  date: string;
  name: string;
  personInCharge: string;
  status: string;
  id: string;

  onStatusChange: (
    id: string,
    status: TaskStatus
  ) => void;
};

type TaskStatus = "following" | "problem" | "completed";

type StatusOption = {
  value: TaskStatus;
  label: string;
};

export default function AllTaskItem({date,name,personInCharge,status,id,onStatusChange}:TaskItemProps){
    
    const parsedDate = new Date(date);
    const day = parsedDate.getDate();
    const monthYear = parsedDate.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsedDate.setHours(0, 0, 0, 0);

    const diffTime = parsedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let urgency = "";
    let theme;

    if (diffDays < 0) {
        urgency = "late";
        theme = styles.DateGrey;
    } else if (diffDays === 0) {
        urgency = "today";
        theme = styles.DateRed;
    } else if (diffDays === 1) {
        urgency = "tommorrow";
        theme = styles.DateOrange;
    } else if (diffDays <= 7) {
        urgency = "this week";
        theme = styles.DateYellow;
    } else {
        urgency = "later";
        theme = styles.DateGreen;
    }

    // 💡 แก้ไข: ดึงค่า status ที่มาจาก Database มาเป็นค่าเริ่มต้น
    const [taskStatus, setStatus] = useState<TaskStatus>((status as TaskStatus) || "following");

    // 💡 อัปเดตสถานะให้ตรงเมื่อมีการดึง API ใหม่
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
        following: {
            color: "var(--yellowText)",
            bg: "var(--yellowBG)",
            border: "var(--yellowBorder)",
        },
        problem: {
            color: "var(--redText)",
            bg: "var(--redBG)",
            border: "var(--redBorder)",
        },
        completed: {
            color: "var(--greenText)",
            bg: "var(--greenBG)",
            border: "var(--greenBorder)",
        },
    } as const;

    const themeStyle = selectThemeMap[taskStatus];
    
    return(
        <div className={styles.TaskWrapper}>
            <div className={styles.InnerWrapper}>
                <div className={styles.InfoContainer}>
                <div className={`${styles.DateDisplayer} ${theme}`}>
                    <span>กำหนดติดตาม</span>
                    <span className={styles.DateNumber}>{day}</span>
                    <span className={styles.DateMonth}>{monthYear}</span>
                </div>

                <div className={styles.Content}>
                <h1 className={styles.Header}>{name}</h1>
                <div className={styles.DetailContainer}>
                    <p className="flex flex-col sm:flex-row"><strong>ผู้รับผิดชอบ: &nbsp; </strong> {personInCharge}</p>
                    <p className="flex flex-col sm:flex-row"><strong>กำหนดเวลา: &nbsp; </strong>  
                    {diffDays < 0
                        ? `เกินกำหนด ${Math.abs(diffDays)} วัน`
                        : diffDays === 0
                        ? "วันนี้"
                        : `เหลืออีก ${diffDays} วัน`}</p>
                </div>
                </div>
                </div>

                <div className={styles.ButtonContainer}>
                    <div className={styles.SelectWrapper}>
                        <Select
                            instanceId={`task-status-${id}`}
                            options={statusOption}
                            value={statusOption.find(
                                (option) => option.value === taskStatus
                            )}
                            isClearable={false}
                            onChange={(selectedOption) => {
                                const newStatus = selectedOption!.value;
                                setStatus(newStatus);
                                onStatusChange(id, newStatus);
                            }}
                            menuPortalTarget={
                                typeof document !== "undefined"
                                ? document.body
                                : null
                            }
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
                                menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    whiteSpace: "normal",
                                    overflowWrap: "break-word",
                                    textAlign: "center",
                                    color: themeStyle.color
                                }),
                                dropdownIndicator: (base) => ({
                                    ...base,
                                    color: themeStyle.color
                                }),
                                indicatorSeparator: (base) => ({
                                    ...base,
                                    display: "none",
                                }),
                                 option: (base, state) => {
                                    const theme =
                                    selectThemeMap[state.data.value as keyof typeof selectThemeMap];

                                    return {
                                    ...base,
                                    backgroundColor: state.isFocused
                                        ? theme.bg
                                        : "var(--button)",
                                    color: theme.color,
                                    cursor: "pointer",
                                    ":active": {
                                        backgroundColor: theme.bg,
                                    },
                                    };
                                },
                            }}
                        />
                        </div>

                    <Link href={`/tasks/${id}`}>
                    <button className={styles.Clickable}> 
                        รายละเอียด 
                    </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}