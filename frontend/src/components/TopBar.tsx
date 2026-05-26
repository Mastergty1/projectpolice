import Link from 'next/link';
import Image from 'next/image';

export default function TopBar() {
    return (
        <div className="flex justify-between items-center w-full px-6 py-4 bg-[#3F1818] shadow-md z-50 relative">
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
                    {/* 💡 แก้ไข: บังคับสีขาวบริสุทธิ์เพื่อหลีกเลี่ยง Contrast Error */}
                    <strong style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        ระบบติดตามงานมอบหมาย
                    </strong>
                </div>
            </Link>

            <Link href="/help" aria-label="ไปหน้าช่วยเหลือการใช้งาน">
                {/* 💡 แก้ไข: บังคับสีขาวบริสุทธิ์ */}
                <button className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors" style={{ minHeight: '44px', color: '#FFFFFF' }}>
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