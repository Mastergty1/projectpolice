import styles from "./fileUploader.module.css"

export default function Uploaded(){
    return(
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <h1 className={styles.Header}>งานติดตามที่ตรวจอ่านได้</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <strong>
                                ต้องติดตามใน
                            </strong>
                            <button className={styles.Dropdown}>
                                dropdown placeholder
                            </button>
                            <strong>
                                สำหรับ
                            </strong>
                            <button className={styles.Dropdown}>
                                dropdown placeholder
                            </button>
                        </div>
                    </div>
                </div>
                    <hr className={styles.Line} />

                    sth
            </div>
            <div className="flex flex-col md:flex-row  md:justify-end gap-4">
                <button className={styles.Button}>กลับหน้าหลัก</button>
                <button className={styles.Button}>ยืนยันเพิ่มงานติดตาม</button>
            </div>
        </div>
    )
}