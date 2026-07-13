import { useMemo, useState } from "react";
import {
  AtSign,
  Globe,
  Hash,
  Image as ImageIcon,
  MessageSquare,
  Smile,
  Sparkles,
  Video,
  X,
} from "lucide-react";
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
const TATTOO = "/images/composer/post-tattoo.png";
const LAYOUT = "/images/composer/layout-icon.png";
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
  { id: "yt2", avatar: JOEL, Icon: YouTubeIcon, color: "text-red-600", name: "YouTube" },
  { id: "ig2", avatar: MAKER, Icon: InstagramIcon, color: "text-pink-600", name: "Instagram" },
  { id: "li2", avatar: JOEL, Icon: LinkedInIcon, color: "text-sky-700", name: "LinkedIn" },
  { id: "bs1", avatar: MAKER, Icon: BlueskyIcon, color: "text-sky-500", name: "Bluesky" },
] as const;

const AI_SAMPLE =
  "New ink drop. When the machine hits and the dragon lands — that’s craft meeting courage. Book your next session.";

const EMOJIS = ["🔥", "✨", "💪", "🖤", "👏"];

/**
 * Interactive Create Post composer mockup for the founder landing Publishing section.
 */
export function CreatePostMockup({ className }: { className?: string }) {
  const [selected, setSelected] = useState<string[]>(["li1", "x1", "ig1"]);
  const [activeTab, setActiveTab] = useState<string>("global");
  const [content, setContent] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const selectedAccounts = useMemo(
    () => ACCOUNTS.filter((a) => selected.includes(a.id)),
    [selected]
  );

  const toggleAccount = (id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (activeTab === id && !next.includes(id)) setActiveTab("global");
      return next;
    });
  };

  const insertAtEnd = (snippet: string) => {
    setContent((prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}${snippet}`);
  };

  const runAI = () => {
    setContent(AI_SAMPLE);
    setShowImage(true);
    setShowEmoji(false);
  };

  return (
    <div
      className={cn(
        "w-full max-w-[560px] bg-card border border-border shadow-none rounded-none flex flex-col overflow-hidden text-left",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-row items-center justify-between px-6 pt-6 pb-2 gap-3">
        <div className="flex items-center gap-2 text-xl sm:text-2xl font-semibold leading-none tracking-tight text-foreground">
          <MessageSquare className="w-5 h-5 shrink-0" />
          Create Post
        </div>
        <button
          type="button"
          onClick={runAI}
          className="flex items-center gap-1.5 px-3 py-1 border-2 border-black font-mono font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs text-black bg-purple-200 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all shrink-0"
          title="Generate with AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
          <span className="text-black">AI Unlimited</span>
        </button>
      </div>

      {/* Account destinations */}
      <div className="pt-4 pb-3 px-6 border-b border-border">
        <div className="flex flex-wrap gap-2 items-center">
          {ACCOUNTS.map((account) => {
            const Icon = account.Icon;
            const isSelected = selected.includes(account.id);
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => toggleAccount(account.id)}
                title={account.name}
                className="relative group transition-transform active:scale-95"
              >
                <div
                  className={cn(
                    "w-10 h-10 flex items-center justify-center transition-all relative border overflow-hidden",
                    isSelected
                      ? "bg-white border-primary shadow-sm ring-2 ring-primary/20"
                      : "bg-gray-50 border-gray-200 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:border-gray-400"
                  )}
                >
                  <img
                    src={account.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
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

      {/* Inner composer */}
      <div className="mx-6 mt-6 mb-2 border border-border flex flex-col bg-muted/10">
        <div className="border-b border-border flex flex-wrap items-center bg-transparent overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("global")}
            className={cn(
              "px-3 h-12 flex items-center justify-center border-r border-border transition-all relative shrink-0",
              activeTab === "global" ? "bg-background text-foreground" : "text-muted-foreground hover:bg-muted/50"
            )}
            title="Global Post Content"
          >
            <div
              className={cn(
                "w-7 h-7 border border-border flex items-center justify-center transition-all",
                activeTab === "global"
                  ? "bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5"
                  : "bg-muted/50"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
            </div>
            {activeTab === "global" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>

          {selectedAccounts.map((account) => {
            const Icon = account.Icon;
            const isActive = activeTab === account.id;
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => setActiveTab(account.id)}
                className={cn(
                  "px-3 h-12 flex items-center justify-center border-r border-border transition-all relative shrink-0",
                  isActive ? "bg-background" : "hover:bg-muted/50"
                )}
                title={account.name}
              >
                <div className="relative">
                  <div
                    className={cn(
                      "w-7 h-7 border border-border overflow-hidden transition-all",
                      isActive && "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5"
                    )}
                  >
                    <img src={account.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-background border border-border flex items-center justify-center",
                      isActive && "bg-foreground"
                    )}
                  >
                    <Icon className={cn("w-2.5 h-2.5", isActive ? "text-background" : account.color)} />
                  </div>
                </div>
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
              </button>
            );
          })}
        </div>

        <div className="flex-1 p-0 flex flex-col relative min-h-[200px]">
          {showImage && (
            <div className="px-6 pt-4">
              <div className="relative inline-block border border-border bg-muted/20 p-1">
                <img
                  src={showLayout ? LAYOUT : TATTOO}
                  alt=""
                  className={cn(
                    "object-cover",
                    showLayout ? "w-20 h-20" : "w-28 h-28"
                  )}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowImage(false);
                    setShowLayout(false);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background flex items-center justify-center border border-border"
                  title="Remove media"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to share?"
            className="flex-1 resize-none border-0 focus:outline-none focus:ring-0 p-6 pb-14 text-base md:text-lg leading-relaxed rounded-none shadow-none bg-transparent min-h-[160px] text-foreground placeholder:text-muted-foreground"
            rows={5}
          />

          <button
            type="button"
            onClick={runAI}
            className="absolute bottom-3 right-3 rounded-none h-8 w-8 flex items-center justify-center text-primary hover:bg-primary/10 transition-all active:scale-95 z-10"
            title="Ask AI Co-pilot"
          >
            <Sparkles className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Editor bottom toolbar */}
      <div className="px-6 pb-6 pt-2 flex flex-wrap justify-between items-center gap-2 bg-transparent relative">
        <div className="flex items-center flex-wrap gap-1">
          <button
            type="button"
            onClick={() => {
              setShowImage(true);
              setShowLayout(false);
            }}
            className={cn(
              "rounded-none h-8 w-8 flex items-center justify-center transition-all active:scale-95",
              showImage && !showLayout
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Attach image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowImage(true);
              setShowLayout(true);
            }}
            className={cn(
              "rounded-none h-8 w-8 flex items-center justify-center overflow-hidden border border-transparent transition-all active:scale-95",
              showLayout ? "border-border ring-1 ring-primary/30" : "opacity-80 hover:opacity-100"
            )}
            title="Layout media"
          >
            <img src={LAYOUT} alt="" className="w-5 h-5 object-cover" />
          </button>
          <button
            type="button"
            className="rounded-none h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95"
            title="Video"
          >
            <Video className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className={cn(
                "rounded-none h-8 w-8 flex items-center justify-center transition-all active:scale-95",
                showEmoji ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              )}
              title="Emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
            {showEmoji && (
              <div className="absolute bottom-full left-0 mb-2 flex gap-1 p-2 border border-border bg-card shadow-md z-20">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      insertAtEnd(emoji);
                      setShowEmoji(false);
                    }}
                    className="h-8 w-8 hover:bg-muted text-base"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => insertAtEnd("@joel")}
            className="rounded-none h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95"
            title="Mention"
          >
            <AtSign className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertAtEnd("#tattoo")}
            className="rounded-none h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95"
            title="Hashtag"
          >
            <Hash className="h-4 w-4" />
          </button>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">{content.length} chars</div>
      </div>
    </div>
  );
}
