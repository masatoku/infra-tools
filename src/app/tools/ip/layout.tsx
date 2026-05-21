import type { Metadata } from "next";
export const metadata: Metadata = { title: "IP アドレス情報" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
