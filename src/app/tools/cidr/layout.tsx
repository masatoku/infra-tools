import type { Metadata } from "next";
export const metadata: Metadata = { title: "CIDR / サブネット計算機" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
