"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tools = [
  { href: "/", icon: "🏠", short: "ホーム" },
  { href: "/tools/dns", icon: "📧", short: "DNS認証" },
  { href: "/tools/mx", icon: "📬", short: "MX" },
  { href: "/tools/cidr", icon: "🌐", short: "CIDR" },
  { href: "/tools/ip", icon: "📍", short: "IP情報" },
  { href: "/tools/chmod", icon: "🔒", short: "chmod" },
  { href: "/tools/radix", icon: "🔢", short: "進数変換" },
  { href: "/tools/epoch", icon: "⏱", short: "Epoch" },
  { href: "/tools/base64", icon: "🔤", short: "Base64" },
  { href: "/tools/url", icon: "🔗", short: "URL" },
  { href: "/tools/jwt", icon: "🔑", short: "JWT" },
  { href: "/tools/hash", icon: "🔐", short: "ハッシュ" },
  { href: "/tools/json", icon: "📋", short: "JSON" },
  { href: "/tools/cron", icon: "🕐", short: "Cron" },
  { href: "/tools/uuid", icon: "🆔", short: "UUID" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {tools.map((tool) => {
        const isActive = tool.href === "/" ? pathname === "/" : pathname === tool.href;
        return (
          <Link
            key={tool.href}
            href={tool.href}
            className={`sidebar-item${isActive ? " sidebar-item-active" : ""}`}
            title={tool.short}
          >
            <span className="text-base leading-none">{tool.icon}</span>
            <span className="sidebar-label">{tool.short}</span>
          </Link>
        );
      })}
    </aside>
  );
}
