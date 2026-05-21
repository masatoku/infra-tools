"use client";

import { useState } from "react";
import Link from "next/link";

type MxRecord = { priority: number; exchange: string };
type TxtRecord = string;

type DoHResponse = {
  Answer?: { data: string; type: number }[];
  Status: number;
};

async function queryMX(domain: string): Promise<MxRecord[]> {
  const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`);
  if (!res.ok) throw new Error("DNS query failed");
  const data: DoHResponse = await res.json();
  if (!data.Answer) return [];
  return data.Answer
    .map((a) => {
      const parts = a.data.trim().split(/\s+/);
      return { priority: parseInt(parts[0], 10), exchange: parts[1]?.replace(/\.$/, "") ?? "" };
    })
    .sort((a, b) => a.priority - b.priority);
}

async function queryTXT(domain: string): Promise<TxtRecord[]> {
  const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`);
  if (!res.ok) return [];
  const data: DoHResponse = await res.json();
  return (data.Answer ?? []).map((a) => a.data.replace(/^"|"$/g, "").replace(/" "/g, ""));
}

function guessProvider(exchange: string): string {
  const e = exchange.toLowerCase();
  if (e.includes("google") || e.includes("googlemail")) return "Google Workspace";
  if (e.includes("outlook") || e.includes("protection.outlook")) return "Microsoft 365";
  if (e.includes("amazonses") || e.includes("amazonaws")) return "Amazon SES";
  if (e.includes("mailgun")) return "Mailgun";
  if (e.includes("sendgrid")) return "SendGrid";
  if (e.includes("protonmail")) return "Proton Mail";
  if (e.includes("zoho")) return "Zoho Mail";
  return "";
}

export default function MxPage() {
  const [domain, setDomain] = useState("");
  const [mxRecords, setMxRecords] = useState<MxRecord[]>([]);
  const [spf, setSpf] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);

  async function check() {
    const d = domain.trim().toLowerCase();
    if (!d) return;
    if (d.length > 253 || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(d)) {
      setError("無効なドメイン名です"); return;
    }
    setLoading(true);
    setError("");
    setMxRecords([]);
    setSpf(null);
    setChecked(false);
    try {
      const [mx, txts] = await Promise.all([queryMX(d), queryTXT(d)]);
      setMxRecords(mx);
      setSpf(txts.find((t) => t.startsWith("v=spf1")) ?? null);
      setChecked(true);
    } catch {
      setError("DNS問い合わせに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  const provider = mxRecords.length > 0 ? guessProvider(mxRecords[0].exchange) : "";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">📬 MX レコードチェッカー</h1>
        <p className="text-[#64748b] text-sm mt-1">メール受信サーバー（MXレコード）とSPFを確認します</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-6">
        <label className="block text-xs text-[#64748b] mb-1">ドメイン名</label>
        <div className="flex gap-2">
          <input
            className="input-field flex-1 rounded px-3 py-2 text-sm"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
          />
          <button className="btn-primary px-5 py-2 rounded text-sm" onClick={check} disabled={loading}>
            {loading ? "確認中..." : "チェック"}
          </button>
        </div>
        {error && <p className="text-[#f87171] text-xs mt-2">{error}</p>}
      </div>

      {checked && mxRecords.length === 0 && (
        <div className="badge-error rounded p-4 mb-4 text-sm">MXレコードが見つかりません（メール受信不可）</div>
      )}

      {provider && (
        <div className="badge-ok rounded p-3 mb-4 text-sm">
          推定メールプロバイダー: <span className="font-semibold">{provider}</span>
        </div>
      )}

      {mxRecords.length > 0 && (
        <div className="tool-card rounded-lg p-5 mb-4">
          <h2 className="text-sm font-semibold mb-3 text-[#38bdf8]">MXレコード（優先度順）</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#64748b] border-b border-[#2a2d3a]">
                <th className="text-left py-2 w-20">優先度</th>
                <th className="text-left py-2">メールサーバー</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {mxRecords.map((r, i) => (
                <tr key={i} className="border-b border-[#2a2d3a] last:border-0">
                  <td className="py-2 text-[#facc15]">{r.priority}</td>
                  <td className="py-2 text-[#a3e635]">{r.exchange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {checked && (
        <div className="tool-card rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-2 text-[#38bdf8]">SPFレコード</h2>
          {spf ? (
            <div className="result-box rounded p-3 text-xs font-mono break-all">{spf}</div>
          ) : (
            <p className="text-xs text-[#f87171]">SPFレコードが見つかりません（なりすましメールのリスクあり）</p>
          )}
        </div>
      )}
    </div>
  );
}
