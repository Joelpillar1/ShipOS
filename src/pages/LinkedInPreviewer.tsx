import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Smartphone,
  Monitor,
  User,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Globe,
  Trash2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  BookOpen,
  FileEdit
} from "lucide-react";

// Predefined templates
const TEMPLATES = [
  {
    name: "The Story Framework",
    text: `I failed for 3 years straight.

Then, everything changed in 30 days.

Here is the exact framework I used to scale ShipOS from $0 to $10,000 MRR (and how you can replicate it starting today):

1. The Distribution First Rule
Stop building in isolation. Start talking. Launching is 20% of the game. Distribution is 80%.

2. The Hook-to-Body Ratio
If your first 3 lines don't hit, the rest of your post doesn't exist. Keep them under 140 characters.

3. Simple Premium Design
Visuals matter. Bold headlines and clean spacing build instant credibility.

Which rule are you implementing first?`
  },
  {
    name: "The Contradictory Hook",
    text: `Most creators get LinkedIn completely wrong.

They write long essays. Nobody has time for essays.

Here is how we generated 1.2M impressions in 14 days without spending a single dollar on ads:

• Hook: High tension, low word count.
• Spacing: Let the reader breathe (keep lines short).
• Value: Zero fluff, direct action steps.

Bookmark this post before writing your next hook.`
  },
  {
    name: "The Cheat Sheet",
    text: `The ultimate checklist for writing viral hooks:

❌ Bad: 'Here are some tips for SaaS builders...'
✅ Good: '90% of SaaS builders fail because of this 1 mistake.'

Your hook is your headline. If it fails, your post is dead.

Use this previewer to ensure your hook is NEVER cut off by the 'see more' button.`
  }
];

