"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DetailsPanel from "@/components/Details/DetailsPanel";
import DetailsDisplayer from "@/components/Details/DetailsDisplayer";
import Swal from "sweetalert2";

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [taskData, setTaskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTask = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
        const res = await fetch(`${backendUrl}/api/v1/tasks/${id}`);
        if (!res.ok) throw new Error("Failed to fetch task");
        const data = await res.json();
        setTaskData(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleUpdateTask = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
      const res = await fetch(`${backendUrl}/api/v1/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "บันทึกข้อมูลสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
        setIsEditing(false);
      } else {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้",
      });
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
      await fetch(`${backendUrl}/api/v1/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDeleteTask = async () => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "หากลบงานนี้แล้ว จะไม่สามารถกู้คืนได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
        const res = await fetch(`${backendUrl}/api/v1/tasks/${id}`, { method: "DELETE" });

        if (res.ok) {
          Swal.fire("ลบสำเร็จ!", "งานถูกลบออกจากระบบแล้ว", "success").then(() => {
            router.push("/");
          });
        } else {
          throw new Error("Failed to delete task");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบงานได้", "error");
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-(--header)">กำลังโหลดข้อมูล...</div>;
  if (!taskData) return <div className="p-8 text-center text-(--header)">ไม่พบข้อมูลงาน</div>;

  return (
    // เพิ่ม overflow-x-hidden และ max-w-full เพื่อกันการดันหน้าจอจากด้านใน
    <div className="flex flex-col lg:flex-row w-full max-w-full h-full p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 overflow-x-hidden box-border">
      <div className="flex flex-col w-full lg:w-1/3 min-w-0 box-border">
        <DetailsPanel 
            taskData={taskData} 
            setTaskData={setTaskData} 
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onStatusChange={handleStatusChange}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
        />
      </div>
      <div className="flex flex-col w-full lg:w-2/3 min-w-0 box-border">
        <DetailsDisplayer 
            taskData={taskData} 
            setTaskData={setTaskData} 
            isEditing={isEditing} 
        />
      </div>
    </div>
  );
}