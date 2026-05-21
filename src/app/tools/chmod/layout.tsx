import type { Metadata } from "next";
export const metadata: Metadata = { title: "chmod 計算機" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
