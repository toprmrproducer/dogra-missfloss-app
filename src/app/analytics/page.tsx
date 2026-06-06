"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// ── Types ──────────────────────────────────────────────────────────────────────
interface CallStatRow {
  day: string;
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  avg_duration_sec: number;
  total_cost_usd: number;
}

interface SummaryStats {
  totalCalls: number;
  completedCalls: number;
  avgDurationSec: number;
  totalCostUsd: number;
  conversionRate: number;
}

// ── API proxy fetch (service role key stays server-side) ──────────────────────
async function fetchCallStats(days = 30): Promise<CallStatRow[]> {
  try {
    const resp = await fetch(`/api/analytics/call-stats?days=${days}`);
    if (!resp.ok) return [];
    return resp.json();
  } catch {
    return [];
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
function fmtDuration(sec: number) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
function fmtCost(usd: number) {
  return usd != null ? `$${usd.toFixed(4)}` : "—";
}

const ACCENT = "#8258F2";
const ACCENT2 = "#c5b8ff";

// ── Component ──────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [rows, setRows] = useState<CallStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 14 | 30>(30);

  useEffect(() => {
    setLoading(true);
    fetchCallStats(range)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [range]);

  const summary: SummaryStats = rows.reduce(
    (acc, r) => ({
      totalCalls: acc.totalCalls + r.total_calls,
      completedCalls: acc.completedCalls + r.completed_calls,
      avgDurationSec:
        rows.length > 0
          ? rows.reduce((s, x) => s + x.avg_duration_sec, 0) / rows.length
          : 0,
      totalCostUsd: acc.totalCostUsd + (r.total_cost_usd ?? 0),
      conversionRate: 0,
    }),
    { totalCalls: 0, completedCalls: 0, avgDurationSec: 0, totalCostUsd: 0, conversionRate: 0 }
  );
  if (summary.totalCalls > 0) {
    summary.conversionRate = (summary.completedCalls / summary.totalCalls) * 100;
  }

  const chartData = rows.map((r) => ({
    day: fmtDate(r.day),
    Calls: r.total_calls,
    Completed: r.completed_calls,
    Failed: r.failed_calls,
    "Avg Duration (s)": Math.round(r.avg_duration_sec ?? 0),
    "Cost (USD)": parseFloat((r.total_cost_usd ?? 0).toFixed(4)),
  }));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Call performance & costs · last {range} days</p>
        </div>
        <div className="flex gap-2">
          {([7, 14, 30] as const).map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                range === d
                  ? "bg-[#8258F2] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Calls" value={summary.totalCalls.toLocaleString()} />
        <KpiCard
          title="Conversion Rate"
          value={`${summary.conversionRate.toFixed(1)}%`}
          sub="completed / total"
        />
        <KpiCard
          title="Avg Duration"
          value={fmtDuration(summary.avgDurationSec)}
        />
        <KpiCard
          title="Total Cost"
          value={fmtCost(summary.totalCostUsd)}
        />
      </div>

      {/* Calls over time */}
      <Card>
        <CardHeader>
          <CardTitle>Calls Over Time</CardTitle>
          <CardDescription>Daily inbound &amp; outbound volume</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Loading…
            </div>
          ) : chartData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT2} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={ACCENT2} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333" }} />
                <Area type="monotone" dataKey="Calls" stroke={ACCENT} fill="url(#gCalls)" strokeWidth={2} />
                <Area type="monotone" dataKey="Completed" stroke={ACCENT2} fill="url(#gCompleted)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Duration & Cost */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Avg Call Duration</CardTitle>
            <CardDescription>Seconds per day</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <LoadingPlaceholder /> : chartData.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333" }} />
                  <Bar dataKey="Avg Duration (s)" fill={ACCENT} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Cost (USD)</CardTitle>
            <CardDescription>Cumulative per day</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <LoadingPlaceholder /> : chartData.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCENT} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333" }} formatter={(v: number) => [`$${v}`, "Cost"]} />
                  <Area type="monotone" dataKey="Cost (USD)" stroke={ACCENT} fill="url(#gCost)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold" style={{ color: ACCENT }}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <p className="text-sm">No call data yet for this period.</p>
      <p className="text-xs">Data appears after your first completed call.</p>
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
  );
}
