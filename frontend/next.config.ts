import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
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
          {
            key: "X-Frame-Options",
            value: "DENY", // ป้องกัน Clickjacking
          },
          {
            key: "Content-Security-Policy",
            // อนุญาตให้รัน Script เฉพาะของตัวเอง และต่อ API ไปยัง Render ของคุณได้
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://projectpolice-1.onrender.com https://projectpolice.onrender.com http://localhost:5003;"
          },
        ],
      },
    ];
  },
};

export default nextConfig;