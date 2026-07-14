import { useMemo, useState } from "react";
import {
  AtSign,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Globe,
  Hash,
  Image as ImageIcon,
  Layers,
  Settings,
  Smile,
  Trash2,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/PlatformIcons";

const JOEL = "/images/composer/avatar-joel.png";
const MAKER = "/images/composer/avatar-maker.png";
const LOGO = "/images/composer/shipos-logo.png";

const ACCOUNTS = [
  { id: "x1", avatar: LOGO, Icon: XIcon, color: "text-foreground", name: "ShipOS X" },
  { id: "li1", avatar: LOGO, Icon: LinkedInIcon, color: "text-sky-700", name: "ShipOS LinkedIn" },
  { id: "ig1", avatar: MAKER, Icon: InstagramIcon, color: "text-pink-600", name: "Instagram" },
  { id: "yt1", avatar: JOEL, Icon: YouTubeIcon, color: "text-red-600", name: "YouTube" },
  { id: "fb1", avatar: MAKER, Icon: FacebookIcon, color: "text-blue-600", name: "Facebook" },
  { id: "tt1", avatar: JOEL, Icon: TikTokIcon, color: "text-foreground", name: "TikTok" },
  { id: "x2", avatar: JOEL, Icon: XIcon, color: "text-foreground", name: "X" },
  { id: "li2", avatar: MAKER, Icon: LinkedInIcon, color: "text-sky-700", name: "LinkedIn" },
] as const;

const DEFAULT_PASTE = `📱 Mobile apps
⚙️ Automation
⚒️ Developer tools

Drop your project below.

---

Founders, who's building something exciting?

---

AI founders, roll call. 👾 What are you building right now?`;

const SAMPLE_POSTS = [
  "Founders, who's building something exciting?",
  "AI founders, roll call. 👾 What are you building right now?",
  "📱 Mobile apps\n⚙️ Automation\n⚒️ Developer tools\n\nDrop your project below.",
];

type IngestMode = "upload" | "paste";
type Strategy = "csv" | "autospace";

type WorkspacePost = {
  id: string;
  content: string;
  dateLabel: string;
  timeLabel: string;
};

function addHours(baseDate: string, baseTime: string, hours: number, index: number) {
  // Simple display pacing for mock: bump day/time labels without full date math
  const times = ["09:00 AM", "01:00 PM", "05:00 PM", "09:00 PM"];
  const timeIdx = index % times.length;
  const dayOffset = Math.floor(index / (24 / Math.max(hours, 1)));
  const day = 14 + dayOffset;
  return {
    dateLabel: `Jul ${day}, 2026`,
    timeLabel: index === 0 ? baseTime : times[Math.abs(timeIdx)],
  };
}

/**
 * Interactive Bulk Schedule mockup for the founder landing Bulk Scheduling section.
 * Mirrors /bulk-schedule chrome (left controls + dispatch workspace).
 */
export function BulkScheduleMockup({ className }: { className?: string }) {
  const [selected, setSelected] = useState<string[]>(["x1", "li1"]);
  const [ingestMode, setIngestMode] = useState<IngestMode>("paste");
  const [strategy, setStrategy] = useState<Strategy>("autospace");
  const [delimiter, setDelimiter] = useState("---");
  const [rawText, setRawText] = useState(DEFAULT_PASTE);
  const [linkedinOptimize, setLinkedinOptimize] = useState(true);
  const [startDate] = useState("Jul 14, 2026");
  const [startTime] = useState("09:00 AM");
  const [intervalHours, setIntervalHours] = useState(4);
  const [posts, setPosts] = useState<WorkspacePost[]>(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: `parsed-paste-${i + 1}`,
      content: SAMPLE_POSTS[i % SAMPLE_POSTS.length],
      ...addHours("Jul 14, 2026", "09:00 AM", 4, i),
    }))
  );
  const [scheduled, setScheduled] = useState(false);

  const count = posts.length;

  const retimePosts = (list: WorkspacePost[], hours: number) =>
    list.map((p, i) => ({
      ...p,
      ...addHours(startDate, startTime, hours, i),
    }));

  const toggleAccount = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleParse = () => {
    const parts = rawText
      .split(delimiter)
      .map((p) => p.trim())
      .filter(Boolean);
    const seeds = parts.length ? parts : SAMPLE_POSTS;
    const next = Array.from({ length: 50 }, (_, i) => ({
      id: `parsed-paste-${i + 1}`,
      content: seeds[i % seeds.length],
      ...addHours(startDate, startTime, intervalHours, i),
    }));
    setPosts(next);
    setScheduled(false);
  };

  const handleIntervalChange = (hours: number) => {
    setIntervalHours(hours);
    setPosts((prev) => retimePosts(prev, hours));
  };

  const removePost = (id: string) => {
    setPosts((prev) => retimePosts(prev.filter((p) => p.id !== id), intervalHours));
  };

  const clearAll = () => {
    setPosts([]);
    setScheduled(false);
  };

  const accountLabel = useMemo(() => selected.length, [selected]);

  return (
    <div
      className={cn(
        "w-full max-w-[780px] bg-card border border-border shadow-none rounded-none text-left select-none overflow-hidden p-3 sm:p-4",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 md:items-stretch">
        {/* LEFT — drives overall height */}
        <div className="md:col-span-5 flex flex-col gap-2 relative z-[1]">
          {/* 1. Target Channels */}
          <div className="rounded-none border border-border bg-card shadow-sm">
            <div className="px-3 py-2.5 border-b border-border bg-muted/20">
              <div className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground">
                <Globe className="w-3.5 h-3.5 text-primary" />
                1. Target Channels
              </div>
              <p className="text-[10px] font-medium text-muted-foreground/70 mt-0.5">
                Select accounts to deploy your bulk queue
              </p>
            </div>
            <div className="p-2 flex flex-wrap gap-1.5">
              {ACCOUNTS.map((account) => {
                const Icon = account.Icon;
                const isSelected = selected.includes(account.id);
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => toggleAccount(account.id)}
                    title={account.name}
                    className="relative transition-transform active:scale-95"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 border overflow-hidden relative transition-all",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
                      )}
                    >
                      <img src={account.avatar} alt="" className="w-full h-full object-cover" />
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 flex items-center justify-center border-t border-l border-border",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-white"
                        )}
                      >
                        <Icon className={cn("w-1.5 h-1.5", !isSelected && account.color)} />
                      </div>
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Upload or Paste */}
          <div className="rounded-none border border-border bg-card shadow-sm">
            <div className="px-3 py-2.5 border-b border-border bg-muted/20">
              <div className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground">
                <Layers className="w-3.5 h-3.5 text-primary" />
                2. Upload or Paste Content
              </div>
            </div>
            <div className="p-2 flex flex-col gap-2">
              <div className="flex border border-border p-0.5 bg-muted/20">
                <button
                  type="button"
                  onClick={() => setIngestMode("upload")}
                  className={cn(
                    "flex-1 py-1 text-[10px] font-semibold transition-all",
                    ingestMode === "upload"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setIngestMode("paste")}
                  className={cn(
                    "flex-1 py-1 text-[10px] font-semibold transition-all",
                    ingestMode === "paste"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  Raw Copy-Paste
                </button>
              </div>

              {ingestMode === "paste" ? (
                <>
                  <label className="flex items-center justify-between gap-2 text-[10px] font-medium text-muted-foreground">
                    <span>Optimize LinkedIn Formatting</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={linkedinOptimize}
                      onClick={() => setLinkedinOptimize((v) => !v)}
                      className={cn(
                        "relative h-5 w-9 border border-border transition-colors",
                        linkedinOptimize ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-3.5 w-3.5 bg-white border border-border transition-all",
                          linkedinOptimize ? "right-0.5" : "left-0.5"
                        )}
                      />
                    </button>
                  </label>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground">Draft Delimiter</span>
                    <input
                      value={delimiter}
                      onChange={(e) => setDelimiter(e.target.value)}
                      className="h-7 px-2 text-[11px] font-mono border border-border bg-card rounded-none outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground">Pasted Content Drafts</span>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      className="min-h-[56px] max-h-[72px] resize-y text-[11px] leading-relaxed p-2 border border-border bg-card rounded-none outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleParse}
                    className="w-full h-7 rounded-none font-bold text-[11px] bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    Parse Paste Drafts
                  </button>
                </>
              ) : (
                <div className="border border-dashed border-border bg-muted/10 p-3 text-center space-y-1">
                  <p className="text-[11px] font-bold text-foreground">Drag & Drop CSV / TSV / Text</p>
                  <p className="text-[10px] text-muted-foreground">Or switch to Raw Copy-Paste</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Scheduling Strategy */}
          <div className="rounded-none border border-border bg-card shadow-sm">
            <div className="px-3 py-2.5 border-b border-border bg-muted/20">
              <div className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground">
                <Settings className="w-3.5 h-3.5 text-primary" />
                3. Scheduling Strategy
              </div>
            </div>
            <div className="p-2 flex flex-col gap-2">
              <div className="flex border border-border p-0.5 bg-muted/20">
                <button
                  type="button"
                  onClick={() => setStrategy("csv")}
                  className={cn(
                    "flex-1 py-1.5 px-2 text-[10px] font-semibold transition-all whitespace-nowrap",
                    strategy === "csv"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  File Dates
                </button>
                <button
                  type="button"
                  onClick={() => setStrategy("autospace")}
                  className={cn(
                    "flex-1 py-1.5 px-2 text-[10px] font-semibold transition-all whitespace-nowrap",
                    strategy === "autospace"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  Auto-Space
                </button>
              </div>

              {strategy === "autospace" ? (
                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground">Start Date</span>
                      <div className="h-7 px-2 border border-border bg-card flex items-center gap-1.5 text-[11px]">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        {startDate}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground">Start Time</span>
                      <div className="h-7 px-2 border border-border bg-card flex items-center justify-between text-[11px] font-mono">
                        {startTime}
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      Interval
                    </span>
                    <select
                      value={intervalHours}
                      onChange={(e) => handleIntervalChange(Number(e.target.value))}
                      className="h-7 px-2 text-[11px] border border-border bg-card rounded-none outline-none"
                    >
                      <option value={1}>Every 1 hour</option>
                      <option value={2}>Every 2 hours</option>
                      <option value={4}>Every 4 hours</option>
                      <option value={6}>Every 6 hours</option>
                      <option value={12}>Every 12 hours</option>
                      <option value={24}>Every 24 hours</option>
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] font-medium text-muted-foreground p-2 border border-dashed border-border bg-muted/10 text-center">
                  Pacing is driven by Date and Time columns in your CSV upload.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Workspace (fills left column height; posts scroll inside) */}
        <div className="md:col-span-7 relative h-[280px] sm:h-[320px] md:h-auto md:min-h-0 self-stretch">
          <div className="absolute inset-0 rounded-none border border-border bg-card shadow-sm flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center justify-between gap-2 shrink-0">
              <div>
                <div className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Bulk Dispatch Workspace ({count})
                </div>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-0.5">
                  Preview, edit, and delete posts before deploy
                </p>
              </div>
              {count > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-2 py-1 text-[10px] font-bold text-destructive hover:bg-destructive/10"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="p-2 flex-1 flex flex-col gap-2 overflow-hidden min-h-0">
              {count === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center border border-dashed border-border bg-muted/10">
                  <Layers className="w-5 h-5 text-muted-foreground/30 mb-1.5" />
                  <p className="text-[11px] font-bold text-foreground">Workspace Empty</p>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-[220px]">
                    Paste drafts and hit Parse Paste Drafts to populate this board.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-1.5 border border-border bg-muted/20 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500" />
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {count} Ready
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Pacing:{" "}
                      {strategy === "autospace" ? "auto-space" : "file dates"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0 custom-scrollbar pr-0.5 overscroll-contain">
                    {posts.map((post, i) => (
                      <div
                        key={post.id}
                        className="border border-border bg-background p-2 space-y-1.5 shrink-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] font-black text-foreground">#{i + 1}</span>
                            <span className="text-[9px] font-mono text-muted-foreground truncate">
                              ID: parsed-paste
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePost(post.id)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          value={post.content}
                          onChange={(e) =>
                            setPosts((prev) =>
                              prev.map((p) =>
                                p.id === post.id ? { ...p, content: e.target.value } : p
                              )
                            )
                          }
                          className="w-full min-h-[40px] max-h-[56px] resize-y text-[11px] leading-relaxed p-1.5 border border-border bg-card rounded-none outline-none focus:ring-1 focus:ring-primary/30"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-0.5 text-muted-foreground">
                            <ImageIcon className="w-3 h-3" />
                            <Video className="w-3 h-3" />
                            <Smile className="w-3 h-3" />
                            <AtSign className="w-3 h-3" />
                            <Hash className="w-3 h-3" />
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {post.content.length} chars
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <div className="h-6 px-1.5 border border-border flex items-center gap-1 text-[9px]">
                            <CalendarIcon className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{post.dateLabel}</span>
                          </div>
                          <div className="h-6 px-1.5 border border-border flex items-center gap-1 text-[9px] font-mono">
                            <Clock className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{post.timeLabel}</span>
                          </div>
                          <div className="h-6 px-1.5 border border-border flex items-center text-[9px] text-muted-foreground">
                            Feed Post
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-2 border-t border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="text-[10px] text-muted-foreground">
                <span className="font-bold text-foreground">
                  Ready to Bulk Queue: {count} Posts
                </span>
                <br />
                Will be deployed to {accountLabel} selected account channel(s).
              </div>
              <button
                type="button"
                disabled={count === 0 || selected.length === 0 || scheduled}
                onClick={() => {
                  setScheduled(true);
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={cn(
                  "h-9 px-4 rounded-none font-bold text-[11px] transition-all shrink-0",
                  count === 0 || selected.length === 0
                    ? "bg-primary/40 text-primary-foreground cursor-not-allowed"
                    : scheduled
                      ? "bg-emerald-600 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {scheduled
                  ? "Queued — see pricing →"
                  : `Schedule ${count} posts in bulk →`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
