import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  XIcon,
  LinkedInIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
  PinterestIcon,
  ThreadsIcon,
  BlueskyIcon,
} from "@/components/PlatformIcons";

const JOEL = "/images/composer/avatar-joel.png";
const MAKER = "/images/composer/avatar-maker.png";
const LOGO = "/images/composer/shipos-logo.png";

const ACCOUNTS = [
  { id: "yt1", avatar: JOEL, Icon: YouTubeIcon, color: "text-red-600", name: "YouTube" },
  { id: "fb1", avatar: MAKER, Icon: FacebookIcon, color: "text-blue-600", name: "Facebook" },
  { id: "tt1", avatar: JOEL, Icon: TikTokIcon, color: "text-foreground", name: "TikTok" },
  { id: "ig1", avatar: MAKER, Icon: InstagramIcon, color: "text-pink-600", name: "Instagram" },
  { id: "th1", avatar: JOEL, Icon: ThreadsIcon, color: "text-foreground", name: "Threads" },
  { id: "pin1", avatar: MAKER, Icon: PinterestIcon, color: "text-red-600", name: "Pinterest" },
  { id: "li1", avatar: LOGO, Icon: LinkedInIcon, color: "text-sky-700", name: "ShipOS LinkedIn" },
  { id: "x1", avatar: LOGO, Icon: XIcon, color: "text-foreground", name: "ShipOS X" },
  { id: "ig2", avatar: MAKER, Icon: InstagramIcon, color: "text-pink-600", name: "Instagram" },
  { id: "bs1", avatar: MAKER, Icon: BlueskyIcon, color: "text-sky-500", name: "Bluesky" },
] as const;

const DRAFTS = [
  "Founders, who's building something exciting? Drop your stack below — I'm looking for the next tool that actually ships.",
  "AI founders, roll call. 👾 What are you building right now that you'd bet the next 12 months on?",
  "Ship the product. Run social in one batch. The founders who win distribution don't live in five tabs all week.",
];

/**
 * Interactive Content Studio "The Spark" mockup for the founder landing.
 */
