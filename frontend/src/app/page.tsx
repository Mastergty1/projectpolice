import AllTask from "@/components/TaskDisplayer/AllTask";
import UrgentTask from "@/components/TaskDisplayer/UrgentTask";

export default function Home() {
  return (
    // 💡 แก้ไข Responsive: ลด padding ในจอเล็ก (p-4) ปรับเป็น flex-col บนจอเล็ก และขยายเป็นแนวนอน (lg:flex-row) เมื่อจอใหญ่
    <div className="flex flex-col lg:flex-row justify-between w-full min-h-screen p-4 sm:p-8 lg:p-16 lg:pt-8 gap-8 lg:gap-12 overflow-x-hidden">
      <div className="flex flex-col w-full lg:w-1/3">
        <UrgentTask />
      </div>
      <div className="flex flex-col w-full lg:w-2/3">
        <AllTask />
      </div>
    </div>
  );
}