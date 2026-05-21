import type { Metadata } from "next";
export const metadata: Metadata = { title: "UUID ジェネレーター" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
