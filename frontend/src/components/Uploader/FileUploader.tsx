import styles from "./fileUploader.module.css"

export default function FileUploader(){
    return(
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <h1 className={styles.Header}>อัพโหลดไฟล์เอกสาร</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div>
                        อัพโหลดหรือลากไฟล์เอกสารมาที่นี่
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <button className={styles.Button}>อัพโหลดไฟล์</button>
                <button className={styles.Button}>เพิ่มงานติดตามด้วยตนเอง</button>
            </div>
        </div>
    )
}