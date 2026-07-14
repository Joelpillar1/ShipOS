import { useMemo, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  Eye,
  Heart,
  LayoutGrid,
  Layers,
  MessageSquare,
  Repeat,
  Rss,
  Target,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TATTOO = "/images/composer/post-tattoo.png";

type Period = "7d" | "30d" | "90d";
type Tab = "overview" | "insights" | "timing" | "results";

const TABS: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "insights", label: "Engagement Insights", icon: TrendingUp },
  { id: "timing", label: "Best Time to Post", icon: Clock },
  { id: "results", label: "Post Results", icon: Rss },
];

const PERIOD_METRICS: Record<
  Period,
  {
    views: string;
    reach: string;
    likes: string;
    shares: string;
    comments: string;
    engRate: string;
    changes: [string, boolean | null][];
  }
> = {
  "7d": {
    views: "2.4M",
    reach: "1.1M",
    likes: "84.2K",
    shares: "12.6K",
    comments: "9.4K",
    engRate: "4.4%",
    changes: [
      ["+8.2%", true],
      ["+41%", true],
      ["-12%", false],
      ["+50%", true],
      ["+0%", null],
      ["-18%", false],
    ],
  },
  "30d": {
    views: "12.8M",
    reach: "5.6M",
    likes: "412K",
    shares: "68.4K",
    comments: "41.2K",
    engRate: "4.1%",
    changes: [
      ["+20.6%", true],
      ["+100%", true],
      ["-81.8%", false],
      ["+200%", true],
      [null, null],
      ["-50%", false],
    ],
  },
  "90d": {
    views: "38.2M",
    reach: "16.4M",
    likes: "1.2M",
    shares: "214K",
    comments: "128K",
    engRate: "4.0%",
    changes: [
      ["+34%", true],
      ["+72%", true],
      ["-22%", false],
      ["+110%", true],
      ["+9%", true],
      ["-8%", false],
    ],
  },
};

const SPARKLINES = [
  { color: "#8b5cf6", d: "M0 22 C12 18 18 24 28 14 C38 4 48 26 58 12 C68 0 78 20 90 10 C100 4 110 16 120 12" },
  { color: "#14b8a6", d: "M0 24 C20 24 40 22 55 14 C70 6 85 20 100 8 C110 2 116 10 120 4" },
  { color: "#ec4899", d: "M0 10 C15 8 25 18 40 12 C55 6 65 22 80 16 C95 10 108 20 120 18" },
  { color: "#f59e0b", d: "M0 22 C20 22 35 20 50 18 C70 16 90 20 105 10 C112 6 116 4 120 2" },
  { color: "#3b82f6", d: "M0 18 L120 18" },
  { color: "#06b6d4", d: "M0 20 C20 18 40 22 60 16 C80 10 95 18 105 8 C112 2 116 14 120 12" },
];

const GROWTH = [
  { name: "W1", v: 8 },
  { name: "W2", v: 28 },
  { name: "W3", v: 52 },
  { name: "W4", v: 88 },
];

const TREND = [
  { name: "Jun 15", views: 18, reach: 10, eng: 4 },
  { name: "Jun 22", views: 42, reach: 22, eng: 8 },
  { name: "Jun 29", views: 28, reach: 18, eng: 6 },
  { name: "Jul 6", views: 70, reach: 36, eng: 14 },
  { name: "Jul 13", views: 55, reach: 30, eng: 11 },
];

const PLATFORMS = [
  { name: "youtube", color: "#ef4444", eng: 92, views: 70 },
  { name: "tiktok", color: "#111111", eng: 58, views: 44 },
  { name: "x", color: "#38bdf8", eng: 36, views: 28 },
  { name: "linkedin", color: "#2563eb", eng: 48, views: 32 },
  { name: "pinterest", color: "#be123c", eng: 22, views: 16 },
];

