"use client";

import { useState } from "react";
import Link from "next/link";

function generateV4(): string {
  return crypto.randomUUID();
}

function generateV7(): string {
  const now = Date.now();
  const rand = crypto.getRandomValues(new Uint8Array(10));
  // タイムスタンプ 48ビットを上位32ビットと下位16ビットに分割
  const hi = Math.floor(now / 0x10000);
  const lo = now & 0xffff;
  const h1 = (hi >>> 16) & 0xffff;
  const h2 = hi & 0xffff;
  const h3 = lo;
  // version=7, ランダム12ビット
  const ver = (0x7000 | (rand[0] << 4 & 0x0ff0) | (rand[1] & 0x000f)) >>> 0;
  // variant=10xxxxxx
  const clk = ((rand[2] & 0x3f) | 0x80).toString(16).padStart(2, "0");
  const node = Array.from(rand.slice(3, 9)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return [
    h1.toString(16).padStart(4, "0") + h2.toString(16).padStart(4, "0"),
    h3.toString(16).padStart(4, "0"),
    ver.toString(16).padStart(4, "0"),
    clk + rand[3].toString(16).padStart(2, "0"),
    node,
  ].join("-");
}

export default function UuidPage() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [version, setVersion] = useState<"v4" | "v7">("v4");
  const [copied, setCopied] = useState<string | null>(null);

  function generate() {
    const gen = version === "v4" ? generateV4 : generateV7;
    setUuids(Array.from({ length: count }, gen));
    setCopied(null);
  }

  function copyOne(uuid: string) {
    navigator.clipboard?.writeText(uuid);
    setCopied(uuid);
    setTimeout(() => setCopied(null), 1500);
  }

  function copyAll() {
    navigator.clipboard?.writeText(uuids.join("\n"));
    setCopied("all");
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">🆔 UUID ジェネレーター</h1>
        <p className="text-[#64748b] text-sm mt-1">UUID v4（ランダム）・v7（タイムスタンプ順）を生成します</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-xs text-[#64748b] mb-1">バージョン</label>
            <div className="flex gap-2">
              {(["v4", "v7"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVersion(v)}
                  className={`px-4 py-1.5 rounded text-sm font-mono ${version === v ? "btn-primary" : "border border-[#2a2d3a] text-[#64748b]"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#64748b] mb-1">生成数</label>
            <input
              type="number"
              className="input-field rounded px-3 py-1.5 text-sm w-20 text-center"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            />
          </div>
        </div>
        <button className="btn-primary px-6 py-2 rounded text-sm" onClick={generate}>
          生成
        </button>
        <p className="text-xs text-[#64748b] mt-2">
          {version === "v4"
            ? "v4: 完全ランダム。最も一般的なUUID"
            : "v7: タイムスタンプ+ランダム。時系列ソートが可能（DB主キーに最適）"}
        </p>
      </div>

      {uuids.length > 0 && (
        <div className="tool-card rounded-lg p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-[#64748b]">{uuids.length}件生成</span>
            <button onClick={copyAll} className="text-xs text-[#64748b] hover:text-[#38bdf8]">
              {copied === "all" ? "✓ コピーしました" : "全てコピー"}
            </button>
          </div>
          <div className="space-y-1">
            {uuids.map((uuid) => (
              <div key={uuid} className="result-box rounded px-3 py-2 flex justify-between items-center">
                <span className="text-xs font-mono">{uuid}</span>
                <button
                  onClick={() => copyOne(uuid)}
                  className="text-xs text-[#64748b] hover:text-[#38bdf8] ml-3 shrink-0"
                >
                  {copied === uuid ? "✓" : "コピー"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tool-card rounded-lg p-4 mt-5">
        <h2 className="text-xs text-[#64748b] mb-3">UUID バージョン比較</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[#64748b] border-b border-[#2a2d3a]">
              <th className="text-left py-1.5 pr-3">バージョン</th>
              <th className="text-left py-1.5 pr-3">特徴</th>
              <th className="text-left py-1.5">用途</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["v4", "完全ランダム (122ビット)", "一般的なID生成・セッションID"],
              ["v7", "Unixタイムスタンプ+ランダム", "DB主キー・時系列ソートが必要な場合"],
            ].map(([v, f, u]) => (
              <tr key={v} className="border-b border-[#2a2d3a] last:border-0">
                <td className="py-2 pr-3 font-mono text-[#38bdf8]">{v}</td>
                <td className="py-2 pr-3 text-[#94a3b8]">{f}</td>
                <td className="py-2 text-[#64748b]">{u}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
