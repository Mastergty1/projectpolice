"use client";

import DetailsDisplayer from "@/components/Details/DetailsDisplayer";
import DetailsPanel from "@/components/Details/DetailsPanel";
import { useParams } from "next/navigation";

type TaskStatus = "following" | "problem" | "completed";

export default function TaskPage() {
    const { id } = useParams();
    console.log(id);

    const mockTask = {
        id: "TASK-001",
        name: "ติดตามเอกสารขออนุมัติโครงการ",
        personInCharge: "สมชาย ใจดี",
        department: "ฝ่ายบริหารโครงการ",
        status: "following" as TaskStatus,
        date: "2026-05-30",
        createdAt: "2026-05-20",
        description:
            "ติดตามสถานะการอนุมัติโครงการจากฝ่ายบริหาร พร้อมตรวจสอบเอกสารแนบทั้งหมดก่อนส่งต่อ",
        notes:
            "รอการตอบกลับจากหัวหน้าฝ่าย คาดว่าจะได้รับภายในสัปดาห์นี้",
    };


    return (
        <div className="flex flex-col w-full md:h-full p-16 pt-8 gap-12">
            <h1
                style={{
                    color: "var(--header)",
                    fontWeight: "bold",
                    fontSize: "2.5rem",
                }}
            >
                รายละเอียดการติดตาม
            </h1>
            
            <div className="flex flex-col md:flex-row justify-between gap-12">

                <div className="flex flex-1">
                    <DetailsDisplayer></DetailsDisplayer>
                </div>
                    
                <div className="flex flex-2">
                    <DetailsPanel 
                    key={mockTask.id}
                        id={mockTask.id}
                        name={mockTask.name}
                        personInCharge={mockTask.personInCharge}
                        date={mockTask.date}
                        status={mockTask.status}
                        note={mockTask.notes}
                        onStatusChange={()=>{}}
                    ></DetailsPanel>
                </div>
            </div>
        </div>

    );
}