function Sparkline({ d, color, id }: { d: string; color: string; id: string }) {
  return (
    <svg className="w-full h-7" viewBox="0 0 120 30" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L120 30 L0 30 Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GrowthChart() {
  const w = 320;
  const h = 90;
  const pad = 8;
  const points = GROWTH.map((g, i) => {
    const x = pad + (i / (GROWTH.length - 1)) * (w - pad * 2);
    const y = h - pad - (g.v / 100) * (h - pad * 2);
    return { ...g, x, y };
  });
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[88px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d75a34" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d75a34" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#growthFill)" />
        <path d={line} fill="none" stroke="#d75a34" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between px-1 -mt-1">
        {GROWTH.map((g) => (
          <span key={g.name} className="text-[8px] font-bold text-muted-foreground">
            {g.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrendChart() {
  const w = 340;
  const h = 110;
  const padX = 28;
  const padY = 10;
  const max = 80;

  const toPoints = (key: "views" | "reach" | "eng") =>
    TREND.map((t, i) => {
      const x = padX + (i / (TREND.length - 1)) * (w - padX - 8);
      const y = h - padY - (t[key] / max) * (h - padY * 2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    }).join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[100px]">
        {[0, 0.5, 1].map((f) => {
          const y = padY + (1 - f) * (h - padY * 2);
          return (
            <g key={f}>
              <line x1={padX} y1={y} x2={w - 4} y2={y} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <text x={4} y={y + 3} className="fill-muted-foreground" fontSize="7">
                {f === 0 ? "0" : f === 0.5 ? "2M" : "4M"}
              </text>
            </g>
          );
        })}
        <path d={toPoints("views")} fill="none" stroke="#d75a34" strokeWidth="1.8" />
        <path d={toPoints("reach")} fill="none" stroke="#14b8a6" strokeWidth="1.8" />
        <path d={toPoints("eng")} fill="none" stroke="#8b5cf6" strokeWidth="1.8" />
      </svg>
      <div className="flex justify-between pl-7 pr-1">
        {TREND.map((t) => (
          <span key={t.name} className="text-[7px] font-medium text-muted-foreground">
            {t.name}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 mt-1.5">
        {[
          ["Views", "#d75a34"],
          ["Reach", "#14b8a6"],
          ["Engagement", "#8b5cf6"],
        ].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[8px] font-bold text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Interactive Analytics dashboard mockup for the founder landing.
 */
export function AnalyticsDashboardMockup({ className }: { className?: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [period, setPeriod] = useState<Period>("30d");
  const metrics = PERIOD_METRICS[period];

  const kpi = useMemo(
    () => [
      { label: "Total Views", value: metrics.views, note: "Impressions / video plays", icon: Eye, spark: SPARKLINES[0], change: metrics.changes[0] },
      { label: "Total Reach", value: metrics.reach, note: "Unique accounts reached", icon: Users, spark: SPARKLINES[1], change: metrics.changes[1] },
      { label: "Likes", value: metrics.likes, note: "Reactions across platforms", icon: Heart, spark: SPARKLINES[2], change: metrics.changes[2] },
      { label: "Shares / Reposts", value: metrics.shares, note: "Shares, retweets, reposts", icon: Repeat, spark: SPARKLINES[3], change: metrics.changes[3] },
      { label: "Comments", value: metrics.comments, note: "Replies & comments", icon: MessageSquare, spark: SPARKLINES[4], change: metrics.changes[4] },
      { label: "Engagement Rate", value: metrics.engRate, note: "(Likes+Comments+Shares)/Views", icon: Target, spark: SPARKLINES[5], change: metrics.changes[5] },
    ],
    [metrics]
  );

  return (
    <div
      className={cn(
        "w-full max-w-[820px] h-[320px] sm:h-[380px] md:h-[460px] max-h-[460px] bg-[#faf7f5] dark:bg-[#191715] border border-border shadow-sm overflow-hidden text-left select-none flex flex-col",
        className
      )}
    >
      {/* Tabs + filters */}
      <div className="flex items-center justify-between gap-2 px-2 sm:px-3 py-2 border-b border-border bg-card shrink-0 min-w-0">
        <div className="flex items-center gap-0.5 overflow-x-auto custom-scrollbar min-w-0 flex-1 pr-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "h-7 px-1.5 sm:px-2 text-[9px] font-bold inline-flex items-center gap-1 whitespace-nowrap border-b-2 -mb-px shrink-0",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            className="h-7 px-1.5 sm:px-2 text-[9px] font-bold border border-border bg-card inline-flex items-center gap-1 sm:gap-1.5 hover:bg-muted"
          >
            <Layers className="w-3 h-3 text-muted-foreground" />
            <span className="hidden sm:inline">All Accounts</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          <div className="flex border border-border">
            {(["7d", "30d", "90d"] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  "h-7 px-1.5 sm:px-2 text-[9px] font-black uppercase",
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar p-2 sm:p-2.5 space-y-2 sm:space-y-2.5">
        {tab !== "overview" ? (
          <div className="h-full min-h-[200px] flex items-center justify-center border border-dashed border-border bg-card/60">
            <p className="text-[11px] font-bold text-muted-foreground text-center px-6">
              {TABS.find((t) => t.id === tab)?.label} — available in Pro.
              <br />
              <button
                type="button"
                onClick={() =>
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="mt-2 text-primary underline"
              >
                See pricing
              </button>
            </p>
          </div>
        ) : (
          <>
            {/* KPI row — denser on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
              {kpi.map((stat, i) => {
                const Icon = stat.icon;
                const [change, positive] = stat.change;
                return (
                  <div
                    key={stat.label}
                    className="bg-card border border-border p-1.5 sm:p-2 flex flex-col justify-between min-h-[84px] sm:min-h-[96px]"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[8px] font-bold text-muted-foreground tracking-wider leading-tight">
                        {stat.label}
                      </span>
                      <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                    </div>
                    <Sparkline d={stat.spark.d} color={stat.spark.color} id={`spark-${i}-${period}`} />
                    <div className="flex items-end justify-between gap-1 mt-0.5">
                      <div className="min-w-0">
                        <div className="text-[13px] font-black tracking-tight leading-none">{stat.value}</div>
                        <p className="text-[7px] text-muted-foreground mt-0.5 leading-tight truncate hidden sm:block">
                          {stat.note}
                        </p>
                      </div>
                      {change && (
                        <span
                          className={cn(
                            "text-[8px] font-bold shrink-0",
                            positive === true && "text-emerald-600",
                            positive === false && "text-rose-500"
                          )}
                        >
                          {change}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Growth + Top post */}
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-1.5">
              <div className="bg-card border border-border p-2 sm:p-2.5">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground tracking-wider">Growth Performance</p>
                    <p className="text-[10px] font-black text-foreground mt-0.5">Total Workspace Reach</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-rose-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Live Feed
                  </span>
                </div>
                <p className="text-xl font-black tracking-tight mb-1">{metrics.views}</p>
                <GrowthChart />
              </div>

              <div className="bg-card border border-border p-2 sm:p-2.5 flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[9px] font-bold text-muted-foreground tracking-wider">Top Performing Post</p>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex gap-2 border border-border p-1.5 bg-muted/20">
                  <img src={TATTOO} alt="" className="w-12 h-12 object-cover border border-border shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold leading-snug line-clamp-2">
                      Samurai Tattoo Idea #tattoofun #ink
                    </p>
                    <p className="text-[7px] text-muted-foreground font-bold mt-1 uppercase tracking-wide">
                      Posted 13d ago · 1.9M views
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 mt-1.5">
                  {[
                    ["48.2K", "Likes"],
                    ["6.1K", "Shares"],
                    ["3.4K", "Comments"],
                  ].map(([v, l]) => (
                    <div key={l} className="border border-border px-1 py-1 text-center">
                      <p className="text-[10px] font-black leading-none">{v}</p>
                      <p className="text-[7px] font-bold text-muted-foreground uppercase mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-1.5 flex items-center justify-between gap-2 bg-primary/10 px-1.5 py-1">
                  <span className="text-[8px] font-bold tracking-wide">Engagement Rate 2.1%</span>
                  <span className="text-[7px] font-black uppercase bg-blue-500 text-white px-1.5 py-0.5">Good</span>
                </div>
              </div>
            </div>

            {/* Trend + platforms */}
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-1.5">
              <div className="bg-card border border-border p-2 sm:p-2.5">
                <p className="text-[9px] font-bold text-muted-foreground tracking-wider">Performance Trend</p>
                <p className="text-[10px] font-black mb-1">
                  Views & Engagement over {period === "7d" ? "7" : period === "30d" ? "30" : "90"} Days
                </p>
                <TrendChart />
              </div>

              <div className="bg-card border border-border p-2 sm:p-2.5">
                <p className="text-[9px] font-bold text-muted-foreground tracking-wider">Platform Comparison</p>
                <p className="text-[10px] font-black mb-2">Total engagement by network</p>
                <div className="space-y-2">
                  {PLATFORMS.map((p) => (
                    <div key={p.name} className="grid grid-cols-[52px_1fr] gap-2 items-center">
                      <span className="text-[9px] font-bold capitalize truncate">{p.name}</span>
                      <div className="space-y-0.5">
                        <div
                          className="h-2 rounded-sm"
                          style={{ width: `${p.eng}%`, backgroundColor: p.color }}
                        />
                        <div
                          className="h-1.5 rounded-sm opacity-45"
                          style={{ width: `${p.views}%`, backgroundColor: p.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
