import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 💡 แก้ไข: เพิ่ม Security Headers เพื่อกำหนด HSTS Policy
  async headers() {
    return [
      {
        // บังคับใช้กับทุกๆ Path ในเว็บไซต์
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;