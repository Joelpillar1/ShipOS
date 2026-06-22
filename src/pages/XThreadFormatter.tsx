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
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";
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

const SectionBadge = ({ label, text }: { label: string; text: string }) => (
  <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-full p-1 pr-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm shadow-sm mb-6">
    <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-inner">
      {label}
    </div>
    <span className="text-[13px] font-semibold text-gray-800 dark:text-neutral-200 tracking-wide">
      {text}
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

      <main className="pt-28 pb-10">
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
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d75a34]/10 border border-[#d75a34]/20 text-[#d75a34] text-xs font-bold uppercase tracking-wider rounded-none">
                <Sparkles className="w-3.5 h-3.5" /> Product Demo
              </div>
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
                  {/* Top Bar for Window effect */}
                  <div className="absolute top-0 left-0 w-full h-8 bg-black flex items-center px-3 gap-2 border-b-2 border-black z-20">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    <div className="ml-2 text-white/90 text-[10px] font-bold tracking-widest">ShipOS_Platform_Demo.mp4</div>
                  </div>
                  
                  {/* Thumbnail Image */}
                  <img 
                    src="https://img.youtube.com/vi/huwiFpCP614/maxresdefault.jpg" 
                    alt="ShipOS Platform Demo Preview" 
                    className="absolute inset-0 w-full h-full object-cover mt-8 group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  
                  {/* Dark overlay for readability and premium feel */}
                  <div className="absolute inset-0 mt-8 bg-black/45 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/35">
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

        {/* Grow with ShipOS Pricing Section */}
        <section className="bg-[#FAF7F5] dark:bg-background border-t border-b border-border/40 py-20 relative z-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-14">
              <SectionBadge label="Grow" text="Supercharge your social presence" />
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                Grow with ShipOS
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
                Stop previewing, start publishing. ShipOS auto-schedules your best content across X, LinkedIn, Instagram, TikTok, Threads, and Bluesky — all from one workspace.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className={cn("text-xs font-bold tracking-widest transition-colors", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary rounded-none"
              />
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold tracking-widest transition-colors", isAnnual ? "text-foreground" : "text-muted-foreground")}>
                  Annual
                </span>
                <Badge className="bg-primary text-primary-foreground text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-none shadow-sm">
                  Save 20%
                </Badge>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {PLANS.map((plan) => {
                const price = isAnnual ? plan.price.annual : plan.price.monthly;
                const periodLabel = isAnnual ? "/year" : "/month";
                return (
                  <Card
                    key={plan.name}
                    className={cn(
                      "relative border-border bg-card shadow-none rounded-none overflow-hidden transition-all duration-300 flex flex-col justify-between h-full",
                      plan.popular ? "ring-2 ring-primary bg-primary/[0.02]" : "hover:border-primary/30",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-primary text-primary-foreground text-[10px] font-bold tracking-widest py-1 px-4 rounded-none">
                          {plan.badge}
                        </div>
                      </div>
                    )}
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-base font-bold tracking-widest text-muted-foreground">
                        {plan.name}
                      </CardTitle>
                      <div className="flex items-baseline gap-1 mb-2 mt-4">
                        <span className="text-4xl font-bold text-foreground tracking-tighter">${price}</span>
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest">{periodLabel}</span>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground font-medium leading-relaxed">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-6 space-y-8 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <p className="text-[9px] font-bold text-muted-foreground tracking-wider">Includes Features:</p>
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-medium text-foreground/90">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={handleScheduleCTA}
                        className={cn(
                          "w-full h-12 font-bold tracking-widest text-[10px] rounded-none shadow-none transition-all",
                          plan.popular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-background text-foreground border border-border hover:bg-muted",
                        )}
                      >
                        Start 7-Day Trial
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Guarantee strip */}
            <div className="flex items-center justify-center gap-3 mt-10 text-muted-foreground">
              <Check className="w-4 h-4" />
              <p className="text-[10px] font-bold tracking-[0.15em]">
                Secure checkout via Dodo Payments • Cancel anytime • 7-day free trial
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-24 px-6 lg:px-8 bg-background relative z-10">
          <div className="max-w-[1000px] mx-auto relative">
            <div className="relative rounded-none bg-white dark:bg-[#1c1917] border-x-2 border-b-2 border-t-[8px] border-x-black border-b-black border-t-[#d75a34] dark:border-x-neutral-800 dark:border-b-neutral-800 p-10 md:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex flex-col items-center">
              
              {/* Logo centered */}
              <div className="flex justify-center mb-6 select-none">
                <img 
                  src={isDark ? "/logo-white.png" : "/logo-black.png"} 
                  alt="ShipOS Logo" 
                  className="h-8 w-auto object-contain" 
                />
              </div>
              
              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.2] text-[#1c2024] dark:text-neutral-100 mb-6 max-w-3xl">
                Your content is ready. Your audience is waiting. ShipOS ships it.
              </h2>
              
              {/* Subtitle */}
              <p className="text-gray-600 dark:text-neutral-400 text-sm sm:text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-8">
                Takes less than 5 minutes to connect your first platform and schedule your first post.
              </p>
              
              {/* Social Icons row */}
              <div className="flex flex-row flex-nowrap items-center justify-center gap-2.5 sm:gap-6 mb-10 overflow-x-auto no-scrollbar w-full select-none py-1">
                {[
                  { bg: "bg-[#0077B5]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>, name: "LinkedIn" },
                  { bg: "bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, name: "Instagram" },
                  { bg: "bg-[#1877F2]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, name: "Facebook" },
                  { bg: "bg-[#101010]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, name: "Twitter" },
                  { bg: "bg-[#FF0000]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, name: "YouTube" },
                  { bg: "bg-[#101010]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/></svg>, name: "Threads" },
                  { bg: "bg-[#BD081C]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z"/></svg>, name: "Pinterest" },
                  { bg: "bg-[#0285FF]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 320 286"><path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z"/></svg>, name: "Bluesky" },
                  { bg: "bg-[#010101]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>, name: "TikTok" },
                ].map((badge) => (
                  <div key={badge.name} title={badge.name} className="transition-transform duration-200 hover:scale-110 shrink-0">
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-none flex items-center justify-center shadow-sm border border-black/5 [&_svg]:w-4 [&_svg]:h-4 sm:[&_svg]:w-5 sm:[&_svg]:h-5 cursor-pointer hover:scale-110 hover:-translate-y-1 transition-all duration-300",
                        badge.bg
                      )}
                    >
                      {badge.icon}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Button */}
              <button
                onClick={() => navigate("/signup")}
                className="h-14 px-8 bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none border-2 border-black dark:border-neutral-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 font-bold text-base tracking-wide flex items-center justify-center gap-2 group"
              >
                Try it for $0 (7-days)
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
