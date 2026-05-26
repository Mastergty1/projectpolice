"use client";

import { useState } from "react";
import AssignmentItem from "./AssignmentItem";

export default function MemoForm() {
  const [formData, setFormData] = useState({
    title: "งานติดตามคีย์ด้วยมือ",
    memo_no: "123/2567",
    memo_date: "2026-05-26",
    due_date: "2026-06-01T10:00",
    main_text: "รายละเอียดงานที่เพิ่มเข้ามาด้วยตนเอง...",
    is_urgent: true,
  });

  const [assignments, setAssignments] = useState([
    { type: "user_id", value: "1", topics: "งานย่อยที่ 1, งานย่อยที่ 2" },
    { type: "role_or_name", value: "ฝ่ายประสานงาน", topics: "ติดต่อหน่วยงานภายนอก" },
  ]);

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isChecked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? isChecked : value,
    }));
  };

  const handleAssignmentChange = (index: number, field: string, value: string) => {
    const updatedAssignments = [...assignments];
    updatedAssignments[index] = { ...updatedAssignments[index], [field]: value };
    setAssignments(updatedAssignments);
  };

  const addAssignment = () => {
    setAssignments([...assignments, { type: "user_id", value: "", topics: "" }]);
  };

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedAssignments = assignments.map((assign) => {
      const topicsArray = assign.topics.split(",").map((t) => t.trim()).filter((t) => t !== "");
      return assign.type === "user_id" 
        ? { user_id: Number(assign.value), topics: topicsArray }
        : { role_or_name: assign.value, topics: topicsArray };
    });

    const payload = {
      ...formData,
      due_date: formData.due_date.length === 16 ? `${formData.due_date}:00` : formData.due_date,
      assignments: formattedAssignments,
    };

    try {

            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";

        const response = await fetch(`${backendUrl}/api/v1/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (response.ok && result.success) {
            alert("บันทึกข้อมูลสำเร็จ!");
        } else {
            alert("เกิดข้อผิดพลาด: " + (result.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (Network Error)");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main Form Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">หัวข้องาน (Title)</label>
        <input type="text" name="title" value={formData.title} onChange={handleMainChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">เลขที่ Memo</label>
          <input type="text" name="memo_no" value={formData.memo_no} onChange={handleMainChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">วันที่ Memo</label>
          <input type="date" name="memo_date" value={formData.memo_date} onChange={handleMainChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">วันครบกำหนด (Due Date)</label>
        <input type="datetime-local" name="due_date" value={formData.due_date} onChange={handleMainChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">รายละเอียด (Main Text)</label>
        <textarea name="main_text" value={formData.main_text} onChange={handleMainChange} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
      </div>

      <div className="flex items-center">
        <input type="checkbox" name="is_urgent" checked={formData.is_urgent} onChange={handleMainChange} id="is_urgent" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
        <label htmlFor="is_urgent" className="ml-2 block text-sm font-medium text-red-600">ด่วน (Urgent)</label>
      </div>

      <hr className="my-6" />

      {/* Assignments Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">ผู้รับผิดชอบ (Assignments)</h2>
          <button type="button" onClick={addAssignment} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
            + เพิ่มผู้รับผิดชอบ
          </button>
        </div>

        {assignments.map((assign, index) => (
          <AssignmentItem 
            key={index} 
            index={index} 
            assign={assign} 
            onChange={handleAssignmentChange} 
            onRemove={removeAssignment} 
          />
        ))}
      </div>

      <div className="pt-4">
        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
          บันทึกและส่งข้อมูล
        </button>
      </div>
    </form>
  );
}