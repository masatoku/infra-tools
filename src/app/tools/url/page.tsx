"use client";

import { useState } from "react";
import Link from "next/link";

type ParsedQuery = { key: string; value: string }[];

function parseQueryString(qs: string): ParsedQuery {
  const clean = qs.startsWith("?") ? qs.slice(1) : qs;
  if (!clean) return [];
  return clean.split("&").map((pair) => {
    const eq = pair.indexOf("=");
    if (eq === -1) return { key: decodeURIComponent(pair.replace(/\+/g, " ")), value: "" };
    return {
      key: decodeURIComponent(pair.slice(0, eq).replace(/\+/g, " ")),
      value: decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, " ")),
    };
  });
}

function buildQueryString(params: ParsedQuery): string {
  return params
    .filter((p) => p.key)
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join("&");
}

export default function UrlPage() {
  const [encInput, setEncInput] = useState("");
  const [encOutput, setEncOutput] = useState("");
  const [decInput, setDecInput] = useState("");
  const [decOutput, setDecOutput] = useState("");
  const [decError, setDecError] = useState("");
  const [qsInput, setQsInput] = useState("");
  const [qsParsed, setQsParsed] = useState<ParsedQuery>([]);
  const [qsParams, setQsParams] = useState<ParsedQuery>([{ key: "", value: "" }]);

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  function doEncode() {
    setEncOutput(encodeURIComponent(encInput));
  }

  function doDecode() {
    setDecError("");
    try {
      setDecOutput(decodeURIComponent(decInput));
    } catch {
      setDecError("無効なURL文字列です");
      setDecOutput("");
    }
  }

  function parseQs() {
    try {
      setQsParsed(parseQueryString(qsInput));
    } catch {
      setQsParsed([]);
    }
  }

  function addParam() {
    setQsParams((p) => [...p, { key: "", value: "" }]);
  }

  function removeParam(i: number) {
    setQsParams((p) => p.filter((_, idx) => idx !== i));
  }

  function updateParam(i: number, field: "key" | "value", val: string) {
    setQsParams((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  const builtQs = buildQueryString(qsParams);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">🔗 URL エンコード / デコード</h1>
        <p className="text-[#64748b] text-sm mt-1">URLエンコード・デコードとクエリ文字列の解析・生成を行います</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <h2 className="text-sm font-semibold mb-3">エンコード（テキスト → URL）</h2>
        <div className="flex gap-2 mb-3">
          <input className="input-field flex-1 rounded px-3 py-2 text-sm font-mono" placeholder="エンコードするテキスト" value={encInput} onChange={(e) => setEncInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doEncode()} />
          <button className="btn-primary px-4 py-2 rounded text-sm" onClick={doEncode}>変換</button>
        </div>
        {encOutput && (
          <div className="result-box rounded p-3 flex justify-between items-start">
            <span className="text-xs font-mono break-all flex-1">{encOutput}</span>
            <button onClick={() => copy(encOutput)} className="text-xs text-[#64748b] hover:text-[#38bdf8] ml-3 shrink-0">コピー</button>
          </div>
        )}
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <h2 className="text-sm font-semibold mb-3">デコード（URL → テキスト）</h2>
        <div className="flex gap-2 mb-3">
          <input className="input-field flex-1 rounded px-3 py-2 text-sm font-mono" placeholder="%E3%81%82%E3%81%84%E3%81%86" value={decInput} onChange={(e) => setDecInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doDecode()} />
          <button className="btn-primary px-4 py-2 rounded text-sm" onClick={doDecode}>変換</button>
        </div>
        {decError && <p className="text-[#f87171] text-xs mb-2">{decError}</p>}
        {decOutput && (
          <div className="result-box rounded p-3 flex justify-between items-start">
            <span className="text-xs font-mono break-all flex-1">{decOutput}</span>
            <button onClick={() => copy(decOutput)} className="text-xs text-[#64748b] hover:text-[#38bdf8] ml-3 shrink-0">コピー</button>
          </div>
        )}
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <h2 className="text-sm font-semibold mb-3">クエリ文字列 → パース</h2>
        <div className="flex gap-2 mb-3">
          <input className="input-field flex-1 rounded px-3 py-2 text-xs font-mono" placeholder="?foo=bar&baz=qux%20quux" value={qsInput} onChange={(e) => setQsInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && parseQs()} />
          <button className="btn-primary px-4 py-2 rounded text-sm" onClick={parseQs}>解析</button>
        </div>
        {qsParsed.length > 0 && (
          <div className="space-y-1">
            {qsParsed.map((p, i) => (
              <div key={i} className="result-box rounded p-2 flex gap-2 items-center text-xs font-mono">
                <span className="text-[#38bdf8] shrink-0">{p.key}</span>
                <span className="text-[#64748b]">=</span>
                <span className="text-[#a3e635] break-all">{p.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tool-card rounded-lg p-5">
        <h2 className="text-sm font-semibold mb-3">パラメータ → クエリ文字列</h2>
        <div className="space-y-2 mb-3">
          {qsParams.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input-field flex-1 rounded px-2 py-1.5 text-xs font-mono" placeholder="key" value={p.key} onChange={(e) => updateParam(i, "key", e.target.value)} />
              <span className="text-[#64748b] text-xs">=</span>
              <input className="input-field flex-1 rounded px-2 py-1.5 text-xs font-mono" placeholder="value" value={p.value} onChange={(e) => updateParam(i, "value", e.target.value)} />
              <button onClick={() => removeParam(i)} className="text-[#64748b] hover:text-[#f87171] text-sm w-6">×</button>
            </div>
          ))}
        </div>
        <button onClick={addParam} className="text-xs text-[#64748b] hover:text-[#38bdf8] mb-3">+ パラメータ追加</button>
        {builtQs && (
          <div className="result-box rounded p-3 flex justify-between items-start">
            <span className="text-xs font-mono break-all flex-1 text-[#a3e635]">?{builtQs}</span>
            <button onClick={() => copy(`?${builtQs}`)} className="text-xs text-[#64748b] hover:text-[#38bdf8] ml-3 shrink-0">コピー</button>
          </div>
        )}
      </div>
    </div>
  );
}
