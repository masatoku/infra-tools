"use client";

import { useState } from "react";
import Link from "next/link";

type Perm = { r: boolean; w: boolean; x: boolean };
type Perms = { owner: Perm; group: Perm; others: Perm };

function permToOctal(p: Perm): number {
  return (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
}
function permToStr(p: Perm): string {
  return `${p.r ? "r" : "-"}${p.w ? "w" : "-"}${p.x ? "x" : "-"}`;
}
function octalToPerm(n: number): Perm {
  return { r: !!(n & 4), w: !!(n & 2), x: !!(n & 1) };
}

function permsToOctal(p: Perms): string {
  return `${permToOctal(p.owner)}${permToOctal(p.group)}${permToOctal(p.others)}`;
}
function permsToSymbol(p: Perms): string {
  return permToStr(p.owner) + permToStr(p.group) + permToStr(p.others);
}

function describe(p: Perms): string[] {
  const lines: string[] = [];
  const oStr = permToStr(p.owner);
  const gStr = permToStr(p.group);
  const eStr = permToStr(p.others);
  if (oStr !== "---") lines.push(`オーナー: ${["読み取り", "書き込み", "実行"].filter((_, i) => [p.owner.r, p.owner.w, p.owner.x][i]).join("・")}可`);
  if (gStr !== "---") lines.push(`グループ: ${["読み取り", "書き込み", "実行"].filter((_, i) => [p.group.r, p.group.w, p.group.x][i]).join("・")}可`);
  if (eStr !== "---") lines.push(`その他: ${["読み取り", "書き込み", "実行"].filter((_, i) => [p.others.r, p.others.w, p.others.x][i]).join("・")}可`);
  return lines;
}

const PRESETS = [
  { label: "755", desc: "Webファイル標準", val: "755" },
  { label: "644", desc: "設定ファイル", val: "644" },
  { label: "700", desc: "秘密鍵", val: "700" },
  { label: "600", desc: "SSH秘密鍵", val: "600" },
  { label: "777", desc: "全許可（非推奨）", val: "777" },
  { label: "000", desc: "全禁止", val: "000" },
];

function defaultPerms(): Perms {
  return {
    owner: { r: true, w: true, x: true },
    group: { r: true, w: false, x: true },
    others: { r: true, w: false, x: true },
  };
}

export default function ChmodPage() {
  const [perms, setPerms] = useState<Perms>(defaultPerms());
  const [octalInput, setOctalInput] = useState("");

  function applyOctal(val: string) {
    const clean = val.replace(/[^0-7]/g, "").slice(0, 3);
    setOctalInput(clean);
    if (clean.length === 3) {
      setPerms({
        owner: octalToPerm(parseInt(clean[0], 8)),
        group: octalToPerm(parseInt(clean[1], 8)),
        others: octalToPerm(parseInt(clean[2], 8)),
      });
    }
  }

  function toggle(role: keyof Perms, bit: keyof Perm) {
    setPerms((prev) => ({ ...prev, [role]: { ...prev[role], [bit]: !prev[role][bit] } }));
    setOctalInput("");
  }

  const octal = permsToOctal(perms);
  const symbol = permsToSymbol(perms);
  const desc = describe(perms);
  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">🔒 chmod 計算機</h1>
        <p className="text-[#64748b] text-sm mt-1">8進数・シンボル・チェックボックスで権限を相互変換します</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {PRESETS.map((p) => (
          <button
            key={p.val}
            onClick={() => applyOctal(p.val)}
            className="text-xs px-3 py-1.5 rounded border border-[#2a2d3a] text-[#64748b] hover:border-[#38bdf8] hover:text-[#38bdf8]"
          >
            {p.label} <span className="text-[#475569]">({p.desc})</span>
          </button>
        ))}
      </div>

      <div className="tool-card rounded-lg p-5 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div>
            <label className="block text-xs text-[#64748b] mb-1">8進数で入力</label>
            <input
              className="input-field rounded px-3 py-2 text-lg font-mono w-24 text-center"
              placeholder="755"
              maxLength={3}
              value={octalInput || octal}
              onChange={(e) => applyOctal(e.target.value)}
            />
          </div>
          <div className="text-[#64748b] text-sm pt-4">→</div>
          <div>
            <p className="text-xs text-[#64748b] mb-1">シンボル表記</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono text-[#a3e635]">{symbol}</span>
              <button onClick={() => copy(symbol)} className="text-xs text-[#64748b] hover:text-[#38bdf8]">コピー</button>
            </div>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-[#64748b] border-b border-[#2a2d3a]">
              <th className="text-left py-2 w-24">対象</th>
              <th className="text-center py-2">r（読取）</th>
              <th className="text-center py-2">w（書込）</th>
              <th className="text-center py-2">x（実行）</th>
              <th className="text-center py-2">数値</th>
            </tr>
          </thead>
          <tbody>
            {(["owner", "group", "others"] as const).map((role) => (
              <tr key={role} className="border-b border-[#2a2d3a] last:border-0">
                <td className="py-3 text-xs text-[#94a3b8]">
                  {role === "owner" ? "オーナー" : role === "group" ? "グループ" : "その他"}
                </td>
                {(["r", "w", "x"] as const).map((bit) => (
                  <td key={bit} className="text-center py-3">
                    <button
                      onClick={() => toggle(role, bit)}
                      className={`w-8 h-8 rounded font-mono text-sm font-bold transition-colors ${
                        perms[role][bit]
                          ? "bg-[#38bdf830] text-[#38bdf8] border border-[#38bdf8]"
                          : "bg-[#1a1d27] text-[#475569] border border-[#2a2d3a]"
                      }`}
                    >
                      {perms[role][bit] ? bit : "-"}
                    </button>
                  </td>
                ))}
                <td className="text-center py-3 font-mono text-[#a3e635]">{permToOctal(perms[role])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="tool-card rounded-lg p-4">
          <p className="text-xs text-[#64748b] mb-1">chmodコマンド</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-[#a3e635]">chmod {octal} &lt;file&gt;</span>
            <button onClick={() => copy(`chmod ${octal}`)} className="text-xs text-[#64748b] hover:text-[#38bdf8]">コピー</button>
          </div>
        </div>
        <div className="tool-card rounded-lg p-4">
          <p className="text-xs text-[#64748b] mb-1">ls -l 表示</p>
          <span className="font-mono text-sm text-[#a3e635]">-{symbol}</span>
        </div>
      </div>

      {desc.length > 0 && (
        <div className="tool-card rounded-lg p-4">
          <h2 className="text-xs text-[#64748b] mb-2">権限の説明</h2>
          <ul className="space-y-1">
            {desc.map((d) => <li key={d} className="text-xs text-[#94a3b8]">• {d}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
