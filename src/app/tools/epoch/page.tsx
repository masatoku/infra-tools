"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function toJST(date: Date): string {
  return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", hour12: false });
}

function toUTC(date: Date): string {
  return date.toUTCString();
}

function toISO(date: Date): string {
  return date.toISOString();
}

export default function EpochPage() {
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [epochInput, setEpochInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [epochResult, setEpochResult] = useState<{ jst: string; utc: string; iso: string } | null>(null);
  const [dateResult, setDateResult] = useState<{ epoch: number; epochMs: number } | null>(null);
  const [epochError, setEpochError] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentEpoch(Math.floor(Date.now() / 1000)), 1000);
    setCurrentEpoch(Math.floor(Date.now() / 1000));
    return () => clearInterval(timer);
  }, []);

  function convertEpoch() {
    setEpochError("");
    const raw = epochInput.trim();
    if (!raw) return;
    const num = Number(raw);
    if (isNaN(num)) { setEpochError("数値を入力してください"); return; }
    const ms = raw.length >= 13 ? num : num * 1000;
    const date = new Date(ms);
    if (isNaN(date.getTime())) { setEpochError("無効な値です"); return; }
    setEpochResult({ jst: toJST(date), utc: toUTC(date), iso: toISO(date) });
  }

  function convertDate() {
    setDateError("");
    const raw = dateInput.trim();
    if (!raw) return;
    const date = new Date(raw);
    if (isNaN(date.getTime())) { setDateError("認識できない日時形式です。例: 2024-01-01 12:00:00"); return; }
    setDateResult({ epoch: Math.floor(date.getTime() / 1000), epochMs: date.getTime() });
  }

  function useNow() {
    const now = new Date();
    setEpochInput(String(Math.floor(now.getTime() / 1000)));
    setEpochResult({ jst: toJST(now), utc: toUTC(now), iso: toISO(now) });
    setEpochError("");
  }

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">⏱ Epoch タイム変換</h1>
        <p className="text-[#64748b] text-sm mt-1">Unixタイムスタンプと日時を相互変換します</p>
      </div>

      <div className="tool-card rounded-lg p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#64748b] mb-0.5">現在のUnixタイムスタンプ</p>
          <p className="text-2xl font-mono text-[#a3e635]">{currentEpoch}</p>
        </div>
        <button
          className="btn-primary px-4 py-2 rounded text-xs"
          onClick={useNow}
        >
          この値を使う
        </button>
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <h2 className="text-sm font-semibold mb-3 text-[#e2e8f0]">Epoch → 日時</h2>
        <div className="flex gap-2 mb-3">
          <input
            className="input-field flex-1 rounded px-3 py-2 text-sm font-mono"
            placeholder="1700000000 または 1700000000000"
            value={epochInput}
            onChange={(e) => setEpochInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && convertEpoch()}
          />
          <button className="btn-primary px-4 py-2 rounded text-sm" onClick={convertEpoch}>変換</button>
        </div>
        {epochError && <p className="text-[#f87171] text-xs mb-2">{epochError}</p>}
        {epochResult && (
          <div className="space-y-2">
            {[
              { label: "JST (日本時間)", value: epochResult.jst },
              { label: "UTC", value: epochResult.utc },
              { label: "ISO 8601", value: epochResult.iso },
            ].map(({ label, value }) => (
              <div key={label} className="result-box rounded p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-[#64748b] mb-0.5">{label}</p>
                  <p className="text-sm font-mono">{value}</p>
                </div>
                <button onClick={() => copy(value)} className="text-xs text-[#64748b] hover:text-[#38bdf8] ml-3 shrink-0">
                  コピー
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tool-card rounded-lg p-5">
        <h2 className="text-sm font-semibold mb-3 text-[#e2e8f0]">日時 → Epoch</h2>
        <div className="flex gap-2 mb-3">
          <input
            className="input-field flex-1 rounded px-3 py-2 text-sm font-mono"
            placeholder="2024-01-01 12:00:00"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && convertDate()}
          />
          <button className="btn-primary px-4 py-2 rounded text-sm" onClick={convertDate}>変換</button>
        </div>
        {dateError && <p className="text-[#f87171] text-xs mb-2">{dateError}</p>}
        {dateResult && (
          <div className="space-y-2">
            {[
              { label: "Unix秒 (seconds)", value: String(dateResult.epoch) },
              { label: "Unixミリ秒 (milliseconds)", value: String(dateResult.epochMs) },
            ].map(({ label, value }) => (
              <div key={label} className="result-box rounded p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-[#64748b] mb-0.5">{label}</p>
                  <p className="text-sm font-mono">{value}</p>
                </div>
                <button onClick={() => copy(value)} className="text-xs text-[#64748b] hover:text-[#38bdf8] ml-3">
                  コピー
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
