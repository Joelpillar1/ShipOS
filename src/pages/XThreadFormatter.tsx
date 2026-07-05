import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { faqSchema, breadcrumbSchema, softwareApplicationSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { FreeToolFinalCta } from "@/components/FreeToolFinalCta";
import { FreeToolPricingSection } from "@/components/FreeToolPricingSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  Smartphone,
  Monitor,
  User,
  MoreHorizontal,
  MessageSquare,
  Repeat2,
  Send,
  Globe,
  Trash2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileEdit,
  Heart,
  Share,
  BarChart2
} from "lucide-react";

const SectionBadge = ({ label, text, mobileText }: { label: string; text: string; mobileText?: string }) => (
  <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-full p-1 pr-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm shadow-sm mb-6 max-w-full">
    <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-inner shrink-0 whitespace-nowrap">
      {label}
    </div>
    <span className="text-[13px] font-semibold text-gray-800 dark:text-neutral-200 tracking-wide whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
      <span className={mobileText ? "hidden sm:inline" : "inline"}>{text}</span>
      {mobileText && <span className="inline sm:hidden">{mobileText}</span>}
    </span>
  </div>
);

const TEMPLATES = [
  {
    name: "The Growth Framework",
    text: `How I scaled my SaaS to $50k MRR in 6 months (without VC funding).

A short thread on the 4 mental models that changed everything for us: 👇

---

1/ Stop building features. Start building distribution.

Your product could be a masterpiece, but if nobody knows it exists, it's dead.

We spent 80% of our week on marketing, cold outreach, and content loops. Only 20% on code.

---

2/ High-velocity shipping.

If a feature takes more than 3 days to build, it's too big. Scope it down.

Ship the minimum viable version, get raw feedback from real users, then iterate. Velocity beats perfection.

---

3/ The "Free Value" magnet.

We launched 3 mini side-project tools for free. 

They generated over 45,000 back-links and organic visits, fueling our main product sign-ups without a dollar spent on ads.

---

4/ Radical transparency.

Share your metrics, your failures, and your wins. 

People buy from people they trust. Building in public is the ultimate unfair advantage.`
  },
  {
    name: "The Hook Formula",
    text: `99% of people fail to write engaging X threads.

They write long paragraphs that nobody reads.

Here is the simple 5-step template I use to write threads that get millions of views: 🧵

---

1/ The Tension Hook
State a contrarian opinion, a surprising statistic, or a painful problem.

Make the reader stop scrolling immediately.

---

2/ The Promise
Tell them exactly what they will gain by reading the next 4 tweets.

Keep it highly specific. E.g., "Here is the exact template:"

---

3/ The Chunked Body
Keep tweets short. 
• Use bullet points
• Max 2-3 lines per paragraph
• Use white space to let the eyes rest

---

4/ The Visual Aid
Whenever possible, attach a high-quality chart, screenshot, or diagram. 

Tweets with images get up to 150% more retweets.

---

5/ The Evergreen CTA
Wrap up the thread with a clear call to action. 

Direct them to your main product, landing page, or newsletter.`
  }
];

// Helper functions for Unicode Text formatting
const toUnicodeBold = (str: string): string => {
  return Array.from(str).map(char => {
    const code = char.codePointAt(0);
    if (!code) return char;
    if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D5EE);
    if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1D5D4);
    if (code >= 48 && code <= 57) return String.fromCodePoint(code - 48 + 0x1D7EC);
    return char;
  }).join('');
};

const toUnicodeItalic = (str: string): string => {
  return Array.from(str).map(char => {
    const code = char.codePointAt(0);
    if (!code) return char;
    if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D622);
    if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1D608);
    return char;
  }).join('');
};

