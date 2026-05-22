import AllTaskItem from "../TaskContent/AllTaskItem";
import styles from "./TaskDisplayer.module.css"

export default function TaskDisplayer(){
    return(
        <div className={styles.ContentContent}>
            <div className={styles.ContentContentScrollable}>
                <AllTaskItem name="ชื่องานติดตาม" id="a" personInCharge="ชื่อชั่วคราว" date="2026-05-22" status="กำลังติดตาม"></AllTaskItem>
                <AllTaskItem name="ชื่องานติดตาม" id="a" personInCharge="ชื่อชั่วคราว" date="2026-05-22" status="กำลังติดตาม"></AllTaskItem>
                <AllTaskItem name="ชื่องานติดตาม" id="a" personInCharge="ชื่อชั่วคราว" date="2026-05-22" status="กำลังติดตาม"></AllTaskItem>
                <AllTaskItem name="ชื่องานติดตาม" id="a" personInCharge="ชื่อชั่วคราว" date="2026-05-22" status="กำลังติดตาม"></AllTaskItem>
                <AllTaskItem name="ชื่องานติดตาม" id="a" personInCharge="ชื่อชั่วคราว" date="2026-05-22" status="กำลังติดตาม"></AllTaskItem>
            </div>
        </div>
    )
}