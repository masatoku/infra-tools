"use client";

import { useState } from "react";
import Link from "next/link";

type RecordResult = {
  type: "DKIM" | "SPF" | "DMARC";
  status: "ok" | "warn" | "error" | "none";
  record: string | null;
  message: string;
};

type DoHResponse = {
  Answer?: { data: string }[];
  Status: number;
};

async function queryDNS(name: string, type: string): Promise<string[]> {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("DNS query failed");
  const data: DoHResponse = await res.json();
  return (data.Answer ?? []).map((a) => a.data.replace(/^"|"$/g, "").replace(/" "/g, ""));
}

function analyzeSPF(record: string): string {
  if (!record.startsWith("v=spf1")) return "SPFレコードではありません";
  const parts = record.split(" ");
  const mechanisms: string[] = [];
  let hasAll = false;
  for (const p of parts) {
    if (p === "v=spf1") continue;
    if (p.startsWith("+all") || p === "all") { mechanisms.push("⚠ ~all推奨（allは全許可）"); hasAll = true; }
    else if (p === "-all") { mechanisms.push("✓ -all（不正メール拒否）"); hasAll = true; }
    else if (p === "~all") { mechanisms.push("✓ ~all（ソフトフェイル）"); hasAll = true; }
    else if (p === "?all") { mechanisms.push("⚠ ?all（中立、非推奨）"); hasAll = true; }
    else mechanisms.push(p);
  }
  if (!hasAll) mechanisms.push("⚠ allディレクティブがありません");
  return mechanisms.join("\n");
}

function analyzeDMARC(record: string): string {
  if (!record.startsWith("v=DMARC1")) return "DMARCレコードではありません";
  const parts = record.split(";").map((s) => s.trim()).filter(Boolean);
  const info: string[] = [];
  for (const p of parts) {
    if (p.startsWith("p=")) {
      const policy = p.slice(2);
      if (policy === "none") info.push("⚠ p=none（監視のみ、メール拒否なし）");
      else if (policy === "quarantine") info.push("✓ p=quarantine（迷惑メールへ隔離）");
      else if (policy === "reject") info.push("✓ p=reject（完全拒否）");
    } else if (p.startsWith("rua=")) {
      info.push(`✓ 集計レポート送信先: ${p.slice(4)}`);
    } else if (p.startsWith("ruf=")) {
      info.push(`✓ 失敗レポート送信先: ${p.slice(4)}`);
    } else if (p.startsWith("pct=")) {
      info.push(`ポリシー適用率: ${p.slice(4)}%`);
    } else {
      info.push(p);
    }
  }
  return info.join("\n");
}

export default function DnsPage() {
  const [domain, setDomain] = useState("");
  const [selector, setSelector] = useState("default");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecordResult[]>([]);
  const [error, setError] = useState("");

  async function check() {
    const d = domain.trim().toLowerCase();
    if (!d) return;

    // ドメイン名のバリデーション
    if (d.length > 253) { setError("ドメイン名が長すぎます（253文字以内）"); return; }
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(d)) {
      setError("無効なドメイン名です"); return;
    }
    const sel = selector.trim();
    if (sel.length > 63) { setError("セレクター名が長すぎます（63文字以内）"); return; }
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(sel)) {
      setError("無効なセレクター名です（英数字とハイフンのみ）"); return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const out: RecordResult[] = [];

      // DKIM
      const dkimName = `${selector.trim()}._domainkey.${d}`;
      const dkimRecords = await queryDNS(dkimName, "TXT");
      const dkimRaw = dkimRecords.find((r) => r.includes("v=DKIM1")) ?? null;
      if (dkimRaw) {
        const hasKey = dkimRaw.includes("p=") && !dkimRaw.includes("p=;") && !dkimRaw.includes("p= ");
        out.push({
          type: "DKIM",
          status: hasKey ? "ok" : "warn",
          record: dkimRaw,
          message: hasKey ? "DKIMレコードが正常に設定されています" : "公開鍵 (p=) が空か見つかりません",
        });
      } else {
        out.push({ type: "DKIM", status: "none", record: null, message: `${dkimName} にTXTレコードが見つかりません` });
      }

      // SPF
      const spfRecords = await queryDNS(d, "TXT");
      const spfRaw = spfRecords.find((r) => r.startsWith("v=spf1")) ?? null;
      if (spfRaw) {
        const good = spfRaw.includes("-all") || spfRaw.includes("~all");
        out.push({
          type: "SPF",
          status: good ? "ok" : "warn",
          record: spfRaw,
          message: analyzeSPF(spfRaw),
        });
      } else {
        out.push({ type: "SPF", status: "none", record: null, message: "SPFレコードが見つかりません" });
      }

      // DMARC
      const dmarcRecords = await queryDNS(`_dmarc.${d}`, "TXT");
      const dmarcRaw = dmarcRecords.find((r) => r.startsWith("v=DMARC1")) ?? null;
      if (dmarcRaw) {
        const strong = dmarcRaw.includes("p=reject") || dmarcRaw.includes("p=quarantine");
        out.push({
          type: "DMARC",
          status: strong ? "ok" : "warn",
          record: dmarcRaw,
          message: analyzeDMARC(dmarcRaw),
        });
      } else {
        out.push({ type: "DMARC", status: "none", record: null, message: "_dmarc.ドメインのTXTレコードが見つかりません" });
      }

      setResults(out);
    } catch (e) {
      setError("DNS問い合わせに失敗しました。ドメイン名を確認してください。");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const badgeClass = (status: RecordResult["status"]) =>
    status === "ok" ? "badge-ok" : status === "warn" ? "badge-warn" : "badge-error";

  const badgeLabel = (status: RecordResult["status"]) =>
    status === "ok" ? "OK" : status === "warn" ? "WARN" : "NOT FOUND";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">📧 DNS / メール認証チェッカー</h1>
        <p className="text-[#64748b] text-sm mt-1">DKIM・SPF・DMARCレコードを一括確認します</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-[#64748b] mb-1">ドメイン名</label>
            <input
              className="input-field w-full rounded px-3 py-2 text-sm"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && check()}
            />
          </div>
          <div>
            <label className="block text-xs text-[#64748b] mb-1">DKIMセレクター</label>
            <input
              className="input-field w-full rounded px-3 py-2 text-sm"
              placeholder="default"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && check()}
            />
          </div>
        </div>
        <button
          className="btn-primary px-5 py-2 rounded text-sm w-full sm:w-auto"
          onClick={check}
          disabled={loading}
        >
          {loading ? "確認中..." : "チェックする"}
        </button>
      </div>

      {error && <p className="text-[#f87171] text-sm mb-4">{error}</p>}

      {results.map((r) => (
        <div key={r.type} className="tool-card rounded-lg p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-bold text-sm">{r.type}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-mono ${badgeClass(r.status)}`}>
              {badgeLabel(r.status)}
            </span>
          </div>
          {r.record && (
            <div className="result-box rounded p-3 text-xs font-mono mb-3 break-all whitespace-pre-wrap">
              {r.record}
            </div>
          )}
          <p className="text-xs text-[#94a3b8] whitespace-pre-line">{r.message}</p>
        </div>
      ))}
    </div>
  );
}
