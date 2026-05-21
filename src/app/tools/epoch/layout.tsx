import type { Metadata } from "next";
export const metadata: Metadata = { title: "Epoch タイム変換" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
