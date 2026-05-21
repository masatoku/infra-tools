"use client";

import { useState } from "react";
import Link from "next/link";
import cronstrue from "cronstrue/i18n";
import CronExpressionParser from "cron-parser";

const EXAMPLES = [
  { label: "毎分", expr: "* * * * *" },
  { label: "毎日0時", expr: "0 0 * * *" },
  { label: "毎週月曜9時", expr: "0 9 * * 1" },
  { label: "毎時30分", expr: "30 * * * *" },
  { label: "平日9〜18時毎時", expr: "0 9-18 * * 1-5" },
];

export default function CronPage() {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const [description, setDescription] = useState<string | null>(null);
  const [nextDates, setNextDates] = useState<string[]>([]);
  const [error, setError] = useState("");

  function parse() {
    setError("");
    setDescription(null);
    setNextDates([]);

    const trimmed = expr.trim();
    if (!trimmed) return;

    try {
      const desc = cronstrue.toString(trimmed, { locale: "ja", use24HourTimeFormat: true });
      setDescription(desc);
    } catch {
      setError("Cron式の形式が不正です。5フィールド形式 (分 時 日 月 曜日) で入力してください。");
      return;
    }

    try {
      const interval = CronExpressionParser.parse(trimmed, { tz: "Asia/Tokyo" });
      const dates: string[] = [];
      for (let i = 0; i < 5; i++) {
        const next = interval.next().toDate();
        dates.push(
          next.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", hour12: false, weekday: "short" })
        );
      }
      setNextDates(dates);
    } catch {
      // description succeeded, next-dates not critical
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">🕐 Cron式パーサー</h1>
        <p className="text-[#64748b] text-sm mt-1">Cron式を日本語で説明し、次回実行日時を表示します（JST）</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <label className="block text-xs text-[#64748b] mb-1">Cron式（5フィールド: 分 時 日 月 曜日）</label>
        <div className="flex gap-2 mb-3">
          <input
            className="input-field flex-1 rounded px-3 py-2 text-sm font-mono"
            placeholder="0 9 * * 1-5"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && parse()}
          />
          <button className="btn-primary px-4 py-2 rounded text-sm" onClick={parse}>解析</button>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.expr}
              onClick={() => { setExpr(ex.expr); }}
              className="text-xs px-2 py-1 rounded border border-[#2a2d3a] text-[#64748b] hover:border-[#38bdf8] hover:text-[#38bdf8]"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {error && <p className="text-[#f87171] text-xs mt-3">{error}</p>}
      </div>

      {description && (
        <div className="tool-card rounded-lg p-5 mb-4">
          <h2 className="text-xs text-[#64748b] mb-2">意味</h2>
          <p className="text-[#a3e635] font-mono text-sm">{description}</p>
        </div>
      )}

      {nextDates.length > 0 && (
        <div className="tool-card rounded-lg p-5">
          <h2 className="text-xs text-[#64748b] mb-3">次回5回の実行日時（JST）</h2>
          <div className="space-y-1">
            {nextDates.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-[#64748b] w-4">{i + 1}</span>
                <span className="result-box rounded px-3 py-1.5 text-xs font-mono flex-1">{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tool-card rounded-lg p-4 mt-5">
        <h2 className="text-xs text-[#64748b] mb-3">フィールド一覧</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[#64748b] border-b border-[#2a2d3a]">
              <th className="text-left py-1 pr-3">フィールド</th>
              <th className="text-left py-1 pr-3">範囲</th>
              <th className="text-left py-1">特殊文字</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {[
              ["分 (Minute)", "0-59", "* , - /"],
              ["時 (Hour)", "0-23", "* , - /"],
              ["日 (Day)", "1-31", "* , - / ?"],
              ["月 (Month)", "1-12", "* , - /"],
              ["曜日 (Weekday)", "0-7 (0,7=日)", "* , - / ?"],
            ].map(([f, r, s]) => (
              <tr key={f} className="border-b border-[#2a2d3a] last:border-0">
                <td className="py-1.5 pr-3 text-[#e2e8f0]">{f}</td>
                <td className="py-1.5 pr-3 text-[#a3e635]">{r}</td>
                <td className="py-1.5 text-[#64748b]">{s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
