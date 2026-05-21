import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Infra Tools",
  description: "インフラエンジニア向け便利ツール集",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-[#2a2d3a] px-6 py-3 flex items-center gap-4">
          <Link href="/" className="text-[#38bdf8] font-bold text-lg tracking-tight hover:text-[#7dd3fc]">
            ⚙ Infra Tools
          </Link>
          <span className="text-[#64748b] text-sm">インフラエンジニア向け便利ツール集</span>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#2a2d3a] px-6 py-3 text-[#64748b] text-xs text-center">
          All processing is done client-side. No data is sent to any server.
        </footer>
      </body>
    </html>
  );
}
