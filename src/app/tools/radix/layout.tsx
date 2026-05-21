import type { Metadata } from "next";
export const metadata: Metadata = { title: "進数変換" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
