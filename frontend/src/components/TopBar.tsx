import Link from "next/link";

export default function TopBar(){
    return(
        <div className="flex justify-between items-center w-full px-6 py-4 bg-[#3F1818] text-white shadow-xs text-lg">
            <Link href={"./"} className=" rounded hover:opacity-70 transition"><strong>ระบบติดตามงานมอบหมาย</strong></Link>
            <button className=" rounded hover:opacity-70 transition">ช่วยเหลือ</button>
        </div>
    );
}