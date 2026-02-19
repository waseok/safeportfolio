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
  // 포트폴리오 페이지 전체에서 일관된 모노 폰트를 사용할 수 있도록 변수로 분리해 둡니다.
});

export const metadata: Metadata = {
  // 브라우저 탭 / 검색 엔진 등에 노출될 공식 프로젝트 이름
  title: "SAFE 프로젝트 포트폴리오",
  // SAFE 서비스의 목적과 성격을 한 문장으로 요약한 설명
  description:
    "SAFE(Safety Awareness for Everyone) 프로젝트의 기획 의도, 핵심 기능, 사용 기술을 정리한 포트폴리오 페이지입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
