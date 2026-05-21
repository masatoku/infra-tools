"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type IpInfo = {
  ip: string;
  city: string;
  region: string;
  country: string;
  org: string;
  timezone: string;
  loc: string;
};

type Row = { label: string; value: string };

async function fetchIpInfo(ip: string): Promise<IpInfo> {
  const target = ip.trim() || "";
  const url = target ? `https://ipinfo.io/${encodeURIComponent(target)}/json` : "https://ipinfo.io/json";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function isPrivate(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;
  return false;
}

export default function IpPage() {
  const [input, setInput] = useState("");
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myIp, setMyIp] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://ipinfo.io/json")
      .then((r) => r.json())
      .then((d: IpInfo) => setMyIp(d.ip))
      .catch(() => null);
  }, []);

  async function lookup(ip?: string) {
    setLoading(true);
    setError("");
    setInfo(null);
    try {
      const result = await fetchIpInfo(ip ?? input);
      setInfo(result);
    } catch {
      setError("IPアドレスの情報取得に失敗しました。プライベートIPや無効なアドレスは検索できません。");
    } finally {
      setLoading(false);
    }
  }

  const rows: Row[] = info
    ? [
        { label: "IPアドレス", value: info.ip },
        { label: "都市", value: info.city || "-" },
        { label: "地域", value: info.region || "-" },
        { label: "国", value: info.country || "-" },
        { label: "組織 / ASN", value: info.org || "-" },
        { label: "タイムゾーン", value: info.timezone || "-" },
        { label: "座標", value: info.loc || "-" },
      ]
    : [];

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">📍 IP アドレス情報</h1>
        <p className="text-[#64748b] text-sm mt-1">IPアドレスの地理情報・ASN・ISPを調べます（ipinfo.io 使用）</p>
      </div>

      {myIp && (
        <div className="tool-card rounded-lg p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#64748b] mb-0.5">あなたのIPアドレス</p>
            <p className="font-mono text-[#a3e635]">{myIp}</p>
          </div>
          <button className="btn-primary px-4 py-1.5 rounded text-xs" onClick={() => { setInput(myIp); lookup(myIp); }}>
            この IPを調べる
          </button>
        </div>
      )}

      <div className="tool-card rounded-lg p-5 mb-5">
        <label className="block text-xs text-[#64748b] mb-1">IPアドレス（空白で自分のIPを調べます）</label>
        <div className="flex gap-2">
          <input
            className="input-field flex-1 rounded px-3 py-2 text-sm font-mono"
            placeholder="8.8.8.8"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button className="btn-primary px-5 py-2 rounded text-sm" onClick={() => lookup()} disabled={loading}>
            {loading ? "検索中..." : "調べる"}
          </button>
        </div>
        {error && <p className="text-[#f87171] text-xs mt-2">{error}</p>}
      </div>

      {info && (
        <>
          {isPrivate(info.ip) && (
            <div className="badge-warn rounded p-3 mb-4 text-xs">
              ⚠ プライベートIPアドレスです。地理情報は取得できません。
            </div>
          )}
          <div className="tool-card rounded-lg p-5 mb-4">
            <h2 className="text-sm font-semibold mb-4 text-[#38bdf8]">{info.ip} の情報</h2>
            {rows.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-[#2a2d3a] last:border-0">
                <span className="text-xs text-[#64748b]">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-[#e2e8f0]">{value}</span>
                  {value !== "-" && (
                    <button onClick={() => copy(value)} className="text-xs text-[#64748b] hover:text-[#38bdf8]">コピー</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {info.loc && (
            <a
              href={`https://www.google.com/maps?q=${info.loc}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tool-card rounded-lg p-3 flex items-center gap-2 hover:border-[#38bdf8] text-sm text-[#64748b] hover:text-[#38bdf8]"
            >
              <span>🗺</span>
              <span>Google Mapsで見る ({info.loc})</span>
            </a>
          )}
        </>
      )}
    </div>
  );
}
