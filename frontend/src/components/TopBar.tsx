import Link from 'next/link';
import Image from 'next/image';

export default function TopBar() {
    return (
        <div id="main-topbar" className="flex justify-between items-center w-full px-6 py-4 shadow-md z-50 relative bg-[#3F1818]">
            <Link href="/" aria-label="กลับหน้าหลัก ระบบติดตามงานมอบหมาย">
                <div className="flex items-center gap-4 group">
                    <Image 
                        src="/globe.svg" 
                        alt="โลโก้ระบบติดตามงานมอบหมาย" 
                        width={40} 
                        height={40} 
                        className="transition-transform group-hover:scale-110" 
                        priority
                    />
                    <strong style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        ระบบติดตามงานมอบหมาย
                    </strong>
                </div>
            </Link>

            <Link href="/help" aria-label="ไปหน้าช่วยเหลือการใช้งาน">
                <button className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors" style={{ minHeight: '44px' }}>
                    <Image 
                        src="/window.svg" 
                        alt="ไอคอนช่วยเหลือ" 
                        width={24} 
                        height={24} 
                    />
                    <span className="font-medium">ช่วยเหลือ</span>
                </button>
            </Link>
        </div>
    );
}