import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const metadata: Metadata = {
  title: { default: "Infra Tools", template: "%s | Infra Tools" },
  description: "インフラエンジニア向け便利ツール集。DKIM/SPF/DMARC確認、CIDR計算、JWT解析、Epoch変換など。全処理はブラウザ内で完結。",
  keywords: ["インフラ", "DNS", "DKIM", "SPF", "DMARC", "CIDR", "JWT", "Base64", "chmod", "エンジニア"],
  openGraph: {
    title: "Infra Tools",
    description: "インフラエンジニア向け便利ツール集",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
        <header className="border-b border-[#2a2d3a] px-6 py-3 flex items-center gap-4">
          <Link href="/" className="text-[#38bdf8] font-bold text-lg tracking-tight hover:text-[#7dd3fc]">
            ⚙ Infra Tools
          </Link>
          <span className="text-[#64748b] text-sm hidden sm:block">インフラエンジニア向け便利ツール集</span>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#2a2d3a] px-6 py-3 text-[#64748b] text-xs text-center">
          All processing is done client-side. No data is sent to any server.
        </footer>
      </body>
    </html>
  );
}
