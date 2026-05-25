import styles from "./fileUploader.module.css"

// กำหนด Interface สำหรับ structure ข้อมูลใหม่
interface ResponsibilityAssignment {
    responsible_person: string;
    topics: string[];
}

interface UploadedProps {
    extractedData: any; // คุณควรระบุ Type ที่แม่นยำกว่านี้ในภายหลัง
}

export default function Uploaded({ extractedData }: UploadedProps) {
    return(
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <h1 className={styles.Header}>งานติดตามที่ตรวจอ่านได้</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <strong>ต้องติดตามใน</strong>
                            <button className={styles.Dropdown}>dropdown placeholder</button>
                            <strong>สำหรับ</strong>
                            <button className={styles.Dropdown}>dropdown placeholder</button>
                        </div>
                    </div>
                </div>
                <hr className={styles.Line} />

                {/* ส่วนแสดงผลข้อมูลที่สแกนได้ */}
                <div className="p-4 w-full">
                    {extractedData ? (
                        <div className="text-sm flex flex-col gap-4">
                            {/* ข้อมูลหัวบันทึก */}
                            <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p><strong>ส่วนราชการ:</strong> {extractedData.ส่วนราชการ || '-'}</p>
                                <p><strong>ที่:</strong> {extractedData.ที่ || '-'}</p>
                                <p><strong>วันที่:</strong> {extractedData.วันที่ || '-'}</p>
                                <p><strong>เรียน:</strong> {extractedData.เรียน || '-'}</p>
                            </div>

                            {/* ข้อความโดยรวมหลังเรียน (ถ้ามี) */}
                            {extractedData.main_text && (
                                <div className="p-2">
                                    <strong>เนื้อหา:</strong>
                                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{extractedData.main_text}</p>
                                </div>
                            )}
                            
                            {/* แสดงการมอบหมายงานความรับผิดชอบ */}
                            {extractedData.assignments && extractedData.assignments.length > 0 ? (
                                <div className="mt-2">
                                    <strong className="text-base text-blue-800">📋 การมอบหมายงาน/ความรับผิดชอบ:</strong>
                                    <div className="flex flex-col gap-4 mt-3">
                                        {extractedData.assignments.map((assignment: ResponsibilityAssignment, idx: number) => (
                                            <div key={idx} className="bg-white p-4 rounded-lg shadow-inner border border-gray-100">
                                                <p className="font-bold text-base text-green-700">
                                                    👤 {assignment.responsible_person || 'ไม่ระบุผู้รับผิดชอบ'}
                                                </p>
                                                
                                                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                                    <strong>หัวข้อที่ต้องรับผิดชอบ:</strong>
                                                    <ul className="list-disc pl-5 mt-2 text-gray-700 flex flex-col gap-1">
                                                        {assignment.topics && assignment.topics.length > 0 ? (
                                                            assignment.topics.map((topic: string, topicIdx: number) => (
                                                                <li key={topicIdx}>{topic}</li>
                                                            ))
                                                        ) : (
                                                            <li>- ไม่พบหัวข้อความรับผิดชอบ -</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                !extractedData.main_text && (
                                    <div className="text-gray-400 text-center py-5">
                                        ไม่พบข้อมูลการมอบหมายงานในเอกสารนี้
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center py-10">
                            ยังไม่มีข้อมูล กรุณาอัพโหลดเอกสารเพื่อสแกน
                        </div>
                    )}
                </div>

            </div>
            <div className="flex flex-col md:flex-row md:justify-end gap-4 mt-6">
                <button className={styles.ButtonVariant}>กลับหน้าหลัก</button>
                <button className={styles.Button}>ยืนยันเพิ่มงานติดตาม</button>
            </div>
        </div>
    )
}