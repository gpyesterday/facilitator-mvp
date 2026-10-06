import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "학습자 지원 퍼실리테이터 플랫폼",
  description: "학습자 지원을 위한 퍼실리테이터 정보 공유 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
