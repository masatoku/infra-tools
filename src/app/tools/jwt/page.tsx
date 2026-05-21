"use client";

import { useState } from "react";
import Link from "next/link";

type JwtParts = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean | null;
  expDate: string | null;
};

function decodeJwt(token: string): JwtParts {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("JWTは3つのパートで構成される必要があります（header.payload.signature）");

  function decodepart(part: string): Record<string, unknown> {
    const padded = part + "=".repeat((4 - (part.length % 4)) % 4);
    const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  const header = decodepart(parts[0]);
  const payload = decodepart(parts[1]);

  let isExpired: boolean | null = null;
  let expDate: string | null = null;
  if (typeof payload.exp === "number") {
    const exp = new Date(payload.exp * 1000);
    isExpired = exp < new Date();
    expDate = exp.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", hour12: false });
  }

  return { header, payload, signature: parts[2], isExpired, expDate };
}

function formatEpochFields(obj: Record<string, unknown>): Record<string, unknown> {
  const epochFields = ["exp", "iat", "nbf"];
  const result: Record<string, unknown> = { ...obj };
  for (const key of epochFields) {
    if (typeof result[key] === "number") {
      const date = new Date((result[key] as number) * 1000);
      result[`${key}_human`] = date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", hour12: false });
    }
  }
  return result;
}

export default function JwtPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<JwtParts | null>(null);
  const [error, setError] = useState("");

  function decode() {
    setError("");
    setResult(null);
    try {
      setResult(decodeJwt(input));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">🔑 JWT デコーダー</h1>
        <p className="text-[#64748b] text-sm mt-1">JWTトークンのヘッダー・ペイロードを解析します（署名検証なし）</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-6">
        <label className="block text-xs text-[#64748b] mb-1">JWTトークン</label>
        <textarea
          className="input-field w-full rounded px-3 py-2 text-xs font-mono resize-none mb-3"
          rows={4}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn-primary px-5 py-2 rounded text-sm" onClick={decode}>
          デコード
        </button>
        {error && <p className="text-[#f87171] text-xs mt-2">{error}</p>}
      </div>

      {result && (
        <div className="space-y-4">
          {result.isExpired !== null && (
            <div className={`rounded px-4 py-2 text-sm ${result.isExpired ? "badge-error" : "badge-ok"}`}>
              {result.isExpired
                ? `⚠ このトークンは期限切れです（有効期限: ${result.expDate}）`
                : `✓ トークンは有効です（有効期限: ${result.expDate}）`}
            </div>
          )}

          {[
            { title: "Header", data: result.header, color: "#fb923c" },
            { title: "Payload", data: formatEpochFields(result.payload), color: "#a78bfa" },
          ].map(({ title, data, color }) => (
            <div key={title} className="tool-card rounded-lg p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold" style={{ color }}>{title}</h2>
                <button
                  onClick={() => copy(JSON.stringify(data, null, 2))}
                  className="text-xs text-[#64748b] hover:text-[#38bdf8]"
                >
                  コピー
                </button>
              </div>
              <pre className="result-box rounded p-3 text-xs font-mono overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ))}

          <div className="tool-card rounded-lg p-5">
            <h2 className="text-sm font-semibold mb-3 text-[#64748b]">Signature（未検証）</h2>
            <div className="result-box rounded p-3">
              <p className="text-xs font-mono text-[#64748b] break-all">{result.signature}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
