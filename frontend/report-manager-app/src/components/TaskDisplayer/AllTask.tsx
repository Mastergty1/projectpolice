import AllTaskItem from "../TaskContent/AllTaskItem";
import TaskDisplayer from "./TaskDisplayer";
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
                    <div className={styles.ContentHeader}>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <strong>ต้องติดตามใน</strong>
                            <button className={styles.Dropdown}>dropdown placeholder</button>
                            <strong>สำหรับ</strong>
                            <button className={styles.Dropdown}>dropdown placeholder</button>
                        </div>
                    </div>
                    <hr className={styles.Line}></hr>
                    <TaskDisplayer></TaskDisplayer>
                </div>
            </div>
        </div>
    );
}