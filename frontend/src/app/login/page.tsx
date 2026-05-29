"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User } from 'lucide-react'; // ลง lucide-react ด้วยนะครับ

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5003';

        try {
            const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict; Secure`;
                router.push('/');
            } else {
                alert(data.msg || 'Login failed');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // ใช้ h-screen และ overflow-hidden เพื่อไม่ให้ scroll
        <div className="h-screen w-full flex items-center justify-center bg-[var(--background)] overflow-hidden p-4">
            
            {/* Card Container */}
            <div className="w-full max-w-md bg-[var(--container)] p-8 rounded-2xl shadow-2xl border border-[var(--shadow)] transition-all">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--header)] mb-2">ยินดีต้อนรับ</h1>
                    <p className="text-[var(--foreground)] opacity-70">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Username Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                            <User size={16} /> ชื่อผู้ใช้งาน
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--button)] border border-[var(--shadow)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--header-bg)] outline-none transition-all"
                            placeholder="กรอกชื่อผู้ใช้งาน"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                            <Lock size={16} /> รหัสผ่าน
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--button)] border border-[var(--shadow)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--header-bg)] outline-none transition-all"
                                placeholder="กรอกรหัสผ่าน"
                                required
                            />
                            {/* Toggle Show/Hide Password */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)] opacity-50 hover:opacity-100 transition-opacity"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-[var(--greenText)] transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--greenBG)]'}`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                กำลังเข้าสู่ระบบ...
                            </div>
                        ) : (
                            "เข้าสู่ระบบ"
                        )}
                    </button>
                </form>

                {/* Footer Decor */}
            </div>
        </div>
    );
};

export default LoginPage;