import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "软通动力新闻智能整理器",
  description: "实时追踪软通动力最新动态 · 智能分类 · 全文检索",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
