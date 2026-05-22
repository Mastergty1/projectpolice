import styles from "./TaskDisplayer.module.css"

export default function UrgenTask(){
    return(
        <div className="flex flex-col w-full h-full gap-[1.5rem] min-h-[300px]">
            <h1 className={styles.Header}>งานติดตามเร่งด่วน</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentContent}>
                        <strong>สำหรับ</strong>
                        <button className={styles.Dropdown}>dropdown placeholder</button>
                    </div>
                    <hr className={styles.Line}></hr>
                    <div className={styles.ContentContent}>
                        อะไรสักอย่าง 
                    </div>
                </div>
            </div>
        </div>
    );
}