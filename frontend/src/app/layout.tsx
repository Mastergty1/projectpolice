import type { Metadata } from "next";
import { Geist, Geist_Mono, Sarabun } from "next/font/google";
// @ts-ignore: CSS import without type declarations
import "./globals.css";
import TopBar from "@/components/TopBar";

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["400", "700"],
  variable: "--font-sarabun",
});

// 💡 แก้ไข: เพิ่ม Meta Description และ Title ที่มีความหมายสำหรับ SEO
export const metadata: Metadata = {
  title: "Project Police - ระบบจัดการและติดตามงาน",
  description: "ระบบสำหรับการจัดการ ติดตามงาน และมอบหมายงานภายในองค์กรอย่างมีประสิทธิภาพ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 💡 แก้ไข: เปลี่ยน lang เป็น "th" เพื่อให้ถูกต้องตามบริบทของเว็บ
    <html lang="th">
      <body className={`${sarabun.variable} font-sans antialiased`}>
        
        <div className="flex flex-col h-screen">
          
          {/* 💡 แก้ไข: ครอบ TopBar ด้วย <header> เพื่อเป็น Landmark ให้ Screen Reader */}
          <header>
            <TopBar />
          </header>

          {/* 💡 แก้ไข: เพิ่ม role="main" เพื่อระบุ Main Landmark ที่ชัดเจน */}
          <main role="main" className="flex-1 overflow-auto">
            {children}
          </main>

        </div>

      </body>
    </html>
  );
}