"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, LogIn } from 'lucide-react';
import DarkModeBtn from './DarkModeBtn';

export default function TopBar() {
    const [user, setUser] = useState<{ id: string; name: string; color?: string } | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5003';

    // เช็คสถานะ Login
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                if (!token) return;

                const res = await fetch(`${backendUrl}/api/v1/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setUser(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        };
        fetchUser();
    }, [backendUrl]);

    // ปิด dropdown เมื่อคลิกที่อื่น
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            await fetch(`${backendUrl}/api/v1/auth/logout`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            setUser(null);
            router.push('/login');
        } catch (err) {
            console.error("Logout error", err);
        }
    };

    return (
       <div 
        id="main-topbar" 
        className="flex justify-between items-center w-full px-6 py-4 shadow-md z-50 relative"
        style={{ backgroundColor: 'var(--header-bg)' }}
        >
            <Link href="/" aria-label="กลับหน้าหลัก ระบบติดตามงานมอบหมาย">
                <div className="flex items-center gap-4 group">
                    <Image 
                        src="/police.png" 
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

            <div className="flex items-center gap-4">
                <DarkModeBtn />

                <Link href="/help" aria-label="ไปหน้าช่วยเหลือการใช้งาน">
                    <button className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
                        <Image src="/window.svg" alt="ไอคอนช่วยเหลือ" width={24} height={24} />
                        <span className="font-medium hidden sm:inline">ช่วยเหลือ</span>
                    </button>
                </Link>

                {/* Authentication Section */}
                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 bg-[var(--button)] hover:opacity-80 px-4 py-2 rounded-lg transition-colors border border-[var(--shadow)]"
                        >
                            {/* 💡 เปลี่ยนเป็นรูป user.png และแสดงชื่อผู้ใช้ด้านข้าง */}
                            <Image 
                                src="/user.png" 
                                alt="รูปโปรไฟล์ผู้ใช้งาน" 
                                width={24} 
                                height={24} 
                                className="rounded-full object-cover"
                            />
                            <span className="font-medium text-[var(--foreground)]">{user.name}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-[var(--container)] border border-[var(--shadow)] rounded-xl shadow-lg py-2 flex flex-col overflow-hidden">
                                {/* ส่วนหัวของ Dropdown แสดงรูปและชื่อให้ชัดเจน */}
                                <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--shadow)] bg-[var(--button)]/40">
                                    <Image 
                                        src="/user.png" 
                                        alt="รูปโปรไฟล์ย่อ" 
                                        width={20} 
                                        height={20} 
                                        className="rounded-full"
                                    />
                                    <span className="font-semibold text-xs text-[var(--foreground)] truncate">{user.name}</span>
                                </div>
                                
                                <Link 
                                    href="/user" 
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--button)] text-[var(--foreground)] transition-colors"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <Settings size={18} /> จัดการโปรไฟล์
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-500 transition-colors w-full text-left"
                                >
                                    <LogOut size={18} /> ออกจากระบบ
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login">
                        <button className="flex items-center gap-2 bg-[var(--orangeBG)] hover:opacity-90 text-white px-5 py-2 rounded-lg transition-colors shadow-md font-medium">
                            <LogIn size={18} /> เข้าสู่ระบบ
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}