export function ContentStudioMockup({ className }: { className?: string }) {
  const [selected, setSelected] = useState<string[]>(["li1", "x1", "ig1"]);
  const [prompt, setPrompt] = useState("");
  const [postType, setPostType] = useState("none");
  const [quantity, setQuantity] = useState("3");
  const [tone, setTone] = useState("Casual");
  const [goal, setGoal] = useState("grow");
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState<string[]>([]);

  const toggleAccount = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    setDrafts([]);
    window.setTimeout(() => {
      const n = Number(quantity) || 3;
      setDrafts(
        Array.from({ length: n }, (_, i) => {
          const base = DRAFTS[i % DRAFTS.length];
          return prompt.trim()
            ? `${base}\n\n— from: “${prompt.trim().slice(0, 80)}${prompt.trim().length > 80 ? "…" : ""}”`
            : base;
        })
      );
      setGenerating(false);
    }, 1200);
  };

  return (
    <div
      className={cn(
        "w-full max-w-[560px] bg-card border border-border shadow-none rounded-none flex flex-col overflow-hidden text-left",
        className
      )}
    >
      {/* Header */}
      <div className="bg-muted/10 border-b border-border py-4 px-5 flex flex-row items-center justify-between">
        <div className="text-xs font-bold tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          The Spark
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 border-2 border-black font-mono font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs text-black bg-purple-200">
          <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
          <span className="text-black">AI Unlimited</span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Target Accounts */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground block">
            Target Accounts
          </span>
          <div className="flex flex-nowrap items-center gap-2 overflow-hidden">
            {ACCOUNTS.map((account) => {
              const Icon = account.Icon;
              const isSelected = selected.includes(account.id);
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => toggleAccount(account.id)}
                  title={account.name}
                  className="relative transition-transform active:scale-95 shrink-0"
                >
                  <div
                    className={cn(
                      "w-10 h-10 flex items-center justify-center transition-all relative border overflow-hidden",
                      isSelected
                        ? "bg-white border-primary shadow-sm ring-2 ring-primary/20"
                        : "bg-gray-50 border-gray-200 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:border-gray-400"
                    )}
                  >
                    <img src={account.avatar} alt="" className="w-full h-full object-cover" />
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 w-3.5 h-3.5 flex items-center justify-center border-t border-l border-border rounded-none",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-white text-black"
                      )}
                    >
                      <Icon className={cn("w-2 h-2", !isSelected && account.color)} />
                    </div>
                    {isSelected && <div className="absolute inset-0 bg-black/5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt */}
        <div className="border-t border-border pt-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What's your next big idea? Let's put a dent in the universe..."
            className="w-full rounded-none border border-border bg-white dark:bg-card text-foreground p-4 h-28 placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium resize-none"
          />
        </div>

        {/* Preferences */}
        <div className="p-3 sm:p-4 border border-border bg-muted/20 rounded-none grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="space-y-1 block">
            <span className="text-[9px] font-bold tracking-wider text-muted-foreground">Post Type</span>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="w-full h-8 border border-border rounded-none bg-white dark:bg-card text-foreground text-xs font-bold px-2 outline-none"
            >
              <option value="none">Standard Post (Default)</option>
              <option value="hottake">🔥 Hot Take</option>
              <option value="contrarian">🔄 Contrarian</option>
              <option value="insight">💡 Insight</option>
              <option value="story">📖 Personal Story</option>
              <option value="builder">🛠️ Builder Angle</option>
            </select>
          </label>
          <label className="space-y-1 block">
            <span className="text-[9px] font-bold tracking-wider text-muted-foreground">Quantity</span>
            <select
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full h-8 border border-border rounded-none bg-white dark:bg-card text-foreground text-xs font-bold px-2 outline-none"
            >
              <option value="1">1 Post</option>
              <option value="3">3 Posts</option>
              <option value="5">5 Posts</option>
              <option value="10">10 Posts</option>
            </select>
          </label>
          <label className="space-y-1 block">
            <span className="text-[9px] font-bold tracking-wider text-muted-foreground">Tone</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full h-8 border border-border rounded-none bg-white dark:bg-card text-foreground text-xs font-bold px-2 outline-none"
            >
              <option>Casual</option>
              <option>Professional</option>
              <option>Witty</option>
              <option>Bold</option>
              <option>Educational</option>
            </select>
          </label>
          <label className="space-y-1 block">
            <span className="text-[9px] font-bold tracking-wider text-muted-foreground">Goal</span>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full h-8 border border-border rounded-none bg-white dark:bg-card text-foreground text-xs font-bold px-2 outline-none"
            >
              <option value="grow">Grow Audience</option>
              <option value="leads">Generate Leads</option>
              <option value="brand">Authority Building</option>
              <option value="engagement">Increase Engagement</option>
              <option value="launch">Product Launch</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="bg-primary hover:bg-primary/95 text-primary-foreground border border-transparent rounded-none shadow-sm font-bold text-xs tracking-widest h-11 px-8 transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Writing…
              </>
            ) : (
              "Generate Drafts"
            )}
          </button>
        </div>

        {/* Generated drafts — scroll inside card */}
        {(generating || drafts.length > 0) && (
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Generated Drafts
            </div>
            {generating ? (
              <div className="border border-border p-6 flex flex-col items-center justify-center gap-2 bg-muted/10">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
                  Drafting Social Media Copies…
                </span>
              </div>
            ) : (
              <div className="max-h-[180px] overflow-y-auto custom-scrollbar space-y-2 overscroll-contain">
                {drafts.map((draft, i) => (
                  <div
                    key={i}
                    className="border border-border bg-background p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-foreground">#{i + 1}</span>
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {draft.length} chars · {tone}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-foreground whitespace-pre-wrap">
                      {draft}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