export default function LinkedInPreviewer() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [text, setText] = useState(TEMPLATES[0].text);
  const [authorName, setAuthorName] = useState("Alex Rivers");
  const [authorHeadline, setAuthorHeadline] = useState("Founder @ ShipOS | Building the future of social automation");
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Line wrapping simulator
  const computeLines = (content: string, maxCharsPerLine: number): string[] => {
    const paragraphs = content.split("\n");
    const lines: string[] = [];
    
    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === "") {
        lines.push("");
      } else {
        const words = paragraph.split(" ");
        let currentLine = "";
        
        words.forEach((word) => {
          if ((currentLine + (currentLine ? " " : "") + word).length <= maxCharsPerLine) {
            currentLine = currentLine === "" ? word : currentLine + " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine !== "") {
          lines.push(currentLine);
        }
      }
    });
    
    return lines;
  };

  const desktopLines = computeLines(text, 92);
  const mobileLines = computeLines(text, 50);

  const desktopTruncated = desktopLines.length > 5;
  const mobileTruncated = mobileLines.length > 3;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Post copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setText("");
    setIsDesktopExpanded(false);
    setIsMobileExpanded(false);
  };

  const handleScheduleCTA = () => {
    if (text.trim()) {
      localStorage.setItem("shipos_pending_draft", text);
      toast({
        title: "Draft Saved!",
        description: "We've saved your post. Redirecting to signup...",
      });
    }
    navigate("/signup?ref=linkedin-previewer");
  };

  // Character & word counters
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-20">
      <SEO
        title="Free LinkedIn Hook & 'See More' Previewer"
        description="Preview exactly how your LinkedIn posts truncate on mobile and desktop. Ensure your hooks capture attention before the 'see more' cutoff."
        path="/linkedin-hook-previewer"
      />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Free Growth Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            LinkedIn Hook Previewer
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Don't let the <strong className="text-foreground font-semibold">"see more"</strong> button kill your reach. Test your hooks on mobile and desktop layout simulators before posting.
          </p>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Inputs & Templates (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Template Selector */}
            <div className="border border-border bg-card text-card-foreground p-5 rounded-xl shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Try Viral Templates</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setText(tpl.text);
                      setIsDesktopExpanded(false);
                      setIsMobileExpanded(false);
                    }}
                    className="text-left px-3 py-2 border border-border bg-muted/40 hover:bg-muted/80 dark:hover:bg-neutral-800 transition-colors rounded-lg text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer truncate"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Text Editor */}
            <div className="border border-border bg-card text-card-foreground p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FileEdit className="w-4 h-4 text-muted-foreground" /> Write Your Post
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>

              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your LinkedIn post draft here..."
                className="min-h-[280px] font-medium text-sm leading-relaxed border border-input rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/50 resize-y p-4 bg-background"
              />

              {/* Counters */}
              <div className="flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-muted-foreground pt-1">
                <div className="flex items-center gap-4">
                  <span>Characters: <strong className="text-foreground">{charCount}</strong></span>
                  <span>Words: <strong className="text-foreground">{wordCount}</strong></span>
                </div>
                
                {/* Visual Alert indicators */}
                <div className="flex items-center gap-3">
                  {desktopTruncated && (
                    <div className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Desktop Truncated
                    </div>
                  )}
                  {mobileTruncated && (
                    <div className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Mobile Truncated
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Customizer */}
            <div className="border border-border bg-card text-card-foreground p-6 rounded-xl shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border">
                <User className="w-4 h-4 text-muted-foreground" /> Customize Mock Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Author Name</label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="E.g. Alex Rivers"
                    className="border border-input rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-9 text-xs font-medium bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Avatar URL (Optional)</label>
                  <Input
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="border border-input rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-9 text-xs font-medium bg-background"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bio / Headline</label>
                  <Input
                    value={authorHeadline}
                    onChange={(e) => setAuthorHeadline(e.target.value)}
                    placeholder="Founder @ ShipOS | Social Media Expert"
                    className="border border-input rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-9 text-xs font-medium bg-background"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right panel: Simulation Feed Card & CTA (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Simulator Container */}
            <div className="border border-border bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
              {/* Tab Header Selector */}
              <div className="flex border-b border-border bg-muted/10">
                <button
                  onClick={() => setViewMode("desktop")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-widest border-r border-border cursor-pointer transition-all duration-200 ${
                    viewMode === "desktop"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:bg-muted/10"
                  }`}
                >
                  <Monitor className="w-4 h-4" /> Desktop Preview
                </button>
                <button
                  onClick={() => setViewMode("mobile")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-200 ${
                    viewMode === "mobile"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:bg-muted/10"
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> Mobile Preview
                </button>
              </div>

              {/* Feed Card viewport emulator */}
              <div className="p-4 sm:p-6 bg-slate-50 dark:bg-neutral-950 flex justify-center items-start min-h-[360px]">
                {/* LinkedIn Card */}
                <div
                  className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-lg overflow-hidden transition-all duration-200 ${
                    viewMode === "mobile" ? "w-full max-w-[360px]" : "w-full max-w-[550px]"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 flex gap-3">
                    {/* Author Avatar image container */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 flex-shrink-0 flex items-center justify-center">
                      {authorAvatar ? (
                        <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-neutral-400" />
                      )}
                    </div>

                    {/* Author credentials */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-55 hover:text-[#0A66C2] dark:hover:text-[#0A66C2] cursor-pointer hover:underline truncate">
                          {authorName || "Your Name"}
                        </span>
                        <button className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {authorHeadline || "Your Bio Headline goes here"}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-medium">
                        <span>1h</span>
                        <span>•</span>
                        <span>Edited</span>
                        <span>•</span>
                        <Globe className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                      </div>
                    </div>
                  </div>

                  {/* Card Post Content */}
                  <div className="px-4 pb-4">
                    <div className="text-sm text-neutral-800 dark:text-neutral-200 leading-normal whitespace-pre-wrap font-sans break-words">
                      {viewMode === "desktop" ? (
                        isDesktopExpanded || !desktopTruncated ? (
                          text
                        ) : (
                          <>
                            {computeLines(text, 92).slice(0, 5).join("\n")}
                            {" "}
                            <button
                              onClick={() => setIsDesktopExpanded(true)}
                              className="text-neutral-500 dark:text-neutral-400 hover:text-[#0A66C2] dark:hover:text-sky-400 font-bold hover:underline ml-1 inline-block"
                            >
                              ...see more
                            </button>
                          </>
                        )
                      ) : (
                        isMobileExpanded || !mobileTruncated ? (
                          text
                        ) : (
                          <>
                            {computeLines(text, 50).slice(0, 3).join("\n")}
                            {" "}
                            <button
                              onClick={() => setIsMobileExpanded(true)}
                              className="text-neutral-500 dark:text-neutral-400 hover:text-[#0A66C2] dark:hover:text-sky-400 font-bold hover:underline ml-1 inline-block"
                            >
                              ...see more
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </div>

                  {/* Interactive card feed footer */}
                  <div className="border-t border-neutral-100 dark:border-neutral-800 px-2 py-1 flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
                    <button className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer">
                      <ThumbsUp className="w-4 h-4 rotate-0" /> Like
                    </button>
                    <button className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer">
                      <MessageSquare className="w-4 h-4" /> Comment
                    </button>
                    <button className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer">
                      <Repeat2 className="w-4 h-4" /> Repost
                    </button>
                    <button className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer">
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Copy text) */}
            <div className="flex gap-4">
              <Button
                onClick={handleCopy}
                className="flex-1 h-12 bg-background border border-border hover:bg-muted/50 text-foreground font-bold uppercase tracking-widest text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500 animate-bounce" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Post Text"}
              </Button>
            </div>

            {/* Sticky Lead-Gen CTA box */}
            <div className="border border-border bg-card text-card-foreground p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 rounded-lg">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider leading-tight">Looks Good? Auto-Schedule It</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-none mt-0.5">Publish instantly to LinkedIn, X, & more.</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Compose once and distribute this post across X (Twitter), LinkedIn, Instagram, TikTok, Threads, and Bluesky. Set your custom schedule slots and let ShipOS auto-pilot your audience growth.
              </p>
              <Button
                onClick={handleScheduleCTA}
                disabled={!text.trim()}
                className="w-full h-11 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold uppercase tracking-widest text-[10px] rounded-lg shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Auto-Schedule This Post <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