export default function XThreadFormatter() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Formatter configuration states
  const [text, setText] = useState(TEMPLATES[0].text);
  const [authorName, setAuthorName] = useState("Joel Pillar");
  const [authorHandle, setAuthorHandle] = useState("Joelpillar1");
  const [authorAvatar, setAuthorAvatar] = useState("/joel-pillar.jpg");
  const [feedTheme, setFeedTheme] = useState<"light" | "dark">("light");
  const [splitMethod, setSplitMethod] = useState<"delimiter" | "character">("delimiter");

  // Accordion faq index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Split logic
  const [tweets, setTweets] = useState<string[]>([]);

  useEffect(() => {
    if (splitMethod === "delimiter") {
      const parts = text.split(/\n\s*---\s*\n/);
      setTweets(parts.filter(p => p.trim() !== ""));
    } else {
      // Split strictly by character limit of 280, respecting word boundaries where possible
      const result: string[] = [];
      let remaining = text;
      while (remaining.length > 0) {
        if (remaining.length <= 280) {
          result.push(remaining);
          break;
        }
        let cutIndex = remaining.lastIndexOf(" ", 280);
        if (cutIndex <= 50) {
          cutIndex = 280;
        }
        result.push(remaining.substring(0, cutIndex));
        remaining = remaining.substring(cutIndex).trim();
      }
      setTweets(result);
    }
  }, [text, splitMethod]);

  const handleFormatSelection = (mode: "bold" | "italic") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    if (!selectedText) {
      toast({
        title: "No text selected",
        description: "Highlight the words in the editor you want to format first.",
        variant: "destructive"
      });
      return;
    }

    const formatted = mode === "bold" ? toUnicodeBold(selectedText) : toUnicodeItalic(selectedText);
    const newText = text.substring(0, start) + formatted + text.substring(end);
    setText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formatted.length);
    }, 50);
  };

  const handleCopyTweet = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    toast({
      title: `Tweet #${index + 1} copied!`,
      description: "Copied successfully to clipboard."
    });
  };

  const handleCopyAll = () => {
    const formattedThread = tweets.join("\n\n---\n\n");
    navigator.clipboard.writeText(formattedThread);
    toast({
      title: "All tweets copied!",
      description: "The complete thread structure has been copied to your clipboard."
    });
  };

  const handleScheduleCTA = () => {
    if (text.trim()) {
      localStorage.setItem("shipos_pending_draft", text);
    }
    if (user) {
      navigate("/create-post");
    } else {
      navigate("/pricing");
    }
  };

  const faqs = [
    {
      q: "What is the X (Twitter) character limit per tweet?",
      a: "For standard accounts, the character limit is 280 characters. Users subscribed to X Premium can post longer individual tweets, but threads consisting of standard-length tweets remain the best format for maximum feed engagement."
    },
    {
      q: "How does the formatter split my thread?",
      a: "You can choose two methods: 'Delimiter' splits your thread wherever you type '---' on a new line (highly recommended for complete control over spacing). 'Auto-split' dynamically breaks down your text at word boundaries near the 280-character limit."
    },
    {
      q: "Will custom unicode styling (bold/italic) show up on mobile devices?",
      a: "Yes! The formatter utilizes standard mathematical unicode blocks which render across all modern desktop, iOS, and Android web/app client feeds natively."
    },
    {
      q: "Why are threads better than single long posts on X?",
      a: "X threads generate up to 4x higher impressions and engagement than single text posts. Each tweet in a thread gives users another chance to see, like, retweet, or reply, amplifying organic distribution."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Free X / Twitter Thread Formatter & Live Previewer | ShipOS"
        description="Write, split, format, and preview Twitter/X threads live. Split by character count or delimiter, apply unicode bold/italic styles, check limits, and schedule threads effortlessly."
        path="/x-thread-formatter"
        type="website"
        keywords={["twitter thread formatter", "x thread previewer", "tweet splitter", "thread helper", "format tweets bold"]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/x-thread-formatter" },
            { name: "X Thread Formatter", path: "/x-thread-formatter" }
          ]),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-10">
        {/* Tool Header */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Free Tool" text="Write viral threads in seconds" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            X / Twitter Thread Formatter
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Format, split, and preview your threads exactly how they will appear in X feeds. Eliminate cut-offs and character limit surprises.
          </p>
        </section>

        {/* Workspace Layout */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Editors and styling options */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-6">
              
              {/* Profile setup row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Creator Name</label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="E.g. Joel Pillar"
                    className="rounded-none border-border h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">X Handle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground select-none">@</span>
                    <Input
                      value={authorHandle}
                      onChange={(e) => setAuthorHandle(e.target.value)}
                      placeholder="Joelpillar1"
                      className="rounded-none border-border h-10 pl-7 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Avatar URL (Optional)</label>
                  <Input
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    placeholder="Paste image link..."
                    className="rounded-none border-border h-10 text-xs"
                  />
                </div>
              </div>

              {/* Quick Template loader */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mr-1">Load Template:</span>
                {TEMPLATES.map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => setText(tmpl.text)}
                    className="px-3 py-1.5 border border-border text-xs font-semibold hover:bg-muted transition-colors rounded-none"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>

              {/* Formatting bar + Split mode selectors */}
              <div className="flex flex-wrap items-center justify-between border-t border-border/80 pt-4 gap-4">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("bold")}
                    className="h-8 px-3 border border-border hover:bg-muted text-xs font-black rounded-none transition-colors"
                    title="Convert highlight to Bold Unicode"
                  >
                    𝐁
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("italic")}
                    className="h-8 px-3 border border-border hover:bg-muted text-xs italic font-bold rounded-none transition-colors"
                    title="Convert highlight to Italic Unicode"
                  >
                    𝘐
                  </button>
                  <span className="text-[10px] text-muted-foreground ml-2 font-medium">Highlight text to style</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Split by:</span>
                  <div className="flex border border-border">
                    <button
                      onClick={() => setSplitMethod("delimiter")}
                      className={cn("px-3 py-1 text-xs font-bold transition-all", splitMethod === "delimiter" ? "bg-[#d75a34] text-white" : "hover:bg-muted text-foreground")}
                    >
                      --- Separator
                    </button>
                    <button
                      onClick={() => setSplitMethod("character")}
                      className={cn("px-3 py-1 text-xs font-bold transition-all", splitMethod === "character" ? "bg-[#d75a34] text-white" : "hover:bg-muted text-foreground")}
                    >
                      Auto-280 chars
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Thread content editor</label>
                  {splitMethod === "delimiter" && (
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Add <code className="bg-muted px-1.5 py-0.5 border border-border/50 text-[#d75a34]">---</code> on a new line to start next tweet
                    </span>
                  )}
                </div>
                <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={splitMethod === "delimiter" 
                    ? "Write your hook here...\n\n---\n\nWrite your second tweet here..." 
                    : "Paste your raw article here to split into standard tweets automatically..."
                  }
                  className="min-h-[380px] font-mono text-sm leading-relaxed p-4 border-border rounded-none focus-visible:ring-[#d75a34]"
                />
              </div>

              {/* Footer controls inside Editor card */}
              <div className="flex items-center justify-between border-t border-border/80 pt-4">
                <div className="text-xs text-muted-foreground font-bold">
                  {tweets.length} {tweets.length === 1 ? "tweet" : "tweets"} generated
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setText("")}
                    variant="ghost"
                    className="h-10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none border border-border"
                  >
                    Clear Editor
                  </Button>
                  <Button
                    onClick={handleCopyAll}
                    className="h-10 px-5 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-xs uppercase tracking-wider rounded-none border border-border/20 shadow-sm"
                  >
                    Copy Complete Thread
                  </Button>
                </div>
              </div>

            </div>
          </div>

          {/* Right panel: Live X feed preview */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Feed Control Bar */}
            <div className="border border-border bg-card p-4 rounded-none shadow-sm flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Live Feed Mockup</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Theme:</span>
                <div className="flex border border-border rounded-none">
                  <button
                    onClick={() => setFeedTheme("light")}
                    className={cn("px-2.5 py-1 text-[10px] font-bold transition-all", feedTheme === "light" ? "bg-foreground text-background" : "bg-card text-foreground")}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setFeedTheme("dark")}
                    className={cn("px-2.5 py-1 text-[10px] font-bold transition-all", feedTheme === "dark" ? "bg-foreground text-background" : "bg-card text-foreground")}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated X Feed Card Stack */}
            <div className={cn(
              "border border-border p-6 shadow-sm rounded-none max-h-[700px] overflow-y-auto space-y-4 transition-all duration-300 relative",
              feedTheme === "light" ? "bg-white text-black" : "bg-[#15202B] text-white border-neutral-800"
            )}>
              {tweets.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs font-medium space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p>Type some text in the editor to render a live preview.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Left Connector Line for Thread Stack */}
                  {tweets.length > 1 && (
                    <div className={cn("absolute left-[23px] top-6 bottom-8 w-[2px] pointer-events-none", feedTheme === "light" ? "bg-neutral-200" : "bg-neutral-800")} />
                  )}

                  <div className="space-y-6">
                    {tweets.map((content, index) => {
                      const characterCount = content.length;
                      const isOverLimit = characterCount > 280;
                      const percent = Math.min((characterCount / 280) * 100, 100);

                      return (
                        <div key={index} className="relative flex items-start gap-3 group/tweet">
                          
                          {/* Avatar block */}
                          <div className="relative shrink-0 z-10">
                            {authorAvatar ? (
                              <img
                                src={authorAvatar}
                                alt={authorName}
                                className="w-12 h-12 rounded-full border border-black/5 object-cover"
                              />
                            ) : (
                              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border border-black/5", feedTheme === "light" ? "bg-neutral-200 text-neutral-500" : "bg-neutral-800 text-neutral-400")}>
                                <User className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Tweet body */}
                          <div className="flex-1 min-w-0 space-y-1">
                            
                            {/* Tweet Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={cn("text-[14px] font-bold truncate", feedTheme === "light" ? "text-neutral-900" : "text-white")}>{authorName || "Your Name"}</span>
                                <span className={cn("text-[12px] truncate", feedTheme === "light" ? "text-neutral-500" : "text-neutral-400")}>@{authorHandle || "handle"}</span>
                                <span className={cn("text-[12px]", feedTheme === "light" ? "text-neutral-500" : "text-neutral-400")}>•</span>
                                <span className={cn("text-[12px]", feedTheme === "light" ? "text-neutral-500" : "text-neutral-400")}>{index + 1}/{tweets.length}</span>
                              </div>
                              <button
                                onClick={() => handleCopyTweet(content, index)}
                                className={cn("opacity-0 group-hover/tweet:opacity-100 transition-opacity p-1 hover:text-[#d75a34]", feedTheme === "light" ? "text-neutral-400" : "text-neutral-500")}
                                title="Copy this tweet"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Tweet text content */}
                            <p className={cn("text-[15px] leading-normal whitespace-pre-wrap break-words font-sans", feedTheme === "light" ? "text-neutral-900" : "text-neutral-100")}>
                              {content}
                            </p>

                            {/* Tweet Action simulation bar */}
                            <div className={cn("flex items-center justify-between max-w-sm pt-2.5 select-none text-[12px]", feedTheme === "light" ? "text-neutral-500" : "text-neutral-400")}>
                              <div className="flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-pointer">
                                <MessageSquare className="w-4 h-4" />
                                <span>24</span>
                              </div>
                              <div className="flex items-center gap-1.5 hover:text-green-500 transition-colors cursor-pointer">
                                <Repeat2 className="w-4 h-4" />
                                <span>18</span>
                              </div>
                              <div className="flex items-center gap-1.5 hover:text-pink-500 transition-colors cursor-pointer">
                                <Heart className="w-4 h-4" />
                                <span>142</span>
                              </div>
                              <div className="flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-pointer">
                                <BarChart2 className="w-4 h-4" />
                                <span>4.2K</span>
                              </div>
                            </div>

                            {/* Character Tracker bar */}
                            <div className={cn("flex items-center justify-end gap-3 pt-3 border-t border-dashed", feedTheme === "light" ? "border-neutral-200" : "border-neutral-800")}>
                              <span className={cn("text-[10px] font-bold", isOverLimit ? "text-red-500 font-extrabold" : feedTheme === "light" ? "text-neutral-500" : "text-neutral-400")}>
                                {characterCount} / 280 chars
                              </span>
                              <div className={cn("w-16 h-1.5 rounded-full overflow-hidden relative", feedTheme === "light" ? "bg-neutral-200" : "bg-neutral-800")}>
                                <div
                                  className={cn("h-full transition-all duration-300", isOverLimit ? "bg-red-500" : percent > 90 ? "bg-amber-500" : "bg-sky-500")}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white dark:bg-[#141413] border-t border-b border-border/40 py-20 mt-20 relative z-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-16">
              <SectionBadge label="Workflow" text="How it works under the hood" />
              <h2 className="text-3xl font-black text-foreground">
                How to Use the X Thread Formatter
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Create structured, high-engagement Twitter threads in 3 easy steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Draft or Paste Text
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start drafting your thread directly in our rich workspace editor. You can load one of our templates to get started quickly.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Split Your Tweets
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use <code className="bg-muted px-1.5 py-0.5 text-xs text-[#d75a34]">---</code> to specify exact split locations, or let auto-split partition text at word boundaries within standard 280-char limits.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Copy & Schedule
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verify character limits in the live feed preview simulator, then copy individual tweets or click copy all to export your formatted draft.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optimizing Your X Reach Section */}
        <section className="bg-[#FAF7F5] dark:bg-background py-20 relative z-10 border-b border-border/40">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <SectionBadge label="Best Practices" text="Optimize your thread performance" />
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Optimizing Your X Reach
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  The Science of X Thread Velocity
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  X's algorithm rewards posts that keep users on the app ("dwell time") and trigger nested conversations. A thread accomplishes both by breaking ideas into a snackable, scroll-friendly format.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If your first tweet (the hook) is too generic, readers will scroll right past. State a clear promise, high stakes, or a surprising stat to convince them to read on.
                </p>
              </div>
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Optimal Thread Styling Rules
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Punchy Hook:</strong> Keep the first tweet under 200 characters to make it readable in one glance.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Visual Flow:</strong> Wrap lines frequently, use bullet points, and add relevant emojis to improve scrolling readability.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>CTA on last tweet:</strong> Always place your link, offer, or newsletter CTA on the final tweet, as X down-ranks external links on tweet #1.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white dark:bg-[#141413] border-t border-b border-border/40 py-20 relative z-10">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-16">
            <div className="flex flex-col items-center text-center">
              <SectionBadge label="FAQ" text="Frequently Asked Questions" />
              <h2 className="text-3xl font-black text-foreground">
                X Thread Formatter FAQs
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Common questions about writing, formatting, and scheduling X threads.
              </p>
            </div>

            <div className="divide-y divide-border border-t border-b border-border">
              {faqs.map((faq, i) => (
                <div key={i} className="py-4">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                  >
                    <span className="text-base font-bold text-foreground group-hover:text-[#d75a34] transition-colors">
                      {faq.q}
                    </span>
                    <span className="text-[#d75a34] text-lg font-bold ml-4">
                      {openFaqIndex === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaqIndex === i && (
                    <div className="pb-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Demo Video Section */}
        <section className="py-16 bg-white dark:bg-[#141413] border-t border-b border-border/40 py-20 relative z-10">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <SectionBadge label="Demo" text="Watch ShipOS in action" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                See ShipOS in Action
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Watch how ShipOS simplifies planning, scheduling, and publishing across all your social platforms from a single dashboard.
              </p>
            </div>

            <div 
              onClick={isPlayingDemo ? undefined : () => setIsPlayingDemo(true)}
              className={cn(
                "relative w-full aspect-video bg-[#fbf4f2] border-2 border-black dark:border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex items-center justify-center group overflow-hidden rounded-none mx-auto",
                !isPlayingDemo && "cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              )}
            >
              {isPlayingDemo ? (
                <iframe
                  src="https://www.youtube.com/embed/huwiFpCP614?autoplay=1"
                  title="ShipOS Platform Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              ) : (
                <>
                  
                  {/* Thumbnail Image */}
                  <img 
                    src="https://img.youtube.com/vi/huwiFpCP614/maxresdefault.jpg" 
                    alt="ShipOS Platform Demo Preview" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  
                  {/* Dark overlay for readability and premium feel */}
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/35">
                    {/* Play Button */}
                    <div className="relative z-10 w-20 h-20 bg-[#d75a34] rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <FreeToolPricingSection onCtaClick={() => handleScheduleCTA()} />

        <FreeToolFinalCta onCtaClick={() => navigate("/signup")} />
      </main>

      <Footer />
    </div>
  );
}
