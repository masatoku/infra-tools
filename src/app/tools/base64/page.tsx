"use client";

import { useState } from "react";
import Link from "next/link";

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function decodeBase64(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default function Base64Page() {
  const [encodeInput, setEncodeInput] = useState("");
  const [encodeOutput, setEncodeOutput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [decodeOutput, setDecodeOutput] = useState("");
  const [decodeError, setDecodeError] = useState("");

  function doEncode() {
    try {
      setEncodeOutput(encodeBase64(encodeInput));
    } catch {
      setEncodeOutput("エンコードエラー");
    }
  }

  function doDecode() {
    setDecodeError("");
    try {
      const cleaned = decodeInput.trim().replace(/\s/g, "");
      setDecodeOutput(decodeBase64(cleaned));
    } catch {
      setDecodeError("無効なBase64文字列です");
      setDecodeOutput("");
    }
  }

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">🔤 Base64 エンコード / デコード</h1>
        <p className="text-[#64748b] text-sm mt-1">テキストをBase64で変換します（UTF-8対応）</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <h2 className="text-sm font-semibold mb-3 text-[#e2e8f0]">エンコード（テキスト → Base64）</h2>
        <textarea
          className="input-field w-full rounded px-3 py-2 text-sm font-mono resize-none mb-3"
          rows={4}
          placeholder="エンコードするテキストを入力..."
          value={encodeInput}
          onChange={(e) => setEncodeInput(e.target.value)}
        />
        <button className="btn-primary px-5 py-2 rounded text-sm mb-3" onClick={doEncode}>
          エンコード
        </button>
        {encodeOutput && (
          <div className="result-box rounded p-3 flex justify-between items-start">
            <p className="text-sm font-mono break-all flex-1">{encodeOutput}</p>
            <button onClick={() => copy(encodeOutput)} className="text-xs text-[#64748b] hover:text-[#38bdf8] ml-3 shrink-0">
              コピー
            </button>
          </div>
        )}
      </div>

      <div className="tool-card rounded-lg p-5">
        <h2 className="text-sm font-semibold mb-3 text-[#e2e8f0]">デコード（Base64 → テキスト）</h2>
        <textarea
          className="input-field w-full rounded px-3 py-2 text-sm font-mono resize-none mb-3"
          rows={4}
          placeholder="Base64文字列を入力..."
          value={decodeInput}
          onChange={(e) => setDecodeInput(e.target.value)}
        />
        <button className="btn-primary px-5 py-2 rounded text-sm mb-3" onClick={doDecode}>
          デコード
        </button>
        {decodeError && <p className="text-[#f87171] text-xs mb-2">{decodeError}</p>}
        {decodeOutput && (
          <div className="result-box rounded p-3 flex justify-between items-start">
            <p className="text-sm font-mono break-all whitespace-pre-wrap flex-1">{decodeOutput}</p>
            <button onClick={() => copy(decodeOutput)} className="text-xs text-[#64748b] hover:text-[#38bdf8] ml-3 shrink-0">
              コピー
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
