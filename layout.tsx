import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "초미니 게시판",
  description: "심플한 공유 게시판 샘플",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900 min-h-screen">{children}</body>
    </html>
  );
}
