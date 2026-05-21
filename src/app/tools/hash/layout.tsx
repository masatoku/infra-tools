import type { Metadata } from "next";
export const metadata: Metadata = { title: "ハッシュ計算" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
