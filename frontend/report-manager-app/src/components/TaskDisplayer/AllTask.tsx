import AllTaskItem from "../TaskContent/AllTaskItem";
import styles from "./TaskDisplayer.module.css"

export default function AllTask(){
    return(
        <div className="flex flex-col w-full h-full gap-[1.5rem] min-h-[300px]">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h1 className={styles.Header}>งานติดตามทั้งหมด</h1>
                <button className={styles.Button}>+ เพิ่มงานติดตาม</button>
            </div>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentContent}>
                        <div className="flex flex-col sm:flex-row">
                            <strong>ต้องติดตามใน</strong>
                            <button className={styles.Dropdown}>dropdown placeholder</button>
                            <strong>สำหรับ</strong>
                            <button className={styles.Dropdown}>dropdown placeholder</button>
                        </div>
                    </div>
                    <hr className={styles.Line}></hr>
                    <div className={styles.ContentContentScrollable}>
                        <AllTaskItem name="ชื่องานติดตาม" id="a" personInCharge="ชื่อชั่วคราว" date="2026-05-22" status="กำลังติดตาม"></AllTaskItem>
                        <AllTaskItem name="ชื่องานติดตาม" id="a" personInCharge="ชื่อชั่วคราว" date="2026-05-22" status="กำลังติดตาม"></AllTaskItem>
                        <AllTaskItem name="ชื่องานติดตาม" id="a" personInCharge="ชื่อชั่วคราว" date="2026-05-22" status="กำลังติดตาม"></AllTaskItem>
                        <AllTaskItem name="ชื่องานติดตาม" id="a" personInCharge="ชื่อชั่วคราว" date="2026-05-22" status="กำลังติดตาม"></AllTaskItem>
                        <AllTaskItem name="ชื่องานติดตาม" id="a" personInCharge="ชื่อชั่วคราว" date="2026-05-22" status="กำลังติดตาม"></AllTaskItem>
                    </div>
                </div>
            </div>
        </div>
    );
}