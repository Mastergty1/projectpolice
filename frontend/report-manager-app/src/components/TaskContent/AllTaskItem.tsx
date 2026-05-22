"use client"

import styles from "./TaskItem.module.css"
import Select from "react-select";
import { useState } from "react";

type TaskItemProps = {
  date: string;
  name: string;
  personInCharge: string;
  status: string;
  id: string;
};

export default function AllTaskItem({date,name,personInCharge,status,id}:TaskItemProps){
    
    const parsedDate = new Date(date);
    const day = parsedDate.getDate();
    const monthYear = parsedDate.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
    });

    const [taskStatus, setStatus] = useState("following");

    const statusOption = [
    { value: 'following', label: 'กำลังติดตาม' },
    { value: 'problem', label: 'เกิดปัญหา' },
    { value: 'completed', label: 'เสร็จสิ้น' }
    ]
    
    return(
        <div className={styles.TaskWrapper}>
            <div className={styles.InnerWrapper}>
                <div className="flex flex-row">
                <div className={styles.DateDisplayer}>
                    <span>กำหนดติดตาม</span>
                    <span className={styles.DateNumber}>{day}</span>
                    <span className={styles.DateMonth}>{monthYear}</span>
                </div>

                <div className={styles.Content}>
                <h1 className={styles.Header}>{name}</h1>
                <div className={styles.DetailContainer}>
                    <p className="flex flex-col sm:flex-row"><strong>ผู้รับผิดชอบ: &nbsp; </strong> {personInCharge}</p>
                    <p className="flex flex-col sm:flex-row"><strong>เหลือเวลาอีก: &nbsp; </strong> {personInCharge}</p>
                </div>
                </div>
                </div>

                <div className={styles.ButtonContainer}>
                    <div className={styles.SelectWrapper}>
                        <Select
                            options={statusOption}
                            value={statusOption.find(
                                (option) => option.value === taskStatus
                            )}
                            isClearable={false}
                            onChange={(selectedOption) => {
                                setStatus(selectedOption!.value);
                                
                            }}
                            menuPortalTarget={document.body}
                            isSearchable={false}
                            styles={{
                                control: (base) => ({
                                ...base,
                                backgroundColor: "var(--button)",
                                border: "2px solid var(--wrapper)",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "0.7rem",
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
                                }),
                            }}
                        />
                        </div>
                    <button className={styles.Clickable}> 
                        รายละเอียด 
                    </button>
                </div>
            </div>
        
        </div>
    );
}