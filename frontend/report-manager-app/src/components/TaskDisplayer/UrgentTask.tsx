import AllTaskItem from "../TaskContent/AllTaskItem";
import styles from "./TaskDisplayer.module.css"

export default function UrgenTask(){
    return(
        <div className="flex flex-col w-full h-full gap-[1.5rem] min-h-[300px]">
            <h1 className={styles.Header}>งานติดตามเร่งด่วน</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentContent}>
                        <div className="flex flex-col sm:flex-row">
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