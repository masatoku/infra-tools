"use client";

import { useState } from "react";
import Link from "next/link";

type ParseResult =
  | { ok: true; formatted: string; minified: string; size: number; keys: number }
  | { ok: false; message: string; line?: number; col?: number };

function parseJson(input: string): ParseResult {
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    const minified = JSON.stringify(parsed);
    const keys = countKeys(parsed);
    return { ok: true, formatted, minified, size: new TextEncoder().encode(minified).length, keys };
  } catch (e) {
    const msg = (e as Error).message;
    const pos = msg.match(/position (\d+)/);
    if (pos) {
      const idx = parseInt(pos[1], 10);
      const before = input.slice(0, idx);
      const line = before.split("\n").length;
      const col = idx - before.lastIndexOf("\n");
      return { ok: false, message: msg, line, col };
    }
    return { ok: false, message: msg };
  }
}

function countKeys(obj: unknown): number {
  if (typeof obj !== "object" || obj === null) return 0;
  if (Array.isArray(obj)) return obj.reduce<number>((s, v) => s + countKeys(v), 0);
  const keys = Object.keys(obj as Record<string, unknown>);
  return keys.length + keys.reduce<number>((s, k) => s + countKeys((obj as Record<string, unknown>)[k]), 0);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function JsonPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [view, setView] = useState<"formatted" | "minified">("formatted");

  function process() {
    if (!input.trim()) return;
    setResult(parseJson(input));
  }

  function loadExample() {
    const example = JSON.stringify(
      { server: { host: "example.com", port: 443, tls: true }, tags: ["web", "prod"], uptime: 99.9 },
      null, 2
    );
    setInput(example);
    setResult(parseJson(example));
  }

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  const output = result?.ok ? (view === "formatted" ? result.formatted : result.minified) : "";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">📋 JSON フォーマッター / バリデーター</h1>
        <p className="text-[#64748b] text-sm mt-1">JSONの整形・圧縮・バリデーションを行います</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-[#64748b]">JSON入力</label>
          <button onClick={loadExample} className="text-xs text-[#64748b] hover:text-[#38bdf8]">サンプルを読み込む</button>
        </div>
        <textarea
          className="input-field w-full rounded px-3 py-2 text-xs font-mono resize-none mb-3"
          rows={8}
          placeholder='{"key": "value"}'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
        <button className="btn-primary px-5 py-2 rounded text-sm" onClick={process}>
          解析
        </button>
      </div>

      {result && !result.ok && (
        <div className="badge-error rounded p-4 mb-5">
          <p className="text-sm font-semibold mb-1">JSONパースエラー</p>
          <p className="text-xs font-mono">{result.message}</p>
          {result.line && <p className="text-xs mt-1 text-[#64748b]">行 {result.line}、列 {result.col}</p>}
        </div>
      )}

      {result?.ok && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "サイズ（圧縮後）", value: formatBytes(result.size) },
              { label: "トータルキー数", value: result.keys.toLocaleString() },
              { label: "ステータス", value: "✓ 有効なJSON" },
            ].map(({ label, value }) => (
              <div key={label} className="tool-card rounded-lg p-3 text-center">
                <p className="text-xs text-[#64748b] mb-1">{label}</p>
                <p className="text-sm font-mono text-[#a3e635]">{value}</p>
              </div>
            ))}
          </div>

          <div className="tool-card rounded-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-2">
                {(["formatted", "minified"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`text-xs px-3 py-1 rounded ${view === v ? "btn-primary" : "border border-[#2a2d3a] text-[#64748b]"}`}
                  >
                    {v === "formatted" ? "整形" : "圧縮"}
                  </button>
                ))}
              </div>
              <button onClick={() => copy(output)} className="text-xs text-[#64748b] hover:text-[#38bdf8]">
                コピー
              </button>
            </div>
            <pre className="result-box rounded p-3 text-xs font-mono overflow-auto max-h-96">
              {output}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
