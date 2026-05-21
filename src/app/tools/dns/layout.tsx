import type { Metadata } from "next";
export const metadata: Metadata = { title: "DNS チェッカー" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
