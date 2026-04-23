import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. 修改 Metadata，讓網頁標籤顯示正確的名稱
export const metadata: Metadata = {
  title: "GLOBALPULSE | Geopolitical Intelligence Terminal",
  description: "Real-time geopolitical threat monitoring and analysis terminal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. 關鍵修改：將 lang 設為 "zh-TW" 並加入 suppressHydrationWarning
    <html
      lang="zh-TW"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* 3. 確保 body 設定為背景深色，避免載入地球前的閃白 */}
      <body className="min-h-full flex flex-col bg-[#050810] selection:bg-[#f5a524] selection:text-black">
        {children}
      </body>
    </html>
  );
}