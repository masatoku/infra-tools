"use client";

import { useState } from "react";
import Link from "next/link";

type Base = 2 | 8 | 10 | 16;

function convert(value: string, from: Base): Record<Base, string> | null {
  const trimmed = value.trim().replace(/\s/g, "");
  if (!trimmed) return null;
  let decimal: number;
  try {
    decimal = parseInt(trimmed, from);
    if (isNaN(decimal) || decimal < 0) return null;
  } catch {
    return null;
  }
  return {
    2: decimal.toString(2),
    8: decimal.toString(8),
    10: decimal.toString(10),
    16: decimal.toString(16).toUpperCase(),
  };
}

function ipToHex(ip: string): string | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => parseInt(p, 10));
  if (nums.some((n) => isNaN(n) || n < 0 || n > 255)) return null;
  return nums.map((n) => n.toString(16).padStart(2, "0").toUpperCase()).join(":");
}

function hexToIp(hex: string): string | null {
  const clean = hex.trim().replace(/[:\s]/g, "");
  if (!/^[0-9a-fA-F]{8}$/.test(clean)) return null;
  return [0, 2, 4, 6].map((i) => parseInt(clean.slice(i, i + 2), 16)).join(".");
}

const BASES: { label: string; base: Base; prefix: string; pattern: string }[] = [
  { label: "2進数 (Binary)", base: 2, prefix: "0b", pattern: "[01]+" },
  { label: "8進数 (Octal)", base: 8, prefix: "0o", pattern: "[0-7]+" },
  { label: "10進数 (Decimal)", base: 10, prefix: "", pattern: "[0-9]+" },
  { label: "16進数 (Hex)", base: 16, prefix: "0x", pattern: "[0-9a-fA-F]+" },
];

export default function RadixPage() {
  const [inputs, setInputs] = useState<Record<Base, string>>({ 2: "", 8: "", 10: "", 16: "" });
  const [ipInput, setIpInput] = useState("");
  const [ipResult, setIpResult] = useState<{ hex: string | null; fromHex: string | null }>({ hex: null, fromHex: null });

  function handleChange(base: Base, value: string) {
    const result = convert(value, base);
    if (result) {
      setInputs(result);
    } else {
      setInputs({ 2: "", 8: "", 10: "", 16: "", [base]: value });
    }
  }

  function handleIp() {
    const hex = ipToHex(ipInput);
    const fromHex = hexToIp(ipInput);
    setIpResult({ hex, fromHex });
  }

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">🔢 進数変換</h1>
        <p className="text-[#64748b] text-sm mt-1">2進数・8進数・10進数・16進数を相互変換します</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <h2 className="text-sm font-semibold mb-4">数値変換</h2>
        <div className="space-y-3">
          {BASES.map(({ label, base, prefix }) => (
            <div key={base} className="flex items-center gap-3">
              <label className="text-xs text-[#64748b] w-40 shrink-0">{label}</label>
              <div className="flex flex-1 items-center gap-2">
                {prefix && <span className="text-xs text-[#475569] font-mono shrink-0">{prefix}</span>}
                <input
                  className="input-field flex-1 rounded px-3 py-1.5 text-sm font-mono"
                  value={inputs[base]}
                  onChange={(e) => handleChange(base, e.target.value)}
                  placeholder={base === 10 ? "255" : base === 16 ? "FF" : base === 2 ? "11111111" : "377"}
                  spellCheck={false}
                />
                {inputs[base] && (
                  <button onClick={() => copy(inputs[base])} className="text-xs text-[#64748b] hover:text-[#38bdf8] shrink-0">コピー</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {inputs[10] && (
          <div className="mt-4 pt-4 border-t border-[#2a2d3a] grid grid-cols-3 gap-3">
            {[
              { label: "符号付き32bit", value: (() => { const n = parseInt(inputs[10]); return n > 0x7fffffff ? (n - 0x100000000).toString() : n.toString(); })() },
              { label: "ビット幅", value: `${parseInt(inputs[10]).toString(2).length} bits` },
              { label: "バイト幅", value: `${Math.ceil(parseInt(inputs[10]).toString(2).length / 8)} bytes` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-[#64748b] mb-0.5">{label}</p>
                <p className="text-xs font-mono text-[#a3e635]">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tool-card rounded-lg p-5">
        <h2 className="text-sm font-semibold mb-3">IPv4 ↔ Hex 変換</h2>
        <div className="flex gap-2 mb-3">
          <input
            className="input-field flex-1 rounded px-3 py-2 text-sm font-mono"
            placeholder="192.168.1.1 または C0:A8:01:01"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleIp()}
          />
          <button className="btn-primary px-4 py-2 rounded text-sm" onClick={handleIp}>変換</button>
        </div>
        {ipResult.hex && (
          <div className="result-box rounded p-3 mb-2 flex justify-between items-center">
            <div>
              <p className="text-xs text-[#64748b] mb-0.5">IPv4 → Hex</p>
              <p className="text-sm font-mono text-[#a3e635]">{ipResult.hex}</p>
            </div>
            <button onClick={() => copy(ipResult.hex!)} className="text-xs text-[#64748b] hover:text-[#38bdf8]">コピー</button>
          </div>
        )}
        {ipResult.fromHex && (
          <div className="result-box rounded p-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-[#64748b] mb-0.5">Hex → IPv4</p>
              <p className="text-sm font-mono text-[#a3e635]">{ipResult.fromHex}</p>
            </div>
            <button onClick={() => copy(ipResult.fromHex!)} className="text-xs text-[#64748b] hover:text-[#38bdf8]">コピー</button>
          </div>
        )}
        {ipInput && !ipResult.hex && !ipResult.fromHex && (
          <p className="text-xs text-[#f87171]">無効な形式です（例: 192.168.1.1 または C0A80101）</p>
        )}
      </div>
    </div>
  );
}
