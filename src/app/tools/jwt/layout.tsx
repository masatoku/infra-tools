import type { Metadata } from "next";
export const metadata: Metadata = { title: "JWT デコーダー" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
