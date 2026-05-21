"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

const tools = [
  { href: "/tools/dns", icon: "📧", title: "DNS / メール認証チェッカー", description: "DKIM・SPF・DMARCレコードを確認し、設定ミスを検出します", tags: ["DKIM", "SPF", "DMARC", "DNS"] },
  { href: "/tools/mx", icon: "📬", title: "MX レコードチェッカー", description: "メール受信サーバーのMXレコードとSPFを確認します", tags: ["MX", "DNS", "メール"] },
  { href: "/tools/cidr", icon: "🌐", title: "CIDR / サブネット計算機", description: "IPアドレスとCIDR表記からネットワーク情報を計算します", tags: ["CIDR", "Subnet", "IPv4"] },
  { href: "/tools/ip", icon: "📍", title: "IP アドレス情報", description: "IPアドレスの地理情報・ASN・ISPを調べます", tags: ["IP", "GeoIP", "ASN", "ISP"] },
  { href: "/tools/chmod", icon: "🔒", title: "chmod 計算機", description: "8進数・シンボル・チェックボックスでLinux権限を相互変換します", tags: ["chmod", "Linux", "権限"] },
  { href: "/tools/radix", icon: "🔢", title: "進数変換", description: "2進数・8進数・10進数・16進数を相互変換します", tags: ["hex", "binary", "進数", "16進数"] },
  { href: "/tools/epoch", icon: "⏱", title: "Epochタイム変換", description: "UnixタイムスタンプとJST/UTC日時を相互変換します", tags: ["Epoch", "Unix", "Timestamp", "JST"] },
  { href: "/tools/base64", icon: "🔤", title: "Base64 エンコード / デコード", description: "テキスト・バイナリをBase64でエンコード/デコードします", tags: ["Base64", "Encode", "Decode"] },
  { href: "/tools/url", icon: "🔗", title: "URL エンコード / デコード", description: "URLエンコード・デコードとクエリ文字列の解析・生成を行います", tags: ["URL", "Encode", "Query"] },
  { href: "/tools/jwt", icon: "🔑", title: "JWT デコーダー", description: "JWTトークンのHeader・Payload・Signatureを解析します", tags: ["JWT", "Token", "Auth"] },
  { href: "/tools/hash", icon: "🔐", title: "ハッシュ計算", description: "SHA-1・SHA-256・SHA-384・SHA-512ハッシュを計算します（ブラウザ内処理）", tags: ["SHA-256", "Hash", "Crypto"] },
  { href: "/tools/json", icon: "📋", title: "JSON フォーマッター", description: "JSONの整形・圧縮・バリデーションを行います", tags: ["JSON", "Format", "Validate"] },
  { href: "/tools/cron", icon: "🕐", title: "Cron式パーサー", description: "Cron式の意味を解説し、次回実行日時を表示します", tags: ["Cron", "Schedule"] },
  { href: "/tools/uuid", icon: "🆔", title: "UUID ジェネレーター", description: "UUID v4（ランダム）・v7（タイムスタンプ順）を一括生成します", tags: ["UUID", "v4", "v7"] },
];

export default function Home() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return tools;
    return tools.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#38bdf8] mb-2">Infra Tools</h1>
        <p className="text-[#64748b] mb-5">インフラエンジニアの日常作業を効率化するツール集。全処理はブラウザ内で完結します。</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">🔍</span>
          <input
            className="input-field w-full rounded-lg pl-9 pr-4 py-2.5 text-sm"
            placeholder="ツールを検索... (例: DNS, chmod, hash)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#e2e8f0] text-sm">✕</button>
          )}
        </div>
        {query && (
          <p className="text-xs text-[#64748b] mt-2">{filtered.length}件のツールが見つかりました</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#64748b]">
          <p className="text-4xl mb-3">🔍</p>
          <p>「{query}」に一致するツールが見つかりません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => (
            <Link key={tool.href} href={tool.href} className="tool-card rounded-lg p-5 block">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{tool.icon}</span>
                <h2 className="font-semibold text-sm leading-tight">{tool.title}</h2>
              </div>
              <p className="text-[#64748b] text-xs mb-4 leading-relaxed">{tool.description}</p>
              <div className="flex flex-wrap gap-1">
                {tool.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[#0f1117] border border-[#2a2d3a] text-[#64748b]">{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
