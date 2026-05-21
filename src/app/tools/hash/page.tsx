"use client";

import { useState } from "react";
import Link from "next/link";

type HashResult = { algo: string; hex: string };

async function computeHash(text: string, algo: string): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const ALGOS = [
  { label: "SHA-1", algo: "SHA-1", color: "#f87171", warn: true },
  { label: "SHA-256", algo: "SHA-256", color: "#a3e635", warn: false },
  { label: "SHA-384", algo: "SHA-384", color: "#38bdf8", warn: false },
  { label: "SHA-512", algo: "SHA-512", color: "#a78bfa", warn: false },
];

export default function HashPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<HashResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function compute() {
    if (!input) return;
    setLoading(true);
    const out: HashResult[] = [];
    for (const { label, algo } of ALGOS) {
      const hex = await computeHash(input, algo);
      out.push({ algo: label, hex });
    }
    setResults(out);
    setLoading(false);
  }

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">🔐 ハッシュ計算</h1>
        <p className="text-[#64748b] text-sm mt-1">テキストのSHA-1 / SHA-256 / SHA-384 / SHA-512ハッシュを計算します（ブラウザ内処理）</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <label className="block text-xs text-[#64748b] mb-1">ハッシュ化するテキスト</label>
        <textarea
          className="input-field w-full rounded px-3 py-2 text-sm font-mono resize-none mb-3"
          rows={5}
          placeholder="ハッシュ化したいテキストを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
        <div className="flex items-center gap-3">
          <button className="btn-primary px-5 py-2 rounded text-sm" onClick={compute} disabled={loading || !input}>
            {loading ? "計算中..." : "ハッシュ計算"}
          </button>
          <span className="text-xs text-[#64748b]">{new TextEncoder().encode(input).length} bytes</span>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r) => {
            const meta = ALGOS.find((a) => a.label === r.algo)!;
            return (
              <div key={r.algo} className="tool-card rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: meta.color }}>{r.algo}</span>
                    {meta.warn && (
                      <span className="badge-warn text-xs px-2 py-0.5 rounded">非推奨（衝突脆弱性あり）</span>
                    )}
                  </div>
                  <button onClick={() => copy(r.hex)} className="text-xs text-[#64748b] hover:text-[#38bdf8]">
                    コピー
                  </button>
                </div>
                <p className="result-box rounded p-3 text-xs font-mono break-all">{r.hex}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="tool-card rounded-lg p-4 mt-5">
        <h2 className="text-xs text-[#64748b] mb-3">アルゴリズム選択ガイド</h2>
        <div className="space-y-2 text-xs">
          <div className="flex gap-2"><span className="badge-error px-2 py-0.5 rounded">SHA-1</span><span className="text-[#64748b]">衝突攻撃が可能。新規利用は非推奨。後方互換のみ</span></div>
          <div className="flex gap-2"><span className="badge-ok px-2 py-0.5 rounded">SHA-256</span><span className="text-[#64748b]">現在の標準。TLS証明書・パスワードハッシュ・ファイル検証に推奨</span></div>
          <div className="flex gap-2"><span className="badge-ok px-2 py-0.5 rounded">SHA-512</span><span className="text-[#64748b]">より高いセキュリティが必要な場合。64bit CPUでSHA-256より高速なことも</span></div>
        </div>
      </div>
    </div>
  );
}
