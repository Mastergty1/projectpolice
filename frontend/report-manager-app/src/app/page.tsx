import AllTask from "@/components/TaskDisplayer/AllTask";
import UrgenTask from "@/components/TaskDisplayer/UrgentTask";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row justify-between w-full md:h-full p-[4rem] pt-[2rem] gap-[3rem]">
      <div className="flex flex-1">
        <UrgenTask></UrgenTask>
      </div>
      <div className="flex flex-2">
        <AllTask/>
      </div>
    </div>
  );
}
