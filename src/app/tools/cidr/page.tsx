"use client";

import { useState } from "react";
import Link from "next/link";

type CidrInfo = {
  input: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  subnetMask: string;
  wildcardMask: string;
  totalHosts: number;
  usableHosts: number;
  cidrPrefix: number;
  ipClass: string;
  binaryMask: string;
};

function ipToNum(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function numToIp(num: number): string {
  return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join(".");
}

function toBinary(num: number): string {
  return (num >>> 0).toString(2).padStart(32, "0").replace(/(.{8})/g, "$1.").slice(0, -1);
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (マルチキャスト)";
  return "E (予約済み)";
}

function parseCidr(input: string): CidrInfo {
  const [ipPart, prefixPart] = input.trim().split("/");
  const prefix = parseInt(prefixPart, 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) throw new Error("プレフィックスは0〜32で指定してください");

  const octets = ipPart.split(".");
  if (octets.length !== 4 || octets.some((o) => isNaN(parseInt(o)) || parseInt(o) < 0 || parseInt(o) > 255)) {
    throw new Error("無効なIPアドレスです");
  }

  const ipNum = ipToNum(ipPart);
  const maskNum = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;
  const total = Math.pow(2, 32 - prefix);
  const usable = prefix >= 31 ? total : total - 2;

  return {
    input,
    networkAddress: numToIp(networkNum),
    broadcastAddress: numToIp(broadcastNum),
    firstHost: prefix >= 31 ? numToIp(networkNum) : numToIp(networkNum + 1),
    lastHost: prefix >= 31 ? numToIp(broadcastNum) : numToIp(broadcastNum - 1),
    subnetMask: numToIp(maskNum),
    wildcardMask: numToIp(~maskNum >>> 0),
    totalHosts: total,
    usableHosts: Math.max(0, usable),
    cidrPrefix: prefix,
    ipClass: getIpClass(parseInt(octets[0], 10)),
    binaryMask: toBinary(maskNum),
  };
}

const ROW = ({ label, value, mono = true }: { label: string; value: string | number; mono?: boolean }) => (
  <div className="flex justify-between items-center py-2 border-b border-[#2a2d3a] last:border-0">
    <span className="text-[#64748b] text-xs">{label}</span>
    <span className={`text-sm ${mono ? "font-mono text-[#a3e635]" : "text-[#e2e8f0]"}`}>{value}</span>
  </div>
);

export default function CidrPage() {
  const [input, setInput] = useState("192.168.1.0/24");
  const [result, setResult] = useState<CidrInfo | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    setError("");
    try {
      setResult(parseCidr(input));
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-[#64748b] text-sm hover:text-[#38bdf8]">← ホームに戻る</Link>
        <h1 className="text-2xl font-bold text-[#38bdf8] mt-2">🌐 CIDR / サブネット計算機</h1>
        <p className="text-[#64748b] text-sm mt-1">CIDR表記からネットワーク情報を計算します</p>
      </div>

      <div className="tool-card rounded-lg p-5 mb-6">
        <label className="block text-xs text-[#64748b] mb-1">IPアドレス / CIDR</label>
        <div className="flex gap-2">
          <input
            className="input-field flex-1 rounded px-3 py-2 text-sm font-mono"
            placeholder="192.168.1.0/24"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && calculate()}
          />
          <button className="btn-primary px-5 py-2 rounded text-sm" onClick={calculate}>
            計算
          </button>
        </div>
        {error && <p className="text-[#f87171] text-xs mt-2">{error}</p>}
      </div>

      {result && (
        <div className="tool-card rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-4 text-[#38bdf8]">/{result.cidrPrefix} ネットワーク情報</h2>
          <ROW label="ネットワークアドレス" value={result.networkAddress} />
          <ROW label="ブロードキャストアドレス" value={result.broadcastAddress} />
          <ROW label="最初のホスト" value={result.firstHost} />
          <ROW label="最後のホスト" value={result.lastHost} />
          <ROW label="サブネットマスク" value={result.subnetMask} />
          <ROW label="ワイルドカードマスク" value={result.wildcardMask} />
          <ROW label="全IPアドレス数" value={result.totalHosts.toLocaleString()} mono={false} />
          <ROW label="使用可能ホスト数" value={result.usableHosts.toLocaleString()} mono={false} />
          <ROW label="IPクラス" value={`クラス ${result.ipClass}`} mono={false} />
          <div className="pt-3">
            <p className="text-xs text-[#64748b] mb-1">バイナリマスク</p>
            <div className="result-box rounded p-3 text-xs font-mono break-all">{result.binaryMask}</div>
          </div>
        </div>
      )}
    </div>
  );
}
